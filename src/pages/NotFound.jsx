import React from 'react'
import { Link } from 'react-router-dom'
import './NotFound.css'

const NotFound = () => {
  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <div className="notfound-code gradient-text">404</div>
        <h1>Page Not Found</h1>
        <p>Looks like this page took a wrong turn. Let's get you back on track.</p>
        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary">Go Home</Link>
          <Link to="/courses" className="btn btn-secondary">Browse Courses</Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
