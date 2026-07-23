// ============================================
// CREATE ADMIN USER VIA SUPABASE ADMIN API
// ============================================
// Run this once to create your admin user
// Usage: node create-admin-user.js
// ============================================

import { createClient } from '@supabase/supabase-js'

// ⚠️ You need SERVICE_ROLE_KEY (not anon key!)
// Get from: Supabase Dashboard → Settings → API → service_role key
const SUPABASE_URL = 'https://mcgjfyzwhyuktfaqzewi.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE' // ⚠️ KEEP THIS SECRET!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'doodle3820@gmail.com',
      password: '112233', // ⚠️ Change to a stronger password!
      email_confirm: true // Auto-confirm email
    })

    if (error) throw error

    console.log('✅ Admin user created successfully!')
    console.log('Email:', data.user.email)
    console.log('User ID:', data.user.id)
    console.log('\n🔐 You can now login at: http://localhost:5173/admin/login')
  } catch (error) {
    console.error('❌ Error creating user:', error.message)
  }
}

createAdminUser()
