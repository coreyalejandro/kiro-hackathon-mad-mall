/**
 * Business Domain Events
 * Events related to business lifecycle and interactions
 */
import { DomainEvent, IntegrationEvent } from './base';
import { BusinessType, BusinessStatus } from '../domain/business';
export interface BusinessRegisteredData {
    businessId: string;
    ownerId: string;
    name: string;
    type: BusinessType;
    email: string;
    culturalCompetencies: string[];
}
export interface BusinessRegisteredEvent extends DomainEvent<BusinessRegisteredData> {
    type: 'business.registered';
    aggregateType: 'Business';
}
export interface BusinessProfileUpdatedData {
    businessId: string;
    ownerId: string;
    changes: {
        name?: string;
        description?: boolean;
        contact?: boolean;
        specialties?: string[];
        culturalCompetencies?: string[];
    };
}
export interface BusinessProfileUpdatedEvent extends DomainEvent<BusinessProfileUpdatedData> {
    type: 'business.profile_updated';
    aggregateType: 'Business';
}
export interface BusinessStatusChangedData {
    businessId: string;
    ownerId: string;
    previousStatus: BusinessStatus;
    newStatus: BusinessStatus;
    changedBy: string;
    reason?: string;
}
export interface BusinessStatusChangedEvent extends DomainEvent<BusinessStatusChangedData> {
    type: 'business.status_changed';
    aggregateType: 'Business';
}
export interface BusinessVerificationSubmittedData {
    businessId: string;
    ownerId: string;
    verificationId: string;
    documents: {
        type: string;
        url: string;
    }[];
}
export interface BusinessVerificationSubmittedEvent extends DomainEvent<BusinessVerificationSubmittedData> {
    type: 'business.verification_submitted';
    aggregateType: 'Business';
}
export interface BusinessVerifiedData {
    businessId: string;
    ownerId: string;
    verificationId: string;
    verifiedBy: string;
    certifications: string[];
}
export interface BusinessVerifiedEvent extends DomainEvent<BusinessVerifiedData> {
    type: 'business.verified';
    aggregateType: 'Business';
}
export interface BusinessVerificationRejectedData {
    businessId: string;
    ownerId: string;
    verificationId: string;
    rejectedBy: string;
    reason: string;
    feedback?: string;
}
export interface BusinessVerificationRejectedEvent extends DomainEvent<BusinessVerificationRejectedData> {
    type: 'business.verification_rejected';
    aggregateType: 'Business';
}
export interface ProductAddedData {
    businessId: string;
    productId: string;
    ownerId: string;
    name: string;
    category: string;
    price: number;
    culturalRelevance: string[];
}
export interface ProductAddedEvent extends DomainEvent<ProductAddedData> {
    type: 'business.product_added';
    aggregateType: 'Business';
}
export interface ProductUpdatedData {
    businessId: string;
    productId: string;
    ownerId: string;
    changes: {
        name?: string;
        price?: number;
        availability?: boolean;
        category?: string;
    };
}
export interface ProductUpdatedEvent extends DomainEvent<ProductUpdatedData> {
    type: 'business.product_updated';
    aggregateType: 'Business';
}
export interface ProductRemovedData {
    businessId: string;
    productId: string;
    ownerId: string;
    productName: string;
    reason?: string;
}
export interface ProductRemovedEvent extends DomainEvent<ProductRemovedData> {
    type: 'business.product_removed';
    aggregateType: 'Business';
}
export interface BusinessReviewedData {
    businessId: string;
    reviewId: string;
    reviewerId: string;
    rating: number;
    culturalCompetency: number;
    wouldRecommend: boolean;
    serviceUsed?: string;
}
export interface BusinessReviewedEvent extends DomainEvent<BusinessReviewedData> {
    type: 'business.reviewed';
    aggregateType: 'Business';
}
export interface ProductReviewedData {
    businessId: string;
    productId: string;
    reviewId: string;
    reviewerId: string;
    rating: number;
    wouldRecommend: boolean;
    culturalRelevance: string[];
    therapeuticBenefits: string[];
}
export interface ProductReviewedEvent extends DomainEvent<ProductReviewedData> {
    type: 'business.product_reviewed';
    aggregateType: 'Business';
}
export interface ReviewRespondedData {
    businessId: string;
    reviewId: string;
    ownerId: string;
    reviewerId: string;
    responseId: string;
}
export interface ReviewRespondedEvent extends DomainEvent<ReviewRespondedData> {
    type: 'business.review_responded';
    aggregateType: 'Business';
}
export interface BusinessViewedData {
    businessId: string;
    ownerId: string;
    viewerId: string;
    viewType: 'profile' | 'product' | 'search_result';
    referrer?: string;
    deviceType?: string;
}
export interface BusinessViewedEvent extends IntegrationEvent<BusinessViewedData> {
    type: 'business.viewed';
}
export interface BusinessContactedData {
    businessId: string;
    ownerId: string;
    contactedBy: string;
    contactMethod: 'email' | 'phone' | 'website' | 'social';
    referrer?: string;
}
export interface BusinessContactedEvent extends IntegrationEvent<BusinessContactedData> {
    type: 'business.contacted';
}
export interface ProductViewedData {
    businessId: string;
    productId: string;
    ownerId: string;
    viewerId: string;
    viewDuration?: number;
    referrer?: string;
}
export interface ProductViewedEvent extends IntegrationEvent<ProductViewedData> {
    type: 'business.product_viewed';
}
export interface BusinessRecommendedData {
    businessId: string;
    ownerId: string;
    recommendedTo: string;
    algorithm: string;
    score: number;
    factors: string[];
}
export interface BusinessRecommendedEvent extends IntegrationEvent<BusinessRecommendedData> {
    type: 'business.recommended';
}
export type BusinessDomainEvent = BusinessRegisteredEvent | BusinessProfileUpdatedEvent | BusinessStatusChangedEvent | BusinessVerificationSubmittedEvent | BusinessVerifiedEvent | BusinessVerificationRejectedEvent | ProductAddedEvent | ProductUpdatedEvent | ProductRemovedEvent | BusinessReviewedEvent | ProductReviewedEvent | ReviewRespondedEvent;
export type BusinessIntegrationEvent = BusinessViewedEvent | BusinessContactedEvent | ProductViewedEvent | BusinessRecommendedEvent;
export type BusinessEvent = BusinessDomainEvent | BusinessIntegrationEvent;
