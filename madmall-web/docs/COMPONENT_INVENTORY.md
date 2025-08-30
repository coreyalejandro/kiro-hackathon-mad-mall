# Component Inventory Report

*Last updated: 2025-08-30*

## Summary
- **Components**: 14
- **Pages**: 7  
- **Stylesheets**: 3

## Components

| Name | File | Used On | Dependencies |
|------|------|---------|--------------|
| AuthForm | `components/AuthForm.tsx` | Authentication | None |
| CommunityImage | `components/CommunityImage.tsx` | None | imageLibrary |
| CommunityTestimonials | `components/CommunityTestimonials.tsx` | Concourse | CommunityImage |
| FeaturedBrands | `components/FeaturedBrands.tsx` | None | None |
| FeaturedBusinesses | `components/FeaturedBusinesses.tsx` | Marketplace | CommunityImage |
| FeaturedCircles | `components/FeaturedCircles.tsx` | PeerCircles | CommunityImage |
| HeroSection | `components/HeroSection.tsx` | Authentication, ComedyLounge, Concourse, Marketplace, PeerCircles, ResourceHub, StoryBooth | imageLibrary |
| InteractiveStats | `components/InteractiveStats.tsx` | Concourse | None |
| LoadingCard | `components/LoadingCard.tsx` | ComedyLounge, Marketplace, ResourceHub, StoryBooth | None |
| OnboardingFlow | `components/OnboardingFlow.tsx` | Authentication | None |
| SearchWithFilters | `components/SearchWithFilters.tsx` | None | None |
| SkeletonLoader | `components/SkeletonLoader.tsx` | None | None |
| ToastNotification | `components/ToastNotification.tsx` | Authentication, ComedyLounge, Marketplace, ResourceHub, StoryBooth | None |
| UserProfile | `components/UserProfile.tsx` | None | None |

## Pages

| Name | Route | File | Components Used |
|------|-------|------|-----------------|
| Authentication | /authentication | `pages/Authentication.tsx` | AuthStep, HeroSection, br, SpaceBetween, ToastNotification, AuthForm, Container, Box, Header, OnboardingFlow |
| ComedyLounge | /comedylounge | `pages/ComedyLounge.tsx` | HeroSection, SpaceBetween, ToastNotification, Container, Header, Grid, Input, select, option, Box, Badge, Alert, LoadingCard, Button, Cards |
| Concourse | /concourse | `pages/Concourse.tsx` | HeroSection, SpaceBetween, Container, Box, Header, InteractiveStats, Grid, Badge, Button, CommunityTestimonials |
| Marketplace | /marketplace | `pages/Marketplace.tsx` | HeroSection, SpaceBetween, ToastNotification, Container, Header, Grid, Input, select, option, Badge, Alert, LoadingCard, Box, Button, Cards, strong, em, FeaturedBusinesses |
| PeerCircles | /peercircles | `pages/PeerCircles.tsx` | HeroSection, SpaceBetween, FeaturedCircles, Container, Header, Grid, Box, Badge, Button, strong, em |
| ResourceHub | /resourcehub | `pages/ResourceHub.tsx` | HeroSection, SpaceBetween, ToastNotification, Container, Header, Grid, Input, select, option, Badge, Alert, LoadingCard, Box, Button, Cards, strong |
| StoryBooth | /storybooth | `pages/StoryBooth.tsx` | HeroSection, SpaceBetween, ToastNotification, Container, Header, Grid, Input, select, option, Badge, Alert, LoadingCard, Box, Button, Cards, Textarea |
