import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { courses as localCourses } from '../../data/courses'
import { packs as localPacks } from '../../data/packs'
import { mapCourse } from '../../hooks/useCourses'
import { mapPack } from '../../hooks/usePacks'

const ReorderList = ({ items, onMoveUp, onMoveDown, onSave, saving, type }) => {
  if (items.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--adm-text3)', fontSize: '0.875rem' }}>
        No {type} found.
      </div>
    )
  }

  return (
    <div className="reorder-list">
      {items.map((item, i) => (
        <div key={item.id} className={`reorder-item ${item.isActive === false ? 'reorder-hidden' : ''}`}>
          {/* Position number */}
          <div className="reorder-pos">{i + 1}</div>

          {/* Thumbnail */}
          <div className="reorder-thumb">
            {item.thumbnail && (item.thumbnail.startsWith('http') || item.thumbnail.startsWith('data:'))
              ? <img src={item.thumbnail} alt={item.title} />
              : <div className="reorder-thumb-bg" style={{ background: item.thumbnail || 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' }} />
            }
          </div>

          {/* Info */}
          <div className="reorder-info">
            <div className="reorder-title">
              {item.isBestseller && <span className="mini-badge bestseller">⭐</span>}
              {item.isNew && <span className="mini-badge new-badge">New</span>}
              {item.isFree && <span className="mini-badge free-badge">Free</span>}
              {item.badge && <span className="mini-badge new-badge">{item.badge}</span>}
              {item.isActive === false && <span className="mini-badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>Hidden</span>}
              <span className="reorder-name">{item.title}</span>
            </div>
            <div className="reorder-meta">
              {item.isFree ? 'Free' : `PKR ${item.price}`}
            </div>
          </div>

          {/* Move buttons */}
          <div className="reorder-btns">
            <button
              className="reorder-btn"
              onClick={() => onMoveUp(i)}
              disabled={i === 0}
              title="Move Up"
              aria-label="Move up"
            >
              ▲
            </button>
            <button
              className="reorder-btn"
              onClick={() => onMoveDown(i)}
              disabled={i === items.length - 1}
              title="Move Down"
              aria-label="Move down"
            >
              ▼
            </button>
          </div>
        </div>
      ))}

      <div className="reorder-save-bar">
        <p style={{ fontSize: '0.8rem', color: 'var(--adm-text3)' }}>
          ↑ ↓ to reorder — click Save when done
        </p>
        <button className="admin-btn-primary" onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Order'}
        </button>
      </div>
    </div>
  )
}

const AdminReorder = () => {
  const [courses, setCourses] = useState([])
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingCourses, setSavingCourses] = useState(false)
  const [savingPacks, setSavingPacks] = useState(false)
  const [toast, setToast] = useState('')
  const [tab, setTab] = useState('courses')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    const load = async () => {
      if (!supabase) {
        setCourses(localCourses)
        setPacks(localPacks)
        setLoading(false)
        return
      }
      try {
        const [coursesRes, packsRes] = await Promise.all([
          supabase.from('courses').select('*').order('sort_order', { ascending: true }),
          supabase.from('packs').select('*').order('sort_order', { ascending: true }),
        ])
        if (!coursesRes.error && coursesRes.data?.length)
          setCourses(coursesRes.data.map(mapCourse))
        else setCourses(localCourses)

        if (!packsRes.error && packsRes.data?.length)
          setPacks(packsRes.data.map(mapPack))
        else setPacks(localPacks)
      } catch {
        setCourses(localCourses)
        setPacks(localPacks)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Move helpers ──────────────────────────────────────────────────────────
  const moveUp = (list, setList, i) => {
    if (i === 0) return
    const next = [...list]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    setList(next)
  }

  const moveDown = (list, setList, i) => {
    if (i === list.length - 1) return
    const next = [...list]
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    setList(next)
  }

  // ── Save order to Supabase ────────────────────────────────────────────────
  const saveCourseOrder = async () => {
    setSavingCourses(true)
    try {
      if (supabase) {
        const updates = courses.map((c, i) =>
          supabase.from('courses').update({ sort_order: i + 1 }).eq('id', c.id)
        )
        await Promise.all(updates)
        showToast('✅ Course order saved! Website updated instantly.')
      } else {
        showToast('✅ Order saved locally (Supabase not connected)')
      }
    } catch {
      showToast('❌ Failed to save order')
    } finally {
      setSavingCourses(false)
    }
  }

  const savePackOrder = async () => {
    setSavingPacks(true)
    try {
      if (supabase) {
        const updates = packs.map((p, i) =>
          supabase.from('packs').update({ sort_order: i + 1 }).eq('id', p.id)
        )
        await Promise.all(updates)
        showToast('✅ Pack order saved! Website updated instantly.')
      } else {
        showToast('✅ Order saved locally (Supabase not connected)')
      }
    } catch {
      showToast('❌ Failed to save order')
    } finally {
      setSavingPacks(false)
    }
  }

  if (loading) return <div style={{ padding: '2rem', color: 'var(--adm-text2)' }}>Loading...</div>

  return (
    <div className="admin-courses">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-section-title">
        <div>
          <h2>Reorder</h2>
          <p>Control the display order of courses and packs on your website.</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="reorder-tabs">
        <button
          className={`reorder-tab-btn ${tab === 'courses' ? 'active' : ''}`}
          onClick={() => setTab('courses')}
        >
          📚 Courses
          <span className="vtab-count">{courses.length}</span>
        </button>
        <button
          className={`reorder-tab-btn ${tab === 'packs' ? 'active' : ''}`}
          onClick={() => setTab('packs')}
        >
          📦 Packs
          <span className="vtab-count">{packs.length}</span>
        </button>
      </div>

      {tab === 'courses' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3>Course Order</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--adm-text3)', marginTop: '0.2rem' }}>
                Position 1 appears first on the website.
              </p>
            </div>
          </div>
          <ReorderList
            items={courses}
            onMoveUp={(i) => moveUp(courses, setCourses, i)}
            onMoveDown={(i) => moveDown(courses, setCourses, i)}
            onSave={saveCourseOrder}
            saving={savingCourses}
            type="courses"
          />
        </div>
      )}

      {tab === 'packs' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3>Pack Order</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--adm-text3)', marginTop: '0.2rem' }}>
                Position 1 appears first on the website.
              </p>
            </div>
          </div>
          <ReorderList
            items={packs}
            onMoveUp={(i) => moveUp(packs, setPacks, i)}
            onMoveDown={(i) => moveDown(packs, setPacks, i)}
            onSave={savePackOrder}
            saving={savingPacks}
            type="packs"
          />
        </div>
      )}
    </div>
  )
}

export default AdminReorder
