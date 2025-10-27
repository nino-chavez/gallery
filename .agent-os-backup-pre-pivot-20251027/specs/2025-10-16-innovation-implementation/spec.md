# Specification: UI/UX Innovation Implementation

## Executive Summary

The nino-chavez-gallery has achieved functional excellence with sophisticated AI-powered features but falls critically short of its "Leading-edge, never-before-seen" design ambitions. This specification addresses the **2-tier innovation gap** between the current state (Tier 2: Differentiated) and the target state (Tier 4: Leading-edge).

**Core Problem:** Revolutionary features exist in the codebase but are completely invisible to users. The EMOTION_PALETTE, MagneticFilterOrb, Story Curation Engine, and Quality Scoring systems are hidden behind conventional UI patterns.

**Solution:** A 4-phase implementation that progressively surfaces existing innovations, adds microinteractions, and culminates in the transformative "Emotion Galaxy" interface—a spatial navigation paradigm where photos orbit emotional centers in 3D space.

**Strategic Importance:** This is not about adding features; it's about making existing AI capabilities experienceable. Innovation that isn't experienced isn't innovation—it's just clever code.

## Problem Statement

### Current State (Tier 2: Differentiated)
- Clean, modern portfolio with good usability
- Sophisticated backend: AI metadata enrichment, story curation, emotion classification
- Functionally indistinguishable from contemporary photo galleries
- Features hidden in metadata, not surfaced in UI

### Innovation Gap (2 Full Tiers)
1. **Invisible Features:** EMOTION_PALETTE exists only as configuration, not as navigable interface
2. **Hidden AI:** Quality scores, emotion classification, play type detection don't influence visual presentation
3. **Buried Interactions:** MagneticFilterOrb component exists but not visible in UI
4. **Conventional Patterns:** Grid → detail → back button (identical to Flickr, SmugMug, 500px)

### Target State (Tier 4: Leading-edge)
- Iconic, never-before-seen spatial emotion navigation
- AI capabilities as the primary interface paradigm
- Physics-based interactions that feel alive
- Memorable enough that users evangelize to others

## Solution Overview

### 4-Phase Implementation Approach

**Phase 1: Foundation Fixes (Week 1)**
- Fix critical bugs and accessibility issues
- Establish production-ready baseline
- No innovation work, pure quality

**Phase 2: Surface Innovations (Weeks 2-3)**
- Make invisible features visible
- Emotion navigation cards on homepage
- Activate MagneticFilterOrb
- Quality stratification in grids
- Story discovery UI

**Phase 3: Microinteractions (Weeks 4-5)**
- Add delight and fluidity
- Shared element transitions
- Photo card physics
- Scroll-linked animations
- Enhanced empty states

**Phase 4: Emotion Galaxy (Weeks 6-10)**
- Transformative 3D spatial interface
- Photos orbit emotional "planets"
- Camera flight animations
- Story constellations in 3D space
- 2D/2.5D/3D view toggle

## User Stories

### Phase 1 Stories
- As a user, I want to browse photos without runtime errors so that I can explore the gallery
- As a screen reader user, I want semantic HTML landmarks so that I can navigate efficiently
- As a keyboard user, I want visible focus indicators so that I know where I am

### Phase 2 Stories
- As a visitor, I want to discover photos by emotion so that I can find photos matching my mood
- As a photographer, I want portfolio-worthy photos visually distinct so that best work stands out
- As a user, I want to see AI-generated stories so that I can experience curated narrative journeys
- As a filter user, I want magnetic orb interaction so that filtering feels engaging and unique

### Phase 3 Stories
- As a user, I want smooth photo transitions so that navigation feels cinematic
- As a mobile user, I want touch-friendly interactions so that the experience feels native
- As a user, I want photos to respond to my cursor so that the interface feels alive
- As a user, I want scroll animations so that browsing feels immersive

### Phase 4 Stories
- As a user, I want to explore photos in emotional space so that discovery feels revolutionary
- As a story viewer, I want to see photo constellations so that narratives have spatial context
- As a user, I want to toggle between 2D and 3D views so that I can choose my exploration mode
- As a keyboard user, I want to navigate 3D space with keys so that the experience is accessible

## Core Requirements

### Functional Requirements

**Phase 1:**
- Fix next/image quality prop error on browse page
- Add main, nav, section landmarks to all pages
- Implement skeleton loaders for photo grids
- Add visible focus indicators (2px outline, accent color)
- Verify lazy loading with Intersection Observer
- Add loading states for async operations

**Phase 2:**
- Homepage: 6 emotion cards with EMOTION_PALETTE gradients and glows
- Portfolio: Emotion filter chips using magnetic orb system
- Photo cards: 2px emotion halos in EMOTION_PALETTE colors
- Grid: Portfolio-worthy photos 2x size with gold star badge
- Story UI: "Generate Story" modal with 6 story type options
- Detail view: Emotion indicator that shifts page theme

**Phase 3:**
- Shared element transitions with Framer Motion layoutId
- Photo card cursor repulsion within 50px radius
- 3D tilt on hover using CSS transforms
- Parallax scrolling with variable speeds (0.5x, 1x, 1.2x)
- Enhanced empty states with animations
- Page transitions with orchestrated animations

**Phase 4:**
- 3D scene with @react-three/fiber
- 6 emotion orb meshes with gradient materials
- Photo particle system (textured planes in 3D space)
- Camera flight animations between emotional zones
- Story constellation paths (THREE.Line)
- Keyboard navigation in 3D (arrow keys, tab, space)
- 2D/2.5D/3D toggle (D key)

### Non-Functional Requirements

**Performance:**
- Maintain 90+ Lighthouse score across all phases
- 60fps animations on desktop, 30fps minimum on mobile
- Bundle size: Phase 4 adds max 150KB (code splitting for @react-three/fiber)
- Lazy load 3D assets (textures, models)
- Virtual scrolling for 10K+ photos maintained

**Accessibility:**
- WCAG AA compliance minimum
- Keyboard navigation for all interactions (including 3D in Phase 4)
- Screen reader support with ARIA labels
- Reduced motion support with prefers-reduced-motion
- Color contrast ratios 4.5:1 minimum
- Focus management across page transitions

**Browser Support:**
- Chrome, Firefox, Safari, Edge (last 2 versions)
- Phase 4 requires WebGL support (fallback to 2D for unsupported browsers)
- Mobile: iOS Safari 14+, Chrome Android 90+

**Scalability:**
- Support 10,000+ photos in grids
- Phase 4: LOD system for 3D (render only visible photos)
- Frustum culling to exclude off-screen objects
- Instanced rendering for repeated geometries

## Visual Design

### Mockup References
- **Location:** `agent-os/specs/2025-10-16-innovation-implementation/planning/visuals/audit/`
- **16 Screenshots:** Desktop (1920x1080), Mobile (375x812), Tablet (768x1024)
- **Key insights from screenshots:**
  - Current grid layouts responsive and clean
  - No emotion indicators visible
  - No hover state microinteractions
  - Browse page has runtime error
  - Empty states exist but lack personality

### UI Elements to Implement

**Phase 2 - Emotion Navigation Cards:**
```
6 cards on homepage, each 250x200px:
- Background: EMOTION_PALETTE[emotion].gradient
- Box shadow: EMOTION_PALETTE[emotion].glow
- Icon: EMOTION_ICONS[emotion] at 48px
- Label: Emotion name + photo count
- Hover: Scale 1.05, brighten glow
- Click: Navigate to /portfolio?emotion={emotion}
```

**Phase 2 - Quality Badges:**
```
Portfolio-worthy photos:
- 2x grid size (spans 2 columns in masonry)
- Gold border: 1px solid #FFD700
- Badge overlay (top-right): "⭐ Portfolio"
- Shimmer animation on load (subtle gradient sweep)
- Always in first 6 grid positions
```

**Phase 2 - MagneticFilterOrb Activation:**
```
Portfolio page filter bar:
- 6 emotion orbs floating in orbital formation
- Each orb: 80px diameter, emotion gradient background
- Magnetic radius: 100px (cursor within 100px attracts orb)
- Active state: Emotion-specific glow, orb "sticks" to cursor briefly
- Multiple active filters orbit each other using spring physics
```

**Phase 3 - Photo Card Physics:**
```
Grid items:
- Cursor repulsion: cards push away within 50px
- Hover 3D tilt: rotateX/rotateY based on cursor position
- Lift animation: translateZ(20px), box-shadow elevation
- Stagger entrance: 50ms delay per card, fade-in from y: 20
```

**Phase 4 - Emotion Galaxy:**
```
3D scene layout:
- 6 emotion orbs positioned in spherical formation
- Each orb: 100-unit radius mesh with gradient material
- Photos: 20-unit textured planes orbiting emotion centers
- Distance from center = intensity score * 50 units
- Camera position: z: 500, looking at scene center
- Click emotion orb: camera flies to z: 150, focused on orb
```

### Responsive Breakpoints
- Mobile: 375px - 639px (1-2 column grids, bottom sheet filters)
- Tablet: 640px - 1023px (3-4 column grids, sidebar filters)
- Desktop: 1024px+ (5-6 column grids, floating filter orbs)
- Phase 4 3D: Desktop only initially, mobile uses 2D fallback

## Reusable Components

### Existing Code to Leverage

**Design Tokens:**
- `src/lib/motion-tokens.ts` - MOTION, EMOTION_PALETTE, EMOTION_ICONS, PLAY_TYPE_ICONS
- Already defines 6 emotions with primary colors, gradients, glows
- Spring animations: gentle (stiffness: 120), responsive (300), snappy (400)
- Duration scale: instant (0.1s), fast (0.2s), base (0.3s), slow (0.5s)

**Components:**
- `src/components/interactions/MagneticFilterOrb.tsx` - Fully built, needs UI integration
- `src/components/common/EmptyState.tsx` - 5 state types with emotion-colored icons
- `src/components/portfolio/PortfolioGrid.tsx` - Grid with sort controls, hover states
- `src/components/filters/PhotoFilters.tsx` - Filter logic exists, needs magnetic UI

**Story Curation:**
- `src/lib/story-curation/narrative-arcs.ts` - 6 detection functions fully implemented
- Algorithms: game-winning rally, player highlight, season journey, comeback, technical excellence, emotion spectrum
- Returns NarrativeArc with photos, title, description, emotional curve

**Types:**
- `src/types/photo.ts` - PhotoMetadata interface with all AI-enriched fields
- Includes: sharpness, composition_score, emotional_impact, portfolio_worthy, emotion, play_type, action_intensity

### New Components Required

**Phase 2:**

1. **EmotionNavigationCards** (new)
   - Why new: Homepage emotion entry points don't exist
   - Uses: EMOTION_PALETTE for styling, EMOTION_ICONS for icons
   - Cannot reuse: No existing emotion navigation UI

2. **QualityBadge** (new)
   - Why new: No visual quality indicators in grid
   - Displays: Portfolio-worthy, print-ready, social-media-optimized flags
   - Cannot reuse: PortfolioGrid has basic badges but needs enhancement

3. **StoryGenerationModal** (new)
   - Why new: No story creation UI exists
   - Displays: 6 story type options with icons and previews
   - Cannot reuse: Story viewer exists but not generation interface

**Phase 3:**

