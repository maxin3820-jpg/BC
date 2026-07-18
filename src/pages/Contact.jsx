import React, { useState } from 'react'
import './Contact.css'

const faqs = [
  { q: 'How do I enroll in a course?', a: 'Click "Buy on WhatsApp" on any course card and send us a message. We will guide you through the enrollment process.' },
  { q: 'Can I access courses on mobile?', a: 'Absolutely. Birsil Courses is fully responsive and works on any device — phone, tablet, or desktop.' },
  { q: 'What is the refund policy?', a: 'We offer a 30-day money-back guarantee on all paid courses, no questions asked.' },
  { q: 'How long do I have access to a course?', a: 'You get lifetime access to any course you enroll in, including all future updates.' },
  { q: 'How do I pay for a course?', a: 'Contact us via WhatsApp and we will share the available payment methods.' },
]

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email is required'
    if (!form.subject.trim()) e.subject = 'Subject is required'
    if (!form.message.trim() || form.message.length < 10) e.message = 'Message must be at least 10 characters'
    return e
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSent(true)
  }

  return (
    <div className="contact-page">
      {/* Header */}
      <div className="contact-header">
        <div className="container">
          <span className="badge badge-primary">Get in Touch</span>
          <h1>We'd Love to <span className="gradient-text">Hear From You</span></h1>
          <p>Have a question, feedback, or want to collaborate? We're here for you.</p>
        </div>
      </div>

      <div className="container contact-layout">
        {/* Info */}
        <div className="contact-info">
          <h2>Contact Information</h2>
          <p>Reach out through any of these channels and our team will get back to you within 24 hours.</p>

          <div className="contact-methods">
            <div className="contact-method">
              <span className="method-icon">📧</span>
              <div>
                <strong>Email Us</strong>
                <p>hello@birsilcourses.com</p>
              </div>
            </div>
            <div className="contact-method">
              <span className="method-icon">💬</span>
              <div>
                <strong>Live Chat</strong>
                <p>Available Mon–Fri, 9am–6pm</p>
              </div>
            </div>
            <div className="contact-method">
              <span className="method-icon">📞</span>
              <div>
                <strong>Phone</strong>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="contact-method">
              <span className="method-icon">📍</span>
              <div>
                <strong>Location</strong>
                <p>Remote-first, Global Team</p>
              </div>
            </div>
          </div>

          <div className="response-time">
            <span>⚡</span>
            <div>
              <strong>Average Response Time</strong>
              <p>Under 24 hours on business days</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="contact-form-wrapper">
          {sent ? (
            <div className="success-state">
              <span className="success-icon">✉️</span>
              <h3>Message Sent!</h3>
              <p>Thanks for reaching out, <strong>{form.name}</strong>. We'll get back to you at <strong>{form.email}</strong> within 24 hours.</p>
              <button className="btn btn-primary" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <h2>Send a Message</h2>

              <div className="form-row">
                <div className={`form-group ${errors.name ? 'error' : ''}`}>
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && <span className="field-error" id="name-error">{errors.name}</span>}
                </div>
                <div className={`form-group ${errors.email ? 'error' : ''}`}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && <span className="field-error" id="email-error">{errors.email}</span>}
                </div>
              </div>

              <div className={`form-group ${errors.subject ? 'error' : ''}`}>
                <label htmlFor="subject">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  aria-describedby={errors.subject ? 'subject-error' : undefined}
                >
                  <option value="">Select a topic...</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Course Question">Course Question</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Billing">Billing</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Teach on Birsil">Teach on Birsil</option>
                  <option value="Other">Other</option>
                </select>
                {errors.subject && <span className="field-error" id="subject-error">{errors.subject}</span>}
              </div>

              <div className={`form-group ${errors.message ? 'error' : ''}`}>
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder="Tell us how we can help you..."
                  value={form.message}
                  onChange={handleChange}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                />
                {errors.message && <span className="field-error" id="message-error">{errors.message}</span>}
                <span className="char-count">{form.message.length}/500</span>
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                Send Message →
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FAQ */}
      <section className="section faq-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked <span className="gradient-text">Questions</span></h2>
            <p className="section-subtitle">Quick answers to common questions.</p>
          </div>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{faq.q}</span>
                  <span className="faq-chevron">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
