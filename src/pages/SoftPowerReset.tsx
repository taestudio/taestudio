import { useState, useEffect } from 'react'
import { FadeUp, GoldDivider, GlowOrb, SectionLabel, GoldButton, Card, Tag } from '../components/ui'
import { Check, Star, Loader2 } from 'lucide-react'
import { startCheckout } from '../lib/checkout'
import { fetchServiceBySlug } from '../lib/services'
import { RecoverDownload } from '../components/RecoverDownload'

function BuyButton({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  const [priceId, setPriceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchServiceBySlug('soft-power-reset').then(s => {
      if (s?.stripe_price_id) setPriceId(s.stripe_price_id)
    })
  }, [])

  const handleCheckout = async () => {
    if (!priceId) return
    setLoading(true)
    setError('')
    try {
      await startCheckout(priceId, { productSlug: 'soft-power-reset' })
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (!priceId) {
    return (
      <GoldButton size={size} href="https://stan.store/taeadams/p/the-soft-power-reset-ebook">
        Get the eBook — $11.99 →
      </GoldButton>
    )
  }

  return (
    <div className="space-y-2">
      <GoldButton size={size} onClick={handleCheckout} disabled={loading}>
        {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Processing…</> : 'Get the eBook — $11.99 →'}
      </GoldButton>
      {error && <p className="font-sans text-xs text-red-400">{error}</p>}
    </div>
  )
}

const WALK_AWAY_WITH = [
  {
    label: 'Burnout Check-In',
    desc: 'Uncover exactly where you\'re carrying too much — before it carries you.',
  },
  {
    label: 'Soft ROI Tracker',
    desc: 'Measure wins that can\'t be captured in KPIs — peace, boundaries, clarity.',
  },
  {
    label: 'Clarity Compass',
    desc: 'Rewrite hustle goals into soul-aligned intentions that actually feel like yours.',
  },
  {
    label: 'Gentle Planning Sheet',
    desc: 'Stay productive without the pressure. Progress that honors your energy.',
  },
]

const FOR_YOU_IF = [
  'Achieve your dreams without abandoning yourself',
  'Find meaning in your work again',
  'Track growth that can\'t be measured in KPIs',
  'Heal from hustle and build your life in peace',
]

const REVIEWS = [
  {
    name: 'Amanda K.',
    text: 'I didn\'t realize how burnt out I was until this slowed me down in the best way. I felt clearer after the first section. This isn\'t fluff... it actually helps you reset and move forward without pressure.',
  },
  {
    name: 'Mina R.',
    text: 'I bought this thinking it would be "nice." It ended up being exactly what I needed to reset my energy and focus.',
  },
]

function StarRow() {
  return (
    <div className="flex gap-1 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} className="text-gold fill-gold" />
      ))}
    </div>
  )
}

