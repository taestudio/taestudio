import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { FadeUp, GlowOrb } from '../components/ui'

export default function CheckoutSuccess() {
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <main className="min-h-screen bg-plum-900 flex items-center justify-center px-5">
      <GlowOrb color="gold" size={600} opacity={0.1} className="top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 max-w-lg w-full text-center">
        <FadeUp>
          <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={36} className="text-gold" />
          </div>

          <p className="font-mono text-[13px] tracking-widest text-gold uppercase mb-4">Order Confirmed</p>
          <h1 className="font-serif text-[clamp(32px,6vw,52px)] font-light leading-[1.05] mb-5 text-ink">
            You're all set.
          </h1>
          <p className="font-sans text-ink-soft text-base leading-relaxed mb-10 max-w-sm mx-auto">
            Your purchase was successful. Check your inbox — your download link is on its way.
          </p>

          {sessionId && (
            <p className="font-mono text-[13px] text-ink-dim mb-10 tracking-wider">
              Order ref: {sessionId.slice(-12).toUpperCase()}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/offers"
              className="inline-flex items-center justify-center font-serif font-semibold text-base px-8 py-4 rounded-2xl bg-gradient-to-br from-gold-light via-gold to-gold-dark text-plum-900 shadow-[0_4px_24px_rgba(212,169,74,0.35)] hover:shadow-[0_8px_32px_rgba(212,169,74,0.5)] hover:-translate-y-0.5 transition-all duration-250"
            >
              Explore more →
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center font-sans text-sm text-ink-dim hover:text-ink transition-colors px-8 py-4 border border-white/[0.08] rounded-2xl"
            >
              Back to home
            </Link>
          </div>
        </FadeUp>
      </div>
    </main>
  )
}
