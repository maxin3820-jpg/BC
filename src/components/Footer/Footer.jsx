import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const WHATSAPP = 'https://wa.me/923036326202'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-birsil">Birsil</span>
              <span className="logo-courses">Courses</span>
            </Link>
            <p>Learn new skills and grab premium digital products. Grow your career with Birsil.</p>
          </div>

          {/* Platform */}
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/courses">All Courses</Link></li>
              <li><Link to="/packs">All Packs</Link></li>
              <li><Link to="/courses">Free Courses</Link></li>
              <li><Link to="/contact">Enroll via WhatsApp</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/packs">Digital Packs</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li>
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                  WhatsApp Us
                </a>
              </li>
              <li><Link to="/admin">Admin Panel</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li>
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                  Help via WhatsApp
                </a>
              </li>
              <li><Link to="/contact">Send a Message</Link></li>
              <li>
                <a href="mailto:maxin3820@gmail.com">
                  Email Us
                </a>
              </li>
              <li><Link to="/courses">Browse Courses</Link></li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <p>© {year} Birsil Courses. All rights reserved.</p>
          <p>Made with ❤️ for learners everywhere.</p>
          <Link to="/admin" className="admin-panel-btn">⚙️ Admin Panel</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
