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
      if (!supabase) {
        setCourses(localCourses)
        setLoading(false)
        return
      }
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
    // Live unread badge
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
          <h2>Dashboard Overview</h2>
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

      <div className="admin-two-col">
        {/* Courses List */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>All Courses</h3>
            <Link to="/admin/courses" className="admin-link">Manage →</Link>
          </div>
          <div className="admin-table">
            <div className="admin-table-head" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
              <span>Course</span><span>Price</span><span>Status</span>
            </div>
            {loading ? (
              <p style={{ padding: '1rem', color: 'var(--adm-text3)', fontSize: '0.875rem' }}>Loading...</p>
            ) : courses.map(course => (
              <div key={course.id} className="admin-table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                <span className="atc-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</span>
                <span>{course.isFree ? 'Free' : `PKR ${course.price}`}</span>
                <span>
                  {course.isBestseller && <span className="mini-badge bestseller">⭐</span>}
                  {course.isNew && <span className="mini-badge new-badge">New</span>}
                  {course.isFree && <span className="mini-badge free-badge">Free</span>}
                  {!course.isBestseller && !course.isNew && !course.isFree && <span style={{ color: 'var(--adm-accent)', fontSize: '0.75rem' }}>Active</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Messages summary */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Messages {unreadMessages > 0 && <span className="unread-badge">{unreadMessages}</span>}</h3>
            <Link to="/admin/messages" className="admin-link">View All →</Link>
          </div>
          {totalMessages === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--adm-text3)', fontSize: '0.875rem' }}>
              No messages yet. Contact form submissions will appear here.
            </div>
          ) : (
            <div style={{ padding: '1rem', color: 'var(--adm-text2)', fontSize: '0.875rem' }}>
              <p>📩 <strong>{totalMessages}</strong> total messages</p>
              {unreadMessages > 0 && <p style={{ color: '#60A5FA', marginTop: '0.5rem' }}>🔵 <strong>{unreadMessages}</strong> unread — <Link to="/admin/messages" className="admin-link">read now</Link></p>}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="admin-card-header"><h3>Quick Actions</h3></div>
        <div className="quick-actions">
          <Link to="/admin/courses" className="quick-action"><span>➕</span> Add New Course</Link>
          <Link to="/admin/packs" className="quick-action"><span>📦</span> Manage Packs</Link>
          <Link to="/admin/messages" className="quick-action"><span>💬</span> Check Messages</Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="quick-action"><span>🌐</span> Preview Site</a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
