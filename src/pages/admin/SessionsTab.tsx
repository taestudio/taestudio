import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Loader2, FileText } from 'lucide-react'
import { ENGINES } from '../../data/engines'
import { supabase } from '../../lib/supabase'

type Session = {
  id: string
  session_id: string
  engine_id: string
  email?: string | null
  user_key?: string | null
  created_at: string
}

type SavedOutput = { content: string; preview: string } | null

type Props = { sessions: Session[] }

function EngineBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs text-ink-soft">{label}</span>
        <span className="font-mono text-[13px] text-gold">{count}</span>
      </div>
      <div className="h-2 bg-plum-700/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold/50 to-gold rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function OutputPanel({ content, preview }: { content: string; preview: string }) {
  const [showFull, setShowFull] = useState(false)
  const text = showFull ? content : preview

  const renderContent = (raw: string) =>
    raw.split('\n').map((line, i) => {
      const boldMatch = line.match(/^\*\*(.+?)\*\*(.*)$/)
      if (boldMatch) {
        return (
          <p key={i} className="mb-2">
            <span className="font-semibold text-ink">{boldMatch[1]}</span>
            <span className="text-ink-soft">{boldMatch[2]}</span>
          </p>
        )
      }
      if (line.trim() === '') return <div key={i} className="h-2" />
      return (
        <p key={i} className="text-ink-soft mb-1">{line}</p>
      )
    })

  return (
    <div className="mt-2 bg-plum-950/60 border border-white/[0.06] rounded-xl p-5">
      <div className="font-sans text-xs leading-relaxed max-h-72 overflow-y-auto pr-1">
        {renderContent(text)}
      </div>
      {content !== preview && (
        <button
          onClick={() => setShowFull(f => !f)}
          className="mt-3 font-sans text-[13px] text-gold hover:text-gold/80 transition-colors flex items-center gap-1"
        >
          {showFull ? <><ChevronUp size={11} /> Show less</> : <><ChevronDown size={11} /> View full output</>}
        </button>
      )}
    </div>
  )
}

export default function SessionsTab({ sessions }: Props) {
  const [engineFilter, setEngineFilter] = useState<string>('all')
  const [outputs, setOutputs] = useState<Record<string, SavedOutput>>({})
  const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({})
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({})

  const engineCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of sessions) counts[s.engine_id] = (counts[s.engine_id] || 0) + 1
    return counts
  }, [sessions])

  const maxCount = Math.max(...Object.values(engineCounts), 1)

  const filtered = useMemo(() =>
    engineFilter === 'all' ? sessions : sessions.filter(s => s.engine_id === engineFilter),
    [sessions, engineFilter])

  const getEngineName = (id: string) => ENGINES[id as keyof typeof ENGINES]?.label ?? id
  const getEngineEmoji = (id: string) => ENGINES[id as keyof typeof ENGINES]?.emoji ?? '🧭'

  const handleToggleOutput = async (session: Session) => {
    const key = session.session_id
    if (expandedKeys[key]) {
      setExpandedKeys(e => ({ ...e, [key]: false }))
      return
    }
    if (!(key in outputs)) {
      setLoadingKeys(l => ({ ...l, [key]: true }))
      let data: SavedOutput = null

      if (session.user_key) {
        // New sessions: exact match via user_key
        const res = await supabase
          .from('saved_outputs')
          .select('content, preview')
          .eq('session_id', session.user_key)
          .eq('engine_id', session.engine_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        data = res.data ?? null
      } else {
        // Legacy sessions (pre-fix): best-effort match by engine within ±24h
        const t = new Date(session.created_at).getTime()
        const res = await supabase
          .from('saved_outputs')
          .select('content, preview')
          .eq('engine_id', session.engine_id)
          .gte('created_at', new Date(t - 86400000).toISOString())
          .lte('created_at', new Date(t + 86400000).toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        data = res.data ?? null
      }

      setOutputs(o => ({ ...o, [key]: data }))
      setLoadingKeys(l => ({ ...l, [key]: false }))
    }
    setExpandedKeys(e => ({ ...e, [key]: true }))
  }

  return (
    <div className="space-y-8">
      {/* Engine breakdown */}
      <div className="bg-plum-800/40 border border-white/[0.06] rounded-2xl p-6">
        <h3 className="font-serif text-sm font-semibold text-ink mb-5">Sessions by Engine</h3>
        <div className="space-y-4">
          {Object.entries(ENGINES).map(([key, eng]) => (
            <EngineBar key={key} label={eng.label} count={engineCounts[key] || 0} max={maxCount} />
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setEngineFilter('all')}
          className={`font-sans text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            engineFilter === 'all'
              ? 'bg-plum-700/60 text-ink border-white/[0.1]'
              : 'text-ink-dim border-white/[0.05] hover:text-ink-soft'
          }`}
        >
          All
        </button>
        {Object.entries(ENGINES).map(([key, eng]) => (
          <button
            key={key}
            onClick={() => setEngineFilter(key)}
            className={`font-sans text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              engineFilter === key
                ? 'bg-plum-700/60 text-ink border-white/[0.1]'
                : 'text-ink-dim border-white/[0.05] hover:text-ink-soft'
            }`}
          >
            {eng.emoji} {eng.label}
          </button>
        ))}
      </div>

      {/* Sessions list */}
      <div className="space-y-2">
        <p className="font-sans text-xs text-ink-dim mb-3">{filtered.length} session{filtered.length !== 1 ? 's' : ''}</p>
        {filtered.map(s => {
          const key = s.session_id
          const isExpanded = expandedKeys[key] ?? false
          const isLoading = loadingKeys[key] ?? false
          const output = outputs[key]

          return (
            <div key={s.id} className="bg-plum-800/30 border border-white/[0.05] rounded-xl px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-base flex-shrink-0">{getEngineEmoji(s.engine_id)}</span>
                  <div className="min-w-0">
                    <p className="font-sans text-xs text-ink">{getEngineName(s.engine_id)}</p>
                    {s.email && (
                      <p className="font-sans text-[13px] text-ink-dim truncate">{s.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="font-mono text-[13px] text-ink-dim hidden sm:block">
                    {key.slice(0, 12)}…
                  </p>
                  <p className="font-sans text-[13px] text-ink-dim">
                    {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                  </p>
                  <button
                    onClick={() => handleToggleOutput(s)}
                    className={`flex items-center gap-1.5 font-sans text-[13px] px-2.5 py-1 rounded-lg border transition-colors ${
                      isExpanded
                        ? 'bg-plum-700/60 text-ink border-white/[0.1]'
                        : 'text-ink-dim border-white/[0.06] hover:text-ink-soft hover:border-white/[0.1]'
                    }`}
                  >
                    {isLoading
                      ? <Loader2 size={10} className="animate-spin" />
                      : <FileText size={10} />
                    }
                    {isExpanded ? 'Hide' : 'Show Output'}
                  </button>
                </div>
              </div>

              {isExpanded && (
                output
                  ? <OutputPanel content={output.content} preview={output.preview} />
                  : <p className="mt-2 font-sans text-[13px] text-ink-dim italic px-1">No saved output for this session.</p>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="font-sans text-sm text-ink-dim text-center py-10">No sessions yet.</p>
        )}
      </div>
    </div>
  )
}
