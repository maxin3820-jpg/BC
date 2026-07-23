import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { courses as localCourses } from '../data/courses'

export const useCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setCourses(localCourses)
      setLoading(false)
      return
    }

    // Initial fetch
    const fetchCourses = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (error || !data || data.length === 0) {
          setCourses(localCourses)
        } else {
          setCourses(data.map(mapCourse))
        }
      } catch {
        setCourses(localCourses)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()

    // Realtime subscription — any change in courses table re-fetches
    const channel = supabase
      .channel('courses-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, fetchCourses)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return { courses, loading }
}

export const mapCourse = (c) => ({
  id: c.id,
  title: c.title,
  description: c.description,
  price: c.price,
  originalPrice: c.original_price,
  currency: c.currency || 'PKR',
  thumbnail: c.thumbnail,
  isBestseller: c.is_bestseller,
  isNew: c.is_new,
  isFree: c.is_free,
  isActive: c.is_active,
})
