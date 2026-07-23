import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const menuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close on route change
  useEffect(() => { setMenuOpen(false) }, [location])

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [menuOpen])

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-birsil">Birsil</span>
          <span className="logo-courses">Courses</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="navbar-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/courses">Courses</NavLink>
          <NavLink to="/free-courses">Free Courses</NavLink>
          <NavLink to="/packs">Packs</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        {/* Mobile 3-dot button */}
        <div className="mobile-menu-wrap" ref={menuRef}>
          <button
            className={`dots-btn ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Dropdown popover */}
          <div className={`mobile-dropdown ${menuOpen ? 'open' : ''}`} role="menu">
            <div className="mobile-dropdown-inner">
              <NavLink to="/" end onClick={() => setMenuOpen(false)}>
                <span className="md-icon">🏠</span> Home
              </NavLink>
              <NavLink to="/courses" onClick={() => setMenuOpen(false)}>
                <span className="md-icon">📚</span> All Courses
              </NavLink>
              <NavLink to="/free-courses" onClick={() => setMenuOpen(false)}>
                <span className="md-icon">🎁</span> Free Courses
              </NavLink>
              <NavLink to="/packs" onClick={() => setMenuOpen(false)}>
                <span className="md-icon">📦</span> Digital Packs
              </NavLink>
              <NavLink to="/contact" onClick={() => setMenuOpen(false)}>
                <span className="md-icon">💬</span> Contact
              </NavLink>
            </div>
          </div>
        </div>

      </div>
    </header>
  )
}

export default Navbar
