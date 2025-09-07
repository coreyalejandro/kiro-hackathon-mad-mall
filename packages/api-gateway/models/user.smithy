$version: "2"

namespace com.madmall.api

/// User diagnosis stage
enum DiagnosisStage {
    NEWLY_DIAGNOSED = "newly_diagnosed"
    ADJUSTING = "adjusting"
    MANAGING_WELL = "managing_well"
    EXPERIENCED = "experienced"
    COMPLICATIONS = "complications"
    REMISSION = "remission"
}

/// User communication style preference
enum CommunicationStyle {
    DIRECT_SUPPORTIVE = "direct_supportive"
    GENTLE_ENCOURAGING = "gentle_encouraging"
    HUMOR_BASED = "humor_based"
    SPIRITUAL_GROUNDED = "spiritual_grounded"
    NO_PREFERENCE = "no_preference"
}

/// Profile visibility settings
enum ProfileVisibility {
    PUBLIC = "public"
    CIRCLES_ONLY = "circles_only"
    PRIVATE = "private"
}

/// User goals on the platform
enum UserGoal {
    EMOTIONAL_SUPPORT = "emotional_support"
    HEALTH_EDUCATION = "health_education"
    COMMUNITY_CONNECTION = "community_connection"
    STRESS_RELIEF = "stress_relief"
    SHARE_STORY = "share_story"
    HEALTHCARE_ADVOCACY = "healthcare_advocacy"
    WELLNESS_PRODUCTS = "wellness_products"
}

/// Support needs categories
enum SupportNeed {
    NEWLY_DIAGNOSED_SUPPORT = "newly_diagnosed_support"
    ANXIETY_MANAGEMENT = "anxiety_management"
    MEDICATION_MANAGEMENT = "medication_management"
    WORKPLACE_WELLNESS = "workplace_wellness"
    FAMILY_RELATIONSHIPS = "family_relationships"
    HEALTHCARE_ADVOCACY = "healthcare_advocacy"
    NUTRITION_LIFESTYLE = "nutrition_lifestyle"
    SELF_CARE = "self_care"
}

/// User location information
structure UserLocation {
    city: String
    state: String
    country: String
}

/// User profile information
structure UserProfile {
    @required
    firstName: String
    
    @required
    lastName: String
    
    bio: String
    
    @required
    culturalBackground: StringList
    
    @required
    communicationStyle: CommunicationStyle
    
    @required
    diagnosisStage: DiagnosisStage
    
    @required
    supportNeeds: SupportNeedList
    
    location: UserLocation
    
    @required
    joinDate: DateTime
    
    @required
    lastActive: DateTime
}

/// User preferences and settings
structure UserPreferences {
    @required
    profileVisibility: ProfileVisibility
    
    @required
    showRealName: Boolean
    
    @required
    allowDirectMessages: Boolean
    
    @required
    shareHealthJourney: Boolean
    
    @required
    emailNotifications: Boolean
    
    @required
    pushNotifications: Boolean
    
    @required
    weeklyDigest: Boolean
    
    @required
    circleNotifications: Boolean
    
    @required
    contentPreferences: StringList
    
    @required
    circleInterests: StringList
}

/// User accessibility settings
structure AccessibilitySettings {
    @required
    highContrast: Boolean
    
    @required
    largeText: Boolean
    
    @required
    screenReader: Boolean
    
    @required
    reducedMotion: Boolean
}

/// User application settings
structure UserSettings {
    @required
    theme: String
    
    @required
    language: String
    
    @required
    timezone: String
    
    @required
    accessibility: AccessibilitySettings
}

/// User statistics
structure UserStats {
    @required
    storiesShared: Integer
    
    @required
    circlesJoined: Integer
    
    @required
    commentsPosted: Integer
    
    @required
    helpfulVotes: Integer
    
    @required
    daysActive: Integer
    
    @required
    streakDays: Integer
}

/// Complete user entity
structure User {
    @required
    id: Id
    
    @required
    email: Email
    
    @required
    profile: UserProfile
    
    @required
    preferences: UserPreferences
    
    @required
    settings: UserSettings
    
    @required
    primaryGoals: UserGoalList
    
    @required
    isVerified: Boolean
    
    @required
    isActive: Boolean
    
    @required
    createdAt: DateTime
    
    @required
    updatedAt: DateTime
    
    @required
    version: Integer
    
    stats: UserStats
}

