import React, { useState, useMemo } from 'react'
import CourseCard from '../components/CourseCard/CourseCard'
import { courses } from '../data/courses'
import './Courses.css'

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
]

const Courses = () => {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [showFreeOnly, setShowFreeOnly] = useState(false)

  const filtered = useMemo(() => {
    let result = [...courses]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    if (showFreeOnly) {
      result = result.filter(c => c.isFree)
    }

    switch (sortBy) {
      case 'rating':     result.sort((a, b) => b.rating - a.rating); break
      case 'newest':     result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break
      case 'price-low':  result.sort((a, b) => a.price - b.price); break
      case 'price-high': result.sort((a, b) => b.price - a.price); break
      default:           result.sort((a, b) => b.students - a.students)
    }

    return result
  }, [search, sortBy, showFreeOnly])

  const clearFilters = () => {
    setSearch('')
    setSortBy('popular')
    setShowFreeOnly(false)
  }

  const hasActiveFilters = search || showFreeOnly

  return (
    <div className="courses-page">
      <div className="courses-header">
        <div className="container">
          <h1>All <span className="gradient-text">Courses</span></h1>
          <p>Explore {courses.length}+ expert-led courses</p>
        </div>
      </div>

      <div className="container courses-layout">
        {/* SIDEBAR */}
        <aside className="courses-sidebar">
          <div className="sidebar-section">
            <h3>Search</h3>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search courses"
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch('')}>✕</button>
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <label className="toggle-label">
              <span>Free Courses Only</span>
              <input
                type="checkbox"
                checked={showFreeOnly}
                onChange={e => setShowFreeOnly(e.target.checked)}
              />
              <span className="toggle"></span>
            </label>
          </div>

          {hasActiveFilters && (
            <button className="btn btn-secondary btn-sm clear-btn" onClick={clearFilters}>
              ✕ Clear Filters
            </button>
          )}
        </aside>

        {/* MAIN */}
        <div className="courses-main">
          <div className="courses-toolbar">
            <p className="results-count">
              <strong>{filtered.length}</strong> course{filtered.length !== 1 ? 's' : ''} found
            </p>
            <div className="sort-control">
              <label htmlFor="sort">Sort by:</label>
              <select id="sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="courses-grid-full">
              {filtered.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <span className="no-results-icon">🔍</span>
              <h3>No courses found</h3>
              <p>Try adjusting your filters or search term.</p>
              <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Courses
