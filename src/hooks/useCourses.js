import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { courses as localCourses } from '../data/courses'

export const useCourses = () => {
  const [courses, setCourses] = useState(localCourses)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // No Supabase configured — use local data instantly
    if (!supabase) {
      setLoading(false)
      return
    }

    setLoading(true)
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (error || !data || data.length === 0) {
          setCourses(localCourses)
        } else {
          setCourses(data.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            price: c.price,
            originalPrice: c.original_price,
            currency: c.currency,
            thumbnail: c.thumbnail,
            isBestseller: c.is_bestseller,
            isNew: c.is_new,
            isFree: c.is_free,
          })))
        }
      } catch {
        setCourses(localCourses)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  return { courses, loading }
}