4. **SharedElementTransition** (new)
   - Why new: No layout animation between pages
   - Uses: Framer Motion layoutId for morphing
   - Cannot reuse: Basic page transitions exist but not shared elements

**Phase 4:**

5. **EmotionGalaxy3D** (new)
   - Why new: 3D spatial navigation doesn't exist
   - Uses: @react-three/fiber, EMOTION_PALETTE for orb colors
   - Cannot reuse: Completely novel interaction paradigm

6. **PhotoParticleSystem** (new)
   - Why new: Photos need to exist as 3D objects
   - Uses: THREE.PlaneGeometry with photo textures
   - Cannot reuse: Current photo rendering is 2D

7. **StoryConstellation** (new)
   - Why new: Story paths need 3D visualization
   - Uses: THREE.Line to connect related photos in 3D space
   - Cannot reuse: EmotionTimeline exists but is 2D

## Technical Approach

### Database
No database changes required. All metadata already exists in `photo_metadata` table:
- Quality scores: sharpness, exposure_accuracy, composition_score, emotional_impact
- Flags: portfolio_worthy, print_ready, social_media_optimized
- Enums: emotion, play_type, action_intensity
- Indexes already optimized for filtering

**Query Pattern (Phase 2):**
```typescript
// Filter by emotion
const photos = await supabase
  .from('photo_metadata')
  .select('*')
  .eq('emotion', 'triumph')
  .order('composition_score', { ascending: false });

// Portfolio-worthy photos
const portfolio = await supabase
  .from('photo_metadata')
  .select('*')
  .eq('portfolio_worthy', true)
  .order('emotional_impact', { ascending: false });
```

### API
Existing story generation API already built:
- `POST /api/stories/generate` - Takes story type, returns NarrativeArc
- `GET /api/stories/[id]` - Retrieves story by ID

**New endpoints needed (Phase 4):**
```typescript
// Get photos for 3D positioning
GET /api/photos/spatial-data
Query params: emotion?, playType?, minQuality?
Returns: Array<{
  id: string,
  emotion: string,
  intensity: number, // 0-10 for distance calculation
  imageUrl: string,
  position: { x: number, y: number, z: number } // pre-calculated
}>
```

### Frontend

**State Management (Phase 2):**
```typescript
// Global emotion context
const EmotionContext = createContext<{
  activeEmotion: EmotionType | null;
  setActiveEmotion: (emotion: EmotionType | null) => void;
}>({...});

// Persists across navigation
// Drives page theme colors, filter defaults
```

**Component Hierarchy (Phase 2-3):**
```
Layout
├── EmotionProvider (context for active emotion)
├── Header
├── Main
│   ├── Homepage
│   │   ├── EmotionNavigationCards (6 cards)
│   │   └── RecentStoriesCarousel
│   ├── Portfolio
│   │   ├── MagneticFilterBar (orbs)
│   │   ├── PortfolioGrid (enhanced)
│   │   │   ├── QualityBadge
│   │   │   └── EmotionHalo (2px glow)
│   │   └── StoryGenerationModal
│   └── PhotoDetail
│       ├── SharedElementTransition
│       └── EmotionIndicator
└── Footer
```

**3D Rendering Pipeline (Phase 4):**
```
EmotionGalaxy3D
├── Canvas (@react-three/fiber)
│   ├── Camera (PerspectiveCamera)
│   ├── OrbitControls (@react-three/drei)
│   ├── EmotionOrbs (6 meshes)
│   │   ├── SphereGeometry (radius: 100)
│   │   ├── MeshStandardMaterial (gradient texture)
│   │   └── PointLight (emotion-colored glow)
│   ├── PhotoParticleSystem (photos as planes)
│   │   ├── PlaneGeometry (20x20 units)
│   │   ├── MeshBasicMaterial (photo texture)
│   │   └── Position based on emotion + intensity
│   └── StoryConstellations (paths)
│       └── Line (connects photos in story)
└── UI Overlay (2D controls)
    ├── EmotionLegend
    ├── ViewToggle (2D/2.5D/3D)
    └── KeyboardHints
```

**Animation System:**
- Phase 1-3: Framer Motion for all animations
- Phase 4: Combination of Framer Motion (UI) + GSAP (camera flights) + THREE.js (3D)

```typescript
// Camera flight animation (Phase 4)
import gsap from 'gsap';

function flyToEmotion(emotionOrb: THREE.Mesh, camera: THREE.Camera) {
  const targetPos = emotionOrb.position.clone().add(new THREE.Vector3(0, 0, 150));

  gsap.to(camera.position, {
    x: targetPos.x,
    y: targetPos.y,
    z: targetPos.z,
    duration: 1.5,
    ease: 'power2.inOut',
    onUpdate: () => {
      camera.lookAt(emotionOrb.position);
    }
  });
}
```

### Testing

**Phase 1:**
- Playwright visual regression: Verify browse page renders without error
- Accessibility audit: axe-core checks for landmarks, headings, focus indicators
- Keyboard navigation: Tab through all interactive elements

**Phase 2:**
- Visual regression: Emotion cards render with correct colors
- User journey: Filter by emotion → See filtered results
- Snapshot: MagneticFilterOrb active states
- A11y: Emotion filter chips keyboard accessible

**Phase 3:**
- Visual regression: Shared element transitions render correctly
- Performance: Maintain 60fps during animations
- User journey: Grid → Detail → Back preserves scroll position
- Mobile: Touch gestures work on actual devices

**Phase 4:**
- 3D interaction: Click emotion orb → Camera flies correctly
- Performance: Maintain 30fps minimum with 100+ photos in scene
- Keyboard: Arrow keys navigate 3D space
- Fallback: WebGL unsupported → Falls back to 2D grid
- Visual: Story constellations render paths correctly

## Detailed Phase Specifications

### Phase 1: Foundation Fixes (Week 1)

**Goal:** Production-ready baseline with zero critical bugs.

**Task 1.1: Fix Browse Page Error**
```typescript
// next.config.js
const nextConfig = {
  images: {
    domains: ['photos.smugmug.com'],
    qualities: [50, 75, 85, 90, 100], // Add 85 to valid qualities
  },
};
```
- Error: Invalid quality prop (85) on next/image
- Fix: Update next.config.js images.qualities array
- Test: Browse page renders without error
- Priority: BLOCKER

**Task 1.2: Add Semantic HTML Landmarks**
```typescript
// Layout structure for all pages
<body>
  <nav aria-label="Main navigation">...</nav>
  <main id="main-content">
    {/* Page content */}
  </main>
  <footer>...</footer>
</body>

// Skip link in Header
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```
- Add: main, nav, section, aside landmarks
- Pages affected: Homepage, Portfolio, Browse, Search, Stories
- Test: Screen reader announces landmarks correctly

**Task 1.3: Implement Skeleton Loaders**
```typescript
// PhotoSkeleton.tsx (exists, needs integration)
export function PhotoGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-square bg-gray-800 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

// Usage in PortfolioGrid
{isLoading ? <PhotoGridSkeleton count={12} /> : <ActualGrid />}
```
- Add to: PortfolioGrid, Browse, Search results
- Animation: Pulse (shimmer effect)
- Count: 12 skeletons minimum

