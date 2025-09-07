$version: "2"

namespace com.madmall.api

/// Timestamp in ISO 8601 format
@timestampFormat("date-time")
timestamp DateTime

/// Unique identifier string
@pattern("^[a-zA-Z0-9_-]+$")
string Id

/// Email address
@pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")
string Email

/// URL string
@pattern("^https?://[^\\s/$.?#].[^\\s]*$")
string Url

/// Pagination parameters
structure PaginationInput {
    /// Maximum number of items to return (1-100)
    @range(min: 1, max: 100)
    limit: Integer = 10
    
    /// Token for next page of results
    nextToken: String
}

/// Pagination metadata in responses
structure PaginationOutput {
    /// Token for next page of results
    nextToken: String
    
    /// Total number of items available
    totalCount: Long
    
    /// Number of items in current page
    itemCount: Integer
}

/// Standard success response wrapper
structure SuccessResponse {
    @required
    success: Boolean = true
    
    @required
    message: String
    
    /// Request timestamp
    @required
    timestamp: DateTime
}

/// Content interaction types
enum InteractionType {
    LIKE = "like"
    UNLIKE = "unlike"
    SAVE = "save"
    UNSAVE = "unsave"
    SHARE = "share"
    REPORT = "report"
    HELPFUL = "helpful"
    NOT_HELPFUL = "not_helpful"
}

/// Content types for interactions and search
enum ContentType {
    STORY = "story"
    DISCUSSION = "discussion"
    RESOURCE = "resource"
    PRODUCT = "product"
    BUSINESS = "business"
    COMEDY = "comedy"
    USER = "user"
    CIRCLE = "circle"
}

/// Search result item
structure SearchResultItem {
    @required
    id: Id
    
    @required
    type: ContentType
    
    @required
    title: String
    
    description: String
    
    /// Relevance score (0.0 to 1.0)
    @range(min: 0.0, max: 1.0)
    score: Float
    
    /// Additional metadata specific to content type
    metadata: Document
    
    /// URL to access the content
    url: String
    
    /// Thumbnail or preview image
    thumbnail: Url
    
    @required
    createdAt: DateTime
    
    @required
    updatedAt: DateTime
}

/// Generic metadata document
document Document