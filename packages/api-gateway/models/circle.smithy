$version: "2"

namespace com.madmall.api

/// Circle types for categorization
enum CircleType {
    SUPPORT_GROUP = "support_group"
    INTEREST_BASED = "interest_based"
    LOCATION_BASED = "location_based"
    DIAGNOSIS_STAGE = "diagnosis_stage"
    WELLNESS_FOCUS = "wellness_focus"
    CULTURAL_AFFINITY = "cultural_affinity"
}

/// Circle member roles
enum CircleMemberRole {
    MEMBER = "member"
    MODERATOR = "moderator"
    ADMIN = "admin"
    FOUNDER = "founder"
}

/// Circle member status
enum CircleMemberStatus {
    ACTIVE = "active"
    PENDING = "pending"
    INACTIVE = "inactive"
    BANNED = "banned"
}

/// Circle privacy levels
enum CirclePrivacyLevel {
    PUBLIC = "public"
    PRIVATE = "private"
    INVITE_ONLY = "invite_only"
    CLOSED = "closed"
}

/// Meeting frequency options
enum MeetingFrequency {
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"
    AS_NEEDED = "as_needed"
}

/// Moderation levels
enum ModerationLevel {
    LIGHT = "light"
    MODERATE = "moderate"
    STRICT = "strict"
}

