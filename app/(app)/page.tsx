'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Contact, Conversation, ContactStatus, STATUS_LABELS, CONTACT_STATUSES } from '@/lib/types'
import StatusBadge from '@/components/status-badge'
import { Users, MessageSquare, TrendingUp, UserPlus } from 'lucide-react'

interface Stats {
  total: number
  byStatus: Record<ContactStatus, number>
  conversations: number
  wouldJoin: number
}

interface ThemeCount {
  theme: string
  count: number
}

const statCards = (stats: Stats) => [
  {
    label: 'Total Contacts',
    value: stats.total,
    icon: Users,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
  {
    label: 'Chats Completed',
    value: stats.byStatus.completed,
    icon: MessageSquare,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    label: 'Conversations Logged',
    value: stats.conversations,
    icon: TrendingUp,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Would Join Exchange',
    value: stats.wouldJoin,
    icon: UserPlus,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [themes, setThemes] = useState<ThemeCount[]>([])
  const [recent, setRecent] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [contactsRes, convsRes] = await Promise.all([
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('conversations').select('*'),
      ])

      const contacts: Contact[] = contactsRes.data ?? []
      const convs: Conversation[] = convsRes.data ?? []

      const byStatus = Object.fromEntries(
        CONTACT_STATUSES.map(s => [s, contacts.filter(c => c.status === s).length])
      ) as Record<ContactStatus, number>

      const themeCounts: Record<string, number> = {}
      convs.forEach(c => {
        c.themes.forEach(t => {
          themeCounts[t] = (themeCounts[t] ?? 0) + 1
        })
      })

      setStats({
        total: contacts.length,
        byStatus,
        conversations: convs.length,
        wouldJoin: convs.filter(c => c.would_join_exchange === 'yes').length,
      })
      setThemes(
        Object.entries(themeCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([theme, count]) => ({ theme, count }))
      )
      setRecent(contacts.slice(0, 5))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  const maxThemeCount = themes[0]?.count ?? 1

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Your research pipeline at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats &&
          statCards(stats).map(({ label, value, icon: Icon, iconBg, iconColor }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
              <div
                className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center mb-3`}
              >
                <Icon size={18} className={iconColor} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Pipeline breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Pipeline</h2>
          <div className="space-y-3">
            {stats &&
              CONTACT_STATUSES.map(status => (
                <div key={status} className="flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="text-sm font-medium text-gray-900">
                    {stats.byStatus[status]}
                  </span>
                </div>
              ))}
          </div>
          <Link
            href="/contacts"
            className="block text-xs text-indigo-600 hover:text-indigo-700 mt-4 font-medium"
          >
            View all contacts →
          </Link>
        </div>

        {/* Top themes */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Top Themes</h2>
          {themes.length === 0 ? (
            <p className="text-sm text-gray-400">
              No conversations logged yet.{' '}
              <Link href="/contacts" className="text-indigo-600 hover:underline">
                Start with a contact.
              </Link>
            </p>
          ) : (
            <div className="space-y-2.5">
              {themes.map(({ theme, count }) => (
                <div key={theme}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate">{theme}</span>
                    <span className="text-gray-400 ml-2 shrink-0">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(count / maxThemeCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/research"
            className="block text-xs text-indigo-600 hover:text-indigo-700 mt-4 font-medium"
          >
            Full research view →
          </Link>
        </div>
      </div>

      {/* Recent contacts */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Contacts</h2>
          <Link
            href="/contacts/new"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            + Add contact
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-400">
            No contacts yet.{' '}
            <Link href="/contacts/new" className="text-indigo-600 hover:underline">
              Add your first one.
            </Link>
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recent.map(contact => (
              <Link
                key={contact.id}
                href={`/contacts/${contact.id}`}
                className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-5 px-5 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                  <p className="text-xs text-gray-500">
                    {[contact.company, contact.title].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <StatusBadge status={contact.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
