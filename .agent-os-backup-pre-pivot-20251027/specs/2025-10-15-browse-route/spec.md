# Specification: Browse Route with Magnetic Filter Orbs & Story Generation

## Goal
Implement the missing `/browse` route that enables users to discover volleyball photos through interactive magnetic filter orbs and generate AI-curated stories. This route assembles existing, fully-implemented components (MagneticFilterBar, PlayTypeMorphGrid, StoryGenerationModal) into a cohesive browsing experience.

## User Stories
- As a user, I want to navigate to `/browse` and see all volleyball photos so that I can explore the full gallery
- As a user, I want to hover near filter orbs and see them attract toward my cursor so that I experience playful, physics-based interactions
- As a user, I want to click filter orbs to activate filters so that I can narrow down photos by quality, play type, emotion, or composition
- As a user, I want to see photos smoothly morph and rearrange when filters change so that I get visual feedback of my selections
- As a user, I want to see a live count of filtered photos so that I understand how many results match my criteria
- As a user, I want to click "Generate Story" and select from 6 narrative arc types so that I can create curated photo collections
- As a user, I want story generation to complete in under 3 seconds so that I stay engaged without waiting
- As a user, I want to be redirected to the generated story page so that I can immediately view my curated collection

## Core Requirements

### Functional Requirements
- Route accessible at `/browse` returning 200 status
- Display all photos from gallery API with portfolio-worthy filter disabled by default
- Render 5 magnetic filter orbs with physics-based hover attraction (100px radius)
- Toggle filter states on click with visual feedback (black background when active)
- Update photo grid in real-time when filters change
- Display dynamic photo count showing current filtered results
- Provide "Generate Story" button visible at all times
- Open modal with 6 narrative arc type selectors on button click
- Generate story via API in under 3 seconds
- Redirect to `/stories/[id]` upon successful generation
- Support keyboard navigation for all interactive elements

### Non-Functional Requirements
- Initial page load under 2 seconds on 3G connection
- Smooth 60fps animations for filter orb attraction and grid morphing
- Handle up to 500 photos with virtual scrolling
- WCAG 2.1 AA compliance for accessibility
- Responsive layout supporting mobile (375px), tablet (768px), desktop (1280px+)
- Error states for API failures with user-friendly messages
- Loading states during data fetch and story generation

## Visual Design

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│ Header: "Browse Gallery" + Photo Count         │
│                                                 │
│ [Generate Story Button - Top Right]            │
├─────────────────────────────────────────────────┤
│                                                 │
│   Magnetic Filter Orbs (centered, floating)    │
│   [⭐ Portfolio] [🏐 Play Type] [😊 Emotion]   │
│   [📐 Composition] [⏰ Timeline]                │
│                                                 │
│   Photo Count: "243 photos"                    │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│   Photo Grid (4 columns, responsive masonry)   │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐                     │
│   │   │ │   │ │   │ │   │                     │
│   └───┘ └───┘ └───┘ └───┘                     │
│   ...more photos with smooth morphing...       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Filter Orbs Specification
- Size: 44px height with auto width based on label
- Spacing: 16px gap between orbs
- Default state: White background, gray border, gray text
- Active state: Black background, white text, no border
- Hover state: Scale 1.05, subtle shadow
- Magnetic attraction: Within 100px radius, pull toward cursor with spring physics (stiffness: 300, damping: 25)

### Photo Grid Specification
- Layout: CSS Grid with responsive columns (1/2/3/4 columns)
- Animation: Framer Motion LayoutGroup with popLayout mode
- Transition: Spring animation (stiffness: 300, damping: 25) for morphing
- Card design: Rounded corners (12px), hover lift effect, quality badges overlay

## Reusable Components

### Existing Code to Leverage

**1. MagneticFilterBar Component**
- Location: `src/components/filters/MagneticFilterBar.tsx`
- Props: `filters`, `onChange`, `photoCount`
- Current filters: Portfolio Quality, Print Ready, Social Media, Peak Moments, Golden Hour
- **Action required**: Use as-is, pass appropriate filter state

**2. MagneticFilterOrb Component**
- Location: `src/components/interactions/MagneticFilterOrb.tsx`
- Features: Physics-based magnetic attraction (useSpring, useMotionValue)
- Props: `label`, `icon`, `active`, `onClick`, `magneticRadius`
- **Action required**: Already used by MagneticFilterBar, no changes needed

