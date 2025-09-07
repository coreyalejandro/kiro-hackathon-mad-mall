$version: "2"

namespace com.madmall.api

/// Business categories
enum BusinessType {
    WELLNESS_CENTER = "wellness_center"
    HEALTHCARE_PROVIDER = "healthcare_provider"
    SUPPLEMENT_BRAND = "supplement_brand"
    FITNESS_STUDIO = "fitness_studio"
    MENTAL_HEALTH_SERVICE = "mental_health_service"
    NUTRITION_SERVICE = "nutrition_service"
    BEAUTY_WELLNESS = "beauty_wellness"
    LIFESTYLE_BRAND = "lifestyle_brand"
    EDUCATIONAL_SERVICE = "educational_service"
}

/// Business operational status
enum BusinessStatus {
    ACTIVE = "active"
    PENDING_VERIFICATION = "pending_verification"
    SUSPENDED = "suspended"
    INACTIVE = "inactive"
}

/// Business certifications
enum CertificationType {
    BLACK_OWNED = "black_owned"
    WOMAN_OWNED = "woman_owned"
    MINORITY_OWNED = "minority_owned"
    CERTIFIED_ORGANIC = "certified_organic"
    FDA_APPROVED = "fda_approved"
    CLINICAL_TESTED = "clinical_tested"
    CULTURALLY_COMPETENT = "culturally_competent"
}

/// Business social media links
structure SocialMedia {
    instagram: Url
    facebook: Url
    twitter: Url
    linkedin: Url
    tiktok: Url
}

/// Business contact address
structure BusinessAddress {
    @required
    street: String
    
    @required
    city: String
    
    @required
    state: String
    
    @required
    zipCode: String
    
    @required
    country: String
}

/// Business contact information
structure BusinessContact {
    @required
    email: Email
    
    phone: String
    
    address: BusinessAddress
}

/// Business profile information
structure BusinessProfile {
    @required
    name: String
    
    @required
    description: String
    
    mission: String
    
    foundedYear: Integer
    
    founderStory: String
    
    website: Url
    
    @required
    socialMedia: SocialMedia
    
    @required
    contact: BusinessContact
    
    logo: Url
    
    coverImage: Url
    
    @required
    gallery: UrlList
}

/// Business performance metrics
structure BusinessMetrics {
    @required
    @range(min: 0.0, max: 5.0)
    rating: Float
    
    @required
    reviewCount: Integer
    
    @required
    @range(min: 0.0, max: 1.0)
    trustScore: Float
    
    @required
    @range(min: 0.0, max: 1.0)
    responseRate: Float
    
    @required
    averageResponseTime: Integer
    
    @required
    @range(min: 0.0, max: 1.0)
    repeatCustomerRate: Float
}

/// Complete business entity
structure Business {
    @required
    id: Id
    
    @required
    profile: BusinessProfile
    
    @required
    type: BusinessType
    
    @required
    status: BusinessStatus
    
    @required
    certifications: CertificationTypeList
    
    @required
    specialties: StringList
    
    @required
    servicesOffered: StringList
    
    @required
    targetAudience: StringList
    
    @required
    culturalCompetencies: StringList
    
    @required
    metrics: BusinessMetrics
    
    @required
    ownerId: Id
    
    verifiedAt: DateTime
    
    featuredUntil: DateTime
    
    @required
    createdAt: DateTime
    
    @required
    updatedAt: DateTime
}

/// Product pricing information
structure ProductPrice {
    @required
    amount: Float
    
    @required
    currency: String
    
    originalPrice: Float
    
    @range(min: 0, max: 100)
    discountPercentage: Integer
}

/// Product availability information
structure ProductAvailability {
    @required
    inStock: Boolean
    
    quantity: Integer
    
    restockDate: DateTime
}

/// Product shipping information
structure ProductShipping {
    @required
    freeShipping: Boolean
    
    shippingCost: Float
    
    @required
    estimatedDelivery: String
    
    @required
    internationalShipping: Boolean
}

/// Product entity
structure Product {
    @required
    id: Id
    
    @required
    businessId: Id
    
    @required
    name: String
    
    @required
    description: String
    
    @required
    category: String
    
    subcategory: String
    
    @required
    price: ProductPrice
    
    @required
    images: UrlList
    
    specifications: StringMap
    
    ingredients: StringList
    
    @required
    benefits: StringList
    
    @required
    culturalRelevance: StringList
    
    @required
    certifications: StringList
    
    @required
    availability: ProductAvailability
    
    @required
    shipping: ProductShipping
    
    @required
    @range(min: 0.0, max: 5.0)
    rating: Float
    
    @required
    reviewCount: Integer
    
    @required
    isActive: Boolean
    
    @required
    createdAt: DateTime
    
    @required
    updatedAt: DateTime
}

