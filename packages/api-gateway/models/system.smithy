$version: "2"

namespace com.madmall.api

/// System health status
enum HealthStatus {
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
}

/// Community statistics
structure CommunityStats {
    @required
    totalUsers: Integer
    
    @required
    activeUsers: Integer
    
    @required
    totalCircles: Integer
    
    @required
    totalStories: Integer
    
    @required
    totalBusinesses: Integer
    
    @required
    totalProducts: Integer
    
    @required
    storiesThisWeek: Integer
    
    @required
    newMembersThisWeek: Integer
    
    @required
    engagementRate: Float
    
    @required
    averageSessionTime: Integer
}

/// Today's highlights for dashboard
structure TodaysHighlights {
    @required
    featuredStory: Story
    
    @required
    trendingCircle: Circle
    
    @required
    newBusinessSpotlight: Business
    
    @required
    communityMilestone: String
    
    @required
    dailyWellnessTip: String
    
    @required
    upcomingEvents: EventList
}

/// Community event information
structure CommunityEvent {
    @required
    id: Id
    
    @required
    title: String
    
    @required
    description: String
    
    @required
    type: String
    
    @required
    startTime: DateTime
    
    endTime: DateTime
    
    @required
    organizer: String
    
    circleId: Id
    
    @required
    isVirtual: Boolean
    
    location: String
    
    @required
    maxAttendees: Integer
    
    @required
    currentAttendees: Integer
}

/// Discussion topic
structure Discussion {
    @required
    id: Id
    
    @required
    title: String
    
    @required
    content: String
    
    @required
    author: StoryAuthor
    
    @required
    circleId: Id
    
    @required
    tags: StringList
    
    @required
    replies: Integer
    
    @required
    lastActivity: DateTime
    
    @required
    isPinned: Boolean
    
    @required
    isLocked: Boolean
    
    @required
    moderationStatus: ContentModerationStatus
    
    @required
    createdAt: DateTime
    
    @required
    updatedAt: DateTime
}

/// Resource article
structure Resource {
    @required
    id: Id
    
    @required
    title: String
    
    @required
    content: String
    
    @required
    excerpt: String
    
    @required
    author: StoryAuthor
    
    @required
    category: String
    
    @required
    tags: StringList
    
    @required
    readTime: Integer
    
    @required
    difficulty: String
    
    @required
    culturalRelevance: StringList
    
    @required
    therapeuticValue: StringList
    
    @required
    views: Integer
    
    @required
    saves: Integer
    
    @required
    helpfulVotes: Integer
    
    @required
    isFeatured: Boolean
    
    @required
    publishedAt: DateTime
    
    @required
    createdAt: DateTime
    
    @required
    updatedAt: DateTime
}

/// Comedy content
structure ComedyContent {
    @required
    id: Id
    
    @required
    title: String
    
    @required
    content: String
    
    @required
    author: StoryAuthor
    
    @required
    category: String
    
    @required
    tags: StringList
    
    @required
    contentType: String
    
    @required
    culturalStyle: String
    
    @required
    appropriatenessRating: String
    
    @required
    likes: Integer
    
    @required
    shares: Integer
    
    @required
    views: Integer
    
    @required
    isFeatured: Boolean
    
    @required
    publishedAt: DateTime
    
    @required
    createdAt: DateTime
    
    @required
    updatedAt: DateTime
}

/// Content interaction request
structure ContentInteractionInput {
    @required
    contentId: Id
    
    @required
    action: InteractionType
    
    @required
    contentType: ContentType
}

/// Content interaction response
structure ContentInteractionResponse {
    @required
    success: Boolean = true
    
    @required
    message: String
    
    /// Updated interaction counts
    updatedCounts: Document
}

/// Search request
structure SearchInput {
    @required
    @httpQuery("q")
    query: String
    
    @httpQuery("type")
    type: ContentType = "ALL"
    
    @httpQuery("limit")
    @range(min: 1, max: 100)
    limit: Integer = 20
    
    @httpQuery("offset")
    @range(min: 0)
    offset: Integer = 0
}

/// Search response
structure SearchResponse {
    @required
    results: SearchResultList
    
    @required
    totalCount: Integer
    
    @required
    query: String
    
    @required
    searchTime: Float
    
    /// Search suggestions for better results
    suggestions: StringList
}

/// Recommendations request
structure GetRecommendationsInput {
    @httpQuery("userId")
    userId: Id = "default"
    
    @httpQuery("type")
    type: ContentType = "ALL"
    
    @httpQuery("limit")
    @range(min: 1, max: 20)
    limit: Integer = 5
}

/// Recommendations response
structure GetRecommendationsResponse {
    @required
    recommendations: SearchResultList
    
    @required
    recommendationType: String
    
    @required
    confidence: Float
}

/// Categories request
structure GetCategoriesInput {
    @httpLabel
    @required
    contentType: String
}

/// Categories response
structure GetCategoriesResponse {
    @required
    categories: StringList
    
    @required
    contentType: String
}

/// Health check response
structure GetHealthResponse {
    @required
    status: HealthStatus
    
    @required
    message: String
    
    @required
    timestamp: DateTime
    
    @required
    dataInitialized: Boolean
    
    /// Service component health
    services: Document
}

/// Community stats response
structure GetStatsResponse {
    @required
    stats: CommunityStats
    
    @required
    timestamp: DateTime
}

/// Today's highlights response
structure GetHighlightsResponse {
    @required
    highlights: TodaysHighlights
    
    @required
    timestamp: DateTime
}

