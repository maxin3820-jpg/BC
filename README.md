# Birsil Courses — Frontend

## Deploy to Netlify via GitHub

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/birsil-courses.git
git push -u origin main
```

### 2. Connect to Netlify
1. Go to [netlify.com](https://netlify.com) → New site from Git
2. Connect your GitHub repo
3. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`

### 3. Add Environment Variables in Netlify
Go to **Site Settings → Environment Variables** and add:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_ADMIN_EMAIL` | maxin3820@gmail.com |
| `VITE_ADMIN_PASSWORD` | admin12345 |

### 4. Supabase Setup
1. Go to [supabase.com](https://supabase.com) → New project
2. Copy your **Project URL** and **anon public key**
3. Paste them into Netlify env vars above
4. Create a `courses` table in Supabase with columns:
   - `id` (int8, primary key)
   - `title` (text)
   - `description` (text)
   - `price` (float4)
   - `original_price` (float4)
   - `thumbnail` (text)
   - `is_bestseller` (bool)
   - `is_new` (bool)
   - `is_free` (bool)

## Admin Panel
- URL: `/admin`
- Email: `maxin3820@gmail.com`
- Password: `admin12345`
