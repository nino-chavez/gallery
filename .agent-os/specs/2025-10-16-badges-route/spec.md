
# Specification: Profile Badges Route with Discovery Progress

## Goal
Implement the `/profile/badges` route that displays the gamification/discovery layer by showcasing all achievement badges earned through photo exploration. This route integrates the fully-implemented [`BadgeCollection`](../../src/components/delight/DiscoveryBadges.tsx:180) component with localStorage persistence and progress tracking, completing the engagement and delight features from Phase 4.

## User Stories
- As a user, I want to navigate to `/profile/badges` and see all available badges so that I understand what achievements I can unlock
- As a user, I want to see which badges I've already unlocked so that I feel a sense of accomplishment
- As a user, I want to see progress toward unlocking pending badges so that I'm motivated to continue exploring
- As a user, I want to see statistics about my exploration (% of photos viewed, badges earned) so that I can track my engagement
- As a user, I want a "Keep Exploring" button to return to the browse page so that I can continue discovering photos
- As a user, I want badges to display with celebratory styling when unlocked so that achievements feel rewarding
- As a user, I want my badge progress to persist across sessions so that my achievements are saved

## Core Requirements

### Functional Requirements
- Route accessible at `/profile/badges` returning 200 status
- Display all 6 available badges in responsive grid layout (2x3 on desktop, 2x3 on mobile)
- Load badge unlock state from localStorage on mount
- Show locked badges with grayscale styling and reduced opacity
- Show unlocked badges with gradient styling and full color
- Display badge titles and descriptions for all badges
- Show aggregate statistics: badges unlocked (X/6), exploration percentage
- Provide "Keep Exploring" button that navigates to `/browse`
- Display progress indicators for badges with quantifiable progress (e.g., "7/10 portfolio photos")
- Handle localStorage read errors gracefully with default empty state
- Support keyboard navigation for interactive elements

### Non-Functional Requirements
- Initial page load under 1.5 seconds on 3G connection
- Smooth animations for badge hover states
- Handle missing localStorage data gracefully
- WCAG 2.1 AA compliance for accessibility
- Responsive layout supporting mobile (375px), tablet (768px), desktop (1280px+)
- No API calls required - purely client-side localStorage integration
- Loading state optional since data loads from localStorage instantly

## Visual Design

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│ Header: "Your Badge Collection"                │
│                                                 │
│ Stats Bar:                                      │
│ 🏆 3/6 Badges Unlocked  •  48% Explored        │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│   Badge Grid (2 columns mobile, 3 desktop)     │
│   ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│   │ 🎭        │ │ 🏐        │ │ ⭐        │   │
│   │ Emotion   │ │ Volleyball│ │ Quality   │   │
│   │ Explorer  │ │Connoisseur│ │ Hunter    │   │
│   │ UNLOCKED  │ │ LOCKED    │ │ UNLOCKED  │   │
│   │ ✓ Complete│ │ 3/8 types │ │ 7/10 found│   │
│   └───────────┘ └───────────┘ └───────────┘   │
│                                                 │
│   ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│   │ ⚡        │ │ 🌅        │ │ 🖼️       │   │
│   │ Peak      │ │ Golden Hr │ │ Print     │   │
│   │ Seeker    │ │Enthusiast │ │ Collector │   │
│   │ LOCKED    │ │ UNLOCKED  │ │ LOCKED    │   │
│   │ 2/5 found │ │ ✓ Complete│ │ 5/10 found│   │
│   └───────────┘ └───────────┘ └───────────┘   │
│                                                 │
│            [🚀 Keep Exploring]                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Badge Card Specifications
- **Unlocked state**: Gradient background (yellow-400 to yellow-600), white text, full opacity icon
- **Locked state**: Gray-100 background, gray-400 text, grayscale + 50% opacity icon
- **Size**: Consistent square aspect ratio, padding: 16px
- **Border radius**: 12px rounded corners
- **Icon size**: 48px (3rem) emoji with margin-bottom: 8px
- **Title**: sm font, font-medium, margin-bottom: 4px
- **Description**: xs font, 80% opacity
- **Progress indicator**: Below description, xs font, semibold
- **Hover effect**: Scale 1.05 on unlocked badges (no hover on locked)
- **Transition**: Spring animation (stiffness: 300, damping: 20)

### Stats Bar Specifications
- Position: Below header, centered, max-width: 600px
- Layout: Flex row with gap, centered alignment
- Style: Gray-700 text, medium font-size
- Icons: 24px emoji with right margin
- Separator: Bullet point (•) between stats

### Keep Exploring Button Specifications
- Position: Centered below badge grid, margin-top: 48px
- Style: Large primary button (bg-black, text-white, rounded-full)
- Padding: px-8 py-4
- Font: text-lg, font-medium
- Icon: Rocket emoji (🚀) before text
- Hover: Scale 1.05 transition
- Focus: Visible outline for accessibility

## Reusable Components

### Existing Code to Leverage

**1. BadgeCollection Component**
- Location: [`src/components/delight/DiscoveryBadges.tsx`](../../src/components/delight/DiscoveryBadges.tsx:180)
- Status: **100% Complete** - No modifications needed
- Props: [`badges`](../../src/components/delight/DiscoveryBadges.tsx:180) (Set<string>)
- Features:
  - Displays all 6 badges in 2-column grid (responsive to 3 columns)
  - Shows locked/unlocked states with appropriate styling
  - Gradient backgrounds for unlocked badges
  - Grayscale + opacity for locked badges
  - Hover animations on unlocked badges
  - Badge icons, titles, and descriptions
- **Action required**: Pass badge unlock state from localStorage

**2. AVAILABLE_BADGES Array**
- Location: [`src/components/delight/DiscoveryBadges.tsx`](../../src/components/delight/DiscoveryBadges.tsx:16)
- Status: **100% Complete** - Badge definitions ready
- Structure: Array of 6 badges with id, icon, title, description
- Badges:
  1. **emotion-explorer**: Discovered all emotion types (🎭)
  2. **volleyball-connoisseur**: Viewed all play types (🏐)
  3. **quality-hunter**: Found 10 portfolio-worthy photos (⭐)
  4. **peak-seeker**: Discovered 5 peak moment photos (⚡)
  5. **golden-hour-enthusiast**: Viewed 5 golden hour photos (🌅)
  6. **print-collector**: Found 10 print-ready photos (🖼️)
- **Action required**: Use for displaying badge metadata and computing progress

**3. DiscoveryTracker Component**
- Location: [`src/components/delight/DiscoveryBadges.tsx`](../../src/components/delight/DiscoveryBadges.tsx:59)
- Status: **100% Complete** - Handles badge unlocking logic
- Features: Tracks photo views, updates discoveries, triggers badge unlocks with confetti
- **Action required**: Not needed on badges page (used on browse/photo pages)

**4. Motion Tokens**
- Location: [`src/lib/motion-tokens.ts`](../../src/lib/motion-tokens.ts)
- Features: [`EMOTION_ICONS`](../../src/lib/motion-tokens.ts), [`PLAY_TYPE_ICONS`](../../src/lib/motion-tokens.ts) for computing progress
- **Action required**: Import to calculate badge completion percentages

### New Components Required

**1. Badges Page Container**
- File: `src/app/profile/badges/page.tsx`
- Why new: No existing badges route, needs to orchestrate badge display
- Responsibilities:
  - Load badge unlock state from localStorage (`discovery-badges` key)
  - Load discovery progress from localStorage (`discovery-progress` key)
  - Pass unlocked badges to BadgeCollection component
  - Display stats bar with unlock count and exploration percentage
  - Provide "Keep Exploring" button navigation
  - Handle localStorage read errors with empty state fallback
  - Support keyboard navigation (Tab, Enter)

**2. Stats Bar Component**
- Why new: Display aggregate badge statistics
- Responsibilities:
  - Show badges unlocked count (e.g., "3/6 Badges Unlocked")
  - Calculate and display exploration percentage based on viewed photos
  - Format with icons and bullet separators
  - Responsive layout (stack on mobile)

**3. Badge Progress Calculator**
- Why new: Compute progress toward unlocking each badge
- Responsibilities:
  - Calculate emotion exploration progress (X/5 emotions discovered)
  - Calculate play type exploration progress (X/8 play types viewed)
  - Calculate portfolio photo progress (X/10 found)
  - Calculate peak moment progress (X/5 found)
  - Calculate golden hour progress (X/5 viewed)
  - Calculate print-ready progress (X/10 found)
  - Return progress string for each badge (e.g., "7/10 found")

