'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCareModel = async ({ signal, meta }: { signal?: AbortSignal; meta?: any }) => {
    const params = meta?.bypassCache ? '?bypassCache=true' : '';
    const res = await fetch(`/api/care-model${params}`, { signal });
    if (!res.ok) throw new Error('Failed to fetch care model');
    return res.json();
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['care-model'],
    queryFn: fetchCareModel,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const careModel = data?.recommendation as ModelOfCare | undefined;
  const cached = data?.cached;

  const generateNewRecommendations = () => {
    refetch({ meta: { bypassCache: true } });
  };

  useEffect(() => {
    if (careModel) {
      setLastUpdated(new Date());
    }
  }, [careModel]);

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

  if (isError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error loading care plan
            </CardTitle>
            <CardDescription>Unable to load care model. Please try again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="destructive">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !careModel) {
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
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                Your Personalized Care Plan
                {cached && <Badge variant="secondary">Cached</Badge>}
              </CardTitle>
              <CardDescription className="text-purple-100">
                AI-generated recommendations based on clinical evidence and cultural context
              </CardDescription>
            </div>
            <Button
              onClick={generateNewRecommendations}
              disabled={isFetching}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {isFetching ? (
                <Clock className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              {isFetching ? 'Updating...' : 'Refresh Plan'}
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
          Last updated: {lastUpdated.toLocaleString()}
          {cached ? ' • Served from cache' : ''} • Care plan generated by TitanEngine AI with clinical validation
        </div>
      )}
    </div>
  );
};

export default WellnessDashboard;