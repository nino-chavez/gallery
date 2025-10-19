# Specification: Stories Dynamic Route with Full-Screen Viewer

## Goal
Implement the `/stories/[id]` dynamic route that displays AI-curated photo stories through an immersive full-screen viewing experience. This route integrates the fully-implemented StoryViewer component with data fetching, sharing capabilities, and PDF export functionality, completing Phase 4 (AI Story Curation & Discovery) from the roadmap.

## User Stories
- As a user, I want to navigate to `/stories/[story-id]` and see my generated story so that I can view the curated photo collection
- As a user, I want the story to auto-play with 3-second intervals so that I experience a guided narrative flow
- As a user, I want to pause/play and navigate with keyboard arrows so that I control the pacing
- As a user, I want to click on the emotional curve to jump to specific moments so that I can revisit impactful photos
- As a user, I want to share the story via social media or copy link so that I can show others my collection
- As a user, I want to export the story as PDF so that I can save or print the narrative
- As a user, I want SEO metadata to populate when sharing so that the story displays properly on social platforms
- As a user, I want clear error messages if the story doesn't exist so that I understand what went wrong
- As a coach, I want to share game-winning rally stories with recruits so that I can showcase team performance
- As an athlete, I want to export my highlight reel as PDF so that I can include it in recruiting materials

## Core Requirements

### Functional Requirements
- Route accessible at `/stories/[id]` with dynamic ID parameter
- Fetch story data from `/api/stories/[id]` endpoint on mount
- Display full-screen StoryViewer with auto-play enabled by default
- Support all 6 narrative arc types (game-winning-rally, player-highlight, season-journey, comeback-story, technical-excellence, emotion-spectrum)
- Provide share functionality with copy link and social media options
- Provide PDF export button using jsPDF library
- Display loading state during story fetch with spinner
- Display error state for invalid/missing story ID with retry option
- Generate SEO metadata for Open Graph and Twitter Cards
- Support keyboard navigation (arrows, space, escape)
- Allow closing story viewer (returns to previous page or browse)

### Non-Functional Requirements
- Initial story load under 1.5 seconds on 3G connection
- Smooth 60fps transitions between photos
- PDF generation completes in under 5 seconds for 10-photo story
- WCAG 2.1 AA compliance for accessibility
- Responsive layout supporting mobile (375px), tablet (768px), desktop (1280px+)
- Error states with user-friendly messages and recovery actions
- SEO-optimized meta tags for social sharing
- Proper handling of missing or expired story IDs

## Visual Design

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│ Full-Screen Story Viewer (black background)     │
│                                                 │
│ [× Close - Top Right]                           │
│                                                 │
│ Story Title + Description (Top Left)            │
│ "Game-Winning Rally"                            │
│ "The final 8 moments that secured victory"     │
│ ⭐ Quality: 8.5/10  ⚡ 6 peak moments  🎬 2 min  │
│                                                 │
│                                                 │
│              ┌──────────────┐                   │
│              │              │                   │
│              │  Photo       │                   │
│              │  (centered)  │                   │
│              │              │                   │
│              └──────────────┘                   │
│                                                 │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Emotional Curve Graph (SVG)             │   │
│  │     /\      /\                          │   │
│  │    /  \    /  \    /\                   │   │
│  │   /    \  /    \  /  \                  │   │
│  │  /      \/      \/    \                 │   │
│  │ ●────────────────────────               │   │
│  │ 😤 Intensity • Intensity: 8/10           │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ●●●●●●○○ (Progress dots)                      │
│                                                 │
│  [← Prev]  [⏸️ Pause]  [Next →]                │
│                                                 │
│  [📤 Share]  [📄 Export PDF]                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Story Header Specification
- Title: 3xl font, bold, white text with drop shadow
- Description: sm font, 80% opacity
- Metadata row: flex layout with icons, 60% opacity
- Position: Absolute top-left with 8rem padding

### Photo Display Specification
- Layout: Centered with max-width/max-height, object-fit contain
- Transition: Framer Motion with opacity + scale (0.5s duration)
- Background: Pure black (#000000) for immersion

### Emotional Curve Specification
- Position: Bottom of screen, 3/4 width, centered
- Height: 6rem (96px)
- Background: White 10% opacity with backdrop blur
- SVG Graph: White stroke, 3px width, area fill with 10% opacity
- Current position: Golden circle (#FFD700) with 6px radius
- Interactive: Click anywhere to seek to that timestamp
- Emotion label: Icon + text + intensity score

### Control Buttons Specification
- Navigation: White 20% opacity, backdrop blur, rounded-full
- Hover state: White 30% opacity transition
- Disabled state: 30% opacity, cursor not-allowed
- Share/Export: Secondary row, smaller buttons, same styling

### Progress Dots Specification
- Position: Between curve and navigation controls
- Active dot: White, 8px width (pill shape)
- Inactive dots: White 40% opacity, 2px width (circles)
- Spacing: 2px gap between dots

## Reusable Components

### Existing Code to Leverage

**1. StoryViewer Component**
- Location: [`src/components/story/StoryViewer.tsx`](src/components/story/StoryViewer.tsx:1)
- Status: **100% Complete** - No modifications needed
- Features:
  - 3-second auto-advance with play/pause state
  - Framer Motion transitions (opacity + scale)
  - Emotional curve SVG graph with click-to-seek
  - Keyboard navigation (arrows, space, escape)
  - Progress dots with current position indicator
  - Navigation controls (prev/next/play/pause)
  - Story metadata display (quality, peak moments, duration)
- Props: `story` (NarrativeArc), `autoPlay` (boolean), `onClose` (function)
- **Action required**: Use as-is with `autoPlay={true}` and wire onClose handler

**2. NarrativeArc Type**
- Location: [`src/lib/story-curation/narrative-arcs.ts`](src/lib/story-curation/narrative-arcs.ts:1)
- Status: **100% Complete** - Type definition fully implemented
- Structure:
  ```typescript
  interface NarrativeArc {
    type: 'game-winning-rally' | 'player-highlight' | 'season-journey' | 'comeback-story' | 'technical-excellence' | 'emotion-spectrum';
    photos: Photo[];
    title: string;
    description: string;
    emotionalCurve: Array<{ timestamp: string; emotion: string; intensity: number }>;
    metadata: { avgQuality: number; peakMoments: number; duration: string };
  }
  ```
- **Action required**: Use as type definition for fetched story data

**3. Story API Endpoint**
- Location: [`src/app/api/stories/[id]/route.ts`](src/app/api/stories/[id]/route.ts:1)
- Status: **100% Complete** - Fetches story with photos from database
- Response: `{ story: NarrativeArc }`
- Features:
  - Fetches from `stories` and `story_photos` tables
  - Joins with `photo_metadata` for enriched data
  - Calculates avgQuality and peakMoments
  - Returns complete NarrativeArc object
- **Action required**: Fetch via SWR with error handling

**4. Motion Tokens**
- Location: [`src/lib/motion-tokens.ts`](src/lib/motion-tokens.ts:1)
- Features: Spring configs, duration tokens, emotion palettes, icons
- **Action required**: Import EMOTION_ICONS for emotion curve display (already used in StoryViewer)

### New Components Required

**1. Stories Page Container**
- File: `src/app/stories/[id]/page.tsx`
- Why new: No existing dynamic route for stories
- Responsibilities:
  - Extract story ID from URL params (Next.js 15 async params)
  - Fetch story data using SWR with `/api/stories/[id]`
  - Handle loading state with full-screen spinner
  - Handle error state with user-friendly message and retry
  - Render StoryViewer with fetched story data
  - Implement onClose handler (router.back() or navigate to /browse)
  - Generate SEO metadata using Next.js metadata API
  - Provide share functionality (copy link, social media)
  - Provide PDF export functionality using jsPDF

**2. Share Button Component**
- Why new: Sharing functionality not yet implemented for stories
- Responsibilities:
  - Copy story URL to clipboard with success toast
  - Open social media share dialogs (Twitter, Facebook, LinkedIn)
  - Format share text with story title and description
  - Position as floating button or in control row

**3. PDF Export Functionality**
- Why new: PDF export identified as missing in IMPLEMENTATION_STATUS.md
- Responsibilities:
  - Generate PDF using jsPDF library
  - Include story title, description, and metadata
  - Add all photos with captions (if available)
  - Include emotional curve visualization
  - Add photo credits and quality scores
  - Download as `[story-title]-story.pdf`
  - Show progress indicator during generation
  - Handle errors gracefully

**4. SEO Metadata Generator**
- Why new: Stories need proper social sharing metadata
- Responsibilities:
  - Generate Open Graph tags (title, description, image)
  - Generate Twitter Card tags
  - Use first photo as og:image
  - Include story type in metadata
  - Set canonical URL to `/stories/[id]`

## Technical Approach

### Database
No new models or migrations required. Use existing:
- `stories` table with narrative arc data
- `story_photos` junction table with photo sequences
- `photo_metadata` table with enriched photo data

### API

**Existing Endpoint to Use:**
- `GET /api/stories/[id]` - Fetch complete story with photos
  - Returns: `{ story: NarrativeArc }`
  - Error: `{ error: string }` with 500 or 404 status
  - Cache: Consider adding Cache-Control headers (5 minutes)

**No New Endpoints Required** - All functionality can be client-side

### Frontend

**Component Structure:**
```
StoriesPage (src/app/stories/[id]/page.tsx)
├── Loading State (full-screen spinner)
├── Error State (with retry button)
└── StoryViewer (on successful load)
    ├── Close button (router.back)
    ├── Photo display with transitions
    ├── Emotional curve graph
    ├── Navigation controls
    ├── Progress dots
    └── Share/Export controls
        ├── Share button (copy link + social)
        └── Export PDF button (jsPDF generation)
```

**State Management:**
```typescript
const { data, error, isLoading } = useSWR(`/api/stories/${id}`, fetcher);
const [isExporting, setIsExporting] = useState(false);
const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle');
```

**Data Flow:**
1. Next.js extracts story ID from dynamic route params
2. SWR fetches story from `/api/stories/[id]` on mount
3. Loading state displays full-screen spinner
4. On success, render StoryViewer with story data
5. On error, display error message with retry button
6. User clicks Share → Copy link or open social dialog
7. User clicks Export PDF → Generate PDF with jsPDF → Download
8. User presses Escape or clicks Close → Navigate back

**PDF Export Implementation:**
```typescript
async function exportToPDF(story: NarrativeArc) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  // Title page
  doc.setFontSize(24);
  doc.text(story.title, 20, 30);
  doc.setFontSize(12);
  doc.text(story.description, 20, 45);
  
  // Metadata
  doc.text(`Quality: ${story.metadata.avgQuality}/10`, 20, 60);
  doc.text(`Peak Moments: ${story.metadata.peakMoments}`, 20, 70);
  doc.text(`Duration: ${story.metadata.duration}`, 20, 80);
  
  // Photos (one per page)
  for (let i = 0; i < story.photos.length; i++) {
    if (i > 0) doc.addPage();
    const photo = story.photos[i];
    const img = await loadImage(photo.image_url);
    doc.addImage(img, 'JPEG', 20, 20, 170, 120);
    doc.text(`Photo ${i + 1}: ${story.emotionalCurve[i].emotion}`, 20, 150);
  }
  
  doc.save(`${story.title.replace(/\s+/g, '-').toLowerCase()}-story.pdf`);
}
```

**SEO Metadata (Next.js 15 Metadata API):**
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const story = await fetchStory(id);
  
  return {
    title: `${story.title} | Nino Chavez Gallery`,
    description: story.description,
    openGraph: {
      title: story.title,
      description: story.description,
      images: [{ url: story.photos[0].image_url }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title,
      description: story.description,
      images: [story.photos[0].image_url],
    },
  };
}
```

### Testing

**Unit Tests (2-3 tests):**
- Story data fetching succeeds with valid ID
- Error handling for invalid story ID (404)
- PDF export generates correct document structure

**Integration Tests (4-6 tests):**
- `/stories/[id]` route returns 200 for valid story
- Loading state displays during fetch
- StoryViewer renders with correct story data
- Share button copies URL to clipboard
- PDF export downloads file successfully
- Close button navigates back to previous page

**Accessibility Tests (2-3 tests):**
- Keyboard navigation works (arrows, space, escape)
- Screen reader announces story title and progress
- Focus management when modal opens/closes

**Visual Regression Tests (2-3 tests):**
- Full-screen viewer renders correctly
- Emotional curve graph displays properly
- Share/export buttons positioned correctly

## Out of Scope

- Story editing functionality (future feature)
- Collaborative story features (Phase 9)
- Video export (Phase 9 feature - requires ffmpeg)
- Story comments or reactions (Phase 9)
- Story collections or playlists
- Story analytics or view tracking
- Custom story templates
- Multi-author stories
- Story versioning or history

## Success Criteria

**Route Functionality:**
- `/stories/[id]` returns 200 status for valid story
- Page loads with StoryViewer visible within 1.5 seconds
- Dynamic routing correctly extracts and uses story ID

**Story Display:**
- Full-screen viewer displays with black background
- Photos transition smoothly with Framer Motion animations
- Auto-play starts automatically with 3-second intervals
- All story metadata displays correctly (title, description, stats)

**Interactive Features:**
- Emotional curve click-to-seek works accurately
- Play/pause button toggles correctly
- Previous/next navigation works with boundary checks
- Progress dots reflect current position
- Keyboard controls work (arrows, space, escape)

**Sharing & Export:**
- Share button copies URL to clipboard with confirmation
- Social media share dialogs open correctly
- PDF export generates within 5 seconds
- PDF includes all photos and metadata
- Downloaded PDF filename matches story title

**Error Handling:**
- Invalid story ID displays 404 error with helpful message
- Network errors display retry button
- Missing photos handled gracefully
- Export failures show user-friendly error message

**SEO & Performance:**
- Open Graph metadata populates correctly
- Twitter Card displays story preview
- First Contentful Paint < 1.5s
- No layout shift during load
- Lighthouse Performance score > 90

**Accessibility:**
- All controls accessible via keyboard
- Screen reader announces story progress
- Color contrast meets WCAG 2.1 AA
- Focus indicators visible on all interactive elements
- Escape key closes viewer and returns focus

## Implementation Checklist

### Phase 1: Route Setup & Data Fetching
- [ ] Create `src/app/stories/[id]/page.tsx` file
- [ ] Implement async params extraction (Next.js 15)
- [ ] Configure SWR data fetching for `/api/stories/[id]`
- [ ] Add loading state with full-screen spinner
- [ ] Add error state with retry button and helpful message
- [ ] Test route returns 200 for valid story ID
- [ ] Test route returns 404 for invalid story ID

### Phase 2: StoryViewer Integration
- [ ] Import StoryViewer component
- [ ] Pass story data as prop with correct NarrativeArc type
- [ ] Set `autoPlay={true}` for automatic playback
- [ ] Implement onClose handler with router.back()
- [ ] Test viewer renders with all features working
- [ ] Test keyboard navigation (arrows, space, escape)
- [ ] Verify emotional curve seek functionality

### Phase 3: SEO Metadata
- [ ] Implement generateMetadata function
- [ ] Add Open Graph tags (title, description, image)
- [ ] Add Twitter Card tags
- [ ] Use first photo as social preview image
- [ ] Set canonical URL to `/stories/[id]`
- [ ] Test social share preview on Twitter/Facebook
- [ ] Verify metadata in browser DevTools

### Phase 4: Share Functionality
- [ ] Create Share button component
- [ ] Implement copy-to-clipboard functionality
- [ ] Add success toast notification
- [ ] Add social media share options (Twitter, Facebook, LinkedIn)
- [ ] Format share text with story title
- [ ] Position button in control row
- [ ] Test on mobile and desktop
- [ ] Verify clipboard API permissions

### Phase 5: PDF Export
- [ ] Install jsPDF dependency (`npm install jspdf`)
- [ ] Create exportToPDF utility function
- [ ] Implement PDF title page with story metadata
- [ ] Add all photos to PDF (one per page)
- [ ] Include emotional curve snapshot
- [ ] Add photo captions and quality scores
- [ ] Implement download with sanitized filename
- [ ] Add loading state during export
- [ ] Test with 5-photo and 15-photo stories
- [ ] Handle export errors gracefully

### Phase 6: Polish & Error Handling
- [ ] Add loading spinner animation
- [ ] Improve error message copy
- [ ] Add retry functionality for failed fetches
- [ ] Handle missing photo URLs gracefully
- [ ] Test with slow 3G connection
- [ ] Verify all transitions are smooth at 60fps
- [ ] Add analytics tracking (optional)

### Phase 7: Testing & Validation
- [ ] Write Playwright test for route navigation
- [ ] Write test for successful story load
- [ ] Write test for 404 error handling
- [ ] Write test for share button functionality
- [ ] Write test for PDF export
- [ ] Write test for keyboard navigation
- [ ] Run accessibility audit with axe
- [ ] Test on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1280px+ width)
- [ ] Verify Lighthouse Performance > 90
- [ ] Run visual regression tests

### Phase 8: Documentation & Deployment
- [ ] Update README with `/stories/[id]` documentation
- [ ] Add inline comments for complex logic
- [ ] Create changelog entry
- [ ] Update IMPLEMENTATION_STATUS.md
- [ ] Submit PR with screenshots
- [ ] Request code review
- [ ] Address review feedback
- [ ] Merge to main branch
- [ ] Verify production deployment
- [ ] Test story generation flow end-to-end

## Code Integration Examples

### Stories Page Implementation
```typescript
// src/app/stories/[id]/page.tsx
'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { StoryViewer } from '@/components/story/StoryViewer';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import type { NarrativeArc } from '@/lib/story-curation/narrative-arcs';

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Story not found');
  return r.json();
});

