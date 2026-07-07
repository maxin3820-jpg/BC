import React, { useState } from 'react'

const AdminSettings = () => {
  const [site, setSite] = useState({
    siteName: 'Birsil Courses',
    tagline: 'Learn Skills That Shape Your Future',
    email: 'hello@birsilcourses.com',
    phone: '+1 (555) 123-4567',
    twitter: 'https://twitter.com/birsilcourses',
    youtube: 'https://youtube.com/@birsilcourses',
    linkedin: 'https://linkedin.com/company/birsilcourses',
    instagram: 'https://instagram.com/birsilcourses',
  })

  const [password, setPassword] = useState({ current: '', newPass: '', confirm: '' })
  const [notifications, setNotifications] = useState({
    newEnrollment: true,
    newMessage: true,
    newReview: false,
    weeklyReport: true,
  })
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const saveSite = (e) => {
    e.preventDefault()
    showToast('✅ Site settings saved!')
  }

  const savePassword = (e) => {
    e.preventDefault()
    if (password.newPass !== password.confirm) {
      showToast('❌ Passwords do not match!')
      return
    }
    if (password.current !== 'admin123') {
      showToast('❌ Current password is incorrect!')
      return
    }
    showToast('✅ Password updated successfully!')
    setPassword({ current: '', newPass: '', confirm: '' })
  }

  return (
    <div className="admin-settings">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-section-title">
        <div>
          <h2>Settings</h2>
          <p>Configure your platform settings.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Site Settings */}
        <div className="admin-card">
          <div className="admin-card-header"><h3>🌐 Site Information</h3></div>
          <form onSubmit={saveSite}>
            <div className="admin-form-group">
              <label>Site Name</label>
              <input value={site.siteName} onChange={e => setSite(p => ({ ...p, siteName: e.target.value }))} />
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
            <button type="submit" className="admin-btn-primary">Save Changes</button>
          </form>
        </div>

        {/* Social Links */}
        <div className="admin-card">
          <div className="admin-card-header"><h3>🔗 Social Links</h3></div>
          <form onSubmit={saveSite}>
            {['twitter', 'youtube', 'linkedin', 'instagram'].map(key => (
              <div className="admin-form-group" key={key}>
                <label style={{ textTransform: 'capitalize' }}>{key}</label>
                <input value={site[key]} onChange={e => setSite(p => ({ ...p, [key]: e.target.value }))} />
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
              <label>Current Password</label>
              <input type="password" value={password.current} onChange={e => setPassword(p => ({ ...p, current: e.target.value }))} placeholder="••••••••" />
            </div>
            <div className="admin-form-group">
              <label>New Password</label>
              <input type="password" value={password.newPass} onChange={e => setPassword(p => ({ ...p, newPass: e.target.value }))} placeholder="••••••••" />
            </div>
            <div className="admin-form-group">
              <label>Confirm New Password</label>
              <input type="password" value={password.confirm} onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" />
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
