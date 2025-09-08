'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Users, TrendingUp, Clock, Award, AlertCircle, CheckCircle } from 'lucide-react';

// Types for TitanEngine care model data
interface TherapeuticIntervention {
  type: 'comedy_therapy' | 'peer_support' | 'mindfulness' | 'education' | 'lifestyle';
  description: string;
  frequency: string;
  duration: string;
  expectedOutcome: string;
  evidenceStrength: number;
  culturalRelevance: string;
}

interface CommunityRecommendation {
  circleId: string;
  circleName: string;
  matchReason: string;
  expectedBenefit: string;
  confidence: number;
  description: string;
}

interface ModelOfCare {
  careId: string;
  userId: string;
  timestamp: string;
  processingTimeMs: number;
  confidence: number;
  statisticalSignificance: number;
  clinicalValidation: number;
  therapeuticInterventions: TherapeuticIntervention[];
  communitySupport: CommunityRecommendation[];
  actionableInsights: string[];
  followUpRecommendations: string[];
}

const WellnessDashboard: React.FC = () => {
  const [careModel, setCareModel] = useState<ModelOfCare | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Mock TitanEngine data (in production, this would come from API)
  const mockCareModel: ModelOfCare = {
    careId: 'care_keisha_1757313187133',
    userId: 'keisha_atlanta_32',
    timestamp: new Date().toISOString(),
    processingTimeMs: 847,
    confidence: 0.92,
    statisticalSignificance: 0.95,
    clinicalValidation: 0.88,
    therapeuticInterventions: [
      {
        type: 'comedy_therapy',
        description: 'Culturally-relevant comedy content to reduce stress and improve mood',
        frequency: '3-4 times per week',
        duration: '15-30 minutes',
        expectedOutcome: '25% reduction in anxiety levels within 4 weeks',
        evidenceStrength: 0.87,
        culturalRelevance: 'High - content specifically curated for Black women\'s experiences'
      },
      {
        type: 'peer_support',
        description: 'Connection with others experiencing similar health journeys',
        frequency: 'Daily interactions, weekly group sessions',
        duration: 'Ongoing community participation',
        expectedOutcome: 'Improved treatment adherence and emotional wellbeing',
        evidenceStrength: 0.93,
        culturalRelevance: 'Critical - addresses isolation in healthcare experiences'
      },
      {
        type: 'mindfulness',
        description: 'Culturally-adapted mindfulness practices for stress management',
        frequency: 'Daily 10-minute sessions',
        duration: '8-week initial program',
        expectedOutcome: 'Reduced cortisol levels and improved sleep quality',
        evidenceStrength: 0.81,
        culturalRelevance: 'Adapted for cultural practices and preferences'
      }
    ],
    communitySupport: [
      {
        circleId: 'graves_warriors_sisterhood',
        circleName: 'Graves\' Warriors Sisterhood',
        matchReason: 'Diagnosis alignment and peer support focus',
        expectedBenefit: 'Direct experience sharing and emotional support',
        confidence: 0.94,
        description: 'A supportive community of Black women managing Graves\' disease'
      },
      {
        circleId: 'black_women_wellness_collective',
        circleName: 'Black Women Wellness Collective',
        matchReason: 'Holistic wellness approach and cultural identity',
        expectedBenefit: 'Broader wellness strategies and cultural affirmation',
        confidence: 0.89,
        description: 'Comprehensive wellness support for Black women\'s health journeys'
      }
    ],
    actionableInsights: [
      'User shows high engagement with comedy content - prioritize humor therapy',
      'Strong peer connection preference - recommend active community circles',
      'Evening energy patterns - schedule activities after 6PM'
    ],
    followUpRecommendations: [
      'Schedule peer circle introduction within 48 hours',
      'Monitor comedy therapy engagement weekly',
      'Review stress levels after community integration'
    ]
  };

  const generateNewRecommendations = async () => {
    setLoading(true);
    
    // Simulate TitanEngine API call
    setTimeout(() => {
      setCareModel(mockCareModel);
      setLastUpdated(new Date());
      setLoading(false);
    }, 1200);
  };

  useEffect(() => {
    // Load initial care model
    generateNewRecommendations();
  }, []);

  const getInterventionIcon = (type: string) => {
    switch (type) {
      case 'comedy_therapy': return <Heart className="h-5 w-5 text-pink-500" />;
      case 'peer_support': return <Users className="h-5 w-5 text-blue-500" />;
      case 'mindfulness': return <Brain className="h-5 w-5 text-purple-500" />;
      case 'education': return <Award className="h-5 w-5 text-green-500" />;
      case 'lifestyle': return <TrendingUp className="h-5 w-5 text-orange-500" />;
      default: return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getInterventionColor = (type: string) => {
    switch (type) {
      case 'comedy_therapy': return 'bg-pink-50 border-pink-200';
      case 'peer_support': return 'bg-blue-50 border-blue-200';
      case 'mindfulness': return 'bg-purple-50 border-purple-200';
      case 'education': return 'bg-green-50 border-green-200';
      case 'lifestyle': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading && !careModel) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with confidence metrics */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Your Personalized Care Plan</CardTitle>
              <CardDescription className="text-purple-100">
                AI-generated recommendations based on clinical evidence and cultural context
              </CardDescription>
            </div>
            <Button 
              onClick={generateNewRecommendations}
              disabled={loading}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {loading ? (
                <Clock className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Updating...' : 'Refresh Plan'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{Math.round((careModel?.confidence || 0) * 100)}%</div>
              <div className="text-purple-100">Care Plan Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{Math.round((careModel?.statisticalSignificance || 0) * 100)}%</div>
              <div className="text-purple-100">Statistical Significance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{careModel?.processingTimeMs || 0}ms</div>
              <div className="text-purple-100">Generation Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Therapeutic Interventions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Therapeutic Interventions
          </CardTitle>
          <CardDescription>
            Evidence-based treatments personalized for your cultural context and health journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {careModel?.therapeuticInterventions.map((intervention, index) => (
              <Card key={index} className={`border-2 ${getInterventionColor(intervention.type)}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {getInterventionIcon(intervention.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold capitalize">
                          {intervention.type.replace('_', ' ')}
                        </h3>
                        <Badge variant="secondary">
                          {Math.round(intervention.evidenceStrength * 100)}% Evidence
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-3">{intervention.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Frequency:</span> {intervention.frequency}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {intervention.duration}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm text-gray-600 mb-1">Expected Outcome:</div>
                        <div className="text-sm font-medium text-green-700">
                          {intervention.expectedOutcome}
                        </div>
                      </div>
                      <div className="mt-3">
                        <Progress 
                          value={intervention.evidenceStrength * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Recommended Communities
          </CardTitle>
          <CardDescription>
            AI-matched peer support circles based on your health journey and cultural identity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {careModel?.communitySupport.map((circle, index) => (
              <Card key={index} className="border-2 border-blue-100 bg-blue-50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{circle.circleName}</h3>
                    <Badge className="bg-blue-600">
                      {Math.round(circle.confidence * 100)}% Match
                    </Badge>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">{circle.description}</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Why this match:</span> {circle.matchReason}
                    </div>
                    <div>
                      <span className="font-medium">Expected benefit:</span> {circle.expectedBenefit}
                    </div>
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    Join Circle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actionable Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Today's Actionable Insights
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your recent activity and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {careModel?.actionableInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-800">{insight}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer info */}
      {lastUpdated && (
        <div className="text-center text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleString()} • 
          Care plan generated by TitanEngine AI with clinical validation
        </div>
      )}
    </div>
  );
};

export default WellnessDashboard;