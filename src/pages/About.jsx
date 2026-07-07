import React from 'react'
import { Link } from 'react-router-dom'
import { stats } from '../data/courses'
import './About.css'

const team = [
  { name: 'Birsil Founder', role: 'CEO & Founder', avatar: '👨‍💼', bio: 'Visionary behind Birsil Courses, passionate about democratizing quality education.' },
  { name: 'Head of Content', role: 'Chief Content Officer', avatar: '👩‍🏫', bio: 'Curates and oversees all course content to ensure the highest learning standards.' },
  { name: 'Lead Developer', role: 'CTO', avatar: '👨‍💻', bio: 'Builds the platform that powers learning for 50,000+ students worldwide.' },
  { name: 'Community Lead', role: 'Head of Community', avatar: '👩‍🎓', bio: 'Ensures every student feels supported throughout their learning journey.' },
]

const values = [
  { icon: '🌍', title: 'Accessibility', desc: 'Quality education should be available to everyone, everywhere, regardless of background.' },
  { icon: '💡', title: 'Innovation', desc: "We constantly evolve our platform to meet learners' changing needs and industry demands." },
  { icon: '🤝', title: 'Community', desc: 'Learning is better together. We foster a supportive, inclusive global community.' },
  { icon: '🏆', title: 'Excellence', desc: 'Every course goes through rigorous quality review before reaching our students.' },
]

const About = () => {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1"></div>
          <div className="hero-orb orb-2"></div>
        </div>
        <div className="container about-hero-content">
          <span className="badge badge-primary">Our Story</span>
          <h1 className="section-title" style={{ marginTop: '1rem', fontSize: 'var(--font-size-5xl)' }}>
            We Believe in the <span className="gradient-text">Power of Learning</span>
          </h1>
          <p className="hero-subtitle">
            Birsil Courses was founded with one mission — to make expert-quality education
            accessible to every curious mind on the planet. We are building the future of learning, one course at a time.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
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

      {/* Mission */}
      <section className="section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-text">
              <span className="badge badge-primary">Our Mission</span>
              <h2 className="section-title" style={{ marginTop: '1rem' }}>
                Empowering learners <span className="gradient-text">worldwide</span>
              </h2>
              <p>
                We started Birsil Courses because we saw a gap — brilliant people with the desire to
                learn but without access to affordable, high-quality instruction.
              </p>
              <p style={{ marginTop: '1rem' }}>
                Today, our platform connects thousands of expert instructors with learners in 80+ countries.
                Every course is designed to be practical, engaging, and career-ready.
              </p>
              <Link to="/courses" className="btn btn-primary" style={{ marginTop: '2rem' }}>
                Start Learning Free
              </Link>
            </div>
            <div className="mission-visual">
              <div className="mission-card mc-1">
                <span style={{ fontSize: '2rem' }}>🚀</span>
                <div><strong>Launch Your Career</strong><p>Real skills employers want</p></div>
              </div>
              <div className="mission-card mc-2">
                <span style={{ fontSize: '2rem' }}>🌍</span>
                <div><strong>Learn Globally</strong><p>80+ countries reached</p></div>
              </div>
              <div className="mission-card mc-3">
                <span style={{ fontSize: '2rem' }}>💬</span>
                <div><strong>Expert Mentors</strong><p>120+ active instructors</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our <span className="gradient-text">Core Values</span></h2>
            <p className="section-subtitle">The principles that guide everything we do.</p>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div key={i} className="value-card">
                <span className="value-icon">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Meet the <span className="gradient-text">Team</span></h2>
            <p className="section-subtitle">The passionate people building the future of online education.</p>
          </div>
          <div className="team-grid">
            {team.map((member, i) => (
              <div key={i} className="team-card">
                <span className="team-avatar">{member.avatar}</span>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to join the Birsil family?</h2>
            <p>Start with a free course today. No commitment required.</p>
            <div className="cta-actions">
              <Link to="/courses" className="btn btn-primary btn-lg">Explore Courses</Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">Get in Touch</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
