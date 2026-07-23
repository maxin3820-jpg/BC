import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { courses as localCourses } from '../../data/courses'
import { packs as localPacks } from '../../data/packs'
import { mapCourse } from '../../hooks/useCourses'
import { mapPack } from '../../hooks/usePacks'

const AdminAnalytics = () => {
  const [courses, setCourses] = useState([])
  const [packs, setPacks] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!supabase) {
        setCourses(localCourses)
        setPacks(localPacks)
        setLoading(false)
        return
      }
      try {
        const [coursesRes, packsRes, msgRes] = await Promise.all([
          supabase.from('courses').select('*').order('sort_order', { ascending: true }),
          supabase.from('packs').select('*').order('sort_order', { ascending: true }),
          supabase.from('messages').select('id, is_read, created_at, label'),
        ])

        if (!coursesRes.error && coursesRes.data?.length)
          setCourses(coursesRes.data.map(mapCourse))
        else setCourses(localCourses)

        if (!packsRes.error && packsRes.data?.length)
          setPacks(packsRes.data.map(mapPack))
        else setPacks(localPacks)

        if (!msgRes.error && msgRes.data)
          setMessages(msgRes.data)
      } catch {
        setCourses(localCourses)
        setPacks(localPacks)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Derived stats ─────────────────────────────────────────────────────────
  const activeCourses   = courses.filter(c => c.isActive !== false)
  const hiddenCourses   = courses.filter(c => c.isActive === false)
  const freeCourses     = courses.filter(c => c.isFree)
  const paidCourses     = courses.filter(c => !c.isFree)
  const bestsellers     = courses.filter(c => c.isBestseller)
  const newCourses      = courses.filter(c => c.isNew)

  const activePacks     = packs.filter(p => p.isActive !== false)
  const hiddenPacks     = packs.filter(p => p.isActive === false)

  const totalMessages   = messages.length
  const unreadMessages  = messages.filter(m => !m.is_read).length
  const readMessages    = messages.filter(m => m.is_read).length

  // Messages by label
  const labelCounts = {
    Interested: messages.filter(m => m.label === 'Interested').length,
    Purchased:  messages.filter(m => m.label === 'Purchased').length,
    Support:    messages.filter(m => m.label === 'Support').length,
    Spam:       messages.filter(m => m.label === 'Spam').length,
    Unlabelled: messages.filter(m => !m.label).length,
  }

  // Messages per day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.toISOString().split('T')[0],
      count: 0,
    }
  })

  messages.forEach(m => {
    const day = m.created_at?.split('T')[0]
    const slot = last7Days.find(d => d.date === day)
    if (slot) slot.count++
  })

  const maxMsgCount = Math.max(...last7Days.map(d => d.count), 1)

  // Course price range
  const paidPrices = paidCourses.map(c => c.price).filter(Boolean)
  const minPrice = paidPrices.length ? Math.min(...paidPrices) : 0
  const maxPrice = paidPrices.length ? Math.max(...paidPrices) : 0
  const maxCoursePrice = Math.max(...activeCourses.map(c => c.price || 0), 1)

  const kpiCards = [
    { label: 'Active Courses',   value: activeCourses.length,  icon: '📚', color: '#1E3A8A', sub: `${hiddenCourses.length} hidden` },
    { label: 'Active Packs',     value: activePacks.length,    icon: '📦', color: '#1D4ED8', sub: `${hiddenPacks.length} hidden` },
    { label: 'Total Messages',   value: totalMessages,          icon: '💬', color: '#C88A00', sub: `${unreadMessages} unread` },
    { label: 'Free Courses',     value: freeCourses.length,     icon: '🎁', color: '#2DC49A', sub: `${paidCourses.length} paid` },
    { label: 'Bestsellers',      value: bestsellers.length,     icon: '⭐', color: '#F59E0B', sub: `${newCourses.length} marked new` },
    { label: 'Messages Read',    value: readMessages,           icon: '✅', color: '#22C55E', sub: `${unreadMessages} pending` },
  ]

  return (
    <div className="admin-analytics">
      <div className="admin-section-title">
        <div>
          <h2>Analytics</h2>
          <p>Real data from your platform — live from Supabase.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.75rem' }}>
        {kpiCards.map((stat, i) => (
          <div key={i} className="admin-stat-card">
            <div className="asc-left">
              <p className="asc-label">{stat.label}</p>
              <h3 className="asc-value">{loading ? '…' : stat.value}</h3>
              <span className="asc-change">{stat.sub}</span>
            </div>
            <div className="asc-icon" style={{ background: stat.color + '20', color: stat.color }}>{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="analytics-two-col">

        {/* Messages last 7 days */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Messages — Last 7 Days</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--adm-text3)' }}>{totalMessages} total</span>
          </div>
          {totalMessages === 0 && !loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--adm-text3)', fontSize: '0.875rem' }}>
              No messages yet. Contact form submissions will appear here.
            </div>
          ) : (
            <div className="bar-chart">
              {last7Days.map((d, i) => (
                <div key={i} className="bar-item">
                  <div className="bar-wrapper">
                    <div
                      className="bar"
                      style={{
                        height: `${Math.max(4, (d.count / maxMsgCount) * 160)}px`,
                        background: d.count > 0
                          ? 'linear-gradient(to top, #1E3A8A, #1D4ED8)'
                          : 'var(--adm-border)',
                      }}
                    >
                      {d.count > 0 && <span className="bar-value">{d.count}</span>}
                    </div>
                  </div>
                  <span className="bar-label">{d.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages by Label */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Messages by Label</h3>
          </div>
          <div className="analytics-labels">
            {[
              { key: 'Interested', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
              { key: 'Purchased',  color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
              { key: 'Support',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
              { key: 'Spam',       color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
              { key: 'Unlabelled', color: 'var(--adm-text3)', bg: 'var(--adm-surface)' },
            ].map(({ key, color, bg }) => (
              <div key={key} className="analytics-label-row">
                <div className="alr-left">
                  <span className="alr-dot" style={{ background: color }} />
                  <span className="alr-name">{key}</span>
                </div>
                <div className="alr-bar-wrap">
                  <div className="alr-bar" style={{
                    width: totalMessages ? `${(labelCounts[key] / totalMessages) * 100}%` : '0%',
                    background: color,
                    opacity: 0.7,
                  }} />
                </div>
                <span className="alr-count" style={{ color }}>{loading ? '…' : labelCounts[key]}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Course Breakdown */}
      <div className="admin-card" style={{ marginTop: '1.5rem' }}>
        <div className="admin-card-header">
          <h3>Course Breakdown</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--adm-text3)' }}>
            Price range: {paidCourses.length ? `PKR ${minPrice} – PKR ${maxPrice}` : 'No paid courses'}
          </span>
        </div>
        {loading ? (
          <p style={{ padding: '1rem', color: 'var(--adm-text3)', fontSize: '0.875rem' }}>Loading...</p>
        ) : activeCourses.length === 0 ? (
          <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--adm-text3)', fontSize: '0.875rem' }}>No active courses.</p>
        ) : (
          <div className="category-breakdown">
            {activeCourses.map(course => (
              <div key={course.id} className="cb-row">
                <span className="cb-name">
                  {course.isFree && <span className="mini-badge free-badge" style={{ marginRight: '0.4rem' }}>Free</span>}
                  {course.isBestseller && <span className="mini-badge bestseller" style={{ marginRight: '0.4rem' }}>⭐</span>}
                  {course.title}
                </span>
                <div className="cb-bar-wrap">
                  <div className="cb-bar" style={{
                    width: course.isFree ? '15%' : `${Math.max(10, (course.price / maxCoursePrice) * 100)}%`,
                    background: course.isFree
                      ? 'linear-gradient(to right, #1D4ED8, #2D52B8)'
                      : 'linear-gradient(to right, #1E3A8A, #1D4ED8)',
                  }} />
                </div>
                <span className="cb-pct">{course.isFree ? 'Free' : `PKR ${course.price}`}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Packs Summary */}
      <div className="admin-card" style={{ marginTop: '1.5rem' }}>
        <div className="admin-card-header">
          <h3>Packs Summary</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--adm-text3)' }}>{activePacks.length} active</span>
        </div>
        {loading ? (
          <p style={{ padding: '1rem', color: 'var(--adm-text3)', fontSize: '0.875rem' }}>Loading...</p>
        ) : activePacks.length === 0 ? (
          <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--adm-text3)', fontSize: '0.875rem' }}>No active packs.</p>
        ) : (
          <div className="category-breakdown">
            {activePacks.map(pack => {
              const maxPackPrice = Math.max(...activePacks.map(p => p.price || 0), 1)
              return (
                <div key={pack.id} className="cb-row">
                  <span className="cb-name">
                    {pack.badge && <span className="mini-badge new-badge" style={{ marginRight: '0.4rem' }}>{pack.badge}</span>}
                    {pack.title}
                  </span>
                  <div className="cb-bar-wrap">
                    <div className="cb-bar" style={{
                      width: `${Math.max(10, (pack.price / maxPackPrice) * 100)}%`,
                      background: 'linear-gradient(to right, #2DC49A, #1D4ED8)',
                    }} />
                  </div>
                  <span className="cb-pct">PKR {pack.price}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

export default AdminAnalytics
