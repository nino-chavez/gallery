# Visual & Functional Verification Plan
**Purpose**: Systematically validate implementation status through visual confirmation, user journey testing, and automated checks.

---

## Verification Approach

### 1. **Visual Regression Testing** (Automated)
Playwright screenshot tests that capture key interactions and compare against baselines.

### 2. **User Journey Testing** (Manual + Automated)
Step-through scenarios that validate complete workflows from a user's perspective.

### 3. **Feature Demo Catalog** (Documentation)
Annotated screenshots/videos showing each feature in action with implementation notes.

### 4. **Intent Validation Checklist** (Manual)
Does the feature deliver the *intended experience* described in mission/roadmap, not just technical completeness?

---

## Phase 1: Playwright Visual Testing Setup

### Installation & Configuration

```bash
# Install Playwright with visual testing capabilities
pnpm add -D @playwright/test
pnpm exec playwright install
```

### Test Structure

**File**: `tests/visual-verification/phase-1-foundation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Phase 1: Foundation & Core UX - Visual Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Motion Token System - Emotion Colors', async ({ page }) => {
    // Navigate to a page with emotion indicators
    await page.goto('http://localhost:3000/album/test-album');

    // Wait for photos to load
    await page.waitForSelector('[data-testid="photo-card"]');

    // Screenshot of emotion-colored elements
    await expect(page).toHaveScreenshot('emotion-palette.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });

  test('Magnetic Filter Orbs - Physics Interaction', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Wait for magnetic orbs to render
    await page.waitForSelector('.btn-magnetic');

    // Hover near a magnetic orb to trigger attraction
    const orb = page.locator('.btn-magnetic').first();
    const box = await orb.boundingBox();

    if (box) {
      // Hover 50px to the left (within magnetic radius)
      await page.mouse.move(box.x - 50, box.y + box.height / 2);
      await page.waitForTimeout(500); // Allow spring animation

      await expect(page).toHaveScreenshot('magnetic-orb-attraction.png');
    }
  });

  test('Magnetic Filter Orbs - Active State', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const orb = page.locator('.btn-magnetic', { hasText: 'Portfolio Quality' });
    await orb.click();
    await page.waitForTimeout(300); // Animation complete

    await expect(page).toHaveScreenshot('magnetic-orb-active.png');
  });

  test('Quality Gradient Grid - Brightness Variation', async ({ page }) => {
    await page.goto('http://localhost:3000/portfolio');

    // Wait for GSAP animation to complete
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('quality-gradient-grid.png', {
      fullPage: true,
    });
  });
});
```

**File**: `tests/visual-verification/phase-2-advanced-motion.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Phase 2: Advanced Motion - Visual Verification', () => {
  test('Play Type Morphing Grid - Layout Animation', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Initial state
    await page.waitForSelector('[data-testid="play-type-grid"]');
    await expect(page).toHaveScreenshot('play-type-grid-all.png');

    // Filter by "attack"
    await page.click('button[data-play-type="attack"]');
    await page.waitForTimeout(500); // Layout animation
    await expect(page).toHaveScreenshot('play-type-grid-attack.png');

    // Filter by "block"
    await page.click('button[data-play-type="block"]');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('play-type-grid-block.png');
  });

  test('Emotion Timeline - Scrubber Interaction', async ({ page }) => {
    await page.goto('http://localhost:3000/story/test-story');

    await page.waitForSelector('.emotion-timeline');

    // Initial position
    await expect(page).toHaveScreenshot('emotion-timeline-start.png');

    // Drag scrubber to middle
    const scrubber = page.locator('.timeline-scrubber');
    await scrubber.dragTo(page.locator('.emotion-timeline'), {
      targetPosition: { x: 400, y: 50 }
    });
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('emotion-timeline-middle.png');
  });

  test('Momentum Scroll - Quality Snap Points', async ({ page }) => {
    await page.goto('http://localhost:3000/browse');

    // Scroll rapidly and let it snap
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(1000); // Allow snap to complete

    // Should snap to a portfolio-worthy photo
    const portfolioBadge = page.locator('[data-testid="portfolio-badge"]').first();
    await expect(portfolioBadge).toBeVisible();

    await expect(page).toHaveScreenshot('momentum-scroll-snapped.png');
  });
});
```

**File**: `tests/visual-verification/phase-3-3d-portfolio.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Phase 3: 3D & Portfolio - Visual Verification', () => {
  test('3D Photo Gravity - Initial Clustering', async ({ page }) => {
    await page.goto('http://localhost:3000/portfolio?view=gravity');

    // Wait for Three.js to render
    await page.waitForSelector('canvas');
    await page.waitForTimeout(2000); // Allow clustering animation

    await expect(page).toHaveScreenshot('photo-gravity-initial.png', {
      fullPage: true,
    });
  });

  test('3D Photo Gravity - Similarity Clustering on Hover', async ({ page }) => {
    await page.goto('http://localhost:3000/portfolio?view=gravity');

    await page.waitForSelector('canvas');
    await page.waitForTimeout(2000);

    // Hover over a photo to trigger similarity clustering
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();

    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(1000); // Re-clustering animation

      await expect(page).toHaveScreenshot('photo-gravity-similarity.png');
    }
  });

  test('Quality Gradient - Portfolio Badge Indicators', async ({ page }) => {
    await page.goto('http://localhost:3000/portfolio?view=quality');

    await page.waitForTimeout(2000); // GSAP animation

    // Hover over a portfolio-worthy photo
    const photoCard = page.locator('.quality-photo-card').first();
    await photoCard.hover();
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('quality-gradient-hover.png');
  });
});
```

**File**: `tests/visual-verification/phase-4-story-curation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Phase 4: AI Story Curation - Visual Verification', () => {
  test('Story Viewer - Auto-Play Experience', async ({ page }) => {
    await page.goto('http://localhost:3000/stories/game-winning-rally-123');

    // Initial photo
    await page.waitForSelector('.story-viewer');
    await expect(page).toHaveScreenshot('story-viewer-photo-1.png', {
      fullPage: true,
    });

    // Wait for auto-advance (3 seconds)
    await page.waitForTimeout(3100);
    await expect(page).toHaveScreenshot('story-viewer-photo-2.png', {
      fullPage: true,
    });
  });

  test('Story Viewer - Emotional Curve Visualization', async ({ page }) => {
    await page.goto('http://localhost:3000/stories/game-winning-rally-123');

    await page.waitForSelector('.emotion-timeline');

    // Close-up of emotional curve
    const curve = page.locator('.emotion-timeline');
    await expect(curve).toHaveScreenshot('emotional-curve-graph.png');
  });

  test('Story Viewer - Keyboard Navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/stories/game-winning-rally-123');

    await page.waitForSelector('.story-viewer');

    // Press right arrow
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('story-navigation-next.png');

    // Press space to pause
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    const pauseButton = page.locator('button', { hasText: 'Play' });
    await expect(pauseButton).toBeVisible();
  });

  test('Discovery Badges - Unlock Animation', async ({ page }) => {
    await page.goto('http://localhost:3000/browse');

    // Trigger badge unlock (view 10 portfolio photos)
    const photos = page.locator('[data-portfolio-worthy="true"]').first();
    for (let i = 0; i < 10; i++) {
      await photos.nth(i).click();
      await page.waitForTimeout(100);
      await page.keyboard.press('Escape');
    }

    // Badge notification should appear
    await page.waitForSelector('.badge-notification', { timeout: 5000 });
    await expect(page).toHaveScreenshot('badge-unlock-notification.png');
  });

  test('Similar Photos - Recommendation Display', async ({ page }) => {
    await page.goto('http://localhost:3000/photo/test-photo-123');

    await page.waitForSelector('[data-testid="similar-photos"]');

    await expect(page).toHaveScreenshot('similar-photos-grid.png');
  });
});
```

---

## Phase 2: User Journey Testing

