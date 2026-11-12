import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Mail, Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { exportToCSV } from '../../lib/csv'

type Lead = {
  id: string
  email: string
  source: string
  consent: boolean
  created_at: string
}

type Contact = {
  id: string
  name: string
  email: string
  message: string
  admin_status: string
  created_at: string
}

type Props = {
  leads: Lead[]
  contacts: Contact[]
  onStatusChange: (id: string, status: string) => void
}

const CONTACT_FORM_SOURCE = 'Contact Form'

const STATUS_CYCLE: Record<string, string> = {
  unread: 'read',
  read: 'replied',
  replied: 'unread',
}

const statusStyle: Record<string, string> = {
  unread: 'text-gold border-gold/30 bg-gold/8',
  read: 'text-lavender border-lavender/30 bg-lavender/8',
  replied: 'text-green-400 border-green-400/30 bg-green-400/8',
}

function SourceBar({ source, count, max }: { source: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[13px] text-ink-soft uppercase tracking-wide">{source}</span>
        <span className="font-mono text-[13px] text-lavender">{count}</span>
      </div>
      <div className="h-1.5 bg-plum-700/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-lavender/50 to-lavender rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function ContactRow({ contact, onStatusChange }: { contact: Contact; onStatusChange: (id: string, status: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState(contact.admin_status || 'unread')

  const cycleStatus = async () => {
    const next = STATUS_CYCLE[status] ?? 'read'
    setStatus(next)
    onStatusChange(contact.id, next)
    await supabase.from('contacts').update({ admin_status: next }).eq('id', contact.id)
  }

  return (
    <div className="bg-plum-800/40 border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-sm font-semibold text-ink">{contact.name}</p>
          <p className="font-sans text-[13px] text-ink-dim">{contact.email}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={cycleStatus}
            className={`font-mono text-[8px] uppercase tracking-widest border rounded-full px-2.5 py-1 transition-colors cursor-pointer ${statusStyle[status] ?? statusStyle.unread}`}
          >
            {status}
          </button>
          <a
            href={`mailto:${contact.email}?subject=Re: Your message to Tae Studio`}
            className="text-ink-dim hover:text-lavender transition-colors"
            title="Reply via email"
          >
            <Mail size={13} />
          </a>
          <p className="font-sans text-[13px] text-ink-dim hidden sm:block">
            {new Date(contact.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
          </p>
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-ink-dim hover:text-ink transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-5 pb-5 border-t border-white/[0.05] pt-4">
          <p className="font-sans text-xs text-ink-soft leading-relaxed">{contact.message}</p>
        </div>
      )}
    </div>
  )
}

export default function ContactsTab({ leads, contacts, onStatusChange }: Props) {
  const [filter, setFilter] = useState<string>('all')

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const l of leads) counts[l.source] = (counts[l.source] || 0) + 1
    if (contacts.length > 0) counts[CONTACT_FORM_SOURCE] = contacts.length
    return counts
  }, [leads, contacts])

  const maxSourceCount = Math.max(...Object.values(sourceCounts), 1)

  const sources = useMemo(
    () => Object.keys(sourceCounts).sort((a, b) => sourceCounts[b] - sourceCounts[a]),
    [sourceCounts]
  )

  const filteredLeads = useMemo(
    () => filter === 'all' || filter === CONTACT_FORM_SOURCE ? [] : leads.filter(l => l.source === filter),
    [leads, filter]
  )

  const filteredContacts = useMemo(
    () => filter === 'all' || filter === CONTACT_FORM_SOURCE ? (filter === CONTACT_FORM_SOURCE ? contacts : []) : [],
    [contacts, filter]
  )

  const totalEntries = leads.length + contacts.length

  const handleExport = () => {
    const rows = [
      ...leads.map(l => ({
        email: l.email,
        name: '',
        source: l.source,
        message: '',
        consent: l.consent ? 'yes' : 'no',
        status: '',
        date: new Date(l.created_at).toLocaleDateString(),
      })),
      ...contacts.map(c => ({
        email: c.email,
        name: c.name,
        source: CONTACT_FORM_SOURCE,
        message: c.message,
        consent: 'n/a',
        status: c.admin_status || 'unread',
        date: new Date(c.created_at).toLocaleDateString(),
      })),
    ]
    exportToCSV(rows, 'contacts.csv')
  }

  return (
    <div className="space-y-8">
      {/* Source breakdown */}
      {sources.length > 0 && (
        <div className="bg-plum-800/40 border border-white/[0.06] rounded-2xl p-6">
          <h3 className="font-serif text-sm font-semibold text-ink mb-5">Contacts by Source</h3>
          <div className="space-y-4">
            {sources.map(source => (
              <SourceBar key={source} source={source} count={sourceCounts[source]} max={maxSourceCount} />
            ))}
          </div>
        </div>
      )}

      {/* Source filter pills */}
      {sources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1.5 transition-colors ${
              filter === 'all'
                ? 'bg-lavender/20 text-lavender border-lavender/40'
                : 'text-ink-dim border-white/[0.06] hover:text-ink-soft hover:border-white/10'
            }`}
          >
            All
          </button>
          {sources.map(source => (
            <button
              key={source}
              onClick={() => setFilter(source)}
              className={`font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1.5 transition-colors ${
                filter === source
                  ? 'bg-lavender/20 text-lavender border-lavender/40'
                  : 'text-ink-dim border-white/[0.06] hover:text-ink-soft hover:border-white/10'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="font-sans text-xs text-ink-dim">
          {filter === 'all'
            ? `${totalEntries} contact${totalEntries !== 1 ? 's' : ''}`
            : `${filteredLeads.length + filteredContacts.length} in ${filter}`}
        </p>
        <button
          onClick={handleExport}
          disabled={totalEntries === 0}
          className="flex items-center gap-2 font-sans text-xs text-ink-dim hover:text-ink transition-colors border border-white/[0.06] rounded-xl px-3 py-2 disabled:opacity-40"
        >
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* Contact form messages (when showing all or filtered to contact form) */}
      {(filter === 'all' || filter === CONTACT_FORM_SOURCE) && contacts.length > 0 && (
        <div className="space-y-3">
          {(filter === CONTACT_FORM_SOURCE ? filteredContacts : contacts).map(c => (
            <ContactRow key={c.id} contact={c} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}

      {/* Lead rows */}
      {(filter === 'all' || filter !== CONTACT_FORM_SOURCE) && (
        <div className="space-y-2">
          {(filter === 'all' ? leads : filteredLeads).map(l => (
            <div
              key={l.id}
              className="flex items-center justify-between bg-plum-800/30 border border-white/[0.05] rounded-xl px-4 py-3 gap-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-sans text-xs text-ink truncate">{l.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[8px] text-lavender border border-lavender/25 bg-lavender/8 rounded-full px-2 py-0.5 uppercase tracking-wide">
                    {l.source}
                  </span>
                  {l.consent && (
                    <span className="font-mono text-[8px] text-gold border border-gold/25 bg-gold/8 rounded-full px-2 py-0.5 uppercase tracking-wide">
                      consented
                    </span>
                  )}
                </div>
              </div>
              <p className="font-sans text-[13px] text-ink-dim flex-shrink-0">
                {new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {totalEntries === 0 && (
        <p className="font-sans text-sm text-ink-dim text-center py-10">No contacts yet.</p>
      )}
    </div>
  )
}
