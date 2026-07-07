import React, { useState } from 'react'

const initialMessages = [
  { id: 1, name: 'Mohamed Adel', email: 'mohamed@example.com', subject: 'Course Question', message: 'Hi, I wanted to ask about the web development bootcamp. Does it cover TypeScript?', time: '2 hours ago', read: false, avatar: '👨‍💻' },
  { id: 2, name: 'Sara Khalil', email: 'sara@example.com', subject: 'Billing', message: "I was charged twice for the React course. Can you help me resolve this?", time: '5 hours ago', read: false, avatar: '👩‍💼' },
  { id: 3, name: 'Yusuf Okafor', email: 'yusuf@example.com', subject: 'Partnership', message: "I'm an instructor with 5 years of experience in data science. I'd love to create a course on your platform.", time: '1 day ago', read: true, avatar: '👨‍🔬' },
  { id: 4, name: 'Lina Hassan', email: 'lina@example.com', subject: 'Technical Support', message: 'Videos are not loading on my mobile device. I have tried reinstalling the browser but the issue persists.', time: '2 days ago', read: true, avatar: '👩‍🎓' },
  { id: 5, name: 'Tariq Al-Amin', email: 'tariq@example.com', subject: 'General Inquiry', message: 'Do you offer team or corporate plans for multiple employees?', time: '3 days ago', read: true, avatar: '👨‍🏫' },
]

const AdminMessages = () => {
  const [messages, setMessages] = useState(initialMessages)
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = messages.filter(m => {
    if (filter === 'Unread') return !m.read
    if (filter === 'Read') return m.read
    return true
  })

  const openMessage = (msg) => {
    setSelected(msg)
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m))
  }

  const sendReply = () => {
    if (!reply.trim()) return
    setReply('')
    alert(`Reply sent to ${selected.email}!`)
  }

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const unreadCount = messages.filter(m => !m.read).length

  return (
    <div className="admin-messages">
      <div className="admin-section-title">
        <div>
          <h2>Messages {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</h2>
          <p>Contact form submissions from your visitors.</p>
        </div>
      </div>

      <div className="messages-layout">
        {/* List */}
        <div className="messages-list admin-card">
          <div className="admin-card-header">
            <div className="admin-filter-tabs">
              {['All', 'Unread', 'Read'].map(f => (
                <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
          </div>
          {filtered.map(msg => (
            <div
              key={msg.id}
              className={`message-item ${!msg.read ? 'unread' : ''} ${selected?.id === msg.id ? 'selected' : ''}`}
              onClick={() => openMessage(msg)}
            >
              <span className="msg-avatar">{msg.avatar}</span>
              <div className="msg-preview">
                <div className="msg-meta">
                  <strong>{msg.name}</strong>
                  <span>{msg.time}</span>
                </div>
                <p className="msg-subject">{msg.subject}</p>
                <p className="msg-snippet">{msg.message.substring(0, 60)}...</p>
              </div>
              {!msg.read && <span className="unread-dot"></span>}
            </div>
          ))}
          {filtered.length === 0 && <p className="empty-state">No messages.</p>}
        </div>

        {/* Detail */}
        <div className="message-detail admin-card">
          {selected ? (
            <>
              <div className="admin-card-header">
                <div>
                  <h3>{selected.subject}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selected.email}</p>
                </div>
                <button className="admin-btn-icon delete" onClick={() => deleteMessage(selected.id)}>🗑</button>
              </div>
              <div className="message-body">
                <div className="message-from">
                  <span className="msg-avatar lg">{selected.avatar}</span>
                  <div>
                    <strong>{selected.name}</strong>
                    <span>{selected.time}</span>
                  </div>
                </div>
                <p className="message-text">{selected.message}</p>
              </div>
              <div className="message-reply">
                <h4>Reply</h4>
                <textarea
                  rows={4}
                  placeholder={`Reply to ${selected.name}...`}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                />
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
      </div>
    </div>
  )
}

export default AdminMessages
