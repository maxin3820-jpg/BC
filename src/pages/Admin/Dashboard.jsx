import React from 'react'
import { Link } from 'react-router-dom'
import { courses } from '../../data/courses'

const statCards = [
  { label: 'Total Courses', value: courses.length, icon: '📚', color: '#1E3A8A', change: 'On your platform' },
  { label: 'Free Courses', value: courses.filter(c => c.isFree).length, icon: '🎁', color: '#2DC49A', change: 'Available for free' },
  { label: 'Paid Courses', value: courses.filter(c => !c.isFree).length, icon: '💰', color: '#1D4ED8', change: 'Premium courses' },
  { label: 'New Courses', value: courses.filter(c => c.isNew).length, icon: '✨', color: '#C88A00', change: 'Recently added' },
]

const recentActivity = [
  { text: 'New WhatsApp inquiry for Web Development Bootcamp', time: '2 min ago', icon: '💬' },
  { text: 'New contact message received', time: '1 hour ago', icon: '📩' },
  { text: 'Course "React & Next.js" viewed 24 times today', time: '3 hours ago', icon: '👁' },
  { text: 'New inquiry for Python Data Science course', time: '5 hours ago', icon: '💬' },
  { text: 'Site visited from 12 new countries today', time: '8 hours ago', icon: '🌍' },
]

const Dashboard = () => {
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
              <h3 className="asc-value">{stat.value}</h3>
              <span className="asc-change">{stat.change}</span>
            </div>
            <div className="asc-icon" style={{ background: stat.color + '20', color: stat.color }}>
              {stat.icon}
            </div>
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
              <span>Course</span>
              <span>Price</span>
              <span>Status</span>
            </div>
            {courses.map(course => (
              <div key={course.id} className="admin-table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                <span className="atc-title">{course.title}</span>
                <span>{course.isFree ? 'Free' : `PKR ${course.price}`}</span>
                <span>
                  {course.isBestseller && <span className="mini-badge bestseller">⭐</span>}
                  {course.isNew && <span className="mini-badge new-badge">New</span>}
                  {course.isFree && <span className="mini-badge free-badge">Free</span>}
                  {!course.isBestseller && !course.isNew && !course.isFree && <span style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>Active</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Recent Activity</h3>
            <span className="admin-badge-live">● Live</span>
          </div>
          <div className="activity-list">
            {recentActivity.map((a, i) => (
              <div key={i} className="activity-item">
                <span className="activity-icon">{a.icon}</span>
                <div className="activity-body">
                  <p>{a.text}</p>
                  <span>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="admin-card-header"><h3>Quick Actions</h3></div>
        <div className="quick-actions">
          <Link to="/admin/courses" className="quick-action"><span>➕</span> Add New Course</Link>
          <Link to="/admin/messages" className="quick-action"><span>💬</span> Check Messages</Link>
          <Link to="/admin/settings" className="quick-action"><span>⚙️</span> Site Settings</Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="quick-action"><span>🌐</span> Preview Site</a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