/// Meeting schedule information
structure MeetingSchedule {
    @required
    frequency: MeetingFrequency
    
    /// Day of week (0-6, Sunday=0)
    @range(min: 0, max: 6)
    dayOfWeek: Integer
    
    /// Time in HH:MM format
    @pattern("^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    time: String
    
    timezone: String
}

/// Circle configuration settings
structure CircleSettings {
    @required
    isPrivate: Boolean
    
    @required
    requireApproval: Boolean
    
    /// Maximum number of members (null = unlimited)
    @range(min: 1, max: 10000)
    maxMembers: Integer
    
    culturalFocus: StringList
    
    @required
    allowGuestPosts: Boolean
    
    @required
    moderationLevel: ModerationLevel
    
    contentGuidelines: String
    
    meetingSchedule: MeetingSchedule
}

/// Circle member information
structure CircleMember {
    @required
    userId: Id
    
    @required
    role: CircleMemberRole
    
    @required
    status: CircleMemberStatus
    
    @required
    joinedAt: DateTime
    
    @required
    lastActive: DateTime
    
    @required
    contributionScore: Integer
    
    @required
    badges: StringList
    
    notes: String
}

/// Circle engagement statistics
structure CircleStats {
    @required
    memberCount: Integer
    
    @required
    activeMembers: Integer
    
    @required
    postsThisWeek: Integer
    
    @required
    postsThisMonth: Integer
    
    @required
    @range(min: 0.0, max: 1.0)
    engagementRate: Float
    
    @required
    averageResponseTime: Integer
}

/// Complete circle entity
structure Circle {
    @required
    id: Id
    
    @required
    name: String
    
    @required
    description: String
    
    @required
    type: CircleType
    
    @required
    privacyLevel: CirclePrivacyLevel
    
    @required
    settings: CircleSettings
    
    @required
    members: CircleMemberList
    
    @required
    moderators: StringList
    
    @required
    tags: StringList
    
    coverImage: Url
    
    @required
    stats: CircleStats
    
    @required
    createdBy: Id
    
    @required
    createdAt: DateTime
    
    @required
    updatedAt: DateTime
    
    @required
    isActive: Boolean
}

/// Circle creation input
structure CreateCircleInput {
    @required
    name: String
    
    @required
    description: String
    
    @required
    type: CircleType
    
    @required
    privacyLevel: CirclePrivacyLevel
    
    @required
    settings: CircleSettingsInput
    
    tags: StringList
    
    coverImage: Url
}

/// Circle settings input
structure CircleSettingsInput {
    @required
    isPrivate: Boolean
    
    @required
    requireApproval: Boolean
    
    @range(min: 1, max: 10000)
    maxMembers: Integer
    
    culturalFocus: StringList
    
    @required
    allowGuestPosts: Boolean
    
    @required
    moderationLevel: ModerationLevel
    
    contentGuidelines: String
    
    meetingSchedule: MeetingScheduleInput
}

/// Meeting schedule input
structure MeetingScheduleInput {
    @required
    frequency: MeetingFrequency
    
    @range(min: 0, max: 6)
    dayOfWeek: Integer
    
    @pattern("^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    time: String
    
    timezone: String
}

/// Circle update input
structure UpdateCircleInput {
    name: String
    description: String
    type: CircleType
    privacyLevel: CirclePrivacyLevel
    settings: CircleSettingsInput
    tags: StringList
    coverImage: Url
}

/// Circle join input
structure JoinCircleInput {
    message: String
}

/// Circle creation response
structure CreateCircleResponse {
    @required
    circle: Circle
    
    @required
    message: String = "Circle created successfully"
}

/// Circle retrieval response
structure GetCircleResponse {
    @required
    circle: Circle
}

/// Circle update response
structure UpdateCircleResponse {
    @required
    circle: Circle
    
    @required
    message: String = "Circle updated successfully"
}

/// Circle deletion response
structure DeleteCircleResponse {
    @required
    success: Boolean = true
    
    @required
    message: String = "Circle deleted successfully"
}

/// Circle join response
structure JoinCircleResponse {
    @required
    success: Boolean = true
    
    @required
    message: String
    
    /// Whether approval is required
    @required
    requiresApproval: Boolean
}

/// Circle leave response
structure LeaveCircleResponse {
    @required
    success: Boolean = true
    
    @required
    message: String = "Left circle successfully"
}

/// Circle members response
structure GetCircleMembersResponse {
    @required
    members: CircleMemberList
    
    pagination: PaginationOutput
}

/// Lists
list CircleMemberList {
    member: CircleMember
}

list CircleList {
    member: Circle
}

// Circle Operations

/// Create a new circle
@http(method: "POST", uri: "/circles")
operation CreateCircle {
    input: CreateCircleInput
    output: CreateCircleResponse
    errors: [ValidationError, UnauthorizedError, ConflictError, InternalServerError]
}

/// Get circle by ID
@http(method: "GET", uri: "/circles/{circleId}")
@readonly
operation GetCircle {
    input := {
        @httpLabel
        @required
        circleId: Id
    }
    output: GetCircleResponse
    errors: [NotFoundError, UnauthorizedError, ForbiddenError, InternalServerError]
}

/// Update circle information
@http(method: "PUT", uri: "/circles/{circleId}")
operation UpdateCircle {
    input := for UpdateCircleInput {
        @httpLabel
        @required
        circleId: Id
    }
    output: UpdateCircleResponse
    errors: [ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, InternalServerError]
}

/// Delete circle
@http(method: "DELETE", uri: "/circles/{circleId}")
@idempotent
operation DeleteCircle {
    input := {
        @httpLabel
        @required
        circleId: Id
    }
    output: DeleteCircleResponse
    errors: [NotFoundError, UnauthorizedError, ForbiddenError, InternalServerError]
}

/// Join a circle
@http(method: "POST", uri: "/circles/{circleId}/join")
operation JoinCircle {
    input := for JoinCircleInput {
        @httpLabel
        @required
        circleId: Id
    }
    output: JoinCircleResponse
    errors: [ValidationError, NotFoundError, UnauthorizedError, ConflictError, InternalServerError]
}

/// Leave a circle
@http(method: "POST", uri: "/circles/{circleId}/leave")
@idempotent
operation LeaveCircle {
    input := {
        @httpLabel
        @required
        circleId: Id
    }
    output: LeaveCircleResponse
    errors: [NotFoundError, UnauthorizedError, ForbiddenError, InternalServerError]
}

/// Get circle members
@http(method: "GET", uri: "/circles/{circleId}/members")
@readonly
operation GetCircleMembers {
    input := for PaginationInput {
        @httpLabel
        @required
        circleId: Id
        
        @httpQuery("limit")
        limit: Integer
        
        @httpQuery("nextToken")
        nextToken: String
    }
    output: GetCircleMembersResponse
    errors: [NotFoundError, UnauthorizedError, ForbiddenError, InternalServerError]
}