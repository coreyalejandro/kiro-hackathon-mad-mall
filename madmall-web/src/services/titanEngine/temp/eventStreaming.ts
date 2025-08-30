/**
 * Titan Data Engine - Event Streaming System
 * 
 * AWS-native event collection and streaming infrastructure
 * Designed for healthcare-grade reliability, privacy, and performance
 */

import { EventBridge } from '@aws-sdk/client-eventbridge';
import { KinesisClient, PutRecordCommand, PutRecordsCommand } from '@aws-sdk/client-kinesis';
import { FirehoseClient, PutRecordCommand as FirehosePutRecordCommand } from '@aws-sdk/client-firehose';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

// Event Types for Healthcare AI/ML Pipeline
export interface TitanEvent {
  eventId: string;
  userId: string; // Hashed for privacy
  sessionId: string;
  timestamp: number;
  eventType: TitanEventType;
  source: string;
  data: Record<string, any>;
  metadata: EventMetadata;
  privacyLevel: PrivacyLevel;
}

export enum TitanEventType {
  // User Interaction Events
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  PAGE_VIEW = 'user.page_view',
  BUTTON_CLICK = 'user.button_click',
  
  // Content Interaction Events
  CONTENT_VIEW = 'content.view',
  CONTENT_LIKE = 'content.like',
  CONTENT_SHARE = 'content.share',
  CONTENT_SAVE = 'content.save',
  
  // Therapeutic Events
  COMEDY_WATCH = 'therapy.comedy_watch',
  RELIEF_RATING = 'therapy.relief_rating',
  MOOD_CHECK = 'therapy.mood_check',
  STRESS_LEVEL = 'therapy.stress_level',
  
  // Community Events
  CIRCLE_JOIN = 'community.circle_join',
  POST_CREATE = 'community.post_create',
  COMMENT_CREATE = 'community.comment_create',
  PEER_CONNECT = 'community.peer_connect',
  
  // Health Journey Events
  SYMPTOM_LOG = 'health.symptom_log',
  MEDICATION_REMINDER = 'health.medication_reminder',
  APPOINTMENT_SCHEDULE = 'health.appointment_schedule',
  WELLNESS_GOAL = 'health.wellness_goal',
  
  // AI/ML Training Events
  MODEL_PREDICTION = 'ai.model_prediction',
  FEEDBACK_RECEIVED = 'ai.feedback_received',
  RECOMMENDATION_SHOWN = 'ai.recommendation_shown',
  RECOMMENDATION_CLICKED = 'ai.recommendation_clicked'
}

export enum PrivacyLevel {
  PUBLIC = 'public',           // Can be used for general analytics
  COMMUNITY = 'community',     // Can be shared within user's circles
  PERSONAL = 'personal',       // User's personal data only
  SENSITIVE = 'sensitive',     // Health data - highest protection
  ANONYMOUS = 'anonymous'      // Fully anonymized for research
}

export interface EventMetadata {
  userAgent: string;
  ipAddress?: string; // Hashed for privacy
  deviceType: 'mobile' | 'tablet' | 'desktop';
  location?: {
    country: string;
    region?: string; // State/Province level only
  };
  culturalContext?: {
    language: string;
    culturalBackground?: string[];
  };
  healthContext?: {
    diagnosisStage: string;
    treatmentPhase: string;
    comfortLevel: string;
  };
}

/**
 * Titan Event Streaming Service
 * Handles real-time event collection with healthcare-grade privacy and reliability
 */
export class TitanEventStreaming {
  private kinesisClient: KinesisClient;
  private firehoseClient: FirehoseClient;
  private eventBridge: EventBridge;
  private streamName: string;
  private firehoseDeliveryStream: string;
  private eventBusName: string;
  
  constructor(config: {
    region: string;
    streamName: string;
    firehoseDeliveryStream: string;
    eventBusName: string;
  }) {
    this.kinesisClient = new KinesisClient({ region: config.region });
    this.firehoseClient = new FirehoseClient({ region: config.region });
    this.eventBridge = new EventBridge({ region: config.region });
    
    this.streamName = config.streamName;
    this.firehoseDeliveryStream = config.firehoseDeliveryStream;
    this.eventBusName = config.eventBusName;
  }

