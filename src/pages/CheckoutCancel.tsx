import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { FadeUp, GlowOrb } from '../components/ui'

export default function CheckoutCancel() {
  return (
    <main className="min-h-screen bg-plum-900 flex items-center justify-center px-5">
      <GlowOrb color="lavender" size={500} opacity={0.08} className="top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 max-w-lg w-full text-center">
        <FadeUp>
          <div className="w-20 h-20 rounded-full bg-lavender/10 border border-lavender/25 flex items-center justify-center mx-auto mb-8">
            <ArrowLeft size={32} className="text-lavender" />
          </div>

          <p className="font-mono text-[13px] tracking-widest text-lavender uppercase mb-4">No charge made</p>
          <h1 className="font-serif text-[clamp(32px,6vw,52px)] font-light leading-[1.05] mb-5 text-ink">
            No worries.
          </h1>
          <p className="font-sans text-ink-soft text-base leading-relaxed mb-10 max-w-sm mx-auto">
            Your checkout was cancelled and nothing was charged. Come back whenever you're ready.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/offers"
              className="inline-flex items-center justify-center font-serif font-semibold text-base px-8 py-4 rounded-2xl bg-gradient-to-br from-gold-light via-gold to-gold-dark text-plum-900 shadow-[0_4px_24px_rgba(212,169,74,0.35)] hover:shadow-[0_8px_32px_rgba(212,169,74,0.5)] hover:-translate-y-0.5 transition-all duration-250"
            >
              Browse products →
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
