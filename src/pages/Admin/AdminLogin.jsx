import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Admin.css'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'maxin3820@gmail.com'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin12345'

const AdminLogin = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      if (form.email === ADMIN_EMAIL && form.password === ADMIN_PASSWORD) {
        localStorage.setItem('birsil_admin', 'true')
        onLogin()
        navigate('/admin/dashboard')
      } else {
        setError('Invalid email or password.')
      }
      setLoading(false)
    }, 800)
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <div className="logo-icon">B</div>
          <span>Birsil <strong>Admin</strong></span>
        </div>
        <h2>Sign in to Admin Panel</h2>
        <p>Manage your courses and content.</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@email.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              autoFocus
              required
            />
          </div>
          <div className="admin-form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
          </div>
          {error && <div className="admin-login-error">⚠ {error}</div>}
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