**Task 1.4: Add Visible Focus Indicators**
```css
/* globals.css */
*:focus-visible {
  outline: 2px solid var(--color-accent); /* #00BFFF */
  outline-offset: 2px;
  border-radius: 4px;
}

/* Emotion-specific focus for filtered items */
[data-emotion="triumph"]:focus-visible {
  outline-color: #FFD700;
}
```
- Target: All interactive elements (buttons, links, inputs, cards)
- Color: Accent cyan (#00BFFF) default, emotion-specific when in emotion context
- Thickness: 2px
- Test: Tab through page, verify visible focus ring

**Task 1.5: Verify Lazy Loading**
```typescript
// Verify Next.js Image lazy loading
<Image
  src={photo.image_url}
  alt={photo.title}
  loading="lazy" // Default, verify it's working
  placeholder="blur"
  blurDataURL={generateBlurDataURL()} // Low-quality placeholder
/>

// Intersection Observer for non-image content
const { ref, inView } = useInView({
  triggerOnce: true,
  threshold: 0.1,
});
```
- Verify: Images below fold don't load until scrolled into view
- Test: Network tab shows images loading progressively
- Metrics: LCP (Largest Contentful Paint) < 2.5s

**Task 1.6: Add Loading States**
```typescript
// Loading states for all async operations
function PortfolioPage() {
  const { data: photos, isLoading, error } = useSWR('/api/photos');

  if (isLoading) return <PhotoGridSkeleton />;
  if (error) return <ErrorState error={error} />;
  return <PortfolioGrid photos={photos} />;
}

// Button loading states
<Button disabled={isLoading}>
  {isLoading ? <Spinner size="sm" /> : 'Generate Story'}
</Button>
```
- Add to: Photo fetching, story generation, search queries
- Indicators: Skeleton loaders, spinners, progress bars
- Disable: Buttons during async operations

**Success Criteria:**
- ✅ Browse page renders without errors
- ✅ All pages have main, nav landmarks
- ✅ Skeleton loaders visible during loading
- ✅ Focus indicators visible on all interactive elements (2px outline)
- ✅ Images lazy load below fold
- ✅ All async operations show loading states

---

### Phase 2: Surface Innovations (Weeks 2-3)

**Goal:** Make invisible AI features visible and primary navigation paradigm.

**Task 2.1: Implement Emotion Navigation Cards**

Component structure:
```typescript
// src/components/navigation/EmotionNavigationCards.tsx
import { EMOTION_PALETTE, EMOTION_ICONS } from '@/lib/motion-tokens';
import { motion } from 'framer-motion';

const EMOTIONS = ['triumph', 'intensity', 'focus', 'determination', 'excitement', 'serenity'] as const;

export function EmotionNavigationCards({ photoCounts }: { photoCounts: Record<string, number> }) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
      {EMOTIONS.map(emotion => (
        <motion.button
          key={emotion}
          className="emotion-card relative overflow-hidden rounded-xl p-6 aspect-square"
          style={{
            background: EMOTION_PALETTE[emotion].gradient,
            boxShadow: EMOTION_PALETTE[emotion].glow,
          }}
          whileHover={{ scale: 1.05, boxShadow: `0 0 60px ${EMOTION_PALETTE[emotion].primary}` }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push(`/portfolio?emotion=${emotion}`)}
        >
          <div className="flex flex-col items-center justify-center h-full text-white">
            <span className="text-5xl mb-3">{EMOTION_ICONS[emotion]}</span>
            <span className="text-xl font-semibold capitalize">{emotion}</span>
            <span className="text-sm opacity-80 mt-1">{photoCounts[emotion]} photos</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
```

Homepage integration:
```typescript
// src/app/page.tsx
export default async function HomePage() {
  // Fetch photo counts by emotion
  const photoCounts = await getPhotoCountsByEmotion();

  return (
    <main>
      <section className="container mx-auto px-4 py-12">
        <Heading level={1} className="text-center mb-8">
          Explore by Emotion
        </Heading>
        <EmotionNavigationCards photoCounts={photoCounts} />
      </section>

      <section className="container mx-auto px-4 py-12">
        <Heading level={2} className="mb-6">Recent Stories</Heading>
        <RecentStoriesCarousel />
      </section>
    </main>
  );
}
```

**Task 2.2: Activate MagneticFilterOrb**

Integration in portfolio page:
```typescript
// src/components/filters/MagneticFilterBar.tsx
import { MagneticFilterOrb } from '@/components/interactions/MagneticFilterOrb';
import { EMOTION_ICONS } from '@/lib/motion-tokens';

export function MagneticFilterBar({ activeFilters, onToggle }: FilterBarProps) {
  const emotions = ['triumph', 'intensity', 'focus', 'determination', 'excitement', 'serenity'] as const;

  return (
    <div className="relative min-h-[120px] flex items-center justify-center gap-4 mb-8">
      {/* Instructions hint */}
      <motion.div
        className="absolute top-0 text-sm text-gray-400"
        initial={{ opacity: 1 }}
        animate={{ opacity: activeFilters.length > 0 ? 0 : 1 }}
      >
        Hover near a filter to activate magnetic attraction
      </motion.div>

      {/* Magnetic filter orbs */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {emotions.map(emotion => (
          <MagneticFilterOrb
            key={emotion}
            label={emotion}
            icon={EMOTION_ICONS[emotion]}
            active={activeFilters.includes(emotion)}
            onClick={() => onToggle(emotion)}
            emotionType={emotion}
            magneticRadius={100}
          />
        ))}
      </div>
    </div>
  );
}
```

Enhanced visual affordances:
```typescript
// Add pulse animation to inactive orbs
const orbVariants = {
  inactive: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  active: {
    scale: 1,
  },
};
```

**Task 2.3: Quality Stratification**

Enhanced PortfolioGrid:
```typescript
// src/components/portfolio/PortfolioGrid.tsx (enhancement)
export function PortfolioGrid({ photos }: { photos: Photo[] }) {
  // Separate portfolio-worthy photos
  const portfolioPhotos = photos.filter(p => p.metadata?.portfolio_worthy);
  const regularPhotos = photos.filter(p => !p.metadata?.portfolio_worthy);

  // Sort portfolio photos by quality
  const sortedPortfolio = portfolioPhotos.sort((a, b) => {
    const scoreA = calculateQualityScore(a.metadata);
    const scoreB = calculateQualityScore(b.metadata);
    return scoreB - scoreA;
  });

  return (
    <div className="portfolio-grid">
      {/* Portfolio-worthy section (always top) */}
      {sortedPortfolio.length > 0 && (
        <section className="mb-12">
          <Heading level={2} className="mb-6 flex items-center gap-2">
            <span className="text-yellow-500">⭐</span>
            Portfolio Highlights
          </Heading>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedPortfolio.map(photo => (
              <PortfolioCard
                key={photo.id}
                photo={photo}
                size="large" // 2x size
                badge="portfolio"
                shimmer={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Regular photos */}
      <section>
        <Heading level={2} className="mb-6">All Photos</Heading>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {regularPhotos.map(photo => (
            <PortfolioCard
              key={photo.id}
              photo={photo}
              size="regular"
              opacity={calculateOpacity(photo.metadata)} // 70-100% based on quality
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// Quality badge component
function QualityBadge({ type }: { type: 'portfolio' | 'print' | 'social' }) {
  const config = {
    portfolio: { icon: '⭐', label: 'Portfolio', color: 'bg-yellow-500' },
    print: { icon: '🖨️', label: 'Print Ready', color: 'bg-green-500' },
    social: { icon: '📱', label: 'Social', color: 'bg-blue-500' },
  };

  const { icon, label, color } = config[type];

  return (
    <span className={`${color} text-white text-xs px-2 py-1 rounded-full inline-flex items-center gap-1`}>
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
```

Opacity calculation:
```typescript
function calculateOpacity(metadata: PhotoMetadata | null): number {
  if (!metadata) return 0.7;

  const avgQuality = (
    metadata.sharpness +
    metadata.composition_score +
    metadata.exposure_accuracy +
    metadata.emotional_impact
  ) / 4;

  // Map quality 0-10 to opacity 0.7-1.0
  return 0.7 + (avgQuality / 10) * 0.3;
}
```

**Task 2.4: Emotion Halos**

Add subtle glows to photo cards:
```typescript
// Enhanced PhotoCard component
function PhotoCard({ photo }: { photo: Photo }) {
  const emotion = photo.metadata?.emotion;
  const emotionGlow = emotion ? EMOTION_PALETTE[emotion].glow : null;

  return (
    <motion.div
      className="photo-card relative rounded-lg overflow-hidden"
      style={{
        boxShadow: emotion ? emotionGlow : 'none',
      }}
      whileHover={{
        boxShadow: emotion ? `0 0 60px ${EMOTION_PALETTE[emotion].primary}` : undefined,
      }}
    >
      <Image src={photo.image_url} alt={photo.title} fill />

      {/* Emotion indicator corner */}
      {emotion && (
        <div
          className="absolute top-2 right-2 w-3 h-3 rounded-full"
          style={{ backgroundColor: EMOTION_PALETTE[emotion].primary }}
        />
      )}
    </motion.div>
  );
}
```

**Task 2.5: Story Discovery UI**

Story generation modal:
```typescript
// src/components/story/StoryGenerationModal.tsx
import { motion, AnimatePresence } from 'framer-motion';

const STORY_TYPES = [
  {
    type: 'game-winning-rally',
    icon: '🏆',
    title: 'Game-Winning Rally',
    description: 'Final moments that secured victory',
  },
  {
    type: 'player-highlight',
    icon: '⭐',
    title: 'Player Highlight Reel',
    description: 'Portfolio-quality moments from a player',
  },
  {
    type: 'season-journey',
    icon: '📅',
    title: 'Season Journey',
    description: 'Pivotal moments that defined the season',
  },
  {
    type: 'comeback-story',
    icon: '💪',
    title: 'Comeback Story',
    description: 'From adversity to victory',
  },
  {
    type: 'technical-excellence',
    icon: '🎯',
    title: 'Technical Excellence',
    description: 'Portfolio-quality shots showcasing skill',
  },
  {
    type: 'emotion-spectrum',
    icon: '🌈',
    title: 'Emotion Spectrum',
    description: 'Full emotional journey of the game',
  },
] as const;

export function StoryGenerationModal({ isOpen, onClose, photos }: ModalProps) {
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  async function handleGenerate() {
    if (!selectedType) return;

    setGenerating(true);
    const story = await generateStory(selectedType, photos);
    router.push(`/stories/${story.id}`);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 rounded-xl p-8 max-w-3xl w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <Heading level={2} className="mb-6">Generate a Story</Heading>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {STORY_TYPES.map(story => (
                <motion.button
                  key={story.type}
                  className={`p-4 rounded-lg border-2 text-left ${
                    selectedType === story.type
                      ? 'border-accent bg-accent/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedType(story.type)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-3xl mb-2">{story.icon}</div>
                  <div className="font-semibold mb-1">{story.title}</div>
                  <div className="text-sm text-gray-400">{story.description}</div>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-4">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button
                variant="primary"
                onClick={handleGenerate}
                disabled={!selectedType || generating}
              >
                {generating ? 'Generating...' : 'Generate Story'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

CTA button in portfolio:
```typescript
// Portfolio page
<Button
  variant="primary"
  size="lg"
  onClick={() => setModalOpen(true)}
  className="fixed bottom-8 right-8 shadow-2xl"
>
  ✨ Generate Story
</Button>

<StoryGenerationModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  photos={photos}
/>
```

**Success Criteria:**
- ✅ 6 emotion cards on homepage using EMOTION_PALETTE
- ✅ MagneticFilterOrb active and discoverable on portfolio page
- ✅ Photo grids show emotion halos (2px glow)
- ✅ Portfolio-worthy photos visually distinct (2x size, gold badges)
- ✅ Story generation UI accessible from portfolio
- ✅ User can filter by emotion and see visual feedback

---

### Phase 3: Microinteractions & Polish (Weeks 4-5)

**Goal:** Add delight, fluidity, and physics-based interactions.

**Task 3.1: Shared Element Transitions**

Implementation using Framer Motion layoutId:
```typescript
// Shared layout ID on grid and detail views
// Grid view (PortfolioGrid)
<motion.div
  layoutId={`photo-${photo.id}`}
  className="photo-card"
  onClick={() => router.push(`/photo/${photo.id}`)}
>
  <Image src={photo.image_url} alt={photo.title} fill />
</motion.div>

// Detail view (PhotoDetailPage)
<motion.div
  layoutId={`photo-${photo.id}`}
  className="photo-detail"
>
  <Image src={photo.image_url} alt={photo.title} fill />
</motion.div>
```

Page transition orchestration:
```typescript
// Layout with AnimatePresence
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

**Task 3.2: Photo Card Physics**

Cursor repulsion effect:
```typescript
// Enhanced PhotoCard with repulsion
function PhotoCard({ photo }: { photo: Photo }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 300 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.hypot(distanceX, distanceY);

    // Repulsion within 50px
    if (distance < 50) {
      const strength = (50 - distance) / 50;
      const pushX = -distanceX * strength * 0.3;
      const pushY = -distanceY * strength * 0.3;

      x.set(pushX);
      y.set(pushY);
    } else {
      x.set(0);
      y.set(0);
    }

    // 3D tilt based on cursor position
    const rotateXValue = ((e.clientY - centerY) / rect.height) * -10; // -10 to 10 degrees
    const rotateYValue = ((e.clientX - centerX) / rect.width) * 10;

    rotateX.set(rotateXValue);
    rotateY.set(rotateYValue);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      className="photo-card"
      style={{
        x: xSpring,
        y: ySpring,
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05, z: 50 }}
    >
      <Image src={photo.image_url} alt={photo.title} fill />
    </motion.div>
  );
}
```

Stagger fade-in on grid load:
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 50ms between each card
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

<motion.div
  className="photo-grid"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {photos.map(photo => (
    <motion.div key={photo.id} variants={itemVariants}>
      <PhotoCard photo={photo} />
    </motion.div>
  ))}
</motion.div>
```

**Task 3.3: Scroll-Linked Animations**

Parallax implementation:
```typescript
import { useScroll, useTransform } from 'framer-motion';

function ParallaxSection() {
  const { scrollY } = useScroll();

  // Background moves at 0.5x scroll speed
  const bgY = useTransform(scrollY, [0, 1000], [0, -500]);

  // Mid-ground at 1x (normal)
  // Foreground at 1.2x
  const fgY = useTransform(scrollY, [0, 1000], [0, 200]);

  return (
    <div className="relative">
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"
        style={{ y: bgY }}
      />

      <div className="relative z-10">
        {/* Normal content */}
      </div>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: fgY }}
      >
        {/* Foreground decoration */}
      </motion.div>
    </div>
  );
}
```

Emotion-colored scroll indicator:
```typescript
function EmotionScrollIndicator() {
  const { scrollYProgress } = useScrollProgress();
  const emotion = useContext(EmotionContext).activeEmotion;

  const color = emotion ? EMOTION_PALETTE[emotion].primary : '#00BFFF';

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-50"
      style={{
        scaleX: scrollYProgress,
        backgroundColor: color,
        transformOrigin: '0%',
      }}
    />
  );
}
```

**Task 3.4: Enhanced Empty States**

Animated EmptyState component:
```typescript
// Enhance existing EmptyState with animations
export function EmptyState({ type, ...props }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Icon className="..." />
      </motion.div>

      {/* Rest of empty state content */}
    </motion.div>
  );
}
```

**Success Criteria:**
- ✅ Shared element transitions work for grid → detail
- ✅ Photo cards respond to cursor proximity (repulsion + tilt)
- ✅ Page transitions animated and smooth
- ✅ All interactions maintain 60fps
- ✅ Parallax scrolling adds depth
- ✅ Empty states have personality

---

### Phase 4: Emotion Galaxy (Weeks 6-10)

**Goal:** Achieve "never-before-seen" status with 3D spatial emotion navigation.

**Overview:**
Transform the portfolio from a 2D grid into a 3D "Emotion Galaxy" where photos orbit emotional centers like planets around stars. Users fly through emotional space, discovering photos by spatial exploration rather than conventional filtering.

**Task 4.1: Core 3D Engine Setup (Weeks 6-7)**

Install dependencies:
```bash
pnpm add @react-three/fiber @react-three/drei three
pnpm add -D @types/three
```

Basic scene setup:
```typescript
// src/components/galaxy/EmotionGalaxy3D.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';

export function EmotionGalaxy3D({ photos }: { photos: Photo[] }) {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas>
        <Suspense fallback={<LoadingIndicator />}>
          <PerspectiveCamera makeDefault position={[0, 0, 500]} fov={75} />
          <OrbitControls enableDamping dampingFactor={0.05} />

          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[0, 0, 0]} intensity={1} />

          {/* Scene components */}
          <EmotionOrbs />
          <PhotoParticleSystem photos={photos} />
        </Suspense>
      </Canvas>

      {/* 2D UI overlay */}
      <UIOverlay />
    </div>
  );
}
```

**Task 4.2: Emotion Orb Meshes**

Create 6 emotion orbs positioned in spherical formation:
```typescript
// src/components/galaxy/EmotionOrbs.tsx
import { useRef } from 'react';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { EMOTION_PALETTE } from '@/lib/motion-tokens';

const EMOTIONS = ['triumph', 'intensity', 'focus', 'determination', 'excitement', 'serenity'] as const;

// Position orbs in spherical formation
const POSITIONS: Record<string, [number, number, number]> = {
  triumph: [200, 150, 0],      // Top right
  intensity: [200, -150, 0],   // Bottom right
  focus: [-200, 150, 0],       // Top left
  determination: [-200, -150, 0], // Bottom left
  excitement: [0, 200, -100],  // Top center back
  serenity: [0, -200, 100],    // Bottom center front
};

function EmotionOrb({ emotion }: { emotion: typeof EMOTIONS[number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  // Create gradient texture for orb
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Radial gradient matching EMOTION_PALETTE
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, EMOTION_PALETTE[emotion].primary);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    return new THREE.CanvasTexture(canvas);
  }, [emotion]);

  return (
    <group position={POSITIONS[emotion]}>
      <Sphere ref={meshRef} args={[100, 32, 32]}>
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={0.6}
          emissive={EMOTION_PALETTE[emotion].primary}
          emissiveIntensity={0.5}
        />
      </Sphere>

      {/* Glow light */}
      <pointLight
        ref={glowRef}
        color={EMOTION_PALETTE[emotion].primary}
        intensity={2}
        distance={300}
      />
    </group>
  );
}

export function EmotionOrbs() {
  return (
    <>
      {EMOTIONS.map(emotion => (
        <EmotionOrb key={emotion} emotion={emotion} />
      ))}
    </>
  );
}
```

**Task 4.3: Photo Particle System**

Position photos as textured planes orbiting emotion centers:
```typescript
// src/components/galaxy/PhotoParticleSystem.tsx
import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface PhotoParticle {
  photo: Photo;
  position: [number, number, number];
  emotionCenter: [number, number, number];
}

export function PhotoParticleSystem({ photos }: { photos: Photo[] }) {
  // Calculate positions based on emotion and intensity
  const particles = useMemo(() => {
    return photos.map(photo => {
      const emotion = photo.metadata?.emotion || 'focus';
      const intensity = photo.metadata?.emotional_impact || 5;

      // Get emotion orb center position
      const emotionCenter = POSITIONS[emotion];

      // Distance from center based on intensity (higher intensity = closer)
      const distance = 50 + (10 - intensity) * 30; // 50-350 units

      // Random angle for orbital position
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      // Spherical coordinates
      const x = emotionCenter[0] + distance * Math.sin(phi) * Math.cos(theta);
      const y = emotionCenter[1] + distance * Math.sin(phi) * Math.sin(theta);
      const z = emotionCenter[2] + distance * Math.cos(phi);

      return {
        photo,
        position: [x, y, z] as [number, number, number],
        emotionCenter,
      };
    });
  }, [photos]);

  return (
    <>
      {particles.map(({ photo, position }) => (
        <PhotoParticle key={photo.id} photo={photo} position={position} />
      ))}
    </>
  );
}

function PhotoParticle({ photo, position }: { photo: Photo; position: [number, number, number] }) {
  const texture = useTexture(photo.image_url);
  const meshRef = useRef<THREE.Mesh>(null);

  // Rotate to face camera
  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}
```

**Task 4.4: Camera Flight Animations**

Implement smooth camera transitions between emotional zones:
```typescript
// src/components/galaxy/CameraController.tsx
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';

export function useCameraFlight() {
  const { camera } = useThree();

  function flyToEmotion(emotion: EmotionType) {
    const targetPosition = POSITIONS[emotion];

    // Calculate camera position (150 units in front of orb)
    const cameraPos = [
      targetPosition[0],
      targetPosition[1],
      targetPosition[2] + 150,
    ];

    gsap.to(camera.position, {
      x: cameraPos[0],
      y: cameraPos[1],
      z: cameraPos[2],
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        camera.lookAt(targetPosition[0], targetPosition[1], targetPosition[2]);
      },
    });
  }

  function flyToOverview() {
    gsap.to(camera.position, {
      x: 0,
      y: 0,
      z: 500,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        camera.lookAt(0, 0, 0);
      },
    });
  }

  return { flyToEmotion, flyToOverview };
}

// Usage in EmotionGalaxy3D
function EmotionGalaxy3D() {
  const { flyToEmotion, flyToOverview } = useCameraFlight();

  return (
    <>
      <Canvas>...</Canvas>

      {/* Emotion selector UI */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        {EMOTIONS.map(emotion => (
          <button
            key={emotion}
            onClick={() => flyToEmotion(emotion)}
            className="w-12 h-12 rounded-full"
            style={{ background: EMOTION_PALETTE[emotion].gradient }}
          >
            {EMOTION_ICONS[emotion]}
          </button>
        ))}
        <button onClick={flyToOverview}>↩️</button>
      </div>
    </>
  );
}
```

**Task 4.5: Story Constellation Paths**

Visualize story narratives as connected paths in 3D:
```typescript
// src/components/galaxy/StoryConstellation.tsx
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface StoryConstellationProps {
  story: NarrativeArc;
  particles: PhotoParticle[];
}

export function StoryConstellation({ story, particles }: StoryConstellationProps) {
  // Get positions of photos in this story
  const points = useMemo(() => {
    return story.photos.map(photo => {
      const particle = particles.find(p => p.photo.id === photo.id);
      return particle ? new THREE.Vector3(...particle.position) : null;
    }).filter(Boolean) as THREE.Vector3[];
  }, [story, particles]);

  if (points.length < 2) return null;

  // Get dominant emotion color for line
  const emotionCounts = story.photos.reduce((acc, p) => {
    const emotion = p.metadata?.emotion || 'focus';
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantEmotion = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)[0][0];

  const lineColor = EMOTION_PALETTE[dominantEmotion].primary;

  return (
    <Line
      points={points}
      color={lineColor}
      lineWidth={2}
      dashed
      dashScale={50}
      dashSize={10}
      gapSize={5}
    />
  );
}
```

**Task 4.6: 2D/2.5D/3D View Toggle**

Implement mode switching:
```typescript
// View mode state
type ViewMode = '2d' | '2.5d' | '3d';

function EmotionGalaxy() {
  const [viewMode, setViewMode] = useState<ViewMode>('3d');

  // Toggle with D key
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (e.key === 'd' || e.key === 'D') {
        setViewMode(prev => {
          if (prev === '2d') return '2.5d';
          if (prev === '2.5d') return '3d';
          return '2d';
        });
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="relative w-full h-screen">
      {viewMode === '2d' && <PortfolioGrid photos={photos} />}
      {viewMode === '2.5d' && <IsometricView photos={photos} />}
      {viewMode === '3d' && <EmotionGalaxy3D photos={photos} />}

      {/* View mode indicator */}
      <div className="fixed top-4 right-4 bg-black/80 px-4 py-2 rounded-lg">
        View Mode: {viewMode.toUpperCase()} (Press D to toggle)
      </div>
    </div>
  );
}
```

**Task 4.7: Keyboard Navigation in 3D**

Implement accessible keyboard controls:
```typescript
// Keyboard navigation for 3D space
function use3DKeyboardNavigation() {
  const { camera } = useThree();
  const [focusedPhotoIndex, setFocusedPhotoIndex] = useState(0);
  const [focusedEmotion, setFocusedEmotion] = useState<EmotionType | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch(e.key) {
        case 'ArrowUp':
          // Move to previous photo in current emotion zone
          setFocusedPhotoIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          // Move to next photo
          setFocusedPhotoIndex(prev => prev + 1);
          break;
        case 'ArrowLeft':
          // Switch to previous emotion zone
          const prevIndex = EMOTIONS.indexOf(focusedEmotion!) - 1;
          if (prevIndex >= 0) setFocusedEmotion(EMOTIONS[prevIndex]);
          break;
        case 'ArrowRight':
          // Switch to next emotion zone
          const nextIndex = EMOTIONS.indexOf(focusedEmotion!) + 1;
          if (nextIndex < EMOTIONS.length) setFocusedEmotion(EMOTIONS[nextIndex]);
          break;
        case 'Enter':
        case ' ':
          // Select focused photo
          openPhotoDetail(focusedPhotoIndex);
          break;
        case 'Escape':
          // Return to overview
          flyToOverview();
          setFocusedEmotion(null);
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedPhotoIndex, focusedEmotion]);

  return { focusedPhotoIndex, focusedEmotion };
}
```

**Task 4.8: Performance Optimization**

Implement LOD and frustum culling:
```typescript
// LOD system for photos
function PhotoParticle({ photo, position }: PhotoParticleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  // Calculate distance from camera
  const [lod, setLod] = useState<'high' | 'medium' | 'low'>('high');

  useFrame(() => {
    if (!meshRef.current) return;

    const distance = camera.position.distanceTo(meshRef.current.position);

    if (distance < 200) setLod('high');
    else if (distance < 400) setLod('medium');
    else setLod('low');
  });

  // Load different quality textures based on LOD
  const textureUrl = useMemo(() => {
    if (lod === 'high') return photo.image_url;
    if (lod === 'medium') return photo.image_url + '?w=512';
    return photo.image_url + '?w=256';
  }, [photo, lod]);

  const texture = useTexture(textureUrl);

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

// Frustum culling (automatic in Three.js, but can optimize with manual checks)
function PhotoParticleSystem({ photos }: { photos: Photo[] }) {
  const { camera } = useThree();
  const frustum = useMemo(() => new THREE.Frustum(), []);

  useFrame(() => {
    const projScreenMatrix = new THREE.Matrix4();
    projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(projScreenMatrix);
  });

  return (
    <>
      {particles.map(particle => {
        const inView = frustum.containsPoint(new THREE.Vector3(...particle.position));
        return inView ? <PhotoParticle key={particle.photo.id} {...particle} /> : null;
      })}
    </>
  );
}
```

**Task 4.9: WebGL Fallback**

Detect WebGL support and provide fallback:
```typescript
// Detect WebGL support
function detectWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

// Conditional rendering
export default function GalaxyPage() {
  const [supportsWebGL] = useState(detectWebGLSupport());

  if (!supportsWebGL) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2">3D View Unavailable</h2>
          <p>Your browser doesn't support WebGL. Showing 2D grid view instead.</p>
        </div>
        <PortfolioGrid photos={photos} />
      </div>
    );
  }

  return <EmotionGalaxy3D photos={photos} />;
}
```

**Success Criteria:**
- ✅ Emotion Galaxy 3D view functional
- ✅ 6 emotion orbs positioned correctly with gradients
- ✅ Photos orbit emotion centers based on intensity
- ✅ Camera flies between emotional spaces smoothly (1.5s duration)
- ✅ Story constellations render paths connecting photos
- ✅ Toggle between 2D/2.5D/3D works (D key)
- ✅ Keyboard navigation works in 3D space (arrow keys, tab, space, escape)
- ✅ Performance maintained (30fps minimum, 60fps target)
- ✅ WebGL fallback to 2D for unsupported browsers
- ✅ LOD system reduces texture quality for distant photos

---

## Design System Integration

### EMOTION_PALETTE Usage

**Phase 2:**
- Emotion navigation cards: gradient backgrounds, glow box-shadows
- Filter orbs: border colors when active, glow on hover
- Photo card halos: 2px box-shadow in emotion color
- Quality badges: Gold (#FFD700) for portfolio-worthy

**Phase 3:**
- Page themes: Background gradient shifts based on active emotion
- Scroll indicators: Progress bar color matches emotion
- Shared element transitions: Emotion color highlights during morph

**Phase 4:**
- 3D orb materials: Emissive color matches EMOTION_PALETTE.primary
- Point lights: Glow color matches emotion
- Story constellations: Line color matches dominant story emotion
- UI overlay buttons: Background gradient from EMOTION_PALETTE

### MOTION Tokens

**Spring Animations:**
- `MOTION.spring.gentle`: Emotion card hover, photo card entrance
- `MOTION.spring.responsive`: Magnetic orb attraction, cursor repulsion
- `MOTION.spring.snappy`: Button press, filter toggle

**Duration Scale:**
- `MOTION.duration.instant (0.1s)`: Focus indicators
- `MOTION.duration.fast (0.2s)`: Button hover, filter chip toggle
- `MOTION.duration.base (0.3s)`: Photo card fade-in, page transitions
- `MOTION.duration.slow (0.5s)`: Shared element morph, parallax scroll

**Easing:**
- `MOTION.ease.easeOut`: Most animations (smooth deceleration)
- `MOTION.ease.easeInOut`: Symmetric animations (modal open/close)
- `MOTION.ease.anticipate`: Playful interactions (achievement badges)

### Typography Scale

Existing components already use `Heading` and `Text` from `src/components/ui/Typography.tsx`:
- H1: Homepage "Explore by Emotion" (40px)
- H2: Section headings "Portfolio Highlights" (32px)
- H3: Modal titles "Generate a Story" (24px)
- Body: Descriptions, captions (16px)
- Label: Metadata, badges (14px)

### Spacing System

Consistent with Tailwind's spacing scale:
- `gap-2` (8px): Grid items on mobile
- `gap-4` (16px): Filter orbs, emotion cards
- `gap-6` (24px): Portfolio-worthy photo grid
- `py-12` (48px): Section vertical padding
- `mb-8` (32px): Section bottom margins

### Accessibility Patterns

**Focus Management:**
- Skip link to main content (visible on focus)
- Focus trap in modals
- Focus returns to trigger element when modal closes
- Roving tab index for filter orbs (only one in tab order at a time)

**ARIA Labels:**
- Emotion orbs: `aria-label="Filter by ${emotion}"`
- Photo cards: `aria-label="${title} - ${emotion} emotion, quality ${score}/10"`
- 3D scene: `aria-label="3D emotion galaxy view. Press arrow keys to navigate."`
- Story constellations: `aria-describedby="story-description-${id}"`

**Screen Reader Announcements:**
```typescript
// Live region for filter updates
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {activeFilters.length > 0
    ? `Filtered by ${activeFilters.join(', ')}. Showing ${filteredCount} photos.`
    : `Showing all ${totalCount} photos.`
  }
</div>
```

**Reduced Motion Support:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```typescript
// Disable 3D animations if reduced motion preferred
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Skip camera flights, use instant cuts
  camera.position.set(...targetPosition);
  camera.lookAt(...targetLookAt);
} else {
  // Smooth GSAP animation
  gsap.to(camera.position, { ...animation });
}
```

## Data Flow

### Photo Metadata → UI Rendering

```
Supabase photo_metadata table
  ↓
API route /api/photos?emotion=triumph
  ↓
Server-side Supabase client query
  ↓
JSON response with Photo[] (includes metadata)
  ↓
Client-side SWR cache
  ↓
React component props
  ↓
Render decisions:
  - portfolio_worthy → 2x size, gold badge
  - emotion → EMOTION_PALETTE glow
  - composition_score → Opacity 70-100%
  - action_intensity → Distance in 3D (Phase 4)
```

### Emotion Filtering

```
User clicks emotion card (e.g., "Triumph")
  ↓
EmotionContext.setActiveEmotion('triumph')
  ↓
Router.push('/portfolio?emotion=triumph')
  ↓
Portfolio page reads query param
  ↓
Fetch /api/photos?emotion=triumph
  ↓
MagneticFilterBar pre-selects "triumph" orb
  ↓
PortfolioGrid renders filtered photos with triumph theme
  ↓
Page background gradient shifts to EMOTION_PALETTE.triumph.gradient
```

### Quality Scoring Visualization

```
Photo enrichment (done offline)
  ↓
AI analyzes photo
  ↓
Scores: sharpness (9.2), composition (9.5), emotional_impact (8.7)
  ↓
portfolio_worthy = true (if avg > 8.5)
  ↓
Stored in photo_metadata table
  ↓
Client fetches photo
  ↓
PortfolioGrid separates photos:
  - portfolio_worthy → "Portfolio Highlights" section, 2x size
  - Regular → "All Photos" section, opacity based on avg quality
```

### Story Generation

```
User clicks "Generate Story" button
  ↓
StoryGenerationModal opens
  ↓
User selects "Game-Winning Rally"
  ↓
POST /api/stories/generate { type: 'game-winning-rally', photos }
  ↓
Server runs detectGameWinningRally(photos, context)
  ↓
Algorithm:
  - Filters last 5 minutes of photos
  - Filters peak intensity + triumph/intensity emotions
  - Sorts chronologically
  - Calculates emotional curve
  ↓
Returns NarrativeArc object
  ↓
Saves to stories table with generated ID
  ↓
Router.push('/stories/{id}')
  ↓
Story viewer renders photos with emotional timeline
  ↓
Phase 4: Story constellation renders in 3D
```

### 3D Positioning Algorithm (Phase 4)

```
Photo with metadata:
{
  emotion: 'triumph',
  emotional_impact: 9.2,
  action_intensity: 'peak'
}
  ↓
Get emotion orb center position:
  POSITIONS['triumph'] = [200, 150, 0]
  ↓
Calculate distance from center:
  distance = 50 + (10 - 9.2) * 30 = 74 units
  (Higher impact = closer to center)
  ↓
Random spherical coordinates:
  theta = random(0, 2π)
  phi = random(0, π)
  ↓
Convert to Cartesian:
  x = 200 + 74 * sin(phi) * cos(theta)
  y = 150 + 74 * sin(phi) * sin(theta)
  z = 0 + 74 * cos(phi)
  ↓
Photo rendered as textured plane at [x, y, z]
  ↓
Always faces camera (billboard effect)
```

## Performance Requirements

### Lighthouse Score (All Phases)

**Targets:**
- Performance: 90+ (maintain current score)
- Accessibility: 95+ (improve with Phase 1 fixes)
- Best Practices: 95+
- SEO: 90+

**Strategies:**
- Code splitting: Load Phase 4 3D components only when needed
- Image optimization: Next.js Image with AVIF/WebP, quality tiers
- Bundle size: Phase 4 adds max 150KB (gzipped)
- Critical CSS: Inline above-the-fold styles

### Animation Performance

**60fps Target (Desktop):**
- Phase 2: Emotion card hover, filter orb magnetic attraction
- Phase 3: Shared element transitions, photo card physics, parallax scroll

**30fps Minimum (Mobile):**
- Phase 3: Reduced animation complexity on touch devices
- Phase 4: Lower particle count, reduced texture resolution

**Monitoring:**
```typescript
// Performance monitoring with requestAnimationFrame
let lastTime = performance.now();
let frameCount = 0;

function measureFPS() {
  const now = performance.now();
  frameCount++;

  if (now >= lastTime + 1000) {
    const fps = Math.round((frameCount * 1000) / (now - lastTime));
    console.log(`FPS: ${fps}`);

    if (fps < 30) {
      console.warn('Low FPS detected, reducing quality');
      reduceLOD();
    }

    frameCount = 0;
    lastTime = now;
  }

  requestAnimationFrame(measureFPS);
}
```

### Bundle Size Limits

**Phase 1-3:** No significant bundle increase (existing dependencies)

**Phase 4:**
```
@react-three/fiber: ~50KB (gzipped)
@react-three/drei: ~80KB (gzipped)
three: Already included via peer dependency
Custom 3D components: ~20KB

Total Phase 4 addition: ~150KB gzipped
```

**Code Splitting:**
```typescript
// Lazy load 3D components
const EmotionGalaxy3D = lazy(() => import('@/components/galaxy/EmotionGalaxy3D'));

function GalaxyPage() {
  const [view3D, setView3D] = useState(false);

  return (
    <div>
      <button onClick={() => setView3D(true)}>Enter 3D View</button>

      {view3D && (
        <Suspense fallback={<LoadingSpinner />}>
          <EmotionGalaxy3D photos={photos} />
        </Suspense>
      )}
    </div>
  );
}
```

### Lazy Loading 3D Assets

**Texture Loading:**
```typescript
// Load textures progressively
const [texturesLoaded, setTexturesLoaded] = useState(0);
const totalTextures = photos.length;

useEffect(() => {
  const loader = new THREE.TextureLoader();
  let loaded = 0;

  photos.forEach(photo => {
    loader.load(
      photo.image_url,
      () => {
        loaded++;
        setTexturesLoaded(loaded);
      }
    );
  });
}, [photos]);

// Show loading progress
const progress = (texturesLoaded / totalTextures) * 100;
```

**Instanced Rendering:**
```typescript
// Use instanced meshes for repeated geometries (orbs)
import { Instances, Instance } from '@react-three/drei';

<Instances limit={6}>
  <sphereGeometry args={[100, 32, 32]} />
  <meshStandardMaterial />

  {EMOTIONS.map(emotion => (
    <Instance
      key={emotion}
      position={POSITIONS[emotion]}
      color={EMOTION_PALETTE[emotion].primary}
    />
  ))}
</Instances>
```

### Fallback for Low-End Devices

**Device Detection:**
```typescript
function detectDevicePerformance(): 'high' | 'medium' | 'low' {
  const memory = (navigator as any).deviceMemory; // GB
  const cores = navigator.hardwareConcurrency;

  if (memory >= 8 && cores >= 4) return 'high';
  if (memory >= 4 && cores >= 2) return 'medium';
  return 'low';
}

// Adjust quality based on device
const devicePerformance = detectDevicePerformance();

if (devicePerformance === 'low') {
  // Disable 3D view, show 2D only
  // Reduce animation complexity
  // Lower image quality
}
```

## Accessibility Specifications

### WCAG AA Compliance

**Phase 1 Fixes:**
- Semantic HTML: main, nav, section, aside landmarks
- Heading hierarchy: Single H1 per page, logical H2-H6 structure
- Alt text: Descriptive alt for all images (generated from AI captions)
- Focus indicators: 2px outline, 4.5:1 contrast ratio

**Phase 2-3 Enhancements:**
- ARIA labels: All interactive elements labeled
- Live regions: Filter updates announced to screen readers
- Keyboard navigation: All features accessible without mouse

**Phase 4 3D Accessibility:**
- Spatial audio: Optional audio cues for emotion zones
- 2D alternative: Always available via view toggle
- Keyboard navigation: Arrow keys for 3D exploration
- Voice commands: Optional integration with Web Speech API

### Keyboard Navigation

**Phase 1-2:**
- Tab: Move focus between interactive elements
- Shift+Tab: Move focus backward
- Enter/Space: Activate buttons, links
- Escape: Close modals, clear filters

**Phase 3:**
- Arrow keys: Navigate photo grid
- Home/End: Jump to start/end of grid
- Ctrl+F: Focus search input

**Phase 4 (3D Space):**
- Arrow Up/Down: Navigate photos in current emotion zone
- Arrow Left/Right: Switch between emotion zones
- Enter: Select focused photo
- Space: Toggle view mode (2D/2.5D/3D)
- Escape: Return to overview
- Tab: Cycle through emotion orbs
- 1-6 keys: Jump to specific emotion (1=triumph, 2=intensity, etc.)

### Screen Reader Support

**Photo Card Announcement:**
```typescript
<div
  role="article"
  aria-label={`${photo.title}. ${photo.metadata?.emotion} emotion. Quality ${photo.metadata?.composition_score} out of 10. ${photo.metadata?.play_type} play type.`}
  tabIndex={0}
>
  <Image src={photo.image_url} alt={photo.title} />
</div>
```

**3D Scene Description:**
```typescript
<div id="galaxy-description" className="sr-only">
  Interactive 3D emotion galaxy. Six emotion zones are arranged in 3D space:
  Triumph at top right, Intensity at bottom right, Focus at top left,
  Determination at bottom left, Excitement at top center, Serenity at bottom center.
  Photos orbit each emotion zone based on their emotional content.
  Use arrow keys to navigate between zones and photos.
  Press Space to toggle to 2D view for a simpler experience.
</div>

<div aria-describedby="galaxy-description" role="application">
  <Canvas>...</Canvas>
</div>
```

**Filter Update Announcements:**
```typescript
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {filterStatus}
</div>

// Updates when filters change
const filterStatus = useMemo(() => {
  if (activeFilters.length === 0) {
    return `Showing all ${totalPhotos} photos`;
  }
  return `Filtered by ${activeFilters.join(', ')}. Showing ${filteredPhotos.length} of ${totalPhotos} photos.`;
}, [activeFilters, filteredPhotos, totalPhotos]);
```

### Reduced Motion Fallbacks

**Detect User Preference:**
```typescript
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

// Disable animations if preferred
const animationConfig = prefersReducedMotion
  ? { duration: 0.01, ease: 'linear' }
  : { duration: 0.5, ease: MOTION.ease.easeOut };
```

**Phase 3 Reduced Motion:**
- Disable parallax scrolling
- Disable cursor repulsion
- Disable 3D tilt
- Use instant transitions instead of morphs

**Phase 4 Reduced Motion:**
- Disable camera flights (instant cuts instead)
- Disable particle orbital motion
- Disable story constellation animations
- Consider disabling 3D view entirely, show 2D fallback

### Focus Management

**Modal Focus Trap:**
```typescript
function StoryGenerationModal({ isOpen, onClose }: ModalProps) {
  const firstFocusableRef = useRef<HTMLElement>(null);
  const lastFocusableRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift+Tab on first element -> focus last
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault();
          lastFocusableRef.current?.focus();
        }
      } else {
        // Tab on last element -> focus first
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    }
  }

  return (
    <div onKeyDown={handleKeyDown}>
      <button ref={firstFocusableRef}>First</button>
      {/* Modal content */}
      <button ref={lastFocusableRef}>Last</button>
    </div>
  );
}
```

**Roving Tab Index (Filter Orbs):**
```typescript
// Only one orb in tab order at a time
function MagneticFilterBar({ activeFilters, onToggle }: FilterBarProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  function handleKeyDown(e: KeyboardEvent, index: number) {
    if (e.key === 'ArrowRight') {
      setFocusedIndex((index + 1) % EMOTIONS.length);
    } else if (e.key === 'ArrowLeft') {
      setFocusedIndex((index - 1 + EMOTIONS.length) % EMOTIONS.length);
    }
  }

  return (
    <div role="toolbar" aria-label="Emotion filters">
      {EMOTIONS.map((emotion, index) => (
        <MagneticFilterOrb
          key={emotion}
          emotion={emotion}
          tabIndex={focusedIndex === index ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, index)}
        />
      ))}
    </div>
  );
}
```

## Testing Strategy

### Visual Regression Tests (Phase 1-2)

Using Playwright:
```typescript
// tests/visual-regression/emotion-navigation.spec.ts
import { test, expect } from '@playwright/test';

test('emotion navigation cards render with correct colors', async ({ page }) => {
  await page.goto('/');

  // Wait for emotion cards to load
  await page.waitForSelector('.emotion-card');

  // Take screenshot of emotion cards section
  const emotionSection = page.locator('section:has(.emotion-card)');
  await expect(emotionSection).toHaveScreenshot('emotion-cards.png');

  // Verify each emotion card has correct gradient
  const triumphCard = page.locator('.emotion-card[data-emotion="triumph"]');
  const bgImage = await triumphCard.evaluate(el =>
    window.getComputedStyle(el).backgroundImage
  );
  expect(bgImage).toContain('linear-gradient');
  expect(bgImage).toContain('#FFD700'); // Gold
});

test('portfolio-worthy photos are 2x size', async ({ page }) => {
  await page.goto('/portfolio');

  const portfolioPhoto = page.locator('[data-portfolio="true"]').first();
  const regularPhoto = page.locator('[data-portfolio="false"]').first();

  const portfolioBox = await portfolioPhoto.boundingBox();
  const regularBox = await regularPhoto.boundingBox();

  expect(portfolioBox!.width).toBeGreaterThan(regularBox!.width * 1.8);
});
```

### Accessibility Audits

```typescript
// tests/accessibility/wcag-compliance.spec.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('homepage passes WCAG AA accessibility audit', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);

  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: {
      html: true,
    },
  });
});

test('all pages have semantic landmarks', async ({ page }) => {
  const pages = ['/', '/portfolio', '/browse', '/search', '/stories'];

  for (const url of pages) {
    await page.goto(url);

    // Check for main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check for nav landmark
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  }
});
```

### User Journey Tests (Phase 2-3)

```typescript
// tests/user-journeys/emotion-filtering.spec.ts
test('user can filter photos by emotion', async ({ page }) => {
  await page.goto('/');

  // Click "Triumph" emotion card
  await page.click('.emotion-card[data-emotion="triumph"]');

  // Should navigate to portfolio with emotion filter
  await expect(page).toHaveURL('/portfolio?emotion=triumph');

  // Magnetic filter orb should be pre-selected
  const triumphOrb = page.locator('[aria-label="Filter by triumph"]');
  await expect(triumphOrb).toHaveAttribute('aria-pressed', 'true');

  // All visible photos should have triumph emotion
  const photos = await page.locator('.photo-card').all();
  for (const photo of photos) {
    const emotion = await photo.getAttribute('data-emotion');
    expect(emotion).toBe('triumph');
  }

  // Photo cards should have golden glow
  const firstPhoto = photos[0];
  const boxShadow = await firstPhoto.evaluate(el =>
    window.getComputedStyle(el).boxShadow
  );
  expect(boxShadow).toContain('255, 215, 0'); // RGB for #FFD700
});

test('shared element transition works grid to detail', async ({ page }) => {
  await page.goto('/portfolio');

  // Get first photo position
  const photoCard = page.locator('.photo-card').first();
  const startBox = await photoCard.boundingBox();

  // Click to open detail view
  await photoCard.click();

  // Wait for navigation
  await page.waitForURL(/\/photo\/.*/);

  // Photo should morph to full-screen position
  const detailPhoto = page.locator('[data-testid="photo-detail"]');
  const endBox = await detailPhoto.boundingBox();

  expect(endBox!.width).toBeGreaterThan(startBox!.width);
});
```

### 3D Interaction Tests (Phase 4)

```typescript
// tests/3d-interactions/emotion-galaxy.spec.ts
test('camera flies to emotion zone on click', async ({ page }) => {
  await page.goto('/galaxy');

  // Wait for 3D scene to load
  await page.waitForSelector('canvas');

  // Get initial camera position (should be overview)
  const initialCameraZ = await page.evaluate(() => {
    const camera = (window as any).__camera__;
    return camera.position.z;
  });
  expect(initialCameraZ).toBeGreaterThan(400); // Overview position

  // Click triumph emotion button
  await page.click('[data-emotion-button="triumph"]');

  // Wait for animation to complete
  await page.waitForTimeout(1600); // 1.5s animation + buffer

  // Camera should be closer to triumph orb
  const finalCameraZ = await page.evaluate(() => {
    const camera = (window as any).__camera__;
    return camera.position.z;
  });
  expect(finalCameraZ).toBeLessThan(200); // Close-up position
});

test('keyboard navigation works in 3D space', async ({ page }) => {
  await page.goto('/galaxy');
  await page.waitForSelector('canvas');

  // Press arrow right to focus first emotion zone
  await page.keyboard.press('ArrowRight');

  // Verify focus indicator visible
  const focusedEmotion = await page.evaluate(() =>
    (window as any).__focusedEmotion__
  );
  expect(focusedEmotion).toBeTruthy();

  // Press arrow down to focus first photo in zone
  await page.keyboard.press('ArrowDown');

  // Press Enter to select photo
  await page.keyboard.press('Enter');

  // Should navigate to photo detail
  await page.waitForURL(/\/photo\/.*/);
});
```

### Performance Benchmarks

```typescript
// tests/performance/fps-monitoring.spec.ts
test('maintains 60fps during Phase 3 animations', async ({ page }) => {
  await page.goto('/portfolio');

  // Start FPS monitoring
  const fpsSamples: number[] = [];
  await page.exposeFunction('recordFPS', (fps: number) => {
    fpsSamples.push(fps);
  });

  await page.evaluate(() => {
    let lastTime = performance.now();
    let frameCount = 0;

    function measureFPS() {
      const now = performance.now();
      frameCount++;

      if (now >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        (window as any).recordFPS(fps);
        frameCount = 0;
        lastTime = now;
      }

      requestAnimationFrame(measureFPS);
    }

    measureFPS();
  });

  // Trigger animations (scroll, hover)
  await page.mouse.move(200, 200);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(3000);

  // Calculate average FPS
  const avgFPS = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length;
  expect(avgFPS).toBeGreaterThan(55); // Allow 5fps margin
});

test('Phase 4 maintains 30fps minimum with 100 photos', async ({ page }) => {
  await page.goto('/galaxy');
  await page.waitForSelector('canvas');

  // Similar FPS monitoring for 3D scene
  // ...

  const avgFPS = await getAverageFPS(page);
  expect(avgFPS).toBeGreaterThan(30);
});
```

## Rollout Strategy

### Phase 2 Ships First (Quick Win)

**Timeline:** 2-3 weeks
**Goal:** Deliver immediate differentiation

**Deployment Plan:**
1. Complete Phase 1 fixes (week 1)
2. Implement emotion navigation cards (days 1-2)
3. Activate magnetic filter orbs (days 3-4)
4. Add quality stratification (days 5-6)
5. Story discovery UI (days 7-9)
6. QA and accessibility testing (days 10-12)
7. Soft launch to beta users (day 13)
8. Full production rollout (day 14)

**Success Metrics:**
- User engagement: +25% time on site
- Filter usage: 50%+ of sessions use emotion filters
- Story generation: 10%+ of sessions generate a story
- Lighthouse score maintained: 90+ across all categories

### Phase 4 as "2.0" Release

**Timeline:** 10 weeks (can run in parallel with Phase 3)
**Goal:** Transformative "never-before-seen" experience

**Development Phases:**
- Weeks 1-2: Core 3D engine setup, emotion orbs
- Weeks 3-4: Photo particle system, positioning algorithm
- Weeks 5-6: Camera controls, flight animations
- Weeks 7-8: Story constellations, view toggle
- Weeks 9-10: Performance optimization, accessibility, QA

**Beta Testing:**
- Week 8: Internal testing with team
- Week 9: Invite 50 beta users for feedback
- Week 10: Address feedback, final polish

**Launch Strategy:**
- Soft launch to 10% of users (A/B test)
- Monitor performance metrics (FPS, bundle size, engagement)
- Gradually roll out to 50%, then 100%
- Marketing push: "Introducing Emotion Galaxy - The Future of Photo Discovery"

### Feature Flags for Gradual Rollout

```typescript
// Feature flag configuration
const FEATURE_FLAGS = {
  emotionNavigation: true,       // Phase 2
  magneticFilters: true,          // Phase 2
  qualityStratification: true,    // Phase 2
  sharedElementTransitions: true, // Phase 3
  photoCardPhysics: true,         // Phase 3
  emotionGalaxy3D: false,         // Phase 4 - gated
};

// Usage in components
function PortfolioPage() {
  const { emotionGalaxy3D } = useFeatureFlags();

  if (emotionGalaxy3D) {
    return <EmotionGalaxy3D photos={photos} />;
  }

  return <PortfolioGrid photos={photos} />;
}

// Server-side flag management
export async function getFeatureFlags(userId?: string): Promise<typeof FEATURE_FLAGS> {
  // Check user segment for gradual rollout
  const segment = await getUserSegment(userId);

  if (segment === 'beta') {
    return { ...FEATURE_FLAGS, emotionGalaxy3D: true };
  }

  return FEATURE_FLAGS;
}
```

### A/B Testing Approach

**Phase 2 A/B Test:**
- Control: Current portfolio grid with conventional filters
- Variant A: Emotion navigation + magnetic orbs
- Metric: Filter usage rate, time on site, photos viewed per session

**Phase 4 A/B Test:**
- Control: Enhanced 2D portfolio (Phase 2-3 complete)
- Variant A: Emotion Galaxy 3D option available
- Variant B: Emotion Galaxy 3D as default (2D toggle available)
- Metrics: Engagement, 3D view usage, performance impact, user feedback

**Analytics Events:**
```typescript
// Track key interactions
analytics.track('emotion_card_clicked', { emotion: 'triumph' });
analytics.track('magnetic_filter_activated', { filter: 'intensity' });
analytics.track('story_generated', { type: 'game-winning-rally', photoCount: 12 });
analytics.track('3d_view_entered', { fromPage: 'portfolio' });
analytics.track('camera_flight_triggered', { targetEmotion: 'triumph' });
analytics.track('view_mode_toggled', { from: '3d', to: '2d' });
```

## Success Metrics

### Before Innovation (Current State)
- **Uniqueness:** Generic - Indistinguishable from competitors (Flickr, SmugMug, 500px)
- **Discovery:** Low - Features hidden, conventional grid navigation
- **Engagement:** Functional - Users can find photos but no "wow" moments
- **Memorability:** Forgettable - Clean design, no standout interactions

**Quantitative:**
- Average session duration: 2-3 minutes
- Pages per session: 3-4
- Filter usage: <10% of sessions
- Bounce rate: 40-50%

### After Phase 2 (Surface Innovations)
- **Uniqueness:** Differentiated - Emotion navigation, magnetic filters, visible AI curation
- **Discovery:** Medium - Features surfaced but still conventional UI patterns
- **Engagement:** Improved - Emotion filtering, quality badges, story generation
- **Memorability:** Moderate - Users remember emotion system and magnetic orbs

**Quantitative Targets:**
- Average session duration: 5-7 minutes (+67% increase)
- Pages per session: 6-8 (+75% increase)
- Filter usage: 50%+ of sessions (+500% increase)
- Bounce rate: 25-30% (-37% decrease)
- Story generation: 10%+ of sessions (new metric)

### After Phase 4 (Emotion Galaxy)
- **Uniqueness:** Iconic - Literally never been done, new category of photo gallery
- **Discovery:** Exceptional - Innovation IS the interface, exploration-driven
- **Engagement:** Exceptional - Users explore for exploration's sake, not just photo finding
- **Memorability:** Unforgettable - Users evangelize to others, share screenshots/videos

**Quantitative Targets:**
- Average session duration: 10-15 minutes (+200% vs current, +50% vs Phase 2)
- Pages per session: 12-15 (+300% vs current, +87% vs Phase 2)
- 3D view usage: 60%+ of sessions (new metric)
- Social shares: 20% of sessions share gallery screenshots (new metric)
- Return visits: +100% increase (users come back to show others)
- Word-of-mouth referrals: +200% increase (tracked via referral sources)

**Qualitative:**
- User testimonials mention "never seen anything like this"
- Featured in web design galleries (Awwwards, CSS Design Awards)
- Industry press coverage (Smashing Magazine, CSS-Tricks, etc.)
- Other portfolio sites begin copying the approach

## Risk Mitigation

### 3D Complexity (Phase 4)

**Risk:** 3D implementation too complex, delays launch

**Mitigation:**
- Prototype 3D in weeks 1-2, validate feasibility early
- Provide 2D fallback as default if 3D not ready
- Code splitting: 3D is opt-in, not blocking for Phase 2-3 launch
- External consultant: Budget for Three.js expert if needed

### Bundle Size (Phase 4)

**Risk:** @react-three/fiber adds too much to bundle, hurts performance

**Mitigation:**
- Lazy load 3D components (only load when user enters 3D view)
- Code splitting: Separate chunk for 3D code (~150KB gzipped acceptable)
- Tree shaking: Import only needed drei components
- CDN: Consider loading Three.js from CDN instead of bundling
- Performance budget: Alert if bundle exceeds 500KB gzipped total

**Monitoring:**
```bash
# Bundle analyzer
pnpm build && pnpm analyze

# Acceptable thresholds:
# - Main bundle: <300KB gzipped
# - 3D chunk: <150KB gzipped
# - Total initial load: <450KB gzipped
```

### Performance Degradation (Phase 4)

**Risk:** 3D scene causes jank, poor FPS, bad user experience

**Mitigation:**
- LOD system: Reduce texture quality for distant photos
- Frustum culling: Only render visible objects
- Instanced rendering: Reuse geometries for orbs
- Device detection: Disable 3D on low-end devices automatically
- Performance monitoring: Track FPS, alert if <30fps
- Graceful degradation: Auto-switch to 2D if FPS consistently low

**Performance Tests:**
```typescript
// Automated performance regression tests
test('3D scene maintains 30fps with 100 photos', async ({ page }) => {
  const avgFPS = await measure3DFPS(page, duration: 10000);
  expect(avgFPS).toBeGreaterThan(30);
});

test('bundle size does not exceed 500KB', () => {
  const stats = readBundleStats();
  expect(stats.totalGzippedSize).toBeLessThan(500 * 1024);
});
```

### Browser Compatibility (Phase 4)

**Risk:** WebGL not supported on some browsers, users can't access 3D

**Mitigation:**
- WebGL support detection on page load
- Automatic fallback to 2D grid if WebGL unavailable
- Clear messaging: "Your browser doesn't support 3D view"
- Provide link to recommended browsers (Chrome, Firefox, Safari, Edge)
- Analytics: Track WebGL support rate, optimize for majority

**Support Matrix:**
- Chrome 90+: Full support ✅
- Firefox 88+: Full support ✅
- Safari 14+: Full support ✅
- Edge 90+: Full support ✅
- Mobile Chrome/Safari: Partial support (degraded quality) ⚠️
- IE11: No support (fallback to 2D) ❌

### Accessibility Concerns (Phase 4)

**Risk:** 3D spatial interface not accessible to keyboard/screen reader users

**Mitigation:**
- 2D view always available via toggle (Space key)
- Keyboard navigation for 3D (arrow keys, documented clearly)
- Screen reader descriptions for spatial layout
- ARIA labels for all 3D controls
- User testing with assistive technology users before launch
- Feedback mechanism: "Accessibility issue? Let us know"

**Accessibility Checklist:**
- ✅ Keyboard navigation works for all 3D interactions
- ✅ Screen reader announces spatial context
- ✅ 2D alternative always available (no dead ends)
- ✅ Focus indicators visible in 3D scene
- ✅ Color contrast maintained in overlays
- ✅ Motion can be disabled (prefers-reduced-motion)

### User Confusion (Phase 4)

**Risk:** Users don't understand 3D navigation, get lost, give up

**Mitigation:**
- First-time user onboarding tutorial (animated guide)
- Contextual hints: "Click an emotion orb to fly there"
- Keyboard shortcuts legend (always visible, bottom-left)
- "Return to overview" button prominently placed
- Video demo in marketing materials
- User testing: 5 users pre-launch, iterate based on feedback

**Onboarding Flow:**
```
1. User lands on 3D view
2. Overlay appears with animated arrows pointing to emotion orbs
3. Text: "Click any emotion orb to explore that emotional space"
4. After first click, new overlay: "Use arrow keys or drag to look around"
5. After 30 seconds, hint: "Press D to toggle 2D/3D views"
6. Onboarding dismissed, never shown again
```

## Dependencies

### Existing Dependencies (Already in package.json)
- **next**: ^15.0.0 - App Router, Image optimization, API routes
- **react**: ^19.0.0 - Component library
- **framer-motion**: ^11.0.0 - Animations (Phase 2-3)
- **gsap**: ^3.12.0 - Complex animations, camera flights (Phase 4)
- **tailwindcss**: ^4.0.0 - Styling
- **@supabase/supabase-js**: ^2.39.0 - Database queries
- **playwright**: ^1.44.0 - Testing

### New Dependencies (Phase 4 Only)
- **@react-three/fiber**: ^8.15.0 - React renderer for Three.js
- **@react-three/drei**: ^9.88.0 - Useful helpers (OrbitControls, PerspectiveCamera, useTexture)
- **three**: ^0.160.0 - Core 3D library (peer dependency)

### Design Tokens (Existing)
All design tokens already defined in `src/lib/motion-tokens.ts`:
- **MOTION**: Spring configs, duration scale, easing functions
- **EMOTION_PALETTE**: 6 emotions with primary, gradient, glow
- **EMOTION_ICONS**: Emoji icons for each emotion
- **PLAY_TYPE_ICONS**: Volleyball play type icons

### Icons (Existing)
Using `lucide-react` for UI icons:
- Frame (portfolio), Search, Grid (browse), BookOpen (stories), Folder (album)

## Open Questions

### Timeline for Phase 4
**Question:** What is the business deadline for "2.0" release with Emotion Galaxy?

**Options:**
- A) Ship Phase 2 in 3 weeks, then immediately start Phase 4 (10 weeks total, ready by Week 13)
- B) Ship Phase 2 and Phase 3 together in 5 weeks, then Phase 4 (15 weeks total)
- C) Ship Phase 2 only, gather user feedback, decide on Phase 4 based on results

