# MADMall: AI Wellness Collaborative

## 💡 Inspiration

Mental health support for African American women often lacks cultural sensitivity and community connection. We were inspired to create "AIme" - a wellness platform that combines AI technology with culturally-aware design to build authentic community spaces where Black women can find support, share stories, and access resources that truly understand their experiences.

## 🎯 What it does

MADMall is a comprehensive social wellness platform featuring:

- **Concourse**: A culturally-sensitive social feed for community interaction
- **Peer Circles**: Group support communities for shared experiences
- **Comedy Lounge**: Wellness through humor and entertainment
- **Story Booth**: Safe space for personal narrative sharing
- **Marketplace**: Platform for Black-owned wellness businesses
- **Resource Hub**: Curated mental health resources
- **AI-Powered Image Generation**: Creates culturally-appropriate imagery using AWS Bedrock
- **Live Agent Meetings**: Real-time support sessions with cultural sensitivity

## 🛠️ How we built it

**Frontend**: Next.js 15 with React 19 and AWS Cloudscape Design System for enterprise-grade UX

**Backend**: Serverless AWS architecture with Lambda functions and DynamoDB

**AI Integration**: Custom "TitanEngine" using AWS Bedrock (SDXL for image generation, Claude-3 for cultural validation)

**Architecture**: Monorepo with Projen + Nx, PNPM workspaces for scalable development

**Deployment**: Configured for Vercel with proper build optimization

### 🔧 Tech Stack

**Languages & Frameworks:**
- TypeScript
- Next.js 15
- React 19
- Node.js

**Cloud Services & AI:**
- AWS Bedrock (SDXL, Claude-3)
- AWS Lambda
- AWS DynamoDB
- AWS CDK

**Frontend Technologies:**
- Cloudscape Design System
- TanStack React Query
- Socket.io Client
- Lucide React Icons

**Backend & API:**
- REST APIs
- Smithy IDL
- AWS SDK v3
- Lambda Functions

**Development Tools:**
- Projen
- Nx Monorepo
- PNPM Workspaces
- Jest Testing
- ESLint

**Deployment & Infrastructure:**
- Vercel
- AWS CloudFormation
- Infrastructure as Code (CDK)

## 🚧 Challenges we ran into

- **Cultural Sensitivity**: Ensuring AI-generated content respects African American culture and experiences
- **Monorepo Complexity**: Managing dependencies across multiple packages while maintaining build performance
- **Real-time Features**: Implementing live agent meetings with Socket.io integration
- **Image Approval Workflow**: Building automated validation system that scores cultural appropriateness
- **AWS Integration**: Connecting Bedrock AI services with Next.js frontend seamlessly

## 🏆 Accomplishments that we're proud of

- **TitanEngine**: Built a sophisticated AI image generation system with cultural validation scoring >0.8 for auto-approval
- **Complete Platform**: Delivered 6 fully-functional platform sections with consistent design
- **Enterprise Architecture**: Implemented production-ready monorepo with proper CI/CD patterns
- **Cultural Awareness**: Created AI prompts and validation specifically for African American women's wellness
- **Admin Interface**: Built `/admin/images` dashboard for content management and approval workflows

## 📚 What we learned

- AWS Bedrock's capabilities for culturally-sensitive AI generation
- Next.js 15 App Router patterns for enterprise applications
- Importance of cultural validation in AI-generated content
- Monorepo architecture benefits for hackathon-scale rapid development
- Real-time application patterns with modern React and Socket.io

## 🚀 What's next for MADMall: AI Wellness Collaborative

- **Mobile App**: React Native version for better accessibility
- **Enhanced AI**: Expand TitanEngine with personalized wellness recommendations
- **Telehealth Integration**: Connect licensed therapists familiar with cultural contexts
- **Community Moderation**: AI-powered content moderation with cultural sensitivity
- **Analytics Dashboard**: Track wellness metrics and community engagement
- **Marketplace Expansion**: Payment processing and vendor onboarding system