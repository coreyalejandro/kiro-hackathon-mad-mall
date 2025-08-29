# CoT-Self-Instruct Data Generation System

This directory contains a sophisticated synthetic data generation system based on the research paper "CoT-Self-Instruct: Building high-quality synthetic prompts for reasoning and non-reasoning tasks" by Yu et al.

## Overview

Our implementation uses Chain-of-Thought (CoT) reasoning to generate high-quality, culturally authentic content for the AIme Wellness Platform. This approach ensures that all synthetic data maintains therapeutic value, cultural relevance, and authentic representation of Black women's experiences with Graves' Disease.

## Architecture

```
src/data/
├── generators/
│   ├── cot-self-instruct.js      # Core CoT methodology implementation
│   └── syntheticDataGenerator.js  # Specific content generators
├── seedData.js                    # High-quality seed examples
├── mockDataService.js             # Data service layer
└── README.md                      # This file
```

## Key Features

### 1. Chain-of-Thought Reasoning
- **Analysis Phase**: Examines seed data for patterns, quality indicators, and cultural elements
- **Planning Phase**: Creates detailed content plans based on analysis
- **Generation Phase**: Produces new content following the established patterns
- **Validation Phase**: Ensures quality and cultural authenticity

### 2. Cultural Authenticity
- Incorporates authentic Black women's experiences
- Uses culturally relevant language and references
- Addresses specific health disparities and challenges
- Maintains community-centered perspective

### 3. Therapeutic Value
- Content designed to provide emotional support
- Normalizes experiences with chronic illness
- Promotes empowerment and self-advocacy
- Builds community connections

### 4. Quality Filtering
- **Authenticity Score**: Measures genuine voice and experience
- **Cultural Relevance**: Ensures community resonance
- **Therapeutic Value**: Validates healing potential
- **Engagement Factor**: Assesses community interaction potential

## Content Types Generated

### User Stories
- Personal diagnosis journeys
- Self-care learning experiences
- Medical advocacy stories
- Workplace wellness narratives
- Family understanding journeys

### Comedy Content
- Thyroid-related humor with therapeutic value
- Self-care struggle comedy
- Medical system navigation humor
- Community moment comedy
- Stress relief through laughter

### Peer Discussions
- Symptom management conversations
- Workplace accommodation discussions
- Relationship and support topics
- Medical advocacy exchanges
- Lifestyle and wellness tips

### Resource Articles
- Educational content about Graves' Disease
- Mental health and chronic illness
- Nutrition and thyroid health
- Lifestyle management guides
- Medical advocacy resources

### Product Reviews
- Black-owned wellness brand reviews
- Culturally relevant product recommendations
- Community-tested solutions
- Therapeutic product evaluations

### User Profiles
- Diverse community member profiles
- Authentic engagement patterns
- Cultural identifier representation
- Contribution style diversity

## Quality Metrics

### Authenticity Indicators
- Personal experience details
- Specific cultural markers
- Emotional honesty
- Community language use

### Cultural Relevance Markers
- Shared community experiences
- Cultural references and context
- Inclusive and representative tone
- Community-centered perspective

### Therapeutic Value Elements
- Hope-building content
- Practical advice and tips
- Experience normalization
- Empowerment messaging

### Engagement Factors
- Relatable content creation
- Conversation starter potential
- Actionable insights provision
- Emotional resonance achievement

## Usage

### Basic Data Generation
```javascript
import SyntheticDataGenerator from './generators/syntheticDataGenerator.js';

const generator = new SyntheticDataGenerator();
const data = generator.generateAllContent();
```

### Service Layer Access
```javascript
import mockDataService from './mockDataService.js';

// Initialize and get data
await mockDataService.initialize();
const stories = await mockDataService.getUserStories(10);
const comedy = await mockDataService.getFeaturedComedy(5);
```

### API Integration
```javascript
import apiService from '../services/apiService.js';

// Fetch data through API
const highlights = await apiService.getTodaysHighlights();
const discussions = await apiService.getActiveDiscussions();
```

### React Hook Usage
```javascript
import { useFeaturedStories, useComedyContent } from '../hooks/useApiData.js';

function MyComponent() {
  const { data: stories, loading } = useFeaturedStories(3);
  const { data: comedy } = useComedyContent('Thyroid Life', 5);
  
  // Component implementation
}
```

## Data Quality Assurance

### Seed Data Curation
- Hand-crafted high-quality examples
- Authentic voice and experience
- Cultural sensitivity review
- Therapeutic value validation

### Generation Process
1. **CoT Analysis**: Deep examination of seed patterns
2. **Cultural Filtering**: Ensures community relevance
3. **Therapeutic Validation**: Confirms healing potential
4. **Quality Scoring**: Quantitative quality assessment

### Continuous Improvement
- Community feedback integration
- Cultural consultant review
- Therapeutic outcome tracking
- Engagement metric analysis

## Research Foundation

This implementation is based on the CoT-Self-Instruct methodology from:
- **Paper**: "CoT-Self-Instruct: Building high-quality synthetic prompts for reasoning and non-reasoning tasks"
- **Authors**: Yu et al. (2024)
- **Key Innovation**: Using Chain-of-Thought reasoning to improve synthetic data quality

### Adaptations for Wellness Platform
- **Cultural Specificity**: Tailored for Black women's health experiences
- **Therapeutic Focus**: Optimized for mental health and community support
- **Community Authenticity**: Ensures genuine representation and voice
- **Engagement Optimization**: Designed for peer support interactions

## Performance Considerations

### Caching Strategy
- 5-minute cache timeout for API responses
- Intelligent cache invalidation
- Memory-efficient storage

### Generation Efficiency
- Batch content generation
- Lazy loading for large datasets
- Optimized data structures

### Scalability
- Modular generator architecture
- Configurable content volumes
- Extensible content types

## Future Enhancements

### Advanced CoT Features
- Multi-step reasoning chains
- Cross-content type relationships
- Dynamic quality adaptation
- Real-time feedback integration

### Cultural Enhancement
- Regional dialect variations
- Generational perspective diversity
- Intersectional identity representation
- Community leader voice integration

### Therapeutic Advancement
- Evidence-based outcome tracking
- Personalized content generation
- Crisis support content
- Professional resource integration

## Contributing

When adding new content types or improving generation quality:

1. **Study Seed Data**: Understand existing patterns and quality markers
2. **Implement CoT Process**: Follow the four-phase methodology
3. **Validate Culturally**: Ensure authentic community representation
4. **Test Therapeutically**: Confirm healing and support value
5. **Measure Quality**: Use established metrics for validation

## Support

For questions about the data generation system:
- Review the seed data examples for quality standards
- Examine the CoT methodology implementation
- Test with small data samples before scaling
- Monitor quality metrics during generation