/// Business creation input
structure CreateBusinessInput {
    @required
    profile: BusinessProfileInput
    
    @required
    type: BusinessType
    
    certifications: CertificationTypeList
    
    specialties: StringList
    
    servicesOffered: StringList
    
    targetAudience: StringList
    
    culturalCompetencies: StringList
}

/// Business profile input
structure BusinessProfileInput {
    @required
    name: String
    
    @required
    description: String
    
    mission: String
    
    foundedYear: Integer
    
    founderStory: String
    
    website: Url
    
    socialMedia: SocialMediaInput
    
    @required
    contact: BusinessContactInput
    
    logo: Url
    
    coverImage: Url
    
    gallery: UrlList
}

/// Social media input
structure SocialMediaInput {
    instagram: Url
    facebook: Url
    twitter: Url
    linkedin: Url
    tiktok: Url
}

/// Business contact input
structure BusinessContactInput {
    @required
    email: Email
    
    phone: String
    
    address: BusinessAddressInput
}

/// Business address input
structure BusinessAddressInput {
    @required
    street: String
    
    @required
    city: String
    
    @required
    state: String
    
    @required
    zipCode: String
    
    @required
    country: String
}

/// Business update input
structure UpdateBusinessInput {
    profile: BusinessProfileInput
    type: BusinessType
    certifications: CertificationTypeList
    specialties: StringList
    servicesOffered: StringList
    targetAudience: StringList
    culturalCompetencies: StringList
    status: BusinessStatus
}

/// Product creation input
structure CreateProductInput {
    @required
    businessId: Id
    
    @required
    name: String
    
    @required
    description: String
    
    @required
    category: String
    
    subcategory: String
    
    @required
    price: ProductPriceInput
    
    @required
    images: UrlList
    
    specifications: StringMap
    
    ingredients: StringList
    
    benefits: StringList
    
    culturalRelevance: StringList
    
    certifications: StringList
    
    @required
    availability: ProductAvailabilityInput
    
    @required
    shipping: ProductShippingInput
}

/// Product price input
structure ProductPriceInput {
    @required
    amount: Float
    
    @required
    currency: String
    
    originalPrice: Float
    
    @range(min: 0, max: 100)
    discountPercentage: Integer
}

/// Product availability input
structure ProductAvailabilityInput {
    @required
    inStock: Boolean
    
    quantity: Integer
    
    restockDate: DateTime
}

/// Product shipping input
structure ProductShippingInput {
    @required
    freeShipping: Boolean
    
    shippingCost: Float
    
    @required
    estimatedDelivery: String
    
    @required
    internationalShipping: Boolean
}

/// Product update input
structure UpdateProductInput {
    name: String
    description: String
    category: String
    subcategory: String
    price: ProductPriceInput
    images: UrlList
    specifications: StringMap
    ingredients: StringList
    benefits: StringList
    culturalRelevance: StringList
    certifications: StringList
    availability: ProductAvailabilityInput
    shipping: ProductShippingInput
    isActive: Boolean
}

/// Business creation response
structure CreateBusinessResponse {
    @required
    business: Business
    
    @required
    message: String = "Business created successfully"
}

/// Business retrieval response
structure GetBusinessResponse {
    @required
    business: Business
}

/// Business update response
structure UpdateBusinessResponse {
    @required
    business: Business
    
    @required
    message: String = "Business updated successfully"
}

/// Business deletion response
structure DeleteBusinessResponse {
    @required
    success: Boolean = true
    
    @required
    message: String = "Business deleted successfully"
}

/// Businesses list response
structure GetBusinessesResponse {
    @required
    businesses: BusinessList
    
    pagination: PaginationOutput
}

/// Featured businesses response
structure GetFeaturedBusinessesResponse {
    @required
    businesses: BusinessList
}

/// Product creation response
structure CreateProductResponse {
    @required
    product: Product
    
    @required
    message: String = "Product created successfully"
}

/// Product retrieval response
structure GetProductResponse {
    @required
    product: Product
}

/// Product update response
structure UpdateProductResponse {
    @required
    product: Product
    
    @required
    message: String = "Product updated successfully"
}

/// Product deletion response
structure DeleteProductResponse {
    @required
    success: Boolean = true
    
    @required
    message: String = "Product deleted successfully"
}

