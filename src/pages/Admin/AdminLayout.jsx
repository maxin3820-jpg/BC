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

const AdminLayout = ({ onLogout }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('birsil_admin')
    onLogout()
    navigate('/')
  }

  const sidebarClass = [
    'admin-sidebar',
    isMobile && mobileOpen ? 'mobile-open' : '',
    !isMobile && collapsed ? 'collapsed-sidebar' : '',
  ].join(' ')

  const isCollapsed = !isMobile && collapsed

  return (
    <div className={`admin-layout ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="admin-mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClass}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <div className="logo-icon">B</div>
            {!isCollapsed && <span>Birsil <strong>Admin</strong></span>}
          </div>
          {!isMobile && (
            <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? '→' : '←'}
            </button>
          )}
          {isMobile && (
            <button className="collapse-btn" onClick={() => setMobileOpen(false)}>✕</button>
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

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isMobile && (
              <button
                className="collapse-btn"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                style={{ fontSize: '1.1rem', padding: '0.4rem 0.6rem' }}
              >
                ☰
              </button>
            )}
            <h1 className="admin-page-title">Admin Panel</h1>
          </div>
          <div className="admin-topbar-right">
            <a href="/" target="_blank" className="admin-view-site">
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
