import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { packs as localPacks } from '../pages/Packs'

export const usePacks = () => {
  const [packs, setPacks] = useState(localPacks)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // No Supabase configured — use local data instantly
    if (!supabase) {
      setLoading(false)
      return
    }

    setLoading(true)
    const fetchPacks = async () => {
      try {
        const { data, error } = await supabase
          .from('packs')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (error || !data || data.length === 0) {
          setPacks(localPacks)
        } else {
          setPacks(data.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            price: p.price,
            originalPrice: p.original_price,
            currency: p.currency,
            thumbnail: p.thumbnail,
            badge: p.badge,
            items: p.items || [],
          })))
        }
      } catch {
        setPacks(localPacks)
      } finally {
        setLoading(false)
      }
    }

    fetchPacks()
  }, [])

  return { packs, loading }
}
