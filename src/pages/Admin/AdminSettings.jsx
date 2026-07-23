import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const defaultSite = {
  site_name: 'Birsil Courses',
  tagline: 'Learn Skills That Shape Your Future',
  email: 'maxin3820@gmail.com',
  phone: '+923036326202',
  whatsapp: '+923036326202',
  twitter: 'https://twitter.com',
  youtube: 'https://youtube.com',
  linkedin: 'https://linkedin.com',
  instagram: 'https://instagram.com',
}

const AdminSettings = () => {
  const [site, setSite] = useState(defaultSite)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [password, setPassword] = useState({ current: '', newPass: '', confirm: '' })
  const [notifications, setNotifications] = useState({
    newPurchase: true, newMessage: true, newReview: false, weeklyReport: true,
  })
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // ── Load settings from Supabase ───────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!supabase) { setLoadingSettings(false); return }
      try {
        const { data, error } = await supabase.from('site_settings').select('key, value')
        if (!error && data?.length) {
          const obj = data.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
          setSite(prev => ({ ...prev, ...obj }))
        }
      } catch { /* use defaults */ }
      finally { setLoadingSettings(false) }
    }
    load()
  }, [])

  // ── Save settings to Supabase ─────────────────────────────────────────────
  const upsertSettings = async (updates) => {
    if (!supabase) return
    try {
      const rows = Object.entries(updates).map(([key, value]) => ({ key, value }))
      await supabase.from('site_settings').upsert(rows, { onConflict: 'key' })
    } catch (err) {
      console.warn('Settings save failed:', err.message)
    }
  }

  const saveSite = async (e) => {
    e.preventDefault()
    await upsertSettings({
      site_name: site.site_name,
      tagline: site.tagline,
      email: site.email,
      phone: site.phone,
      whatsapp: site.whatsapp,
    })
    showToast('✅ Site settings saved!')
  }

  const saveSocial = async (e) => {
    e.preventDefault()
    await upsertSettings({
      twitter: site.twitter,
      youtube: site.youtube,
      linkedin: site.linkedin,
      instagram: site.instagram,
    })
    showToast('✅ Social links saved!')
  }

  const savePassword = async (e) => {
    e.preventDefault()
    if (password.newPass !== password.confirm) { 
      showToast('❌ Passwords do not match!'); 
      return 
    }
    
    if (password.newPass.length < 8) {
      showToast('❌ Password must be at least 8 characters!')
      return
    }

    if (!supabase) {
      showToast('❌ Supabase not configured')
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password.newPass
      })

      if (error) throw error

      showToast('✅ Password updated successfully!')
      setPassword({ current: '', newPass: '', confirm: '' })
    } catch (err) {
      console.error('Password update error:', err)
      showToast('❌ Failed to update password: ' + err.message)
    }
  }

  if (loadingSettings) return <div style={{ padding: '2rem', color: 'var(--adm-text2)' }}>Loading settings...</div>

  return (
    <div className="admin-settings">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-section-title">
        <div>
          <h2>Settings</h2>
          <p>Configure your platform. Changes reflect on the website instantly.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Site Info */}
        <div className="admin-card">
          <div className="admin-card-header"><h3>🌐 Site Information</h3></div>
          <form onSubmit={saveSite}>
            <div className="admin-form-group">
              <label>Site Name</label>
              <input value={site.site_name} onChange={e => setSite(p => ({ ...p, site_name: e.target.value }))} />
            </div>
            <div className="admin-form-group">
              <label>Tagline</label>
              <input value={site.tagline} onChange={e => setSite(p => ({ ...p, tagline: e.target.value }))} />
            </div>
            <div className="admin-form-group">
              <label>Contact Email</label>
              <input type="email" value={site.email} onChange={e => setSite(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="admin-form-group">
              <label>Phone</label>
              <input value={site.phone} onChange={e => setSite(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="admin-form-group">
              <label>WhatsApp Number (with country code)</label>
              <input value={site.whatsapp} onChange={e => setSite(p => ({ ...p, whatsapp: e.target.value }))} placeholder="+923036326202" />
            </div>
            <button type="submit" className="admin-btn-primary">Save Changes</button>
          </form>
        </div>

        {/* Social Links */}
        <div className="admin-card">
          <div className="admin-card-header"><h3>🔗 Social Links</h3></div>
          <form onSubmit={saveSocial}>
            {['twitter', 'youtube', 'linkedin', 'instagram'].map(key => (
              <div className="admin-form-group" key={key}>
                <label style={{ textTransform: 'capitalize' }}>{key}</label>
                <input value={site[key] || ''} onChange={e => setSite(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <button type="submit" className="admin-btn-primary">Save Links</button>
          </form>
        </div>

        {/* Password */}
        <div className="admin-card">
          <div className="admin-card-header"><h3>🔒 Change Password</h3></div>
          <form onSubmit={savePassword}>
            <div className="admin-form-group">
              <label>New Password</label>
              <input type="password" value={password.newPass} onChange={e => setPassword(p => ({ ...p, newPass: e.target.value }))} placeholder="••••••••" required />
            </div>
            <div className="admin-form-group">
              <label>Confirm New Password</label>
              <input type="password" value={password.confirm} onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" required />
            </div>
            <button type="submit" className="admin-btn-primary">Update Password</button>
          </form>
        </div>

        {/* Notifications */}
        <div className="admin-card">
          <div className="admin-card-header"><h3>🔔 Notifications</h3></div>
          <div className="notification-settings">
            {Object.entries(notifications).map(([key, val]) => (
              <div key={key} className="notif-row">
                <div>
                  <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</strong>
                  <p>Receive email when this happens</p>
                </div>
                <label className="toggle-label">
                  <input type="checkbox" checked={val} onChange={e => setNotifications(p => ({ ...p, [key]: e.target.checked }))} />
                  <span className="toggle"></span>
                </label>
              </div>
            ))}
          </div>
          <button className="admin-btn-primary" style={{ marginTop: '1rem' }} onClick={() => showToast('✅ Notifications saved!')}>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
