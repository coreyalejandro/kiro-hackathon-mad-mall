# Titan Contracts v1 (JSON Shapes)

## Cultural Validation
```json
{
  "overallScore": 0.87,
  "cultural": 0.92,
  "inclusivity": 0.85,
  "sensitivity": 0.84,
  "issues": [
    {
      "type": "cultural_insensitivity",
      "severity": "low",
      "description": "Consider using 'community' instead of 'tribe' for cultural sensitivity",
      "suggestion": "Replace 'tribe' with 'community' or 'circle' to avoid appropriation"
    }
  ],
  "explanations": [
    "Content authentically represents Black women's experiences",
    "Language is culturally appropriate and empowering",
    "Minor terminology adjustment recommended for optimal sensitivity"
  ]
}
```

**Field Ranges:**
- `overallScore`: 0.0-1.0 (≥0.8 = excellent, 0.6-0.79 = good, <0.6 = needs review)
- `cultural`: 0.0-1.0 (cultural authenticity and appropriateness)
- `inclusivity`: 0.0-1.0 (representation and accessibility)
- `sensitivity`: 0.0-1.0 (trauma-informed and respectful language)
- `issues.severity`: "low" | "medium" | "high"
- `issues.type`: "cultural_insensitivity" | "stereotype" | "exclusion" | "medical_inaccuracy" | "privacy_risk"

## Moderation
```json
{
  "safe": true,
  "flags": [],
  "reason": "Content meets community safety guidelines",
  "confidence": 0.94,
  "reviewRequired": false,
  "escalationLevel": "none"
}
```

**Example - Flagged Content:**
```json
{
  "safe": false,
  "flags": ["medical_harm"],
  "reason": "Content suggests discontinuing prescribed medication without medical supervision",
  "confidence": 0.89,
  "reviewRequired": true,
  "escalationLevel": "medical_review"
}
```

**Field Ranges:**
- `confidence`: 0.0-1.0 (≥0.85 = high confidence, 0.7-0.84 = medium, <0.7 = low)
- `flags`: ["self_harm", "harassment", "hate", "medical_harm", "sexual", "privacy_violation"]
- `escalationLevel`: "none" | "community_review" | "medical_review" | "immediate_removal"

## Image Validation
```json
{
  "ok": true,
  "cultural": 0.91,
  "inclusivity": 0.88,
  "sensitivity": 0.86,
  "issues": [],
  "placeholderRecommended": false,
  "representationScore": 0.93,
  "ageAppropriate": true,
  "contextMatch": 0.89
}
```

**Example - Problematic Image:**
```json
{
  "ok": false,
  "cultural": 0.23,
  "inclusivity": 0.15,
  "sensitivity": 0.31,
  "issues": [
    "Image shows white woman in context meant for Black women",
    "Does not represent target community authentically"
  ],
  "placeholderRecommended": true,
  "representationScore": 0.12,
  "ageAppropriate": true,
  "contextMatch": 0.45
}
```

**Field Ranges:**
- All scores: 0.0-1.0 (same thresholds as cultural validation)
- `representationScore`: 0.0-1.0 (how well image represents target community)
- `contextMatch`: 0.0-1.0 (how well image fits intended use context)

## Recommendations
```json
{
  "items": [
    {
      "type": "circle",
      "id": "circle-1",
      "title": "Newly Diagnosed Sisters",
      "reason": "Based on your recent interest in Graves' basics and support resources",
      "score": 0.92,
      "confidence": 0.87,
      "category": "support"
    },
    {
      "type": "article",
      "id": "article-2",
      "title": "Managing Anxiety with Graves'",
      "reason": "Complements your reading on stress management techniques",
      "score": 0.89,
      "confidence": 0.83,
      "category": "mental_health"
    },
    {
      "type": "clip",
      "id": "clip-3",
      "title": "Medication Reminder Madness",
      "reason": "High relief rating from users with similar interests",
      "score": 0.85,
      "confidence": 0.79,
      "category": "comedy"
    }
  ],
  "totalRecommendations": 3,
  "algorithmVersion": "v2.1",
  "personalizedFor": "user_preferences_and_history"
}
```

**Field Ranges:**
- `score`: 0.0-1.0 (recommendation strength)
- `confidence`: 0.0-1.0 (algorithm confidence in recommendation)
- `type`: "circle" | "clip" | "article" | "story" | "product"
- `category`: "support" | "mental_health" | "comedy" | "medical" | "wellness" | "community"

## Wellness Coach Reply
```json
{
  "message": "I hear you're feeling overwhelmed with your new diagnosis. That's completely normal - many sisters feel this way in the beginning. Remember, you're not alone in this journey, and it's okay to take things one day at a time.",
  "tone": "gentle",
  "cautions": [
    "This is peer support, not medical advice",
    "Always consult your healthcare provider for medical decisions"
  ],
  "resources": [
    {
      "title": "Graves' Disease 101: What Every Sister Needs to Know",
      "url": "/resources/article-1",
      "type": "article"
    },
    {
      "title": "Newly Diagnosed Sisters Circle",
      "url": "/circles/circle-1",
      "type": "circle"
    }
  ],
  "followUpSuggestions": [
    "Would you like to connect with others who were recently diagnosed?",
    "Are there specific symptoms you'd like to discuss?"
  ],
  "culturalContext": "response_tailored_for_black_women_community",
  "safetyLevel": "appropriate"
}
```

**Field Ranges:**
- `tone`: "gentle" | "direct" | "celebratory" | "grounding" | "encouraging"
- `safetyLevel`: "appropriate" | "needs_review" | "escalation_required"
- `culturalContext`: Describes cultural adaptation applied

## Ranges Summary
- **All scores**: 0.0–1.0 
  - ≥0.8 = Excellent/Strong
  - 0.6-0.79 = Good/Acceptable  
  - <0.6 = Needs Review/Improvement
- **Confidence levels**: Same scale as scores
- **Review thresholds**: <0.7 confidence or any "high" severity issues trigger human review

## SSR Contract Notes
- All endpoints return deterministic JSON; no free‑text outside `message`/`explanations`
- Include `requestId`, `timestamp` at gateway layer for logging
- Responses cached for 15 minutes for identical inputs
- All cultural scores use consistent 0.0-1.0 scale with same interpretation
- Failed validations (score <0.6) automatically trigger fallback content

---

**Related Specs:** [Integration Plan](integration-plan.md) • [Data Seeds](data-seeds.md) • [MCP Ops](mcp-ops.md)

**What to Test on Video:**
- Show badge system displaying Titan scores (mocked values)
- Demonstrate content filtering based on score thresholds
- Display cultural validation in action

---

*Last updated: September 14, 2024 by Kiro*

