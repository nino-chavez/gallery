# Specification: Portfolio Route with Quality Gradient & 3D Gravity Views

## Goal
Implement the missing `/portfolio` route that showcases curated, portfolio-quality volleyball photos through multiple view modes including quality gradient visualization, masonry grid, and 3D gravity clustering. This route assembles existing, fully-implemented components ([`QualityGradientGrid`](../../src/components/portfolio/QualityGradientGrid.tsx:24), [`PortfolioGrid`](../../src/components/portfolio/PortfolioGrid.tsx:11), [`PhotoGravity`](../../src/components/portfolio/PhotoGravity.tsx:53), [`PortfolioFilters`](../../src/components/portfolio/PortfolioFilters.tsx:7)) into a cohesive portfolio presentation experience.

## User Stories
- As a user, I want to navigate to `/portfolio` and see only high-quality photos (8+ rating) so that I can view the photographer's best work
- As a user, I want to switch between quality gradient, grid, and 3D gravity view modes so that I can explore photos in different visual contexts
- As a user, I want to see GSAP-animated brightness and blur effects based on photo quality so that I immediately understand quality distribution
- As a user, I want to sort photos by quality score, emotional impact, or recency so that I can prioritize what matters most to me
- As a user, I want to click on any photo and navigate to its detail page so that I can view full metadata and similar photos
- As a user, I want portfolio filters to be preset and permanent so that I only see curated, portfolio-worthy content
- As a user, I want smooth 60fps animations in all view modes so that the experience feels premium and professional
- As a user, I want the 3D gravity view to cluster similar photos together so that I can discover relationships between shots

## Core Requirements

### Functional Requirements
- Route accessible at `/portfolio` returning 200 status
- Fetch only portfolio-worthy photos with minimum quality score of 8+
- Display 3 view mode toggles: Quality Gradient, Grid, 3D Gravity
- Default to Quality Gradient view on initial load
- Render GSAP-animated brightness/blur effects in Quality Gradient mode
- Display masonry grid with sort controls in Grid mode
- Render Three.js 3D clustering with OrbitControls in 3D Gravity mode
- Support 3 sort options: Quality Score, Emotional Impact, Most Recent
- Navigate to `/photo/[id]` on photo click in all view modes
- Maintain view mode state across photo detail navigation (via URL params)
- Display photo count showing current filtered results

### Non-Functional Requirements
- Initial page load under 2 seconds on 3G connection
- Smooth 60fps animations for GSAP effects and 3D rendering
- Handle up to 200 portfolio photos with efficient rendering
- WCAG 2.1 AA compliance for accessibility
- Responsive layout supporting mobile (375px), tablet (768px), desktop (1280px+)
- Error states for API failures with user-friendly messages
- Loading states during data fetch and view mode transitions
- 3D view limited to 100 photos for performance, fallback to grid if more

## Visual Design

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│ Header: "Portfolio" + View Mode Toggles        │
│                                                 │
│ [Quality Gradient] [Grid] [3D Gravity]         │
│ Photo Count: "47 portfolio photos"             │
├─────────────────────────────────────────────────┤
│                                                 │
│ Quality Gradient View (default):               │
│ ┌─────────────────────────────────────────────┐│
│ │ GSAP-animated grid with brightness/blur     ││
│ │ ┌───┐ ┌───┐ ┌───┐ ┌───┐                    ││
│ │ │ ● │ │ ◐ │ │ ○ │ │ ◑ │  (quality dots)    ││
│ │ └───┘ └───┘ └───┘ └───┘                    ││
│ │ ...more photos with quality gradient...     ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ Grid View (masonry):                            │
│ ┌─────────────────────────────────────────────┐│
│ │ Sort: [Quality] [Emotion] [Recent]          ││
│ │ ┌───┐ ┌───┐ ┌───┐                          ││
│ │ │   │ │   │ │   │  (varied heights)        ││
│ │ └───┘ │   │ └───┘                          ││
│ │       └───┘       ...masonry layout...      ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ 3D Gravity View (fullscreen):                  │
│ ┌─────────────────────────────────────────────┐│
│ │ 3D space with floating photos               ││
│ │ Clustered by similarity                     ││
│ │ OrbitControls for rotation/zoom             ││
│ │ Instructions overlay (drag/scroll/click)    ││
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### View Mode Specifications

**Quality Gradient View:**
- Layout: CSS Grid, 2-4 responsive columns, 1px gap
- Animation: GSAP animates brightness (50%-100%) and blur (0-5px) based on quality
- Duration: 1.5s with 0.02s stagger
- Quality indicator: White dot on hover for portfolio-worthy photos
- Minimal design: Black backgrounds, square aspect ratio

**Grid View:**
- Layout: Masonry columns (1/2/3/4 responsive)
- Sort controls: 3 buttons with active state (blue background)
- Card design: Rounded corners (8px), hover shadow lift
- Overlays: Quality badges (top-left), metadata (hover, bottom)
- Metadata display: Title, quality score, emotion, play type

**3D Gravity View:**
- Renderer: React Three Fiber Canvas with ambient + point lights
- Clustering: Similarity scoring (emotion 30%, play-type 25%, composition 15%, intensity 15%, time 10%, portfolio 5%)
- Movement: Lerp interpolation (0.1) for smooth position transitions
- Controls: OrbitControls with damping (0.05), zoom range (5-30)
- Limit: Maximum 100 photos for 60fps performance
- Instructions overlay: Top-left with controls guide
- Hovered photo info: Bottom-center with title and metadata

## Reusable Components

### Existing Code to Leverage

**1. QualityGradientGrid Component**
- Location: [`src/components/portfolio/QualityGradientGrid.tsx`](../../src/components/portfolio/QualityGradientGrid.tsx:24)
- Props: [`photos`](../../src/components/portfolio/QualityGradientGrid.tsx:10), [`onPhotoClick`](../../src/components/portfolio/QualityGradientGrid.tsx:11)
- Features: GSAP animations for brightness/blur, quality indicators, responsive grid
- **Action required**: Use as-is, pass portfolio photos and click handler

**2. PortfolioGrid Component**
- Location: [`src/components/portfolio/PortfolioGrid.tsx`](../../src/components/portfolio/PortfolioGrid.tsx:11)
- Props: [`photos`](../../src/components/portfolio/PortfolioGrid.tsx:8)
- Features: Masonry layout, 3 sort modes (quality, emotion, recent), quality badges
- **Action required**: Use as-is, automatically handles routing on photo click

**3. PhotoGravity Component**
- Location: [`src/components/portfolio/PhotoGravity.tsx`](../../src/components/portfolio/PhotoGravity.tsx:53)
- Props: [`photos`](../../src/components/portfolio/PhotoGravity.tsx:49), [`onPhotoClick`](../../src/components/portfolio/PhotoGravity.tsx:50)
- Features: Three.js 3D rendering, similarity clustering, OrbitControls, hover info
- **Action required**: Use as-is, limit to 100 photos max for performance

**4. PortfolioFilters Component**
- Location: [`src/components/portfolio/PortfolioFilters.tsx`](../../src/components/portfolio/PortfolioFilters.tsx:7)
- Features: URL param management, preset filters (portfolioWorthy=true, minQuality=8+)
- **Action required**: Optional, can be used for future filter extensions

**5. usePhotoFilters Hook**
- Location: [`src/hooks/usePhotoFilters.ts`](../../src/hooks/usePhotoFilters.ts:5)
- Features: Client-side filtering logic for all filter types
- Inputs: [`photos`](../../src/hooks/usePhotoFilters.ts:5), [`filters`](../../src/hooks/usePhotoFilters.ts:5)
- **Action required**: Use for any additional client-side filtering needs

**6. Gallery API Route**
- Location: [`src/app/api/gallery/route.ts`](../../src/app/api/gallery/route.ts:11)
- Features: Fetches enriched photos from Supabase, supports query params
- Query params: [`portfolioWorthy`](../../src/app/api/gallery/route.ts:19), [`minQualityScore`](../../src/app/api/gallery/route.ts:31), [`printReady`](../../src/app/api/gallery/route.ts:23), [`playTypes`](../../src/app/api/gallery/route.ts:36), [`emotions`](../../src/app/api/gallery/route.ts:41)
- **Action required**: Fetch with `portfolioWorthy=true&minQualityScore=8` params

**7. Motion Tokens**
- Location: [`src/lib/motion-tokens.ts`](../../src/lib/motion-tokens.ts)
- Features: Unified animation tokens (spring.responsive, duration.fast, etc.)
- **Action required**: Import and use for consistent animations

### New Components Required

**1. Portfolio Page Container**
- File: `src/app/portfolio/page.tsx`
- Why new: No existing portfolio route, needs to orchestrate all components
- Responsibilities:
  - Fetch portfolio photos using SWR with `/api/gallery?portfolioWorthy=true&minQualityScore=8`
  - Manage view mode state (gradient | grid | 3d)
  - Render appropriate component based on view mode
  - Handle photo click navigation to `/photo/[id]`
  - Manage URL params for view mode persistence
  - Handle loading and error states

**2. View Mode Toggle Component**
- Why new: Need unified toggle UI for 3 view modes
- Responsibilities:
  - Render 3 toggle buttons with active state
  - Update URL params on mode change
  - Persist view mode preference
  - Accessible with keyboard navigation
  - Icon + label for each mode

**3. View Mode Transition Wrapper**
- Why new: Need smooth transitions between view modes
- Responsibilities:
  - Animate view mode changes with crossfade
  - Maintain photo data during transition
  - Prevent layout shift during mode switch
  - Handle edge cases (e.g., 3D fallback)

## Technical Approach

### Database
No new models or migrations required. Use existing:
- [`photos`](../../supabase/migrations/001_create_photo_metadata.sql) table with enriched metadata (already exists)
- [`photo_metadata`](../../supabase/migrations/001_create_photo_metadata.sql) JSONB column contains all necessary filter fields

### API

**Existing Endpoint to Use:**
- `GET /api/gallery?portfolioWorthy=true&minQualityScore=8` - Fetch portfolio photos
  - Returns: [`{ success: boolean, photos: Photo[], count: number }`](../../src/app/api/gallery/route.ts:49)
  - Cache: 5 minutes via Cache-Control headers
  - Filters: Pre-applied for portfolio quality threshold

### Frontend

**Component Structure:**
```
PortfolioPage (src/app/portfolio/page.tsx)
├── Header
│   ├── Title: "Portfolio"
│   ├── View Mode Toggle (3 buttons)
│   └── Photo Count
├── ViewModeRenderer (conditional)
│   ├── QualityGradientGrid (if mode === 'gradient')
│   ├── PortfolioGrid (if mode === 'grid')
│   └── PhotoGravity (if mode === '3d' && photos.length <= 100)
└── ErrorBoundary
    └── Fallback to Grid view if 3D fails
```

**State Management:**
```typescript
const [viewMode, setViewMode] = useState<'gradient' | 'grid' | '3d'>('gradient');
const { data, error, isLoading } = useSWR(
  '/api/gallery?portfolioWorthy=true&minQualityScore=8',
  fetcher
);
const photos = data?.photos || [];
```

**Data Flow:**
1. SWR fetches portfolio photos from `/api/gallery` on mount with preset filters
2. URL params determine initial view mode (default: gradient)
3. User clicks view mode toggle → [`setViewMode()`](../../src/app/portfolio/page.tsx) updates state + URL
4. Conditional rendering shows appropriate component
5. User clicks photo → Router navigates to `/photo/[id]` with returnUrl param
6. User clicks back → Returns to portfolio with preserved view mode

**URL Parameters:**
- `?view=gradient` - Quality Gradient view (default)
- `?view=grid` - Masonry Grid view
- `?view=3d` - 3D Gravity view

### Testing

**Unit Tests (2-3 tests per component):**
- View mode state updates correctly when toggles clicked
- URL params sync with view mode state
- Portfolio filter params passed correctly to API
- Photo count displays accurate filtered count

**Integration Tests (4-5 tests):**
- `/portfolio` returns 200 status
- Portfolio photos load with quality 8+ only
- View mode switches render correct component
- Photo click navigates to detail page
- Error fallback works when 3D fails

**Accessibility Tests (3-4 tests):**
- Keyboard navigation through view mode toggles
- ARIA labels present on all interactive elements
- Focus management during view mode transitions
- Screen reader announces view mode changes
- Color contrast meets WCAG AA standards

**Visual Regression Tests (3-4 tests):**
- Quality Gradient view renders with GSAP effects
- Grid view displays masonry layout correctly
- 3D view initializes with proper lighting
- View mode transitions animate smoothly
- Mobile responsive layout works correctly

**Performance Tests (2-3 tests):**
- GSAP animations maintain 60fps
- 3D view stays at 60fps with 100 photos
- View mode switches complete under 500ms
- Memory usage stable during mode transitions
- Lighthouse Performance score > 90

## Out of Scope

- Custom filter overrides beyond preset portfolio filters (save for future iteration)
- Bulk download of portfolio photos (implement in Phase 6)
- Portfolio album creation or organization
- Slideshow mode or auto-play
- Social sharing from portfolio page (only from photo detail)
- Print ordering directly from portfolio view
- Portfolio analytics or view tracking
- Custom view mode configurations
- Export portfolio as PDF or ZIP
- Collaborative portfolio curation

## Success Criteria

**Route Functionality:**
- `/portfolio` returns 200 status on navigation
- Page loads with all components visible within 2 seconds
- Only photos with quality 8+ displayed

**View Mode Interactions:**
- Toggle buttons switch between 3 view modes
- Active state clearly indicates current mode
- View mode persists in URL params
- Smooth transitions between modes (< 500ms)
- Each mode renders correctly on first load

**Quality Gradient View:**
- GSAP animations for brightness and blur active
- 1.5s animation duration with 0.02s stagger
- Brightness ranges from 50% (low quality) to 100% (high quality)
- Blur ranges from 5px (low sharpness) to 0px (high sharpness)
- Quality dots visible on hover

**Grid View:**
- Masonry layout displays correctly
- Sort controls toggle between 3 modes
- Photos reorder smoothly on sort change
- Quality badges overlay on top-left
- Metadata overlay on hover

**3D Gravity View:**
- Three.js scene renders without errors
- Photos cluster by similarity
- OrbitControls allow rotation and zoom
- Smooth lerp movement to target positions
- Instructions overlay visible and clear
- Hovered photo info displays correctly
- Limited to 100 photos with fallback message

**Photo Navigation:**
- Click on photo navigates to `/photo/[id]`
- Return URL preserves view mode preference
- Routing transition smooth without flash

**Accessibility:**
- All toggles accessible via Tab key
- Enter/Space keys activate view mode changes
- ARIA labels announce current view mode
- Focus visible on all interactive elements
- WCAG 2.1 AA color contrast ratios met

**Performance:**
- Lighthouse Performance score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- GSAP animations maintain 60fps
- 3D view maintains 60fps with up to 100 photos
- Memory usage stable during view mode transitions

## Implementation Checklist

### Phase 1: Route Setup & Foundation
- [ ] Create `src/app/portfolio/page.tsx` file
- [ ] Set up basic page structure with header
- [ ] Configure SWR data fetching for `/api/gallery?portfolioWorthy=true&minQualityScore=8`
- [ ] Add loading state with spinner component
- [ ] Add error state with retry button
- [ ] Test route returns 200 status
- [ ] Verify only portfolio photos (quality 8+) loaded

### Phase 2: View Mode Toggle System
- [ ] Create ViewModeToggle component
- [ ] Add 3 toggle buttons (Quality Gradient, Grid, 3D Gravity)
- [ ] Initialize view mode state with URL params
- [ ] Wire toggle click handlers to update state
- [ ] Sync view mode changes to URL params
- [ ] Add active state styling for current mode
- [ ] Test keyboard navigation (Tab, Enter)
- [ ] Add ARIA labels for accessibility