### User Journey 1: Sarah (Sports Photographer)

**Goal**: Curate portfolio-worthy shots from a tournament

```markdown
## Journey: Portfolio Curation

### Setup
- [ ] Navigate to http://localhost:3000
- [ ] Ensure test album with 200+ enriched photos is loaded

### Steps
1. **Landing Page**
   - [ ] Magnetic filter orbs are visible and interactive
   - [ ] Hover near "Portfolio Quality" orb
   - [ ] VERIFY: Orb moves toward cursor (magnetic attraction)
   - [ ] Click "Portfolio Quality" orb
   - [ ] VERIFY: Orb changes to active state (black background)
   - [ ] VERIFY: Photo count updates to show only portfolio-worthy

2. **Browse Portfolio Quality Photos**
   - [ ] Scroll through filtered results
   - [ ] VERIFY: High-quality photos appear brighter
   - [ ] VERIFY: Low-quality photos are dimmer/blurred
   - [ ] Hover over a photo
   - [ ] VERIFY: Quality score appears in cursor tooltip
   - [ ] VERIFY: Portfolio badge (⭐) visible on cards

3. **Switch to Quality Gradient View**
   - [ ] Click "Quality View" button
   - [ ] VERIFY: GSAP animation occurs (1.5s duration)
   - [ ] VERIFY: Photos brightness varies based on quality
   - [ ] VERIFY: Stagger effect (photos animate sequentially)

4. **Explore 3D Gravity View**
   - [ ] Click "3D Gravity" button
   - [ ] VERIFY: Three.js scene loads
   - [ ] VERIFY: Photos cluster by play type (circular arrangement)
   - [ ] Drag to rotate scene
   - [ ] VERIFY: OrbitControls work smoothly
   - [ ] Click a photo
   - [ ] VERIFY: Similar photos re-cluster toward center

5. **Generate Player Highlight Story**
   - [ ] Click "Generate Story" button
   - [ ] Select "Player Highlight Reel"
   - [ ] Enter player name
   - [ ] Click "Create Story"
   - [ ] VERIFY: Story generates in <3 seconds
   - [ ] VERIFY: Story contains 10 portfolio moments
   - [ ] VERIFY: Emotional curve graph displays
   - [ ] Press space to play
   - [ ] VERIFY: Auto-advance every 3 seconds
   - [ ] VERIFY: Keyboard navigation works (arrows, escape)

**Success Criteria**: All steps complete without errors, animations are smooth (60fps perceived)
```

### User Journey 2: Marcus (Athlete)

**Goal**: Find best photos for recruiting and social media

```markdown
## Journey: Find Recruiting Photos

### Setup
- [ ] Navigate to http://localhost:3000/athlete/marcus-123
- [ ] Ensure athlete has 50+ tagged photos

### Steps
1. **Athlete Dashboard Landing**
   - [ ] VERIFY: Auto-curated "Best Shots" section displays
   - [ ] VERIFY: Top 6 photos shown with quality indicators
   - [ ] VERIFY: "Social Media Pack" download button visible

2. **Filter by Peak Moments**
   - [ ] Click "Peak Moments" magnetic orb
   - [ ] VERIFY: Grid morphs with layout animation
   - [ ] VERIFY: Only peak intensity photos remain
   - [ ] VERIFY: Peak badge (⚡) visible on all cards

3. **View Similar Photos**
   - [ ] Click on a peak moment photo
   - [ ] Lightbox opens
   - [ ] VERIFY: "Similar Photos" section below
   - [ ] VERIFY: Similarity scores displayed
   - [ ] VERIFY: Clicking similar photo updates lightbox

4. **Generate Personal Highlight Reel**
   - [ ] Click "Create Highlight Reel" button
   - [ ] VERIFY: Story auto-generates (player-highlight arc)
   - [ ] VERIFY: Story title: "[Player Name]: Top 10 Highlights"
   - [ ] Enter full-screen viewer
   - [ ] VERIFY: Emotional curve shows variety
   - [ ] VERIFY: Quality metadata displayed (avg quality, peak moments)

5. **Download for Social Media**
   - [ ] Exit story viewer
   - [ ] Click "Download Pack" button
   - [ ] VERIFY: Options for 1:1, 9:16, 16:9 crops
   - [ ] Select 9:16 (Instagram Stories)
   - [ ] VERIFY: Download triggers (6 photos)

**Success Criteria**: Athlete finds recruiting photos in <2 minutes, download pack contains social-optimized images
```

### User Journey 3: Coach Jennifer

**Goal**: Create season recap presentation

```markdown
## Journey: Season Recap Creation

### Setup
- [ ] Navigate to http://localhost:3000/coach/team-u16
- [ ] Ensure season has 12+ games with photos

### Steps
1. **Coach Dashboard**
   - [ ] VERIFY: "Season Highlights" section visible
   - [ ] VERIFY: Key moments from each game displayed
   - [ ] VERIFY: Emotion distribution chart visible

2. **Generate Season Journey Story**
   - [ ] Click "Create Season Recap"
   - [ ] Select "Season Journey" arc type
   - [ ] VERIFY: Story generates with 12+ photos (one per game)
   - [ ] VERIFY: Chronological ordering
   - [ ] VERIFY: Emotional curve shows season arc

3. **Review Emotion Timeline**
   - [ ] Open Emotion Timeline view
   - [ ] VERIFY: Timeline scrubber visible
   - [ ] Drag scrubber to mid-season
   - [ ] VERIFY: Photos update to show mid-season emotions
   - [ ] VERIFY: Snap-to-emotion-boundary works

4. **Export Story as PDF** (PLANNED - NOT IMPLEMENTED)
   - [ ] Click "Export PDF" button
   - [ ] VERIFY: PDF generates with custom layout
   - [ ] VERIFY: Photos, captions, emotional curve included

5. **Badge Unlocks**
   - [ ] Navigate through multiple emotions
   - [ ] VERIFY: "Emotion Explorer" badge unlocks after viewing all 6
   - [ ] VERIFY: Confetti animation triggers
   - [ ] VERIFY: Badge notification displays for 5 seconds

**Success Criteria**: Coach creates shareable season recap in <5 minutes
```

---

## Phase 3: Intent Validation Checklist

### Design Principle Validation

For each feature, answer these questions:

#### 1. Progressive Disclosure
- [ ] Does information appear only when relevant?
- [ ] Are users overwhelmed by metadata walls?
- [ ] Do hover states reveal appropriate detail?

#### 2. Physics-Based Motion
- [ ] Do animations follow spring physics?
- [ ] Does momentum feel natural?
- [ ] Are magnetic attractions smooth and predictable?

#### 3. Spatial Intelligence
- [ ] Is Z-axis used effectively (3D depth)?
- [ ] Do elements have spatial relationships?
- [ ] Does clustering convey similarity visually?

#### 4. Contextual Interactions
- [ ] Does UI adapt to what user is viewing?
- [ ] Are interactions context-aware?
- [ ] Do filters update results in real-time?

#### 5. Zero Latency Perception
- [ ] Do UI updates feel instant?
- [ ] Are loading states optimistic?
- [ ] Does the system predict user intent?

### Mission Alignment Validation

#### "95% Time Savings on Curation"
- [ ] Photographer can identify portfolio shots in <12 minutes per 1,000 photos
- [ ] Manual tagging not required
- [ ] AI enrichment runs automatically

#### "Magical Browsing Experience"
- [ ] First-time users say "wow" within 30 seconds
- [ ] Magnetic orbs feel playful and responsive
- [ ] 3D gravity creates curiosity and exploration

#### "Stories Generate in <3 Seconds"
- [ ] All 6 narrative arcs generate within 3-second target
- [ ] Emotional curve is accurate and meaningful
- [ ] Story viewer provides cinematic experience

---

## Phase 4: Feature Demo Catalog

Create an annotated screenshot/video library:

