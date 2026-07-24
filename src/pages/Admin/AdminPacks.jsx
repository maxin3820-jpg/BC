import React, { useState, useEffect, useRef } from 'react'
import { packs as localPacks } from '../../data/packs'
import { supabase } from '../../lib/supabase'
import { mapPack } from '../../hooks/usePacks'

const emptyForm = {
  title: '', description: '', price: '', originalPrice: '',
  thumbnail: '', badge: '', items: '', isBestseller: false, isNew: false, isFree: false,
}

const AdminPacks = () => {
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [toast, setToast] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const fileInputRef = useRef(null)

  // ── Load from Supabase on mount ───────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!supabase) { 
        console.log('⚠️ No Supabase connection - using local packs')
        setPacks(localPacks); 
        setLoading(false); 
        return 
      }
      try {
        const { data, error } = await supabase
          .from('packs')
          .select('*')
          .order('sort_order', { ascending: true })
        
        if (error) {
          console.error('❌ Supabase error:', error)
        }
        
        if (data) {
          console.log('✅ Loaded packs from Supabase:', data.length)
          console.log('📦 Raw pack data:', data.map(p => ({ title: p.title, is_free: p.is_free })))
        }
        
        setPacks(!error && data?.length ? data.map(mapPack) : localPacks)
      } catch (err) { 
        console.error('❌ Load error:', err)
        setPacks(localPacks) 
      }
      finally { setLoading(false) }
    }
    load()
  }, [])

  // ── Toggle visibility (hide/show) ─────────────────────────────────────────
  const handleToggleVisibility = async (pack) => {
    const newActive = !pack.isActive
    try {
      if (supabase) await supabase.from('packs').update({ is_active: newActive }).eq('id', pack.id)
      setPacks(prev => prev.map(p => p.id === pack.id ? { ...p, isActive: newActive } : p))
      showToast(newActive ? '✅ Pack is now Public' : '🙈 Pack is now Hidden')
    } catch {
      showToast('❌ Failed to update visibility')
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const itemsStringToArray = (str) => str.split(',').map(s => s.trim()).filter(Boolean)
  const itemsArrayToString = (arr) => Array.isArray(arr) ? arr.join(', ') : arr || ''
  const resolveBadge = (f) => {
    if (f.badge) return f.badge
    if (f.isBestseller) return 'Bestseller'
    if (f.isNew) return 'New'
    return null
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
      const fileName = `pack-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('pack-images').upload(fileName, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('pack-images').getPublicUrl(fileName)
      setForm(p => ({ ...p, thumbnail: publicUrl }))
      showToast('🖼 Image uploaded!')
    } catch (err) {
      console.warn('Upload failed:', err.message)
      const r = new FileReader()
      r.onloadend = () => setForm(p => ({ ...p, thumbnail: r.result }))
      r.readAsDataURL(file)
    } finally { setImageUploading(false) }
  }

  const filtered = packs.filter(p => {
    const matchSearch = !search.trim() ||
      search.toLowerCase().split(/\s+/).filter(Boolean).every(w =>
        `${p.title} ${p.description || ''}`.toLowerCase().includes(w)
      )
    const matchVisibility =
      visibilityFilter === 'all' ? true :
      visibilityFilter === 'public' ? p.isActive !== false :
      p.isActive === false
    return matchSearch && matchVisibility
  })

  const publicCount = packs.filter(p => p.isActive !== false).length
  const hiddenCount = packs.filter(p => p.isActive === false).length

  const openAdd = () => {
    setForm(emptyForm); setImagePreview(''); setImageUploading(false)
    setEditingId(null); setShowModal(true)
  }

  const openEdit = (pack) => {
    console.log('🔍 Opening pack for edit:', pack.title, 'isFree:', pack.isFree)
    setForm({
      ...pack,
      price: pack.price?.toString() || '',
      originalPrice: pack.originalPrice?.toString() || '',
      items: itemsArrayToString(pack.items),
      badge: pack.badge || '',
      isBestseller: pack.badge === 'Bestseller',
      isNew: pack.badge === 'New',
      isFree: pack.isFree || false,
    })
    setImagePreview(pack.thumbnail?.startsWith('http') || pack.thumbnail?.startsWith('data:') ? pack.thumbnail : '')
    setImageUploading(false); setEditingId(pack.id); setShowModal(true)
  }

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
      thumbnail: form.thumbnail || 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)',
      badge,
      items: itemsArray,
      is_active: true,
      is_free: form.isFree,
    }
    console.log('💾 Saving pack with payload:', payload)
    console.log('✅ is_free value:', payload.is_free)
    try {
      if (editingId) {
        if (supabase) {
          const { data, error } = await supabase.from('packs').update(payload).eq('id', editingId).select().single()
          if (error) console.error('❌ Update error:', error)
          if (data) { 
            console.log('✅ Updated pack from DB:', data)
            setPacks(prev => prev.map(p => p.id === editingId ? mapPack(data) : p))
            showToast('✅ Pack updated!')
            setShowModal(false)
            return 
          }
        }
        // Fallback: local update
        setPacks(prev => prev.map(p => p.id === editingId ? { 
          ...p, 
          ...payload, 
          id: editingId, 
          originalPrice: payload.original_price, 
          items: itemsArray, 
          badge,
          isFree: payload.is_free 
        } : p))
        showToast('✅ Pack updated!')
      } else {
        if (supabase) {
          const { data, error } = await supabase.from('packs').insert([payload]).select().single()
          if (error) console.error('❌ Insert error:', error)
          if (data) { 
            console.log('✅ Created pack from DB:', data)
            setPacks(prev => [mapPack(data), ...prev])
            showToast('✅ Pack added!')
            setShowModal(false)
            return 
          }
        }
        // Fallback: local insert
        setPacks(prev => [{
          ...payload, 
          id: Date.now(), 
          originalPrice: payload.original_price, 
          items: itemsArray,
          isFree: payload.is_free
        }, ...prev])
        showToast('✅ Pack added!')
      }
    } catch {
      showToast('✅ Saved locally (Supabase not connected)')
    }
    setShowModal(false)
  }

  const handleDelete = async (id) => {
    try { if (supabase) await supabase.from('packs').delete().eq('id', id) } catch { /* fallback */ }
    setPacks(prev => prev.filter(p => p.id !== id))
    setDeleteConfirm(null)
    showToast('🗑 Pack deleted.')
  }

  if (loading) return <div style={{ padding: '2rem', color: 'var(--adm-text2)' }}>Loading packs...</div>

  return (
    <div className="admin-courses">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-section-title">
        <div>
          <h2>Packs</h2>
          <p>Manage all digital product packs. Changes reflect on the website instantly.</p>
        </div>
        <button className="admin-btn-primary" onClick={openAdd}>➕ Add Pack</button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <input className="admin-search" type="text" placeholder="🔍 Search packs..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <div className="visibility-tabs">
            <button className={`visibility-tab ${visibilityFilter === 'all' ? 'active' : ''}`} onClick={() => setVisibilityFilter('all')}>
              All <span className="vtab-count">{packs.length}</span>
            </button>
            <button className={`visibility-tab public ${visibilityFilter === 'public' ? 'active' : ''}`} onClick={() => setVisibilityFilter('public')}>
              🟢 Public <span className="vtab-count">{publicCount}</span>
            </button>
            <button className={`visibility-tab hidden ${visibilityFilter === 'hidden' ? 'active' : ''}`} onClick={() => setVisibilityFilter('hidden')}>
              🔴 Hidden <span className="vtab-count">{hiddenCount}</span>
            </button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="admin-table courses-desktop-table">
          <div className="admin-table-head">
            <span>Pack</span><span>Price</span><span>Status</span><span>Actions</span>
          </div>
          {filtered.map(pack => (
            <div key={pack.id} className={`admin-table-row ${pack.isActive === false ? 'row-hidden' : ''}`}>
              <span className="atc-course-cell">
                <div className="atc-thumb" style={{ opacity: pack.isActive === false ? 0.5 : 1 }}>
                  {pack.thumbnail && (pack.thumbnail.startsWith('http') || pack.thumbnail.startsWith('data:'))
                    ? <img src={pack.thumbnail} alt={pack.title} />
                    : <div className="atc-thumb-gradient" style={{ background: pack.thumbnail || 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' }} />}
                </div>
                <div className="atc-info">
                  <div className="atc-title">
                    {pack.badge === 'Bestseller' && <span className="mini-badge bestseller">⭐</span>}
                    {pack.badge === 'New' && <span className="mini-badge new-badge">New</span>}
                    {pack.isFree && <span className="mini-badge" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>🎁 Free</span>}
                    {pack.isActive === false && <span className="mini-badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>Hidden</span>}
                    {pack.title}
                  </div>
                  {pack.items?.length > 0 && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--adm-text3)', marginTop: '0.2rem' }}>
                      {pack.items.slice(0, 2).join(' · ')}{pack.items.length > 2 ? ` +${pack.items.length - 2} more` : ''}
                    </div>
                  )}
                </div>
              </span>
              <span style={{ color: 'var(--adm-text)', fontWeight: 600 }}>PKR {pack.price}</span>
              <span style={{
                color: pack.isActive === false ? '#EF4444' : 'var(--adm-accent)',
                fontSize: '0.8rem', fontWeight: 600
              }}>
                {pack.isActive === false ? '● Hidden' : '● Public'}
              </span>
              <span className="admin-actions">
                <button
                  className="admin-btn-icon"
                  title={pack.isActive === false ? 'Make Public' : 'Hide Pack'}
                  onClick={() => handleToggleVisibility(pack)}
                  style={{ fontSize: '1rem' }}
                >
                  {pack.isActive === false ? '👁' : '🙈'}
                </button>
                <button className="admin-btn-icon edit" onClick={() => openEdit(pack)}>✏️</button>
                <button className="admin-btn-icon delete" onClick={() => setDeleteConfirm(pack.id)}>🗑</button>
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--adm-text3)', padding: '2rem', fontSize: '0.875rem' }}>
              {visibilityFilter === 'hidden' ? 'No hidden packs.' : visibilityFilter === 'public' ? 'No public packs.' : 'No packs found.'}
            </p>
          )}
        </div>

        {/* Mobile cards */}
        <div className="courses-mobile-cards">
          {filtered.map(pack => (
            <div key={pack.id} className={`course-mobile-card ${pack.isActive === false ? 'card-hidden' : ''}`}>
              <div className="cmc-header">
                <div className="cmc-thumb" style={{ opacity: pack.isActive === false ? 0.5 : 1 }}>
                  {pack.thumbnail && (pack.thumbnail.startsWith('http') || pack.thumbnail.startsWith('data:'))
                    ? <img src={pack.thumbnail} alt={pack.title} />
                    : <div className="cmc-thumb-bg" style={{ background: pack.thumbnail || 'linear-gradient(135deg, #1E3A8A, #1D4ED8)' }} />}
                </div>
                <div className="cmc-info">
                  <div className="cmc-badges">
                    {pack.badge === 'Bestseller' && <span className="mini-badge bestseller">⭐ Best</span>}
                    {pack.badge === 'New' && <span className="mini-badge new-badge">New</span>}
                    {pack.isFree && <span className="mini-badge" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>🎁 Free</span>}
                    {pack.isActive === false && <span className="mini-badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>Hidden</span>}
                  </div>
                  <div className="cmc-title">{pack.title}</div>
                </div>
              </div>
              <div className="cmc-meta">
                <div className="cmc-meta-item">
                  <span className="cmc-meta-label">Price</span>
                  <span className="cmc-meta-value">PKR {pack.price}</span>
                </div>
                {pack.originalPrice && (
                  <div className="cmc-meta-item">
                    <span className="cmc-meta-label">Original</span>
                    <span className="cmc-meta-value" style={{ textDecoration: 'line-through', color: 'var(--adm-text3)' }}>PKR {pack.originalPrice}</span>
                  </div>
                )}
                <div className="cmc-meta-item">
                  <span className="cmc-meta-label">Status</span>
                  <span className="cmc-meta-value" style={{ color: pack.isActive === false ? '#EF4444' : '#22C55E', fontWeight: 600 }}>
                    {pack.isActive === false ? 'Hidden' : 'Public'}
                  </span>
                </div>
              </div>
              <div className="cmc-actions">
                <button
                  className={`cmc-btn ${pack.isActive === false ? 'cmc-btn-show' : 'cmc-btn-hide'}`}
                  onClick={() => handleToggleVisibility(pack)}
                >
                  {pack.isActive === false ? '👁 Show' : '🙈 Hide'}
                </button>
                <button className="cmc-btn cmc-btn-edit" onClick={() => openEdit(pack)}>✏️ Edit</button>
                <button className="cmc-btn cmc-btn-delete" onClick={() => setDeleteConfirm(pack.id)}>🗑 Delete</button>
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
              <h3>{editingId ? 'Edit Pack' : 'Add New Pack'}</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label>Pack Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Ultimate Design Bundle" />
              </div>
              <div className="admin-form-group">
                <label>Short Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief pack description..." />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Price (PKR)</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="2999" />
                </div>
                <div className="admin-form-group">
                  <label>Original Price (PKR)</label>
                  <input type="number" value={form.originalPrice} onChange={e => setForm(p => ({ ...p, originalPrice: e.target.value }))} placeholder="8999" />
                </div>
              </div>
              <div className="admin-form-group">
                <label>What's Included (comma-separated)</label>
                <textarea rows={2} value={form.items} onChange={e => setForm(p => ({ ...p, items: e.target.value }))}
                  placeholder="50+ Figma Templates, 500+ Icons Pack, 20 UI Kits" />
              </div>
              <div className="admin-form-group">
                <label>Badge Label</label>
                <input value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))}
                  placeholder="Bestseller, New, Hot Deal — leave blank for none" />
              </div>
              <div className="admin-form-group">
                <label>Pack Image</label>
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
                <label>
                  <input type="checkbox" checked={form.isBestseller}
                    onChange={e => setForm(p => ({ ...p, isBestseller: e.target.checked, badge: e.target.checked ? 'Bestseller' : p.isNew ? 'New' : '' }))} />
                  Bestseller
                </label>
                <label>
                  <input type="checkbox" checked={form.isNew}
                    onChange={e => setForm(p => ({ ...p, isNew: e.target.checked, badge: e.target.checked ? 'New' : p.isBestseller ? 'Bestseller' : '' }))} />
                  New
                </label>
                <label>
                  <input type="checkbox" checked={form.isFree}
                    onChange={e => setForm(p => ({ ...p, isFree: e.target.checked }))} />
                  Free Pack
                </label>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSave}>{editingId ? 'Save Changes' : 'Add Pack'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal admin-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Delete Pack</h3>
              <button onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="admin-modal-body"><p>Are you sure you want to delete this pack? This cannot be undone.</p></div>
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

export default AdminPacks
