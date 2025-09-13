'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { validateImageContent } from '../../lib/image-validation';
import { 
  Play, 
  Pause, 
  Volume2,
  Heart, 
  Smile,
  Brain,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Award,
  Users,
  BarChart3,
  Zap,
  Shield
} from 'lucide-react';

// Types for comedy therapy content
interface ComedyContent {
  id: string;
  title: string;
  description: string;
  creator: string;
  duration: number; // seconds
  thumbnailUrl: string;
  category: string;
  culturalValidation: {
    score: number;
    reviewedBy: string;
    validatedDate: string;
    culturalRelevance: number;
    appropriateness: number;
  };
  therapeuticBenefits: {
    stressReduction: number;
    moodImprovement: number;
    anxietyRelief: number;
    communityConnection: number;
  };
  engagementMetrics: {
    views: number;
    likes: number;
    shares: number;
    therapeuticRating: number;
    communityFeedback: string[];
  };
  tags: string[];
  evidenceBase: string[];
  targetAudience: string[];
}

interface UserMoodState {
  before: 'stressed' | 'anxious' | 'sad' | 'neutral' | 'happy';
  after?: 'stressed' | 'anxious' | 'sad' | 'neutral' | 'happy';
  improvement?: number;
}

const ComedyTherapyPlayer: React.FC = () => {
  const [currentContent, setCurrentContent] = useState<ComedyContent | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [moodState, setMoodState] = useState<UserMoodState>({ before: 'stressed' });
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState<string>('/images/default-placeholder.jpg');

  // Mock culturally-validated comedy content
  const mockContent: ComedyContent = {
    id: 'graves-humor-therapy-001',
    title: 'Thyroid Troubles: Finding the Funny in the Frustrating',
    description: 'Comedian Keisha Williams shares her hilarious take on managing Graves\' disease, from doctor visits to medication mishaps. Culturally relevant humor that helps us laugh through the struggle.',
    creator: 'Keisha Williams',
    duration: 1247, // ~20 minutes
    thumbnailUrl: '/api/placeholder/400/225',
    category: 'comedy',
    culturalValidation: {
      score: 0.94,
      reviewedBy: 'Dr. Asha Patel, Cultural Wellness Specialist',
      validatedDate: '2024-09-07',
      culturalRelevance: 0.96,
      appropriateness: 0.92
    },
    therapeuticBenefits: {
      stressReduction: 0.87,
      moodImprovement: 0.91,
      anxietyRelief: 0.84,
      communityConnection: 0.89
    },
    engagementMetrics: {
      views: 12847,
      likes: 1156,
      shares: 234,
      therapeuticRating: 4.7,
      communityFeedback: [
        'Finally someone who gets it! Laughed until I cried (happy tears)',
        'This helped me realize I\'m not alone in this journey',
        'Comedy therapy is real - felt so much lighter after watching'
      ]
    },
    tags: ['Graves Disease', 'Black Women', 'Health Humor', 'Thyroid', 'Wellness Comedy'],
    evidenceBase: [
      'Journal of Health Psychology (2023): Humor therapy reduces cortisol in chronic illness',
      'Cultural Medicine Review (2023): Culturally-specific comedy improves treatment adherence'
    ],
    targetAudience: ['Black Women', 'Graves Disease', 'Newly Diagnosed', 'Stress Management']
  };

  const startTherapySession = () => {
    setCurrentContent(mockContent);
    setSessionStarted(true);
    setShowMoodTracker(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // In production, this would control actual video/audio playback
  };

  useEffect(() => {
    const runValidation = async () => {
      if (!currentContent) return;
      try {
        const result = await validateImageContent({
          url: currentContent.thumbnailUrl,
          altText: currentContent.title,
          category: currentContent.category,
        });
        const ok =
          result.cultural >= 0.8 &&
          result.inclusivity >= 0.8 &&
          !(result.issues || []).some((i) => i.includes('cultural_mismatch'));
        if (!ok) {
          console.warn('Image failed cultural validation', {
            src: currentContent.thumbnailUrl,
            alt: currentContent.title,
            category: currentContent.category,
            result,
          });
          setThumbnailSrc('/images/default-placeholder.jpg');
        } else {
          setThumbnailSrc(currentContent.thumbnailUrl);
        }
      } catch (err) {
        console.error('TitanEngine validation failed', {
          error: err,
          src: currentContent.thumbnailUrl,
          alt: currentContent.title,
          category: currentContent.category,
        });
        setThumbnailSrc('/images/default-placeholder.jpg');
      }
    };
    runValidation();
  }, [currentContent]);

  const handleMoodSelection = (mood: UserMoodState['before']) => {
    setMoodState({ before: mood });
    setShowMoodTracker(false);
  };

  const completeMoodTracking = (afterMood: UserMoodState['before']) => {
    const moodScale = { stressed: 1, anxious: 2, sad: 2, neutral: 3, happy: 5 };
    const improvement = moodScale[afterMood] - moodScale[moodState.before];
    
    setMoodState({
      ...moodState,
      after: afterMood,
      improvement
    });
  };

  // Simulate playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentContent) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= currentContent.duration) {
            setIsPlaying(false);
            return currentContent.duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentContent]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy': return 'bg-green-500';
      case 'neutral': return 'bg-yellow-500';
      case 'sad': return 'bg-blue-500';
      case 'anxious': return 'bg-orange-500';
      case 'stressed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-pink-600 to-orange-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6" />
            Comedy Therapy Session
          </CardTitle>
          <CardDescription className="text-pink-100">
            Culturally-validated comedy content designed to reduce stress and improve mood through therapeutic laughter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">94%</div>
              <div className="text-pink-100">Cultural Validation Score</div>
            </div>
            <div className="text-3xl font-bold text-center">4.7⭐</div>
            <div className="text-pink-100 text-center">Therapeutic Rating</div>
            <div className="text-center">
              <div className="text-3xl font-bold">87%</div>
              <div className="text-pink-100">Stress Reduction Effectiveness</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mood Tracker Modal */}
      {showMoodTracker && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              How are you feeling right now?
            </CardTitle>
            <CardDescription>
              This helps us track the therapeutic benefits of comedy content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {(['stressed', 'anxious', 'sad', 'neutral', 'happy'] as const).map((mood) => (
                <Button
                  key={mood}
                  onClick={() => handleMoodSelection(mood)}
                  variant="outline"
                  className="flex flex-col gap-2 h-20"
                >
                  <div className={`w-4 h-4 rounded-full ${getMoodColor(mood)}`} />
                  <span className="capitalize text-xs">{mood}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Player */}
      {currentContent ? (
        <Card className="border-2 border-pink-200">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{currentContent.title}</CardTitle>
                <CardDescription className="text-base mb-3">
                  {currentContent.description}
                </CardDescription>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-pink-600">
                    <Shield className="h-3 w-3 mr-1" />
                    Culturally Validated
                  </Badge>
                  <Badge variant="outline">
                    <Award className="h-3 w-3 mr-1" />
                    Therapeutic Content
                  </Badge>
                  <Badge variant="outline">
                    {currentContent.targetAudience[0]}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Video Player Mockup */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              <img
                src={thumbnailSrc}
                alt={currentContent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <Button
                  onClick={togglePlay}
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 text-white" />
                  ) : (
                    <Play className="h-8 w-8 text-white" />
                  )}
                </Button>
              </div>
              
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 text-white text-sm">
                  <span>{formatTime(currentTime)}</span>
                  <Progress 
                    value={(currentTime / currentContent.duration) * 100} 
                    className="flex-1 h-2 bg-white/20"
                  />
                  <span>{formatTime(currentContent.duration)}</span>
                  <Volume2 className="h-4 w-4 ml-2" />
                </div>
              </div>
            </div>

            {/* Cultural Validation Info */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Cultural Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium mb-2">Validation Scores:</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Cultural Relevance:</span>
                        <span className="font-semibold">
                          {Math.round(currentContent.culturalValidation.culturalRelevance * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Appropriateness:</span>
                        <span className="font-semibold">
                          {Math.round(currentContent.culturalValidation.appropriateness * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Validated By:</div>
                    <div className="text-sm text-gray-700">
                      {currentContent.culturalValidation.reviewedBy}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Reviewed: {currentContent.culturalValidation.validatedDate}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Therapeutic Benefits */}
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Therapeutic Benefits
                </CardTitle>
                <CardDescription>
                  Evidence-based wellness outcomes from this content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(currentContent.therapeuticBenefits).map(([benefit, score]) => (
                    <div key={benefit} className="text-center p-3 bg-white rounded-lg">
                      <div className="font-bold text-lg text-purple-600">
                        {Math.round(score * 100)}%
                      </div>
                      <div className="text-xs text-gray-600 capitalize">
                        {benefit.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Engagement */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Community Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="font-bold text-xl text-blue-600">
                      {currentContent.engagementMetrics.views.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl text-blue-600">
                      {currentContent.engagementMetrics.likes.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Likes</div>
                  </div>
                  <div className="font-bold text-xl text-blue-600 text-center">
                    {currentContent.engagementMetrics.therapeuticRating}/5
                  </div>
                  <div className="text-sm text-gray-600 text-center">Therapeutic Rating</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2">Community Feedback:</div>
                  <div className="space-y-2">
                    {currentContent.engagementMetrics.communityFeedback.map((feedback, idx) => (
                      <div key={idx} className="text-sm italic text-gray-700 p-2 bg-white rounded">
                        "{feedback}"
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Post-Session Mood Check */}
            {currentTime >= currentContent.duration - 10 && !moodState.after && (
              <Card className="border-2 border-green-300 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    How do you feel after watching?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-3">
                    {(['stressed', 'anxious', 'sad', 'neutral', 'happy'] as const).map((mood) => (
                      <Button
                        key={mood}
                        onClick={() => completeMoodTracking(mood)}
                        variant="outline"
                        className="flex flex-col gap-2 h-20"
                      >
                        <div className={`w-4 h-4 rounded-full ${getMoodColor(mood)}`} />
                        <span className="capitalize text-xs">{mood}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mood Improvement Results */}
            {moodState.after && moodState.improvement !== undefined && (
              <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Therapeutic Session Complete!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">
                      {moodState.improvement > 0 ? '+' : ''}{moodState.improvement} mood improvement
                    </div>
                    <div className="text-green-100">
                      You went from feeling {moodState.before} to {moodState.after}
                    </div>
                    <div className="mt-4 text-sm">
                      This session contributed to your overall wellness journey. 
                      Comedy therapy sessions like this have been shown to reduce cortisol levels by up to 25%.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Smile className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <CardTitle className="mb-2">Ready for some therapeutic laughter?</CardTitle>
            <CardDescription className="mb-6">
              Start your comedy therapy session with culturally-validated content designed to improve your mood and reduce stress.
            </CardDescription>
            <Button onClick={startTherapySession} size="lg" className="bg-pink-600 hover:bg-pink-700">
              <Play className="h-5 w-5 mr-2" />
              Start Comedy Therapy Session
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComedyTherapyPlayer;