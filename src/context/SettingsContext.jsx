import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const defaultSettings = {
  site_name: 'Birsil Courses',
  tagline: 'Learn Skills That Shape Your Future',
  email: 'maxin3820@gmail.com',
  phone: '+923036326202',
  whatsapp: '+923036326202',
  twitter: 'https://twitter.com',
  youtube: 'https://youtube.com',
  linkedin: 'https://linkedin.com',
  instagram: 'https://instagram.com',
  announcement_text: '',
  announcement_active: 'false',
  hero_badge: '',
  hero_headline: '',
  hero_subtext: '',
}

const SettingsContext = createContext({ settings: defaultSettings, loading: false })

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('site_settings').select('key, value')
        if (!error && data?.length) {
          const obj = data.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
          setSettings({ ...defaultSettings, ...obj })
        }
      } catch { /* use defaults */ }
      finally { setLoading(false) }
    }

    fetchSettings()

    const channel = supabase
      .channel('settings-global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, fetchSettings)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
