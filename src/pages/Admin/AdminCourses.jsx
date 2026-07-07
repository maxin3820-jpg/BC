import React, { useState, useRef } from 'react'
import { courses as initialCourses } from '../../data/courses'

const emptyForm = {
  title: '', description: '', price: '', originalPrice: '',
  currency: 'PKR', thumbnail: '', isBestseller: false, isNew: false, isFree: false,
}

const AdminCourses = () => {
  const [courses, setCourses] = useState(initialCourses)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [toast, setToast] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
      setForm(p => ({ ...p, thumbnail: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const openAdd = () => {
    setForm(emptyForm)
    setImagePreview('')
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (course) => {
    setForm({
      ...course,
      price: course.price?.toString() || '',
      originalPrice: course.originalPrice?.toString() || '',
    })
    setImagePreview(course.thumbnail?.startsWith('data:') || course.thumbnail?.startsWith('http') ? course.thumbnail : '')
    setEditingId(course.id)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.title.trim()) return
    if (editingId) {
      setCourses(prev => prev.map(c => c.id === editingId ? {
        ...c, ...form,
        price: parseFloat(form.price) || 0,
        originalPrice: parseFloat(form.originalPrice) || null,
        currency: form.currency || 'PKR',
      } : c))
      showToast('✅ Course updated successfully!')
    } else {
      const newCourse = {
        ...form,
        id: Date.now(),
        price: parseFloat(form.price) || 0,
        originalPrice: parseFloat(form.originalPrice) || null,
        currency: form.currency || 'PKR',
        thumbnail: form.thumbnail || 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)',
      }
      setCourses(prev => [newCourse, ...prev])
      showToast('✅ Course added successfully!')
    }
    setShowModal(false)
  }

  const handleDelete = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id))
    setDeleteConfirm(null)
    showToast('🗑 Course deleted.')
  }

  return (
    <div className="admin-courses">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-section-title">
        <div>
          <h2>Courses</h2>
          <p>Manage all courses on your platform.</p>
        </div>
        <button className="admin-btn-primary" onClick={openAdd}>➕ Add Course</button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <input
            className="admin-search"
            type="text"
            placeholder="🔍 Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="admin-count">{filtered.length} courses</span>
        </div>

        <div className="admin-table">
          <div className="admin-table-head">
            <span>Course</span>
            <span>Price</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {filtered.map(course => (
            <div key={course.id} className="admin-table-row">
              <span className="atc-course-cell">
                <div className="atc-thumb">
                  {course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('data:')) ? (
                    <img src={course.thumbnail} alt={course.title} />
                  ) : (
                    <div className="atc-thumb-gradient" style={{ background: course.thumbnail || 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' }} />
                  )}
                </div>
                <div className="atc-info">
                  <div className="atc-title">
                    {course.isBestseller && <span className="mini-badge bestseller">⭐</span>}
                    {course.isNew && <span className="mini-badge new-badge">New</span>}
                    {course.isFree && <span className="mini-badge free-badge">Free</span>}
                    {course.currency && <span className="mini-badge" style={{ background: 'rgba(29,78,216,0.2)', color: '#60A5FA' }}>{course.currency}</span>}
                    {course.title}
                  </div>
                </div>
              </span>
              <span style={{ color: 'var(--adm-text)', fontWeight: 600 }}>{course.isFree ? 'Free' : `${course.currency === 'PKR' ? 'PKR ' : '$'}${course.price}`}</span>
              <span style={{ color: 'var(--adm-accent)', fontSize: '0.8rem', fontWeight: 600 }}>● Active</span>
              <span className="admin-actions">
                <button className="admin-btn-icon edit" onClick={() => openEdit(course)}>✏️</button>
                <button className="admin-btn-icon delete" onClick={() => setDeleteConfirm(course.id)}>🗑</button>
              </span>
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
                <input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Complete Python Bootcamp"
                />
              </div>
              <div className="admin-form-group">
                <label>Short Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief course description..."
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Currency</label>
                  <select
                    value={form.currency}
                    onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                  >
                    <option value="PKR">PKR — Pakistani Rupee</option>
                    <option value="USD">USD — US Dollar</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder={form.currency === 'PKR' ? '2999' : '29.99'}
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Original Price (for discount display)</label>
                <input
                  type="number"
                  value={form.originalPrice}
                  onChange={e => setForm(p => ({ ...p, originalPrice: e.target.value }))}
                  placeholder={form.currency === 'PKR' ? '9999' : '99.99'}
                />
              </div>
              <div className="admin-form-group">
                <label>Course Image</label>
                <div className="image-upload-area" onClick={() => fileInputRef.current.click()}>
                  {imagePreview ? (
                    <div className="image-preview-wrap">
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <div className="image-preview-overlay">
                        <span>🔄 Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="image-upload-placeholder">
                      <span className="upload-icon">📁</span>
                      <strong>Click to upload image</strong>
                      <p>JPG, PNG, WEBP — any size</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                {imagePreview && (
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                    onClick={() => { setImagePreview(''); setForm(p => ({ ...p, thumbnail: '' })) }}
                  >
                    ✕ Remove Image
                  </button>
                )}
              </div>
              <div className="admin-checkboxes">
                <label>
                  <input type="checkbox" checked={form.isBestseller} onChange={e => setForm(p => ({ ...p, isBestseller: e.target.checked }))} />
                  Bestseller
                </label>
                <label>
                  <input type="checkbox" checked={form.isNew} onChange={e => setForm(p => ({ ...p, isNew: e.target.checked }))} />
                  New
                </label>
                <label>
                  <input type="checkbox" checked={form.isFree} onChange={e => setForm(p => ({ ...p, isFree: e.target.checked }))} />
                  Free Course
                </label>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSave}>
                {editingId ? 'Save Changes' : 'Add Course'}
              </button>
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
            <div className="admin-modal-body">
              <p>Are you sure you want to delete this course? This cannot be undone.</p>
            </div>
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