**File**: `docs/feature-demos/README.md`

```markdown
# Feature Demo Catalog

## Phase 1: Foundation

### 1.1 Magnetic Filter Orbs
![Magnetic Attraction](./screenshots/magnetic-orb-attraction.gif)
**Status**: ✅ Implemented
**Location**: `components/interactions/MagneticFilterOrb.tsx`
**What it does**: Filter buttons that move toward cursor within 100px radius using spring physics
**User value**: Playful, memorable filtering that's faster than dropdowns

### 1.2 Quality Gradient Grid
![Quality Gradient](./screenshots/quality-gradient-animation.gif)
**Status**: ✅ Implemented
**Location**: `components/portfolio/QualityGradientGrid.tsx`
**What it does**: Photos dim/blur based on quality scores using GSAP
**User value**: Instantly identifies best shots without reading scores

## Phase 2: Advanced Motion

### 2.1 Play Type Morphing Grid
![Layout Animation](./screenshots/play-type-morph.gif)
**Status**: ✅ Implemented
**Location**: `components/gallery/PlayTypeMorphGrid.tsx`
**What it does**: Smooth shared-element transitions when filtering
**User value**: Makes filtering feel spatial and intentional

### 2.2 Emotion Timeline (Partial)
![Timeline Structure](./screenshots/emotion-timeline-static.png)
**Status**: ⚠️ 50% Implemented
**Location**: `components/interactions/EmotionTimeline.tsx`
**Missing**: GSAP Draggable integration
**User value**: Explore photos along emotional arc of event

## Phase 3: 3D & Portfolio

### 3.1 Photo Gravity
![3D Clustering](./screenshots/photo-gravity-3d.gif)
**Status**: ✅ Implemented
**Location**: `components/portfolio/PhotoGravity.tsx`
**What it does**: Three.js scene with play-type clustering and similarity re-clustering
**User value**: Novel exploration method that reveals photo relationships

## Phase 4: AI Story Curation

### 4.1 Story Viewer
![Story Auto-Play](./screenshots/story-viewer-autoplay.gif)
**Status**: ✅ Implemented (PDF export missing)
**Location**: `components/story/StoryViewer.tsx`
**What it does**: Full-screen cinematic experience with emotional curve navigation
**User value**: Shareable highlight reels in <3 seconds

### 4.2 Discovery Badges
![Badge Unlock](./screenshots/badge-unlock-confetti.gif)
**Status**: ✅ Implemented
**Location**: `components/delight/DiscoveryBadges.tsx`
**What it does**: Gamified exploration with 6 unlockable achievements
**User value**: Encourages deeper engagement with gallery
```

---

## Implementation: Automated Visual Tests

### package.json Scripts

```json
{
  "scripts": {
    "test:visual": "playwright test tests/visual-verification",
    "test:visual:update": "playwright test tests/visual-verification --update-snapshots",
    "test:visual:ui": "playwright test tests/visual-verification --ui",
    "test:journey": "playwright test tests/user-journeys",
    "test:all": "npm run test:visual && npm run test:journey"
  }
}
```

### Playwright Configuration

**File**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Next Steps

1. **Immediate**: Set up Playwright and create baseline screenshots for all implemented features
2. **This Week**: Run user journey tests manually with 3 real users (photographer, athlete, coach personas)
3. **This Month**: Build feature demo catalog with annotated screenshots/videos
4. **Ongoing**: Run visual regression tests on every PR to catch unintended changes

---

## Success Metrics

### Visual Verification
- ✅ All implemented features have baseline screenshots
- ✅ Visual regression tests run on every commit
- ✅ Zero unexpected visual changes in CI

### User Journey Validation
- ✅ All 3 persona journeys complete successfully
- ✅ Task completion time meets targets (<2 min for athlete, <5 min for coach)
- ✅ Zero usability blockers identified

### Intent Alignment
- ✅ All 5 design principles validated for each feature
- ✅ Mission promises verified through user testing
- ✅ "Wow" moments confirmed by first-time users
