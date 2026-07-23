import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const hardcodedFaqs = [
  { id: 1, question: 'How do I buy a course?', answer: 'Click "Buy on WhatsApp" on any course card and send us a message. We\'ll guide you through the purchase instantly.' },
  { id: 2, question: 'How do I pay?', answer: 'We accept JazzCash, Easypaisa, and Crypto. Contact us on WhatsApp and we\'ll guide you through the payment.' },
  { id: 3, question: 'Can I access on mobile?', answer: 'Yes. Everything works on phone, tablet and desktop. No app needed.' },
  { id: 4, question: 'Is there a refund policy?', answer: 'We do not offer refunds. However, if you face any issues with our products, we will fix them for you — just reach out to us on WhatsApp.' },
  { id: 5, question: 'What are Digital Packs?', answer: 'Packs are bundles of premium digital products — templates, design kits, code snippets and more. Buy once, use forever.' },
]

export const useFaqs = () => {
  const [faqs, setFaqs] = useState(hardcodedFaqs)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    const fetchFaqs = async () => {
      try {
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        if (!error && data?.length) {
          setFaqs(data.map(f => ({ id: f.id, question: f.question, answer: f.answer })))
        }
      } catch { /* keep defaults */ }
      finally { setLoading(false) }
    }

    fetchFaqs()

    // Realtime — admin changes reflect instantly
    const channel = supabase
      .channel('faqs-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faqs' }, fetchFaqs)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return { faqs, loading }
}
