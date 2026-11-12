import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FadeUp, GoldDivider, GlowOrb, SectionLabel, GoldButton, Card, Tag } from '../components/ui'
import { Check, Star } from 'lucide-react'

const ENGINES = [
  {
    emoji: '🛡️',
    label: 'Corporate Survival',
    desc: 'Professional scripts, documentation strategy, meeting prep, and boundary language for navigating toxic workplaces, PIPs, and difficult managers.',
  },
  {
    emoji: '💸',
    label: 'Content-to-Cash',
    desc: 'Hooks, captions, reel scripts, CTAs, and DM responses built around your topic, offer, and audience.',
  },
  {
    emoji: '🧭',
    label: 'Decision Clarity',
    desc: 'A direct assessment of your situation, fear vs. wisdom breakdown, one clear recommendation, and your next move.',
  },
  {
    emoji: '🌿',
    label: 'Soft Business Builder',
    desc: 'A refined offer, lead magnet, simple funnel, 90-day content plan, and 7-day action plan built for where you actually are.',
  },
]

const USE_CASES = [
  'Responding to a difficult manager',
  'Writing your next post',
  'Choosing whether to quit',
  'Pricing your offer',
  'Finding clarity when everything feels like too much',
]

const FOR_YOU_IF = [
  'You\'re being undermined at work',
  'You\'re stuck between two choices',
  'Your content isn\'t converting',
  'You\'re building a business without burning out',
]

const REVIEWS = [
  {
    name: 'Janay Clark',
    text: 'I used Soft Start for regular life stuff like errands, appointments, cleaning, and planning my week. In one session, it helped me brain dump everything, pick my top 3 priorities, and turn it into a simple checklist + time blocks I could actually follow. No pressure, no spiraling. JUST calm clarity and a real next step.',
  },
  {
    name: 'Kevin T.',
    role: 'Independent Consultant',
    text: 'I\'m really good at gathering information. Less good at deciding. Soft Start helped me trust my own judgment again instead of checking five opinions first. I didn\'t need more ideas. I needed a way to choose — and this gave me that.',
  },
  {
    name: 'Erica J.',
    role: 'Decluttering / Organizing',
    text: 'I\'ve been helping friends organize their homes, but I didn\'t see it as something I could really build. Soft Start helped me stop shrinking what I was already good at. I kept it small, stayed consistent, and finally feel like I am making progress instead of just thinking about it.',
  },
  {
    name: 'Zara J.',
    role: 'Lash Tech',
    text: 'I already have clients. I just didn\'t feel organized or confident about what I was building. Soft Start helped me stop treating my business like a side thing I did "when I felt like it." I raised my prices, fixed my booking flow, and stopped overthinking every decision.',
  },
  {
    name: 'Lauren P.',
    role: 'Pet Sitting / Dog Walking',
    text: 'I was watching dogs on the side, but I kept treating it like a favor instead of a service. Soft Start helped me take myself seriously without making it feel like I had to turn my life upside down. I made it simple, stuck to one offer, and finally stopped overthinking every decision.',
  },
  {
    name: 'Danielle C.',
    text: 'I had products sitting in my house and ideas sitting in my head. Soft Start helped me stop waiting for the "perfect" moment and just start where I was. Nothing about this felt rushed or overwhelming. I started without waiting to feel perfect.',
  },
  {
    name: 'Andre L.',
    role: 'Resume Writer',
    text: 'It made starting feel manageable instead of overwhelming.',
  },
  {
    name: 'Trish M.',
    role: 'Admin Support / Side Income',
    text: 'I wasn\'t stuck because I didn\'t know what to do. I was stuck because every option felt heavy. Soft Start helped me choose one lane and stay there long enough to see progress. I didn\'t quit my job. I didn\'t blow up my life. I just started — and that made everything feel possible again.',
  },
]

function StarRow() {
  return (
    <div className="flex gap-1 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={11} className="text-gold fill-gold" />
      ))}
    </div>
  )
}

