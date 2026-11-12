import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Bookmark, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react'
import { GoldDivider, Loader } from '../components/ui'
import { ENGINES, type Engine, type EngineId } from '../data/engines'
import { supabase } from '../lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

async function callGenerateStrategy(engine: Engine, userMessage: string, sessionId: string, userKey: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-strategy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      engine_id: engine.id,
      user_message: userMessage,
      session_id: sessionId,
      user_key: userKey,
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  if (!data.text) throw new Error('No response received.')
  return data.text
}

const HEADING_LABELS = new Set([
  "What's Actually Happening Here",
  'The Power Read',
  'Your Move',
  'The Script / Language',
  'Document This Tonight',
  'Next Step',
  'Soft Reminder',
  'Niche & Audience Read',
  'The Hook (3 versions)',
  'Caption',
  'Reel Script',
  'The CTA',
  'DM Script',
  'Why This Will Work',
  "What I'm Really Hearing",
  'The Type of Decision This Is',
  'Fear vs. Wisdom Check',
  'What the Data Says',
  'The Honest Assessment',
  'The Best Path Forward',
  'What to Watch For',
  'Your Next Move',
  'The Question to Return To',
  'Market Read',
  'Your Offer, Refined',
  'Why This Positioning Works',
  'The Lead Magnet',
  'The Funnel (simple)',
  'Sales Page Copy Starter',
  'Content Pillars',
  'First 7 Days',
  'The One Thing to Avoid',
])