**3. PlayTypeMorphGrid Component**
- Location: `src/components/gallery/PlayTypeMorphGrid.tsx`
- Features: Framer Motion animations, responsive masonry, virtual scrolling support
- Props: `photos`, `activePlayType`, `onPhotoClick`
- **Action required**: Use as-is, pass filtered photos and null activePlayType

**4. StoryGenerationModal Component**
- Location: `src/components/story/StoryGenerationModal.tsx`
- Features: 6 narrative arc types, loading states, error handling, focus trap
- Props: `isOpen`, `onClose`, `context`
- Narrative types: player-highlight, game-winning-rally, season-journey, comeback-story, technical-excellence, emotion-spectrum
- **Action required**: Integrate with "browse" context type

**5. usePhotoFilters Hook**
- Location: `src/hooks/usePhotoFilters.ts`
- Features: Client-side filtering logic for all filter types
- Inputs: `photos`, `filters`
- **Action required**: Use to filter photos based on MagneticFilterBar selections

**6. Gallery API Route**
- Location: `src/app/api/gallery/route.ts`
- Features: Fetches enriched photos from Supabase, supports query params
- Query params: `portfolioWorthy`, `printReady`, `socialMediaOptimized`, `minQuality`, `playTypes`, `emotions`
- **Action required**: Fetch with appropriate params, integrate with SWR

**7. Motion Tokens**
- Location: `src/lib/motion-tokens.ts`
- Features: Unified animation tokens (spring.responsive, duration.fast, etc.)
- **Action required**: Import and use for consistent animations

### New Components Required

**1. Browse Page Container**
- File: `src/app/browse/page.tsx`
- Why new: No existing browse route, needs to orchestrate all components
- Responsibilities:
  - Fetch photos using SWR with `/api/gallery` endpoint
  - Manage filter state for MagneticFilterBar
  - Manage modal open/close state for story generation
  - Pass filtered photos to PlayTypeMorphGrid
  - Handle loading and error states

**2. Generate Story Button**
- Why new: Standalone button not yet implemented for browse context
- Responsibilities:
  - Fixed position button (top-right corner)
  - Opens StoryGenerationModal with `context: { type: 'browse' }`
  - Accessible with keyboard navigation

**3. Browse Context for Story Generation**
- Why new: StoryGenerationModal expects context but "browse" type not defined
- Responsibilities:
  - Extend StoryGenerationModal to accept `type: 'browse'`
  - Show all 6 narrative arc types (no context filtering)
  - Pass filtered photos as context for story generation API

## Technical Approach

### Database
No new models or migrations required. Use existing:
- `photos` table with enriched metadata (already exists)
- `photo_metadata` JSONB column contains all necessary filter fields

### API

**Existing Endpoint to Use:**
- `GET /api/gallery` - Fetch photos with filters
  - Returns: `{ success: boolean, photos: Photo[], count: number }`
  - Cache: 5 minutes via Cache-Control headers

**Endpoint to Extend:**
- `POST /api/stories/generate` - Generate story from photos
  - Extend to accept `context.type: 'browse'`
  - For browse context, use all filtered photos (not specific game/athlete)
  - Return: `{ story: NarrativeArc }` with generated story ID

### Frontend

**Component Structure:**
```
BrowsePage (src/app/browse/page.tsx)
├── Header
│   ├── Title: "Browse Gallery"
│   ├── Photo Count
│   └── Generate Story Button
├── MagneticFilterBar
│   └── 5x MagneticFilterOrb components
├── PlayTypeMorphGrid
│   └── Animated photo cards with LayoutGroup
└── StoryGenerationModal (conditionally rendered)
    └── 6 narrative arc type cards
```

**State Management:**
```typescript
const [filters, setFilters] = useState<PhotoFilterState>({});
const [isModalOpen, setIsModalOpen] = useState(false);
const { data, error, isLoading } = useSWR('/api/gallery', fetcher);
const filteredPhotos = usePhotoFilters(data?.photos || [], filters);
```

**Data Flow:**
1. SWR fetches photos from `/api/gallery` on mount
2. User clicks filter orb → `setFilters()` updates state
3. `usePhotoFilters` hook filters photos client-side
4. PlayTypeMorphGrid receives filtered photos, triggers layout animation
5. User clicks "Generate Story" → Modal opens
6. User selects arc type → POST to `/api/stories/generate`
7. API generates story → Returns story ID
8. Client redirects to `/stories/[id]`

### Testing

**Unit Tests:**
- Filter state updates correctly when orbs clicked
- usePhotoFilters correctly filters photos by each criteria
- Photo count updates dynamically

**Integration Tests:**
- `/browse` returns 200 status
- Photos load from API within 2 seconds
- Filters apply and grid morphs smoothly
- Story generation completes within 3 seconds
- Redirect to story page successful

**Accessibility Tests:**
- Keyboard navigation through all filter orbs
- Focus trap works in story generation modal
- ARIA labels present on all interactive elements
- Screen reader announces photo count changes

**Visual Regression Tests:**
- Filter orbs render correctly in all states
- Magnetic attraction animation works
- Photo grid morphs smoothly
- Modal opens/closes with proper animations

## Out of Scope

- Advanced filters beyond the 5 existing orbs (save for future iteration)
- Infinite scroll pagination (initial load supports up to 500 photos)
- Saving filter presets or user preferences
- Social sharing from browse page (only from individual photo pages)
- Batch selection for custom story creation
- Export filtered results as PDF or ZIP
- Album creation from filtered photos
- Real-time collaborative filtering

## Success Criteria

**Route Functionality:**
- `/browse` returns 200 status on navigation
- Page loads with all components visible within 2 seconds

**Filter Interactions:**
- Magnetic attraction activates within 100px cursor distance
- Spring animation feels smooth at 60fps
- Active state toggles with black background on click
- Photos filter correctly based on selected orbs
- Photo count updates instantly on filter change

**Photo Display:**
- Grid displays all photos in masonry layout
- Layout morphing animation triggers on filter change
- Smooth spring transitions (no jank or stuttering)
- Photos load progressively with lazy loading

**Story Generation:**
- "Generate Story" button visible at all times
- Modal opens with all 6 narrative arc types
- Story generates in under 3 seconds
- Success redirect to `/stories/[id]` page
- Error states display user-friendly messages

**Accessibility:**
- All orbs accessible via Tab key
- Enter/Space keys activate filters
- Modal focus trap prevents tabbing outside
- Screen readers announce photo count changes
- WCAG 2.1 AA color contrast ratios met

**Performance:**
- Lighthouse Performance score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- No layout shift during filter changes
- Memory usage stable during extended filtering

## Implementation Checklist

### Phase 1: Route Setup
- [ ] Create `src/app/browse/page.tsx` file
- [ ] Set up basic page structure with header
- [ ] Configure SWR data fetching for `/api/gallery`
- [ ] Add loading state with spinner component
- [ ] Add error state with retry button
- [ ] Test route returns 200 status

### Phase 2: Filter Integration
- [ ] Import MagneticFilterBar component
- [ ] Initialize filter state with useState
- [ ] Wire onChange handler to update filter state
- [ ] Import usePhotoFilters hook
- [ ] Pass filtered photos to grid component
- [ ] Test filter state updates correctly

### Phase 3: Photo Grid Display
- [ ] Import PlayTypeMorphGrid component
- [ ] Pass filtered photos as prop
- [ ] Set activePlayType to null (show all)
- [ ] Wire onPhotoClick handler (optional)
- [ ] Test grid renders and morphs smoothly
- [ ] Verify layout animation performance

### Phase 4: Story Generation
- [ ] Add "Generate Story" button to header
- [ ] Create modal open/close state
- [ ] Import StoryGenerationModal component
- [ ] Extend modal to accept "browse" context type
- [ ] Update STORY_TYPES to show all 6 types for browse
- [ ] Wire modal props (isOpen, onClose, context)
- [ ] Test modal opens/closes correctly
- [ ] Test story generation API call

### Phase 5: Polish & Accessibility
- [ ] Add keyboard navigation tests
- [ ] Verify focus trap in modal
- [ ] Add ARIA labels to all interactive elements
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Verify color contrast ratios
- [ ] Add loading states during API calls
- [ ] Add error handling with user feedback

### Phase 6: Testing & Validation
- [ ] Write Playwright test for route navigation
- [ ] Write test for filter interactions
- [ ] Write test for story generation flow
- [ ] Run visual regression tests
- [ ] Run accessibility audit with axe
- [ ] Test on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1280px+ width)
- [ ] Verify performance with Lighthouse
- [ ] Test with 500+ photos for performance

