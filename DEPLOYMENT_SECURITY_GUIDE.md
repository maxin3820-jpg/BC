# 🔐 Deployment & Security Setup Guide

## ✅ Security Fixes Applied

All critical security vulnerabilities have been fixed:

1. ✅ Admin credentials removed from `.env` file
2. ✅ Proper Supabase Authentication implemented
3. ✅ Admin logout now clears Supabase session
4. ✅ RLS policies configured correctly
5. ✅ Storage bucket policies secured

---

## 📋 Pre-Deployment Checklist

### Step 1: Verify Git Security

Check that `.env` is NOT tracked:
```bash
cd frontend
git status
# Should NOT show .env in the list
```

If `.env` appears, remove it:
```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
```

**⚠️ IMPORTANT:** If you previously committed `.env` with real credentials:
1. Those credentials are in your Git history FOREVER
2. Change your Supabase anon key
3. Change your admin password
4. Consider using tools like `git filter-branch` or BFG Repo-Cleaner to remove from history

---

## 🗄️ Step 2: Setup Supabase Database

### 2.1 Run the SQL Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase-setup.sql`
5. Paste and click **Run**

This creates:
- ✅ All tables (courses, packs, messages, site_settings)
- ✅ RLS policies
- ✅ Storage buckets
- ✅ Seed data (6 courses, 3 packs, default settings)

### 2.2 Create Admin User

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add User** → **Create new user**
3. Enter:
   - **Email:** `maxin3820@gmail.com` (or your preferred email)
   - **Password:** Create a STRONG password (minimum 12+ characters)
   - **Auto Confirm User:** ✅ Enable this
4. Click **Create user**

**🔴 CRITICAL:** Use a strong password, NOT `admin12345`!

Example strong password: `B1rs!l_C0urs3s_2024#Secure`

---

## 🌐 Step 3: Configure Environment Variables

### 3.1 Get Supabase Credentials

1. Go to **Settings** → **API** in Supabase Dashboard
2. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

### 3.2 Update Local `.env`

Edit `frontend/.env`:
```bash
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-actual-key
```

### 3.3 Configure Netlify Environment Variables

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add these variables:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your anon key from Supabase |

**DO NOT add `VITE_ADMIN_EMAIL` or `VITE_ADMIN_PASSWORD`** — these are no longer used!

---

## 🧪 Step 4: Test Locally

1. Start the development server:
```bash
cd frontend
npm install
npm run dev
```

2. Test admin login:
   - Go to `http://localhost:5173/admin/login`
   - Use the email/password you created in Supabase
   - Should successfully log in

3. Test admin operations:
   - Try adding a course (with image upload)
   - Try editing a course
   - Try deleting a course
   - Check the contact form submission

If any operations fail with "permission denied":
- Check that you created the admin user correctly
- Verify RLS policies are enabled
- Check browser console for errors

---

## 🚀 Step 5: Deploy to Netlify

### Option A: Deploy via Git

1. Commit your changes:
```bash
git add .
git commit -m "Security fixes: Implement Supabase Auth"
git push origin main
```

2. Netlify will auto-deploy (if connected to your repo)

### Option B: Manual Deploy

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist/` folder to Netlify:
   - Drag and drop to Netlify dashboard, OR
   - Use Netlify CLI: `netlify deploy --prod`

---

## 🔒 Step 6: Post-Deployment Security Checks

### 6.1 Verify Admin Login Works

1. Go to `https://your-site.netlify.app/admin/login`
2. Login with your Supabase admin credentials
3. Verify you can access the dashboard

### 6.2 Test RLS Policies

Open browser DevTools → Console, paste this:

```javascript
// This should FAIL (anon users can't create courses)
await supabase.from('courses').insert([{ title: 'Hack attempt' }])
// Should return: permission denied error
```

If it succeeds, your RLS policies aren't working!

### 6.3 Check for Credential Leaks

1. Open DevTools → Network → Refresh page
2. Click on any JavaScript file
3. Search for:
   - `admin12345` — should NOT appear
   - `VITE_ADMIN_PASSWORD` — should NOT appear
   - Your Supabase anon key — WILL appear (this is normal and safe)

---

## 🛡️ Additional Security Recommendations

### 1. Add CAPTCHA to Contact Form

Install reCAPTCHA or Cloudflare Turnstile:

```bash
npm install react-google-recaptcha
```

Add to `Contact.jsx` to prevent spam.

### 2. Enable Supabase Email Confirmations

In Supabase Dashboard → **Authentication** → **Settings**:
- Enable **Email confirmations**
- This prevents unauthorized admin user creation

### 3. Setup Email Notifications

Configure Supabase to send you email alerts for:
- New user signups
- Failed login attempts
- Database errors

### 4. Monitor Admin Access

Check **Authentication** → **Users** regularly for suspicious accounts.

### 5. Rotate Anon Key Periodically

Every 6 months:
1. Generate new anon key in Supabase
2. Update Netlify env vars
3. Redeploy

---

## 🐛 Troubleshooting

### "Invalid login credentials" error

**Cause:** Admin user not created in Supabase Auth

**Fix:** Go to Supabase → Authentication → Users → Create the admin user

### "Permission denied" when creating courses

**Cause:** Not logged in with Supabase Auth

**Fix:** 
1. Logout
2. Login again (forces Supabase Auth)
3. Check browser console for auth errors

### Image uploads failing

**Cause:** Storage bucket policies not applied

**Fix:**
1. Re-run the `supabase-setup.sql` file
2. Check **Storage** → **Policies** in Supabase Dashboard
3. Verify `course-images` bucket has policies enabled

### Can't login with old password

**Expected behavior** — old passwords no longer work.

**Fix:** Use the password you set in Supabase Auth (Step 2.2)

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check Supabase logs: Dashboard → **Logs** → **API logs**
3. Verify environment variables are set correctly
4. Ensure Supabase project is not paused (free tier pauses after 7 days inactivity)

---

## ✨ What Changed?

### Before (INSECURE)
- ❌ Credentials hardcoded in `.env`
- ❌ Admin auth checked client-side only
- ❌ Credentials visible in browser JavaScript
- ❌ RLS policies didn't work (auth check always failed)

### After (SECURE)
- ✅ No credentials in code
- ✅ Server-side authentication via Supabase Auth
- ✅ RLS policies enforced correctly
- ✅ Storage uploads work properly
- ✅ Admin session management via Supabase tokens

---

## 🎉 You're Ready to Deploy!

Follow the steps above in order, and your site will be secure and production-ready.

**Remember:** Keep your Supabase credentials secret and use strong passwords!
