import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import { FadeUp, GoldDivider, GlowOrb, SectionLabel, GoldButton } from '../components/ui'
import { getRecaptchaToken } from '../lib/recaptcha'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

const DOWNLOAD_URL =
  'https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/products/alignedcontentenergyguide.pdf'

const INCLUDED = [
  'The 3-pillar Alignment Assessment',
  'A brand energy audit you can complete in 20 minutes',
  'The Soft System™ reset framework',
  'A 3-day clarity protocol',
  'Entry into the Soft Strategy ecosystem',
]

type GateState = 'idle' | 'loading' | 'success' | 'error'

export default function AlignmentGuide() {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [state, setState] = useState<GateState>('idle')

  const valid = email.includes('@') && email.includes('.') && consent

  const handleSubmit = async () => {
    if (!valid || state === 'loading') return
    setState('loading')
    try {
      const recaptchaToken = await getRecaptchaToken('alignment_guide')
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-alignment-guide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'alignment-guide', consent, recaptcha_token: recaptchaToken }),
      })
      if (!res.ok) throw new Error('Request failed')
      setState('success')
    } catch (_) {
      setState('error')
    }
  }

  return (
    <main className="min-h-screen bg-plum-900 pt-24">
      {/* Hero */}
      <section className="relative py-16 md:py-24 px-5 overflow-hidden">
        <GlowOrb color="gold" size={600} opacity={0.1} className="-top-10 left-0 -translate-x-1/4" />
        <GlowOrb color="lavender" size={400} opacity={0.06} className="top-1/2 right-0 translate-x-1/3 -translate-y-1/2" />

        <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Image */}
          <FadeUp>
            <div className="relative rounded-3xl overflow-hidden border border-gold/20 shadow-[0_8px_48px_rgba(212,169,74,0.12)]">
              <div className="h-72 md:h-[520px] w-full relative">
                <img
                  src="https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/AI%20Twin.jpg"
                  alt="FREE Alignment Guide — Tae Studio"
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
            <SectionLabel>Free Resource</SectionLabel>
            <h1 className="font-serif text-[clamp(38px,6vw,62px)] font-light leading-[0.95] mt-6 mb-5 tracking-[-0.02em]">
              Stop Creating
              <br />
              <em className="text-gold-light">from Chaos.</em>
            </h1>
            <p className="font-sans text-ink-soft text-sm md:text-base leading-relaxed mb-4">
              The FREE Alignment Guide helps you realign your brand, energy, and content strategy before you spend another minute posting, planning, or pitching from the wrong foundation.
            </p>
            <p className="font-mono text-[13px] tracking-widest text-ink-dim uppercase">
              Delivered free · No credit card required
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Content + Form */}
      <section className="py-12 px-5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
          {/* Left: Benefits */}
          <FadeUp>
            <h2 className="font-serif text-2xl font-light text-ink mb-6">What's inside</h2>
            <ul className="space-y-4 mb-10">
              {INCLUDED.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={11} className="text-gold" />
                  </div>
                  <span className="font-sans text-sm text-ink-soft leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <GoldDivider className="my-8 justify-start" />

            <blockquote className="font-serif italic text-base text-ink-soft leading-relaxed border-l-2 border-gold/40 pl-5">
              "Before the Alignment Guide, I was creating daily and getting nowhere. After the 3-day reset, I went quiet for a week and came back with a $1,200 offer that sold out."
              <footer className="font-sans text-xs text-ink-dim mt-2 not-italic">— Simone T., Content Creator</footer>
            </blockquote>
          </FadeUp>

          {/* Right: Capture form */}
          <FadeUp delay={0.12}>
            {state === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-plum-800/40 border border-gold/20 rounded-3xl p-8 text-center"
              >
                <div className="w-16 h-16 rounded-3xl bg-gold/10 border border-gold/25 flex items-center justify-center mx-auto mb-5">
                  <span className="text-3xl">✦</span>
                </div>
                <h3 className="font-serif text-xl font-light text-ink mb-3">You're in.</h3>
                <p className="font-sans text-sm text-ink-soft leading-relaxed mb-6 max-w-xs mx-auto">
                  Check your inbox — the Alignment Guide is on its way. Or grab it right now.
                </p>
                <a
                  href={DOWNLOAD_URL}
                  download
                  className="block w-full py-3.5 rounded-2xl font-serif font-semibold text-base text-center transition-all duration-200 bg-gradient-to-br from-gold-light via-gold to-gold-dark text-plum-900 hover:shadow-[0_4px_24px_rgba(212,169,74,0.25)]"
                >
                  Download the Guide
                </a>
                <Link to="/desk" className="block mt-3">
                  <GoldButton size="sm" className="w-full">Open the Soft Strategy Desk™ →</GoldButton>
                </Link>
                <p className="font-sans text-xs text-ink-dim mt-4">
                  Or explore the full{' '}
                  <Link to="/offers" className="text-lavender hover:text-lavender-light transition-colors underline underline-offset-2">
                    offer ecosystem
                  </Link>
                  .
                </p>
              </motion.div>
            ) : (
              <div className="bg-plum-800/40 border border-white/[0.08] rounded-3xl p-8">
                <h3 className="font-serif text-xl font-semibold text-ink mb-2">Get the free guide</h3>
                <p className="font-sans text-sm text-ink-dim leading-relaxed mb-6">
                  Enter your email and we'll deliver it straight to your inbox.
                </p>

                <div className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-plum-900/60 border border-white/[0.08] rounded-2xl px-4 py-3.5 font-sans text-sm text-ink placeholder-ink-dim/50 outline-none focus:border-lavender/50 transition-colors"
                  />

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="guide-consent"
                      checked={consent}
                      onChange={e => setConsent(e.target.checked)}
  className="mt-1 h-4 w-4 cursor-pointer appearance-auto"
                    />
                    <label htmlFor="guide-consent" className="font-sans text-[13px] text-ink-soft leading-relaxed cursor-pointer">
                      I agree to receive emails from Tae Studio. Unsubscribe anytime. View our{' '}
                      <a
                        href="https://www.notion.so/Privacy-Policy-Tae-Adams-Studio-3540e9d9f43c819b8a08cd86061d14f6"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lavender hover:text-lavender-light font-semibold transition-colors"
                      >
                        Privacy Policy
                      </a>
                      .
                    </label>
                  </div>

                  {state === 'error' && (
                    <p className="font-sans text-xs text-red-400">Something went wrong. Please try again.</p>
                  )}

                  <GoldButton
                    onClick={handleSubmit}
                    disabled={!valid || state === 'loading'}
                    className="w-full"
                    size="md"
                  >
                    {state === 'loading' ? 'Sending...' : 'Send Me the Free Guide →'}
                  </GoldButton>

                  <p className="font-sans text-[13px] text-ink-dim text-center">
                    Your information is never sold or shared.
                  </p>
                </div>
              </div>
            )}
          </FadeUp>
        </div>
      </section>

      {/* What's next */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-12">
            <SectionLabel>The Ecosystem</SectionLabel>
            <h2 className="font-serif text-[clamp(28px,5vw,42px)] font-light mt-5 text-ink">
              The guide is just the beginning.
            </h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                step: '01',
                title: 'Alignment Guide',
                desc: 'Reset your foundation. Get clear on your brand, energy, and what actually needs to change.',
                label: 'Free · You are here',
                accent: 'border-gold/25',
              },
              {
                step: '02',
                title: 'Soft Boundaries Script Pack',
                desc: 'Scripts for every situation where you need clear, confident language that doesn\'t compromise.',
                label: '$47 · Instant download',
                accent: 'border-lavender/25',
                href: '/soft-boundaries',
              },
              {
                step: '03',
                title: 'Soft Strategy Desk™',
                desc: 'AI-powered strategy available anytime. Four engines for work, content, decisions, and business.',
                label: 'Free first session',
                accent: 'border-lavender/35',
                href: '/desk',
              },
            ].map((item, i) => (
              <FadeUp key={item.step} delay={i * 0.08}>
                <div className={`border ${item.accent} bg-plum-800/30 rounded-3xl p-6 h-full flex flex-col`}>
                  <span className="font-mono text-[13px] tracking-widest text-ink-dim uppercase mb-3">{item.step}</span>
                  <h3 className="font-serif text-base font-semibold text-ink mb-3">{item.title}</h3>
                  <p className="font-sans text-sm text-ink-dim leading-relaxed flex-1 mb-5">{item.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[13px] text-gold tracking-wide">{item.label}</span>
                    {item.href && (
                      <Link to={item.href}>
                        <ArrowRight size={14} className="text-gold hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
