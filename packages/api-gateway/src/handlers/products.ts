import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  GetProductsOutput, 
  GetFeaturedProductsOutput
} from '../generated/types';
import { MockDataService } from '../services/mockDataService';

/**
 * Get products handler
 * Maps to GET /api/products endpoint from Express server
 */
export const getProductsHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const mockDataService = new MockDataService();
    await mockDataService.initialize();
    
    const category = event.queryStringParameters?.category;
    const limit = parseInt(event.queryStringParameters?.limit || '10');
    const products = await mockDataService.getProductReviews(category, limit);
    
    const response: GetProductsOutput = {
      products: products.map(product => ({
        id: product.id,
        businessId: product.businessId || 'default-business',
        name: product.name,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        price: {
          amount: product.price?.amount || 0,
          currency: product.price?.currency || 'USD',
          originalPrice: product.price?.originalPrice,
          discountPercentage: product.price?.discountPercentage
        },
        images: product.images || [],
        specifications: product.specifications || {},
        ingredients: product.ingredients || [],
        benefits: product.benefits || [],
        culturalRelevance: product.culturalRelevance || [],
        certifications: product.certifications || [],
        availability: {
          inStock: product.availability?.inStock ?? true,
          quantity: product.availability?.quantity,
          restockDate: product.availability?.restockDate ? new Date(product.availability.restockDate) : undefined
        },
        shipping: {
          freeShipping: product.shipping?.freeShipping ?? false,
          shippingCost: product.shipping?.shippingCost,
          estimatedDelivery: product.shipping?.estimatedDelivery || '3-5 business days',
          internationalShipping: product.shipping?.internationalShipping ?? false
        },
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        isActive: product.isActive ?? true,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      })),
      pagination: {
        totalCount: products.length,
        itemCount: products.length,
        nextToken: undefined
      }
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Get products handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve products',
        requestId: event.requestContext?.requestId
      })
    };
  }
};

/**
 * Get featured products handler
 * Maps to GET /api/products/featured endpoint from Express server
 */
export const getFeaturedProductsHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const mockDataService = new MockDataService();
    await mockDataService.initialize();
    
    const limit = parseInt(event.queryStringParameters?.limit || '6');
    const products = await mockDataService.getFeaturedProducts(limit);
    
    const response: GetFeaturedProductsOutput = {
      products: products.map(product => ({
        id: product.id,
        businessId: product.businessId || 'default-business',
        name: product.name,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        price: {
          amount: product.price?.amount || 0,
          currency: product.price?.currency || 'USD',
          originalPrice: product.price?.originalPrice,
          discountPercentage: product.price?.discountPercentage
        },
        images: product.images || [],
        specifications: product.specifications || {},
        ingredients: product.ingredients || [],
        benefits: product.benefits || [],
        culturalRelevance: product.culturalRelevance || [],
        certifications: product.certifications || [],
        availability: {
          inStock: product.availability?.inStock ?? true,
          quantity: product.availability?.quantity,
          restockDate: product.availability?.restockDate ? new Date(product.availability.restockDate) : undefined
        },
        shipping: {
          freeShipping: product.shipping?.freeShipping ?? false,
          shippingCost: product.shipping?.shippingCost,
          estimatedDelivery: product.shipping?.estimatedDelivery || '3-5 business days',
          internationalShipping: product.shipping?.internationalShipping ?? false
        },
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        isActive: product.isActive ?? true,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      }))
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Get featured products handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve featured products',
        requestId: event.requestContext?.requestId
      })
    };
  }
};