### Phase 7: Documentation & Deployment
- [ ] Update README with /browse route documentation
- [ ] Add inline comments for complex logic
- [ ] Create changelog entry
- [ ] Submit PR with screenshots
- [ ] Request code review
- [ ] Address review feedback
- [ ] Merge to main branch
- [ ] Verify production deployment

## Code Integration Examples

### Browse Page Implementation
```typescript
// src/app/browse/page.tsx
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { MagneticFilterBar } from '@/components/filters/MagneticFilterBar';
import { PlayTypeMorphGrid } from '@/components/gallery/PlayTypeMorphGrid';
import { StoryGenerationModal } from '@/components/story/StoryGenerationModal';
import { usePhotoFilters } from '@/hooks/usePhotoFilters';
import type { PhotoFilterState } from '@/types/photo';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function BrowsePage() {
  const [filters, setFilters] = useState<PhotoFilterState>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, error, isLoading } = useSWR('/api/gallery', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const photos = data?.photos || [];
  const filteredPhotos = usePhotoFilters(photos, filters);

  return (
    <div className="browse-page min-h-screen">
      {/* Header */}
      <header className="mx-auto max-w-7xl px-6 pt-12 pb-8">
        <h1 className="text-2xl font-medium mb-2">Browse Gallery</h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-12 right-6 px-4 py-2 bg-black text-white rounded-full"
        >
          Generate Story
        </button>
      </header>

      {/* Filter Bar */}
      <div className="mb-12">
        <MagneticFilterBar
          filters={filters}
          onChange={setFilters}
          photoCount={filteredPhotos.length}
        />
      </div>

      {/* Photo Grid */}
      {isLoading && <div>Loading...</div>}
      {!isLoading && filteredPhotos.length > 0 && (
        <PlayTypeMorphGrid
          photos={filteredPhotos}
          activePlayType={null}
          onPhotoClick={(photo) => console.log('Photo clicked:', photo.id)}
        />
      )}

      {/* Story Generation Modal */}
      <StoryGenerationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        context={{
          type: 'browse',
          id: 'all-photos',
          name: 'Browse Gallery',
        }}
      />
    </div>
  );
}
```

### Extending StoryGenerationModal for Browse Context
```typescript
// Update STORY_TYPES in src/components/story/StoryGenerationModal.tsx
// Add 'browse' to contexts array for all types:
const STORY_TYPES = [
  {
    id: 'player-highlight',
    icon: '⭐',
    title: 'Player Highlight Reel',
    description: 'Top 10 portfolio moments',
    contexts: ['athlete', 'browse'], // Added 'browse'
  },
  // ... repeat for all 6 types
];
```

### API Extension for Browse Context
```typescript
// src/app/api/stories/generate/route.ts
// Handle 'browse' context type by using all filtered photos
if (context.type === 'browse') {
  // Use photos from current filter state
  const photos = await fetchPhotos(context.filters || {});
  const narrative = await generateNarrative(storyType, photos, context);
  // ... rest of generation logic
}
```

## Performance Targets

- **Time to First Byte:** < 600ms
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3.5s
- **Cumulative Layout Shift:** < 0.1
- **Filter Response Time:** < 100ms (client-side filtering)
- **Story Generation:** < 3s (API call + redirect)
- **Animation Frame Rate:** Solid 60fps for all transitions

## Error Handling Scenarios

1. **API fetch fails:** Display error state with retry button
2. **No photos match filters:** Show empty state with "Clear Filters" button
3. **Story generation fails:** Show inline error in modal, allow retry
4. **Story generation timeout:** Show timeout message after 5 seconds
5. **Network offline:** Show offline indicator, enable retry when online
6. **Invalid filter state:** Reset to default filters with notification

## Browser Support

- Chrome 90+ (primary target)
- Firefox 88+ (full support)
- Safari 14+ (iOS Safari 14+)
- Edge 90+ (full support)

## Dependencies

All required dependencies already installed:
- `next@15.1.6` - App Router framework
- `react@19.1.1` - UI library
- `framer-motion@12.23.22` - Animation library
- `swr@2.2.5` - Data fetching
- `tailwindcss@4.1.13` - Styling
- `@supabase/supabase-js@2.75.0` - Database client

No additional dependencies required.
