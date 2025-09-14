#!/usr/bin/env node

/**
 * Demo Script for CoT-Self-Instruct Data Generation
 * Shows the synthetic data generation system in action
 */

import SyntheticDataGenerator from '../src/data/generators/syntheticDataGenerator.js';

console.log('🧠 CoT-Self-Instruct Data Generation Demo');
console.log('==========================================\n');

console.log('📚 Based on research: "CoT-Self-Instruct: Building high-quality synthetic prompts for reasoning and non-reasoning tasks"');
console.log('🎯 Adapted for: Black women\'s wellness and Graves\' Disease community\n');

// Create generator instance
const generator = new SyntheticDataGenerator();

console.log('🚀 Initializing synthetic data generation...\n');

// Generate all content types
const startTime = Date.now();
const data = generator.generateAllContent();
const endTime = Date.now();

console.log('\n✅ Generation Complete!');
console.log(`⏱️  Total time: ${endTime - startTime}ms\n`);

// Display generation summary
console.log('📊 Generated Content Summary:');
console.log('============================');
console.log(`📖 User Stories: ${data.userStories.length}`);
console.log(`😂 Comedy Content: ${data.comedyContent.length}`);
console.log(`💬 Peer Discussions: ${data.peerDiscussions.length}`);
console.log(`📚 Resource Articles: ${data.resourceArticles.length}`);
console.log(`🛍️ Product Reviews: ${data.productReviews.length}`);
console.log(`👤 User Profiles: ${data.userProfiles.length}\n`);

// Show sample content
console.log('🎭 Sample Generated Content:');
console.log('============================\n');

// Sample user story
if (data.userStories.length > 0) {
  const story = data.userStories[0];
  console.log('📖 Sample User Story:');
  console.log(`   Title: "${story.title}"`);
  console.log(`   Author: ${story.author}`);
  console.log(`   Themes: ${story.themes.join(', ')}`);
  console.log(`   Engagement: ${story.likes} likes, ${story.comments} comments`);
  console.log(`   Cultural Elements: ${story.culturalElements.join(', ')}\n`);
}

// Sample comedy content
if (data.comedyContent.length > 0) {
  const comedy = data.comedyContent[0];
  console.log('😂 Sample Comedy Content:');
  console.log(`   Title: "${comedy.title}"`);
  console.log(`   Category: ${comedy.category}`);
  console.log(`   Duration: ${comedy.duration}`);
  console.log(`   Relief Rating: ${comedy.reliefRating}/5.0`);
  console.log(`   Therapeutic Focus: ${comedy.therapeuticFocus}\n`);
}

// Sample peer discussion
if (data.peerDiscussions.length > 0) {
  const discussion = data.peerDiscussions[0];
  console.log('💬 Sample Peer Discussion:');
  console.log(`   Title: "${discussion.title}"`);
  console.log(`   Author: ${discussion.author}`);
  console.log(`   Circle: ${discussion.circleId}`);
  console.log(`   Category: ${discussion.category}`);
  console.log(`   Engagement: ${discussion.likes} likes, ${discussion.views} views\n`);
}

// Sample resource article
if (data.resourceArticles.length > 0) {
  const article = data.resourceArticles[0];
  console.log('📚 Sample Resource Article:');
  console.log(`   Title: "${article.title}"`);
  console.log(`   Author: ${article.author}`);
  console.log(`   Category: ${article.category}`);
  console.log(`   Read Time: ${article.readTime}`);
  console.log(`   Helpful Votes: ${article.helpfulVotes}\n`);
}

// Sample product review
if (data.productReviews.length > 0) {
  const product = data.productReviews[0];
  console.log('🛍️ Sample Product Review:');
  console.log(`   Product: "${product.productName}"`);
  console.log(`   Brand: ${product.brand}`);
  console.log(`   Category: ${product.category}`);
  console.log(`   Rating: ${product.rating}/5.0`);
  console.log(`   Price: ${product.price}`);
  console.log(`   Reviewer: ${product.reviewer}\n`);
}

// Quality metrics analysis
console.log('🎯 Quality Analysis:');
console.log('===================');

// Analyze cultural authenticity
const culturalElements = data.userStories.flatMap(story => story.culturalElements || []);
const uniqueCulturalElements = [...new Set(culturalElements)];
console.log(`🌍 Cultural Elements: ${uniqueCulturalElements.length} unique markers`);
console.log(`   Examples: ${uniqueCulturalElements.slice(0, 5).join(', ')}`);

// Analyze therapeutic value
const therapeuticThemes = data.userStories.flatMap(story => story.therapeuticValue || []);
const uniqueTherapeuticThemes = [...new Set(therapeuticThemes)];
console.log(`💚 Therapeutic Themes: ${uniqueTherapeuticThemes.length} unique themes`);
console.log(`   Examples: ${uniqueTherapeuticThemes.slice(0, 5).join(', ')}`);

// Analyze engagement potential
const totalLikes = data.userStories.reduce((sum, story) => sum + (story.likes || 0), 0);
const avgLikes = Math.round(totalLikes / data.userStories.length);
console.log(`👍 Average Engagement: ${avgLikes} likes per story`);

// Comedy relief ratings
const avgReliefRating = data.comedyContent.reduce((sum, comedy) => sum + parseFloat(comedy.reliefRating), 0) / data.comedyContent.length;
console.log(`😂 Average Relief Rating: ${avgReliefRating.toFixed(1)}/5.0`);

console.log('\n🎉 Demo Complete!');
console.log('================');
console.log('✨ The CoT-Self-Instruct methodology has successfully generated');
console.log('   high-quality, culturally authentic content for the wellness platform.');
console.log('🚀 Ready to power the AIme Wellness Platform with realistic data!');
console.log('\n💡 Next steps:');
console.log('   1. Run `npm run server:dev` to start the API server');
console.log('   2. Run `npm run dev` to start the frontend');
console.log('   3. Experience the platform with realistic, engaging content!');