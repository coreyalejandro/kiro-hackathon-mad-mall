/**
 * Simple Express Server for Mock Data API
 * Serves synthetic data generated using CoT-Self-Instruct methodology
 */

import express from 'express';
import cors from 'cors';
import mockDataService from '../src/data/mockDataService.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data service
let dataInitialized = false;

async function ensureDataInitialized() {
  if (!dataInitialized) {
    await mockDataService.initialize();
    dataInitialized = true;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'AIme Wellness Platform API',
    timestamp: new Date().toISOString(),
    dataInitialized
  });
});

// Community stats for dashboard
app.get('/api/stats', async (req, res) => {
  try {
    await ensureDataInitialized();
    const stats = await mockDataService.getCommunityStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Today's highlights for Concourse
app.get('/api/highlights', async (req, res) => {
  try {
    await ensureDataInitialized();
    const highlights = await mockDataService.getTodaysHighlights();
    res.json(highlights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User stories endpoints
app.get('/api/stories', async (req, res) => {
  try {
    await ensureDataInitialized();
    const { limit = 10 } = req.query;
    const stories = await mockDataService.getUserStories(parseInt(limit));
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stories/featured', async (req, res) => {
  try {
    await ensureDataInitialized();
    const { limit = 3 } = req.query;
    const stories = await mockDataService.getFeaturedStories(parseInt(limit));
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Comedy content endpoints
app.get('/api/comedy', async (req, res) => {
  try {
    await ensureDataInitialized();
    const { category, limit = 10 } = req.query;
    const comedy = await mockDataService.getComedyContent(category, parseInt(limit));
    res.json(comedy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/comedy/featured', async (req, res) => {
  try {
    await ensureDataInitialized();
    const { limit = 3 } = req.query;
    const comedy = await mockDataService.getFeaturedComedy(parseInt(limit));
    res.json(comedy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Peer discussions endpoints
app.get('/api/discussions', async (req, res) => {
  try {
    await ensureDataInitialized();
    const { circleId, limit = 10 } = req.query;
    const discussions = await mockDataService.getPeerDiscussions(circleId, parseInt(limit));
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/discussions/active', async (req, res) => {
  try {
    await ensureDataInitialized();
    const { limit = 5 } = req.query;
    const discussions = await mockDataService.getActiveDiscussions(parseInt(limit));
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resource articles endpoints
app.get('/api/resources', async (req, res) => {
  try {
    await ensureDataInitialized();
    const { category, limit = 10 } = req.query;
    const resources = await mockDataService.getResourceArticles(category, parseInt(limit));
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/resources/featured', async (req, res) => {
  try {
    await ensureDataInitialized();
    const { limit = 4 } = req.query;
    const resources = await mockDataService.getFeaturedResources(parseInt(limit));
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Product reviews endpoints
app.get('/api/products', async (req, res) => {
  try {
    await ensureDataInitialized();
    const { category, limit = 10 } = req.query;
    const products = await mockDataService.getProductReviews(category, parseInt(limit));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/featured', async (req, res) => {
  try {
    await ensureDataInitialized();
    const { limit = 6 } = req.query;
    const products = await mockDataService.getFeaturedProducts(parseInt(limit));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User profiles endpoint
app.get('/api/users', async (req, res) => {
  try {
    await ensureDataInitialized();
    const { limit = 10 } = req.query;
    const users = await mockDataService.getUserProfiles(parseInt(limit));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    await ensureDataInitialized();
    const { q: query, type = 'all', limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const results = await mockDataService.search(query, type, parseInt(limit));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Categories endpoint
app.get('/api/categories/:contentType', async (req, res) => {
  try {
    await ensureDataInitialized();
    const { contentType } = req.params;
    const categories = await mockDataService.getCategories(contentType);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User interactions endpoint
app.post('/api/interact', async (req, res) => {
  try {
    const { contentId, action, contentType } = req.body;
    
    if (!contentId || !action || !contentType) {
      return res.status(400).json({ 
        error: 'contentId, action, and contentType are required' 
      });
    }
    
    const result = await mockDataService.interactWithContent(contentId, action, contentType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recommendations endpoint
app.get('/api/recommendations', async (req, res) => {
  try {
    await ensureDataInitialized();
    const { userId = 'default', type = 'all', limit = 5 } = req.query;
    const recommendations = await mockDataService.getRecommendations(userId, type, parseInt(limit));
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/stats',
      'GET /api/highlights',
      'GET /api/stories',
      'GET /api/stories/featured',
      'GET /api/comedy',
      'GET /api/comedy/featured',
      'GET /api/discussions',
      'GET /api/discussions/active',
      'GET /api/resources',
      'GET /api/resources/featured',
      'GET /api/products',
      'GET /api/products/featured',
      'GET /api/users',
      'GET /api/search',
      'GET /api/categories/:contentType',
      'POST /api/interact',
      'GET /api/recommendations'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AIme Wellness Platform API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧠 Using CoT-Self-Instruct generated synthetic data`);
});

export default app;