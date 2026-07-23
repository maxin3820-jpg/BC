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
  announcement_text: '',
  announcement_active: 'false',
  hero_headline: '',
  hero_subtext: '',
  hero_badge: '',
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

        {/* Announcement Banner */}
        <div className="admin-card">
          <div className="admin-card-header"><h3>📢 Announcement Banner</h3></div>
          <form onSubmit={async (e) => {
            e.preventDefault()
            await upsertSettings({
              announcement_text: site.announcement_text,
              announcement_active: site.announcement_active,
            })
            showToast('✅ Announcement saved!')
          }}>
            <div className="admin-form-group">
              <label>Banner Message</label>
              <input
                value={site.announcement_text || ''}
                onChange={e => setSite(p => ({ ...p, announcement_text: e.target.value }))}
                placeholder="e.g. 🔥 Ramadan Sale — 50% off all courses!"
              />
            </div>
            <div className="notif-row" style={{ marginTop: '1rem' }}>
              <div>
                <strong>Show Banner</strong>
                <p>Display this banner on the public website</p>
              </div>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={site.announcement_active === 'true'}
                  onChange={e => setSite(p => ({ ...p, announcement_active: e.target.checked ? 'true' : 'false' }))}
                />
                <span className="toggle"></span>
              </label>
            </div>
            {site.announcement_active === 'true' && site.announcement_text && (
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'linear-gradient(135deg, #1E3A8A, #1D4ED8)', borderRadius: 'var(--adm-radius)', color: '#fff', fontSize: '0.875rem', textAlign: 'center' }}>
                📢 {site.announcement_text}
              </div>
            )}
            <button type="submit" className="admin-btn-primary" style={{ marginTop: '1rem' }}>Save Banner</button>
          </form>
        </div>

        {/* Hero Section Editor */}
        <div className="admin-card">
          <div className="admin-card-header"><h3>🏠 Hero Section Editor</h3></div>
          <form onSubmit={async (e) => {
            e.preventDefault()
            await upsertSettings({
              hero_badge: site.hero_badge,
              hero_headline: site.hero_headline,
              hero_subtext: site.hero_subtext,
            })
            showToast('✅ Hero section saved!')
          }}>
            <div className="admin-form-group">
              <label>Badge Text</label>
              <input
                value={site.hero_badge || ''}
                onChange={e => setSite(p => ({ ...p, hero_badge: e.target.value }))}
                placeholder="e.g. 🚀 New courses added weekly"
              />
            </div>
            <div className="admin-form-group">
              <label>Main Headline</label>
              <input
                value={site.hero_headline || ''}
                onChange={e => setSite(p => ({ ...p, hero_headline: e.target.value }))}
                placeholder="e.g. Affordable Courses That Change Careers"
              />
            </div>
            <div className="admin-form-group">
              <label>Sub Text</label>
              <textarea
                rows={3}
                value={site.hero_subtext || ''}
                onChange={e => setSite(p => ({ ...p, hero_subtext: e.target.value }))}
                placeholder="e.g. Premium courses, bundles, packs and PDFs..."
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--adm-text3)', marginBottom: '0.75rem' }}>
              Leave blank to use the default text from code.
            </p>
            <button type="submit" className="admin-btn-primary">Save Hero</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
