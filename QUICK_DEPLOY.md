# 🚀 Quick Deploy Checklist

Follow these steps in order to deploy your site securely:

## 1️⃣ Setup Supabase (5 minutes)

### Run SQL Setup
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** → **New Query**
3. Copy all content from `supabase-setup.sql`
4. Paste and click **RUN**

### Create Admin User
1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Email: `maxin3820@gmail.com`
4. Password: **Create a STRONG password** (NOT admin12345!)
5. ✅ Enable **Auto Confirm User**
6. Click **Create user**

### Get API Credentials
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (`https://xxxxx.supabase.co`)
   - **anon public** key

---

## 2️⃣ Configure Environment Variables

### Local Development
Edit `frontend/.env`:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### Netlify Production
1. Go to **Site Settings** → **Environment Variables**
2. Add:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key

---

## 3️⃣ Test Locally

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/admin/login` and login with your Supabase credentials.

---

## 4️⃣ Deploy to Netlify

### Option A: Git Deploy
```bash
git add .
git commit -m "Deploy with security fixes"
git push origin main
```

### Option B: Manual Deploy
```bash
npm run build
# Then drag the dist/ folder to Netlify dashboard
```

---

## 5️⃣ Verify Deployment

1. Go to `https://your-site.netlify.app/admin/login`
2. Login with your Supabase admin credentials
3. Try adding/editing a course
4. Test contact form submission

---

## ✅ Done!

Your site is now secure and production-ready.

**Need help?** See `DEPLOYMENT_SECURITY_GUIDE.md` for detailed troubleshooting.
