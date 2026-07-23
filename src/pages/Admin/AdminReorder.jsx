import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { courses as localCourses } from '../../data/courses'
import { packs as localPacks } from '../../data/packs'
import { mapCourse } from '../../hooks/useCourses'
import { mapPack } from '../../hooks/usePacks'

const DragList = ({ items, setItems, onSave, saving, type }) => {
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)
  const [draggingIdx, setDraggingIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)

  const handleDragStart = (i) => {
    dragItem.current = i
    setDraggingIdx(i)
  }

  const handleDragEnter = (i) => {
    dragOverItem.current = i
    setOverIdx(i)
  }

  const handleDragEnd = () => {
    const from = dragItem.current
    const to = dragOverItem.current
    if (from !== null && to !== null && from !== to) {
      const next = [...items]
      const dragged = next.splice(from, 1)[0]
      next.splice(to, 0, dragged)
      setItems(next)
    }
    dragItem.current = null
    dragOverItem.current = null
    setDraggingIdx(null)
    setOverIdx(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault() // allow drop
  }

  // Touch support
  const touchStartY = useRef(null)
  const touchStartIdx = useRef(null)

  const handleTouchStart = (e, i) => {
    touchStartY.current = e.touches[0].clientY
    touchStartIdx.current = i
    setDraggingIdx(i)
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    const y = e.touches[0].clientY
    const elements = document.querySelectorAll('.reorder-item')
    let targetIdx = null
    elements.forEach((el, idx) => {
      const rect = el.getBoundingClientRect()
      if (y >= rect.top && y <= rect.bottom) targetIdx = idx
    })
    if (targetIdx !== null) {
      dragOverItem.current = targetIdx
      setOverIdx(targetIdx)
    }
  }

  const handleTouchEnd = () => {
    handleDragEnd()
    touchStartY.current = null
    touchStartIdx.current = null
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--adm-text3)', fontSize: '0.875rem' }}>
        No {type} found.
      </div>
    )
  }

  return (
    <div className="reorder-list">
      <div className="reorder-hint">
        <span>☰</span> Drag to reorder — click Save when done
      </div>

      {items.map((item, i) => (
        <div
          key={item.id}
          className={`reorder-item
            ${item.isActive === false ? 'reorder-hidden' : ''}
            ${draggingIdx === i ? 'reorder-dragging' : ''}
            ${overIdx === i && draggingIdx !== i ? 'reorder-over' : ''}
          `}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragEnter={() => handleDragEnter(i)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onTouchStart={(e) => handleTouchStart(e, i)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag handle */}
          <div className="reorder-handle" title="Drag to reorder">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

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
        </div>
      ))}

      <div className="reorder-save-bar">
        <p style={{ fontSize: '0.8rem', color: 'var(--adm-text3)' }}>
          {items.length} {type} — drag to reorder, save when done
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

  const saveCourseOrder = async () => {
    setSavingCourses(true)
    try {
      if (supabase) {
        await Promise.all(courses.map((c, i) =>
          supabase.from('courses').update({ sort_order: i + 1 }).eq('id', c.id)
        ))
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
        await Promise.all(packs.map((p, i) =>
          supabase.from('packs').update({ sort_order: i + 1 }).eq('id', p.id)
        ))
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
          <p>Drag and drop to control the order courses and packs appear on your website.</p>
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
          <DragList
            items={courses}
            setItems={setCourses}
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
          <DragList
            items={packs}
            setItems={setPacks}
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
