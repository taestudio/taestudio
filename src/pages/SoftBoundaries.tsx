import { useState, useEffect } from 'react'
import { FadeUp, GoldDivider, GlowOrb, SectionLabel, GoldButton, Card, Tag } from '../components/ui'
import { Check, Loader2 } from 'lucide-react'
import { startCheckout } from '../lib/checkout'
import { fetchServiceBySlug } from '../lib/services'
import { RecoverDownload } from '../components/RecoverDownload'

function BuyButton({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  const [priceId, setPriceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchServiceBySlug('soft-boundaries').then(s => {
      if (s?.stripe_price_id) setPriceId(s.stripe_price_id)
    })
  }, [])

  const handleCheckout = async () => {
    if (!priceId) return
    setLoading(true)
    setError('')
    try {
      await startCheckout(priceId, { productSlug: 'soft-boundaries' })
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (!priceId) {
    return (
      <GoldButton size={size} href="https://stan.store/taeadams/p/soft-boundaries--starter-pack">
        Get the Scripts — $9 →
      </GoldButton>
    )
  }

  return (
    <div className="space-y-2">
      <GoldButton size={size} onClick={handleCheckout} disabled={loading}>
        {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Processing…</> : 'Get the Scripts — $9 →'}
      </GoldButton>
      {error && <p className="font-sans text-xs text-red-400">{error}</p>}
    </div>
  )
}

const SCRIPTS_BY_CATEGORY = [
  { category: 'Family pressure', examples: ['Holiday visits', 'Unsolicited advice', 'Money asks'] },
  { category: 'Self-care time', examples: ['Protecting rest', 'Solo plans', 'Saying no to social obligations'] },
  { category: 'Work scope creep', examples: ['Extra tasks', 'Taking on more than agreed', 'Unrealistic deadlines'] },
  { category: 'After-hours messages', examples: ['Late-night texts', 'Weekend work demands', 'Urgent-but-not-urgent requests'] },
  { category: 'Emotional dumping', examples: ['Venting without consent', 'One-sided conversations', 'Chronic negativity'] },
  { category: 'Uneven effort', examples: ['Friendships that only go one way', 'Giving more than you receive'] },
  { category: 'Dating pace + access', examples: ['Moving too fast', 'Over-texting', 'Physical boundaries'] },
]

const PUSHBACK_LINES = [
  '"I hear you. My answer is still the same."',
  '"I\'m not discussing this further."',
  '"I\'m going to get going… talk soon."',
]

const HOW_TO_STEPS = [
  { step: '01', title: 'Pick the category + scenario', desc: 'Find the context that matches your moment — family, work, friends, or dating.' },
  { step: '02', title: 'Choose Clean No or New Standard', desc: 'Clean No ends the ask. New Standard sets the ongoing expectation.' },
  { step: '03', title: 'Use the Pushback Line + exit', desc: 'If they push back, pick one of the three Pushback Lines — then close the conversation.' },
]

export default function SoftBoundaries() {
  return (
    <main className="min-h-screen bg-plum-900 pt-24">
      {/* Hero */}
      <section className="relative py-16 md:py-24 px-5 overflow-hidden">
        <GlowOrb color="gold" size={600} opacity={0.09} className="-top-10 left-0 -translate-x-1/4" />
        <GlowOrb color="lavender" size={400} opacity={0.06} className="top-1/2 right-0 translate-x-1/3 -translate-y-1/2" />

        <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
         {/* Image */}
          <FadeUp>
            <div className="relative rounded-3xl overflow-hidden border border-gold/20 shadow-[0_8px_48px_rgba(167,123,255,0.15)]">
              <div className="h-72 md:h-[520px] w-full relative">
                <img
                  src="https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Soft%20boundaries%20img.jpg"
                  alt="Soft Boundaries"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div
                  className="absolute inset-0 hidden md:block"
                  style={{ background: 'linear-gradient(to right, transparent 55%, #14061F 100%)' }}
                />
                <div
                  className="absolute inset-0 md:hidden"
                  style={{ background: 'linear-gradient(to bottom, transparent 55%, #14061F 100%)' }}
                />
              </div>
            </div>
          </FadeUp>

          {/* Copy */}
          <FadeUp delay={0.15}>
            <SectionLabel>Digital Product</SectionLabel>
            <h1 className="font-serif text-[clamp(38px,6vw,60px)] font-light leading-[0.95] mt-6 mb-5 tracking-[-0.02em]">
              Soft Boundaries
              <br />
              <em className="text-lavender-light">Starter Pack</em>
            </h1>
            <p className="font-sans text-ink-soft text-sm md:text-base leading-relaxed mb-6">
              Copy/paste scripts for real-life moments — so you can set boundaries without over-explaining, freezing up, or feeling guilty.
            </p>

            <blockquote className="font-serif italic text-base text-ink leading-relaxed border-l-2 border-lavender/40 pl-5 mb-8">
              A boundary is a decision, not a debate.
            </blockquote>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-serif text-3xl font-light text-gold">$9</span>
              <span className="font-sans text-sm text-ink-dim line-through">$15</span>
            </div>
            <p className="font-sans text-xs text-ink-dim mb-8">Instant download · No account required</p>

            <BuyButton size="lg" />
            <RecoverDownload slug="soft-boundaries" productName="Soft Boundaries Starter Pack" />
          </FadeUp>
        </div>
      </section>

      {/* How to use */}
      <section className="py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <GoldDivider className="mb-14" />
          <FadeUp>
            <p className="font-mono text-[13px] tracking-widest text-gold uppercase text-center mb-2">How to use this in 30 seconds</p>
            <h2 className="font-serif text-2xl font-light text-ink text-center mb-10">Three steps. No prep required.</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_TO_STEPS.map(s => (
              <FadeUp key={s.step}>
                <div className="bg-plum-800/30 border border-white/[0.07] rounded-2xl p-6 h-full">
                  <span className="font-mono text-[13px] text-lavender tracking-widest">{s.step}</span>
                  <h3 className="font-serif text-base font-semibold text-ink mt-3 mb-2">{s.title}</h3>
                  <p className="font-sans text-sm text-ink-soft leading-relaxed">{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* What's inside */}
      <section className="py-12 px-5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Scripts by category */}
          <FadeUp>
            <Card className="p-8 h-full">
              <h2 className="font-serif text-xl font-semibold text-gold mb-6">Copy/paste scripts for</h2>
              <div className="space-y-5">
                {SCRIPTS_BY_CATEGORY.map(cat => (
                  <div key={cat.category}>
                    <p className="font-sans text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">{cat.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.examples.map(ex => (
                        <span key={ex} className="font-sans text-xs text-ink-soft bg-plum-700/40 border border-white/[0.06] rounded-full px-3 py-1">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </FadeUp>

          {/* Pushback lines + formula */}
          <FadeUp delay={0.1}>
            <div className="space-y-6">
              <Card className="p-8">
                <h2 className="font-serif text-xl font-semibold text-ink mb-2">The Formula</h2>
                <p className="font-sans text-xs text-ink-dim mb-5">Every script uses one of two structures</p>
                <div className="space-y-4">
                  {[
                    { label: 'Clean No', desc: 'A direct, polite refusal with no justification required.' },
                    { label: 'New Standard', desc: 'A script that sets the expectation going forward — not just for this moment.' },
                  ].map(f => (
                    <div key={f.label} className="flex gap-3">
                      <div className="w-9 h-9 rounded-xl bg-lavender/10 border border-lavender/20 flex items-center justify-center flex-shrink-0">
                        <Check size={13} className="text-lavender" />
                      </div>
                      <div>
                        <p className="font-serif text-sm font-semibold text-ink mb-0.5">{f.label}</p>
                        <p className="font-sans text-xs text-ink-soft leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="bg-plum-800/40 border border-lavender/15 rounded-2xl p-6">
                <p className="font-mono text-[13px] tracking-widest text-lavender uppercase mb-4">If they push back</p>
                <p className="font-sans text-xs text-ink-dim mb-4">Use one — then exit the conversation.</p>
                <div className="space-y-3">
                  {PUSHBACK_LINES.map(line => (
                    <p key={line} className="font-serif italic text-sm text-ink leading-relaxed flex gap-3">
                      <span className="text-lavender/50 flex-shrink-0">—</span>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-5">
        <GlowOrb color="lavender" size={500} opacity={0.1} className="top-0 left-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <FadeUp>
            <Tag>$9 · Instant Download</Tag>
            <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-light mt-6 mb-5 text-ink leading-tight">
              Stop freezing.<br />
              <em className="text-lavender-light">Start using the words.</em>
            </h2>
            <p className="font-sans text-ink-soft text-sm mb-8 leading-relaxed">
              If you freeze in the moment, come back to this pack. The scripts are ready when you are.
            </p>
            <BuyButton size="lg" />
            <p className="font-sans text-xs text-ink-dim mt-4">Instant download · No account required</p>
          </FadeUp>
        </div>
      </section>
    </main>
  )
}
