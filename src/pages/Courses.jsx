import React, { useState, useMemo } from 'react'
import CourseCard from '../components/CourseCard/CourseCard'
import { SkeletonGrid } from '../components/Skeleton/Skeleton'
import { useCourses } from '../hooks/useCourses'
import './Courses.css'

const Courses = () => {
  const { courses, loading } = useCourses()
  const [search, setSearch] = useState('')
  const [showFreeOnly, setShowFreeOnly] = useState(false)

  const filtered = useMemo(() => {
    let result = [...courses]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      )
    }
    if (showFreeOnly) {
      result = result.filter(c => c.isFree)
    }
    return result
  }, [search, showFreeOnly, courses])

  return (
    <div className="courses-page">
      {/* Header */}
      <div className="courses-header">
        <div className="container">
          <h1>All <span className="gradient-text">Courses</span></h1>
          <p>Explore {courses.length}+ expert-led courses</p>

          {/* Single search bar */}
          <div className="courses-search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search courses"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear">✕</button>
            )}
          </div>

          {/* Free toggle */}
          <label className="courses-free-toggle">
            <input
              type="checkbox"
              checked={showFreeOnly}
              onChange={e => setShowFreeOnly(e.target.checked)}
            />
            <span className="toggle"></span>
            <span>Free courses only</span>
          </label>
        </div>
      </div>

      {/* Grid */}
      <div className="container courses-grid-wrap">
        <p className="courses-count"><strong>{filtered.length}</strong> course{filtered.length !== 1 ? 's' : ''}</p>

        {loading ? (
          <SkeletonGrid count={6} />
        ) : filtered.length > 0 ? (
          <div className="courses-grid-full">
            {filtered.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <h3>No courses found</h3>
            <p>Try a different search term.</p>
            <button className="btn btn-primary" onClick={() => { setSearch(''); setShowFreeOnly(false) }}>
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Courses