### Phase 3: Quality Gradient View Integration
- [ ] Import [`QualityGradientGrid`](../../src/components/portfolio/QualityGradientGrid.tsx:24) component
- [ ] Conditionally render when `viewMode === 'gradient'`
- [ ] Pass portfolio photos as prop
- [ ] Wire [`onPhotoClick`](../../src/components/portfolio/QualityGradientGrid.tsx:11) handler for navigation
- [ ] Test GSAP animations render correctly
- [ ] Verify brightness/blur effects work
- [ ] Test photo click navigation to `/photo/[id]`
- [ ] Verify 60fps animation performance

### Phase 4: Grid View Integration
- [ ] Import [`PortfolioGrid`](../../src/components/portfolio/PortfolioGrid.tsx:11) component
- [ ] Conditionally render when `viewMode === 'grid'`
- [ ] Pass portfolio photos as prop
- [ ] Test masonry layout renders correctly
- [ ] Verify sort controls work (quality, emotion, recent)
- [ ] Test photo click navigation (built-in)
- [ ] Verify quality badges display
- [ ] Test responsive layout (1/2/3/4 columns)

### Phase 5: 3D Gravity View Integration
- [ ] Import [`PhotoGravity`](../../src/components/portfolio/PhotoGravity.tsx:53) component
- [ ] Conditionally render when `viewMode === '3d'`
- [ ] Limit photos to first 100 for performance
- [ ] Add fallback message if more than 100 photos
- [ ] Wire [`onPhotoClick`](../../src/components/portfolio/PhotoGravity.tsx:50) handler for navigation
- [ ] Test Three.js scene initializes correctly
- [ ] Verify OrbitControls work (drag, zoom)
- [ ] Test similarity clustering algorithm
- [ ] Verify 60fps performance with 100 photos
- [ ] Test error boundary fallback to Grid view

### Phase 6: View Mode Transitions & Polish
- [ ] Add crossfade transition between view modes
- [ ] Prevent layout shift during mode switch
- [ ] Add transition duration (300-500ms)
- [ ] Test smooth transitions between all modes
- [ ] Verify photo data persists during transition
- [ ] Add loading indicator during mode switch
- [ ] Test return from photo detail preserves mode
- [ ] Add photo count display in header
- [ ] Update count dynamically if needed

### Phase 7: Testing & Validation
- [ ] Write Playwright test for route navigation
- [ ] Write test for view mode toggling
- [ ] Write test for photo click in each mode
- [ ] Write test for URL param persistence
- [ ] Run accessibility audit with axe
- [ ] Test keyboard navigation fully
- [ ] Test on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1280px+ width)
- [ ] Verify performance with Lighthouse
- [ ] Test with 200+ portfolio photos
- [ ] Run visual regression tests
- [ ] Test error states and fallbacks
- [ ] Verify 3D performance with 100 photos
- [ ] Update documentation

## Code Integration Examples

### Portfolio Page Implementation
```typescript
// src/app/portfolio/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { QualityGradientGrid } from '@/components/portfolio/QualityGradientGrid';
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid';
import { PhotoGravity } from '@/components/portfolio/PhotoGravity';
import type { Photo } from '@/types/photo';

const fetcher = (url: string) => fetch(url).then(r => r.json());

type ViewMode = 'gradient' | 'grid' | '3d';

export default function PortfolioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('gradient');

  // Initialize view mode from URL params
  useEffect(() => {
    const mode = searchParams.get('view') as ViewMode;
    if (mode && ['gradient', 'grid', '3d'].includes(mode)) {
      setViewMode(mode);
    }
  }, [searchParams]);

  // Fetch portfolio photos with preset filters
  const { data, error, isLoading } = useSWR(
    '/api/gallery?portfolioWorthy=true&minQualityScore=8',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const photos = data?.photos || [];

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    router.push(`/portfolio?view=${mode}`);
  };

  const handlePhotoClick = (photo: Photo) => {
    router.push(`/photo/${photo.id}?returnUrl=/portfolio?view=${viewMode}`);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">Failed to load portfolio</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-page min-h-screen">
      {/* Header */}
      <header className="mx-auto max-w-7xl px-6 pt-12 pb-8">
        <h1 className="text-2xl font-medium mb-6">Portfolio</h1>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <ViewModeButton
            active={viewMode === 'gradient'}
            onClick={() => handleViewModeChange('gradient')}
            icon="🎨"
            label="Quality Gradient"
          />
          <ViewModeButton
            active={viewMode === 'grid'}
            onClick={() => handleViewModeChange('grid')}
            icon="📐"
            label="Grid"
          />
          <ViewModeButton
            active={viewMode === '3d'}
            onClick={() => handleViewModeChange('3d')}
            icon="🌐"
            label="3D Gravity"
          />
        </div>

        {/* Photo Count */}
        <div className="text-sm text-gray-600">
          {isLoading ? 'Loading...' : `${photos.length} portfolio photos`}
        </div>
      </header>

      {/* View Mode Content */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      )}

      {!isLoading && photos.length > 0 && (
        <>
          {viewMode === 'gradient' && (
            <QualityGradientGrid
              photos={photos}
              onPhotoClick={handlePhotoClick}
            />
          )}

          {viewMode === 'grid' && (
            <PortfolioGrid photos={photos} />
          )}

          {viewMode === '3d' && (
            <>
              {photos.length <= 100 ? (
                <PhotoGravity
                  photos={photos}
                  onPhotoClick={handlePhotoClick}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-lg mb-4">
                    3D view limited to 100 photos for performance
                  </div>
                  <button
                    onClick={() => handleViewModeChange('grid')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Switch to Grid View
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

interface ViewModeButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

function ViewModeButton({ active, onClick, icon, label }: ViewModeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-black text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      aria-label={`Switch to ${label} view`}
      aria-pressed={active}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
}
```