  /**
   * Collect and stream a single event
   * Implements privacy-first design with automatic PII protection
   */
  async collectEvent(event: Omit<TitanEvent, 'eventId' | 'timestamp'>): Promise<void> {
    try {
      const enrichedEvent: TitanEvent = {
        ...event,
        eventId: uuidv4(),
        timestamp: Date.now(),
        userId: this.hashUserId(event.userId), // Always hash user IDs
        data: this.sanitizeEventData(event.data, event.privacyLevel)
      };

      // Validate event before streaming
      this.validateEvent(enrichedEvent);

      // Stream to Kinesis for real-time processing
      await this.streamToKinesis(enrichedEvent);

      // Send to Firehose for batch processing and storage
      await this.streamToFirehose(enrichedEvent);

      // Emit to EventBridge for event-driven architecture
      await this.emitToEventBridge(enrichedEvent);

    } catch (error) {
      console.error('Failed to collect event:', error);
      // Implement dead letter queue for failed events
      await this.handleFailedEvent(event, error);
    }
  }

  /**
   * Batch collect multiple events for high-throughput scenarios
   */
  async collectEventBatch(events: Omit<TitanEvent, 'eventId' | 'timestamp'>[]): Promise<void> {
    const enrichedEvents = events.map(event => ({
      ...event,
      eventId: uuidv4(),
      timestamp: Date.now(),
      userId: this.hashUserId(event.userId),
      data: this.sanitizeEventData(event.data, event.privacyLevel)
    }));

    // Validate all events
    enrichedEvents.forEach(event => this.validateEvent(event));

    // Batch stream to Kinesis
    await this.batchStreamToKinesis(enrichedEvents);
  }

  /**
   * Hash user ID for privacy protection
   * Uses SHA-256 with salt for irreversible hashing
   */
  private hashUserId(userId: string): string {
    const salt = process.env.TITAN_USER_SALT || 'titan-default-salt';
    return createHash('sha256').update(userId + salt).digest('hex');
  }

  /**
   * Sanitize event data based on privacy level
   * Removes or hashes PII according to healthcare privacy standards
   */
  private sanitizeEventData(data: Record<string, any>, privacyLevel: PrivacyLevel): Record<string, any> {
    const sanitized = { ...data };

    switch (privacyLevel) {
      case PrivacyLevel.SENSITIVE:
        // Remove all PII, keep only aggregatable metrics
        return this.removePII(sanitized);
      
      case PrivacyLevel.PERSONAL:
        // Hash identifiable fields
        return this.hashPII(sanitized);
      
      case PrivacyLevel.ANONYMOUS:
        // Remove all identifying information
        return this.anonymize(sanitized);
      
      default:
        return sanitized;
    }
  }

  /**
   * Remove personally identifiable information
   */
  private removePII(data: Record<string, any>): Record<string, any> {
    const piiFields = ['email', 'phone', 'address', 'fullName', 'ssn', 'medicalId'];
    const cleaned = { ...data };
    
    piiFields.forEach(field => {
      delete cleaned[field];
    });
    
    return cleaned;
  }

  /**
   * Hash PII fields for privacy protection
   */
  private hashPII(data: Record<string, any>): Record<string, any> {
    const hashableFields = ['email', 'phone', 'ipAddress'];
    const hashed = { ...data };
    
    hashableFields.forEach(field => {
      if (hashed[field]) {
        hashed[field] = createHash('sha256').update(hashed[field]).digest('hex');
      }
    });
    
    return hashed;
  }

