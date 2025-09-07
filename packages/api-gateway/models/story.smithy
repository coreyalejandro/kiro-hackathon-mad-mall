$version: "2"

namespace com.madmall.api

/// Story content types
enum StoryType {
    PERSONAL_EXPERIENCE = "personal_experience"
    MILESTONE_CELEBRATION = "milestone_celebration"
    CHALLENGE_OVERCOME = "challenge_overcome"
    ADVICE_SHARING = "advice_sharing"
    GRATITUDE_EXPRESSION = "gratitude_expression"
    AWARENESS_RAISING = "awareness_raising"
}

/// Story publication status
enum StoryStatus {
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    FLAGGED = "flagged"
    REMOVED = "removed"
}

/// Content moderation status
enum ContentModerationStatus {
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_REVIEW = "needs_review"
}

/// Story author information
structure StoryAuthor {
    @required
    id: Id
    
    @required
    displayName: String
    
    avatar: Url
    
    @required
    isVerified: Boolean
}

/// Story engagement metrics
structure StoryEngagement {
    @required
    likes: Integer
    
    @required
    comments: Integer
    
    @required
    shares: Integer
    
    @required
    saves: Integer
    
    @required
    views: Integer
    
    @required
    helpfulVotes: Integer
}

/// Story metadata and analytics
structure StoryMetadata {
    @required
    readTime: Integer
    
    @required
    wordCount: Integer
    
    @required
    culturalElements: StringList
    
    @required
    therapeuticValue: StringList
    
    triggerWarnings: StringList
    
    @required
    ageAppropriate: Boolean
}

/// Complete story entity
structure Story {
    @required
    id: Id
    
    @required
    title: String
    
    @required
    content: String
    
    excerpt: String
    
    @required
    author: StoryAuthor
    
    @required
    type: StoryType
    
    @required
    status: StoryStatus
    
    @required
    themes: StringList
    
    @required
    tags: StringList
    
    circleId: Id
    
    @required
    engagement: StoryEngagement
    
    @required
    metadata: StoryMetadata
    
    @required
    moderationStatus: ContentModerationStatus
    
    moderationNotes: String
    
    featuredAt: DateTime
    
    publishedAt: DateTime
    
    @required
    createdAt: DateTime
    
    @required
    updatedAt: DateTime
}

/// Story comment structure
structure StoryComment {
    @required
    id: Id
    
    @required
    storyId: Id
    
    @required
    author: StoryAuthor
    
    @required
    content: String
    
    parentCommentId: Id
    
    @required
    likes: Integer
    
    @required
    replies: StoryCommentList
    
    @required
    isEdited: Boolean
    
    @required
    moderationStatus: ContentModerationStatus
    
    @required
    createdAt: DateTime
    
    @required
    updatedAt: DateTime
}

/// Story creation input
structure CreateStoryInput {
    @required
    title: String
    
    @required
    content: String
    
    excerpt: String
    
    @required
    type: StoryType
    
    themes: StringList
    
    tags: StringList
    
    circleId: Id
    
    /// Whether to publish immediately or save as draft
    publish: Boolean = false
}

/// Story update input
structure UpdateStoryInput {
    title: String
    content: String
    excerpt: String
    type: StoryType
    themes: StringList
    tags: StringList
    circleId: Id
    status: StoryStatus
}

/// Story creation response
structure CreateStoryResponse {
    @required
    story: Story
    
    @required
    message: String = "Story created successfully"
}

/// Story retrieval response
structure GetStoryResponse {
    @required
    story: Story
}

/// Story update response
structure UpdateStoryResponse {
    @required
    story: Story
    
    @required
    message: String = "Story updated successfully"
}

/// Story deletion response
structure DeleteStoryResponse {
    @required
    success: Boolean = true
    
    @required
    message: String = "Story deleted successfully"
}

/// Stories list response
structure GetStoriesResponse {
    @required
    stories: StoryList
    
    pagination: PaginationOutput
}

/// Featured stories response
structure GetFeaturedStoriesResponse {
    @required
    stories: StoryList
}

/// Lists
list StoryList {
    member: Story
}

list StoryCommentList {
    member: StoryComment
}

// Story Operations

/// Create a new story
@http(method: "POST", uri: "/stories")
operation CreateStory {
    input: CreateStoryInput
    output: CreateStoryResponse
    errors: [ValidationError, UnauthorizedError, InternalServerError]
}

/// Get story by ID
@http(method: "GET", uri: "/stories/{storyId}")
@readonly
operation GetStory {
    input := {
        @httpLabel
        @required
        storyId: Id
    }
    output: GetStoryResponse
    errors: [NotFoundError, UnauthorizedError, ForbiddenError, InternalServerError]
}

/// Update story
@http(method: "PUT", uri: "/stories/{storyId}")
operation UpdateStory {
    input := for UpdateStoryInput {
        @httpLabel
        @required
        storyId: Id
    }
    output: UpdateStoryResponse
    errors: [ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, InternalServerError]
}

/// Delete story
@http(method: "DELETE", uri: "/stories/{storyId}")
@idempotent
operation DeleteStory {
    input := {
        @httpLabel
        @required
        storyId: Id
    }
    output: DeleteStoryResponse
    errors: [NotFoundError, UnauthorizedError, ForbiddenError, InternalServerError]
}

/// Get list of stories
@http(method: "GET", uri: "/stories")
@readonly
operation GetStories {
    input := for PaginationInput {
        @httpQuery("limit")
        limit: Integer
        
        @httpQuery("nextToken")
        nextToken: String
        
        @httpQuery("circleId")
        circleId: Id
        
        @httpQuery("type")
        type: StoryType
        
        @httpQuery("status")
        status: StoryStatus
    }
    output: GetStoriesResponse
    errors: [ValidationError, UnauthorizedError, InternalServerError]
}

/// Get featured stories
@http(method: "GET", uri: "/stories/featured")
@readonly
operation GetFeaturedStories {
    input := {
        @httpQuery("limit")
        @range(min: 1, max: 20)
        limit: Integer = 3
    }
    output: GetFeaturedStoriesResponse
    errors: [UnauthorizedError, InternalServerError]
}