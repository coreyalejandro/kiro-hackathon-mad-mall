/**
 * Titan Data Engine - Client Integration
 * 
 * Frontend integration for the Titan Engine that provides:
 * - Real-time event tracking
 * - Personalized recommendations
 * - Model of Care delivery
 * - Performance monitoring
 * - Privacy-first data collection
 */

import { titanEngine, ModelOfCare } from './titanCore';
import { TitanEvents, TitanEventType, PrivacyLevel, EventMetadata } from './eventStreaming';
import { PredictiveInsight, InsightType, InsightPriority } from './analyticsProcessor';

/**
 * Client-side Titan Engine interface
 */
export class TitanClient {
  private userId: string | null = null;
  private sessionId: string;
  private isInitialized: boolean = false;
  
  // Real-time recommendations
  private currentRecommendations: PredictiveInsight[] = [];
  private modelOfCare: ModelOfCare | null = null;
  
  // Event batching for performance
  private eventBatch: any[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  
  // Privacy settings
  private privacyLevel: PrivacyLevel = PrivacyLevel.PERSONAL;
  private consentGiven: boolean = false;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeClient();
  }

  /**
   * Initialize the Titan Client
   */
  private async initializeClient(): Promise<void> {
    try {
      // Check for existing user session
      this.loadUserSession();
      
      // Initialize event tracking
      this.initializeEventTracking();
      
      // Start recommendation polling
      this.startRecommendationPolling();
      
      this.isInitialized = true;
      console.log('✅ Titan Client initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Titan Client:', error);
    }
  }

  /**
   * Set user context for personalized AI
   */
  async setUser(userId: string, userContext: any): Promise<void> {
    this.userId = userId;
    
    // Store user context securely
    this.storeUserContext(userContext);
    
    // Generate initial Model of Care
    if (this.consentGiven) {
      await this.generateModelOfCare();
    }
    
    console.log(`👤 User set: ${userId}`);
  }

  /**
   * Set privacy preferences
   */
  setPrivacyPreferences(level: PrivacyLevel, consent: boolean): void {
    this.privacyLevel = level;
    this.consentGiven = consent;
    
    // Store preferences
    localStorage.setItem('titan_privacy_level', level);
    localStorage.setItem('titan_consent', consent.toString());
    
    console.log(`🔒 Privacy level set: ${level}, Consent: ${consent}`);
  }

