import React from 'react'
import { Link } from 'react-router-dom'
import CourseCard from '../components/CourseCard/CourseCard'
import { SkeletonGrid } from '../components/Skeleton/Skeleton'
import { stats } from '../data/courses'
import { useCourses } from '../hooks/useCourses'
import { usePacks } from '../hooks/usePacks'
import './Home.css'

const Home = () => {
  const { courses, loading: coursesLoading } = useCourses()
  const { packs } = usePacks()
  return (
    <div className="home">

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1"></div>
          <div className="hero-orb orb-2"></div>
          <div className="hero-orb orb-3"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <span className="badge badge-primary">🚀 New courses added weekly</span>
          </div>
          <h1 className="hero-title">
            Learn Skills That
            <br />
            <span className="gradient-text">Shape Your Future</span>
          </h1>
          <p className="hero-subtitle">
            Join 50,000+ learners mastering in-demand skills.
            Expert-led courses — learn at your own pace.
          </p>
          <div className="hero-actions">
            <Link to="/courses" className="btn btn-primary btn-lg">Explore Courses →</Link>
            <Link to="/contact" className="btn btn-secondary btn-lg">Contact Us</Link>
          </div>
          <div className="hero-trust">
            <div className="trust-avatars">
              {['👨‍💻', '👩‍🎨', '👨‍🔬', '👩‍💼', '👨‍🎓'].map((emoji, i) => (
                <span key={i} className="trust-avatar">{emoji}</span>
              ))}
            </div>
            <p><strong>50,000+</strong> students already enrolled</p>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-value gradient-text">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ALL COURSES ===== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our <span className="gradient-text">Courses</span></h2>
            <p className="section-subtitle">
              Explore all available courses. New ones are added regularly — check back often.
            </p>
          </div>
          <div className="courses-grid">
            {coursesLoading
              ? <SkeletonGrid count={6} />
              : courses.map(course => <CourseCard key={course.id} course={course} />)
            }
          </div>
          <div className="section-cta">
            <Link to="/courses" className="btn btn-outline">Browse & Filter All Courses →</Link>
          </div>
        </div>
      </section>

      {/* ===== PACKS ===== */}
      <section className="section packs-home-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">📦 Digital <span className="gradient-text">Packs</span></h2>
            <p className="section-subtitle">
              Premium bundles of digital products. Buy once, use forever.
            </p>
          </div>
          <div className="courses-grid">
            {packs.map(pack => {
              const symbol = 'PKR '
              const discount = pack.originalPrice ? Math.round((1 - pack.price / pack.originalPrice) * 100) : null
              const whatsappMsg = encodeURIComponent(`Hi! I'm interested in the pack: "${pack.title}" — priced at ${symbol}${pack.price}. Can you help me get it?`)
              const whatsappLink = `https://wa.me/923036326202?text=${whatsappMsg}`
              const isImage = pack.thumbnail && (pack.thumbnail.startsWith('http') || pack.thumbnail.startsWith('data:'))
              return (
                <div key={pack.id} className="course-card">
                  <div className="card-thumb">
                    {isImage ? (
                      <img src={pack.thumbnail} alt={pack.title} className="card-thumb-img" />
                    ) : (
                      <div className="card-thumb-bg" style={{ background: pack.thumbnail }} />
                    )}
                    <div className="card-badges">
                      {pack.badge === 'Bestseller' && <span className="badge badge-warning">⭐ Bestseller</span>}
                      {pack.badge === 'New' && <span className="badge badge-success">✨ New</span>}
                      {discount && <span className="badge badge-success">-{discount}%</span>}
                    </div>
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{pack.title}</h3>
                    <p className="card-desc">{pack.description}</p>
                    <div className="card-price-row">
                      <span className="price-current">{symbol}{pack.price}</span>
                      {pack.originalPrice && <span className="price-original">{symbol}{pack.originalPrice}</span>}
                    </div>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Buy on WhatsApp
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="section-cta">
            <Link to="/packs" className="btn btn-outline">View All Packs →</Link>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section hiw-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
            <p className="section-subtitle">
              Getting started is simple. Three steps to your next skill.
            </p>
          </div>

          <div className="hiw-steps">
            {/* Arrow between steps */}
            <div className="hiw-card">
              <div className="hiw-number">1</div>
              <div className="hiw-icon">🔍</div>
              <h3>Browse</h3>
              <p>Explore our courses and digital packs — Web Dev, UI/UX, Python, Design Bundles and more. Find what matches your goal.</p>
            </div>

            <div className="hiw-arrow">→</div>

            <div className="hiw-card">
              <div className="hiw-number">2</div>
              <div className="hiw-icon">💬</div>
              <h3>Order on WhatsApp</h3>
              <p>Tap "Buy on WhatsApp" on any course or pack. Our team responds instantly to confirm your enrollment and payment.</p>
            </div>

            <div className="hiw-arrow">→</div>

            <div className="hiw-card hiw-card--accent">
              <div className="hiw-number">3</div>
              <div className="hiw-icon">🚀</div>
              <h3>Start Learning</h3>
              <p>Receive your materials instantly and start mastering new skills at your own pace — anytime, any device.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="hiw-cta">
            <Link to="/courses" className="btn btn-primary btn-lg">Browse Courses</Link>
            <a
              href="https://wa.me/923036326202?text=Hi!%20I%20want%20to%20know%20more%20about%20Birsil%20Courses."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-lg"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Talk to Us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to start your learning journey?</h2>
            <p>Join thousands of learners already building their dream careers.</p>
            <div className="cta-actions">
              <Link to="/courses" className="btn btn-primary btn-lg">Browse All Courses</Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">Talk to Us</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home
