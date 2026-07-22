import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const getIsMobile = () => typeof window !== 'undefined' && window.innerWidth <= 768

const AdminMessages = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState('')
  const [filter, setFilter] = useState('All')
  const [isMobile, setIsMobile] = useState(getIsMobile)
  const [showDetail, setShowDetail] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // ── Load from Supabase ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!supabase) { setLoading(false); return }
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false })
        if (!error && data) setMessages(data)
      } catch { /* show empty */ }
      finally { setLoading(false) }
    }
    load()

    // Realtime — new messages appear instantly
    if (!supabase) return
    const channel = supabase
      .channel('messages-admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const filtered = messages.filter(m => {
    if (filter === 'Unread') return !m.is_read
    if (filter === 'Read') return m.is_read
    return true
  })

  const openMessage = async (msg) => {
    setSelected(msg)
    setReply('')
    if (isMobile) setShowDetail(true)
    // Mark as read
    if (!msg.is_read) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m))
      try { if (supabase) await supabase.from('messages').update({ is_read: true }).eq('id', msg.id) } catch { /* ignore */ }
    }
  }

  const deleteMessage = async (id) => {
    try { if (supabase) await supabase.from('messages').delete().eq('id', id) } catch { /* ignore */ }
    setMessages(prev => prev.filter(m => m.id !== id))
    if (selected?.id === id) { setSelected(null); setShowDetail(false) }
    showToast('🗑 Message deleted.')
  }

  const sendReply = () => {
    if (!reply.trim() || !selected) return
    const whatsappMsg = encodeURIComponent(`Hi ${selected.name}, regarding your message "${selected.subject}": ${reply}`)
    window.open(`https://wa.me/?text=${whatsappMsg}`, '_blank')
    setReply('')
    showToast('✅ Reply composed!')
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
      </div>

      {loading ? (
        <div style={{ padding: '2rem', color: 'var(--adm-text2)' }}>Loading messages...</div>
      ) : (
        <div className="messages-layout">

          {/* List panel */}
          {showList && (
            <div className="messages-list admin-card">
              <div className="admin-card-header">
                <div className="admin-filter-tabs">
                  {['All', 'Unread', 'Read'].map(f => (
                    <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
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
                  <span className="msg-avatar">
                    {msg.name ? msg.name.charAt(0).toUpperCase() : '?'}
                  </span>
                  <div className="msg-preview">
                    <div className="msg-meta">
                      <strong>{msg.name}</strong>
                      <span>{formatTime(msg.created_at)}</span>
                    </div>
                    <p className="msg-subject">{msg.subject}</p>
                    <p className="msg-snippet">{(msg.message || '').substring(0, 60)}...</p>
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
                  <div className="message-body">
                    <div className="message-from">
                      <span className="msg-avatar lg" style={{ fontSize: '2rem', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--adm-surface)', borderRadius: '50%', border: '1px solid var(--adm-border2)' }}>
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
                    <h4>Reply via WhatsApp</h4>
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
