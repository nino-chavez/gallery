# Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
- GitHub account with repository access
- Vercel account (free tier works)
- Supabase project with database

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the `nino-chavez/gallery` repository

### Step 2: Configure Environment Variables

**Required Environment Variables:**

In Vercel Project Settings → Environment Variables, add:

```bash
VITE_SUPABASE_URL=https://skywzpcekhntecegyjoj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNreXd6cGNla2hudGVjZWd5am9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjUwNzUsImV4cCI6MjA3NjA0MTA3NX0.XAmv9k6nsqYv8dqFBSkhWd2OX7ZTHprpRLQKFrc-S7Y
```

**Optional Environment Variables:**

```bash
# For server-side operations (if needed in future)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Base path configuration (if deploying behind a proxy)
# Leave UNSET for standalone Vercel deployment at root
# Set to '/gallery' if deploying to ninochavez.co/gallery via rewrites
VITE_BASE_PATH=/gallery
```

**Important:** For standalone Vercel deployments (e.g., `your-app.vercel.app`), do NOT set `VITE_BASE_PATH`. Only set it if you're deploying behind a reverse proxy or URL rewrite that serves the app from a subdirectory.

### Step 3: Configure Build Settings

Vercel should auto-detect these settings (via `vercel.json`):

- **Framework**: SvelteKit
- **Build Command**: `npm run build`
- **Output Directory**: `.svelte-kit/output`
- **Install Command**: `npm install`

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL

---

## 🔧 Environment Variables Setup

### Method 1: Vercel Dashboard (Recommended)

1. Go to your project in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - Name: `VITE_SUPABASE_URL`
   - Value: Your Supabase project URL
   - Environments: Production, Preview, Development (select all)
4. Click "Save"
5. Repeat for `VITE_SUPABASE_ANON_KEY`

### Method 2: Vercel CLI

```bash
vercel env add VITE_SUPABASE_URL
# Enter value when prompted: https://skywzpcekhntecegyjoj.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Enter value when prompted: your-anon-key
```

### Method 3: Environment Variables File

If you have a `.env` file locally, you can use Vercel CLI:

```bash
vercel env pull .env.production
```

---

## 🔍 Troubleshooting

### Build Error: "Missing VITE_SUPABASE_URL"

**Problem**: Environment variables not set in Vercel

**Solution**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy: Deployments → Latest Deployment → "⋯" → Redeploy

### Build Error: "No Next.js version detected"

**Problem**: Vercel trying to detect as Next.js project

**Solution**: Ensure `vercel.json` exists with `"framework": "sveltekit"`

### Database Connection Issues

**Problem**: Can't connect to Supabase

**Solution**:
1. Verify Supabase URL is correct: `https://YOUR-PROJECT.supabase.co`
2. Check anon key is valid (copy from Supabase Dashboard → Settings → API)
3. Ensure database is not paused (Supabase free tier auto-pauses after inactivity)

---

## 📊 Post-Deployment Checklist

After successful deployment:

- [ ] Visit deployment URL and verify homepage loads
- [ ] Test navigation between pages (Explore, Timeline, Albums, Favorites)
- [ ] Test photo grid displays correctly
- [ ] Test lightbox viewer opens and closes
- [ ] Test favorites add/remove functionality
- [ ] Test download functionality
- [ ] Test social sharing links
- [ ] Verify SEO meta tags (View Source → check `<head>`)
- [ ] Test on mobile device
- [ ] Run Lighthouse audit (aim for 90+ scores)

---

## 🔄 Redeployment

Vercel automatically redeploys when you push to the `main` branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Or manually trigger a redeploy:
1. Vercel Dashboard → Deployments
2. Click "⋯" on latest deployment
3. Select "Redeploy"

---

## 🌐 Custom Domain Setup

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `photography.ninochavez.co`
3. Follow DNS configuration instructions
4. Wait for DNS propagation (~24 hours)

---

## 📈 Production Monitoring

### Vercel Analytics (Recommended)

1. Vercel Dashboard → Analytics
2. Enable Web Analytics
3. View traffic, performance, and user behavior

### Custom Analytics

Add Google Analytics 4:

```html
<!-- Add to src/app.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use Supabase Row Level Security (RLS)** - Enabled on all tables
3. **Rotate keys periodically** - Update in Vercel env vars
4. **Monitor access logs** - Check Supabase Dashboard → Logs

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **SvelteKit Docs**: https://svelte.dev/docs/kit
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: https://github.com/nino-chavez/gallery/issues

<!-- Rebuild triggered after removing VITE_BASE_PATH env var -->
