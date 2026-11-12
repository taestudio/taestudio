import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type Application = {
  id: string
  name: string
  email: string
  business_stage: string
  goals: string
  challenges: string
  budget_range: string
  referral_source?: string | null
  status: string
  notes?: string | null
  created_at: string
}

type Props = { applications: Application[] }

const STATUSES = ['new', 'reviewed', 'scheduled', 'closed'] as const

const statusColor: Record<string, string> = {
  new: 'text-gold border-gold/30 bg-gold/8',
  reviewed: 'text-lavender border-lavender/30 bg-lavender/8',
  scheduled: 'text-green-400 border-green-400/30 bg-green-400/8',
  closed: 'text-ink-dim border-white/10 bg-white/5',
}

function AppCard({ app }: { app: Application }) {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState(app.status)
  const [notes, setNotes] = useState(app.notes ?? '')
  const [saving, setSaving] = useState(false)

  const updateStatus = async (newStatus: string) => {
    setStatus(newStatus)
    await supabase.from('applications').update({ status: newStatus }).eq('id', app.id)
  }

  const saveNotes = async () => {
    setSaving(true)
    await supabase.from('applications').update({ notes }).eq('id', app.id)
    setSaving(false)
  }

  return (
    <div className="bg-plum-800/40 border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-sm font-semibold text-ink">{app.name}</p>
          <p className="font-sans text-[13px] text-ink-dim">{app.email}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <select
            value={status}
            onChange={e => updateStatus(e.target.value)}
            className={`font-mono text-[13px] uppercase tracking-wider border rounded-full px-2.5 py-1 bg-transparent outline-none cursor-pointer ${statusColor[status] ?? 'text-ink-dim border-white/10'}`}
          >
            {STATUSES.map(s => (
              <option key={s} value={s} className="bg-plum-900 text-ink normal-case tracking-normal text-sm font-sans">{s}</option>
            ))}
          </select>
          <p className="font-sans text-[13px] text-ink-dim hidden sm:block">
            {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
          </p>
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-ink-dim hover:text-ink transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/[0.05]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {[
              { label: 'Business Stage', value: app.business_stage },
              { label: 'Budget Range', value: app.budget_range },
              { label: 'Referral Source', value: app.referral_source },
            ].map(({ label, value }) => value ? (
              <div key={label}>
                <p className="font-sans text-[13px] text-ink-dim uppercase tracking-wider mb-1">{label}</p>
                <p className="font-sans text-xs text-ink-soft">{value}</p>
              </div>
            ) : null)}
          </div>
          {app.goals && (
            <div>
              <p className="font-sans text-[13px] text-ink-dim uppercase tracking-wider mb-1">Goals</p>
              <p className="font-sans text-xs text-ink-soft leading-relaxed">{app.goals}</p>
            </div>
          )}
          {app.challenges && (
            <div>
              <p className="font-sans text-[13px] text-ink-dim uppercase tracking-wider mb-1">Challenges</p>
              <p className="font-sans text-xs text-ink-soft leading-relaxed">{app.challenges}</p>
            </div>
          )}
          <div>
            <p className="font-sans text-[13px] text-ink-dim uppercase tracking-wider mb-1.5">
              Admin Notes {saving && <span className="text-gold/60 normal-case">— saving…</span>}
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={saveNotes}
              placeholder="Add internal notes…"
              rows={3}
              className="w-full bg-plum-900/50 border border-white/[0.07] rounded-xl px-3 py-2.5 font-sans text-xs text-ink-soft placeholder:text-ink-dim/50 outline-none focus:border-lavender/30 transition-colors resize-none"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function ApplicationsTab({ applications }: Props) {
  return (
    <div className="space-y-3">
      <p className="font-sans text-xs text-ink-dim mb-2">
        {applications.length} application{applications.length !== 1 ? 's' : ''}
      </p>
      {applications.map(app => (
        <AppCard key={app.id} app={app} />
      ))}
      {applications.length === 0 && (
        <p className="font-sans text-sm text-ink-dim text-center py-10">No applications yet.</p>
      )}
    </div>
  )
}
