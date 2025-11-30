import { useEffect, useState } from 'react'
import { getTodaysQuote } from '@/lib/api/quotes'

export default function DailyQuote() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadQuote = async () => {
      try {
        const q = await getTodaysQuote()
        setQuote(q)
      } catch (error) {
        console.error('Failed to load quote:', error)
      } finally {
        setLoading(false)
      }
    }
    loadQuote()
  }, [])

  if (loading) return null
  if (!quote) return null

  return (
    <div className="mt-6 p-4 sm:p-5 bg-[#fffae7] border-3 border-black text-center">
      <div className="text-sm sm:text-base font-black text-black mb-2">💪 TODAY'S MOTIVATION</div>
      <div className="text-base sm:text-lg text-black font-bold mb-2">"{quote.text}"</div>
      {quote.author && (
        <div className="text-xs sm:text-sm text-gray-600 font-bold">— {quote.author}</div>
      )}
    </div>
  )
}
