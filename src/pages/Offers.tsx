import { Link } from 'react-router-dom'
import { FadeUp, GoldDivider, GlowOrb, SectionLabel, GoldButton, Tag } from '../components/ui'
import { Check } from 'lucide-react'
import { useServices, type Service } from '../lib/services'

function ServiceSection({ service, reverse = false }: { service: Service; reverse?: boolean }) {
  const isGold = service.accent_color === 'gold'

  const visual = (
    <FadeUp delay={0.15} className={reverse ? 'order-2 md:order-1' : ''}>
      <div className={`rounded-3xl overflow-hidden border ${isGold ? 'border-gold/20 shadow-[0_8px_48px_rgba(211,163,96,0.1)]' : 'border-lavender/20'}`}>
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            className="w-full aspect-square object-cover object-center"
          />
        ) : (
          <div className="aspect-square bg-gradient-to-br from-plum-800/80 to-plum-950/80 flex items-center justify-center p-10">
            <div className="text-center">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${isGold ? 'bg-gold/10 border border-gold/25' : 'bg-lavender/10 border border-lavender/25'}`}>
                <span className="text-4xl">{service.icon}</span>
              </div>
              <p className="font-serif text-2xl font-light text-ink mb-2">{service.name}</p>
              <p className={`font-serif italic text-sm ${isGold ? 'text-gold' : 'text-lavender'}`}>{service.price_display}</p>
            </div>
          </div>
        )}
      </div>
    </FadeUp>
  )

  const copy = (
    <FadeUp className={reverse ? 'order-1 md:order-2' : ''}>
      <Tag>{service.badge_text}</Tag>
      <h2 className="font-serif text-[clamp(30px,5vw,46px)] font-light mt-5 mb-5 text-ink leading-tight">
        {service.name}
      </h2>
      <p className="font-sans text-ink-soft text-sm leading-relaxed mb-6">{service.description}</p>
      {service.features.length > 0 && (
        <ul className="space-y-3 mb-8">
          {service.features.map(f => (
            <li key={f} className="flex items-start gap-3">
              <Check size={15} className={`${isGold ? 'text-gold' : 'text-lavender'} mt-0.5 flex-shrink-0`} />
              <span className="font-sans text-sm text-ink-soft">{f}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-5 flex-wrap">
        {service.cta_href.startsWith('http') ? (
          <GoldButton href={service.cta_href}>
            {service.price_dollars === 0 ? 'Get it free →' : `Get it — ${service.price_display} →`}
          </GoldButton>
        ) : (
          <Link to={service.cta_href}>
            <GoldButton>
              {service.price_dollars === 0 ? 'Get it free →' : `Get it — ${service.price_display} →`}
            </GoldButton>
          </Link>
        )}
        {service.page_href && service.page_href !== service.cta_href && (
          <Link to={service.page_href} className="font-sans text-sm text-ink-soft hover:text-ink transition-colors">
            See full details
          </Link>
        )}
      </div>
    </FadeUp>
  )

  return (
    <section className="py-20 px-5">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {reverse ? <>{visual}{copy}</> : <>{copy}{visual}</>}
      </div>
    </section>
  )
}

export default function Offers() {
  const { services, loading } = useServices()

  return (
    <main className="min-h-screen bg-plum-900 pt-24">
      {/* Header */}
      <section className="relative py-20 px-5 overflow-hidden">
        <GlowOrb color="lavender" size={600} opacity={0.1} className="-top-20 left-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeUp>
            <SectionLabel>The Ecosystem</SectionLabel>
            <h1 className="font-serif text-[clamp(40px,8vw,68px)] font-light leading-[0.95] mt-6 mb-6 tracking-[-0.02em]">
              <span className="text-ink">Every stage.</span>
              <br />
              <em className="text-lavender-light">Every budget.</em>
            </h1>
            <p className="font-sans text-ink-soft text-base md:text-lg leading-relaxed max-w-xl mx-auto">
              A full ecosystem designed to meet you where you are — and guide you into what's next.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Journey overview strip */}
      <section className="py-14 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-plum-800/40 rounded-2xl px-5 h-14 w-28 animate-pulse" />
                ))
              : services.flatMap((s, i) => {
                  const items: React.ReactNode[] = []
                  if (i > 0) items.push(
                    <div key={`arr-${i}`} className="flex items-center text-gold/40 text-xl font-light">→</div>
                  )
                  items.push(
                    <div key={s.id} className="text-center">
                      <div className="bg-plum-800/60 border border-white/[0.07] rounded-2xl px-5 py-3">
                        <p className="font-serif text-sm font-semibold text-ink">{s.name}</p>
                        <p className="font-mono text-[13px] text-gold tracking-widest">{s.price_display}</p>
                      </div>
                    </div>
                  )
                  return items
                })
            }
          </div>
        </div>
      </section>

      {/* Service sections */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-lavender/20 border-t-lavender rounded-full animate-spin" />
        </div>
      ) : (
        services.map((service, i) => (
          <div key={service.id}>
            {i > 0 && <div className="max-w-5xl mx-auto px-5"><GoldDivider /></div>}
            <ServiceSection service={service} reverse={i % 2 === 1} />
          </div>
        ))
      )}
    </main>
  )
}