/// Products list response
structure GetProductsResponse {
    @required
    products: ProductList
    
    pagination: PaginationOutput
}

/// Featured products response
structure GetFeaturedProductsResponse {
    @required
    products: ProductList
}

/// Lists and Maps
list CertificationTypeList {
    member: CertificationType
}

list UrlList {
    member: Url
}

list BusinessList {
    member: Business
}

list ProductList {
    member: Product
}

map StringMap {
    key: String
    value: String
}

// Business Operations

/// Create a new business
@http(method: "POST", uri: "/businesses")
operation CreateBusiness {
    input: CreateBusinessInput
    output: CreateBusinessResponse
    errors: [ValidationError, UnauthorizedError, ConflictError, InternalServerError]
}

/// Get business by ID
@http(method: "GET", uri: "/businesses/{businessId}")
@readonly
operation GetBusiness {
    input := {
        @httpLabel
        @required
        businessId: Id
    }
    output: GetBusinessResponse
    errors: [NotFoundError, InternalServerError]
}

/// Update business information
@http(method: "PUT", uri: "/businesses/{businessId}")
operation UpdateBusiness {
    input := for UpdateBusinessInput {
        @httpLabel
        @required
        businessId: Id
    }
    output: UpdateBusinessResponse
    errors: [ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, InternalServerError]
}

/// Delete business
@http(method: "DELETE", uri: "/businesses/{businessId}")
@idempotent
operation DeleteBusiness {
    input := {
        @httpLabel
        @required
        businessId: Id
    }
    output: DeleteBusinessResponse
    errors: [NotFoundError, UnauthorizedError, ForbiddenError, InternalServerError]
}

/// Get list of businesses
@http(method: "GET", uri: "/businesses")
@readonly
operation GetBusinesses {
    input := for PaginationInput {
        @httpQuery("limit")
        limit: Integer
        
        @httpQuery("nextToken")
        nextToken: String
        
        @httpQuery("type")
        type: BusinessType
        
        @httpQuery("status")
        status: BusinessStatus
        
        @httpQuery("certification")
        certification: CertificationType
    }
    output: GetBusinessesResponse
    errors: [ValidationError, InternalServerError]
}

/// Get featured businesses
@http(method: "GET", uri: "/businesses/featured")
@readonly
operation GetFeaturedBusinesses {
    input := {
        @httpQuery("limit")
        @range(min: 1, max: 20)
        limit: Integer = 6
    }
    output: GetFeaturedBusinessesResponse
    errors: [InternalServerError]
}

// Product Operations

/// Create a new product
@http(method: "POST", uri: "/products")
operation CreateProduct {
    input: CreateProductInput
    output: CreateProductResponse
    errors: [ValidationError, UnauthorizedError, ForbiddenError, InternalServerError]
}

/// Get product by ID
@http(method: "GET", uri: "/products/{productId}")
@readonly
operation GetProduct {
    input := {
        @httpLabel
        @required
        productId: Id
    }
    output: GetProductResponse
    errors: [NotFoundError, InternalServerError]
}

/// Update product information
@http(method: "PUT", uri: "/products/{productId}")
operation UpdateProduct {
    input := for UpdateProductInput {
        @httpLabel
        @required
        productId: Id
    }
    output: UpdateProductResponse
    errors: [ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, InternalServerError]
}

/// Delete product
@http(method: "DELETE", uri: "/products/{productId}")
@idempotent
operation DeleteProduct {
    input := {
        @httpLabel
        @required
        productId: Id
    }
    output: DeleteProductResponse
    errors: [NotFoundError, UnauthorizedError, ForbiddenError, InternalServerError]
}

/// Get list of products
@http(method: "GET", uri: "/products")
@readonly
operation GetProducts {
    input := for PaginationInput {
        @httpQuery("limit")
        limit: Integer
        
        @httpQuery("nextToken")
        nextToken: String
        
        @httpQuery("businessId")
        businessId: Id
        
        @httpQuery("category")
        category: String
        
        @httpQuery("inStock")
        inStock: Boolean
    }
    output: GetProductsResponse
    errors: [ValidationError, InternalServerError]
}

/// Get featured products
@http(method: "GET", uri: "/products/featured")
@readonly
operation GetFeaturedProducts {
    input := {
        @httpQuery("limit")
        @range(min: 1, max: 20)
        limit: Integer = 6
    }
    output: GetFeaturedProductsResponse
    errors: [InternalServerError]
}