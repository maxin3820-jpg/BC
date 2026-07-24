import React, { useState, useMemo } from 'react'
import CourseCard from '../components/CourseCard/CourseCard'
import { SkeletonGrid } from '../components/Skeleton/Skeleton'
import { useCourses } from '../hooks/useCourses'
import { usePacks } from '../hooks/usePacks'
import { useSettings } from '../context/SettingsContext'
import { courseMatchesSearch } from '../lib/search'
import './Courses.css'
import './Packs.css'

const PackCard = ({ pack, whatsappNumber }) => {
  const symbol = 'PKR '
  const isFree = pack.isFree || pack.price === 0
  const displayPrice = isFree ? 'Free' : `${symbol}${pack.price}`
  const discount = !isFree && pack.originalPrice ? Math.round((1 - pack.price / pack.originalPrice) * 100) : null
  const whatsappMsg = encodeURIComponent(
    isFree
      ? `Hi! I'm interested in the free pack: "${pack.title}". Can you help me get access?`
      : `Hi! I'm interested in the pack: "${pack.title}" — priced at ${displayPrice}. Can you help me get it?`
  )
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`

  return (
    <div className="pack-card">
      <div className="pack-thumb">
        {pack.thumbnail && (pack.thumbnail.startsWith('http') || pack.thumbnail.startsWith('data:')) ? (
          <img src={pack.thumbnail} alt={pack.title} loading="lazy" />
        ) : (
          <div className="pack-thumb-bg" style={{ background: pack.thumbnail }} />
        )}
        <div className="pack-thumb-badges">
          {isFree && <span className="badge badge-primary pack-badge-item">🎁 Free</span>}
          {!isFree && pack.badge && (
            <span className={`pack-badge-item badge ${pack.badge === 'Bestseller' ? 'badge-warning' : 'badge-success'}`}>
              {pack.badge === 'Bestseller' ? '⭐ ' : '✨ '}{pack.badge}
            </span>
          )}
          {!isFree && discount && <span className="pack-discount-badge">-{discount}%</span>}
        </div>
      </div>

      <div className="pack-body">
        <h3 className="pack-title">{pack.title}</h3>
        <p className="pack-desc">{pack.description}</p>

        <div className="card-price-row" style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <span className="price-current">{displayPrice}</span>
          {!isFree && pack.originalPrice && (
            <>
              <span className="price-original">{symbol}{pack.originalPrice}</span>
              {discount && <span className="price-discount">-{discount}%</span>}
            </>
          )}
        </div>

        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
          <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {isFree ? 'Get Free on WhatsApp' : 'Buy on WhatsApp'}
        </a>
      </div>
    </div>
  )
}


const FreeCourses = () => {
  const { courses, loading: coursesLoading } = useCourses()
  const { packs, loading: packsLoading } = usePacks()
  const { settings } = useSettings()
  const [search, setSearch] = useState('')

  const freeCourses = useMemo(() => {
    let result = courses.filter(c => c.isFree)
    if (search.trim()) {
      result = result.filter(c => courseMatchesSearch(c, search))
    }
    return result
  }, [search, courses])

  const freePacks = useMemo(() => {
    let result = packs.filter(p => p.isFree || p.price === 0)
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      result = result.filter(p => 
        p.title?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      )
    }
    return result
  }, [search, packs])

  const loading = coursesLoading || packsLoading

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
        ) : freeCourses.length > 0 || freePacks.length > 0 ? (
          <>
            {/* Free Courses Section */}
            {freeCourses.length > 0 && (
              <>
                <div style={{ marginBottom: '1rem', marginTop: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    🎓 Free Courses
                  </h2>
                  <p className="courses-count">
                    <strong>{freeCourses.length}</strong> free course{freeCourses.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="courses-grid-full">
                  {freeCourses.map(course => (
                    <CourseCard key={course.id} course={course} whatsappNumber={settings.whatsapp} />
                  ))}
                </div>
              </>
            )}

            {/* Free Packs Section */}
            {freePacks.length > 0 && (
              <>
                <div style={{ marginBottom: '1rem', marginTop: freeCourses.length > 0 ? '3rem' : '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    📦 Free Packs
                  </h2>
                  <p className="courses-count">
                    <strong>{freePacks.length}</strong> free pack{freePacks.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="packs-grid">
                  {freePacks.map(pack => (
                    <PackCard key={pack.id} pack={pack} whatsappNumber={settings.whatsapp} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="no-results">
            <span className="no-results-icon">🎁</span>
            <h3>{search ? 'No free content matches your search' : 'No free content available yet'}</h3>
            <p>{search ? 'Try a different search term.' : 'Check back soon — free courses and packs are added regularly.'}</p>
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
