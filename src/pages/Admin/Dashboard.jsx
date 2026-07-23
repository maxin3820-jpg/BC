import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { courses as localCourses } from '../../data/courses'
import { mapCourse } from '../../hooks/useCourses'

const Dashboard = () => {
  const [courses, setCourses] = useState([])
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [totalMessages, setTotalMessages] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!supabase) { setCourses(localCourses); setLoading(false); return }
      try {
        const [coursesRes, msgRes] = await Promise.all([
          supabase.from('courses').select('*').order('sort_order', { ascending: true }),
          supabase.from('messages').select('id, is_read'),
        ])
        if (!coursesRes.error && coursesRes.data?.length) {
          setCourses(coursesRes.data.map(mapCourse))
        } else {
          setCourses(localCourses)
        }
        if (!msgRes.error && msgRes.data) {
          setTotalMessages(msgRes.data.length)
          setUnreadMessages(msgRes.data.filter(m => !m.is_read).length)
        }
      } catch {
        setCourses(localCourses)
      } finally {
        setLoading(false)
      }
    }
    load()

    if (!supabase) return
    const channel = supabase
      .channel('dashboard-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, async () => {
        const { data } = await supabase.from('messages').select('id, is_read')
        if (data) { setTotalMessages(data.length); setUnreadMessages(data.filter(m => !m.is_read).length) }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const statCards = [
    { label: 'Total Courses', value: courses.length, icon: '📚', color: '#1E3A8A', change: 'On your platform' },
    { label: 'Free Courses', value: courses.filter(c => c.isFree).length, icon: '🎁', color: '#2DC49A', change: 'Available for free' },
    { label: 'Paid Courses', value: courses.filter(c => !c.isFree).length, icon: '💰', color: '#1D4ED8', change: 'Premium courses' },
    { label: 'Unread Messages', value: unreadMessages, icon: '💬', color: '#C88A00', change: `${totalMessages} total messages` },
  ]

  return (
    <div className="admin-dashboard">
      <div className="admin-section-title">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back! Here's what's happening with Birsil Courses.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        {statCards.map((stat, i) => (
          <div key={i} className="admin-stat-card">
            <div className="asc-left">
              <p className="asc-label">{stat.label}</p>
              <h3 className="asc-value">{loading ? '…' : stat.value}</h3>
              <span className="asc-change">{stat.change}</span>
            </div>
            <div className="asc-icon" style={{ background: stat.color + '20', color: stat.color }}>{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Messages Summary */}
      <div className="admin-card dash-messages-card" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-card-header">
          <h3>Messages {unreadMessages > 0 && <span className="unread-badge">{unreadMessages}</span>}</h3>
          <Link to="/admin/messages" className="admin-link">View All →</Link>
        </div>
        {totalMessages === 0 ? (
          <div className="dash-empty">
            <span>💬</span>
            <p>No messages yet. Contact form submissions will appear here.</p>
          </div>
        ) : (
          <div className="dash-msg-summary">
            <div className="dash-msg-stat">
              <span className="dash-msg-num">{totalMessages}</span>
              <span className="dash-msg-label">Total</span>
            </div>
            <div className="dash-msg-divider" />
            <div className="dash-msg-stat">
              <span className="dash-msg-num" style={{ color: unreadMessages > 0 ? '#60A5FA' : 'var(--adm-accent)' }}>{unreadMessages}</span>
              <span className="dash-msg-label">Unread</span>
            </div>
            <div className="dash-msg-divider" />
            <div className="dash-msg-stat">
              <span className="dash-msg-num" style={{ color: 'var(--adm-accent)' }}>{totalMessages - unreadMessages}</span>
              <span className="dash-msg-label">Read</span>
            </div>
            {unreadMessages > 0 && (
              <Link to="/admin/messages" className="admin-btn-primary dash-read-btn">
                Read Now →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Courses List */}
      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-card-header">
          <h3>All Courses</h3>
          <Link to="/admin/courses" className="admin-link">Manage →</Link>
        </div>

        {/* Desktop table */}
        <div className="dash-courses-table">
          <div className="dash-table-head">
            <span>Course</span><span>Price</span><span>Status</span>
          </div>
          {loading ? (
            <p style={{ padding: '1rem', color: 'var(--adm-text3)', fontSize: '0.875rem' }}>Loading...</p>
          ) : courses.map(course => (
            <div key={course.id} className="dash-table-row">
              <span className="dash-course-title">{course.title}</span>
              <span className="dash-course-price">{course.isFree ? 'Free' : `PKR ${course.price}`}</span>
              <span className="dash-course-status">
                {course.isBestseller && <span className="mini-badge bestseller">⭐</span>}
                {course.isNew && <span className="mini-badge new-badge">New</span>}
                {course.isFree && <span className="mini-badge free-badge">Free</span>}
                {!course.isBestseller && !course.isNew && !course.isFree && (
                  <span style={{ color: 'var(--adm-accent)', fontSize: '0.75rem', fontWeight: 600 }}>● Active</span>
                )}
              </span>
            </div>
          ))}
          {!loading && courses.length === 0 && (
            <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--adm-text3)', fontSize: '0.875rem' }}>
              No courses yet. <Link to="/admin/courses" className="admin-link">Add one →</Link>
            </p>
          )}
        </div>

        {/* Mobile cards */}
        <div className="dash-courses-mobile">
          {loading ? (
            <p style={{ padding: '1rem', color: 'var(--adm-text3)', fontSize: '0.875rem' }}>Loading...</p>
          ) : courses.map(course => (
            <div key={course.id} className="dash-course-card">
              <div className="dash-course-card-title">{course.title}</div>
              <div className="dash-course-card-meta">
                <span className="dash-course-price">{course.isFree ? 'Free' : `PKR ${course.price}`}</span>
                <span>
                  {course.isBestseller && <span className="mini-badge bestseller">⭐ Best</span>}
                  {course.isNew && <span className="mini-badge new-badge">New</span>}
                  {course.isFree && <span className="mini-badge free-badge">Free</span>}
                  {!course.isBestseller && !course.isNew && !course.isFree && (
                    <span style={{ color: 'var(--adm-accent)', fontSize: '0.72rem', fontWeight: 600 }}>● Active</span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="admin-card-header"><h3>Quick Actions</h3></div>
        <div className="quick-actions">
          <Link to="/admin/courses" className="quick-action"><span>➕</span> Add Course</Link>
          <Link to="/admin/packs" className="quick-action"><span>📦</span> Manage Packs</Link>
          <Link to="/admin/reorder" className="quick-action"><span>↕️</span> Reorder</Link>
          <Link to="/admin/messages" className="quick-action"><span>💬</span> Messages</Link>
          <Link to="/admin/faqs" className="quick-action"><span>❓</span> Edit FAQs</Link>
          <Link to="/admin/templates" className="quick-action"><span>📋</span> Templates</Link>
          <Link to="/admin/settings" className="quick-action"><span>⚙️</span> Settings</Link>
          <Link to="/admin/analytics" className="quick-action"><span>📈</span> Analytics</Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="quick-action"><span>🌐</span> View Site</a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
