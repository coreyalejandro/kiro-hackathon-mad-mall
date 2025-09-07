$version: "2"

namespace com.madmall.api

use aws.protocols#restJson1
use aws.auth#sigv4
use smithy.framework#ValidationException

/// MADMall Social Wellness Platform API
/// Enterprise-grade API for social wellness community platform
@restJson1
@sigv4(name: "execute-api")
@title("MADMall Social Wellness Platform API")
@documentation("Enterprise-grade API for the MADMall social wellness platform providing user management, peer circles, story sharing, and business marketplace functionality.")
service MADMallAPI {
    version: "1.0"
    operations: [
        // Health and System
        GetHealth
        GetStats
        GetHighlights
        
        // User Operations
        CreateUser
        GetUser
        UpdateUser
        DeleteUser
        GetUserProfiles
        
        // Circle Operations
        CreateCircle
        GetCircle
        UpdateCircle
        DeleteCircle
        JoinCircle
        LeaveCircle
        GetCircleMembers
        
        // Story Operations
        CreateStory
        GetStory
        UpdateStory
        DeleteStory
        GetStories
        GetFeaturedStories
        
        // Business Operations
        CreateBusiness
        GetBusiness
        UpdateBusiness
        DeleteBusiness
        GetBusinesses
        GetFeaturedBusinesses
        
        // Product Operations
        CreateProduct
        GetProduct
        UpdateProduct
        DeleteProduct
        GetProducts
        GetFeaturedProducts
        
        // Discussion Operations
        GetDiscussions
        GetActiveDiscussions
        CreateDiscussion
        
        // Resource Operations
        GetResources
        GetFeaturedResources
        
        // Comedy Operations
        GetComedy
        GetFeaturedComedy
        
        // Search and Recommendations
        Search
        GetRecommendations
        GetCategories
        
        // Interactions
        InteractWithContent
    ]
    errors: [
        ValidationError
        UnauthorizedError
        ForbiddenError
        NotFoundError
        ConflictError
        TooManyRequestsError
        InternalServerError
    ]
}