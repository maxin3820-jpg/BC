import React from 'react'
import { Link } from 'react-router-dom'

const CourseDetail = () => {
  return (
    <div style={{ textAlign: 'center', padding: '8rem 1rem' }}>
      <h1>Page Not Found</h1>
      <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
        This page doesn't exist.
      </p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
        Go Home
      </Link>
    </div>
  )
}

export default CourseDetail
