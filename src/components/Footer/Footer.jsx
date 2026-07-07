import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="logo-icon">B</div>
              <span>Birsil <strong>Courses</strong></span>
            </Link>
            <p>Learn new skills from expert instructors. Grow your career with Birsil Courses.</p>
            <div className="social-links">
              <a href="#" aria-label="Twitter" className="social-btn">𝕏</a>
              <a href="#" aria-label="YouTube" className="social-btn">▶</a>
              <a href="#" aria-label="LinkedIn" className="social-btn">in</a>
              <a href="#" aria-label="Instagram" className="social-btn">◎</a>
            </div>
          </div>

          {/* Links */}
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/courses">All Courses</Link></li>
              <li><Link to="/courses?sort=popular">Most Popular</Link></li>
              <li><Link to="/courses?sort=newest">Newest</Link></li>
              <li><Link to="/courses">Free Courses</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} Birsil Courses. All rights reserved.</p>
          <p>Made with ❤️ for learners everywhere.</p>
          <Link to="/admin" className="admin-panel-btn">
            ⚙️ Admin Panel
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
