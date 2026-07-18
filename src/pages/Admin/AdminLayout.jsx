import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import './Admin.css'

const navItems = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/courses', icon: '📚', label: 'Courses' },
  { to: '/admin/students', icon: '👥', label: 'Students' },
  { to: '/admin/messages', icon: '💬', label: 'Messages' },
  { to: '/admin/analytics', icon: '📈', label: 'Analytics' },
  { to: '/admin/settings', icon: '⚙️', label: 'Settings' },
]

const getIsMobile = () => typeof window !== 'undefined' && window.innerWidth <= 1024

const AdminLayout = ({ onLogout }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(getIsMobile)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 1024
      setIsMobile(mobile)
      if (!mobile) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) setMobileOpen(false)
  }, [location, isMobile])

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = mobileOpen ? 'hidden' : ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen, isMobile])

  const handleLogout = () => {
    localStorage.removeItem('birsil_admin')
    onLogout()
    navigate('/')
  }

  const isCollapsed = !isMobile && collapsed

  return (
    <div className={`admin-layout ${isCollapsed ? 'collapsed' : ''}`}>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div className="admin-mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobile && mobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <div className="logo-icon">B</div>
            {!isCollapsed && <span>Birsil <strong>Admin</strong></span>}
          </div>
          {!isMobile ? (
            <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
              {collapsed ? '→' : '←'}
            </button>
          ) : (
            <button className="collapse-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">✕</button>
          )}
        </div>

        <nav className="admin-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className="admin-nav-item">
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            {isMobile && (
              <button
                className="admin-hamburger"
                onClick={() => setMobileOpen(true)}
                aria-label="Open admin menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            )}
            <h1 className="admin-page-title">Admin Panel</h1>
          </div>
          <div className="admin-topbar-right">
            <a href="/" target="_blank" rel="noopener noreferrer" className="admin-view-site">
              🌐 View Site
            </a>
            <div className="admin-user">
              <span className="admin-avatar">👨‍💼</span>
              <span className="admin-user-name">Admin</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
