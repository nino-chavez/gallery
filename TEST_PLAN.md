# Test Plan - Nino Chavez Gallery

## Overview

This document outlines the comprehensive testing strategy for the SvelteKit photo gallery application, covering E2E tests, visual regression, accessibility, and performance testing.

**Testing Stack:**
- **E2E Testing:** Playwright
- **Visual Regression:** Playwright screenshots + Percy (optional)
- **Accessibility:** @axe-core/playwright
- **Performance:** Lighthouse CI
- **Unit Testing:** Vitest (for utilities)

---

## 1. Critical User Journeys (E2E Tests)

### **Journey 1: Homepage to Explore Flow**

**Scenario:** User lands on homepage and navigates to explore photos

**Test Steps:**
1. Visit homepage `/`
2. Verify hero section loads
3. Verify navigation cards are visible (Explore, Collections, Albums)
4. Click "Explore" card
5. Verify redirected to `/explore`
6. Verify photo grid loads
7. Verify filter panel is visible

**Assertions:**
- ✅ Page loads without errors
- ✅ All navigation cards are clickable
- ✅ Explore page contains photos
- ✅ Filter panel is functional

---

### **Journey 2: Photo Filtering and Search**

**Scenario:** User filters photos by sport type and quality

**Test Steps:**
1. Navigate to `/explore`
2. Wait for initial photos to load
3. Click "Advanced Filters" to expand
4. Select "volleyball" from sport filter
5. Adjust quality slider to minimum 80
6. Verify photos filtered correctly
7. Clear all filters
8. Verify all photos returned

**Assertions:**
- ✅ Advanced filters toggle works
- ✅ Sport filter reduces photo count
- ✅ Quality filter reduces photo count
- ✅ Filtered photos match criteria (metadata check)
- ✅ Clear filters restores original set

---

### **Journey 3: Photo Detail Modal Interaction**

**Scenario:** User clicks a photo to view details

**Test Steps:**
1. Navigate to `/explore`
2. Click first photo card
3. Verify modal opens
4. Verify photo image loads
5. Verify metadata displayed (sport, quality, emotion)
6. Click "AI Insights" to expand
7. Verify technical details shown
8. Press ESC key
9. Verify modal closes

**Assertions:**
- ✅ Modal opens on photo click
- ✅ Full-size image loads
- ✅ Metadata is accurate
- ✅ AI insights toggle works
- ✅ ESC key closes modal
- ✅ Click outside closes modal

---

### **Journey 4: Lightbox Navigation and Zoom**

**Scenario:** User opens lightbox and navigates between photos

**Test Steps:**
1. Navigate to `/explore`
2. Click first photo to open lightbox
3. Verify lightbox full-screen mode
4. Press right arrow key
5. Verify next photo loads
6. Press left arrow key
7. Verify previous photo loads
8. Click zoom in button (or press +)
9. Verify image zooms to 1.5x
10. Drag image to pan
11. Press ESC to close

**Assertions:**
- ✅ Lightbox opens in full-screen
- ✅ Arrow key navigation works
- ✅ Photo counter updates (1/X, 2/X)
- ✅ Zoom in/out works (1x → 3x range)
- ✅ Drag-to-pan works when zoomed
- ✅ ESC closes lightbox

---

### **Journey 5: Favorites Management**

**Scenario:** User adds photos to favorites and exports

**Test Steps:**
1. Navigate to `/explore`
2. Click heart icon on first photo
3. Verify heart fills (favorited)
4. Navigate to `/favorites`
5. Verify photo appears in favorites
6. Click "Export Favorites" button
7. Verify JSON file downloads
8. Click "Clear All Favorites"
9. Confirm clear action
10. Verify favorites page shows empty state

**Assertions:**
- ✅ Heart icon toggles on/off
- ✅ Favorites badge shows count in header
- ✅ Favorites persist after page reload
- ✅ Export creates valid JSON file
- ✅ Import restores favorites
- ✅ Clear all removes all favorites
- ✅ localStorage updates correctly

---

