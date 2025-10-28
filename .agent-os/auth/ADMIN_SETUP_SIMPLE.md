# Simple Admin Setup (Single User)

**Date:** 2025-10-28
**Approach:** One authenticated user = admin (no role checking)

---

## Step 1: Disable Public Signup (Supabase)

### In Supabase Dashboard:

1. Go to **Authentication > Providers**
2. Click on **Email** provider
3. **Disable "Enable Email Signup"** (turn it off)
4. Save changes

This ensures only manually created users can exist.

---

## Step 2: Create Your Admin User

### In Supabase Dashboard:

1. Go to **Authentication > Users**
2. Click **"Add User"**
3. Enter your email: `your-email@example.com`
4. Enter a secure password
5. Check **"Auto Confirm User"** (skip email verification)
6. Click **"Create User"**

Done. This is your admin account.

---

## Step 3: Login and Access Admin Dashboard

### Login Page:
Navigate to: `http://localhost:5173/login`

The login page will:
- Accept your email and password
- Authenticate with Supabase
- Store session in browser cookies
- Redirect you to `/admin/tags`

### Access Admin Dashboard:
If you try to access `http://localhost:5173/admin/tags` without being logged in, you'll be automatically redirected to `/login`.

Once logged in, you'll see pending tags for moderation.

---

## How It Works

**Security Model:**
- ✅ Signup disabled → No one else can create accounts
- ✅ Only your manually created user exists
- ✅ Any authenticated user can access `/admin` routes
- ✅ Since you're the only user, you're the only admin

**Authentication Check:**
```typescript
// In admin routes
if (!session?.user) {
  throw error(401, 'Authentication required');
}
// No role check needed - if authenticated, you're the admin
```

---

## Testing

1. **Try accessing `/admin/tags` without login:**
   - Should redirect to login or show 401 error

2. **Login with your credentials:**
   - Should grant access to admin dashboard

3. **Try creating another user:**
   - Should be blocked (signup disabled)

---

## Production Deployment

### Vercel Environment Variables:
Make sure these are set in Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Security Checklist:
- ✅ Signup disabled in Supabase
- ✅ Strong password for admin user
- ✅ HTTPS enabled (Vercel does this automatically)
- ✅ Service role key kept secret (never in client code)

---

## Adding Authentication UI (Optional)

If you want a login page instead of browser console:

```svelte
<!-- src/routes/login/+page.svelte -->
<script>
  import { supabase } from '$lib/supabase/client';

  let email = '';
  let password = '';

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!error) {
      window.location.href = '/admin/tags';
    }
  }
</script>

<form on:submit|preventDefault={login}>
  <input type="email" bind:value={email} placeholder="Email" />
  <input type="password" bind:value={password} placeholder="Password" />
  <button type="submit">Login</button>
</form>
```

---

**Status:** Ready to use - just create your user and login