**4. localStorage Access Utilities**
- Why new: Safe localStorage access with error handling
- Responsibilities:
  - Read from localStorage with try-catch
  - Parse JSON with validation
  - Return default empty state on errors
  - Type-safe badge and discovery data structures

## Technical Approach

### Database
No database access required. All data stored in browser localStorage.

### API
No API endpoints required. Purely client-side page.

### Frontend

**Component Structure:**
```
BadgesPage (src/app/profile/badges/page.tsx)
├── Header
│   └── Title: "Your Badge Collection"
├── StatsBar
│   ├── Badges unlocked count (3/6)
│   └── Exploration percentage (48%)
├── BadgeCollection (imported component)
│   └── 6x Badge cards with locked/unlocked states
└── KeepExploringButton
    └── Navigation to /browse
```

**State Management:**
```typescript
const [unlockedBadges, setUnlockedBadges] = useState<Set<string>>(new Set());
const [discoveries, setDiscoveries] = useState({
  emotions: new Set<string>(),
  playTypes: new Set<string>(),
  portfolioCount: 0,
  peakCount: 0,
  goldenHourCount: 0,
  printReadyCount: 0,
});
```

**Data Flow:**
1. Component mounts
2. Read `discovery-badges` from localStorage → Parse unlocked badge IDs
3. Read `discovery-progress` from localStorage → Parse discovery counters
4. Calculate badge progress for each badge using discovery data
5. Render BadgeCollection with unlocked badges set
6. Display stats bar with aggregate statistics
7. User clicks "Keep Exploring" → Navigate to `/browse`

**localStorage Keys:**
- `discovery-badges`: Set<string> serialized as JSON array - Badge IDs that are unlocked
- `discovery-progress`: Object with emotion/playType sets and counts - Progress toward unlocking

### Testing

**Unit Tests (2-3 tests):**
- localStorage data loads correctly on mount
- Badge progress calculated accurately from discovery data
- Stats bar displays correct unlock count and percentage
- Handles missing localStorage data with empty state

**Integration Tests (3-4 tests):**
- `/profile/badges` returns 200 status
- BadgeCollection renders with correct locked/unlocked states
- "Keep Exploring" button navigates to `/browse`
- Badge cards display progress indicators correctly

**Accessibility Tests (2-3 tests):**
- Keyboard navigation works (Tab to button, Enter to navigate)
- ARIA labels present on interactive elements
- Screen reader announces badge states
- Color contrast meets WCAG AA standards
- Focus indicators visible on button

**Visual Regression Tests (2 tests):**
- Badge grid renders correctly on desktop (3 columns)
- Badge grid renders correctly on mobile (2 columns)
- Locked vs unlocked badge styling displays properly

## Out of Scope

- Badge sharing to social media (future feature)
- Leaderboards or competitive features (Phase 9)
- Custom badge creation (Phase 9)
- Badge rewards or incentives (future monetization)
- Editing or resetting badge progress
- Badge notifications or email alerts
- Badge history or timeline view
- Badge categories or filtering
- Exporting badge achievements
- Collaborative badge challenges

## Success Criteria

**Route Functionality:**
- `/profile/badges` returns 200 status on navigation
- Page loads instantly (localStorage read is synchronous)
- No API calls made

**Badge Display:**
- All 6 badges render in responsive grid
- Unlocked badges show gradient backgrounds
- Locked badges show grayscale with reduced opacity
- Badge titles and descriptions display correctly
- Hover effects work on unlocked badges only

**Progress Tracking:**
- Progress indicators show for quantifiable badges
- Percentages calculated correctly (e.g., "3/5 emotions")
- Stats bar shows accurate aggregate statistics
- Exploration percentage computed from total photos available

**Navigation:**
- "Keep Exploring" button navigates to `/browse`
- Button accessible via keyboard (Tab + Enter)
- Smooth navigation transition

**localStorage Integration:**
- Badge unlock state persists across page refreshes
- Discovery progress loads correctly
- Missing localStorage handled gracefully with empty state
- No errors thrown on read failures

**Accessibility:**
- All interactive elements keyboard accessible
- Screen readers announce badge states
- Focus visible on navigation button
- WCAG 2.1 AA color contrast met
- Semantic HTML structure (headings, sections)

**Responsive Design:**
- 2-column grid on mobile (375px)
- 3-column grid on desktop (1024px+)
- Stats bar stacks on small screens
- Button remains centered at all breakpoints

## Implementation Checklist

### Phase 1: Route Setup & localStorage Integration
- [ ] Create `src/app/profile/badges/page.tsx` file
- [ ] Create profile directory structure if needed
- [ ] Set up basic page structure with header
- [ ] Implement localStorage read utilities with error handling
- [ ] Define TypeScript types for badge and discovery data
- [ ] Load unlocked badges from localStorage on mount
- [ ] Load discovery progress from localStorage on mount
- [ ] Test localStorage access with mock data
- [ ] Handle missing localStorage gracefully
- [ ] Verify route returns 200 status

### Phase 2: Badge Collection Integration
- [ ] Import [`BadgeCollection`](../../src/components/delight/DiscoveryBadges.tsx:180) component
- [ ] Import [`AVAILABLE_BADGES`](../../src/components/delight/DiscoveryBadges.tsx:16) array
- [ ] Pass unlocked badges Set as prop
- [ ] Test badge rendering with 0 unlocked badges
- [ ] Test badge rendering with all 6 unlocked badges
- [ ] Test badge rendering with partial unlock state
- [ ] Verify locked badge styling (grayscale + opacity)
- [ ] Verify unlocked badge styling (gradient)
- [ ] Test hover animations on unlocked badges

### Phase 3: Progress Calculation & Display
- [ ] Import [`EMOTION_ICONS`](../../src/lib/motion-tokens.ts) and [`PLAY_TYPE_ICONS`](../../src/lib/motion-tokens.ts)
- [ ] Implement progress calculator utility function
- [ ] Calculate emotion exploration progress (X/5)
- [ ] Calculate play type exploration progress (X/8)
- [ ] Calculate portfolio photo progress (X/10)
- [ ] Calculate peak moment progress (X/5)
- [ ] Calculate golden hour progress (X/5)
- [ ] Calculate print-ready progress (X/10)
- [ ] Display progress indicators below
- [ ] Calculate golden hour progress (X/5)
- [ ] Calculate print-ready progress (X/10)
- [ ] Display progress indicators below badge descriptions
- [ ] Format progress strings (e.g., "7/10 found", "✓ Complete")
- [ ] Test progress calculation with various discovery states

### Phase 4: Stats Bar Integration
- [ ] Create StatsBar component
- [ ] Calculate badges unlocked count (X/6)
- [ ] Calculate exploration percentage from discovery data
- [ ] Display stats with icon formatting
- [ ] Add bullet separator between stats
- [ ] Make stats bar responsive (stack on mobile)
- [ ] Test with 0 badges unlocked
- [ ] Test with all 6 badges unlocked

### Phase 5: Navigation & Polish
- [ ] Create "Keep Exploring" button
- [ ] Wire button to navigate to `/browse`
- [ ] Add hover animation (scale 1.05)
- [ ] Add focus styles for accessibility
- [ ] Position button below badge grid (centered)
- [ ] Test keyboard navigation (Tab + Enter)
- [ ] Add rocket emoji icon
- [ ] Test on mobile and desktop

### Phase 6: Testing & Validation
- [ ] Write Playwright test for route navigation
- [ ] Write test for localStorage loading
- [ ] Write test for badge display states
- [ ] Write test for progress indicators
- [ ] Write test for "Keep Exploring" navigation
- [ ] Run accessibility audit with axe
- [ ] Test keyboard navigation fully
- [ ] Test on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1280px+ width)
- [ ] Test with empty localStorage
- [ ] Test with partial badge unlocks
- [ ] Test with all badges unlocked
- [ ] Update documentation

## Code Integration Examples

### Badges Page Implementation
```typescript
// src/app/profile/badges/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCollection, AVAILABLE_BADGES } from '@/components/delight/DiscoveryBadges';
import { EMOTION_ICONS, PLAY_TYPE_ICONS } from '@/lib/motion-tokens';

interface DiscoveryProgress {
  emotions: string[];
  playTypes: string[];
  portfolioCount: number;
  peakCount: number;
  goldenHourCount: number;
  printReadyCount: number;
  totalPhotosViewed: number;
}

export default function BadgesPage() {
  const router = useRouter();
  const [unlockedBadges, setUnlockedBadges] = useState<Set<string>>(new Set());
  const [discoveries, setDiscoveries] = useState<DiscoveryProgress>({
    emotions: [],
    playTypes: [],
    portfolioCount: 0,
    peakCount: 0,
    goldenHourCount: 0,
    printReadyCount: 0,
    totalPhotosViewed: 0,
  });

  useEffect(() => {
    // Load badge unlock state from localStorage
    try {
      const badgesData = localStorage.getItem('discovery-badges');
      if (badgesData) {
        const badgeIds = JSON.parse(badgesData) as string[];
        setUnlockedBadges(new Set(badgeIds));
      }
    } catch (err) {
      console.error('Failed to load badges:', err);
    }

    // Load discovery progress from localStorage
    try {
      const progressData = localStorage.getItem('discovery-progress');
      if (progressData) {
        const progress = JSON.parse(progressData) as DiscoveryProgress;
        setDiscoveries(progress);
      }
    } catch (err) {
      console.error('Failed to load progress:', err);
    }
  }, []);

  const unlockedCount = unlockedBadges.size;
  const totalBadges = AVAILABLE_BADGES.length;
  
  // Calculate exploration percentage (example: based on photos viewed vs total available)
  const explorationPercentage = Math.min(
    Math.round((discoveries.totalPhotosViewed / 100) * 100),
    100
  );

  return (
    <div className="badges-page min-h-screen bg-white">
      {/* Header */}
      <header className="mx-auto max-w-5xl px-6 pt-12 pb-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Your Badge Collection
        </h1>

        {/* Stats Bar */}
        <div className="flex items-center justify-center gap-6 text-gray-700 text-base mb-12">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span className="font-medium">
              {unlockedCount}/{totalBadges} Badges Unlocked
            </span>
          </div>
          <span className="text-gray-400">•</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            <span className="font-medium">
              {explorationPercentage}% Explored
            </span>
          </div>
        </div>
      </header>

      {/* Badge Collection */}
      <main className="mx-auto max-w-5xl px-6 pb-16">
        <BadgeCollection badges={unlockedBadges} />

        {/* Badge Progress Details */}
        <div className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Progress Details</h2>
          
          {AVAILABLE_BADGES.map(badge => {
            const isUnlocked = unlockedBadges.has(badge.id);
            const progress = getBadgeProgress(badge.id, discoveries);
            
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border ${
                  isUnlocked
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <div className="font-medium">{badge.title}</div>
                      <div className="text-sm text-gray-600">
                        {badge.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {isUnlocked ? (
                      <span className="text-green-600">✓ Unlocked</span>
                    ) : (
                      <span className="text-gray-600">{progress}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Keep Exploring Button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => router.push('/browse')}
            className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:scale-105 transition-transform flex items-center gap-3"
            aria-label="Return to browse page to continue exploring"
          >
            <span className="text-2xl">🚀</span>
            Keep Exploring
          </button>
        </div>
      </main>
    </div>
  );
}

// Helper function to calculate badge progress
function getBadgeProgress(
  badgeId: string,
  discoveries: DiscoveryProgress
): string {
  switch (badgeId) {
    case 'emotion-explorer':
      const totalEmotions = Object.keys(EMOTION_ICONS).length;
      return `${discoveries.emotions.length}/${totalEmotions} emotions`;
    
    case 'volleyball-connoisseur':
      const totalPlayTypes = Object.keys(PLAY_TYPE_ICONS).length;
      return `${discoveries.playTypes.length}/${totalPlayTypes} play types`;
    
    case 'quality-hunter':
      return `${discoveries.portfolioCount}/10 portfolio photos`;
    
    case 'peak-seeker':
      return `${discoveries.peakCount}/5 peak moments`;
    
    case 'golden-hour-enthusiast':
      return `${discoveries.goldenHourCount}/5 golden hour`;
    
    case 'print-collector':
      return `${discoveries.printReadyCount}/10 print-ready`;
    
    default:
      return 'Not started';
  }
}
```