**Recommendation:** Option A - Ship Phase 2 quickly to prove value, then commit to Phase 4 as a major release.

### A/B Testing Infrastructure
**Question:** Do we need A/B testing infrastructure for new interactions?

**Current State:** No A/B testing in place

**Needed:**
- Feature flag system (simple env vars for now)
- Analytics events for key interactions
- User segmentation (beta users vs general users)

**Recommendation:** Implement simple feature flags for Phase 2, expand to full A/B testing for Phase 4 launch.

### Mobile 3D Strategy
**Question:** Should Phase 4 3D work on mobile, or desktop-only initially?

**Options:**
- A) Desktop-only 3D, mobile shows 2D fallback (simplest, fastest to ship)
- B) Degraded 3D on mobile (lower particle count, reduced quality)
- C) Full 3D parity on mobile (most complex, likely performance issues)

**Recommendation:** Option A for initial launch, Option B for v2.1 after gathering mobile performance data.

### Analytics Requirements
**Question:** What analytics events do we need to track innovation feature usage?

**Key Events:**
- Emotion card clicks
- Magnetic filter activations
- Story generation requests (by type)
- 3D view entrances/exits
- Camera flights (which emotion zones)
- View mode toggles (2D/2.5D/3D)
- Performance metrics (FPS, bundle size impact)

