import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const defaultTemplates = [
  { id: 1, title: 'Course Inquiry Response', message: 'Hi! Thank you for your interest. Which course are you interested in?' },
  { id: 2, title: 'Payment Instructions', message: 'Hi! You can pay via JazzCash, Easypaisa, or Crypto. Which method works for you?' },
]

const emptyForm = { title: '', message: '' }

const AdminTemplates = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [toast, setToast] = useState('')
  const [copied, setCopied] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    const load = async () => {
      if (!supabase) { setTemplates(defaultTemplates); setLoading(false); return }
      try {
        const { data, error } = await supabase
          .from('reply_templates')
          .select('*')
          .order('sort_order', { ascending: true })
        setTemplates(!error && data?.length ? data : defaultTemplates)
      } catch { setTemplates(defaultTemplates) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowModal(true) }
  const openEdit = (t) => { setForm({ title: t.title, message: t.message }); setEditingId(t.id); setShowModal(true) }

  const handleSave = async () => {
    if (!form.title.trim() || !form.message.trim()) return
    const payload = { title: form.title, message: form.message, sort_order: templates.length + 1 }
    try {
      if (editingId) {
        if (supabase) {
          const { data } = await supabase.from('reply_templates').update(payload).eq('id', editingId).select().single()
          if (data) { setTemplates(prev => prev.map(t => t.id === editingId ? data : t)); showToast('✅ Template updated!'); setShowModal(false); return }
        }
        setTemplates(prev => prev.map(t => t.id === editingId ? { ...t, ...payload } : t))
      } else {
        if (supabase) {
          const { data } = await supabase.from('reply_templates').insert([payload]).select().single()
          if (data) { setTemplates(prev => [...prev, data]); showToast('✅ Template added!'); setShowModal(false); return }
        }
        setTemplates(prev => [...prev, { ...payload, id: Date.now() }])
      }
    } catch { showToast('✅ Saved locally') }
    showToast(editingId ? '✅ Template updated!' : '✅ Template added!')
    setShowModal(false)
  }

  const handleDelete = async (id) => {
    try { if (supabase) await supabase.from('reply_templates').delete().eq('id', id) } catch { }
    setTemplates(prev => prev.filter(t => t.id !== id))
    setDeleteConfirm(null)
    showToast('🗑 Template deleted.')
  }

  const copyToClipboard = (t) => {
    navigator.clipboard.writeText(t.message).then(() => {
      setCopied(t.id)
      showToast('📋 Copied to clipboard!')
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const openWhatsApp = (t) => {
    const msg = encodeURIComponent(t.message)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  if (loading) return <div style={{ padding: '2rem', color: 'var(--adm-text2)' }}>Loading templates...</div>

  return (
    <div className="admin-courses">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-section-title">
        <div>
          <h2>Quick Reply Templates</h2>
          <p>Pre-written responses for common customer inquiries. Copy or send directly via WhatsApp.</p>
        </div>
        <button className="admin-btn-primary" onClick={openAdd}>➕ Add Template</button>
      </div>

      <div className="templates-grid">
        {templates.map(t => (
          <div key={t.id} className="template-card admin-card">
            <div className="template-card-header">
              <h4>{t.title}</h4>
              <div className="template-actions">
                <button className="admin-btn-icon edit" title="Edit" onClick={() => openEdit(t)}>✏️</button>
                <button className="admin-btn-icon delete" title="Delete" onClick={() => setDeleteConfirm(t.id)}>🗑</button>
              </div>
            </div>
            <p className="template-message">{t.message}</p>
            <div className="template-btns">
              <button
                className={`template-copy-btn ${copied === t.id ? 'copied' : ''}`}
                onClick={() => copyToClipboard(t)}
              >
                {copied === t.id ? '✅ Copied!' : '📋 Copy'}
              </button>
              <button className="template-wa-btn" onClick={() => openWhatsApp(t)}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Send via WhatsApp
              </button>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <p style={{ color: 'var(--adm-text3)', padding: '2rem' }}>No templates yet.</p>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingId ? 'Edit Template' : 'Add New Template'}</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label>Template Name *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Payment Instructions" />
              </div>
              <div className="admin-form-group">
                <label>Message *</label>
                <textarea rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Write your reply message..." />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSave}>{editingId ? 'Save Changes' : 'Add Template'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal admin-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Delete Template</h3>
              <button onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="admin-modal-body"><p>Delete this reply template?</p></div>
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

export default AdminTemplates
