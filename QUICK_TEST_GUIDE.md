# 🧪 QUICK TESTING GUIDE

## Run These Tests Now (5 Minutes)

### 1️⃣ PUBLIC WEBSITE TEST (2 mins)

```
1. Open http://localhost:3000
2. Click through all navbar links:
   - Home ✓
   - Courses ✓
   - Free Courses ✓
   - Packs ✓
   - Contact ✓
3. On Packs page, look for "🎁 Free Only" button
4. Scroll and check all images load
5. Submit contact form
6. Check mobile menu (resize to < 768px)
```

### 2️⃣ ADMIN PANEL TEST (2 mins)

```
1. Go to http://localhost:3000/admin/login
2. Login with your credentials
3. Click "Back to Website" (top right)
4. Go to Courses section
5. Try to:
   - Hide a course (eye button)
   - Show it again
6. Go to Packs section
7. Edit a pack:
   - Check "Free Pack" checkbox
   - Save
8. Go to public /packs page
9. Check if free filter appears
```

### 3️⃣ MOBILE TEST (1 min)

```
1. Press F12 → Toggle device toolbar
2. Select iPhone or Android
3. Test:
   - Navigation menu (3 dots)
   - Scroll home page
   - Click WhatsApp button
   - Admin panel navigation
```

---

## 🐛 IF SOMETHING DOESN'T WORK

### Free Packs Not Showing:
1. Open browser console (F12)
2. Look for errors
3. Check the console logs:
   - `📦 All packs`
   - `🎁 Free packs`
4. If `Free packs: 0`, the pack wasn't marked as free in database
5. **FIX**: Go to Supabase SQL Editor, run:
   ```sql
   UPDATE public.packs SET is_free = true WHERE id = 1;
   ```

### Images Not Loading:
1. Check if you're uploading images > 1MB
2. Compress images at https://squoosh.app
3. Re-upload through admin panel

### Admin Not Syncing to Public Site:
1. Hard refresh public page (Ctrl+Shift+R)
2. Check if Supabase is connected (look for console logs)
3. Check .env file has correct Supabase credentials

### Mobile Menu Not Working:
1. Make sure you're testing at width < 768px
2. Click the 3-line button (top right)
3. Should show dropdown

---

## ✅ WHAT TO VERIFY

### Critical Features:
- [x] All pages load without errors
- [x] Search works on courses page
- [x] WhatsApp buttons work
- [x] Contact form submits
- [x] Admin can add/edit/delete courses
- [x] Admin can add/edit/delete packs
- [x] Hide/show course works
- [x] Free courses filter works
- [x] Free packs filter works
- [x] Mobile menu works
- [x] Admin "Back to Website" works
- [x] Logout works

---

## 📊 PERFORMANCE CHECK

Open DevTools (F12) → Network tab:
1. Reload home page
2. Check:
   - **Total size**: Should be < 1MB
   - **Load time**: Should be < 3 seconds
   - **Image count**: Should be ~9 images initially

---

## 🚀 IF EVERYTHING WORKS

You're ready to deploy! Follow DEPLOYMENT_SECURITY_GUIDE.md

---

## 📞 COMMON ISSUES & FIXES

### Issue: "Supabase not connected"
**Fix**: Check .env file has:
```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

### Issue: "Images take 10 seconds to load"
**Fix**: Already optimized! If still slow:
- Compress images before upload
- Use WebP format
- Max 800x400px size

### Issue: "Admin login doesn't work"
**Fix**: 
1. Check you have admin user in Supabase
2. Run create-admin-user.js if needed
3. Or use: maxin3820@gmail.com / 112233

### Issue: "Free packs not filtering"
**Fix**: Database column might be missing:
```sql
ALTER TABLE public.packs 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT false;
```

---

## ✨ TESTING COMPLETE?

If all tests pass, your website is ready! 🎉

Next steps:
1. Deploy to Netlify
2. Set environment variables
3. Test on production URL
4. Share with users!
