'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Target, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Clock,
  CheckCircle,
  Star,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';

// Types for AI-matched circles
interface CircleMatch {
  circleId: string;
  circleName: string;
  description: string;
  memberCount: number;
  activeMembers: number;
  matchScore: number;
  matchReasons: string[];
  expectedBenefits: string[];
  culturalAlignment: number;
  activityLevel: 'low' | 'medium' | 'high';
  focusAreas: string[];
  meetingFrequency: string;
  location: string;
  recentActivity: {
    lastPost: string;
    engagementRate: number;
    supportLevel: number;
  };
  memberProfiles: {
    name: string;
    avatar: string;
    stage: string;
    location: string;
  }[];
  testimonial?: {
    quote: string;
    author: string;
    rating: number;
  };
}

const CircleRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<CircleMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Mock AI-matched circles data
  const mockRecommendations: CircleMatch[] = [
    {
      circleId: 'graves_warriors_sisterhood',
      circleName: 'Graves\' Warriors Sisterhood',
      description: 'A supportive community of Black women managing Graves\' disease, sharing experiences, treatments, and victories on our wellness journey.',
      memberCount: 147,
      activeMembers: 89,
      matchScore: 0.94,
      matchReasons: [
        'Exact diagnosis match (Graves\' disease)',
        'Cultural identity alignment (Black women)',
        'Similar age demographic (25-40)',
        'Geographic proximity (Southeast US)',
        'High peer support preference match'
      ],
      expectedBenefits: [
        'Direct experience sharing with same condition',
        'Emotional support from cultural peers',
        'Treatment adherence accountability',
        'Reduced healthcare isolation'
      ],
      culturalAlignment: 0.96,
      activityLevel: 'high',
      focusAreas: ['Graves\' Disease', 'Peer Support', 'Cultural Wellness', 'Treatment Navigation'],
      meetingFrequency: 'Weekly video calls, daily chat',
      location: 'Online + Atlanta meetups',
      recentActivity: {
        lastPost: '2 hours ago',
        engagementRate: 0.87,
        supportLevel: 0.92
      },
      memberProfiles: [
        { name: 'Keisha M.', avatar: '/api/placeholder/32/32', stage: 'Newly diagnosed', location: 'Atlanta, GA' },
        { name: 'Nia T.', avatar: '/api/placeholder/32/32', stage: '2 years managing', location: 'Charlotte, NC' },
        { name: 'Zara L.', avatar: '/api/placeholder/32/32', stage: 'In remission', location: 'Miami, FL' }
      ],
      testimonial: {
        quote: 'This circle saved my sanity. Finding other Black women who truly understand this journey has been life-changing.',
        author: 'Nia T.',
        rating: 5
      }
    },
    {
      circleId: 'black_women_wellness_collective',
      circleName: 'Black Women Wellness Collective',
      description: 'Holistic wellness community focusing on mental, physical, and spiritual health through culturally-rooted practices and modern medicine.',
      memberCount: 312,
      activeMembers: 198,
      matchScore: 0.89,
      matchReasons: [
        'Strong cultural identity match',
        'Holistic wellness approach preference',
        'Interest in community-based healing',
        'Preference for culturally-adapted practices',
        'High engagement with wellness content'
      ],
      expectedBenefits: [
        'Broader wellness strategies beyond condition',
        'Cultural affirmation and identity support',
        'Access to diverse wellness resources',
        'Community accountability for health goals'
      ],
      culturalAlignment: 0.93,
      activityLevel: 'high',
      focusAreas: ['Holistic Wellness', 'Cultural Healing', 'Preventive Care', 'Community Support'],
      meetingFrequency: 'Bi-weekly workshops, daily discussions',
      location: 'Online nationwide',
      recentActivity: {
        lastPost: '45 minutes ago',
        engagementRate: 0.82,
        supportLevel: 0.88
      },
      memberProfiles: [
        { name: 'Amara K.', avatar: '/api/placeholder/32/32', stage: 'Wellness advocate', location: 'Houston, TX' },
        { name: 'Imani R.', avatar: '/api/placeholder/32/32', stage: 'Holistic health', location: 'Oakland, CA' },
        { name: 'Kendra J.', avatar: '/api/placeholder/32/32', stage: 'Mindfulness coach', location: 'Brooklyn, NY' }
      ],
      testimonial: {
        quote: 'A safe space where being a Black woman is celebrated, not explained. The wellness wisdom here is unmatched.',
        author: 'Amara K.',
        rating: 5
      }
    },
    {
      circleId: 'comedy_healing_circle',
      circleName: 'Comedy & Healing Circle',
      description: 'Using laughter as medicine! A community that believes in the healing power of humor, sharing comedy content and finding joy in our health journeys.',
      memberCount: 89,
      activeMembers: 67,
      matchScore: 0.82,
      matchReasons: [
        'High engagement with comedy therapy content',
        'Interest in alternative wellness approaches',
        'Preference for positive/uplifting content',
        'Community-oriented healing philosophy',
        'Stress reduction priority match'
      ],
      expectedBenefits: [
        'Stress reduction through therapeutic laughter',
        'Community joy and positivity',
        'Alternative coping mechanism development',
        'Mood improvement and mental health support'
      ],
      culturalAlignment: 0.78,
      activityLevel: 'medium',
      focusAreas: ['Comedy Therapy', 'Stress Relief', 'Mental Health', 'Joy & Positivity'],
      meetingFrequency: 'Weekly comedy nights, daily sharing',
      location: 'Online with local meetups',
      recentActivity: {
        lastPost: '3 hours ago',
        engagementRate: 0.75,
        supportLevel: 0.83
      },
      memberProfiles: [
        { name: 'Maya S.', avatar: '/api/placeholder/32/32', stage: 'Laughter coach', location: 'Chicago, IL' },
        { name: 'Tiana B.', avatar: '/api/placeholder/32/32', stage: 'Comedy lover', location: 'Los Angeles, CA' },
        { name: 'Jasmine P.', avatar: '/api/placeholder/32/32', stage: 'Wellness humor', location: 'Detroit, MI' }
      ],
      testimonial: {
        quote: 'Who knew healing could be this fun? This circle taught me that laughter really is the best medicine.',
        author: 'Maya S.',
        rating: 4
      }
    }
  ];

  const loadRecommendations = async () => {
    setLoading(true);
    
    // Simulate AI matching API call
    setTimeout(() => {
      setRecommendations(mockRecommendations);
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const getActivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-500';
    if (score >= 0.8) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  const handleJoinCircle = (circleId: string) => {
    // In production, this would trigger the join process
    console.log(`Joining circle: ${circleId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Your Perfect Circle Matches
          </CardTitle>
          <CardDescription className="text-blue-100">
            AI-powered community recommendations based on your health journey, cultural identity, and support preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {recommendations.length} communities analyzed
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Real-time matching algorithm
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Updated 2 minutes ago
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Circle Recommendations */}
      <div className="space-y-6">
        {recommendations.map((circle, index) => (
          <Card key={circle.circleId} className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{circle.circleName}</CardTitle>
                    <Badge 
                      className={`text-white ${getMatchScoreColor(circle.matchScore)}`}
                    >
                      {Math.round(circle.matchScore * 100)}% Match
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={getActivityColor(circle.activityLevel)}
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      {circle.activityLevel} activity
                    </Badge>
                  </div>
                  <CardDescription className="text-base">
                    {circle.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Match Score Visualization */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">AI Match Confidence</span>
                  <span className="text-sm text-gray-600">
                    {Math.round(circle.matchScore * 100)}% confident this is right for you
                  </span>
                </div>
                <Progress value={circle.matchScore * 100} className="h-2" />
              </div>

              {/* Community Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-bold text-lg">{circle.memberCount}</div>
                  <div className="text-sm text-gray-600">Total Members</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-bold text-lg">{circle.activeMembers}</div>
                  <div className="text-sm text-gray-600">Active This Week</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-bold text-lg">{Math.round(circle.culturalAlignment * 100)}%</div>
                  <div className="text-sm text-gray-600">Cultural Fit</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-bold text-lg">{Math.round(circle.recentActivity.supportLevel * 100)}%</div>
                  <div className="text-sm text-gray-600">Support Level</div>
                </div>
              </div>

              {/* Why This Match */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  Why this is a perfect match for you:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {circle.matchReasons.slice(0, 4).map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expected Benefits */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-600" />
                  What you'll gain:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {circle.expectedBenefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Member Preview */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Meet some members:
                </h4>
                <div className="flex items-center gap-4">
                  {circle.memberProfiles.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="text-xs">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-gray-600">{member.stage}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              {circle.testimonial && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(circle.testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 italic mb-2">
                    "{circle.testimonial.quote}"
                  </blockquote>
                  <div className="text-sm font-medium text-gray-900">
                    — {circle.testimonial.author}
                  </div>
                </div>
              )}

              {/* Activity Info */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {circle.meetingFrequency}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {circle.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    Last post: {circle.recentActivity.lastPost}
                  </div>
                </div>
              </div>

              {/* Join Button */}
              <div className="flex items-center gap-3 pt-2">
                <Button 
                  onClick={() => handleJoinCircle(circle.circleId)}
                  className="flex-1"
                  size="lg"
                >
                  Join Circle
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 p-4">
        Circle recommendations powered by AI analysis of 2,847+ communities • 
        Match scores update in real-time based on your activity and preferences
      </div>
    </div>
  );
};

export default CircleRecommendations;