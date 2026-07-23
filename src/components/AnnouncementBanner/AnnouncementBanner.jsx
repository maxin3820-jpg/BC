import React from 'react'
import { useSettings } from '../../context/SettingsContext'
import './AnnouncementBanner.css'

const AnnouncementBanner = () => {
  const { settings } = useSettings()

  const isActive = settings.announcement_active === 'true'
  const text = settings.announcement_text?.trim()

  if (!isActive || !text) return null

  return (
    <div className="announcement-banner">
      <div className="announcement-inner">
        <span className="announcement-icon">📢</span>
        <span className="announcement-text">{text}</span>
      </div>
    </div>
  )
}

export default AnnouncementBanner
