import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Check, ArrowLeft } from 'lucide-react'
import { fetchServiceBySlug, type Service } from '../lib/services'
import { FadeUp, GoldButton, GlowOrb, SectionLabel, GoldDivider } from '../components/ui'
import { RecoverDownload } from '../components/RecoverDownload'

export default function ServicePage() {
  const { slug } = useParams<{ slug: string }>()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetchServiceBySlug(slug).then(data => {
      if (!data) setNotFound(true)
      else setService(data)
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <main className="min-h-screen bg-plum-900 pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lavender/20 border-t-lavender rounded-full animate-spin" />
      </main>
    )
  }

  if (notFound || !service) {
    return (
      <main className="min-h-screen bg-plum-900 pt-24 flex items-center justify-center px-5">
        <div className="text-center">
          <p className="font-mono text-[13px] tracking-widest text-ink-dim uppercase mb-4">404</p>
          <h1 className="font-serif text-3xl font-light text-ink mb-4">Service not found.</h1>
          <Link to="/offers" className="font-sans text-sm text-lavender hover:text-lavender-light transition-colors underline underline-offset-4">
            View all offers →
          </Link>
        </div>
      </main>
    )
  }

  const isGold = service.accent_color === 'gold'
  const accentText = isGold ? 'text-gold' : 'text-lavender-light'
  const accentBorder = isGold ? 'border-gold/20' : 'border-lavender/20'

  return (
    <main className="min-h-screen bg-plum-900 pt-24">
      {/* Back link */}
      <div className="max-w-5xl mx-auto px-5 pt-6 pb-2">
        <Link
          to="/offers"
          className="inline-flex items-center gap-2 font-sans text-xs text-ink-dim hover:text-ink-soft transition-colors"
        >
          <ArrowLeft size={13} /> All offers
        </Link>
      </div>

      {/* Hero */}
      <section className="relative py-16 px-5 overflow-hidden">
        <GlowOrb
          color={service.accent_color}
          size={500}
          opacity={0.1}
          className="-top-10 left-0 -translate-x-1/4"
        />
        <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <FadeUp>
            <div className={`rounded-3xl overflow-hidden border ${accentBorder} shadow-[0_8px_48px_rgba(0,0,0,0.2)]`}>
              {service.image_url ? (
                <img
                  src={service.image_url}
                  alt={service.name}
                  className="w-full aspect-[4/3] object-cover object-center"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-plum-800 flex items-center justify-center">
                  <span className="text-6xl">{service.icon}</span>
                </div>
              )}
            </div>
          </FadeUp>

          {/* Copy */}
          <FadeUp delay={0.15}>
            <SectionLabel>{service.badge_text}</SectionLabel>
            <h1 className="font-serif text-[clamp(36px,6vw,58px)] font-light mt-6 mb-4 leading-[0.95] tracking-[-0.02em]">
              <span className="text-ink">{service.name.split(' ').slice(0, -1).join(' ')}</span>
              {service.name.split(' ').length > 1 && (
                <>
                  <br />
                  <em className={accentText}>{service.name.split(' ').slice(-1)}</em>
                </>
              )}
            </h1>
            <p className="font-sans text-ink-soft text-sm md:text-base leading-relaxed mb-6">
              {service.description}
            </p>
            <div className="flex items-baseline gap-3 mb-1">
              <span className={`font-serif text-3xl font-light ${accentText}`}>
                {service.price_display}
              </span>
            </div>
            {service.tagline && (
              <p className="font-sans text-xs text-ink-dim mb-8">{service.tagline}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              {service.cta_href.startsWith('http') ? (
                <GoldButton href={service.cta_href}>
                  Get it — {service.price_display} →
                </GoldButton>
              ) : (
                <Link to={service.cta_href}>
                  <GoldButton>
                    {service.price_dollars === 0 ? 'Get it free →' : `Get it — ${service.price_display} →`}
                  </GoldButton>
                </Link>
              )}
            </div>
            {service.stripe_price_id && (
              <RecoverDownload slug={service.slug} productName={service.name} />
            )}
          </FadeUp>
        </div>
      </section>

      {/* Features */}
      {service.features.length > 0 && (
        <section className="py-16 px-5">
          <div className="max-w-3xl mx-auto">
            <GoldDivider className="mb-12" />
            <FadeUp>
              <h2 className="font-serif text-2xl font-light text-ink text-center mb-10">
                What's included
              </h2>
              <ul className="space-y-4">
                {service.features.map(f => (
                  <li key={f} className="flex items-start gap-4 bg-plum-800/40 border border-white/[0.06] rounded-2xl px-6 py-4">
                    <Check size={15} className={`${accentText} mt-0.5 flex-shrink-0`} />
                    <span className="font-sans text-sm text-ink-soft leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </FadeUp>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="relative py-20 px-5">
        <GlowOrb color={service.accent_color} size={400} opacity={0.1} className="top-0 left-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <FadeUp>
            <p className={`font-serif text-3xl font-light ${accentText} mb-2`}>{service.price_display}</p>
            <p className="font-sans text-ink-soft text-sm mb-8">{service.tagline}</p>
            {service.cta_href.startsWith('http') ? (
              <GoldButton href={service.cta_href} size="lg">
                Get {service.name} →
              </GoldButton>
            ) : (
              <Link to={service.cta_href}>
                <GoldButton size="lg">Get {service.name} →</GoldButton>
              </Link>
            )}
          </FadeUp>
        </div>
      </section>
    </main>
  )
}