### localStorage Utility Functions
```typescript
// src/lib/badge-storage.ts
export interface BadgeProgress {
  emotions: Set<string>;
  playTypes: Set<string>;
  portfolioCount: number;
  peakCount: number;
  goldenHourCount: number;
  printReadyCount: number;
  totalPhotosViewed: number;
}

export function loadUnlockedBadges(): Set<string> {
  try {
    const data = localStorage.getItem('discovery-badges');
    if (!data) return new Set();
    const badgeIds = JSON.parse(data) as string[];
    return new Set(badgeIds);
  } catch (err) {
    console.error('Failed to load badges:', err);
    return new Set();
  }
}

export function loadBadgeProgress(): BadgeProgress {
  try {
    const data = localStorage.getItem('discovery-progress');
    if (!data) {
      return {
        emotions: new Set(),
        playTypes: new Set(),
        portfolioCount: 0,
        peakCount: 0,
        goldenHourCount: 0,
        printReadyCount: 0,
        totalPhotosViewed: 0,
      };
    }
    
    const progress = JSON.parse(data);
    return {
      emotions: new Set(progress.emotions || []),
      playTypes: new Set(progress.playTypes || []),
      portfolioCount: progress.portfolioCount || 0,
      peakCount: progress.peakCount || 0,
      goldenHourCount: progress.goldenHourCount || 0,
      printReadyCount: progress.printReadyCount || 0,
      totalPhotosViewed: progress.totalPhotosViewed || 0,
    };
  } catch (err) {
    console.error('Failed to load progress:', err);
    return {
      emotions: new Set(),
      playTypes: new Set(),
      portfolioCount: 0,
      peakCount: 0,
      goldenHourCount: 0,
      printReadyCount: 0,
      totalPhotosViewed: 0,
    };
  }
}

export function saveUnlockedBadges(badges: Set<string>): void {
  try {
    const badgeIds = Array.from(badges);
    localStorage.setItem('discovery-badges', JSON.stringify(badgeIds));
  } catch (err) {
    console.error('Failed to save badges:', err);
  }
}

export function saveBadgeProgress(progress: BadgeProgress): void {
  try {
    const data = {
      emotions: Array.from(progress.emotions),
      playTypes: Array.from(progress.playTypes),
      portfolioCount: progress.portfolioCount,
      peakCount: progress.peakCount,
      goldenHourCount: progress.goldenHourCount,
      printReadyCount: progress.printReadyCount,
      totalPhotosViewed: progress.totalPhotosViewed,
    };
    localStorage.setItem('discovery-progress', JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save progress:', err);
  }
}
```

### Enhanced Badge Collection with Progress
```typescript
// Update to src/components/delight/DiscoveryBadges.tsx (optional enhancement)
// Add progress prop to show progress indicators

interface BadgeCollectionProps {
  badges: Set<string>;
  progress?: {
    'emotion-explorer': string;
    'volleyball-connoisseur': string;
    'quality-hunter': string;
    'peak-seeker': string;
    'golden-hour-enthusiast': string;
    'print-collector': string;
  };
}

export function BadgeCollection({ badges, progress }: BadgeCollectionProps) {
  return (
    <div className="badge-collection">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {AVAILABLE_BADGES.map(badge => {
          const isUnlocked = badges.has(badge.id);
          const progressText = progress?.[badge.id];
          
          return (
            <motion.div
              key={badge.id}
              className={`p-4 rounded-lg text-center ${
                isUnlocked
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
              whileHover={isUnlocked ? { scale: 1.05 } : {}}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div
                className={`text-4xl mb-2 ${
                  isUnlocked ? '' : 'grayscale opacity-50'
                }`}
              >
                {badge.icon}
              </div>
              <div className="text-sm font-medium mb-1">{badge.title}</div>
              <div className="text-xs opacity-80 mb-2">
                {badge.description}
              </div>
              {progressText && !isUnlocked && (
                <div className="text-xs font-semibold mt-2 opacity-90">
                  {progressText}
                </div>
              )}
              {isUnlocked && (
                <div className="text-xs font-semibold mt-2">
                  ✓ Complete
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
```

## Performance Targets

- **Time to First Byte:** < 400ms (static page)
- **First Contentful Paint:** < 0.8s
- **Largest Contentful Paint:** < 1.2s
- **Time to Interactive:** < 1.5s
- **Cumulative Layout Shift:** < 0.05
- **localStorage Read Time:** < 10ms (synchronous)
- **Badge Hover Animation:** Solid 60fps
- **Navigation Response:** < 100ms (client-side routing)
- **Memory Usage:** Minimal (no large data structures)

## Error Handling Scenarios

1. **localStorage not available:** Display badges with empty state, show message encouraging exploration
2. **localStorage read fails:** Log error to console, display badges with 0 unlocked state
3. **Malformed localStorage data:** Parse error caught, reset to empty state gracefully
4. **Missing discovery progress:** Show all badges as locked (0 progress) with default message
5. **Browser with localStorage disabled:** Inform user that progress tracking requires localStorage
6. **Navigation failure:** Fall back to full page reload to `/browse`

## Browser Support

- Chrome 90+ (primary target)
- Firefox 88+ (full support)
- Safari 14+ (iOS Safari 14+)
- Edge 90+ (full support)
- **Note:** Requires localStorage support (available in all modern browsers)

## Dependencies

All required dependencies already installed:
- `next@15.1.6` - App Router framework
- `react@19.1.1` - UI library
- `framer-motion@12.23.22` - Animation library (used by BadgeCollection)
- `tailwindcss@4.1.13` - Styling

No additional dependencies required.

## Related Features

This specification completes Phase 4 (AI Story Curation & Discovery) gamification layer by:
1. ✅ DiscoveryTracker component (100% complete at [`src/components/delight/DiscoveryBadges.tsx`](../../src/components/delight/DiscoveryBadges.tsx:59))
2. ✅ BadgeCollection component (100% complete at [`src/components/delight/DiscoveryBadges.tsx`](../../src/components/delight/DiscoveryBadges.tsx:180))
3. ✅ Badge unlock logic with confetti celebrations
4. ➡️ **Badges route (this spec)** - Dedicated page to view badge collection and progress

**User Journey:**
```
Browse/Photo Pages → View photos → Badges unlock (with confetti)
                                              ↓
                                   Navigate to /profile/badges
                                              ↓
                            View all badges + progress + stats
                                              ↓
                              Click "Keep Exploring" → Back to /browse
```

## Integration with Existing Features

### Badge Unlocking Flow
1. User views photos on `/browse` or `/photo/[id]` pages
2. [`DiscoveryTracker`](../../src/components/delight/DiscoveryBadges.tsx:59) component tracks views
3. Badge unlocks trigger confetti and localStorage save
4. User navigates to `/profile/badges` to see all achievements
5. localStorage data loads and displays badge states
6. User clicks "Keep Exploring" to continue discovering

### localStorage Schema
```typescript
// Stored by DiscoveryTracker component
localStorage.setItem('discovery-badges', JSON.stringify([
  'emotion-explorer',
  'quality-hunter',
  'golden-hour-enthusiast'
]));

localStorage.setItem('discovery-progress', JSON.stringify({
  emotions: ['joy', 'determination', 'celebration', 'intensity', 'focus'],
  playTypes: ['spike', 'block', 'serve', 'dig'],
  portfolioCount: 12,
  peakCount: 6,
  goldenHourCount: 8,
  printReadyCount: 15,
  totalPhotosViewed: 48
}));
```

## Future Enhancements (Out of Scope)

- Badge notifications when user is close to unlocking
- Badge sharing on social media with custom graphics
- Leaderboard showing top badge collectors
- Custom badge creation for premium users
- Badge-based rewards (discounts, exclusive content)
- Achievement streaks (view photos X days in a row)
- Hidden/secret badges for easter eggs
- Badge rarity tiers (common, rare, legendary)
- Export badge collection as image or PDF

## Notes

- This is a **SIMPLE, DISPLAY-ONLY PAGE** - no complex interactions beyond navigation
- Primary focus is on 100% **REUSE of existing BadgeCollection component**
- No backend/API calls required - purely client-side localStorage
- Badge unlock logic already complete in DiscoveryTracker - this route only displays results
- Priority: MEDIUM - Adds engagement but not blocking core workflows
- Estimated complexity: LOW - Mostly integration work with existing components