'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Conversation, ResearchQuestion } from '@/lib/types'
import { ClipboardList, TrendingUp } from 'lucide-react'

interface ThemeCount {
  theme: string
  count: number
}

export default function ResearchPage() {
  const [questions, setQuestions] = useState<ResearchQuestion[]>([])
  const [themes, setThemes] = useState<ThemeCount[]>([])
  const [wouldJoin, setWouldJoin] = useState({ yes: 0, no: 0, maybe: 0 })
  const [totalConvs, setTotalConvs] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [questionsRes, convsRes] = await Promise.all([
        supabase.from('research_questions').select('*').order('sort_order'),
        supabase.from('conversations').select('*'),
      ])

      const convs: Conversation[] = convsRes.data ?? []

      const themeCounts: Record<string, number> = {}
      convs.forEach(c => {
        c.themes.forEach(t => {
          themeCounts[t] = (themeCounts[t] ?? 0) + 1
        })
      })

      setQuestions(questionsRes.data ?? [])
      setThemes(
        Object.entries(themeCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([theme, count]) => ({ theme, count }))
      )
      setWouldJoin({
        yes: convs.filter(c => c.would_join_exchange === 'yes').length,
        no: convs.filter(c => c.would_join_exchange === 'no').length,
        maybe: convs.filter(c => c.would_join_exchange === 'maybe').length,
      })
      setTotalConvs(convs.length)
      setLoading(false)
    }
    load()
  }, [])

  const categories = [...new Set(questions.map(q => q.category))]
  const maxCount = themes[0]?.count ?? 1

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Research</h1>
        <p className="text-gray-500 mt-1">Questions for your chats + what you've learned</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Questions */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <ClipboardList size={18} className="text-indigo-600" />
            <h2 className="font-semibold text-gray-900">Before your next chat</h2>
          </div>
          <div className="space-y-5">
            {categories.map(cat => (
              <div key={cat}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {cat}
                </p>
                <div className="space-y-2">
                  {questions
                    .filter(q => q.category === cat)
                    .map(q => (
                      <div
                        key={q.id}
                        className="bg-white border border-gray-200 rounded-lg p-3"
                      >
                        <p className="text-sm text-gray-800">{q.question_text}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-indigo-600" />
            <h2 className="font-semibold text-gray-900">What you've learned</h2>
          </div>

          {/* Would join stats */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Would join peer exchange?{' '}
              <span className="text-gray-400 font-normal">({totalConvs} conversations)</span>
            </p>
            <div className="space-y-2.5">
              {[
                { label: 'Yes', count: wouldJoin.yes, bar: 'bg-green-500' },
                { label: 'Maybe', count: wouldJoin.maybe, bar: 'bg-amber-400' },
                { label: 'No', count: wouldJoin.no, bar: 'bg-red-400' },
              ].map(({ label, count, bar }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-12">{label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${bar} rounded-full transition-all`}
                      style={{
                        width:
                          totalConvs > 0 ? `${(count / totalConvs) * 100}%` : '0%',
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-4 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Theme frequency */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm font-medium text-gray-700 mb-3">Theme frequency</p>
            {themes.length === 0 ? (
              <p className="text-sm text-gray-400">
                No conversations logged yet. Start chatting and logging to see patterns
                emerge.
              </p>
            ) : (
              <div className="space-y-2.5">
                {themes.map(({ theme, count }) => (
                  <div key={theme}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{theme}</span>
                      <span className="text-gray-400">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
