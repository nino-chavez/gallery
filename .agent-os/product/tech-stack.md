# Tech Stack

## Framework & Runtime

- **Application Framework:** Next.js 15 (App Router with React Server Components)
- **Language/Runtime:** Node.js 20+ with TypeScript 5.8 (strict mode enabled)
- **Package Manager:** pnpm 9+ (required for fast, disk-efficient dependency management and workspace support)

## Frontend

### Core Framework & Libraries

- **JavaScript Framework:** React 19 (with concurrent features, suspense, transitions, and server components)
- **CSS Framework:** Tailwind CSS 4 (with custom design tokens, utility classes, and JIT compilation)
- **Font System:** Inter Variable (@fontsource-variable/inter) for consistent typography across all weights (400-700)

### Animation & Motion Libraries

- **Primary Animation Library:** Framer Motion 12 (for declarative React animations, layout animations, gesture handling, shared element transitions)
- **Advanced Motion Graphics:** GSAP 3 (for timeline-based animations, scroll-triggered effects, draggable interactions, precise timeline scrubbing)
- **3D Visualization:** Three.js with @react-three/fiber (React renderer) and @react-three/drei (helper components for cameras, controls, effects)
- **Gesture Library:** @use-gesture/react (for drag, pinch, swipe, and hover interactions with physics-based spring animations)

### UI Components & Interaction Primitives

- **Component Library:** Custom components built on Radix UI primitives for accessibility (@radix-ui/react-dialog, @radix-ui/react-dropdown-menu, @radix-ui/react-tooltip, @radix-ui/react-select)
- **Icon Library:** Lucide React (consistent iconography with tree-shakeable SVG imports)
- **Utility Functions:** clsx and tailwind-merge (for conditional class name composition and conflict resolution)
- **Masonry Layout:** react-masonry-css (for responsive photo grid layouts with dynamic column counts)

### Performance & Data Management

- **Virtual Scrolling:** @tanstack/react-virtual (for performant rendering of 10,000+ photos with dynamic row heights)
- **Data Fetching & Caching:** SWR 2 (stale-while-revalidate caching, optimistic updates, background revalidation, error retry logic)
- **Client-Side Search:** Fuse.js 7 (fuzzy search with custom scoring weights for photo metadata)

### Visual Effects & Enhancements

- **Confetti Animations:** canvas-confetti (celebration effects for badge unlocks and milestone achievements)
- **Blurhash Encoding:** blurhash (placeholder image generation for smooth progressive loading)

## Backend

### Database & Storage

- **Primary Database:** Supabase (managed PostgreSQL 15 with real-time subscriptions, row-level security, and edge functions)
- **ORM/Query Builder:** Supabase JS SDK (@supabase/supabase-js for client, @supabase/ssr for server-side rendering with cookie handling)
- **Local Enrichment Cache:** SQLite (better-sqlite3) for staging AI-enriched metadata before syncing to production database
- **Vector Database:** Pinecone (@pinecone-database/pinecone) for semantic photo search with embedding vectors (OpenAI text-embedding-3-small model)
- **Session Cache & Rate Limiting:** Upstash Redis (@upstash/redis) for temporary data storage and API rate limiting

### Database Extensions & Features

- **Vector Search:** pgvector extension in Supabase for semantic similarity queries on photo embeddings
- **Full-Text Search:** PostgreSQL built-in full-text search for keyword queries on photo descriptions and tags
- **Indexes:** B-tree indexes on portfolio_worthy, play_type, emotion, action_intensity; GIN indexes for array columns (use_cases, composition_patterns)

### AI & Machine Learning

- **Primary Vision API:** Google Gemini Vision (@google/generative-ai) using models/gemini-1.5-flash-002 for cost-efficient image analysis (~$0.17 per 1,000 photos)
- **Secondary Vision APIs:** Anthropic Claude (@anthropic-ai/sdk) using claude-3-5-sonnet-20241022 and OpenAI (openai) using gpt-4o-mini for fallback and specialized tasks
- **Embeddings Generation:** LangChain (@langchain/core, @langchain/openai) for generating vector embeddings from photo descriptions and metadata

### External Integrations

- **Photo Storage:** SmugMug API with OAuth 1.0 authentication (oauth-1.0a library) for gallery sync and photo ingestion
- **Image Optimization:** Next.js Image Optimization (built-in with custom loader configuration for SmugMug URLs and local images)

### API Layer & Serverless Functions

- **API Framework:** Next.js API Routes (App Router route handlers with support for GET, POST, PUT, DELETE methods)
- **Serverless Functions:** Vercel Edge Functions (@vercel/node) for global low-latency endpoints deployed to edge network
- **Error Tracking & Monitoring:** Sentry (@sentry/nextjs) for error monitoring, performance tracking, and user session replay

