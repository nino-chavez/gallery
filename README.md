# Nino Chavez Gallery

A high-performance photography portfolio showcasing professional volleyball action sports photography. Built with modern web technologies and optimized for scale (~20,000 photos).

🌐 **Live Site:** [photography.ninochavez.co](https://photography.ninochavez.co)

## Features

- **Dynamic Gallery Views**
  - Grid gallery with advanced filtering (sport type, category, quality)
  - Timeline view organized by date
  - Album/collection browsing
  - Full-featured lightbox with keyboard navigation

- **Search & Discovery**
  - Autocomplete search across photos
  - Filter by sport type, category, emotion, and action intensity
  - Sort by date, quality score, or random
  - Favorites system with localStorage persistence

- **Performance Optimized**
  - Server-side rendering with SvelteKit
  - Optimized database queries with comprehensive indexing
  - Lazy-loaded images with Supabase transforms
  - In-memory caching for expensive queries
  - Target Lighthouse score >90

- **Responsive Design**
  - Mobile-first approach with Tailwind CSS
  - Smooth animations with svelte-motion
  - Accessible components (WCAG 2.1 AA compliant)
  - Dark mode support

## Tech Stack

### Frontend
- **[SvelteKit 2.x](https://kit.svelte.dev/)** - Meta-framework with SSR
- **[Svelte 5](https://svelte.dev/)** - UI framework with runes API
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first styling
- **[svelte-motion](https://github.com/mattjennings/svelte-motion)** - Animation library
- **[Lucide Svelte](https://lucide.dev/)** - Icon library

### Backend & Data
- **[Supabase](https://supabase.com/)** - PostgreSQL database and storage
- **[@tanstack/svelte-query](https://tanstack.com/query/latest)** - Client-side data fetching
- **Vercel** - Deployment platform (nodejs20.x)

### Development
- **TypeScript** - Strict mode, type-safe
- **Vite 7** - Build tool and dev server
- **Playwright** - E2E testing with accessibility audits

## Project Structure

```
gallery/
├── src/
│   ├── lib/
│   │   ├── components/     # UI components
│   │   │   ├── filters/    # Filter controls
│   │   │   ├── gallery/    # Gallery components
│   │   │   ├── layout/     # Header, Footer
│   │   │   └── ui/         # Reusable UI primitives
│   │   ├── stores/         # Svelte stores
│   │   ├── supabase/       # Database clients
│   │   ├── motion-tokens.ts # Animation presets
│   │   └── utils.ts        # Utilities
│   ├── routes/             # SvelteKit routes
│   │   ├── albums/         # Album pages
│   │   ├── collections/    # Collection pages
│   │   ├── explore/        # Main gallery
│   │   ├── favorites/      # Favorites page
│   │   ├── photo/[id]/     # Photo detail
│   │   └── timeline/       # Timeline view
│   └── types/              # TypeScript definitions
├── database/               # SQL scripts and migrations
├── docs/                   # Technical documentation
├── scripts/                # Utility scripts
└── tests/                  # E2E tests
```

## Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **pnpm** (recommended) or npm
- **Supabase account** ([sign up free](https://supabase.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gallery.git
   cd gallery
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

   Get credentials from: [Supabase Dashboard > Settings > API](https://app.supabase.com/project/_/settings/api)

4. **Set up database**

   Run the SQL scripts in your Supabase SQL editor:
   ```bash
   # In Supabase Dashboard > SQL Editor
   # 1. Create the photo_metadata table (check database/ folder)
   # 2. Run database/performance-indexes.sql for optimized queries
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:5173](http://localhost:5173)

## Development

### Available Scripts

```bash
# Development server with hot reload
pnpm dev

# Type checking (recommended before commits)
pnpm check

# Type checking in watch mode
pnpm check:watch

# Production build
pnpm build

# Preview production build locally
pnpm preview

# Run E2E tests
pnpm test

# Run tests with UI
pnpm test:ui

# Debug tests
pnpm test:debug
```

### Key Commands

```bash
# Type check
pnpm check

# Build and preview
pnpm build && pnpm preview

# Run all tests
pnpm test
```

## Database Schema

The project uses a single primary table `photo_metadata` with comprehensive indexing for performance.

**Key Columns:**
- `photo_id` (Primary Key)
- `image_key`, `ImageUrl`, `ThumbnailUrl`, `OriginalUrl`
- `sport_type`, `photo_category`, `emotion`, `action_intensity`
- `quality_score`, `portfolio_worthy`, `sharpness`
- `upload_date`, `photo_date`, `enriched_at`

**Performance Indexes:**
- Sport/category filtering (10x faster)
- Quality score sorting (8x faster)
- Composite indexes for common filter combinations

See `database/performance-indexes.sql` for full schema.

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel

2. **Configure environment variables** in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Deploy**
   ```bash
   git push origin main
   ```

Vercel will automatically build and deploy on push.

### Other Platforms

The project uses `@sveltejs/adapter-vercel` by default. For other platforms:

1. Install appropriate adapter:
   ```bash
   pnpm add -D @sveltejs/adapter-node  # Node server
   pnpm add -D @sveltejs/adapter-static # Static hosting
   ```

2. Update `svelte.config.js`:
   ```javascript
   import adapter from '@sveltejs/adapter-node';
   ```

See [SvelteKit adapters docs](https://kit.svelte.dev/docs/adapters) for details.

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key (browser-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Service role key for server-side ops |
| `VITE_BASE_PATH` | No | Base path for reverse proxy deployment |

### Performance Tuning

The project includes several performance optimizations:

- **Layout caching:** Sport/category distributions cached for 5 minutes
- **Database indexes:** Comprehensive covering indexes for common queries
- **Image optimization:** Supabase transforms for WebP/AVIF
- **Code splitting:** Route-based automatic code splitting

See `src/routes/+layout.server.ts` for caching configuration.

## Coding Standards

This project follows strict coding standards for consistency and quality:

- **TypeScript:** Strict mode, explicit types, no `any`
- **Svelte 5:** Runes API (`$state`, `$derived`, `$effect`, `$props`)
- **Event Handling:** Proper propagation patterns for nested elements
- **Accessibility:** WCAG 2.1 AA compliance, semantic HTML

See full documentation:
- [CODING_STANDARDS.md](./docs/CODING_STANDARDS.md)
- [EVENT_HANDLING.md](./docs/EVENT_HANDLING.md)
- [COMPONENT_PATTERNS.md](./docs/COMPONENT_PATTERNS.md)

## Testing

### E2E Tests with Playwright

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Debug mode
pnpm test:debug

# View test report
pnpm test:report
```

### Accessibility Testing

Tests include automated accessibility audits using @axe-core/playwright.

## Contributing

This is a personal portfolio project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run type checks (`pnpm check`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please ensure:
- Type checks pass (`pnpm check`)
- Code follows project standards (see `docs/CODING_STANDARDS.md`)
- E2E tests pass (`pnpm test`)

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - AI development instructions
- **[AGENTS.md](./AGENTS.md)** - Agent-specific guidance
- **[docs/](./docs/)** - Technical documentation
- **[.agent-os/guides/](./.agent-os/guides/)** - Integration guides

## Performance Targets

- **Lighthouse Score:** >90
- **First Contentful Paint:** <1.5s
- **Largest Contentful Paint:** <2.5s
- **Time to Interactive:** <3.5s

## Architecture Decisions

### Why SvelteKit?

Migrated from Next.js/React for:
- Simpler mental model and less boilerplate
- Better performance (smaller bundle, faster hydration)
- True reactivity with runes API
- Excellent TypeScript integration

### Why Supabase?

- PostgreSQL with comprehensive tooling
- Built-in storage with image transforms
- Real-time subscriptions (future feature)
- Easy RLS policies for multi-tenant (future)

### Why Tailwind CSS?

- Rapid development with utility classes
- Excellent responsive design utilities
- Tree-shaking for minimal CSS output
- Consistent design system

## License

This project is private and proprietary. All rights reserved.

## Contact

**Nino Chavez**
- Website: [photography.ninochavez.co](https://photography.ninochavez.co)
- GitHub: [@ninochavez](https://github.com/ninochavez)

---

**Built with ❤️ using SvelteKit**
