# MADMall Featured Components Build Plan

## 📋 Page Inventory & Required Components

Based on the existing Next.js app structure, here are the pages and their 3 featured components:

### **1. Home/Concourse Page** (`/`)
**Theme:** Main wellness hub and community entry point

**Featured Components:**
1. **WellnessDashboard** - TitanEngine care recommendations display
2. **CommunitySpotlight** - Featured active circles and recent activity  
3. **PersonalizedInsights** - AI-powered wellness tips and progress tracking

---

### **2. Peer Circles Page** (`/circles`)
**Theme:** Community matching and peer support

**Featured Components:**
1. **CircleRecommendations** - AI-matched circles with confidence scores
2. **ActiveDiscussions** - Live community conversations and engagement
3. **CircleCreator** - Tool to create new support circles

---

### **3. Comedy Lounge Page** (`/comedy`)
**Theme:** Therapeutic comedy and stress relief

**Featured Components:**
1. **ComedyTherapyPlayer** - Curated comedy content with wellness tracking
2. **LaughterMetrics** - Mood tracking and comedy engagement analytics
3. **CommunityLaughs** - User-shared comedy content and reactions

---

### **4. Resources Hub Page** (`/resources`)
**Theme:** Educational content and wellness tools

**Featured Components:**
1. **EducationalLibrary** - Culturally-relevant health education modules
2. **WellnessTools** - Interactive health trackers and assessments
3. **ExpertContent** - Provider-validated articles and guidance

---

### **5. Marketplace Page** (`/marketplace`)
**Theme:** Wellness products and services

**Featured Components:**
1. **CulturallyRelevantProducts** - AI-curated wellness products
2. **PeerRecommendations** - Community-endorsed product reviews
3. **WellnessServiceDirectory** - Healthcare provider connections

---

### **6. Story Booth Page** (`/stories`)
**Theme:** Personal narratives and community sharing

**Featured Components:**
1. **FeaturedStories** - Highlighted community narratives
2. **StoryCreator** - AI-assisted story writing and sharing tool
3. **StoryDiscovery** - Personalized story recommendations

---

### **7. Profile Page** (`/profile`)
**Theme:** Personal wellness tracking and customization

**Featured Components:**
1. **WellnessJourney** - Progress visualization and goal tracking
2. **CommunityConnections** - Network of circles and relationships
3. **PersonalizationSettings** - AI preferences and cultural context

---

### **8. Authentication Page** (`/auth`)
**Theme:** Secure, culturally-aware onboarding

**Featured Components:**
1. **CulturalOnboarding** - Identity-affirming signup process
2. **WellnessAssessment** - Initial health and preference evaluation
3. **CommunityPreview** - Introduction to available circles and content

---

## 🎯 Component Development Priority

### **Phase 1: Core Demo Components** (Build First)
1. **WellnessDashboard** (Home) - Shows TitanEngine integration
2. **CircleRecommendations** (Circles) - Shows AI matching
3. **ComedyTherapyPlayer** (Comedy) - Shows therapeutic content

### **Phase 2: Supporting Components**
4. **CommunitySpotlight** (Home) 
5. **ActiveDiscussions** (Circles)
6. **EducationalLibrary** (Resources)

### **Phase 3: Advanced Features**
7. **PersonalizedInsights** (Home)
8. **LaughterMetrics** (Comedy)
9. **WellnessJourney** (Profile)

---

## 🛠️ Component Specifications

### **WellnessDashboard** 
**Location:** `/src/components/featured/WellnessDashboard.tsx`
**Purpose:** Display TitanEngine care recommendations
**Features:**
- Real-time care model display
- Therapeutic intervention cards
- Progress tracking
- Clinical confidence indicators

**Data Sources:**
- TitanEngine API (`/api/care-model`)
- User profile data
- Community engagement metrics

**Demo Integration:**
- Shows live care recommendations
- Displays evidence-based confidence scores
- Connects to TitanEngine backend

---

### **CircleRecommendations**
**Location:** `/src/components/featured/CircleRecommendations.tsx`
**Purpose:** AI-powered community matching
**Features:**
- Circle suggestion cards with confidence scores
- Match reasoning explanations
- One-click joining
- Diversity and cultural fit indicators

**Data Sources:**
- Bedrock Recommendation Agent
- User preference profile
- Circle activity metrics

**Demo Integration:**
- Shows AI matching in action
- Displays confidence percentages
- Demonstrates cultural relevance

---

### **ComedyTherapyPlayer**
**Location:** `/src/components/featured/ComedyTherapyPlayer.tsx`
**Purpose:** Therapeutic comedy content delivery
**Features:**
- Video/audio content player
- Mood tracking integration
- Therapeutic benefit indicators
- Cultural relevance scoring

**Data Sources:**
- TitanEngine image/content API
- Culturally validated media library
- User engagement analytics

**Demo Integration:**
- Shows culturally validated content
- Demonstrates therapeutic value
- Connects to wellness outcomes

---

## 🎨 Design System Requirements

### **Component Library:**
- Consistent styling across all featured components
- Cultural design elements and color schemes
- Accessibility-first design principles
- Mobile-responsive layouts

### **Data Integration:**
- TypeScript interfaces for all component props
- Shared state management for user context
- Real-time data updates where applicable
- Error handling and loading states

### **AI Integration Patterns:**
- Confidence score visualizations
- Cultural relevance indicators  
- Personalization preference controls
- Feedback collection mechanisms

---

## ✅ Success Metrics

### **Demo Readiness:**
- [ ] 3 components per page functional
- [ ] TitanEngine integration working
- [ ] Cultural validation visible
- [ ] AI recommendations displaying

### **Technical Quality:**
- [ ] TypeScript types complete
- [ ] Components properly tested
- [ ] Mobile responsive design
- [ ] Error handling implemented

### **User Experience:**
- [ ] Culturally appropriate design
- [ ] Clear value proposition
- [ ] Smooth interactions
- [ ] Accessible to all users

---

## 🚀 Next Steps

1. **Complete demo script with stills** ✅
2. **Build Phase 1 components** (WellnessDashboard, CircleRecommendations, ComedyTherapyPlayer)
3. **Integrate with TitanEngine APIs**
4. **Capture component screenshots for demo**
5. **Test full demo flow end-to-end**