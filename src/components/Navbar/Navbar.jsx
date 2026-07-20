import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dotsOpen, setDotsOpen] = useState(false)
  const location = useLocation()
  const dotsRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close both menus on route change
  useEffect(() => {
    setMenuOpen(false)
    setDotsOpen(false)
  }, [location])

  // Lock body scroll when hamburger menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Close dots menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dotsRef.current && !dotsRef.current.contains(e.target)) {
        setDotsOpen(false)
      }
    }
    if (dotsOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dotsOpen])

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">B</div>
          <span>Birsil <strong>Courses</strong></span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/courses" onClick={() => setMenuOpen(false)}>Courses</NavLink>
          <NavLink to="/packs" onClick={() => setMenuOpen(false)}>Packs</NavLink>
          <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
          <div className="nav-mobile-cta">
            <Link to="/courses" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
              Browse Courses
            </Link>
          </div>
        </nav>

        {/* Desktop CTA */}
        <div className="navbar-cta">
          <Link to="/courses" className="btn btn-primary btn-sm">
            Browse Courses
          </Link>
        </div>

        {/* ===== 3-DOT MENU (mobile only) ===== */}
        <div className="dots-menu" ref={dotsRef}>
          <button
            className={`dots-btn ${dotsOpen ? 'active' : ''}`}
            onClick={() => setDotsOpen(!dotsOpen)}
            aria-label="Quick menu"
            aria-expanded={dotsOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {dotsOpen && (
            <div className="dots-dropdown">
              <Link to="/courses" className="dots-link" onClick={() => setDotsOpen(false)}>
                <span className="dots-link-icon">📚</span>
                All Courses
              </Link>
              <Link to="/packs" className="dots-link" onClick={() => setDotsOpen(false)}>
                <span className="dots-link-icon">📦</span>
                Digital Packs
              </Link>
              <Link to="/admin" className="dots-link" onClick={() => setDotsOpen(false)}>
                <span className="dots-link-icon">⚙️</span>
                Admin Panel
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile overlay backdrop */}
      {menuOpen && (
        <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  )
}

export default Navbar
