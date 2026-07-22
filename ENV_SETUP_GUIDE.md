# 📝 Environment Variables Setup Guide

## Understanding .env Files

### Two Files, Two Purposes:

| File | Purpose | Can Commit to Git? |
|------|---------|-------------------|
| `.env` | Your **actual credentials** | ❌ NO - Keep private |
| `.env.example` | **Template** showing what's needed | ✅ YES - Safe to share |

---

## Why Keep Both?

### `.env` (Your Working File)
- Contains your **real Supabase URL and anon key**
- Used when you run `npm run dev`
- Each developer has their own `.env` with their own credentials
- **Protected by `.gitignore`** - won't be committed

### `.env.example` (Documentation)
- Shows what variables are needed
- Has placeholder values, not real ones
- Helps teammates know what to configure
- Safe to commit to Git

---

## 🚀 Quick Setup (First Time)

If you don't have real credentials yet:

### Step 1: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create new one)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (e.g., `https://abcd1234.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 2: Update `.env`

Edit `frontend/.env`:

```bash
VITE_SUPABASE_URL=https://abcd1234.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here
```

**Replace with your actual values!**

### Step 3: Verify It Works

```bash
npm run dev
# Open http://localhost:5173
# Site should load (will show local fallback data if DB not setup yet)
```

---

## 🔒 Security Rules

### ✅ DO:
- Keep `.env` in `.gitignore`
- Use different credentials for development and production
- Store production credentials in Netlify environment variables
- Share `.env.example` with your team

### ❌ DON'T:
- Commit `.env` to Git
- Share your `.env` file
- Store passwords in environment variables (use Supabase Auth instead)
- Use the same credentials across multiple projects

---

## 🌐 Deployment (Netlify)

Your `.env` file is only for **local development**. For production:

1. Go to Netlify Dashboard → Your Site
2. Go to **Site settings** → **Environment variables**
3. Add these variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

4. Redeploy your site

Netlify will use these values when building your production site.

---

## 🔧 If You Want Only One File...

If you really want to delete `.env.example`, you can, but you'll lose:
- Documentation for teammates
- A backup template if you mess up `.env`
- Standard industry practice

**Not recommended, but you can:**

```bash
# Delete .env.example (not recommended)
del .env.example
```

**Better approach:** Keep both. It's the standard way all modern projects work (React, Next.js, Node.js, etc.).

---

## 📚 How Other Developers Use Your Project

When someone clones your repo:

1. They see `.env.example` (committed to Git)
2. They copy it: `copy .env.example .env`
3. They fill in their own credentials
4. They can run the project

Without `.env.example`, they wouldn't know what variables to create!

---

## ✅ Current Status

Your files are correctly set up:
- ✅ `.env` exists (not in Git)
- ✅ `.env.example` exists (in Git)
- ✅ `.gitignore` includes `.env`
- ✅ Both files have correct structure

**You're good to go! Just add your real Supabase credentials to `.env`**

---

## 🆘 Troubleshooting

### "Supabase is not configured" error

**Problem:** Your `.env` still has placeholder values

**Fix:** Replace `your_supabase_project_url` with your real URL from Supabase Dashboard

### Environment variables not updating

**Problem:** Vite caches env vars

**Fix:**
```bash
# Stop the dev server (Ctrl+C)
# Restart it
npm run dev
```

### Works locally but not on Netlify

**Problem:** Forgot to add env vars to Netlify

**Fix:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Netlify dashboard

---

## 📖 Learn More

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase API Keys](https://supabase.com/docs/guides/api)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

---

**Summary:** Keep both files. It's the right way! ✅