/// Discussions list response
structure GetDiscussionsResponse {
    @required
    discussions: DiscussionList
    
    pagination: PaginationOutput
}

/// Active discussions response
structure GetActiveDiscussionsResponse {
    @required
    discussions: DiscussionList
}

/// Discussion creation input
structure CreateDiscussionInput {
    @required
    title: String
    
    @required
    content: String
    
    @required
    circleId: Id
    
    tags: StringList
}

/// Discussion creation response
structure CreateDiscussionResponse {
    @required
    discussion: Discussion
    
    @required
    message: String = "Discussion created successfully"
}

/// Resources list response
structure GetResourcesResponse {
    @required
    resources: ResourceList
    
    pagination: PaginationOutput
}

/// Featured resources response
structure GetFeaturedResourcesResponse {
    @required
    resources: ResourceList
}

/// Comedy content list response
structure GetComedyResponse {
    @required
    comedy: ComedyContentList
    
    pagination: PaginationOutput
}

/// Featured comedy response
structure GetFeaturedComedyResponse {
    @required
    comedy: ComedyContentList
}

/// Lists
list EventList {
    member: CommunityEvent
}

list DiscussionList {
    member: Discussion
}

list ResourceList {
    member: Resource
}

list ComedyContentList {
    member: ComedyContent
}

list SearchResultList {
    member: SearchResultItem
}

// System Operations

/// Health check endpoint
@http(method: "GET", uri: "/health")
@readonly
operation GetHealth {
    input := {}
    output: GetHealthResponse
}

/// Get community statistics
@http(method: "GET", uri: "/stats")
@readonly
operation GetStats {
    input := {}
    output: GetStatsResponse
    errors: [InternalServerError]
}

/// Get today's highlights
@http(method: "GET", uri: "/highlights")
@readonly
operation GetHighlights {
    input := {}
    output: GetHighlightsResponse
    errors: [InternalServerError]
}

// Discussion Operations

/// Get discussions
@http(method: "GET", uri: "/discussions")
@readonly
operation GetDiscussions {
    input := for PaginationInput {
        @httpQuery("limit")
        limit: Integer
        
        @httpQuery("nextToken")
        nextToken: String
        
        @httpQuery("circleId")
        circleId: Id
    }
    output: GetDiscussionsResponse
    errors: [ValidationError, UnauthorizedError, InternalServerError]
}

/// Get active discussions
@http(method: "GET", uri: "/discussions/active")
@readonly
operation GetActiveDiscussions {
    input := {
        @httpQuery("limit")
        @range(min: 1, max: 20)
        limit: Integer = 5
    }
    output: GetActiveDiscussionsResponse
    errors: [UnauthorizedError, InternalServerError]
}

/// Create a new discussion
@http(method: "POST", uri: "/discussions")
operation CreateDiscussion {
    input: CreateDiscussionInput
    output: CreateDiscussionResponse
    errors: [ValidationError, UnauthorizedError, ForbiddenError, InternalServerError]
}

// Resource Operations

/// Get resources
@http(method: "GET", uri: "/resources")
@readonly
operation GetResources {
    input := for PaginationInput {
        @httpQuery("limit")
        limit: Integer
        
        @httpQuery("nextToken")
        nextToken: String
        
        @httpQuery("category")
        category: String
    }
    output: GetResourcesResponse
    errors: [ValidationError, InternalServerError]
}

/// Get featured resources
@http(method: "GET", uri: "/resources/featured")
@readonly
operation GetFeaturedResources {
    input := {
        @httpQuery("limit")
        @range(min: 1, max: 20)
        limit: Integer = 4
    }
    output: GetFeaturedResourcesResponse
    errors: [InternalServerError]
}

// Comedy Operations

/// Get comedy content
@http(method: "GET", uri: "/comedy")
@readonly
operation GetComedy {
    input := for PaginationInput {
        @httpQuery("limit")
        limit: Integer
        
        @httpQuery("nextToken")
        nextToken: String
        
        @httpQuery("category")
        category: String
    }
    output: GetComedyResponse
    errors: [ValidationError, InternalServerError]
}

/// Get featured comedy content
@http(method: "GET", uri: "/comedy/featured")
@readonly
operation GetFeaturedComedy {
    input := {
        @httpQuery("limit")
        @range(min: 1, max: 20)
        limit: Integer = 3
    }
    output: GetFeaturedComedyResponse
    errors: [InternalServerError]
}

// Search and Recommendation Operations

/// Search across all content types
@http(method: "GET", uri: "/search")
@readonly
operation Search {
    input: SearchInput
    output: SearchResponse
    errors: [ValidationError, InternalServerError]
}

/// Get personalized recommendations
@http(method: "GET", uri: "/recommendations")
@readonly
operation GetRecommendations {
    input: GetRecommendationsInput
    output: GetRecommendationsResponse
    errors: [ValidationError, InternalServerError]
}

/// Get categories for content type
@http(method: "GET", uri: "/categories/{contentType}")
@readonly
operation GetCategories {
    input: GetCategoriesInput
    output: GetCategoriesResponse
    errors: [ValidationError, NotFoundError, InternalServerError]
}

// Interaction Operations

/// Interact with content (like, save, share, etc.)
@http(method: "POST", uri: "/interact")
operation InteractWithContent {
    input: ContentInteractionInput
    output: ContentInteractionResponse
    errors: [ValidationError, UnauthorizedError, NotFoundError, ConflictError, InternalServerError]
}