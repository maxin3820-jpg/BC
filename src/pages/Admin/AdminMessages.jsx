import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'

const LABELS = ['Interested', 'Purchased', 'Support', 'Spam']
const LABEL_COLORS = {
  Interested: { bg: 'rgba(29,78,216,0.12)', color: '#60A5FA' },
  Purchased:  { bg: 'rgba(34,197,94,0.12)', color: '#22C55E' },
  Support:    { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
  Spam:       { bg: 'rgba(239,68,68,0.12)',  color: '#EF4444' },
}

const getIsMobile = () => typeof window !== 'undefined' && window.innerWidth <= 768

const AdminMessages = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState('')
  const [filter, setFilter] = useState('All')
  const [labelFilter, setLabelFilter] = useState('All')
  const [isMobile, setIsMobile] = useState(getIsMobile)
  const [showDetail, setShowDetail] = useState(false)
  const [toast, setToast] = useState('')
  const [templates, setTemplates] = useState([])
  const [showTemplates, setShowTemplates] = useState(false)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    const load = async () => {
      if (!supabase) { setLoading(false); return }
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false })
        if (!error && data) setMessages(data)
      } catch { }
      finally { setLoading(false) }
    }
    load()

    if (!supabase) return
    const channel = supabase
      .channel('messages-admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  // Load reply templates
  useEffect(() => {
    const load = async () => {
      if (!supabase) return
      try {
        const { data } = await supabase.from('reply_templates').select('*').order('sort_order')
        if (data?.length) setTemplates(data)
      } catch { }
    }
    load()
  }, [])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const filtered = messages.filter(m => {
    const matchRead = filter === 'All' ? true : filter === 'Unread' ? !m.is_read : m.is_read
    const matchLabel = labelFilter === 'All' ? true : m.label === labelFilter
    return matchRead && matchLabel
  })

  const openMessage = async (msg) => {
    setSelected(msg)
    setReply('')
    setShowTemplates(false)
    if (isMobile) setShowDetail(true)
    if (!msg.is_read) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m))
      try { if (supabase) await supabase.from('messages').update({ is_read: true }).eq('id', msg.id) } catch { }
    }
  }

  const deleteMessage = async (id) => {
    try { if (supabase) await supabase.from('messages').delete().eq('id', id) } catch { }
    setMessages(prev => prev.filter(m => m.id !== id))
    if (selected?.id === id) { setSelected(null); setShowDetail(false) }
    showToast('🗑 Message deleted.')
  }

  const setLabel = async (id, label) => {
    const newLabel = label === selected?.label ? null : label
    try {
      if (supabase) await supabase.from('messages').update({ label: newLabel }).eq('id', id)
      setMessages(prev => prev.map(m => m.id === id ? { ...m, label: newLabel } : m))
      setSelected(prev => prev ? { ...prev, label: newLabel } : prev)
      showToast(newLabel ? `🏷 Labelled as ${newLabel}` : '🏷 Label removed')
    } catch { showToast('❌ Failed to update label') }
  }

  const sendReply = () => {
    if (!reply.trim() || !selected) return
    const whatsappMsg = encodeURIComponent(`Hi ${selected.name}, regarding your message "${selected.subject}": ${reply}`)
    window.open(`https://wa.me/?text=${whatsappMsg}`, '_blank')
    setReply('')
    showToast('✅ Reply composed!')
  }

  const useTemplate = (t) => {
    setReply(t.message)
    setShowTemplates(false)
  }

  const unreadCount = messages.filter(m => !m.is_read).length
  const showList = !isMobile || !showDetail
  const showDetailPanel = !isMobile || showDetail

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return d.toLocaleDateString()
  }

  return (
    <div className="admin-messages">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-section-title">
        <div>
          <h2>Messages {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</h2>
          <p>Contact form submissions from your visitors — live from Supabase.</p>
        </div>
        <Link to="/admin/templates" className="admin-btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          📋 Reply Templates
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', color: 'var(--adm-text2)' }}>Loading messages...</div>
      ) : (
        <div className="messages-layout">

          {/* List panel */}
          {showList && (
            <div className="messages-list admin-card">
              <div className="admin-card-header" style={{ flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch' }}>
                <div className="admin-filter-tabs">
                  {['All', 'Unread', 'Read'].map(f => (
                    <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
                  ))}
                </div>
                <div className="admin-filter-tabs" style={{ flexWrap: 'wrap' }}>
                  <button className={`filter-tab ${labelFilter === 'All' ? 'active' : ''}`} onClick={() => setLabelFilter('All')}>All Labels</button>
                  {LABELS.map(l => (
                    <button key={l} className={`filter-tab ${labelFilter === l ? 'active' : ''}`} onClick={() => setLabelFilter(l)}
                      style={labelFilter === l ? { background: LABEL_COLORS[l].bg, color: LABEL_COLORS[l].color, borderColor: LABEL_COLORS[l].color } : {}}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              {filtered.length === 0 ? (
                <p className="empty-state">
                  {messages.length === 0
                    ? 'No messages yet. Contact form submissions will appear here.'
                    : 'No messages in this filter.'}
                </p>
              ) : filtered.map(msg => (
                <div
                  key={msg.id}
                  className={`message-item ${!msg.is_read ? 'unread' : ''} ${selected?.id === msg.id ? 'selected' : ''}`}
                  onClick={() => openMessage(msg)}
                >
                  <span className="msg-avatar">{msg.name ? msg.name.charAt(0).toUpperCase() : '?'}</span>
                  <div className="msg-preview">
                    <div className="msg-meta">
                      <strong>{msg.name}</strong>
                      <span>{formatTime(msg.created_at)}</span>
                    </div>
                    <p className="msg-subject">{msg.subject}</p>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.2rem' }}>
                      <p className="msg-snippet" style={{ margin: 0 }}>{(msg.message || '').substring(0, 50)}...</p>
                      {msg.label && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '100px',
                          background: LABEL_COLORS[msg.label]?.bg, color: LABEL_COLORS[msg.label]?.color, flexShrink: 0 }}>
                          {msg.label}
                        </span>
                      )}
                    </div>
                  </div>
                  {!msg.is_read && <span className="unread-dot"></span>}
                </div>
              ))}
            </div>
          )}

          {/* Detail panel */}
          {showDetailPanel && (
            <div className="message-detail admin-card">
              {isMobile && showDetail && (
                <button className="msg-back-btn" onClick={() => { setShowDetail(false); setSelected(null) }}>
                  ← Back to Messages
                </button>
              )}

              {selected ? (
                <>
                  <div className="admin-card-header">
                    <div>
                      <h3>{selected.subject}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--adm-text3)', marginTop: '0.2rem' }}>{selected.email}</p>
                    </div>
                    <button className="admin-btn-icon delete" onClick={() => deleteMessage(selected.id)}>🗑</button>
                  </div>

                  {/* Labels */}
                  <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--adm-border2)', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--adm-text3)', marginRight: '0.25rem' }}>Label:</span>
                    {LABELS.map(l => (
                      <button key={l} onClick={() => setLabel(selected.id, l)}
                        style={{
                          padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                          border: `1px solid ${selected.label === l ? LABEL_COLORS[l].color : 'var(--adm-border2)'}`,
                          background: selected.label === l ? LABEL_COLORS[l].bg : 'transparent',
                          color: selected.label === l ? LABEL_COLORS[l].color : 'var(--adm-text3)',
                          transition: 'all 0.15s ease',
                        }}>
                        {l}
                      </button>
                    ))}
                  </div>

                  <div className="message-body">
                    <div className="message-from">
                      <span style={{ fontSize: '2rem', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--adm-surface)', borderRadius: '50%', border: '1px solid var(--adm-border2)' }}>
                        {selected.name?.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <strong>{selected.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--adm-text3)' }}>{formatTime(selected.created_at)}</span>
                      </div>
                    </div>
                    <p className="message-text">{selected.message}</p>
                  </div>

                  <div className="message-reply">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0 }}>Reply via WhatsApp</h4>
                      {templates.length > 0 && (
                        <button
                          className="admin-btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                          onClick={() => setShowTemplates(!showTemplates)}
                        >
                          📋 Templates
                        </button>
                      )}
                    </div>

                    {/* Template picker */}
                    {showTemplates && (
                      <div className="template-picker">
                        {templates.map(t => (
                          <button key={t.id} className="template-pick-item" onClick={() => useTemplate(t)}>
                            <strong>{t.title}</strong>
                            <span>{t.message.substring(0, 60)}...</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <textarea rows={4} placeholder={`Reply to ${selected.name}...`}
                      value={reply} onChange={e => setReply(e.target.value)} />
                    <button className="admin-btn-primary" onClick={sendReply}>Send Reply →</button>
                  </div>
                </>
              ) : (
                <div className="message-empty">
                  <span>💬</span>
                  <p>Select a message to read</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminMessages
