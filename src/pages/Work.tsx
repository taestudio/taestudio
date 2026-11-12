import { FadeUp, GoldDivider, GlowOrb, SectionLabel, Card } from '../components/ui'
import { Link } from 'react-router-dom'

const OUTCOMES = [
  {
    name: 'Marcela R.',
    role: 'Corporate VP → Consultant',
    engine: 'Corporate Survival + Decision Clarity',
    quote: 'I used the Corporate Survival engine the night before my PIP meeting. The strategy it gave me was so sharp it felt like having a personal attorney and executive coach in the room.',
    result: 'Negotiated an exit package and launched consulting practice within 60 days.',
    tag: 'Career Transition',
  },
  {
    name: 'Simone T.',
    role: 'Content Creator',
    engine: 'Content-to-Cash',
    quote: 'The hook variants it gave me were better than anything I\'d written myself. I posted one on a Tuesday and had 47 DMs by Friday — two of which turned into clients.',
    result: '$2,400 in new client revenue from a single piece of content.',
    tag: 'Content Strategy',
  },
  {
    name: 'Deja W.',
    role: 'Digital Product Creator',
    engine: 'Soft Business Builder',
    quote: 'I\'d been sitting on my offer idea for 8 months. The Soft Business Builder gave me positioning, a price, and a 7-day launch plan in one session. I launched the next week.',
    result: '$3,100 in first-week sales with a 300-person Instagram following.',
    tag: 'Product Launch',
  },
  {
    name: 'Yara M.',
    role: 'Senior Manager, Tech',
    engine: 'Corporate Survival',
    quote: 'My manager had been building a case against me for months. The Desk helped me see the pattern, document strategically, and respond in a way that completely shifted the dynamic.',
    result: 'Promoted 4 months later. Zero further HR documentation.',
    tag: 'Workplace Navigation',
  },
  {
    name: 'Camille B.',
    role: 'Coach & Speaker',
    engine: 'Soft Business Builder + Content-to-Cash',
    quote: 'The combination of business clarity and content strategy in the same session was something I\'d never experienced anywhere else. It felt like talking to someone who actually understood both halves.',
    result: 'Sold out a $1,200 group program in 12 days.',
    tag: 'Program Launch',
  },
  {
    name: 'Kezia O.',
    role: 'Finance Executive',
    engine: 'Decision Clarity',
    quote: 'I\'d spent $3k on coaching trying to decide whether to leave my firm. The Desk gave me the clearest read I\'d gotten in years — in 20 minutes, completely free.',
    result: 'Made the decision with confidence. Started her firm 3 months later.',
    tag: 'Life Decision',
  },
]

const TAG_COLORS: Record<string, string> = {
  'Career Transition': 'text-gold border-gold/30 bg-gold/8',
  'Content Strategy': 'text-lavender border-lavender/30 bg-lavender/8',
  'Product Launch': 'text-gold-light border-gold-light/30 bg-gold/5',
  'Workplace Navigation': 'text-lavender-light border-lavender/25 bg-lavender/5',
  'Program Launch': 'text-gold border-gold/30 bg-gold/8',
  'Life Decision': 'text-lavender-mid border-lavender/25 bg-lavender/5',
}

export default function Work() {
  return (
    <main className="min-h-screen bg-plum-900 pt-24">
      {/* Hero */}
      <section className="relative py-20 px-5 overflow-hidden">
        <GlowOrb color="gold" size={500} opacity={0.1} className="-top-10 right-0" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeUp>
            <SectionLabel>Outcomes & Results</SectionLabel>
            <h1 className="font-serif text-[clamp(40px,8vw,68px)] font-light leading-[0.95] mt-6 mb-6 tracking-[-0.02em]">
              <span className="text-ink">Real women.</span>
              <br />
              <em className="text-lavender-light">Real moves.</em>
            </h1>
            <p className="font-sans text-ink-soft text-base md:text-lg leading-relaxed max-w-xl mx-auto">
              These are the stories of women who stopped spiraling and started moving — with the Desk as their thinking partner.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Outcomes grid */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {OUTCOMES.map((outcome, i) => (
              <FadeUp key={outcome.name} delay={i * 0.06}>
                <Card className="p-8 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className="font-serif text-base font-semibold text-ink">{outcome.name}</p>
                      <p className="font-sans text-xs text-ink-dim mt-0.5">{outcome.role}</p>
                    </div>
                    <span className={`font-mono text-[13px] tracking-wider uppercase border rounded-full px-2.5 py-1 ${TAG_COLORS[outcome.tag] || 'text-ink-dim border-white/10'}`}>
                      {outcome.tag}
                    </span>
                  </div>

                  <blockquote className="font-serif italic text-sm text-ink-soft leading-relaxed mb-5 flex-1">
                    "{outcome.quote}"
                  </blockquote>

                  <div className="border-t border-white/[0.07] pt-5">
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-full min-h-[2rem] bg-gradient-to-b from-gold to-gold-dark rounded-full flex-shrink-0" />
                      <div>
                        <p className="font-mono text-[13px] tracking-widest text-ink-dim uppercase mb-1">Outcome</p>
                        <p className="font-sans text-sm text-gold-light font-medium leading-relaxed">{outcome.result}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/[0.05]">
                    <p className="font-mono text-[13px] tracking-widest text-ink-dim uppercase">Engine used</p>
                    <p className="font-sans text-xs text-lavender mt-1">{outcome.engine}</p>
                  </div>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <FadeUp>
            <GoldDivider className="mb-8" />
            <h2 className="font-serif text-[clamp(28px,5vw,44px)] font-light text-ink mb-5 leading-tight">
              Your story starts<br />
              <em className="text-lavender-light">with one session.</em>
            </h2>
            <p className="font-sans text-ink-soft text-sm mb-10 leading-relaxed">
              First use is free. No account. No credit card. Just clarity.
            </p>
            <Link to="/desk">
              <button className="inline-flex items-center gap-2 font-serif text-lg font-semibold text-gold border border-gold/40 rounded-2xl px-8 py-4 hover:bg-gold/10 transition-all duration-200">
                Open the Soft Strategy Desk™ →
              </button>
            </Link>
          </FadeUp>
        </div>
      </section>
    </main>
  )
}
