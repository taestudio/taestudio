import { useState } from 'react'
import { FadeUp, GlowOrb, SectionLabel, GoldButton, GoldDivider } from '../components/ui'
import { getRecaptchaToken } from '../lib/recaptcha'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState('')

  const valid = form.name.trim() && form.email.includes('@') && form.message.trim().length > 10

  const handleSubmit = async () => {
    if (!valid || state === 'loading') return
    setState('loading')
    setError('')
    try {
      const recaptchaToken = await getRecaptchaToken('contact')
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          recaptcha_token: recaptchaToken,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Request failed')
      setState('success')
    } catch (err) {
      setState('error')
      setError(
        err instanceof Error && err.message === 'Too many requests. Please try again later.'
          ? err.message
          : err instanceof Error && err.message !== 'Request failed'
            ? err.message
            : 'Something went wrong. Please try again or email directly.',
      )
    }
  }

  const inputCls = 'w-full bg-plum-800/60 border border-white/[0.08] rounded-2xl px-5 py-4 font-sans text-sm text-ink placeholder-ink-dim/60 outline-none focus:border-lavender/50 transition-colors duration-200 resize-none'

  return (
    <main className="min-h-screen bg-plum-900 pt-24">
      <section className="relative py-20 px-5 overflow-hidden">
        <GlowOrb color="lavender" size={500} opacity={0.1} className="-top-10 left-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <FadeUp className="text-center mb-14">
            <SectionLabel>Get in Touch</SectionLabel>
            <h1 className="font-serif text-[clamp(36px,7vw,58px)] font-light leading-tight mt-6 mb-5 tracking-[-0.02em]">
              <span className="text-ink">Let's talk.</span>
            </h1>
            <p className="font-sans text-ink-soft text-base leading-relaxed">
              For collaborations, the AI Twin service, speaking, or anything else — send a message and we'll respond within 3 business days.
            </p>
          </FadeUp>

          {state === 'success' ? (
            <FadeUp>
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-3xl bg-gold/10 border border-gold/25 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">✦</span>
                </div>
                <h2 className="font-serif text-2xl font-light text-ink mb-3">Message received.</h2>
                <p className="font-sans text-sm text-ink-soft leading-relaxed max-w-sm mx-auto">
                  We'll be in touch within 3 business days. In the meantime, the Desk is always open.
                </p>
                <div className="mt-8">
                  <a href="/desk" className="font-sans text-sm text-gold hover:text-gold-light transition-colors underline underline-offset-4">
                    Open the Soft Strategy Desk →
                  </a>
                </div>
              </div>
            </FadeUp>
          ) : (
            <FadeUp>
              <div className="bg-plum-800/40 border border-white/[0.07] rounded-3xl p-8 md:p-10">
                <div className="space-y-5">
                  <div>
                    <label className="block font-serif text-sm font-semibold text-ink mb-2">Your name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="First and last name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block font-serif text-sm font-semibold text-ink mb-2">Email address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="your@email.com"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block font-serif text-sm font-semibold text-ink mb-2">Message</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us what you're working on, what you need, or what question you have..."
                      rows={6}
                      className={inputCls}
                    />
                  </div>

                  {error && (
                    <p className="font-sans text-xs text-red-400 leading-relaxed">{error}</p>
                  )}

                  <GoldButton onClick={handleSubmit} disabled={!valid || state === 'loading'} className="w-full">
                    {state === 'loading' ? 'Sending...' : 'Send Message →'}
                  </GoldButton>

                  <p className="font-sans text-xs text-ink-dim text-center leading-relaxed">
                    For AI Twin inquiries, also visit the{' '}
                    <a href="/ai-twin" className="text-lavender hover:text-lavender-light transition-colors">
                      full offer page
                    </a>
                    .
                  </p>
                </div>
              </div>
            </FadeUp>
          )}

          <FadeUp delay={0.15} className="mt-12">
            <GoldDivider className="mb-8" />
            <p className="font-serif italic text-gold text-sm text-center opacity-75">
              "Healing is the strategy. Alignment is the ROI."
            </p>
            <p className="font-mono text-[13px] tracking-widest text-ink-dim uppercase text-center mt-1">— Tae Studio</p>
          </FadeUp>
        </div>
      </section>
    </main>
  )
}