  /**
   * Track user interaction events
   */
  async trackEvent(eventType: TitanEventType, data: any, privacyLevel?: PrivacyLevel): Promise<void> {
    if (!this.consentGiven || !this.userId) {
      return; // Respect privacy preferences
    }

    const metadata = this.getEventMetadata();
    const event = {
      userId: this.userId,
      sessionId: this.sessionId,
      eventType,
      source: 'web-app',
      data,
      metadata,
      privacyLevel: privacyLevel || this.privacyLevel
    };

    // Add to batch for efficient processing
    this.eventBatch.push(event);
    
    // Process batch if it gets too large or after timeout
    if (this.eventBatch.length >= 10) {
      await this.processBatch();
    } else if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.processBatch(), 5000);
    }
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(): Promise<PredictiveInsight[]> {
    if (!this.userId || !this.consentGiven) {
      return [];
    }

    try {
      // Get fresh recommendations from Titan Engine
      const recommendations = await this.fetchRecommendations();
      
      // Filter by priority and relevance
      const filteredRecommendations = this.filterRecommendations(recommendations);
      
      // Update current recommendations
      this.currentRecommendations = filteredRecommendations;
      
      return filteredRecommendations;
      
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return this.currentRecommendations; // Return cached recommendations
    }
  }

  /**
   * Get current Model of Care
   */
  async getModelOfCare(): Promise<ModelOfCare | null> {
    if (!this.userId || !this.consentGiven) {
      return null;
    }

    if (!this.modelOfCare) {
      await this.generateModelOfCare();
    }

    return this.modelOfCare;
  }

  /**
   * Provide feedback on recommendations
   */
  async provideFeedback(insightId: string, feedback: 'helpful' | 'not_helpful' | 'incorrect', details?: string): Promise<void> {
    if (!this.userId) return;

    await this.trackEvent(TitanEventType.FEEDBACK_RECEIVED, {
      insightId,
      feedback,
      details,
      timestamp: Date.now()
    }, PrivacyLevel.PERSONAL);

    console.log(`📝 Feedback provided for insight: ${insightId}`);
  }

  /**
   * Track page views automatically
   */
  trackPageView(page: string): void {
    this.trackEvent(TitanEventType.PAGE_VIEW, { page });
  }

  /**
   * Track comedy watching with therapeutic metrics
   */
  async trackComedyWatch(contentId: string, duration: number, reliefRating: number): Promise<void> {
    await this.trackEvent(TitanEventType.COMEDY_WATCH, {
      contentId,
      duration,
      reliefRating,
      timestamp: Date.now()
    }, PrivacyLevel.SENSITIVE);

    // Trigger real-time analysis
    await this.triggerRealTimeAnalysis();
  }

  /**
   * Track mood and stress levels
   */
  async trackMoodCheck(moodScore: number, stressLevel: number, notes?: string): Promise<void> {
    await this.trackEvent(TitanEventType.MOOD_CHECK, {
      moodScore,
      stressLevel,
      notes,
      timestamp: Date.now()
    }, PrivacyLevel.SENSITIVE);

    // Check for immediate interventions
    await this.checkForInterventions(moodScore, stressLevel);
  }

  /**
   * Track community interactions
   */
  async trackCommunityInteraction(type: 'join_circle' | 'create_post' | 'comment' | 'peer_connect', data: any): Promise<void> {
    const eventTypeMap = {
      'join_circle': TitanEventType.CIRCLE_JOIN,
      'create_post': TitanEventType.POST_CREATE,
      'comment': TitanEventType.COMMENT_CREATE,
      'peer_connect': TitanEventType.PEER_CONNECT
    };

    await this.trackEvent(eventTypeMap[type], data, PrivacyLevel.COMMUNITY);
  }

  /**
   * Get real-time wellness insights
   */
  async getWellnessInsights(): Promise<{
    moodTrend: number[];
    stressPattern: number[];
    socialConnection: number;
    therapeuticProgress: number;
    recommendations: string[];
  }> {
    if (!this.userId || !this.consentGiven) {
      return this.getDefaultInsights();
    }

    try {
      // Fetch real-time metrics from Titan Engine
      const metrics = await this.fetchRealTimeMetrics();
      
      return {
        moodTrend: metrics.weeklyMoodTrend || [],
        stressPattern: metrics.stressLevelPattern || [],
        socialConnection: metrics.socialConnectionScore || 0,
        therapeuticProgress: metrics.dailyReliefScore || 0,
        recommendations: await this.getTopRecommendations()
      };
      
    } catch (error) {
      console.error('Failed to get wellness insights:', error);
      return this.getDefaultInsights();
    }
  }

  /**
   * Check if user needs immediate intervention
   */
  private async checkForInterventions(moodScore: number, stressLevel: number): Promise<void> {
    // Critical thresholds
    if (moodScore <= 2 || stressLevel >= 9) {
      // Trigger immediate support recommendations
      const criticalInsights = await this.getCriticalInsights();
      
      // Show immediate intervention UI
      this.showInterventionModal(criticalInsights);
    }
  }

  /**
   * Process batched events
   */
  private async processBatch(): Promise<void> {
    if (this.eventBatch.length === 0) return;

    try {
      // Send batch to Titan Engine
      for (const event of this.eventBatch) {
        await titanEngine.processRealTimeEvent(event);
      }
      
      // Clear batch
      this.eventBatch = [];
      
      // Clear timeout
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
        this.batchTimeout = null;
      }
      
    } catch (error) {
      console.error('Failed to process event batch:', error);
      // Keep events for retry
    }
  }

  /**
   * Generate Model of Care
   */
  private async generateModelOfCare(): Promise<void> {
    if (!this.userId) return;

    try {
      this.modelOfCare = await titanEngine.generateModelOfCare(this.userId);
      console.log('📋 Model of Care generated');
      
    } catch (error) {
      console.error('Failed to generate Model of Care:', error);
    }
  }

  /**
   * Fetch recommendations from Titan Engine
   */
  private async fetchRecommendations(): Promise<PredictiveInsight[]> {
    // This would call the actual Titan Engine API
    // For now, return mock recommendations
    return [
      {
        insightId: 'rec_1',
        userId: this.userId!,
        timestamp: Date.now(),
        insightType: InsightType.THERAPEUTIC_OPPORTUNITY,
        confidence: 0.85,
        priority: InsightPriority.MEDIUM,
        title: 'Comedy Therapy Recommended',
        description: 'Based on your recent stress levels, watching comedy content could help improve your mood.',
        actionable: true,
        recommendations: [
          'Watch "Thyroid Life Comedy" in the Comedy Lounge',
          'Join the "Laughter Therapy" peer circle',
          'Try the 5-minute stress relief session'
        ],
        triggerEvents: [TitanEventType.STRESS_LEVEL],
        dataPoints: { stressLevel: 7, lastComedyWatch: 48 },
        evidenceStrength: 0.82,
        statisticalSignificance: 0.91,
        clinicalRelevance: 0.88
      }
    ];
  }

  /**
   * Filter recommendations by relevance and priority
   */
  private filterRecommendations(recommendations: PredictiveInsight[]): PredictiveInsight[] {
    return recommendations
      .filter(rec => rec.confidence > 0.7) // High confidence only
      .filter(rec => rec.actionable) // Actionable recommendations only
      .sort((a, b) => {
        // Sort by priority and confidence
        const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1, 'research': 0 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return b.confidence - a.confidence;
      })
      .slice(0, 5); // Top 5 recommendations
  }

  /**
   * Get event metadata for tracking
   */
  private getEventMetadata(): EventMetadata {
    return {
      userAgent: navigator.userAgent,
      deviceType: this.getDeviceType(),
      location: {
        country: 'US', // Would be detected properly
        region: undefined // Privacy-preserving
      },
      culturalContext: {
        language: navigator.language
      }
    };
  }

  /**
   * Detect device type
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load user session from storage
   */
  private loadUserSession(): void {
    const storedUserId = localStorage.getItem('titan_user_id');
    const storedPrivacyLevel = localStorage.getItem('titan_privacy_level') as PrivacyLevel;
    const storedConsent = localStorage.getItem('titan_consent') === 'true';
    
    if (storedUserId) {
      this.userId = storedUserId;
    }
    
    if (storedPrivacyLevel) {
      this.privacyLevel = storedPrivacyLevel;
    }
    
    this.consentGiven = storedConsent;
  }

  /**
   * Store user context securely
   */
  private storeUserContext(context: any): void {
    // Store only non-sensitive context data
    const safeContext = {
      diagnosisStage: context.diagnosisStage,
      treatmentPhase: context.treatmentPhase,
      comfortLevel: context.comfortLevel
    };
    
    localStorage.setItem('titan_user_context', JSON.stringify(safeContext));
    localStorage.setItem('titan_user_id', this.userId!);
  }

  /**
   * Initialize automatic event tracking
   */
  private initializeEventTracking(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent(TitanEventType.USER_LOGOUT, { reason: 'page_hidden' });
      } else {
        this.trackEvent(TitanEventType.USER_LOGIN, { reason: 'page_visible' });
      }
    });

    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const buttonText = target.textContent || target.closest('button')?.textContent;
        this.trackEvent(TitanEventType.BUTTON_CLICK, {
          buttonText,
          page: window.location.pathname
        });
      }
    });
  }

  /**
   * Start polling for recommendations
   */
  private startRecommendationPolling(): void {
    // Poll for new recommendations every 5 minutes
    setInterval(async () => {
      if (this.consentGiven && this.userId) {
        await this.getRecommendations();
      }
    }, 300000); // 5 minutes
  }

  /**
   * Trigger real-time analysis
   */
  private async triggerRealTimeAnalysis(): Promise<void> {
    // Process current batch immediately for real-time insights
    await this.processBatch();
    
    // Fetch updated recommendations
    await this.getRecommendations();
  }

  // Helper methods
  private async fetchRealTimeMetrics(): Promise<any> {
    // Would fetch from actual API
    return {};
  }

  private async getTopRecommendations(): Promise<string[]> {
    const recommendations = await this.getRecommendations();
    return recommendations.slice(0, 3).map(rec => rec.title);
  }

  private getDefaultInsights(): any {
    return {
      moodTrend: [],
      stressPattern: [],
      socialConnection: 0,
      therapeuticProgress: 0,
      recommendations: []
    };
  }

  private async getCriticalInsights(): Promise<PredictiveInsight[]> {
    return this.currentRecommendations.filter(rec => 
      rec.priority === InsightPriority.CRITICAL || rec.priority === InsightPriority.HIGH
    );
  }

  private showInterventionModal(insights: PredictiveInsight[]): void {
    // Would show intervention modal in UI
    console.log('🚨 Critical intervention needed:', insights);
  }
}