### View Mode Persistence with URL Params
```typescript
// Handle browser back/forward navigation
useEffect(() => {
  const handlePopState = () => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('view') as ViewMode;
    if (mode && ['gradient', 'grid', '3d'].includes(mode)) {
      setViewMode(mode);
    }
  };

  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, []);
```

### Performance Optimization for 3D View
```typescript
// Limit photos for 3D performance
const photos3D = useMemo(() => {
  if (viewMode === '3d' && photos.length > 100) {
    // Take top 100 by quality score
    return [...photos]
      .sort((a, b) => {
        const scoreA = (a.metadata?.composition_score || 0);
        const scoreB = (b.metadata?.composition_score || 0);
        return scoreB - scoreA;
      })
      .slice(0, 100);
  }
  return photos;
}, [photos, viewMode]);
```

## Performance Targets

- **Time to First Byte:** < 600ms
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3.5s
- **Cumulative Layout Shift:** < 0.1
- **View Mode Switch Time:** < 500ms (transition animation)
- **GSAP Animation Frame Rate:** Solid 60fps for all effects
- **3D Rendering Frame Rate:** Solid 60fps with up to 100 photos
- **Memory Usage:** Stable during view mode transitions (< 10% increase)

## Error Handling Scenarios

1. **API fetch fails:** Display error state with retry button
2. **No portfolio photos found:** Show empty state with link to browse all photos
3. **3D view initialization fails:** Fallback to Grid view with error message
4. **More than 100 photos in 3D mode:** Show fallback message with Grid view option
5. **Network offline:** Show offline indicator, enable retry when online
6. **Invalid view mode in URL:** Reset to default gradient view
7. **Photo navigation fails:** Stay on portfolio page with error toast
8. **WebGL not supported:** Disable 3D view option, show only Gradient and Grid

## Browser Support

- Chrome 90+ (primary target)
- Firefox 88+ (full support)
- Safari 14+ (iOS Safari 14+)
- Edge 90+ (full support)
- **Note:** 3D view requires WebGL 2.0 support

## Dependencies

All required dependencies already installed:
- `next@15.1.6` - App Router framework
- `react@19.1.1` - UI library
- `framer-motion@12.23.22` - Animation library (Grid view)
- `gsap@3.12.5` - GSAP animations (Quality Gradient)
- `three@0.169.0` - 3D rendering library
- `@react-three/fiber@8.17.8` - React Three.js renderer
- `@react-three/drei@9.112.0` - Three.js helpers (OrbitControls, Html)
- `swr@2.2.5` - Data fetching
- `tailwindcss@4.1.13` - Styling
- `@supabase/supabase-js@2.75.0` - Database client

No additional dependencies required.