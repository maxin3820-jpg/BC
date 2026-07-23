import React, { useState } from 'react'

const students = [
  { id: 1, name: 'Mohamed Adel', email: 'mohamed@example.com', courses: 3, joined: 'Jan 15, 2024', status: 'Active', avatar: '👨‍💻' },
  { id: 2, name: 'Fatima Al-Rashid', email: 'fatima@example.com', courses: 2, joined: 'Feb 3, 2024', status: 'Active', avatar: '👩‍🎨' },
  { id: 3, name: 'Yusuf Okafor', email: 'yusuf@example.com', courses: 4, joined: 'Mar 10, 2024', status: 'Active', avatar: '👨‍🔬' },
  { id: 4, name: 'Sara Ahmed', email: 'sara@example.com', courses: 1, joined: 'Apr 22, 2024', status: 'Inactive', avatar: '👩‍💼' },
  { id: 5, name: 'Khalid Hassan', email: 'khalid@example.com', courses: 5, joined: 'May 5, 2024', status: 'Active', avatar: '👨‍🎓' },
  { id: 6, name: 'Nadia Karim', email: 'nadia@example.com', courses: 2, joined: 'Jun 18, 2024', status: 'Active', avatar: '👩‍🏫' },
  { id: 7, name: 'Omar Farouq', email: 'omar@example.com', courses: 3, joined: 'Jul 1, 2024', status: 'Active', avatar: '👨‍💼' },
  { id: 8, name: 'Lina Mahmoud', email: 'lina@example.com', courses: 1, joined: 'Jul 14, 2024', status: 'Inactive', avatar: '👩‍🔬' },
]

const AdminStudents = () => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || s.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="admin-students">
      <div className="admin-section-title">
        <div>
          <h2>Students</h2>
          <p>Manage all students.</p>
        </div>
        <div className="admin-stats-mini">
          <span>Total: <strong>{students.length}</strong></span>
          <span>Active: <strong>{students.filter(s => s.status === 'Active').length}</strong></span>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <input
            className="admin-search"
            type="text"
            placeholder="🔍 Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="admin-filter-tabs">
            {['All', 'Active', 'Inactive'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        {/* Desktop table */}
        <div className="admin-table students-desktop-table">
          <div className="admin-table-head">
            <span>Student</span>
            <span>Email</span>
            <span>Courses</span>
            <span>Joined</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {filtered.map(student => (
            <div key={student.id} className="admin-table-row">
              <span className="student-name">
                <span className="student-avatar">{student.avatar}</span>
                {student.name}
              </span>
              <span className="student-email">{student.email}</span>
              <span>{student.courses} courses</span>
              <span>{student.joined}</span>
              <span>
                <span className={`status-badge ${student.status === 'Active' ? 'active' : 'inactive'}`}>
                  {student.status}
                </span>
              </span>
              <span className="admin-actions">
                <button className="admin-btn-icon edit">👁</button>
                <button className="admin-btn-icon delete">🚫</button>
              </span>
            </div>
          ))}
        </div>

        {/* Mobile cards */}
        <div className="students-mobile-cards">
          {filtered.map(student => (
            <div key={student.id} className="student-mobile-card">
              <div className="smc-header">
                <div className="smc-identity">
                  <span className="student-avatar smc-avatar">{student.avatar}</span>
                  <div>
                    <div className="smc-name">{student.name}</div>
                    <div className="smc-email">{student.email}</div>
                  </div>
                </div>
                <span className={`status-badge ${student.status === 'Active' ? 'active' : 'inactive'}`}>
                  {student.status}
                </span>
              </div>
              <div className="smc-meta">
                <div className="smc-meta-item">
                  <span className="smc-meta-label">Courses</span>
                  <span className="smc-meta-value">{student.courses}</span>
                </div>
                <div className="smc-meta-item">
                  <span className="smc-meta-label">Joined</span>
                  <span className="smc-meta-value">{student.joined}</span>
                </div>
              </div>
              <div className="smc-actions">
                <button className="admin-btn-icon edit">👁 View</button>
                <button className="admin-btn-icon delete">🚫 Block</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--adm-text3)', padding: '2rem', fontSize: '0.875rem' }}>
              No students found.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminStudents
