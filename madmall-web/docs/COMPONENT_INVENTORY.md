# MADMall Component Inventory

> Last Updated: 2025-01-27 | Version: 1.0.0

## Quick Reference

| Component | Code Name | Type | Used On | Status | Issues |
|-----------|-----------|------|---------|--------|--------|
| HeroSection | `HeroSection` | Component | All Pages | ✅ Active | None |
| FeaturedBrands | `FeaturedBrands` | Component | All Pages | ✅ Active | None |
| Concourse | `Concourse` | Page | `/` | ✅ Active | None |
| PeerCircles | `PeerCircles` | Page | `/circles` | ✅ Active | None |
| ComedyLounge | `ComedyLounge` | Page | `/comedy` | ✅ Active | None |
| StoryBooth | `StoryBooth` | Page | `/stories` | ✅ Active | None |
| Marketplace | `Marketplace` | Page | `/marketplace` | ✅ Active | None |
| ResourceHub | `ResourceHub` | Page | `/resources` | ✅ Active | None |

---

## 🧩 Components

### HeroSection
- **Code Name:** `HeroSection`
- **File:** `src/components/HeroSection.tsx`
- **Description:** Main hero banner with page name, title, subtitle, and CTAs
- **Props:** `pageName`, `title`, `subtitle`, `primaryCTA`, `secondaryCTA`, `backgroundGradient`, `floatingElements`
- **Used On:** All pages (Concourse, PeerCircles, ComedyLounge, StoryBooth, Marketplace, ResourceHub)
- **Dependencies:** `hero-sections.css`
- **Status:** ✅ Active
- **Last Modified:** 2025-01-27
- **Issues:** None

### FeaturedBrands
- **Code Name:** `FeaturedBrands`
- **File:** `src/components/FeaturedBrands.tsx`
- **Description:** Displays featured Black-owned wellness brands
- **Props:** None
- **Used On:** All pages
- **Dependencies:** None
- **Status:** ✅ Active
- **Last Modified:** 2025-01-27
- **Issues:** None

---

## 📄 Pages

### Concourse
- **Code Name:** `Concourse`
- **File:** `src/pages/Concourse.tsx`
- **Route:** `/`
- **Description:** Main landing page - wellness mall overview
- **Components Used:** HeroSection, FeaturedBrands
- **Status:** ✅ Active
- **Last Modified:** 2025-01-27
- **Issues:** None

### Peer Circles
- **Code Name:** `PeerCircles`
- **File:** `src/pages/PeerCircles.tsx`
- **Route:** `/circles`
- **Description:** Community support groups and peer connections
- **Components Used:** HeroSection, FeaturedBrands
- **Status:** ✅ Active
- **Last Modified:** 2025-01-27
- **Issues:** None

### Comedy Lounge
- **Code Name:** `ComedyLounge`
- **File:** `src/pages/ComedyLounge.tsx`
- **Route:** `/comedy`
- **Description:** Therapeutic comedy content and mood tracking
- **Components Used:** HeroSection, FeaturedBrands
- **Status:** ✅ Active
- **Last Modified:** 2025-01-27
- **Issues:** None

### Story Booth
- **Code Name:** `StoryBooth`
- **File:** `src/pages/StoryBooth.tsx`
- **Route:** `/stories`
- **Description:** Community storytelling and experience sharing
- **Components Used:** HeroSection, FeaturedBrands
- **Status:** ✅ Active
- **Last Modified:** 2025-01-27
- **Issues:** None

### Marketplace
- **Code Name:** `Marketplace`
- **File:** `src/pages/Marketplace.tsx`
- **Route:** `/marketplace`
- **Description:** Black-owned wellness brands and products
- **Components Used:** HeroSection, FeaturedBrands
- **Status:** ✅ Active
- **Last Modified:** 2025-01-27
- **Issues:** None

### Resource Hub
- **Code Name:** `ResourceHub`
- **File:** `src/pages/ResourceHub.tsx`
- **Route:** `/resources`
- **Description:** Educational content and wellness resources
- **Components Used:** HeroSection, FeaturedBrands
- **Status:** ✅ Active
- **Last Modified:** 2025-01-27
- **Issues:** None

---

## 🎨 Stylesheets

### Hero Sections CSS
- **Code Name:** `hero-sections.css`
- **File:** `src/styles/hero-sections.css`
- **Description:** AWS-style hero sections with neural depth motion effects
- **Used By:** HeroSection component
- **Status:** ✅ Active
- **Last Modified:** 2025-01-27
- **Issues:** None

### Kadir Nelson Theme
- **Code Name:** `kadir-nelson-theme.css`
- **File:** `src/styles/kadir-nelson-theme.css`
- **Description:** Kadir Nelson-inspired color palette and theme variables
- **Used By:** All pages and components
- **Status:** ✅ Active
- **Last Modified:** 2025-01-27
- **Issues:** None

---

## 🔧 Maintenance

### Status Legend
- ✅ **Active:** Currently in use and maintained
- 🚧 **Development:** Under active development
- ⚠️ **Deprecated:** Scheduled for removal
- 🐛 **Issues:** Has known issues that need attention

### Update Process
1. When adding new components, update all three inventory files
2. When modifying existing components, update the `lastModified` date
3. When issues are found, add them to the `issues` array/field
4. Review and clean up deprecated components monthly

### Quick Commands
```bash
# Find all component files
find src/components -name "*.tsx" -type f

# Find all page files  
find src/pages -name "*.tsx" -type f

# Find all style files
find src/styles -name "*.css" -type f

# Search for component usage
grep -r "HeroSection" src/pages/
```