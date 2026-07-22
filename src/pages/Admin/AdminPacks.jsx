import React, { useState, useRef } from 'react'
import { packs as initialPacks } from '../../data/packs'
import { supabase } from '../../lib/supabase'

const emptyForm = {
  title: '',
  description: '',
  price: '',
  originalPrice: '',
  thumbnail: '',
  badge: '',
  items: '',        // comma-separated string in the form; stored as array
  isBestseller: false,
  isNew: false,
}

const AdminPacks = () => {
  const [packs, setPacks] = useState(initialPacks)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [toast, setToast] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const fileInputRef = useRef(null)

  // ── helpers ──────────────────────────────────────────────────────────────

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const itemsStringToArray = (str) =>
    str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

  const itemsArrayToString = (arr) =>
    Array.isArray(arr) ? arr.join(', ') : arr || ''

  const resolveBadge = (f) => {
    if (f.badge) return f.badge
    if (f.isBestseller) return 'Bestseller'
    if (f.isNew) return 'New'
    return null
  }

  // ── image upload ─────────────────────────────────────────────────────────

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)

    setImageUploading(true)
    try {
      if (!supabase) throw new Error('Supabase not configured')
      const ext = file.name.split('.').pop()
      const fileName = `pack-${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('pack-images')
        .upload(fileName, file, { upsert: true })

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from('pack-images').getPublicUrl(fileName)

      setForm((p) => ({ ...p, thumbnail: publicUrl }))
      showToast('🖼 Image uploaded to Supabase!')
    } catch (err) {
      console.warn('Supabase upload failed, using local preview:', err.message)
      const reader2 = new FileReader()
      reader2.onloadend = () =>
        setForm((p) => ({ ...p, thumbnail: reader2.result }))
      reader2.readAsDataURL(file)
    } finally {
      setImageUploading(false)
    }
  }

  // ── open modals ───────────────────────────────────────────────────────────

  const openAdd = () => {
    setForm(emptyForm)
    setImagePreview('')
    setImageUploading(false)
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (pack) => {
    setForm({
      ...pack,
      price: pack.price?.toString() || '',
      originalPrice: pack.originalPrice?.toString() || '',
      items: itemsArrayToString(pack.items),
      badge: pack.badge || '',
      isBestseller: pack.badge === 'Bestseller',
      isNew: pack.badge === 'New',
    })
    setImagePreview(
      pack.thumbnail?.startsWith('http') || pack.thumbnail?.startsWith('data:')
        ? pack.thumbnail
        : ''
    )
    setImageUploading(false)
    setEditingId(pack.id)
    setShowModal(true)
  }

  // ── filtered list ─────────────────────────────────────────────────────────

  const filtered = packs.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  // ── save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.title.trim()) return

    const badge = resolveBadge(form)
    const itemsArray = itemsStringToArray(form.items)

    const payload = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price) || 0,
      original_price: parseFloat(form.originalPrice) || null,
      currency: 'PKR',
      thumbnail:
        form.thumbnail ||
        'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)',
      badge,
      items: itemsArray,
    }

    const localShape = {
      id: editingId || Date.now(),
      title: payload.title,
      description: payload.description,
      price: payload.price,
      originalPrice: payload.original_price,
      currency: payload.currency,
      thumbnail: payload.thumbnail,
      badge: payload.badge,
      items: payload.items,
    }

    try {
      if (editingId) {
        if (supabase)
          await supabase.from('packs').update(payload).eq('id', editingId)
        setPacks((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, ...localShape } : p))
        )
        showToast('✅ Pack updated!')
      } else {
        let newPack = localShape
        if (supabase) {
          const { data } = await supabase
            .from('packs')
            .insert([payload])
            .select()
            .single()
          if (data)
            newPack = {
              id: data.id,
              title: data.title,
              description: data.description,
              price: data.price,
              originalPrice: data.original_price,
              currency: data.currency,
              thumbnail: data.thumbnail,
              badge: data.badge,
              items: data.items || [],
            }
        }
        setPacks((prev) => [newPack, ...prev])
        showToast('✅ Pack added!')
      }
    } catch {
      if (editingId) {
        setPacks((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, ...localShape } : p))
        )
      } else {
        setPacks((prev) => [localShape, ...prev])
      }
      showToast('✅ Saved locally (Supabase not connected)')
    }

    setShowModal(false)
  }

  // ── delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    try {
      if (supabase) await supabase.from('packs').delete().eq('id', id)
    } catch {
      /* offline fallback */
    }
    setPacks((prev) => prev.filter((p) => p.id !== id))
    setDeleteConfirm(null)
    showToast('🗑 Pack deleted.')
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="admin-courses">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-section-title">
        <div>
          <h2>Packs</h2>
          <p>Manage all digital product packs on your platform.</p>
        </div>
        <button className="admin-btn-primary" onClick={openAdd}>
          ➕ Add Pack
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <input
            className="admin-search"
            type="text"
            placeholder="🔍 Search packs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="admin-count">{filtered.length} packs</span>
        </div>

        {/* ── Desktop table ── */}
        <div className="admin-table courses-desktop-table">
          <div className="admin-table-head">
            <span>Pack</span>
            <span>Price</span>
            <span>Badge</span>
            <span>Actions</span>
          </div>

          {filtered.map((pack) => (
            <div key={pack.id} className="admin-table-row">
              {/* thumbnail + title */}
              <span className="atc-course-cell">
                <div className="atc-thumb">
                  {pack.thumbnail &&
                  (pack.thumbnail.startsWith('http') ||
                    pack.thumbnail.startsWith('data:')) ? (
                    <img src={pack.thumbnail} alt={pack.title} />
                  ) : (
                    <div
                      className="atc-thumb-gradient"
                      style={{
                        background:
                          pack.thumbnail ||
                          'linear-gradient(135deg, #1E3A8A, #1D4ED8)',
                      }}
                    />
                  )}
                </div>
                <div className="atc-info">
                  <div className="atc-title">
                    {pack.badge === 'Bestseller' && (
                      <span className="mini-badge bestseller">⭐</span>
                    )}
                    {pack.badge === 'New' && (
                      <span className="mini-badge new-badge">New</span>
                    )}
                    {pack.title}
                  </div>
                  {pack.items?.length > 0 && (
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--adm-text3)',
                        marginTop: '0.2rem',
                      }}
                    >
                      {pack.items.slice(0, 2).join(' · ')}
                      {pack.items.length > 2 &&
                        ` +${pack.items.length - 2} more`}
                    </div>
                  )}
                </div>
              </span>

              {/* price */}
              <span style={{ color: 'var(--adm-text)', fontWeight: 600 }}>
                PKR {pack.price}
              </span>

              {/* badge */}
              <span>
                {pack.badge ? (
                  <span
                    className={`mini-badge ${
                      pack.badge === 'Bestseller'
                        ? 'bestseller'
                        : pack.badge === 'New'
                        ? 'new-badge'
                        : ''
                    }`}
                  >
                    {pack.badge}
                  </span>
                ) : (
                  <span style={{ color: 'var(--adm-text3)', fontSize: '0.75rem' }}>
                    —
                  </span>
                )}
              </span>

              {/* actions */}
              <span className="admin-actions">
                <button
                  className="admin-btn-icon edit"
                  onClick={() => openEdit(pack)}
                >
                  ✏️
                </button>
                <button
                  className="admin-btn-icon delete"
                  onClick={() => setDeleteConfirm(pack.id)}
                >
                  🗑
                </button>
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--adm-text3)',
                padding: '2rem',
                fontSize: '0.875rem',
              }}
            >
              No packs found.
            </p>
          )}
        </div>

        {/* ── Mobile cards ── */}
        <div className="courses-mobile-cards">
          {filtered.map((pack) => (
            <div key={pack.id} className="course-mobile-card">
              {/* header */}
              <div className="cmc-header">
                <div className="cmc-thumb">
                  {pack.thumbnail &&
                  (pack.thumbnail.startsWith('http') ||
                    pack.thumbnail.startsWith('data:')) ? (
                    <img src={pack.thumbnail} alt={pack.title} />
                  ) : (
                    <div
                      className="cmc-thumb-bg"
                      style={{
                        background:
                          pack.thumbnail ||
                          'linear-gradient(135deg, #1E3A8A, #1D4ED8)',
                      }}
                    />
                  )}
                </div>
                <div className="cmc-info">
                  <div className="cmc-badges">
                    {pack.badge === 'Bestseller' && (
                      <span className="mini-badge bestseller">⭐ Best</span>
                    )}
                    {pack.badge === 'New' && (
                      <span className="mini-badge new-badge">New</span>
                    )}
                  </div>
                  <div className="cmc-title">{pack.title}</div>
                </div>
              </div>

              {/* meta */}
              <div className="cmc-meta">
                <div className="cmc-meta-item">
                  <span className="cmc-meta-label">Price</span>
                  <span className="cmc-meta-value">PKR {pack.price}</span>
                </div>
                {pack.originalPrice && (
                  <div className="cmc-meta-item">
                    <span className="cmc-meta-label">Original</span>
                    <span
                      className="cmc-meta-value"
                      style={{
                        textDecoration: 'line-through',
                        color: 'var(--adm-text3)',
                      }}
                    >
                      PKR {pack.originalPrice}
                    </span>
                  </div>
                )}
                {pack.items?.length > 0 && (
                  <div className="cmc-meta-item">
                    <span className="cmc-meta-label">Items</span>
                    <span className="cmc-meta-value">{pack.items.length} included</span>
                  </div>
                )}
              </div>

              {/* actions */}
              <div className="cmc-actions">
                <button
                  className="cmc-btn cmc-btn-edit"
                  onClick={() => openEdit(pack)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="cmc-btn cmc-btn-delete"
                  onClick={() => setDeleteConfirm(pack.id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--adm-text3)',
                padding: '2rem',
                fontSize: '0.875rem',
              }}
            >
              No packs found.
            </p>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>{editingId ? 'Edit Pack' : 'Add New Pack'}</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="admin-modal-body">
              {/* title */}
              <div className="admin-form-group">
                <label>Pack Title *</label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Ultimate Design Bundle"
                />
              </div>

              {/* description */}
              <div className="admin-form-group">
                <label>Short Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Brief pack description..."
                />
              </div>

              {/* price row */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Price (PKR)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, price: e.target.value }))
                    }
                    placeholder="2999"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Original Price (PKR)</label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, originalPrice: e.target.value }))
                    }
                    placeholder="8999"
                  />
                </div>
              </div>

              {/* items */}
              <div className="admin-form-group">
                <label>What's Included (comma-separated)</label>
                <textarea
                  rows={2}
                  value={form.items}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, items: e.target.value }))
                  }
                  placeholder="50+ Figma Templates, 500+ Icons Pack, 20 UI Kits"
                />
              </div>

              {/* badge */}
              <div className="admin-form-group">
                <label>Badge Label</label>
                <input
                  value={form.badge}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, badge: e.target.value }))
                  }
                  placeholder="e.g. Bestseller, New, Hot Deal — leave blank for none"
                />
              </div>

              {/* image */}
              <div className="admin-form-group">
                <label>Pack Image</label>
                <div
                  className="image-upload-area"
                  onClick={() =>
                    !imageUploading && fileInputRef.current.click()
                  }
                >
                  {imageUploading ? (
                    <div className="image-upload-placeholder">
                      <span className="upload-icon">⏳</span>
                      <strong>Uploading to Supabase...</strong>
                      <p>Please wait</p>
                    </div>
                  ) : imagePreview ? (
                    <div className="image-preview-wrap">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="image-preview"
                      />
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
                    style={{
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.75rem',
                    }}
                    onClick={() => {
                      setImagePreview('')
                      setForm((p) => ({ ...p, thumbnail: '' }))
                    }}
                  >
                    ✕ Remove Image
                  </button>
                )}
              </div>

              {/* checkboxes */}
              <div className="admin-checkboxes">
                <label>
                  <input
                    type="checkbox"
                    checked={form.isBestseller}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        isBestseller: e.target.checked,
                        badge: e.target.checked ? 'Bestseller' : p.isNew ? 'New' : '',
                      }))
                    }
                  />
                  Bestseller
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        isNew: e.target.checked,
                        badge: e.target.checked ? 'New' : p.isBestseller ? 'Bestseller' : '',
                      }))
                    }
                  />
                  New
                </label>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                className="admin-btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="admin-btn-primary" onClick={handleSave}>
                {editingId ? 'Save Changes' : 'Add Pack'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div
          className="admin-modal-overlay"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="admin-modal admin-modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>Delete Pack</h3>
              <button onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p>
                Are you sure you want to delete this pack? This cannot be
                undone.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                className="admin-btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="admin-btn-danger"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPacks
