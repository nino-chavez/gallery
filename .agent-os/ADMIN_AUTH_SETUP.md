# Admin Authentication Setup with Supabase

**Date:** 2025-10-28
**Status:** Implementation Complete

---

## Overview

Admin authentication now uses **Supabase Auth** with role-based access control. No API keys needed - just proper user authentication.

---

## Step 1: Enable Supabase Auth (If Not Already Enabled)

### In Supabase Dashboard:

1. Go to **Authentication > Providers**
2. Enable **Email** provider (or OAuth providers like Google, GitHub)
3. Configure email templates (optional)

---

## Step 2: Create Your Admin User

### Option A: Via Supabase Dashboard

1. Go to **Authentication > Users**
2. Click **"Add User"**
3. Enter email and password
4. Click **"Create User"**
5. Click on the newly created user
6. In **User Management > Raw User Meta Data**, add:
   ```json
   {
     "role": "admin"
   }
   ```
7. Click **"Save"**

### Option B: Via SQL

```sql
-- Create user with admin role
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com', -- Your admin email
  crypt('your-secure-password', gen_salt('bf')), -- Your admin password
  NOW(),
  '{"role": "admin"}'::jsonb, -- IMPORTANT: Admin role
  NOW(),
  NOW()
);
```

---

## Step 3: Login Flow

### For Regular Users (Tagging Photos):

```typescript
// In your app
await supabase.auth.signInWithPassword({
	email: 'user@example.com',
	password: 'password'
});
```

Users can now:
- Submit tags (authenticated)
- View their own pending tags

### For Admin Users (Moderating Tags):

```typescript
// Login as admin
await supabase.auth.signInWithPassword({
	email: 'admin@example.com',
	password: 'admin-password'
});

// Navigate to admin page
window.location.href = '/admin/tags';
```

The server checks:
1. ✅ User is authenticated
2. ✅ User has `role: "admin"` in metadata
3. ✅ Grants access to admin dashboard

---

## Step 4: How It Works

### Authentication Flow:

```
User logs in
    ↓
Supabase returns JWT token
    ↓
Token stored in cookies (sb-access-token)
    ↓
Server reads token from cookies (hooks.server.ts)
    ↓
Checks user metadata for role: "admin"
    ↓
Grants/denies access to /admin routes
```

### File Structure:

```
src/
├── hooks.server.ts              # Session handling
├── routes/
│   ├── admin/
│   │   └── tags/
│   │       └── +page.server.ts  # Admin auth check
│   └── api/
│       └── admin/
│           └── tags/
│               └── +server.ts   # Admin API auth check
```

---

## Step 5: Testing Admin Access

### 1. Create Admin User
Use Supabase Dashboard or SQL above to create user with `role: "admin"`

### 2. Login
```typescript
// In browser console or login form
await supabase.auth.signInWithPassword({
	email: 'admin@example.com',
	password: 'your-password'
});
```

### 3. Access Admin Dashboard
Navigate to: `http://localhost:5173/admin/tags`

You should see:
- List of pending tags
- Approve/Reject buttons
- Tag submission details

### 4. Test Non-Admin User
Create a user WITHOUT admin role:
```json
{
  "role": "user"
}
```

Try accessing `/admin/tags` → Should get 403 error

---

## Security Features

✅ **Authentication Required:** No anonymous admin access
✅ **Role-Based Access:** Only users with `role: "admin"` can access
✅ **Server-Side Verification:** Auth checked on both page load and API calls
✅ **RLS Policies:** Database access controlled by Supabase RLS
✅ **No API Keys:** Uses proper OAuth-style auth tokens

---

## Common Issues

### "Authentication required" error:
- Make sure you're logged in
- Check cookies are enabled
- Verify token is being passed to server

### "Admin role required" error:
- Check user metadata has `"role": "admin"`
- Refresh Supabase dashboard
- Re-login after adding role

### Can't login:
- Verify Email provider is enabled in Supabase
- Check email/password are correct
- Look at Supabase Auth logs for errors

---

## Adding More Admins

Just repeat Step 2 for each admin user. Set `"role": "admin"` in their user metadata.

You can also create a UI for this:
```typescript
// Admin can promote other users (requires service_role key)
await adminClient.auth.admin.updateUserById(userId, {
	user_metadata: { role: 'admin' }
});
```

---

## Next Steps

1. ✅ Create admin user in Supabase
2. ✅ Login and test `/admin/tags` access
3. ✅ Build admin UI components (AdminTagQueue.svelte)
4. ✅ Integrate with photo pages (TagInput, TagDisplay)

---

**Status:** Auth infrastructure complete, ready for frontend components
