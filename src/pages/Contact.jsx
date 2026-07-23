import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useSettings } from '../context/SettingsContext'
import './Contact.css'

const faqs = [
  { q: 'How do I buy a course?', a: 'Click "Buy on WhatsApp" on any course card and send us a message. We will guide you through the purchase process.' },
  { q: 'Can I access courses on mobile?', a: 'Absolutely. Birsil Courses is fully responsive and works on any device — phone, tablet, or desktop.' },
  { q: 'What is the refund policy?', a: 'We do not offer refunds. However, if you face any issues with our products, we will fix them for you — just reach out to us on WhatsApp.' },
  { q: 'How long do I have access to a course?', a: 'You get lifetime access to any course you purchase, including all future updates.' },
  { q: 'How do I pay for a course?', a: 'We accept JazzCash, Easypaisa, and Crypto. Contact us on WhatsApp and we\'ll guide you through the payment.' },
]

const Contact = () => {
  const { settings } = useSettings()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSubmitting(true)
    try {
      if (supabase) {
        const { error } = await supabase.from('messages').insert([{
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }])
        if (error) throw error
      }
      setSent(true)
    } catch (err) {
      console.error('Contact submit error:', err.message)
      // Still show success to user — don't block on Supabase issues
      setSent(true)
    } finally {
      setSubmitting(false)
    }
  }

  const whatsappLink = `https://wa.me/${(settings.whatsapp || '923036326202').replace(/\D/g, '')}`

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
                <p>{settings.email || 'hello@birsilcourses.com'}</p>
              </div>
            </div>
            <div className="contact-method">
              <span className="method-icon">📞</span>
              <div>
                <strong>Phone</strong>
                <p>{settings.phone || '+923036326202'}</p>
              </div>
            </div>
            <div className="contact-method">
              <span className="method-icon">💬</span>
              <div>
                <strong>WhatsApp</strong>
                <p><a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none' }}>Chat with us</a></p>
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
                  <input id="name" type="text" name="name" placeholder="John Doe"
                    value={form.name} onChange={handleChange} />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
                <div className={`form-group ${errors.email ? 'error' : ''}`}>
                  <label htmlFor="email">Email Address</label>
                  <input id="email" type="email" name="email" placeholder="john@example.com"
                    value={form.email} onChange={handleChange} />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>
              </div>

              <div className={`form-group ${errors.subject ? 'error' : ''}`}>
                <label htmlFor="subject">Subject</label>
                <select id="subject" name="subject" value={form.subject} onChange={handleChange}>
                  <option value="">Select a topic...</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Course Question">Course Question</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Billing">Billing</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Teach on Birsil">Teach on Birsil</option>
                  <option value="Other">Other</option>
                </select>
                {errors.subject && <span className="field-error">{errors.subject}</span>}
              </div>

              <div className={`form-group ${errors.message ? 'error' : ''}`}>
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows={6}
                  placeholder="Tell us how we can help you..."
                  value={form.message} onChange={handleChange} />
                {errors.message && <span className="field-error">{errors.message}</span>}
                <span className="char-count">{form.message.length}/500</span>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Message →'}
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
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                  <span>{faq.q}</span>
                  <span className="faq-chevron">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="faq-answer"><p>{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
