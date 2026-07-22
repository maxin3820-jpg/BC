import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { packs as localPacks } from '../data/packs'

export const usePacks = () => {
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setPacks(localPacks)
      setLoading(false)
      return
    }

    const fetchPacks = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('packs')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (error || !data || data.length === 0) {
          setPacks(localPacks)
        } else {
          setPacks(data.map(mapPack))
        }
      } catch {
        setPacks(localPacks)
      } finally {
        setLoading(false)
      }
    }

    fetchPacks()

    // Realtime subscription
    const channel = supabase
      .channel('packs-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'packs' }, fetchPacks)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return { packs, loading }
}

export const mapPack = (p) => ({
  id: p.id,
  title: p.title,
  description: p.description,
  price: p.price,
  originalPrice: p.original_price,
  currency: p.currency || 'PKR',
  thumbnail: p.thumbnail,
  badge: p.badge,
  items: p.items || [],
})
