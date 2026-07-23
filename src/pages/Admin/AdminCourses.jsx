import React, { useState, useEffect, useRef } from 'react'
import { courses as localCourses } from '../../data/courses'
import { supabase } from '../../lib/supabase'
import { mapCourse } from '../../hooks/useCourses'

const emptyForm = {
  title: '', description: '', price: '', originalPrice: '',
  thumbnail: '', isBestseller: false, isNew: false, isFree: false,
}

const AdminCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('all') // 'all' | 'public' | 'hidden'
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [toast, setToast] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const fileInputRef = useRef(null)

  // ── Load ALL courses (including hidden) for admin ─────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!supabase) { setCourses(localCourses); setLoading(false); return }
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('sort_order', { ascending: true })
        setCourses(!error && data?.length ? data.map(mapCourse) : localCourses)
      } catch { setCourses(localCourses) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  // ── Toggle visibility (hide/show) ─────────────────────────────────────────
  const handleToggleVisibility = async (course) => {
    const newActive = !course.isActive
    try {
      if (supabase) {
        await supabase.from('courses').update({ is_active: newActive }).eq('id', course.id)
      }
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, isActive: newActive } : c))
      showToast(newActive ? '✅ Course is now Public' : '🙈 Course is now Hidden')
    } catch {
      showToast('❌ Failed to update visibility')
    }
  }

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
    setImageUploading(true)
    try {
      if (!supabase) throw new Error('no supabase')
      const ext = file.name.split('.').pop()
      const fileName = `course-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('course-images').upload(fileName, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('course-images').getPublicUrl(fileName)
      setForm(p => ({ ...p, thumbnail: publicUrl }))
      showToast('🖼 Image uploaded!')
    } catch (err) {
      console.warn('Upload failed:', err.message)
      const r = new FileReader()
      r.onloadend = () => setForm(p => ({ ...p, thumbnail: r.result }))
      r.readAsDataURL(file)
    } finally { setImageUploading(false) }
  }

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = courses.filter(c => {
    const matchSearch = !search.trim() || 
      c.title.toLowerCase().split(/\s+/).some(() => true) && 
      search.toLowerCase().split(/\s+/).filter(Boolean).every(w => 
        `${c.title} ${c.description || ''}`.toLowerCase().includes(w)
      )
    const matchVisibility =
      visibilityFilter === 'all' ? true :
      visibilityFilter === 'public' ? c.isActive !== false :
      c.isActive === false
    return matchSearch && matchVisibility
  })

  // ── Counts ────────────────────────────────────────────────────────────────
  const publicCount = courses.filter(c => c.isActive !== false).length
  const hiddenCount = courses.filter(c => c.isActive === false).length

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const openAdd = () => {
    setForm(emptyForm); setImagePreview(''); setImageUploading(false)
    setEditingId(null); setShowModal(true)
  }

  const openEdit = (course) => {
    setForm({ ...course, price: course.price?.toString() || '', originalPrice: course.originalPrice?.toString() || '' })
    setImagePreview(course.thumbnail?.startsWith('http') || course.thumbnail?.startsWith('data:') ? course.thumbnail : '')
    setImageUploading(false); setEditingId(course.id); setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    const payload = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price) || 0,
      original_price: parseFloat(form.originalPrice) || null,
      currency: 'PKR',
      thumbnail: form.thumbnail || 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)',
      is_bestseller: form.isBestseller,
      is_new: form.isNew,
      is_free: form.isFree,
      is_active: true,
    }
    const localShape = {
      ...form,
      id: editingId || Date.now(),
      price: payload.price,
      originalPrice: payload.original_price,
      currency: payload.currency,
      thumbnail: payload.thumbnail,
      isBestseller: payload.is_bestseller,
      isNew: payload.is_new,
      isFree: payload.is_free,
      isActive: true,
    }
    try {
      if (editingId) {
        if (supabase) {
          const { data } = await supabase.from('courses').update(payload).eq('id', editingId).select().single()
          if (data) { setCourses(prev => prev.map(c => c.id === editingId ? mapCourse(data) : c)); showToast('✅ Course updated!'); setShowModal(false); return }
        }
        setCourses(prev => prev.map(c => c.id === editingId ? localShape : c))
        showToast('✅ Course updated!')
      } else {
        if (supabase) {
          const { data } = await supabase.from('courses').insert([payload]).select().single()
          if (data) { setCourses(prev => [mapCourse(data), ...prev]); showToast('✅ Course added!'); setShowModal(false); return }
        }
        setCourses(prev => [localShape, ...prev])
        showToast('✅ Course added!')
      }
    } catch {
      if (editingId) setCourses(prev => prev.map(c => c.id === editingId ? localShape : c))
      else setCourses(prev => [localShape, ...prev])
      showToast('✅ Saved locally (Supabase not connected)')
    }
    setShowModal(false)
  }

  const handleDelete = async (id) => {
    try { if (supabase) await supabase.from('courses').delete().eq('id', id) } catch { }
    setCourses(prev => prev.filter(c => c.id !== id))
    setDeleteConfirm(null)
    showToast('🗑 Course deleted.')
  }

  if (loading) return <div style={{ padding: '2rem', color: 'var(--adm-text2)' }}>Loading courses...</div>

  return (
    <div className="admin-courses">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-section-title">
        <div>
          <h2>Courses</h2>
          <p>Manage all courses. Changes reflect on the website instantly.</p>
        </div>
        <button className="admin-btn-primary" onClick={openAdd}>➕ Add Course</button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <input className="admin-search" type="text" placeholder="🔍 Search courses..."
            value={search} onChange={e => setSearch(e.target.value)} />

          {/* Visibility filter tabs */}
          <div className="visibility-tabs">
            <button
              className={`visibility-tab ${visibilityFilter === 'all' ? 'active' : ''}`}
              onClick={() => setVisibilityFilter('all')}
            >
              All <span className="vtab-count">{courses.length}</span>
            </button>
            <button
              className={`visibility-tab public ${visibilityFilter === 'public' ? 'active' : ''}`}
              onClick={() => setVisibilityFilter('public')}
            >
              🟢 Public <span className="vtab-count">{publicCount}</span>
            </button>
            <button
              className={`visibility-tab hidden ${visibilityFilter === 'hidden' ? 'active' : ''}`}
              onClick={() => setVisibilityFilter('hidden')}
            >
              🔴 Hidden <span className="vtab-count">{hiddenCount}</span>
            </button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="admin-table courses-desktop-table">
          <div className="admin-table-head">
            <span>Course</span><span>Price</span><span>Status</span><span>Actions</span>
          </div>
          {filtered.map(course => (
            <div key={course.id} className={`admin-table-row ${course.isActive === false ? 'row-hidden' : ''}`}>
              <span className="atc-course-cell">
                <div className="atc-thumb" style={{ opacity: course.isActive === false ? 0.5 : 1 }}>
                  {course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('data:'))
                    ? <img src={course.thumbnail} alt={course.title} />
                    : <div className="atc-thumb-gradient" style={{ background: course.thumbnail || 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' }} />}
                </div>
                <div className="atc-info">
                  <div className="atc-title">
                    {course.isBestseller && <span className="mini-badge bestseller">⭐</span>}
                    {course.isNew && <span className="mini-badge new-badge">New</span>}
                    {course.isFree && <span className="mini-badge free-badge">Free</span>}
                    {course.isActive === false && <span className="mini-badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>Hidden</span>}
                    {course.title}
                  </div>
                </div>
              </span>
              <span style={{ color: 'var(--adm-text)', fontWeight: 600 }}>{course.isFree ? 'Free' : `PKR ${course.price}`}</span>
              <span style={{
                color: course.isActive === false ? '#EF4444' : 'var(--adm-accent)',
                fontSize: '0.8rem', fontWeight: 600
              }}>
                {course.isActive === false ? '● Hidden' : '● Public'}
              </span>
              <span className="admin-actions">
                <button
                  className="admin-btn-icon"
                  title={course.isActive === false ? 'Make Public' : 'Hide Course'}
                  onClick={() => handleToggleVisibility(course)}
                  style={{ fontSize: '1rem' }}
                >
                  {course.isActive === false ? '👁' : '🙈'}
                </button>
                <button className="admin-btn-icon edit" onClick={() => openEdit(course)}>✏️</button>
                <button className="admin-btn-icon delete" onClick={() => setDeleteConfirm(course.id)}>🗑</button>
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--adm-text3)', padding: '2rem', fontSize: '0.875rem' }}>
              {visibilityFilter === 'hidden' ? 'No hidden courses.' : visibilityFilter === 'public' ? 'No public courses.' : 'No courses found.'}
            </p>
          )}
        </div>

        {/* Mobile cards */}
        <div className="courses-mobile-cards">
          {filtered.map(course => (
            <div key={course.id} className={`course-mobile-card ${course.isActive === false ? 'card-hidden' : ''}`}>
              <div className="cmc-header">
                <div className="cmc-thumb" style={{ opacity: course.isActive === false ? 0.5 : 1 }}>
                  {course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('data:'))
                    ? <img src={course.thumbnail} alt={course.title} />
                    : <div className="cmc-thumb-bg" style={{ background: course.thumbnail || 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' }} />}
                </div>
                <div className="cmc-info">
                  <div className="cmc-badges">
                    {course.isBestseller && <span className="mini-badge bestseller">⭐ Best</span>}
                    {course.isNew && <span className="mini-badge new-badge">New</span>}
                    {course.isFree && <span className="mini-badge free-badge">Free</span>}
                    {course.isActive === false && <span className="mini-badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>Hidden</span>}
                  </div>
                  <div className="cmc-title">{course.title}</div>
                </div>
              </div>
              <div className="cmc-meta">
                <div className="cmc-meta-item">
                  <span className="cmc-meta-label">Price</span>
                  <span className="cmc-meta-value">{course.isFree ? 'Free' : `PKR ${course.price}`}</span>
                </div>
                <div className="cmc-meta-item">
                  <span className="cmc-meta-label">Status</span>
                  <span className="cmc-meta-value" style={{ color: course.isActive === false ? '#EF4444' : '#22C55E', fontWeight: 600 }}>
                    {course.isActive === false ? 'Hidden' : 'Public'}
                  </span>
                </div>
              </div>
              <div className="cmc-actions">
                <button
                  className={`cmc-btn ${course.isActive === false ? 'cmc-btn-show' : 'cmc-btn-hide'}`}
                  onClick={() => handleToggleVisibility(course)}
                >
                  {course.isActive === false ? '👁 Show' : '🙈 Hide'}
                </button>
                <button className="cmc-btn cmc-btn-edit" onClick={() => openEdit(course)}>✏️ Edit</button>
                <button className="cmc-btn cmc-btn-delete" onClick={() => setDeleteConfirm(course.id)}>🗑 Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingId ? 'Edit Course' : 'Add New Course'}</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label>Course Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Complete Python Bootcamp" />
              </div>
              <div className="admin-form-group">
                <label>Short Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief course description..." />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Price (PKR)</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="2999" />
                </div>
                <div className="admin-form-group">
                  <label>Original Price (PKR)</label>
                  <input type="number" value={form.originalPrice} onChange={e => setForm(p => ({ ...p, originalPrice: e.target.value }))} placeholder="9999" />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Course Image</label>
                <div className="image-upload-area" onClick={() => !imageUploading && fileInputRef.current.click()}>
                  {imageUploading ? (
                    <div className="image-upload-placeholder"><span className="upload-icon">⏳</span><strong>Uploading...</strong><p>Please wait</p></div>
                  ) : imagePreview ? (
                    <div className="image-preview-wrap">
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <div className="image-preview-overlay"><span>🔄 Change Image</span></div>
                    </div>
                  ) : (
                    <div className="image-upload-placeholder"><span className="upload-icon">📁</span><strong>Click to upload image</strong><p>JPG, PNG, WEBP</p></div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                {imagePreview && (
                  <button type="button" className="admin-btn-secondary" style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                    onClick={() => { setImagePreview(''); setForm(p => ({ ...p, thumbnail: '' })) }}>
                    ✕ Remove Image
                  </button>
                )}
              </div>
              <div className="admin-checkboxes">
                <label><input type="checkbox" checked={form.isBestseller} onChange={e => setForm(p => ({ ...p, isBestseller: e.target.checked }))} /> Bestseller</label>
                <label><input type="checkbox" checked={form.isNew} onChange={e => setForm(p => ({ ...p, isNew: e.target.checked }))} /> New</label>
                <label><input type="checkbox" checked={form.isFree} onChange={e => setForm(p => ({ ...p, isFree: e.target.checked }))} /> Free Course</label>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSave}>{editingId ? 'Save Changes' : 'Add Course'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal admin-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Delete Course</h3>
              <button onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="admin-modal-body"><p>Are you sure you want to delete this course? This cannot be undone.</p></div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="admin-btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCourses
