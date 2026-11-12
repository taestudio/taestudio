import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Lock, Check, Loader2, Mail } from 'lucide-react'
import { GoldDivider, GlowOrb } from '../components/ui'
import {
  EngineForm,
  HistoryPanel,
  ENGINES,
  type EngineId,
  type HistoryItem,
} from '../components/DeskComponents'
import { fetchServiceBySlug } from '../lib/services'
import { startCheckout } from '../lib/checkout'
import { supabase } from '../lib/supabase'
import { Link } from "react-router-dom";


function generateSessionId(): string {
  return crypto.randomUUID()
}

type AccessStatus = 'checking' | 'locked' | 'unlocked'

const DESK_FEATURES = [
  'Four strategy engines — one for every situation',
  'Exact scripts, decisions, and plans in minutes',
  'Unlimited sessions — use it whenever you need it',
  'Bonus: Soft Start GPT included',
]

function Paywall({ priceId, onAccessGranted }: { priceId: string | null; onAccessGranted: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRestore, setShowRestore] = useState(false)
  const [restoreEmail, setRestoreEmail] = useState('')
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [restoreError, setRestoreError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleBuy = async () => {
    if (!priceId) return
    setLoading(true)
    setError('')
    try {
      const origin = window.location.origin
      await startCheckout(priceId, {
        successUrl: `${origin}/desk?paid=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/desk`,
        productSlug: 'strategy-desk',
      })
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleRestoreToggle = () => {
    setShowRestore(v => !v)
    setRestoreError('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = restoreEmail.trim().toLowerCase()
    if (!email) return
    setRestoreLoading(true)
    setRestoreError('')
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-desk-access`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      )
      const data = await res.json()
      if (data.hasAccess) {
        const key = data.checkoutSessionId || ''
        if (!key) {
          setRestoreError('Could not restore access. Please contact support.')
          return
        }
        localStorage.setItem('desk_access', key)
        onAccessGranted()
      } else {
        setRestoreError('No purchase found for that email. Double-check and try again.')
      }
    } catch {
      setRestoreError('Could not verify. Please try again.')
    } finally {
      setRestoreLoading(false)
    }
  }

  return (
    <div className="bg-sand-100 border border-gold-dark/20 rounded-3xl p-7 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gold/15 border border-gold-dark/25 mb-5 mx-auto">
        <Lock size={20} className="text-gold-dark" />
      </div>

      <p className="font-mono text-[13px] tracking-widest text-gold-dark uppercase mb-2">Access Required</p>
      <h2 className="font-serif text-2xl font-light text-sand-900 mb-1">Unlock the Desk</h2>
      <p className="font-sans text-sm text-sand-600 mb-6">One-time purchase · Unlimited sessions</p>

      <div className="flex items-baseline justify-center gap-2 mb-6">
        <span className="font-serif text-4xl font-light text-gold-dark">$47</span>
        <span className="font-sans text-sm text-sand-600">one-time</span>
      </div>

      <ul className="space-y-2.5 mb-7 text-left">
        {DESK_FEATURES.map(f => (
          <li key={f} className="flex items-start gap-3">
            <Check size={13} className="text-gold-dark mt-0.5 flex-shrink-0" />
            <span className="font-sans text-[13px] text-sand-700 leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleBuy}
        disabled={loading || !priceId}
        className="w-full py-4 bg-gradient-to-br from-gold-light via-gold to-gold-dark text-sand-50 font-serif font-semibold text-[17px] rounded-2xl shadow-[0_6px_28px_rgba(200,154,61,0.35)] hover:shadow-[0_10px_40px_rgba(200,154,61,0.5)] hover:-translate-y-0.5 transition-all duration-250 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Redirecting…
          </span>
        ) : !priceId ? 'Coming soon' : 'Purchase Access — $47 →'}
      </button>
      {error && <p className="font-sans text-xs text-red-600 mt-3">{error}</p>}

      {/* Restore access */}
      <div className="mt-5 pt-5 border-t border-sand-300/60">
        <button
          onClick={handleRestoreToggle}
          className="font-sans text-[13px] text-sand-600 hover:text-gold-dark transition-colors flex items-center gap-1.5 mx-auto"
        >
          <Mail size={12} />
          Already purchased? Restore access
        </button>

        <AnimatePresence>
          {showRestore && (
            <motion.form
              onSubmit={handleRestoreSubmit}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-4"
            >
              <p className="font-sans text-[13px] text-sand-600 mb-3">
                Enter the email you used at checkout to restore access on this device.
              </p>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="email"
                  value={restoreEmail}
                  onChange={e => setRestoreEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-white/70 border border-sand-300 rounded-xl px-4 py-2.5 font-sans text-sm text-sand-900 placeholder:text-sand-400 focus:outline-none focus:border-gold-dark/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={restoreLoading || !restoreEmail.trim()}
                  className="px-4 py-2.5 bg-sand-200 border border-sand-300 rounded-xl font-sans text-sm text-sand-800 hover:border-gold-dark/40 hover:text-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {restoreLoading ? <Loader2 size={14} className="animate-spin" /> : 'Verify'}
                </button>
              </div>
              {restoreError && <p className="font-sans text-xs text-red-600 mt-2 text-left">{restoreError}</p>}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Onboarding({
  accessStatus,
  priceId,
  onEnter,
  onAccessGranted,
}: {
  accessStatus: AccessStatus
  priceId: string | null
  onEnter: () => void
  onAccessGranted: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-16 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #FBF6EE 0%, #F0E4CE 100%)' }}>
      <GlowOrb color="gold" size={600} opacity={0.12} className="-top-20 left-1/2 -translate-x-1/2" />
      <GlowOrb color="gold" size={350} opacity={0.08} className="bottom-20 -right-10" />

      <div className="relative z-10 max-w-md w-full text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
         <Link to="/" className="inline-block group">
  <div className="inline-flex items-center rounded-full border border-gold-dark/30 bg-gold/10 px-4 py-1.5 mb-4 transition-all duration-300 ease-out group-hover:bg-gold group-hover:border-gold">
    <span className="font-mono text-[13px] tracking-[0.18em] uppercase text-gold-dark transition-colors duration-300 group-hover:text-sand-50">
      Tae Studio
    </span>
  </div>
</Link>
          <GoldDivider className="mb-5" />

          <h1 className="font-serif text-[clamp(48px,12vw,72px)] font-light leading-[0.9] tracking-[-0.02em] mb-1 text-sand-900">
            Soft Strategy
          </h1>
          <h1 className="font-serif text-[clamp(48px,12vw,72px)] font-light italic leading-[0.9] tracking-[-0.01em] mb-5 text-lavender-mid">
            Desk™
          </h1>

          <p className="font-serif italic text-gold-dark text-base mb-3 opacity-90">Clarity. Language. Next steps.</p>
          <p className="font-sans text-[13px] text-sand-600 leading-relaxed mb-1">
            For women who are done spiraling and ready to move.
            <br />
            Tell the Desk what you're navigating — get exact language,
            <br />
            a clear strategy, or a full plan in minutes.
          </p>
          <p className="font-sans text-[13px] text-sand-500 mb-8">
            Powered by AI · Guided by Tae Studio's frameworks · Not a substitute for professional advice
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {Object.values(ENGINES).map(engine => (
              <div
                key={engine.id}
                className="bg-white/50 border border-sand-300/50 rounded-2xl p-4 text-left"
              >
                <div className="text-2xl mb-2">{engine.emoji}</div>
                <div className="font-serif text-[13px] font-semibold text-sand-900 mb-1">{engine.label}</div>
                <div className="font-sans text-[13px] text-sand-600 leading-snug">
                  {engine.tagline.split('.')[0]}
                </div>
              </div>
            ))}
          </div>

          {accessStatus === 'checking' ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-gold-dark/50" />
            </div>
          ) : accessStatus === 'unlocked' ? (
            <button
              onClick={onEnter}
              className="w-full py-4 bg-gradient-to-br from-gold-light via-gold to-gold-dark text-sand-50 font-serif font-semibold text-[18px] tracking-wide rounded-2xl shadow-[0_6px_28px_rgba(200,154,61,0.35)] hover:shadow-[0_10px_40px_rgba(200,154,61,0.5)] hover:-translate-y-0.5 transition-all duration-250"
            >
              Enter the Desk →
            </button>
          ) : (
            <Paywall priceId={priceId} onAccessGranted={onAccessGranted} />
          )}

          <p className="font-serif italic text-gold-dark text-sm mt-6 opacity-70">
            "Healing is the strategy. Alignment is the ROI."
          </p>
          <p className="font-mono text-[13px] text-sand-500 mt-1 tracking-[0.1em]">— TAE STUDIO</p>

          <div className="mt-8 pt-6 border-t border-sand-300/40">
            <p className="font-sans text-[13px] text-sand-500 leading-relaxed">
              © {new Date().getFullYear()} Tae Studio. AI-assisted guidance for informational purposes only.{' '}
              <a href="/privacy-policy" className="text-sand-600 hover:text-sand-800 transition-colors">
                Privacy
              </a>
              {' · '}
              <a href="/terms-of-use" className="text-sand-600 hover:text-sand-800 transition-colors">
                Terms
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function Desk() {
  const [screen, setScreen] = useState<'onboarding' | 'desk'>('onboarding')
  const [activeEngine, setActiveEngine] = useState<EngineId | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [sessionId] = useState(generateSessionId)
  const [accessStatus, setAccessStatus] = useState<AccessStatus>('checking')
  const [priceId, setPriceId] = useState<string | null>(null)
  const [userKey, setUserKey] = useState('')
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paid = urlParams.get('paid')
    const paidSession = urlParams.get('session_id')

    if (paid === 'true' && paidSession) {
      // Verify the checkout session server-side before granting access
      // Retry up to 3 times because the webhook may not have finished inserting the order yet
      (async () => {
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const res = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-desk-access`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ checkout_session_id: paidSession }),
              },
            )
            const data = await res.json()
            if (data.hasAccess) {
              localStorage.setItem('desk_access', paidSession)
              window.history.replaceState({}, '', '/desk')
              setUserKey(paidSession)
              setAccessStatus('unlocked')
              setScreen('desk')
              return
            }
          } catch {
            // Verification failed — will retry or fall through to locked state
          }
          if (attempt < 2) await new Promise(r => setTimeout(r, 1500))
        }
        window.history.replaceState({}, '', '/desk')
        setAccessStatus('locked')
        fetchServiceBySlug('strategy-desk').then(s => {
          if (s?.stripe_price_id) setPriceId(s.stripe_price_id)
        })
      })()
      return
    }

    const stored = localStorage.getItem('desk_access')
    if (stored) {
      // Verify the stored key server-side before granting access
      (async () => {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-desk-access`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ checkout_session_id: stored }),
            },
          )
          const data = await res.json()
          if (data.hasAccess) {
            setUserKey(stored)
            setAccessStatus('unlocked')
            return
          }
        } catch {
          // Verification failed — fall through to locked state
        }
        localStorage.removeItem('desk_access')
        setAccessStatus('locked')
        fetchServiceBySlug('strategy-desk').then(s => {
          if (s?.stripe_price_id) setPriceId(s.stripe_price_id)
        })
      })()
      return
    }

    setAccessStatus('locked')
    fetchServiceBySlug('strategy-desk').then(s => {
      if (s?.stripe_price_id) setPriceId(s.stripe_price_id)
    })
  }, [])

  useEffect(() => {
    if (screen !== 'desk' || !userKey) return
    setHistoryLoading(true)
    supabase
      .rpc('get_saved_outputs', { p_session_id: userKey })
      .then(({ data }) => {
        if (data) {
          setHistory(
            (data as unknown as Array<{ id: string; engine_id: string; preview: string; content: string; created_at: string }>).map(row => ({
              id: row.id,
              engineId: row.engine_id as EngineId,
              preview: row.preview,
              content: row.content,
              createdAt: row.created_at,
            })),
          )
        }
        setHistoryLoading(false)
      })
  }, [screen, userKey])

  const handleSaved = (item: HistoryItem) => {
    setHistory(prev => [item, ...prev])
  }

  const handleDelete = async (id: string) => {
    await supabase.rpc('delete_saved_output', { p_row_id: id, p_session_id: userKey })
    setHistory(prev => prev.filter(item => item.id !== id))
  }

  if (screen === 'onboarding') {
    return (
      <Onboarding
        accessStatus={accessStatus}
        priceId={priceId}
        onEnter={() => setScreen('desk')}
        onAccessGranted={() => {
          const key = localStorage.getItem('desk_access') ?? ''
          setUserKey(key)
          setAccessStatus('unlocked')
          setScreen('desk')
        }}
      />
    )
  }

  return (
    <>
      {showHistory && (
        <HistoryPanel
          history={history}
          loading={historyLoading}
          onSelect={item => { setActiveEngine(item.engineId); setSelectedOutput(item.content); setShowHistory(false) }}
          onDelete={handleDelete}
          onClose={() => setShowHistory(false)}
        />
      )}

      <div
        className="min-h-screen px-5 pb-16 pt-6"
        style={{ background: 'linear-gradient(160deg, #FBF6EE 0%, #F0E4CE 100%)' }}
      >
        <div className="max-w-[560px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => { setActiveEngine(null); setScreen('onboarding') }}
              className="font-sans text-[13px] text-sand-600 hover:text-sand-900 transition-colors bg-transparent border-none cursor-pointer"
            >
              ← Home
            </button>
            <div className="bg-gradient-to-br from-gold-light via-gold to-gold-dark rounded-full px-4 py-1">
              <span className="font-mono text-[13px] tracking-[0.16em] text-sand-50 uppercase font-medium">
                Tae Studio
              </span>
            </div>
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 bg-white/50 border border-sand-300/60 rounded-xl px-3 py-1.5 font-sans text-[13px] text-sand-700 hover:text-sand-900 transition-colors"
            >
              <Bookmark size={12} />
              Saved {history.length > 0 ? `(${history.length})` : ''}
            </button>
          </div>

          <div className="text-center mb-6">
            <h1 className="font-serif text-[clamp(24px,6vw,34px)] font-bold text-sand-900 leading-tight mb-1">
              Soft Strategy Desk™
            </h1>
            <p className="font-serif italic text-[13px] text-sand-600">Clarity. Language. Next steps.</p>
          </div>

          {/* Engine selector */}
          <AnimatePresence mode="wait">
            {!activeEngine ? (
              <motion.div
                key="selector"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-serif italic text-sm text-sand-700 text-center mb-5">
                  What do you need today?
                </p>
                <div className="flex flex-col gap-3">
                  {Object.values(ENGINES).map(engine => (
                    <button
                      key={engine.id}
                      onClick={() => setActiveEngine(engine.id as EngineId)}
                      className="flex items-center gap-4 bg-white/50 border border-sand-300/50 rounded-2xl p-5 text-left hover:border-lavender-mid/40 hover:bg-lavender/5 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(120,90,50,0.15)] transition-all duration-220 group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-lavender/10 flex items-center justify-center text-2xl flex-shrink-0">
                        {engine.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-base font-semibold text-sand-900 mb-1">{engine.label}</h3>
                        <p className="font-sans text-[13px] text-sand-600 leading-snug">{engine.tagline}</p>
                      </div>
                      <span className="text-gold-dark text-lg font-light flex-shrink-0 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  ))}
                </div>

                {/* Bonus GPT */}
                <div className="mt-5">
                  <div className="flex items-center gap-3 my-4">
                    <div className="h-px flex-1 bg-sand-300/60" />
                    <span className="font-mono text-[13px] tracking-widest text-sand-600 uppercase">Bonus Included</span>
                    <div className="h-px flex-1 bg-sand-300/60" />
                  </div>
                  <a
                    href="https://chatgpt.com/g/g-694b2b2427f48191b128994f409196c5-soft-start"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-sand-100/80 border border-sand-300/40 rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(120,90,50,0.15)] transition-all duration-220 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-gold/8 to-transparent pointer-events-none" />
                    <div className="w-12 h-12 rounded-xl bg-lavender/10 flex items-center justify-center text-2xl flex-shrink-0">✨</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-serif text-sm font-semibold text-sand-900">Soft Start</span>
                        <span className="bg-gold/15 border border-gold-dark/25 rounded-full px-2 py-0.5 font-mono text-[13px] text-gold-dark tracking-widest">GPT</span>
                      </div>
                      <p className="font-sans text-[13px] text-sand-600 leading-snug">
                        Don't know where to start? A calm thinking partner for when everything feels like too much.
                      </p>
                    </div>
                    <span className="text-gold-dark text-sm flex-shrink-0">↗</span>
                  </a>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 pt-6 border-t border-sand-300/40">
                  <p className="font-serif italic text-[13px] text-gold-dark opacity-70 mb-1">
                    "Healing is the strategy. Alignment is the ROI."
                  </p>
                  <p className="font-mono text-[13px] text-sand-500 tracking-widest uppercase mb-4">— Tae Studio</p>
                  <p className="font-sans text-[13px] text-sand-500 leading-relaxed">
                    AI-assisted · Informational only · Not professional advice ·{' '}
                    <a href="/privacy-policy" className="text-sand-600 hover:text-sand-800 transition-colors">
                      Privacy
                    </a>{' · '}
                    <a href="/terms-of-use" className="text-sand-600 hover:text-sand-800 transition-colors">
                      Terms
                    </a>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="engine"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="bg-white/60 border border-sand-300/50 rounded-3xl p-6 shadow-[0_4px_24px_rgba(120,90,50,0.12)]"
              >
                <EngineForm
                  engine={ENGINES[activeEngine]}
                  onBack={() => { setActiveEngine(null); setSelectedOutput(null) }}
                  onGenerated={() => {}}
                  onSaved={handleSaved}
                  userKey={userKey}
                  sessionId={sessionId}
                  initialOutput={selectedOutput}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
