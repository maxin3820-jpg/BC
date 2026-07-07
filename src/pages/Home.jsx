import React from 'react'
import { Link } from 'react-router-dom'
import CourseCard from '../components/CourseCard/CourseCard'
import { courses, stats } from '../data/courses'
import './Home.css'

const Home = () => {
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
            <Link to="/about" className="btn btn-secondary btn-lg">How It Works</Link>
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
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <div className="section-cta">
            <Link to="/courses" className="btn btn-outline">Browse & Filter All Courses →</Link>
          </div>
        </div>
      </section>

      {/* ===== WHY US ===== */}
      <section className="section why-section">
        <div className="container">
          <div className="why-grid">
            <div className="why-text">
              <span className="badge badge-primary">Why Birsil?</span>
              <h2 className="section-title" style={{ marginTop: '1rem' }}>
                Learn the way <span className="gradient-text">you want</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                We believe education should be accessible to everyone. Our platform is built
                to make learning flexible, engaging, and results-driven.
              </p>
              <div className="why-features">
                {whyFeatures.map((f, i) => (
                  <div key={i} className="why-feature">
                    <span className="why-icon">{f.icon}</span>
                    <div>
                      <strong>{f.title}</strong>
                      <p>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Start Learning Today
              </Link>
            </div>
            <div className="why-visual">
              <div className="visual-card main-visual">
                <div className="vc-icon">📚</div>
                <div>
                  <strong>500+ Courses</strong>
                  <p>Growing every week</p>
                </div>
              </div>
              <div className="visual-card secondary-visual v1">
                <div className="vc-icon">⭐</div>
                <div>
                  <strong>4.8 Avg Rating</strong>
                  <p>From 80K+ reviews</p>
                </div>
              </div>
              <div className="visual-card secondary-visual v2">
                <div className="vc-icon">🏆</div>
                <div>
                  <strong>Certificates</strong>
                  <p>Industry recognized</p>
                </div>
              </div>
              <div className="visual-card secondary-visual v3">
                <div className="vc-icon">♾️</div>
                <div>
                  <strong>Lifetime Access</strong>
                  <p>Learn at your pace</p>
                </div>
              </div>
            </div>
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

const whyFeatures = [
  { icon: '🎥', title: 'HD Video Lessons', desc: 'Crystal-clear video content with subtitles in multiple languages.' },
  { icon: '📱', title: 'Learn Anywhere', desc: 'Access courses on mobile, tablet, or desktop — anytime, anywhere.' },
  { icon: '🏆', title: 'Earn Certificates', desc: 'Get industry-recognized certificates upon course completion.' },
  { icon: '💬', title: 'Community Support', desc: 'Ask questions and get answers from instructors and peers.' },
]

export default Home