interface Props {
  params: Promise<{ id: string }>;
}

export default function StoryPage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  
  const { data, error, isLoading, mutate } = useSWR(
    `/api/stories/${id}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <LoadingState message="Loading your story..." />
      </div>
    );
  }

  if (error || !data?.story) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <ErrorState
          title="Story Not Found"
          message="This story doesn't exist or has been deleted."
          action={{
            label: 'Back to Browse',
            onClick: () => router.push('/browse'),
          }}
        />
      </div>
    );
  }

  const story: NarrativeArc = data.story;

  return (
    <>
      {/* Share and Export Controls */}
      <div className="fixed top-20 right-8 z-50 flex gap-4">
        <ShareButton storyId={id} storyTitle={story.title} />
        <ExportPDFButton story={story} />
      </div>

      {/* Story Viewer */}
      <StoryViewer
        story={story}
        autoPlay={true}
        onClose={() => router.back()}
      />
    </>
  );
}
```

### Share Button Component
```typescript
// src/components/story/ShareButton.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareButtonProps {
  storyId: string;
  storyTitle: string;
}

export function ShareButton({ storyId, storyTitle }: ShareButtonProps) {
  const [showToast, setShowToast] = useState(false);
  
  const copyLink = async () => {
    const url = `${window.location.origin}/stories/${storyId}`;
    try {
      await navigator.clipboard.writeText(url);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToSocial = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const url = `${window.location.origin}/stories/${storyId}`;
    const text = `Check out this story: ${storyTitle}`;
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="relative">
      <button
        onClick={copyLink}
        className="bg-white/20 backdrop-blur px-4 py-2 rounded-full hover:bg-white/30 transition text-white flex items-center gap-2"
        aria-label="Share story"
      >
        📤 Share
      </button>
      
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full mt-2 right-0 bg-white text-black px-4 py-2 rounded-lg shadow-lg text-sm"
          >
            Link copied!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### PDF Export Implementation
```typescript
// src/components/story/ExportPDFButton.tsx
'use client';

import { useState } from 'react';
import type { NarrativeArc } from '@/lib/story-curation/narrative-arcs';

interface ExportPDFButtonProps {
  story: NarrativeArc;
}

export function ExportPDFButton({ story }: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Title page
      doc.setFontSize(24);
      doc.text(story.title, 20, 30);
      
      doc.setFontSize(12);
      const descLines = doc.splitTextToSize(story.description, 170);
      doc.text(descLines, 20, 45);
      
      // Metadata
      doc.setFontSize(10);
      doc.text(`Average Quality: ${story.metadata.avgQuality}/10`, 20, 70);
      doc.text(`Peak Moments: ${story.metadata.peakMoments}`, 20, 80);
      doc.text(`Duration: ${story.metadata.duration}`, 20, 90);
      doc.text(`Story Type: ${story.type}`, 20, 100);
      
      // Photos (one per page)
      for (let i = 0; i < story.photos.length; i++) {
        doc.addPage();
        const photo = story.photos[i];
        const emotion = story.emotionalCurve[i];
        
        // Photo number and emotion
        doc.setFontSize(14);
        doc.text(`Photo ${i + 1} of ${story.photos.length}`, 20, 20);
        doc.setFontSize(10);
        doc.text(`Emotion: ${emotion.emotion} (Intensity: ${emotion.intensity}/10)`, 20, 30);
        
        // Load and add image
        try {
          const img = await loadImage(photo.image_url);
          const imgProps = calculateImageDimensions(img);
          doc.addImage(img, 'JPEG', imgProps.x, 40, imgProps.width, imgProps.height);
        } catch (err) {
          console.error('Failed to load image:', err);
          doc.text('Image could not be loaded', 20, 50);
        }
        
        // Photo caption if available
        if (photo.caption) {
          doc.text(photo.caption, 20, 270);
        }
      }
      
      // Download
      const filename = `${story.title.replace(/\s+/g, '-').toLowerCase()}-story.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToPDF}
      disabled={isExporting}
      className="bg-white/20 backdrop-blur px-4 py-2 rounded-full hover:bg-white/30 transition text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Export story as PDF"
    >
      {isExporting ? '⏳ Exporting...' : '📄 Export PDF'}
    </button>
  );
}

// Helper functions
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function calculateImageDimensions(img: HTMLImageElement) {
  const maxWidth = 170;
  const maxHeight = 220;
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
  const width = img.width * ratio;
  const height = img.height * ratio;
  const x = (210 - width) / 2; // Center horizontally (A4 width is 210mm)
  return { x, width, height };
}
```

### SEO Metadata Generator
```typescript
// src/app/stories/[id]/page.tsx (add this function)
import type { Metadata } from 'next';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stories/${id}`);
    if (!res.ok) throw new Error('Story not found');
    
    const { story } = await res.json();
    const firstPhoto = story.photos[0];
    
    return {
      title: `${story.title} | Nino Chavez Gallery`,
      description: story.description,
      openGraph: {
        title: story.title,
        description: story.description,
        images: [
          {
            url: firstPhoto.image_url,
            width: 1200,
            height: 630,
            alt: story.title,
          },
        ],
        type: 'article',
        siteName: 'Nino Chavez Gallery',
      },
      twitter: {
        card: 'summary_large_image',
        title: story.title,
        description: story.description,
        images: [firstPhoto.image_url],
      },
    };
  } catch (err) {
    return {
      title: 'Story Not Found | Nino Chavez Gallery',
      description: 'This story could not be found.',
    };
  }
}
```

## Performance Targets

- **Time to First Byte:** < 600ms
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s (first photo load)
- **Time to Interactive:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **Story Fetch Time:** < 1s on good connection
- **PDF Generation:** < 5s for 10-photo story
- **Animation Frame Rate:** Solid 60fps for all transitions
- **Share Action:** < 200ms response time

## Error Handling Scenarios

1. **Story ID not found (404):** Display error state with "Story Not Found" message and "Back to Browse" button
2. **Network error during fetch:** Display error with retry button and connection tips
3. **Malformed story data:** Display generic error and log to console for debugging
4. **PDF export fails:** Show inline error toast with retry option
5. **Share clipboard fails:** Fall back to manual copy with visible URL
6. **Photo load fails:** Display placeholder with error icon, continue story
7. **Slow connection:** Show loading progress indicator, warn if taking >5s

## Browser Support

- Chrome 90+ (primary target)
- Firefox 88+ (full support)
- Safari 14+ (iOS Safari 14+)
- Edge 90+ (full support)

## Dependencies

All required dependencies already installed except jsPDF:
- `next@15.1.6` - App Router framework
- `react@19.1.1` - UI library
- `framer-motion@12.23.22` - Animation library (used by StoryViewer)
- `swr@2.2.5` - Data fetching
- `tailwindcss@4.1.13` - Styling
- `@supabase/supabase-js@2.75.0` - Database client

**New Dependency Required:**
- `jspdf` - PDF generation library (install with `npm install jspdf`)

## Related Features

This specification completes Phase 4 (AI Story Curation & Discovery) by:
1. ✅ Story generation (already complete via [`/api/stories/generate`](src/app/api/stories/generate/route.ts:1))
2. ✅ StoryViewer component (100% complete at [`src/components/story/StoryViewer.tsx`](src/components/story/StoryViewer.tsx:1))
3. ➡️ **Stories route (this spec)** - Enables viewing generated stories
4. ➡️ PDF export (new requirement identified in IMPLEMENTATION_STATUS.md)

**User Journey:**
```
Browse Page → Generate Story Button → Select Arc Type → Story Generated
                                                              ↓
                                             Redirect to /stories/[id]
                                                              ↓
                                       View Story → Share/Export → Enjoy!