### **Journey 6: Album Browsing**

**Scenario:** User browses albums and views photos within album

**Test Steps:**
1. Navigate to `/albums`
2. Verify album grid loads
3. Verify album cards show cover images
4. Click on first album card
5. Verify redirected to `/albums/[albumKey]`
6. Verify breadcrumb navigation shows
7. Verify album photos load
8. Click breadcrumb "Albums" link
9. Verify returns to albums list

**Assertions:**
- ✅ Albums list page loads
- ✅ Album cards display correctly
- ✅ Album detail page loads photos
- ✅ Breadcrumb navigation works
- ✅ Back navigation preserves state

---

### **Journey 7: Timeline Filtering**

**Scenario:** User filters timeline by year and sport

**Test Steps:**
1. Navigate to `/timeline`
2. Verify timeline groups load (by month/year)
3. Select year from dropdown (e.g., "2024")
4. Verify only 2024 photos shown
5. Select "volleyball" from sport filter
6. Verify only volleyball photos from 2024 shown
7. Clear filters
8. Verify all timeline groups returned

**Assertions:**
- ✅ Timeline groups display chronologically
- ✅ Month/year headers are accurate
- ✅ Year filter works
- ✅ Sport filter works
- ✅ Combined filters work (AND logic)
- ✅ Photo counts are accurate

---

### **Journey 8: Social Sharing**

**Scenario:** User shares a photo on social media

**Test Steps:**
1. Navigate to `/explore`
2. Click first photo to open modal
3. Click "Twitter" share button
4. Verify new window opens with Twitter intent URL
5. Verify URL contains photo URL and share text
6. Click "Copy Link" button
7. Verify success message shows
8. Verify clipboard contains photo URL

**Assertions:**
- ✅ Share buttons render correctly
- ✅ Twitter/Facebook/LinkedIn URLs correct
- ✅ Email mailto link formatted correctly
- ✅ Copy to clipboard works
- ✅ Success feedback appears

---

### **Journey 9: Download Functionality**

**Scenario:** User downloads a photo in different quality levels

**Test Steps:**
1. Navigate to `/explore`
2. Click first photo to open modal
3. Click "Download" button
4. Verify download menu opens
5. Click "Original Quality"
6. Verify file download starts
7. Verify filename is correct
8. Repeat for "Web Quality" and "Thumbnail"

**Assertions:**
- ✅ Download menu displays 3 options
- ✅ File size indicators shown
- ✅ Usage notice displayed
- ✅ Download triggers file save
- ✅ Filenames follow naming convention
- ✅ Loading state shown during download

---

### **Journey 10: Collections Page**

**Scenario:** User browses portfolio and emotion collections

**Test Steps:**
1. Navigate to `/collections`
2. Verify "Portfolio Showcase" section loads
3. Verify top 50 photos by emotional impact shown
4. Scroll to "Emotion Collections"
5. Verify emotion groups render
6. Click on "Intense" collection
7. Verify filtered photos shown
8. Click photo to open detail modal

**Assertions:**
- ✅ Portfolio showcase loads top photos
- ✅ Stats show correct counts
- ✅ Emotion collections grouped correctly
- ✅ Collection cards have proper theming
- ✅ Photos within collections are accurate

---

## 2. Visual Regression Tests

### **Components to Test:**

1. **PhotoCard** - Verify hover states, badge display, image loading
2. **Header** - Verify navigation, active states, badge counts
3. **Footer** - Verify layout and links
4. **FilterPanel** - Verify collapsed/expanded states
5. **PhotoDetailModal** - Verify layout, AI insights toggle
6. **Lightbox** - Verify full-screen, controls, zoom indicator
7. **AlbumCard** - Verify cover image, photo count
8. **CollectionCard** - Verify emotion theming, photo previews
9. **FavoriteButton** - Verify filled/unfilled states
10. **DownloadButton** - Verify menu layout, size indicators

### **Viewport Testing:**

- Mobile: 375px × 667px (iPhone SE)
- Tablet: 768px × 1024px (iPad)
- Desktop: 1920px × 1080px (Full HD)

---

## 3. Accessibility Testing

### **WCAG 2.1 Level AA Compliance**

**Automated Tests (axe-core):**
- ✅ Color contrast ratios (minimum 4.5:1 for text)
- ✅ ARIA labels and roles
- ✅ Semantic HTML structure
- ✅ Focus indicators
- ✅ Alt text for images
- ✅ Form labels and error messages

**Manual Tests:**
- ✅ Keyboard navigation (Tab, Enter, ESC, Arrow keys)
- ✅ Screen reader testing (VoiceOver, NVDA)
- ✅ Focus management (modals, dropdowns)
- ✅ Skip to main content link
- ✅ Meaningful link text (no "click here")

**Pages to Audit:**
1. Homepage
2. Explore page (with filters)
3. Collections page
4. Albums list and detail
5. Favorites page
6. Timeline page

---

## 4. Performance Testing

### **Lighthouse CI Metrics**

**Target Scores:**
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 95

**Key Metrics:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Cumulative Layout Shift (CLS): < 0.1
- Total Blocking Time (TBT): < 300ms

**Performance Optimizations:**
- ✅ Image lazy loading
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ Compression (gzip/brotli)
- ✅ CDN delivery
- ✅ Caching strategies

---

## 5. Unit Tests (Vitest)

### **Utility Functions:**

1. **`cn()` (tailwind-merge)** - Test className merging
2. **Favorites Store** - Test add/remove/export/import logic
3. **Preferences Store** - Test localStorage persistence
4. **Photo Transformation** - Test raw data → Photo type mapping
5. **Date Formatting** - Test timeline grouping logic
6. **Filter Logic** - Test sport/category/quality filtering

---

## 6. Test Execution

### **Local Development:**

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e tests/homepage.spec.ts

# Run in UI mode for debugging
npm run test:e2e:ui

# Run visual regression tests
npm run test:visual

# Run accessibility tests
npm run test:a11y

# Run unit tests
npm run test:unit
```

### **CI/CD Pipeline (GitHub Actions):**

1. **On Pull Request:**
   - Run all E2E tests
   - Run accessibility tests
   - Run Lighthouse CI
   - Comment results on PR

2. **On Main Branch Push:**
   - Run full test suite
   - Generate coverage reports
   - Update visual regression baseline
   - Deploy to Vercel preview

---

## 7. Test Data Strategy

### **Test Database:**

Option 1: Use production Supabase with read-only access
- ✅ Real data for accurate testing
- ❌ Can't test mutations (favorites, etc.)

Option 2: Create test Supabase project
- ✅ Full CRUD testing
- ✅ Isolated from production
- ❌ Requires data seeding

**Recommendation:** Use production for read tests, local fixtures for favorites/preferences

---

## 8. Success Criteria

### **Test Coverage Goals:**

- E2E Coverage: ≥ 80% of critical user journeys
- Accessibility: 100% automated checks passing
- Performance: Lighthouse scores ≥ 90 across all pages
- Visual Regression: 0 unintended UI changes
- Unit Tests: ≥ 90% coverage for utilities

### **Definition of Done:**

- ✅ All E2E tests passing
- ✅ No accessibility violations
- ✅ Lighthouse scores meet targets
- ✅ Visual regression tests baseline established
- ✅ CI/CD pipeline running tests automatically
- ✅ Test documentation complete

---

## 9. Next Steps

1. **Phase 1:** Set up Playwright infrastructure (Day 1)
2. **Phase 2:** Write critical E2E tests (Days 2-3)
3. **Phase 3:** Add visual regression testing (Day 4)
4. **Phase 4:** Implement accessibility testing (Day 5)
5. **Phase 5:** Set up Lighthouse CI (Day 6)
6. **Phase 6:** Write unit tests for utilities (Day 7)

**Estimated Timeline:** 1 week for comprehensive test coverage

---

**Document Owner:** Testing Team
**Last Updated:** 2025-10-19
**Status:** Planning Phase
