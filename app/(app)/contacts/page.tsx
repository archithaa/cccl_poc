'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Contact, ContactStatus, CONTACT_STATUSES, STATUS_LABELS } from '@/lib/types'
import StatusBadge from '@/components/status-badge'
import { Plus, ExternalLink, MapPin, Users } from 'lucide-react'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filter, setFilter] = useState<ContactStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setContacts(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered =
    filter === 'all' ? contacts : contacts.filter(c => c.status === filter)

  const counts: Record<string, number> = { all: contacts.length }
  CONTACT_STATUSES.forEach(s => {
    counts[s] = contacts.filter(c => c.status === s).length
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 mt-1">Your outreach pipeline</p>
        </div>
        <Link
          href="/contacts/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Add Contact
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit flex-wrap">
        {(['all', ...CONTACT_STATUSES] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              filter === s
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {s === 'all' ? 'All' : STATUS_LABELS[s]} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            {filter !== 'all'
              ? `No contacts with status "${STATUS_LABELS[filter as ContactStatus]}"`
              : 'No contacts yet.'}
          </p>
          {filter === 'all' && (
            <Link
              href="/contacts/new"
              className="text-indigo-600 hover:underline text-sm mt-1 inline-block"
            >
              Add your first contact
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(contact => (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <StatusBadge status={contact.status} />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                {contact.name}
              </h3>
              {contact.title && (
                <p className="text-sm text-gray-600 mt-0.5">{contact.title}</p>
              )}
              {contact.company && (
                <p className="text-sm text-gray-500">{contact.company}</p>
              )}
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                {contact.location && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={11} />
                    {contact.location}
                  </span>
                )}
                {contact.years_experience && (
                  <span className="text-xs text-gray-400">
                    {contact.years_experience}y exp
                  </span>
                )}
                {contact.linkedin_url && (
                  <span className="flex items-center gap-1 text-xs text-indigo-500">
                    <ExternalLink size={11} />
                    LinkedIn
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