export default function SoftPowerReset() {
  return (
    <main className="min-h-screen bg-plum-900 pt-24">
      {/* Hero */}
      <section className="relative py-16 md:py-24 px-5 overflow-hidden">
        <GlowOrb color="gold" size={600} opacity={0.09} className="-top-10 left-0 -translate-x-1/4" />
        <GlowOrb color="lavender" size={400} opacity={0.07} className="top-1/2 right-0 translate-x-1/3 -translate-y-1/2" />

        <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Image */}
          <FadeUp>
            <div className="relative rounded-3xl overflow-hidden border border-gold/20 shadow-[0_8px_48px_rgba(211,163,96,0.12)]">
              <div className="h-72 md:h-[520px] w-full relative">
                <img
                  src="https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Soft%20power%20reset.jpg"
                  alt="The Soft Power Reset eBook"
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
            <SectionLabel>Digital Product · eBook</SectionLabel>
            <h1 className="font-serif text-[clamp(38px,6vw,60px)] font-light leading-[0.95] mt-6 mb-5 tracking-[-0.02em]">
              The Soft Power
              <br />
              <em className="text-gold">Reset</em>
            </h1>
            <p className="font-sans text-ink-soft text-sm md:text-base leading-relaxed mb-6">
              Feeling burnt out from chasing your goals? This gentle workbook helps you realign your energy, heal your hustle, and still get things done — softly.
            </p>

            <blockquote className="font-serif italic text-base text-ink leading-relaxed border-l-2 border-gold/40 pl-5 mb-8">
              This isn't just productivity... this is soft power.
            </blockquote>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-serif text-3xl font-light text-gold">$11.99</span>
              <span className="font-sans text-sm text-ink-dim line-through">$22</span>
            </div>
            <p className="font-sans text-xs text-ink-dim mb-8">Instant digital download · No pressure, all power.</p>

            <BuyButton size="lg" />
            <RecoverDownload slug="soft-power-reset" productName="The Soft Power Reset" />
          </FadeUp>
        </div>
      </section>

      {/* Walk away with */}
      <section className="py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <GoldDivider className="mb-14" />
          <FadeUp>
            <p className="font-mono text-[13px] tracking-widest text-gold uppercase text-center mb-2">What's inside</p>
            <h2 className="font-serif text-2xl font-light text-ink text-center mb-10">You'll walk away with</h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {WALK_AWAY_WITH.map((item, i) => (
              <FadeUp key={item.label} delay={i * 0.08}>
                <div className="bg-plum-800/30 border border-white/[0.07] rounded-2xl p-6 h-full">
                  <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
                    <span className="font-mono text-[13px] text-gold tracking-widest">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="font-serif text-base font-semibold text-ink mb-2">{item.label}</h3>
                  <p className="font-sans text-sm text-ink-soft leading-relaxed">{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* This is for you if */}
      <section className="py-12 px-5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <FadeUp>
            <p className="font-mono text-[13px] tracking-widest text-gold uppercase mb-4">This is for you if you want to</p>
            <ul className="space-y-4">
              {FOR_YOU_IF.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <Check size={15} className="text-gold mt-0.5 flex-shrink-0" />
                  <span className="font-sans text-sm text-ink-soft leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="bg-plum-800/40 border border-gold/15 rounded-2xl p-8">
              <p className="font-mono text-[13px] tracking-widest text-gold uppercase mb-4">Reflect. Reset. Restructure.</p>
              <p className="font-serif text-xl font-light text-ink leading-snug mb-5">
                Inside, you'll reflect, reset, and restructure your routines in a way that honors your peace <em>and</em> your progress.
              </p>
              <p className="font-serif italic text-sm text-gold/80">
                This is the reset you've been putting off.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <GoldDivider className="mb-14" />
          <FadeUp>
            <p className="font-mono text-[13px] tracking-widest text-gold uppercase text-center mb-10">What readers are saying</p>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {REVIEWS.map((r, i) => (
              <FadeUp key={r.name} delay={i * 0.1}>
                <Card className="p-7 h-full">
                  <StarRow />
                  <p className="font-sans text-sm text-ink-soft leading-relaxed mb-5 italic">"{r.text}"</p>
                  <p className="font-sans text-xs font-semibold text-ink uppercase tracking-wide">— {r.name}</p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-24 px-5">
        <GlowOrb color="gold" size={500} opacity={0.1} className="top-0 left-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <FadeUp>
            <Tag>$11.99 · Instant Download</Tag>
            <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-light mt-6 mb-5 text-ink leading-tight">
              This is the reset<br />
              <em className="text-gold">you've been putting off.</em>
            </h2>
            <p className="font-sans text-ink-soft text-sm mb-8 leading-relaxed">
              No pressure. All power. Reflect, reset, and restructure at your own pace.
            </p>
            <BuyButton size="lg" />
            <p className="font-sans text-xs text-ink-dim mt-4">Instant digital download · No pressure, all power.</p>
          </FadeUp>
        </div>
      </section>
    </main>
  )
}
