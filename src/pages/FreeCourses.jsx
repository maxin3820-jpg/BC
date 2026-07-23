import React, { useState, useMemo } from 'react'
import CourseCard from '../components/CourseCard/CourseCard'
import { SkeletonGrid } from '../components/Skeleton/Skeleton'
import { useCourses } from '../hooks/useCourses'
import { useSettings } from '../context/SettingsContext'
import './Courses.css'

const FreeCourses = () => {
  const { courses, loading } = useCourses()
  const { settings } = useSettings()
  const [search, setSearch] = useState('')

  const freeCourses = useMemo(() => {
    let result = courses.filter(c => c.isFree)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [search, courses])

  return (
    <div className="courses-page">
      {/* Header */}
      <div className="courses-header">
        <div className="container">
          <span className="badge badge-success" style={{ marginBottom: '1rem', display: 'inline-block' }}>🎁 100% Free</span>
          <h1>Free <span className="gradient-text">Courses</span></h1>
          <p>Quality learning at zero cost — no payment, no WhatsApp needed.</p>

          {/* Search */}
          <div className="courses-search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search free courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search free courses"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear">✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container courses-grid-wrap">
        {loading ? (
          <SkeletonGrid count={6} />
        ) : freeCourses.length > 0 ? (
          <>
            <p className="courses-count"><strong>{freeCourses.length}</strong> free course{freeCourses.length !== 1 ? 's' : ''}</p>
            <div className="courses-grid-full">
              {freeCourses.map(course => (
                <CourseCard key={course.id} course={course} whatsappNumber={settings.whatsapp} />
              ))}
            </div>
          </>
        ) : (
          <div className="no-results">
            <span className="no-results-icon">🎁</span>
            <h3>{search ? 'No free courses match your search' : 'No free courses available yet'}</h3>
            <p>{search ? 'Try a different search term.' : 'Check back soon — free courses are added regularly.'}</p>
            {search && (
              <button className="btn btn-primary" onClick={() => setSearch('')}>Clear Search</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FreeCourses
