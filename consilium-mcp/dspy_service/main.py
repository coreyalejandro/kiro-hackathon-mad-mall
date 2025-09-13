#!/usr/bin/env python3
"""
DSPy-like microservice for care recommendations with simple prompt optimization.

Endpoints:
- GET /health
- POST /recommendations/care

Environment:
- PORT (default: 8001)
"""

from typing import List, Dict, Any, Optional
from fastapi import FastAPI
from pydantic import BaseModel, Field
import uvicorn
import os
import time
import math


class CulturalContext(BaseModel):
    primaryCulture: str
    secondaryCultures: List[str] = []
    region: str = "US"
    language: str = "en"
    religiousConsiderations: List[str] = []
    sensitiveTopics: List[str] = []


class CareRecommendationInput(BaseModel):
    userId: str
    age: int = Field(ge=0)
    diagnosisStage: str
    supportNeeds: List[str] = []
    culturalContext: CulturalContext
    history: List[Dict[str, Any]] = []


class CareItem(BaseModel):
    id: str
    title: str
    description: str
    category: str
    tags: List[str] = []
    url: Optional[str] = None
    confidence: float = 0.75


class CareRecommendationOutput(BaseModel):
    userId: str
    items: List[CareItem]
    strategy: str
    runtimeMs: int
    meta: Dict[str, Any]


class CareRecommendationSignature:
    """Represents the expected inputs/outputs. Placeholder for real DSPy Signature."""

    @staticmethod
    def score(candidate: Dict[str, Any], context: CareRecommendationInput) -> float:
        score = 0.0
        if context.diagnosisStage in candidate.get("tags", []):
            score += 0.25
        for need in context.supportNeeds:
            if need in candidate.get("tags", []):
                score += 0.15
        if context.culturalContext.primaryCulture in candidate.get("tags", []):
            score += 0.25
        if context.culturalContext.region in candidate.get("tags", []):
            score += 0.10
        # Penalize sensitive topics mismatch
        sensitive = set(context.culturalContext.sensitiveTopics)
        if any(topic in sensitive for topic in candidate.get("tags", [])):
            score -= 0.2
        # Age heuristic
        score += max(0.0, 0.15 - abs(context.age - candidate.get("ageTarget", context.age)) / 500.0)
        return max(0.0, min(1.0, score))


class TitanDSPyOptimizer:
    """Simplified optimizer supporting BootstrapFewShot and pseudo BayesianOptimization."""

    def __init__(self, candidates: List[Dict[str, Any]]):
        self.candidates = candidates

    def bootstrap_few_shot(self, context: CareRecommendationInput, k: int = 5) -> List[Dict[str, Any]]:
        scored = [
            {
                **c,
                "_score": CareRecommendationSignature.score(c, context),
            }
            for c in self.candidates
        ]
        scored.sort(key=lambda x: x["_score"], reverse=True)
        return scored[:k]

    def bayesian_optimize(self, context: CareRecommendationInput, iterations: int = 10) -> List[Dict[str, Any]]:
        # Pseudo Bayesian optimization: explore-exploit using score curvature
        best: List[Dict[str, Any]] = []
        temperature = 0.5
        for _ in range(iterations):
            scored = []
            for c in self.candidates:
                base = CareRecommendationSignature.score(c, context)
                # exploration bonus based on tag diversity and simple sinusoidal prior
                diversity = len(set(c.get("tags", [])))
                prior = 0.05 * math.sin(0.5 * diversity)
                adjusted = base + temperature * prior
                scored.append({**c, "_score": max(0.0, min(1.0, adjusted))})
            scored.sort(key=lambda x: x["_score"], reverse=True)
            best = scored[:5]
            temperature *= 0.9
        return best


def generate_mock_candidates(context: CareRecommendationInput) -> List[Dict[str, Any]]:
    base_tags = [
        context.diagnosisStage,
        *context.supportNeeds,
        context.culturalContext.primaryCulture,
        context.culturalContext.region,
    ]
    # Simple catalog
    catalog = [
        {
            "id": "guide-healthy-eating",
            "title": "Healthy Eating During Treatment",
            "description": "Nutrition tips tailored for your journey.",
            "category": "education",
            "tags": base_tags + ["health_education"],
            "ageTarget": max(18, context.age),
        },
        {
            "id": "support-community",
            "title": "Community Support Group",
            "description": "Find culturally aligned support circles.",
            "category": "community",
            "tags": base_tags + ["emotional_support", "community"],
            "ageTarget": context.age,
        },
        {
            "id": "mindfulness-breathing",
            "title": "Mindfulness and Breathing",
            "description": "Manage stress with guided exercises.",
            "category": "wellness",
            "tags": base_tags + ["mindfulness", "stress_management"],
            "ageTarget": context.age,
        },
        {
            "id": "care-navigator",
            "title": "Care Navigator",
            "description": "Personalized care navigation.",
            "category": "navigation",
            "tags": base_tags + ["care_navigation"],
            "ageTarget": context.age,
        },
    ]
    return catalog


app = FastAPI(title="Titan DSPy Service", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/recommendations/care", response_model=CareRecommendationOutput)
def recommend_care(payload: CareRecommendationInput):
    start = time.time()
    candidates = generate_mock_candidates(payload)
    optimizer = TitanDSPyOptimizer(candidates)

    # BootstrapFewShot
    few_shot = optimizer.bootstrap_few_shot(payload, k=5)
    # BayesianOptimization (pseudo)
    optimized = optimizer.bayesian_optimize(payload, iterations=6)

    # Merge and take top by score with simple de-dup
    merged: Dict[str, Dict[str, Any]] = {}
    for item in few_shot + optimized:
        merged[item["id"]] = item
    ranked = sorted(merged.values(), key=lambda x: x.get("_score", 0.0), reverse=True)

    items = [
        CareItem(
            id=i["id"],
            title=i["title"],
            description=i["description"],
            category=i["category"],
            tags=i.get("tags", []),
            confidence=float(round(i.get("_score", 0.7), 3)),
        )
        for i in ranked[:5]
    ]

    runtime_ms = int((time.time() - start) * 1000)
    return CareRecommendationOutput(
        userId=payload.userId,
        items=items,
        strategy="BootstrapFewShot+BayesianOptimization",
        runtimeMs=runtime_ms,
        meta={
            "fewShotCount": len(few_shot),
            "optimizedCount": len(optimized),
        },
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)

