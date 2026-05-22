'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  Contact,
  Conversation,
  ContactStatus,
  CONTACT_STATUSES,
  STATUS_LABELS,
  THEMES,
  WouldJoin,
} from '@/lib/types'
import StatusBadge from '@/components/status-badge'
import { ArrowLeft, ExternalLink, Edit2, Save, X, Plus, ChevronUp } from 'lucide-react'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const JOIN_STYLES: Record<WouldJoin, string> = {
  yes: 'bg-green-100 text-green-700',
  no: 'bg-red-100 text-red-600',
  maybe: 'bg-amber-100 text-amber-700',
}

const JOIN_BTN_ACTIVE: Record<WouldJoin, string> = {
  yes: 'bg-green-100 border-green-400 text-green-700',
  no: 'bg-red-100 border-red-400 text-red-600',
  maybe: 'bg-amber-100 border-amber-400 text-amber-700',
}

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [contact, setContact] = useState<Contact | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Contact>>({})
  const [saving, setSaving] = useState(false)
  const [showConvForm, setShowConvForm] = useState(false)
  const [savingConv, setSavingConv] = useState(false)

  const [convForm, setConvForm] = useState({
    date: new Date().toISOString().split('T')[0],
    duration_minutes: '',
    hardest_part: '',
    ai_gaps: '',
    would_join_exchange: '' as WouldJoin | '',
    other_notes: '',
    themes: [] as string[],
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [contactRes, convsRes] = await Promise.all([
        supabase.from('contacts').select('*').eq('id', id).single(),
        supabase
          .from('conversations')
          .select('*')
          .eq('contact_id', id)
          .order('created_at', { ascending: false }),
      ])
      if (contactRes.data) {
        setContact(contactRes.data)
        setEditForm(contactRes.data)
      } else {
        router.push('/contacts')
      }
      setConversations(convsRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [id, router])

  async function saveContact() {
    if (!contact) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('contacts')
      .update({
        name: editForm.name,
        company: editForm.company,
        title: editForm.title,
        linkedin_url: editForm.linkedin_url,
        years_experience: editForm.years_experience,
        location: editForm.location,
        status: editForm.status,
        notes: editForm.notes,
      })
      .eq('id', contact.id)
      .select()
      .single()
    if (data) {
      setContact(data)
      setEditing(false)
    }
    setSaving(false)
  }

  async function saveConversation() {
    if (!contact) return
    setSavingConv(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('conversations')
      .insert({
        contact_id: contact.id,
        date: convForm.date || null,
        duration_minutes: convForm.duration_minutes
          ? parseInt(convForm.duration_minutes)
          : null,
        hardest_part: convForm.hardest_part || null,
        ai_gaps: convForm.ai_gaps || null,
        would_join_exchange: convForm.would_join_exchange || null,
        other_notes: convForm.other_notes || null,
        themes: convForm.themes,
      })
      .select()
      .single()
    if (data) {
      setConversations(prev => [data, ...prev])
      setShowConvForm(false)
      setConvForm({
        date: new Date().toISOString().split('T')[0],
        duration_minutes: '',
        hardest_part: '',
        ai_gaps: '',
        would_join_exchange: '',
        other_notes: '',
        themes: [],
      })
    }
    setSavingConv(false)
  }

  function toggleTheme(theme: string) {
    setConvForm(f => ({
      ...f,
      themes: f.themes.includes(theme)
        ? f.themes.filter(t => t !== theme)
        : [...f.themes, theme],
    }))
  }

  function field(f: string, value: string) {
    setEditForm(prev => ({ ...prev, [f]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }
  if (!contact) return null

  const inputCls =
    'w-full text-sm border-b border-indigo-300 focus:outline-none bg-transparent pb-0.5'

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/contacts"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to contacts
      </Link>

      {/* Contact card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl shrink-0">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              {editing ? (
                <input
                  className={`${inputCls} text-xl font-bold`}
                  value={editForm.name ?? ''}
                  onChange={e => field('name', e.target.value)}
                />
              ) : (
                <h1 className="text-xl font-bold text-gray-900">{contact.name}</h1>
              )}
              {editing ? (
                <input
                  className={`${inputCls} mt-1`}
                  value={editForm.title ?? ''}
                  onChange={e => field('title', e.target.value)}
                  placeholder="Title"
                />
              ) : (
                contact.title && (
                  <p className="text-sm text-gray-600 mt-0.5">{contact.title}</p>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={saveContact}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    setEditForm(contact)
                  }}
                  className="flex items-center gap-1.5 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  <X size={14} />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <Edit2 size={14} />
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {[
            {
              label: 'Company',
              field: 'company',
              value: contact.company,
              placeholder: 'Company',
            },
            {
              label: 'Location',
              field: 'location',
              value: contact.location,
              placeholder: 'Bangalore, India',
            },
            {
              label: 'Experience',
              field: 'years_experience',
              value: contact.years_experience ? `${contact.years_experience} years` : null,
              placeholder: '15',
              type: 'number',
            },
          ].map(({ label, field: f, value, placeholder, type }) => (
            <div key={f}>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                {label}
              </p>
              {editing ? (
                <input
                  type={type ?? 'text'}
                  className={inputCls}
                  value={
                    f === 'years_experience'
                      ? (editForm.years_experience ?? '')
                      : ((editForm as Record<string, string | null>)[f] ?? '')
                  }
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      [f]:
                        f === 'years_experience'
                          ? e.target.value
                            ? parseInt(e.target.value)
                            : null
                          : e.target.value || null,
                    }))
                  }
                  placeholder={placeholder}
                />
              ) : (
                <p className="text-sm text-gray-900">{value ?? '—'}</p>
              )}
            </div>
          ))}

          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
              Status
            </p>
            {editing ? (
              <select
                value={editForm.status ?? contact.status}
                onChange={e => field('status', e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CONTACT_STATUSES.map(s => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            ) : (
              <StatusBadge status={contact.status} />
            )}
          </div>

          <div className="col-span-2">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
              LinkedIn
            </p>
            {editing ? (
              <input
                type="url"
                className={inputCls}
                value={editForm.linkedin_url ?? ''}
                onChange={e => field('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            ) : contact.linkedin_url ? (
              <a
                href={contact.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <ExternalLink size={13} />
                View profile
              </a>
            ) : (
              <p className="text-sm text-gray-900">—</p>
            )}
          </div>

          <div className="col-span-2">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
              Notes
            </p>
            {editing ? (
              <textarea
                value={editForm.notes ?? ''}
                onChange={e => field('notes', e.target.value)}
                rows={3}
                className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Context, how you found them..."
              />
            ) : (
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {contact.notes || '—'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Conversations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">
            Conversations ({conversations.length})
          </h2>
          <button
            onClick={() => setShowConvForm(f => !f)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            {showConvForm ? <ChevronUp size={14} /> : <Plus size={14} />}
            {showConvForm ? 'Hide form' : 'Log conversation'}
          </button>
        </div>

        {showConvForm && (
          <div className="bg-white border border-indigo-200 rounded-xl p-6 mb-4">
            <h3 className="font-medium text-gray-900 mb-4">Log a conversation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={convForm.date}
                  onChange={e => setConvForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Duration (min)
                </label>
                <input
                  type="number"
                  value={convForm.duration_minutes}
                  onChange={e =>
                    setConvForm(f => ({ ...f, duration_minutes: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="30"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Hardest part of their transition
                </label>
                <textarea
                  value={convForm.hardest_part}
                  onChange={e =>
                    setConvForm(f => ({ ...f, hardest_part: e.target.value }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="What they said was hardest..."
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  AI knowledge gaps
                </label>
                <textarea
                  value={convForm.ai_gaps}
                  onChange={e => setConvForm(f => ({ ...f, ai_gaps: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="What they wish they understood better about AI..."
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Would join peer exchange?
                </label>
                <div className="flex gap-3">
                  {(['yes', 'no', 'maybe'] as WouldJoin[]).map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() =>
                        setConvForm(f => ({ ...f, would_join_exchange: v }))
                      }
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
                        convForm.would_join_exchange === v
                          ? JOIN_BTN_ACTIVE[v]
                          : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Themes identified
                </label>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map(theme => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => toggleTheme(theme)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        convForm.themes.includes(theme)
                          ? 'bg-indigo-100 border-indigo-400 text-indigo-700'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Other notes
                </label>
                <textarea
                  value={convForm.other_notes}
                  onChange={e =>
                    setConvForm(f => ({ ...f, other_notes: e.target.value }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Anything else worth capturing..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={saveConversation}
                disabled={savingConv}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {savingConv ? 'Saving...' : 'Save conversation'}
              </button>
              <button
                onClick={() => setShowConvForm(false)}
                className="text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {conversations.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
            <p className="text-sm">No conversations logged yet.</p>
            <button
              onClick={() => setShowConvForm(true)}
              className="text-indigo-600 text-sm hover:underline mt-1"
            >
              Log your first chat
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map(conv => (
              <div
                key={conv.id}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">
                      {conv.date ? formatDate(conv.date) : 'No date'}
                    </span>
                    {conv.duration_minutes && (
                      <span className="text-xs text-gray-400">
                        {conv.duration_minutes} min
                      </span>
                    )}
                  </div>
                  {conv.would_join_exchange && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        JOIN_STYLES[conv.would_join_exchange]
                      }`}
                    >
                      Would join: {conv.would_join_exchange}
                    </span>
                  )}
                </div>
                {conv.hardest_part && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                      Hardest part
                    </p>
                    <p className="text-sm text-gray-700">{conv.hardest_part}</p>
                  </div>
                )}
                {conv.ai_gaps && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                      AI gaps
                    </p>
                    <p className="text-sm text-gray-700">{conv.ai_gaps}</p>
                  </div>
                )}
                {conv.themes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {conv.themes.map(t => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {conv.other_notes && (
                  <p className="text-sm text-gray-500 mt-2 italic">{conv.other_notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