## Testing & Quality Assurance

### Testing Frameworks

- **End-to-End Testing:** Playwright (@playwright/test) for browser automation, visual regression testing, and user journey validation
- **Visual Regression:** Playwright built-in screenshot comparison with pixel diff threshold configuration
- **Performance Testing:** Lighthouse CI for automated performance audits on every deployment

### Code Quality Tools

- **Linting:** ESLint 9 with eslint-config-next for Next.js-specific rules and best practices
- **TypeScript Checking:** TypeScript compiler (tsc) with strict mode, noUncheckedIndexedAccess, and exhaustive type checking
- **Type Definitions:** @types/node, @types/react, @types/react-dom, @types/better-sqlite3, @types/crypto-js, @types/lodash-es, @types/jspdf for third-party library types

## Deployment & Infrastructure

### Hosting & Content Delivery

- **Hosting Platform:** Vercel (recommended) with automatic preview deployments, edge network, and serverless function support
- **CDN:** Vercel Edge Network for global content delivery with automatic edge caching and smart cache invalidation
- **Image CDN:** Vercel Image Optimization for on-demand image transformations (resize, format conversion, quality adjustment)

### CI/CD & Version Control

- **Version Control:** Git with GitHub for source code management
- **CI/CD Pipeline:** GitHub Actions for automated testing, linting, type checking, and deployment workflows
- **Build System:** Next.js build system with custom build wrapper (scripts/build-wrapper.js) for context generation and incremental builds

### Environment Management

- **Environment Variables:** dotenv for local development configuration with .env.local file
- **Secrets Management:** Vercel Environment Variables for production secrets (API keys, database credentials, service role keys)
- **Configuration Validation:** Runtime environment variable validation with TypeScript type guards

## Utilities & Helper Libraries

### Data Manipulation & Formatting

- **Utility Functions:** lodash-es (tree-shakeable utility functions for array/object manipulation, debounce, throttle)
- **Date Handling:** date-fns 4 (for date formatting, parsing, manipulation, and relative time calculations)
- **Encryption & Security:** crypto-js (for secure token handling, HMAC signatures, and data encryption)

### Document Generation & Export

- **PDF Library:** jsPDF with @types/jspdf (for story export to PDF format with custom layouts and image embedding)

### CLI & Development Tools

- **CLI Progress Bars:** cli-progress (for enrichment script progress visualization with percentage and ETA)
- **CLI Styling:** chalk 5 (for colored terminal output and formatted logging)
- **TypeScript Runner:** tsx 4 (for executing TypeScript scripts directly without compilation step)

### Build & Development Tools

- **PostCSS Processing:** autoprefixer, postcss, @tailwindcss/postcss for CSS transformation and vendor prefixing
- **Build Optimization:** Custom scripts for AI context building, incremental cache updates, and bundle analysis

## Third-Party Services

### AI & ML Services

- **Vision Analysis:**
  - Google Gemini Vision API (primary, most cost-effective at $0.003-0.015 per photo)
  - Anthropic Claude Vision (secondary, for higher accuracy needs)
  - OpenAI GPT-4 Vision (tertiary, for specialized tasks)
- **Embeddings Generation:** OpenAI Embeddings API (text-embedding-3-small model) via LangChain for semantic search

### Data & Backend Services

- **Authentication:** Supabase Auth (built into Supabase platform with magic link, OAuth providers, and JWT token management)
- **Database:** Supabase (managed PostgreSQL with real-time subscriptions, row-level security, automatic backups, point-in-time recovery)
- **Vector Search:** Pinecone (managed vector database with 1536-dimension vectors, cosine similarity search, namespace isolation)
- **Caching & Rate Limiting:** Upstash Redis (serverless Redis with per-request pricing and automatic scaling)

### Monitoring & Observability

- **Error Tracking:** Sentry (application monitoring, error tracking, stack trace analysis, user session replay)
- **Performance Monitoring:** Sentry Performance (real user monitoring, Web Vitals tracking, transaction tracing)
- **Analytics:** Custom analytics using Supabase (privacy-conscious, no third-party tracking cookies)

### Photo Management & Storage

- **Photo Hosting:** SmugMug (third-party photo hosting with OAuth API for gallery access, album management, and photo metadata)
- **Image Processing:** Vercel Image Optimization (on-demand resizing, format conversion, quality optimization)

## Development Commands

### Core Development Workflow

