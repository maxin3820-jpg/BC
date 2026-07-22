import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import './Admin.css'

const navItems = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/courses', icon: '📚', label: 'Courses' },
  { to: '/admin/packs', icon: '📦', label: 'Packs' },
  { to: '/admin/students', icon: '👥', label: 'Students' },
  { to: '/admin/messages', icon: '💬', label: 'Messages' },
  { to: '/admin/analytics', icon: '📈', label: 'Analytics' },
  { to: '/admin/settings', icon: '⚙️', label: 'Settings' },
]

const getIsMobile = () => typeof window !== 'undefined' && window.innerWidth <= 1024

const AdminLayout = ({ onLogout }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(getIsMobile)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 1024
      setIsMobile(mobile)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('birsil_admin')
    onLogout()
    navigate('/')
  }

  const isCollapsed = !isMobile && collapsed

  return (
    <div className={`admin-layout ${isCollapsed ? 'collapsed' : ''}`}>

      {/* Sidebar — desktop only */}
      {!isMobile && (
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <div className="admin-logo">
                            {!isCollapsed && <span>Birsil <strong>Admin</strong></span>}
            </div>
            <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
              {collapsed ? '→' : '←'}
            </button>
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
      )}

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
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
          {/* Mobile nav card — shown only on mobile, above page content */}
          {isMobile && (
            <div className="mobile-nav-card">
              <div className="mobile-nav-card-header">
                <div className="admin-logo">
                                    <span>Birsil <strong>Admin</strong></span>
                </div>
              </div>
              <div className="mobile-nav-grid">
                {navItems.map(item => (
                  <NavLink key={item.to} to={item.to} className="mobile-nav-btn">
                    <span className="mobile-nav-icon">{item.icon}</span>
                    <span className="mobile-nav-label">{item.label}</span>
                  </NavLink>
                ))}
                <button className="mobile-nav-btn mobile-nav-logout" onClick={handleLogout}>
                  <span className="mobile-nav-icon">🚪</span>
                  <span className="mobile-nav-label">Logout</span>
                </button>
              </div>
            </div>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