export default function SoftStrategyDesk() {
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    setHasAccess(!!localStorage.getItem('desk_access'))
  }, [])

  return (
    <main className="min-h-screen bg-plum-900 pt-24">
      {/* Hero */}
      <section className="relative py-16 md:py-24 px-5 overflow-hidden">
        <GlowOrb color="gold" size={600} opacity={0.1} className="-top-10 left-0 -translate-x-1/4" />
        <GlowOrb color="lavender" size={400} opacity={0.07} className="top-1/2 right-0 translate-x-1/3 -translate-y-1/2" />

        <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Visual */}
          <FadeUp>
            <div className="relative rounded-3xl overflow-hidden border border-gold/20 shadow-[0_8px_48px_rgba(212,169,74,0.12)]">
              <div className="h-72 md:h-[520px] w-full relative bg-plum-800">
                <img
                  src="https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Soft%20desk.jpg"
                  alt="Soft Strategy Desk"
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
            <SectionLabel>Flagship Tool · AI Clarity</SectionLabel>
            <h1 className="font-serif text-[clamp(38px,6vw,60px)] font-light leading-[0.95] mt-6 mb-5 tracking-[-0.02em]">
              Soft Strategy
              <br />
              <em className="text-gold">Desk™</em>
            </h1>
            <p className="font-sans text-ink-soft text-sm md:text-base leading-relaxed mb-5">
              An AI-powered clarity tool that turns your real situation into exact scripts, aligned decisions, and executable plans — in minutes.
            </p>

            <blockquote className="font-serif italic text-base text-ink leading-relaxed border-l-2 border-gold/40 pl-5 mb-8">
              "I didn't need more motivation. I needed someone to tell me what to do."
            </blockquote>

            <div className="flex items-baseline gap-3 mb-2">
              {!hasAccess && <span className="font-serif text-3xl font-light text-gold">$47</span>}
            </div>
            <p className="font-sans text-xs text-ink-dim mb-8">Instant access · Unlimited sessions · Works on mobile and desktop</p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/desk">
                <GoldButton size="lg">{hasAccess ? 'Open Desk →' : 'Open the Desk — $47 →'}</GoldButton>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Four Engines */}
      <section className="py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <GoldDivider className="mb-14" />
          <FadeUp>
            <p className="font-mono text-[10px] tracking-widest text-gold uppercase text-center mb-2">Four engines. One tool.</p>
            <h2 className="font-serif text-2xl font-light text-ink text-center mb-3">Choose your engine and go</h2>
            <p className="font-sans text-sm text-ink-soft text-center mb-10 max-w-lg mx-auto">Strategy. Language. Next Steps.</p>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {ENGINES.map((engine, i) => (
              <FadeUp key={engine.label} delay={i * 0.08}>
                <div className="bg-plum-800/30 border border-white/[0.07] rounded-2xl p-6 h-full hover:border-gold/20 transition-colors">
                  <span className="text-3xl mb-4 block">{engine.emoji}</span>
                  <h3 className="font-serif text-base font-semibold text-gold mb-2">{engine.label}</h3>
                  <p className="font-sans text-sm text-ink-soft leading-relaxed">{engine.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Soft Start GPT bonus */}
          <FadeUp delay={0.35}>
            <div className="mt-5 bg-lavender/5 border border-lavender/20 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">✨</span>
                <div>
                  <p className="font-sans text-xs font-semibold text-lavender uppercase tracking-wide mb-1">Bonus Included</p>
                  <h3 className="font-serif text-base font-semibold text-ink mb-2">Soft Start GPT</h3>
                  <p className="font-sans text-sm text-ink-soft leading-relaxed">A calm thinking partner for when you don't know which engine to use or where to even begin.</p>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Use it for + This is for you */}
      <section className="py-12 px-5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <FadeUp>
            <Card className="p-8 h-full">
              <h2 className="font-serif text-xl font-semibold text-gold mb-6">Use it for</h2>
              <ul className="space-y-3">
                {USE_CASES.map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <Check size={14} className="text-gold mt-0.5 flex-shrink-0" />
                    <span className="font-sans text-sm text-ink-soft leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </FadeUp>

          <FadeUp delay={0.1}>
            <Card className="p-8 h-full">
              <h2 className="font-serif text-xl font-semibold text-ink mb-2">This is for you when</h2>
              <p className="font-sans text-xs text-ink-dim mb-6">Real situations. Exact language. Clear next move.</p>
              <ul className="space-y-3 mb-8">
                {FOR_YOU_IF.map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <Check size={14} className="text-lavender mt-0.5 flex-shrink-0" />
                    <span className="font-sans text-sm text-ink-soft leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-plum-700/30 border border-white/[0.06] rounded-xl px-4 py-3">
                <p className="font-mono text-[10px] tracking-widest text-gold uppercase mb-1">Access</p>
                <p className="font-sans text-sm text-ink">Instant access · Unlimited sessions</p>
                <p className="font-sans text-xs text-ink-dim mt-0.5">Works on mobile and desktop</p>
              </div>
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <GoldDivider className="mb-14" />
          <FadeUp>
            <p className="font-mono text-[10px] tracking-widest text-gold uppercase text-center mb-3">What people say after ONE session</p>
            <h2 className="font-serif text-2xl font-light text-ink text-center mb-10">Real results. Real people.</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {REVIEWS.map((r, i) => (
              <FadeUp key={r.name} delay={(i % 4) * 0.08}>
                <Card className="p-7 h-full">
                  <StarRow />
                  <p className="font-sans text-sm text-ink-soft leading-relaxed mb-5 italic">"{r.text}"</p>
                  <div>
                    <p className="font-sans text-xs font-semibold text-ink uppercase tracking-wide">— {r.name}</p>
                    {r.role && <p className="font-sans text-xs text-ink-dim mt-0.5">{r.role}</p>}
                  </div>
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
            {!hasAccess && <Tag>$47 · Unlimited Sessions</Tag>}
            <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-light mt-6 mb-5 text-ink leading-tight">
              Four engines.<br />
              <em className="text-gold">Exact language.</em>
            </h2>
            <p className="font-sans text-ink-soft text-sm mb-8 leading-relaxed">
              Instant access · Unlimited sessions · Works on mobile and desktop
            </p>
            <Link to="/desk">
              <GoldButton size="lg">{hasAccess ? 'Open Desk →' : 'Open the Desk — $47 →'}</GoldButton>
            </Link>
            <p className="font-sans text-xs text-ink-dim mt-4">Instant access · No pressure, all power.</p>
          </FadeUp>
        </div>
      </section>
    </main>
  )
}