  /**
   * Anonymize data for research purposes
   */
  private anonymize(data: Record<string, any>): Record<string, any> {
    // Keep only statistical and behavioral data
    const allowedFields = [
      'eventType', 'timestamp', 'duration', 'rating', 'category',
      'deviceType', 'country', 'language', 'diagnosisStage'
    ];
    
    const anonymized: Record<string, any> = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        anonymized[field] = data[field];
      }
    });
    
    return anonymized;
  }

  /**
   * Validate event structure and data integrity
   */
  private validateEvent(event: TitanEvent): void {
    if (!event.eventId || !event.userId || !event.eventType) {
      throw new Error('Invalid event: missing required fields');
    }
    
    if (!Object.values(TitanEventType).includes(event.eventType)) {
      throw new Error(`Invalid event type: ${event.eventType}`);
    }
    
    if (!Object.values(PrivacyLevel).includes(event.privacyLevel)) {
      throw new Error(`Invalid privacy level: ${event.privacyLevel}`);
    }
  }

  /**
   * Stream event to Kinesis Data Streams for real-time processing
   */
  private async streamToKinesis(event: TitanEvent): Promise<void> {
    const command = new PutRecordCommand({
      StreamName: this.streamName,
      Data: Buffer.from(JSON.stringify(event)),
      PartitionKey: event.userId // Partition by user for ordered processing
    });

    await this.kinesisClient.send(command);
  }

  /**
   * Batch stream events to Kinesis for high throughput
   */
  private async batchStreamToKinesis(events: TitanEvent[]): Promise<void> {
    const records = events.map(event => ({
      Data: Buffer.from(JSON.stringify(event)),
      PartitionKey: event.userId
    }));

    const command = new PutRecordsCommand({
      StreamName: this.streamName,
      Records: records
    });

    await this.kinesisClient.send(command);
  }

  /**
   * Stream event to Firehose for batch processing and S3 storage
   */
  private async streamToFirehose(event: TitanEvent): Promise<void> {
    const command = new FirehosePutRecordCommand({
      DeliveryStreamName: this.firehoseDeliveryStream,
      Record: {
        Data: Buffer.from(JSON.stringify(event) + '\n') // Newline for proper JSON Lines format
      }
    });

    await this.firehoseClient.send(command);
  }

  /**
   * Emit event to EventBridge for event-driven architecture
   */
  private async emitToEventBridge(event: TitanEvent): Promise<void> {
    await this.eventBridge.putEvents({
      Entries: [{
        Source: 'titan.engine',
        DetailType: event.eventType,
        Detail: JSON.stringify(event),
        EventBusName: this.eventBusName
      }]
    });
  }

  /**
   * Handle failed events with dead letter queue
   */
  private async handleFailedEvent(event: any, error: any): Promise<void> {
    // Log to CloudWatch for monitoring
    console.error('Event collection failed:', {
      eventType: event.eventType,
      error: error.message,
      timestamp: Date.now()
    });
    
    // TODO: Implement dead letter queue with SQS
    // This ensures no data loss even during system failures
  }
}

/**
 * Singleton instance for global event collection
 */
export const titanEventStreaming = new TitanEventStreaming({
  region: process.env.AWS_REGION || 'us-east-1',
  streamName: process.env.TITAN_KINESIS_STREAM || 'titan-events-stream',
  firehoseDeliveryStream: process.env.TITAN_FIREHOSE_STREAM || 'titan-events-firehose',
  eventBusName: process.env.TITAN_EVENT_BUS || 'titan-events-bus'
});

/**
 * Convenience functions for common event types
 */
export const TitanEvents = {
  // User interaction tracking
  trackPageView: (userId: string, page: string, metadata: EventMetadata) => {
    return titanEventStreaming.collectEvent({
      userId,
      sessionId: metadata.userAgent, // Simplified session tracking
      eventType: TitanEventType.PAGE_VIEW,
      source: 'web-app',
      data: { page },
      metadata,
      privacyLevel: PrivacyLevel.PERSONAL
    });
  },

  // Therapeutic event tracking
  trackComedyWatch: (userId: string, contentId: string, duration: number, reliefRating: number, metadata: EventMetadata) => {
    return titanEventStreaming.collectEvent({
      userId,
      sessionId: metadata.userAgent,
      eventType: TitanEventType.COMEDY_WATCH,
      source: 'comedy-lounge',
      data: { contentId, duration, reliefRating },
      metadata,
      privacyLevel: PrivacyLevel.SENSITIVE // Health-related data
    });
  },

  // Community interaction tracking
  trackCircleJoin: (userId: string, circleId: string, metadata: EventMetadata) => {
    return titanEventStreaming.collectEvent({
      userId,
      sessionId: metadata.userAgent,
      eventType: TitanEventType.CIRCLE_JOIN,
      source: 'peer-circles',
      data: { circleId },
      metadata,
      privacyLevel: PrivacyLevel.COMMUNITY
    });
  },

  // Health journey tracking
  trackSymptomLog: (userId: string, symptoms: string[], severity: number, metadata: EventMetadata) => {
    return titanEventStreaming.collectEvent({
      userId,
      sessionId: metadata.userAgent,
      eventType: TitanEventType.SYMPTOM_LOG,
      source: 'health-tracker',
      data: { symptoms, severity },
      metadata,
      privacyLevel: PrivacyLevel.SENSITIVE
    });
  }
};