/// User creation input
structure CreateUserInput {
    @required
    email: Email
    
    @required
    profile: UserProfileInput
    
    preferences: UserPreferencesInput
    
    settings: UserSettingsInput
    
    primaryGoals: UserGoalList
}

/// User profile input for creation/updates
structure UserProfileInput {
    @required
    firstName: String
    
    @required
    lastName: String
    
    bio: String
    
    @required
    culturalBackground: StringList
    
    @required
    communicationStyle: CommunicationStyle
    
    @required
    diagnosisStage: DiagnosisStage
    
    @required
    supportNeeds: SupportNeedList
    
    location: UserLocation
}

/// User preferences input
structure UserPreferencesInput {
    profileVisibility: ProfileVisibility = "CIRCLES_ONLY"
    showRealName: Boolean = true
    allowDirectMessages: Boolean = true
    shareHealthJourney: Boolean = false
    emailNotifications: Boolean = true
    pushNotifications: Boolean = true
    weeklyDigest: Boolean = true
    circleNotifications: Boolean = true
    contentPreferences: StringList
    circleInterests: StringList
}

/// User settings input
structure UserSettingsInput {
    theme: String = "auto"
    language: String = "en"
    timezone: String = "UTC"
    accessibility: AccessibilitySettingsInput
}

/// Accessibility settings input
structure AccessibilitySettingsInput {
    highContrast: Boolean = false
    largeText: Boolean = false
    screenReader: Boolean = false
    reducedMotion: Boolean = false
}

/// User update input
structure UpdateUserInput {
    profile: UserProfileInput
    preferences: UserPreferencesInput
    settings: UserSettingsInput
    primaryGoals: UserGoalList
}

/// User creation response
structure CreateUserResponse {
    @required
    user: User
    
    @required
    message: String = "User created successfully"
}

/// User retrieval response
structure GetUserResponse {
    @required
    user: User
}

/// User update response
structure UpdateUserResponse {
    @required
    user: User
    
    @required
    message: String = "User updated successfully"
}

/// User deletion response
structure DeleteUserResponse {
    @required
    success: Boolean = true
    
    @required
    message: String = "User deleted successfully"
}

/// User profiles list response
structure GetUserProfilesResponse {
    @required
    users: UserList
    
    pagination: PaginationOutput
}

/// Lists
list StringList {
    member: String
}

list SupportNeedList {
    member: SupportNeed
}

list UserGoalList {
    member: UserGoal
}

list UserList {
    member: User
}

// User Operations

/// Create a new user
@http(method: "POST", uri: "/users")
operation CreateUser {
    input: CreateUserInput
    output: CreateUserResponse
    errors: [ValidationError, ConflictError, InternalServerError]
}

/// Get user by ID
@http(method: "GET", uri: "/users/{userId}")
@readonly
operation GetUser {
    input := {
        @httpLabel
        @required
        userId: Id
    }
    output: GetUserResponse
    errors: [NotFoundError, UnauthorizedError, InternalServerError]
}

/// Update user information
@http(method: "PUT", uri: "/users/{userId}")
operation UpdateUser {
    input := for UpdateUserInput {
        @httpLabel
        @required
        userId: Id
    }
    output: UpdateUserResponse
    errors: [ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, InternalServerError]
}

/// Delete user account
@http(method: "DELETE", uri: "/users/{userId}")
@idempotent
operation DeleteUser {
    input := {
        @httpLabel
        @required
        userId: Id
    }
    output: DeleteUserResponse
    errors: [NotFoundError, UnauthorizedError, ForbiddenError, InternalServerError]
}

/// Get list of user profiles
@http(method: "GET", uri: "/users")
@readonly
operation GetUserProfiles {
    input := for PaginationInput {
        @httpQuery("limit")
        limit: Integer
        
        @httpQuery("nextToken")
        nextToken: String
    }
    output: GetUserProfilesResponse
    errors: [ValidationError, UnauthorizedError, InternalServerError]
}