/**
 * Singleton Titan Client instance
 */
export const titanClient = new TitanClient();

/**
 * React Hook for Titan Engine integration
 */
export function useTitanEngine() {
  const [recommendations, setRecommendations] = React.useState<PredictiveInsight[]>([]);
  const [modelOfCare, setModelOfCare] = React.useState<ModelOfCare | null>(null);
  const [wellnessInsights, setWellnessInsights] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  // Get recommendations
  const getRecommendations = React.useCallback(async () => {
    setLoading(true);
    try {
      const recs = await titanClient.getRecommendations();
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Model of Care
  const getModelOfCare = React.useCallback(async () => {
    setLoading(true);
    try {
      const care = await titanClient.getModelOfCare();
      setModelOfCare(care);
    } catch (error) {
      console.error('Failed to get Model of Care:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get wellness insights
  const getWellnessInsights = React.useCallback(async () => {
    setLoading(true);
    try {
      const insights = await titanClient.getWellnessInsights();
      setWellnessInsights(insights);
    } catch (error) {
      console.error('Failed to get wellness insights:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Track events
  const trackEvent = React.useCallback((eventType: TitanEventType, data: any) => {
    titanClient.trackEvent(eventType, data);
  }, []);

  // Provide feedback
  const provideFeedback = React.useCallback((insightId: string, feedback: 'helpful' | 'not_helpful' | 'incorrect', details?: string) => {
    titanClient.provideFeedback(insightId, feedback, details);
  }, []);

  return {
    recommendations,
    modelOfCare,
    wellnessInsights,
    loading,
    getRecommendations,
    getModelOfCare,
    getWellnessInsights,
    trackEvent,
    provideFeedback,
    titanClient
  };
}

// Import React for the hook
import React from 'react';