```bash
pnpm dev              # Start Next.js development server at localhost:3000 with hot reload
pnpm build            # Production build with AI context generation and optimization
pnpm build:context    # Generate AI context files for enrichment (cached, incremental)
pnpm build:force-context  # Force rebuild of AI context files (clears cache)
pnpm start            # Start production server (requires build first)
pnpm lint             # Run ESLint on entire codebase with auto-fix
pnpm type-check       # Run TypeScript compiler without emitting files (strict mode)
pnpm clean            # Remove build artifacts (.next, .cache, node_modules/.cache)
```

### Testing Commands

```bash
pnpm test                       # Run all Playwright tests (E2E + visual regression)
pnpm test:visual                # Run visual regression tests with screenshot comparison
pnpm test:visual:update         # Update visual regression snapshots (use after intentional UI changes)
pnpm test:journey               # Run user journey E2E tests (Explorer, Seeker, Curator paths)
pnpm test:performance           # Run Lighthouse CI performance audits
```

### Metadata & Enrichment Commands

```bash
pnpm enrich                     # Enrich local photos with AI metadata (uses SQLite cache)
pnpm enrich:smugmug             # Enrich SmugMug gallery photos (OAuth required)
pnpm sync:metadata              # Sync enriched metadata from SQLite staging to Supabase production
pnpm generate:embeddings        # Generate vector embeddings for semantic search (Pinecone)
```

## Architecture Patterns

### Frontend Architecture

- **Rendering Strategy:** Hybrid approach with React Server Components for data fetching and initial render, Client Components for interactivity and animations
- **State Management:** React hooks (useState, useReducer, useContext) with SWR for server state management and caching
- **Styling Approach:** Utility-first with Tailwind CSS, CSS modules for complex animations, CSS custom properties for dynamic theming
- **Component Pattern:** Composition over inheritance, prop drilling minimized via React Context, custom hooks for cross-component logic

### Backend Architecture

- **API Design:** RESTful endpoints with Next.js route handlers (app/api/**/route.ts), JSON responses with TypeScript type validation
- **Data Flow:** React Server Components → API Routes → Supabase/Pinecone → Response → Client Components
- **Enrichment Pipeline:** SmugMug API → SQLite staging → AI Vision APIs (Gemini/Claude/OpenAI) → Supabase production database
- **Authentication:** Supabase Auth with JWT tokens, row-level security policies for data access control

### Performance Optimizations

- **Code Splitting:** Automatic with Next.js dynamic imports (next/dynamic) and React.lazy for route-level and component-level splitting
- **Image Optimization:** Next.js Image component with automatic format selection (WebP/AVIF), responsive srcset generation, lazy loading with blurhash placeholders
- **Caching Strategy:** Multi-layer caching with SWR for client-side (stale-while-revalidate), Redis for server-side rate limiting, CDN edge caching for static assets
- **Virtual Rendering:** @tanstack/react-virtual for large photo collections (10,000+ photos) with windowed rendering and overscan buffers
- **Animation Performance:** GPU acceleration with CSS transforms (translateZ, will-change), 60fps target with frame rate monitoring, GSAP ticker for coordinated animations

### Data Architecture

- **Photo Metadata Schema:** 12 semantic dimensions stored in photo_metadata table:
  - Quality scores: sharpness, exposure_accuracy, composition_score, emotional_impact (0-10 scale)
  - Emotion detection: triumph, focus, intensity, determination, excitement, serenity (enum)
  - Composition patterns: rule_of_thirds, leading_lines, framing, symmetry (array)
  - Play type classification: attack, block, dig, set, serve, pass, celebration (enum)
  - Action intensity: low, medium, high, peak (enum)
  - Use case recommendations: social_media, print, portfolio, web (array)

- **Story Curation Schema:** Narrative arcs stored in stories table:
  - arc_type: game_winning_rally, player_highlight, season_journey, comeback_story, technical_excellence, emotion_spectrum
  - photos: array of photo IDs in narrative sequence
  - emotional_curve: array of emotion intensity values (0-10) for visualization
  - metadata: title, description, generation timestamp, cache duration

- **User Preferences Schema:** Viewing history and preferences (future feature):
  - view_history: photo IDs, dwell times, interaction types
  - favorite_emotions: preference weights for emotion types
  - favorite_play_types: preference weights for play types
  - quality_threshold: minimum quality score for recommendations

## Security Considerations

### API Security

- **Environment Variables:** Never commit secrets to version control (enforced via .gitignore and pre-commit hooks)
- **API Authentication:** Supabase Row Level Security (RLS) policies for data access control based on user authentication state
- **CORS Configuration:** Restricted to allowed origins in production (Vercel domain, custom domain)
- **Content Security Policy:** Next.js security headers configured for XSS protection, frame-ancestors restriction, content-type sniffing prevention

### Data Privacy

- **User Tracking:** Privacy-conscious analytics using Supabase (no third-party tracking cookies, no personal data collection)
- **Session Storage:** Viewing history stored in localStorage (client-side only, never transmitted to server)
- **Image Privacy:** SmugMug privacy settings respected, no direct image hosting (proxied through SmugMug API)

### Rate Limiting

- **API Rate Limits:** Upstash Redis for rate limiting (100 requests per minute per IP for search, 10 requests per minute for enrichment)
- **AI API Costs:** Cost tracking and budget alerts for Gemini/Claude/OpenAI API usage (daily budget limit enforced)

## Cost Optimization Strategies

### AI Vision API Costs

- **Primary Provider:** Gemini Flash (models/gemini-1.5-flash-002) at ~$0.17 per 1,000 photos (85-88% cheaper than Pro models)
- **Image Size Optimization:** Use Medium size (87KB) instead of Display size (600KB+) for 85% cost savings while maintaining quality
- **Caching:** SQLite staging cache prevents re-analyzing photos, Redis caches story generation results (1-hour TTL)
- **Batch Processing:** Process photos in batches of 100 with rate limiting to avoid quota exhaustion

### Database & Hosting Costs

- **Supabase Free Tier:** 500MB database, 2GB file storage, 2GB bandwidth (sufficient for metadata, photos hosted on SmugMug)
- **Vercel Free Tier:** 100GB bandwidth, 1,000 serverless function executions (sufficient for portfolio site)
- **Pinecone Free Tier:** 1 index, 100,000 vectors, 10 queries per second (sufficient for semantic search)
- **Upstash Free Tier:** 10,000 requests per day (sufficient for rate limiting and session cache)

### Image Optimization

- **Next.js Image Optimization:** Automatic format selection (WebP/AVIF), quality adjustment, responsive sizing reduces bandwidth by 60-80%
- **Blurhash Placeholders:** Tiny placeholder images (<1KB) reduce perceived load time without data URL bloat
- **Lazy Loading:** Intersection Observer defers off-screen image loading, reducing initial page weight by 70%

## Browser & Device Support

### Target Browsers

- **Desktop:** Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
- **Mobile:** iOS Safari 15+, Chrome Mobile 100+, Samsung Internet 20+

### Progressive Enhancement

- **WebGL Support:** 3D Emotion Galaxy requires WebGL 2.0, graceful fallback to 2D grid view for older browsers
- **CSS Features:** CSS custom properties, CSS Grid, Flexbox, backdrop-filter (with fallbacks for older browsers)
- **JavaScript Features:** ES2022 features (optional chaining, nullish coalescing, top-level await) with Babel transpilation for legacy browsers

### Accessibility

- **WCAG 2.1 AA Compliance:** Minimum 4.5:1 contrast ratio for text, keyboard navigation for all interactive elements, ARIA labels for screen readers
- **Reduced Motion:** Respects prefers-reduced-motion media query (disables animations, reduces motion to essential feedback only)
- **Screen Reader Support:** Semantic HTML, ARIA landmarks, descriptive alt text for all images, focus management for modals and overlays

## Performance Targets

### Core Web Vitals

- **Largest Contentful Paint (LCP):** <2.5 seconds (target: <2s)
- **First Input Delay (FID):** <100ms (target: <50ms)
- **Cumulative Layout Shift (CLS):** <0.1 (target: <0.05)

### Custom Performance Metrics

- **Animation Frame Rate:** 60fps maintained at all times (validated with Chrome DevTools FPS meter)
- **Page Load Time:** <2 seconds for initial render (measured with Lighthouse)
- **Story Generation:** <3 seconds for any narrative type (measured server-side)
- **Search Response:** <500ms for natural language queries (measured server-side)
- **Virtual Scrolling:** 10,000+ photos without frame drops (validated with continuous scroll test)
- **3D Galaxy Performance:** 60fps with 500 photos on 50th percentile devices (fallback triggers <10% of time)

### Bundle Size Targets

- **Main Bundle:** <200KB gzipped (JavaScript)
- **CSS Bundle:** <50KB gzipped
- **First Load JS:** <250KB gzipped
- **Code Splitting:** Route-level splitting ensures each page loads only required code

### Monitoring & Alerts

- **Lighthouse CI:** Automated audits on every deployment, fails build if scores drop below 90
- **Sentry Performance:** Real user monitoring tracks P95 load times, alerts if >3 seconds
- **Bundle Size:** @next/bundle-analyzer tracks bundle growth, alerts if main bundle exceeds 200KB
