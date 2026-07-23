import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// Fallback hardcoded FAQs if Supabase not connected
const defaultFaqs = [
  { id: 1, question: 'How do I buy a course?', answer: 'Click "Buy on WhatsApp" on any course card and send us a message. We\'ll guide you through the purchase instantly.', sort_order: 1, is_active: true },
  { id: 2, question: 'How do I pay?', answer: 'We accept JazzCash, Easypaisa, and Crypto. Contact us on WhatsApp and we\'ll guide you through the payment.', sort_order: 2, is_active: true },
  { id: 3, question: 'Can I access on mobile?', answer: 'Yes. Everything works on phone, tablet and desktop. No app needed.', sort_order: 3, is_active: true },
  { id: 4, question: 'Is there a refund policy?', answer: 'We do not offer refunds. However, if you face any issues with our products, we will fix them for you — just reach out to us on WhatsApp.', sort_order: 4, is_active: true },
  { id: 5, question: 'What are Digital Packs?', answer: 'Packs are bundles of premium digital products — templates, design kits, code snippets and more. Buy once, use forever.', sort_order: 5, is_active: true },
]

const emptyForm = { question: '', answer: '' }

const AdminFAQs = () => {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    const load = async () => {
      if (!supabase) { setFaqs(defaultFaqs); setLoading(false); return }
      try {
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .order('sort_order', { ascending: true })
        setFaqs(!error && data?.length ? data : defaultFaqs)
      } catch { setFaqs(defaultFaqs) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowModal(true) }
  const openEdit = (faq) => { setForm({ question: faq.question, answer: faq.answer }); setEditingId(faq.id); setShowModal(true) }

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) return
    const payload = { question: form.question, answer: form.answer }

    try {
      if (editingId) {
        if (supabase) {
          const { data } = await supabase.from('faqs').update(payload).eq('id', editingId).select().single()
          if (data) { setFaqs(prev => prev.map(f => f.id === editingId ? data : f)); showToast('✅ FAQ updated!'); setShowModal(false); return }
        }
        setFaqs(prev => prev.map(f => f.id === editingId ? { ...f, ...payload } : f))
      } else {
        const newFaq = { ...payload, sort_order: faqs.length + 1, is_active: true }
        if (supabase) {
          const { data } = await supabase.from('faqs').insert([newFaq]).select().single()
          if (data) { setFaqs(prev => [...prev, data]); showToast('✅ FAQ added!'); setShowModal(false); return }
        }
        setFaqs(prev => [...prev, { ...newFaq, id: Date.now() }])
      }
    } catch { showToast('✅ Saved locally') }
    showToast(editingId ? '✅ FAQ updated!' : '✅ FAQ added!')
    setShowModal(false)
  }

  const handleDelete = async (id) => {
    try { if (supabase) await supabase.from('faqs').delete().eq('id', id) } catch { }
    setFaqs(prev => prev.filter(f => f.id !== id))
    setDeleteConfirm(null)
    showToast('🗑 FAQ deleted.')
  }

  const handleToggle = async (faq) => {
    const newActive = !faq.is_active
    try {
      if (supabase) await supabase.from('faqs').update({ is_active: newActive }).eq('id', faq.id)
      setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, is_active: newActive } : f))
      showToast(newActive ? '✅ FAQ is now visible' : '🙈 FAQ is now hidden')
    } catch { showToast('❌ Failed to update') }
  }

  if (loading) return <div style={{ padding: '2rem', color: 'var(--adm-text2)' }}>Loading FAQs...</div>

  return (
    <div className="admin-courses">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-section-title">
        <div>
          <h2>FAQ Manager</h2>
          <p>Manage questions displayed on the homepage. Changes reflect instantly.</p>
        </div>
        <button className="admin-btn-primary" onClick={openAdd}>➕ Add FAQ</button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <span style={{ fontSize: '0.875rem', color: 'var(--adm-text2)' }}>{faqs.length} questions</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--adm-text3)' }}>Visible: {faqs.filter(f => f.is_active).length}</span>
        </div>

        <div className="faq-admin-list">
          {faqs.map((faq, i) => (
            <div key={faq.id} className={`faq-admin-item ${!faq.is_active ? 'faq-hidden' : ''}`}>
              <div className="faq-admin-number">{i + 1}</div>
              <div className="faq-admin-content">
                <div className="faq-admin-question">
                  {!faq.is_active && <span className="mini-badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', marginRight: '0.5rem' }}>Hidden</span>}
                  {faq.question}
                </div>
                <div className="faq-admin-answer">{faq.answer}</div>
              </div>
              <div className="faq-admin-actions">
                <button className="admin-btn-icon" title={faq.is_active ? 'Hide' : 'Show'} onClick={() => handleToggle(faq)}>
                  {faq.is_active ? '🙈' : '👁'}
                </button>
                <button className="admin-btn-icon edit" onClick={() => openEdit(faq)}>✏️</button>
                <button className="admin-btn-icon delete" onClick={() => setDeleteConfirm(faq.id)}>🗑</button>
              </div>
            </div>
          ))}
          {faqs.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--adm-text3)', padding: '2rem' }}>No FAQs yet. Add your first question.</p>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingId ? 'Edit FAQ' : 'Add New FAQ'}</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label>Question *</label>
                <input
                  value={form.question}
                  onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
                  placeholder="e.g. How do I buy a course?"
                />
              </div>
              <div className="admin-form-group">
                <label>Answer *</label>
                <textarea
                  rows={4}
                  value={form.answer}
                  onChange={e => setForm(p => ({ ...p, answer: e.target.value }))}
                  placeholder="Write a clear, helpful answer..."
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSave}>{editingId ? 'Save Changes' : 'Add FAQ'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal admin-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Delete FAQ</h3>
              <button onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="admin-modal-body"><p>Are you sure you want to delete this FAQ?</p></div>
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

export default AdminFAQs
