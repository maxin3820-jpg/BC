import React from 'react'
import { courses } from '../../data/courses'

const monthlyViews = [
  { month: 'Jan', views: 820 },
  { month: 'Feb', views: 1200 },
  { month: 'Mar', views: 1800 },
  { month: 'Apr', views: 1400 },
  { month: 'May', views: 2200 },
  { month: 'Jun', views: 3100 },
  { month: 'Jul', views: 4200 },
]

const maxViews = Math.max(...monthlyViews.map(d => d.views))

const AdminAnalytics = () => {
  const paidCourses = courses.filter(c => !c.isFree)
  const freeCourses = courses.filter(c => c.isFree)
  const bestsellers = courses.filter(c => c.isBestseller)
  const newCourses = courses.filter(c => c.isNew)

  return (
    <div className="admin-analytics">
      <div className="admin-section-title">
        <div>
          <h2>Analytics</h2>
          <p>Overview of your platform performance.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="asc-left">
            <p className="asc-label">Total Courses</p>
            <h3 className="asc-value">{courses.length}</h3>
            <span className="asc-change">On platform</span>
          </div>
          <div className="asc-icon" style={{ background: '#1E3A8A20', color: '#1E3A8A' }}>📚</div>
        </div>
        <div className="admin-stat-card">
          <div className="asc-left">
            <p className="asc-label">Paid Courses</p>
            <h3 className="asc-value">{paidCourses.length}</h3>
            <span className="asc-change">Available for purchase</span>
          </div>
          <div className="asc-icon" style={{ background: '#2DC49A20', color: '#2DC49A' }}>💰</div>
        </div>
        <div className="admin-stat-card">
          <div className="asc-left">
            <p className="asc-label">Bestsellers</p>
            <h3 className="asc-value">{bestsellers.length}</h3>
            <span className="asc-change">Top courses</span>
          </div>
          <div className="asc-icon" style={{ background: '#C88A0020', color: '#C88A00' }}>⭐</div>
        </div>
        <div className="admin-stat-card">
          <div className="asc-left">
            <p className="asc-label">Free Courses</p>
            <h3 className="asc-value">{freeCourses.length}</h3>
            <span className="asc-change">No cost to enroll</span>
          </div>
          <div className="asc-icon" style={{ background: '#1D4ED820', color: '#1D4ED8' }}>🎁</div>
        </div>
      </div>

      {/* Monthly Views Chart */}
      <div className="admin-card">
        <div className="admin-card-header"><h3>Monthly Site Views</h3></div>
        <div className="bar-chart">
          {monthlyViews.map((d, i) => (
            <div key={i} className="bar-item">
              <div className="bar-wrapper">
                <div
                  className="bar"
                  style={{
                    height: `${(d.views / maxViews) * 160}px`,
                    background: 'linear-gradient(to top, #1E3A8A, #1D4ED8)',
                  }}
                >
                  <span className="bar-value">{(d.views / 1000).toFixed(1)}k</span>
                </div>
              </div>
              <span className="bar-label">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Course Breakdown */}
      <div className="admin-card">
        <div className="admin-card-header"><h3>Course Breakdown</h3></div>
        <div className="category-breakdown">
          {courses.map((course, i) => {
            const pct = Math.round(((i + 1) / courses.length) * 100)
            return (
              <div key={course.id} className="cb-row">
                <span className="cb-name">{course.title}</span>
                <div className="cb-bar-wrap">
                  <div className="cb-bar" style={{ width: `${100 - i * 12}%` }}></div>
                </div>
                <span className="cb-pct">{course.isFree ? 'Free' : `$${course.price}`}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics
