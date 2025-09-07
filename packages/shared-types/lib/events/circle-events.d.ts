/**
 * Circle Domain Events
 * Events related to peer circles and community activities
 */
import { DomainEvent, IntegrationEvent } from './base';
import { Circle } from '../domain/circle';
export interface CircleCreatedEvent extends DomainEvent<{
    circleId: string;
    name: string;
    description: string;
    type: string;
    createdBy: string;
    settings: Circle['settings'];
    tags: string[];
}> {
    type: 'circle.created';
}
export interface CircleUpdatedEvent extends DomainEvent<{
    circleId: string;
    updatedBy: string;
    previousData: Partial<Circle>;
    newData: Partial<Circle>;
    changedFields: string[];
}> {
    type: 'circle.updated';
}
export interface CircleArchivedEvent extends DomainEvent<{
    circleId: string;
    archivedBy: string;
    reason?: string;
    archivedAt: string;
}> {
    type: 'circle.archived';
}
export interface CircleRestoredEvent extends DomainEvent<{
    circleId: string;
    restoredBy: string;
    restoredAt: string;
}> {
    type: 'circle.restored';
}
export interface CircleDeletedEvent extends DomainEvent<{
    circleId: string;
    deletedBy: string;
    reason: string;
    memberCount: number;
    deletedAt: string;
}> {
    type: 'circle.deleted';
}
export interface CircleMemberJoinedEvent extends DomainEvent<{
    circleId: string;
    userId: string;
    role: 'member' | 'moderator' | 'admin';
    joinMethod: 'direct' | 'invitation' | 'approval';
    invitedBy?: string;
    approvedBy?: string;
    joinedAt: string;
}> {
    type: 'circle.member_joined';
}
export interface CircleMemberLeftEvent extends DomainEvent<{
    circleId: string;
    userId: string;
    leftMethod: 'voluntary' | 'removed' | 'banned';
    removedBy?: string;
    reason?: string;
    leftAt: string;
}> {
    type: 'circle.member_left';
}
export interface CircleMemberRoleChangedEvent extends DomainEvent<{
    circleId: string;
    userId: string;
    previousRole: string;
    newRole: string;
    changedBy: string;
    reason?: string;
    changedAt: string;
}> {
    type: 'circle.member_role_changed';
}
export interface CircleMemberBannedEvent extends DomainEvent<{
    circleId: string;
    userId: string;
    bannedBy: string;
    reason: string;
    duration?: number;
    bannedAt: string;
    expiresAt?: string;
}> {
    type: 'circle.member_banned';
}
export interface CircleMemberUnbannedEvent extends DomainEvent<{
    circleId: string;
    userId: string;
    unbannedBy: string;
    unbannedAt: string;
}> {
    type: 'circle.member_unbanned';
}
export interface CircleInvitationSentEvent extends IntegrationEvent<{
    invitationId: string;
    circleId: string;
    inviterId: string;
    inviteeId?: string;
    inviteeEmail?: string;
    message?: string;
    expiresAt: string;
    sentAt: string;
}> {
    type: 'circle.invitation_sent';
}
export interface CircleInvitationAcceptedEvent extends DomainEvent<{
    invitationId: string;
    circleId: string;
    inviterId: string;
    inviteeId: string;
    acceptedAt: string;
}> {
    type: 'circle.invitation_accepted';
}
export interface CircleInvitationDeclinedEvent extends DomainEvent<{
    invitationId: string;
    circleId: string;
    inviterId: string;
    inviteeId: string;
    declinedAt: string;
    message?: string;
}> {
    type: 'circle.invitation_declined';
}
export interface CircleInvitationExpiredEvent extends IntegrationEvent<{
    invitationId: string;
    circleId: string;
    inviterId: string;
    inviteeId?: string;
    inviteeEmail?: string;
    expiredAt: string;
}> {
    type: 'circle.invitation_expired';
}
export interface CircleJoinRequestedEvent extends IntegrationEvent<{
    requestId: string;
    circleId: string;
    userId: string;
    message?: string;
    requestedAt: string;
}> {
    type: 'circle.join_requested';
}
export interface CircleJoinRequestApprovedEvent extends DomainEvent<{
    requestId: string;
    circleId: string;
    userId: string;
    approvedBy: string;
    approvedAt: string;
    message?: string;
}> {
    type: 'circle.join_request_approved';
}
export interface CircleJoinRequestRejectedEvent extends DomainEvent<{
    requestId: string;
    circleId: string;
    userId: string;
    rejectedBy: string;
    rejectedAt: string;
    reason?: string;
}> {
    type: 'circle.join_request_rejected';
}
export interface CircleActivityEvent extends IntegrationEvent<{
    circleId: string;
    userId: string;
    activityType: 'post_created' | 'comment_posted' | 'member_helped' | 'resource_shared';
    entityId?: string;
    entityType?: string;
    metadata?: Record<string, any>;
}> {
    type: 'circle.activity';
}
export interface CircleMilestoneAchievedEvent extends IntegrationEvent<{
    circleId: string;
    milestone: 'first_member' | 'ten_members' | 'hundred_members' | 'first_post' | 'active_week' | 'active_month';
    achievedAt: string;
    currentValue: number;
    metadata?: Record<string, any>;
}> {
    type: 'circle.milestone_achieved';
}
export interface CircleReportedEvent extends IntegrationEvent<{
    circleId: string;
    reporterId: string;
    reason: string;
    description?: string;
    evidence?: string[];
    reportedAt: string;
}> {
    type: 'circle.reported';
}
export interface CircleModeratedEvent extends DomainEvent<{
    circleId: string;
    moderatorId: string;
    action: 'featured' | 'unfeatured' | 'suspended' | 'restored' | 'archived';
    reason: string;
    duration?: number;
    effectiveUntil?: string;
    notes?: string;
}> {
    type: 'circle.moderated';
}
export interface CircleFeaturedEvent extends IntegrationEvent<{
    circleId: string;
    featuredBy: string;
    featuredAt: string;
    featuredUntil?: string;
    reason?: string;
}> {
    type: 'circle.featured';
}
export interface CircleUnfeaturedEvent extends IntegrationEvent<{
    circleId: string;
    unfeaturedBy: string;
    unfeaturedAt: string;
    reason?: string;
}> {
    type: 'circle.unfeatured';
}
export type CircleEvent = CircleCreatedEvent | CircleUpdatedEvent | CircleArchivedEvent | CircleRestoredEvent | CircleDeletedEvent | CircleMemberJoinedEvent | CircleMemberLeftEvent | CircleMemberRoleChangedEvent | CircleMemberBannedEvent | CircleMemberUnbannedEvent | CircleInvitationSentEvent | CircleInvitationAcceptedEvent | CircleInvitationDeclinedEvent | CircleInvitationExpiredEvent | CircleJoinRequestedEvent | CircleJoinRequestApprovedEvent | CircleJoinRequestRejectedEvent | CircleActivityEvent | CircleMilestoneAchievedEvent | CircleReportedEvent | CircleModeratedEvent | CircleFeaturedEvent | CircleUnfeaturedEvent;
//# sourceMappingURL=circle-events.d.ts.map