function renderOutput(text: string) {
  return text.split('\n').map((line, i) => {
    const cleaned = line.replace(/^#{1,6}\s*/, '').replace(/\*\*/g, '')

    if (cleaned.trim() === '') return <div key={i} className="h-1" />

    if (cleaned.startsWith('- '))
      return <p key={i} className="pl-4 font-sans text-[14px] text-sand-700 leading-relaxed mb-1">· {cleaned.slice(2)}</p>

    const colonMatch = cleaned.match(/^([^:]+):\s*(.*)$/)
    if (colonMatch) {
      const label = colonMatch[1].trim()
      const content = colonMatch[2].trim()
      if (HEADING_LABELS.has(label)) {
        return (
          <div key={i} className="mt-5 mb-1.5">
            <span className="font-serif font-bold text-lavender-dark text-[15px]">{label}:</span>
            {content && <span className="font-sans text-[14px] text-sand-900"> {content}</span>}
          </div>
        )
      }
    }

    if (HEADING_LABELS.has(cleaned.trim())) {
      return <p key={i} className="font-serif font-bold text-lavender-dark text-[15px] mt-5 mb-1.5">{cleaned.trim()}:</p>
    }

    return <p key={i} className="font-sans text-[14px] text-sand-900 leading-[1.85] my-0.5">{cleaned}</p>
  })
}

function DisclaimerBox({ text }: { text: string }) {
  return (
    <div className="bg-lavender/8 border border-lavender/15 rounded-2xl p-4 mb-5">
      <p className="font-sans text-[13px] text-sand-800 leading-relaxed">
        <strong>Important:</strong> {text}
      </p>
    </div>
  )
}

function AIDisclosure() {
  return (
    <div className="flex gap-3 items-start bg-lavender/6 border border-lavender/12 rounded-xl p-3 mt-4">
      <span className="text-sm flex-shrink-0">🤖</span>
      <p className="font-sans text-[13px] text-sand-700 leading-relaxed">
        <strong>AI-Generated:</strong> This output was created by Claude (Anthropic), guided by Tae Studio's frameworks. Review before use. Results will vary.
      </p>
    </div>
  )
}

function SoftStartCard() {
  return (
    <a
      href="https://chatgpt.com/g/g-694b2b2427f48191b128994f409196c5-soft-start"
      target="_blank"
      rel="noopener noreferrer"
      className="mt-6 block bg-sand-100 rounded-3xl p-8 text-center relative overflow-hidden border border-sand-300/50 hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-32 bg-gradient-radial from-gold/12 to-transparent pointer-events-none" />
      <GoldDivider className="mb-4" />
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-xl">✨</span>
        <p className="font-mono text-[13px] tracking-[0.16em] text-gold-dark uppercase">Soft Start GPT</p>
      </div>
      <h3 className="font-serif text-[20px] font-semibold text-sand-900 mb-1 leading-snug">Soft Start</h3>
      <p className="font-sans text-[13px] text-sand-500 mb-3">By Tae Studio</p>
      <p className="font-sans text-[13px] text-sand-600 leading-relaxed mb-6 max-w-xs mx-auto">
        A calm strategist that brings clarity, structure, and gentle forward motion.
      </p>
      <span className="inline-flex items-center gap-2 bg-gradient-to-br from-gold-light via-gold to-gold-dark text-sand-50 font-serif font-semibold text-base rounded-2xl px-7 py-3.5 shadow-[0_4px_20px_rgba(200,154,61,0.3)] group-hover:shadow-[0_8px_32px_rgba(200,154,61,0.45)] group-hover:-translate-y-0.5 transition-all duration-200">
        Open Soft Start ↗
      </span>
    </a>
  )
}

interface OutputCardProps {
  output: string
  engine: Engine
  onFollowUp: (prompt: string) => void
  onSave: () => void
  saved: boolean
  loading: boolean
}

function OutputCard({ output, engine, onFollowUp, onSave, saved, loading }: OutputCardProps) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-6">
      <div className="bg-white/60 border border-sand-300/50 rounded-3xl p-6 relative shadow-[0_4px_24px_rgba(120,90,50,0.12)]">
        <div className="flex gap-2 absolute top-4 right-4">
          <button
            onClick={onSave}
            className={`flex items-center gap-1.5 border rounded-xl px-3 py-1.5 font-mono text-[13px] transition-all duration-200 ${
              saved
                ? 'bg-lavender/20 border-lavender/40 text-lavender-dark'
                : 'bg-transparent border-sand-400/40 text-sand-600 hover:border-lavender/30 hover:text-lavender-dark'
            }`}
          >
            <Bookmark size={11} />
            {saved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 border rounded-xl px-3 py-1.5 font-mono text-[13px] transition-all duration-200 ${
              copied
                ? 'bg-gold/20 border-gold/40 text-gold'
                : 'bg-transparent border-gold/30 text-gold hover:bg-gold/10'
            }`}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="pr-24">{renderOutput(output)}</div>
      </div>

      <AIDisclosure />

      {!loading && (
        <div className="mt-5">
          <p className="font-serif italic text-sand-600 text-[13px] text-center mb-3">Want to go deeper?</p>
          <div className="grid grid-cols-2 gap-2">
            {engine.followUps.map((fu, i) => (
              <button
                key={i}
                onClick={() => onFollowUp(fu)}
                className="bg-white/40 border border-sand-300/50 rounded-xl p-3 font-sans text-[13px] text-sand-700 text-left leading-snug hover:border-lavender-mid/30 hover:bg-lavender/5 hover:text-sand-900 transition-all duration-200"
              >
                {fu} →
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <p className="font-serif italic text-sand-600 text-[13px] text-center py-4">Going deeper...</p>
      )}

      <SoftStartCard />
    </div>
  )
}

interface HistoryItem {
  id?: string
  engineId: EngineId
  preview: string
  content: string
  createdAt?: string
}

interface HistoryPanelProps {
  history: HistoryItem[]
  onSelect: (item: HistoryItem) => void
  onDelete: (id: string) => void
  onClose: () => void
  loading?: boolean
}

export function HistoryPanel({ history, onSelect, onDelete, onClose, loading }: HistoryPanelProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="fixed top-0 right-0 bottom-0 w-[min(300px,88vw)] bg-sand-100 border-l border-sand-300/60 shadow-[-4px_0_32px_rgba(120,90,50,0.15)] z-[100] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-lg font-semibold text-sand-900">Saved Outputs</h3>
          <button onClick={onClose} className="text-sand-600 hover:text-sand-900 text-xl leading-none p-1">×</button>
        </div>
        <p className="font-sans text-[13px] text-sand-600 mb-5 leading-relaxed">Saved to your account · Available on any device</p>
        {loading ? (
          <p className="font-sans text-[13px] text-sand-600 italic">Loading saved outputs…</p>
        ) : history.length === 0 ? (
          <p className="font-sans text-[13px] text-sand-600 italic">No saved outputs yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((item, i) => (
              <div key={item.id ?? i} className="relative group">
                <button
                  onClick={() => onSelect(item)}
                  className="w-full bg-white/50 border border-sand-300/50 rounded-2xl p-4 text-left hover:border-lavender-mid/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span>{ENGINES[item.engineId]?.emoji}</span>
                      <span className="font-serif text-sm font-semibold text-sand-900">{ENGINES[item.engineId]?.label}</span>
                    </div>
                    {item.createdAt && (
                      <span className="font-mono text-[13px] text-sand-500 tracking-wide whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-[13px] text-sand-600 leading-relaxed line-clamp-2 pr-6">{item.preview}</p>
                </button>
                {item.id && (
                  <button
                    onClick={() => onDelete(item.id!)}
                    className="absolute top-3 right-3 p-1.5 text-sand-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

interface EmailGateProps {
  onUnlock: (email: string) => void
}

export function EmailGate({ onUnlock }: EmailGateProps) {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const valid = email.includes('@') && email.includes('.') && consent

  const handleUnlock = async () => {
    if (!valid || loading) return
    setLoading(true)
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/capture-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'email-gate', consent }),
      })
    } catch (_) {}
    onUnlock(email)
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-sand-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-5"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="bg-sand-100 border border-sand-300/60 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_24px_60px_rgba(120,90,50,0.3)]"
      >
        <GoldDivider className="mb-5" />
        <h2 className="font-serif text-xl font-semibold text-sand-900 mb-3">You've used your free session</h2>
        <p className="font-sans text-[13px] text-sand-700 mb-6 leading-relaxed">
          Enter your email to unlock full access to all four engines — free. Unsubscribe anytime.
        </p>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full bg-white/70 border border-sand-300 rounded-2xl px-4 py-3.5 font-sans text-sm text-sand-900 placeholder:text-sand-400 outline-none focus:border-lavender-mid/50 transition-colors mb-4"
        />
        <div className="flex items-start gap-3 mb-6 text-left">
          <input
            type="checkbox"
            id="gate-consent"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            className="mt-0.5 flex-shrink-0 accent-lavender"
          />
          <label htmlFor="gate-consent" className="font-sans text-[13px] text-sand-700 leading-relaxed cursor-pointer">
            I agree to receive emails from Tae Studio. I can unsubscribe anytime. View our{' '}
            <a
              href="https://www.notion.so/Privacy-Policy-Tae-Adams-Studio-3540e9d9f43c819b8a08cd86061d14f6"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lavender hover:text-lavender-light transition-colors font-semibold"
            >
              Privacy Policy
            </a>
            .
          </label>
        </div>
        <button
          onClick={handleUnlock}
          disabled={!valid || loading}
          className={`w-full py-4 rounded-2xl font-serif font-semibold text-[16px] tracking-wide transition-all duration-200 ${
            valid && !loading
              ? 'bg-gradient-to-br from-gold-light via-gold to-gold-dark text-sand-50 shadow-[0_4px_20px_rgba(200,154,61,0.35)] hover:shadow-[0_8px_32px_rgba(200,154,61,0.5)]'
              : 'bg-sand-300/50 text-sand-500 cursor-not-allowed'
          }`}
        >
          {loading ? 'Unlocking...' : 'Unlock Full Access →'}
        </button>
        <p className="font-sans text-[13px] text-sand-500 mt-4">Your information is never sold or shared.</p>
      </motion.div>
    </motion.div>
  )
}

interface EngineFormProps {
  engine: Engine
  onBack: () => void
  onGenerated: () => void
  onSaved: (item: HistoryItem) => void
  userKey: string
  sessionId: string
  initialOutput?: string | null
}

export function EngineForm({ engine, onBack, onGenerated, onSaved, userKey, sessionId, initialOutput }: EngineFormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState<string | null>(initialOutput ?? null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(!!initialOutput)
  const outputRef = useRef<HTMLDivElement>(null)
  const lastMsgRef = useRef<string | null>(null)

  const allFilled = engine.fields.every(f => values[f.key]?.trim())

  const scrollToOutput = () => {
    setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const callAPI = async (msg: string) => {
    lastMsgRef.current = msg
    setLoading(true)
    setError(null)
    try {
      const text = await callGenerateStrategy(engine, msg, sessionId, userKey)
      setOutput(text)
      onGenerated()
      scrollToOutput()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (!allFilled) return
    const msg = engine.fields.map(f => `${f.label}\n${values[f.key]}`).join('\n\n')
    callAPI(msg)
  }

  const handleFollowUp = (prompt: string) => {
    const msg = `Previous output:\n${output}\n\nFollow-up request: ${prompt}`
    callAPI(msg)
    setOutput(null)
  }

  const handleRetry = () => {
    if (lastMsgRef.current) callAPI(lastMsgRef.current)
  }

  const handleSave = async () => {
    if (saved || !output) return
    setSaved(true)
    try {
      const preview = output.replace(/\*\*/g, '').replace(/^#{1,6}\s*/gm, '').slice(0, 150).trim()
      const { data, error: insertError } = await supabase
        .from('saved_outputs')
        .insert({ session_id: userKey, engine_id: engine.id, content: output, preview })
        .select('id')
        .single()
      if (!insertError && data) {
        onSaved({ id: data.id, engineId: engine.id as EngineId, preview, content: output, createdAt: new Date().toISOString() })
      }
    } catch {}
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-sans text-[13px] text-sand-600 hover:text-sand-900 transition-colors mb-5 p-0 bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-lavender/15 flex items-center justify-center text-xl flex-shrink-0">
          {engine.emoji}
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-sand-900">{engine.label}</h2>
          <p className="font-sans text-[13px] text-sand-600 leading-snug">{engine.tagline}</p>
        </div>
      </div>

      {engine.disclaimer && (
        <div className="mt-4">
          <DisclaimerBox text={engine.disclaimer} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {!output && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mt-5 space-y-5"
          >
            {engine.fields.map(field => (
              <div key={field.key}>
                <label className="block font-serif text-[15px] font-semibold text-sand-900 mb-2">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={values[field.key] || ''}
                    onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full bg-white/70 border border-sand-300 rounded-2xl px-4 py-3.5 font-sans text-sm text-sand-900 placeholder:text-sand-400 outline-none focus:border-lavender-mid/50 transition-colors resize-vertical leading-relaxed"
                  />
                ) : (
                  <input
                    type="text"
                    value={values[field.key] || ''}
                    onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-white/70 border border-sand-300 rounded-2xl px-4 py-3.5 font-sans text-sm text-sand-900 placeholder:text-sand-400 outline-none focus:border-lavender-mid/50 transition-colors"
                  />
                )}
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={!allFilled || loading}
              className={`w-full py-4 rounded-2xl font-serif font-semibold text-lg tracking-wide transition-all duration-200 mt-2 ${
                allFilled && !loading
                  ? 'bg-gradient-to-br from-gold-light via-gold to-gold-dark text-sand-50 shadow-[0_4px_20px_rgba(200,154,61,0.3)] hover:shadow-[0_8px_32px_rgba(200,154,61,0.45)] hover:-translate-y-0.5'
                  : 'bg-sand-300/50 text-sand-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'Working on it...' : 'Generate My Strategy →'}
            </button>
            {!allFilled && !loading && (
              <p className="text-center font-sans text-[13px] text-sand-600">Fill in all fields above to continue</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {loading && <Loader />}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-300/50 rounded-2xl p-4">
          <p className="font-sans text-[13px] text-red-700 leading-relaxed mb-3">{error}</p>
          <button
            onClick={handleRetry}
            className="font-sans text-[13px] text-red-700 border border-red-300 rounded-xl px-4 py-2 hover:bg-red-100 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {output && (
        <div ref={outputRef}>
          <OutputCard
            output={output}
            engine={engine}
            onFollowUp={handleFollowUp}
            onSave={handleSave}
            saved={saved}
            loading={loading}
          />
          <button
            onClick={() => { setOutput(null); setValues({}); setSaved(false); setError(null) }}
            className="w-full mt-4 py-3 bg-transparent border border-sand-300/60 rounded-2xl font-sans text-[13px] text-sand-600 hover:text-sand-900 hover:border-sand-400/60 transition-all cursor-pointer"
          >
            ← Start a new session
          </button>
        </div>
      )}
    </div>
  )
}

export { ENGINES }
export type { HistoryItem, EngineId }