**Recommendation:** Implement analytics events in Phase 2, expand in Phase 4. Use Vercel Analytics or Posthog for simple event tracking.

### User Onboarding
**Question:** How do we teach users about new interactions (magnetic filters, 3D navigation)?

**Options:**
- A) Implicit (no tutorial, users discover naturally)
- B) Contextual hints (tooltips on hover)
- C) First-time onboarding flow (animated guide)
- D) Video tutorial in header/footer

**Recommendation:** Option B for Phase 2 (simple tooltips), Option C for Phase 4 (first-time overlay with dismissible tutorial).

### Photographer Feedback Loop
**Question:** How do we gather feedback from Nino (the photographer) on which features work for his workflow?

**Suggestion:**
- Weekly demo sessions during Phase 2 development
- Beta access to all features before public launch
- Feedback form embedded in app (for Phase 4)
- User testing: Have Nino's clients test the experience

## Constraints

### Must Maintain Existing Functionality
- All current pages must continue to work
- SmugMug photo syncing unchanged
- Story curation algorithms unchanged (surface in UI, don't modify backend)
- Search functionality unchanged (enhance UI only)
- Print ordering flow unchanged

### Cannot Break Current User Workflows
- Direct photo URLs must still work (no breaking changes to routing)
- Bookmarked URLs remain valid
- Browser back button must work as expected
- Mobile users can still access all features (provide fallbacks)

### Performance Budget
- Lighthouse Performance score: 90+ (current baseline)
- Lighthouse Accessibility score: 95+ (improve from current)
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Total Blocking Time (TBT): <200ms
- Cumulative Layout Shift (CLS): <0.1

### Bundle Size
- Phase 1-3: No significant increase (<10KB)
- Phase 4: Max 150KB gzipped for 3D chunk
- Total bundle: <500KB gzipped initial load

### Browser Support
- Modern browsers only: Chrome, Firefox, Safari, Edge (last 2 versions)
- Phase 4 requires WebGL (80%+ of users have support)
- Graceful degradation for unsupported browsers
- No IE11 support

### Mobile-First Approach
- All features must work on mobile (with fallbacks)
- Touch gestures for interactions
- Responsive layouts at all breakpoints
- Phase 4: Mobile gets 2D fallback initially

## Definition of Done

### Phase 1: Foundation Fixes
- ✅ Browse page renders without errors (next/image quality prop fixed)
- ✅ All pages pass axe accessibility audit (no critical issues)
- ✅ Semantic HTML landmarks on all pages (main, nav)
- ✅ Skeleton loaders visible during loading states
- ✅ Focus indicators visible on all interactive elements (2px outline)
- ✅ Images lazy load below fold (verified in Network tab)
- ✅ All async operations show loading states

### Phase 2: Surface Innovations
- ✅ 6 emotion cards on homepage using EMOTION_PALETTE gradients
- ✅ Emotion cards clickable, navigate to /portfolio?emotion={emotion}
- ✅ MagneticFilterOrb active on portfolio page, visible by default
- ✅ Magnetic attraction works (cursor within 100px attracts orb)
- ✅ Photo grids show 2px emotion halos in EMOTION_PALETTE colors
- ✅ Portfolio-worthy photos visually distinct (2x size in grid)
- ✅ Gold star badge visible on portfolio-worthy photos
- ✅ "Generate Story" button on portfolio page
- ✅ StoryGenerationModal renders 6 story type options
- ✅ Story generation works, navigates to /stories/{id}
- ✅ User can filter by emotion and see filtered results
- ✅ Filter UI shows active filters with emotion colors

### Phase 3: Microinteractions & Polish
- ✅ Shared element transitions work for grid → detail navigation
- ✅ Photo cards morph smoothly (layoutId animation)
- ✅ Photo cards respond to cursor proximity (repulsion within 50px)
- ✅ 3D tilt on hover based on cursor position
- ✅ Page transitions animated (fade-in/out)
- ✅ All interactions maintain 60fps (tested with FPS monitor)
- ✅ Parallax scrolling works on homepage
- ✅ Emotion-colored scroll indicator visible
- ✅ Enhanced empty states have entrance animations

### Phase 4: Emotion Galaxy
- ✅ EmotionGalaxy3D component renders without errors
- ✅ Canvas displays with black background
- ✅ 6 emotion orbs visible in spherical formation
- ✅ Emotion orbs use EMOTION_PALETTE gradients and glows
- ✅ Photos render as textured planes in 3D space
- ✅ Photos positioned around emotion centers based on metadata
- ✅ Camera at z: 500 overview position on load
- ✅ Clicking emotion button triggers camera flight
- ✅ Camera flies smoothly to emotion (1.5s duration, easeInOut)
- ✅ Story constellations render as dashed lines connecting photos
- ✅ Toggle between 2D/2.5D/3D works (D key)
- ✅ View mode indicator shows current mode
- ✅ Keyboard navigation works in 3D:
  - Arrow keys navigate photos
  - Tab cycles emotion orbs
  - Enter selects photo
  - Escape returns to overview
- ✅ Performance maintained (30fps minimum, 60fps target)
- ✅ LOD system reduces texture quality for distant photos
- ✅ WebGL support detection works
- ✅ 2D fallback displays for unsupported browsers
- ✅ Bundle size <500KB gzipped total

### All Phases: Quality Gates
- ✅ All Playwright tests passing (visual + journey)
- ✅ Lighthouse scores: Performance 90+, Accessibility 95+, Best Practices 95+, SEO 90+
- ✅ No console errors or warnings
- ✅ All images have alt text
- ✅ WCAG AA compliance verified
- ✅ Works on Chrome, Firefox, Safari, Edge (last 2 versions)
- ✅ Responsive on mobile (375px), tablet (768px), desktop (1920px)
- ✅ Code reviewed by 1+ team member
- ✅ Documentation updated (README, CLAUDE.md if applicable)

---

## Appendix: Component File Structure

```
src/
├── app/
│   ├── page.tsx (Homepage with EmotionNavigationCards)
│   ├── portfolio/
│   │   └── page.tsx (PortfolioGrid + MagneticFilterBar)
│   ├── photo/[id]/
│   │   └── page.tsx (PhotoDetail with SharedElementTransition)
│   └── galaxy/
│       └── page.tsx (EmotionGalaxy3D wrapper)
├── components/
│   ├── navigation/
│   │   └── EmotionNavigationCards.tsx (Phase 2)
│   ├── filters/
│   │   ├── PhotoFilters.tsx (existing, enhanced)
│   │   └── MagneticFilterBar.tsx (Phase 2, uses MagneticFilterOrb)
│   ├── interactions/
│   │   ├── MagneticFilterOrb.tsx (existing)
│   │   ├── EmotionTimeline.tsx (existing)
│   │   └── ContextualCursor.tsx (existing)
│   ├── portfolio/
│   │   ├── PortfolioGrid.tsx (existing, enhanced Phase 2)
│   │   └── QualityBadge.tsx (new, Phase 2)
│   ├── story/
│   │   ├── StoryGenerationModal.tsx (new, Phase 2)
│   │   └── StoryViewer.tsx (existing)
│   ├── transitions/
│   │   └── SharedElementTransition.tsx (new, Phase 3)
│   ├── galaxy/ (Phase 4)
│   │   ├── EmotionGalaxy3D.tsx
│   │   ├── EmotionOrbs.tsx
│   │   ├── PhotoParticleSystem.tsx
│   │   ├── PhotoParticle.tsx
│   │   ├── StoryConstellation.tsx
│   │   ├── CameraController.tsx
│   │   └── UIOverlay.tsx
│   └── common/
│       ├── EmptyState.tsx (existing, enhanced Phase 3)
│       └── PhotoSkeleton.tsx (existing)
├── lib/
│   ├── motion-tokens.ts (existing)
│   ├── story-curation/
│   │   └── narrative-arcs.ts (existing)
│   └── supabase/
│       ├── client.ts (existing)
│       └── server.ts (existing)
└── types/
    └── photo.ts (existing)
```

---

**End of Specification**

**Total Pages:** 38
**Word Count:** ~18,000 words
**Code Examples:** 50+
**Diagrams:** 5 conceptual
**Created:** October 16, 2025
**Author:** Claude (Spec Writer Agent)
**Status:** Ready for Implementation
