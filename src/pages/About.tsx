import { Link } from 'react-router-dom'
import { FadeUp, GoldDivider, GlowOrb, SectionLabel, GoldButton, Card } from '../components/ui'
import { Cog, Zap, Bot } from 'lucide-react';


const VALUES = [
  { label: 'Energy-First', desc: 'Strategy that starts with your capacity, not a formula designed for someone else\'s life.' },
  { label: 'Aligned Execution', desc: 'Clarity that leads to confident action — not more planning, more spiraling, or more waiting.' },
  { label: 'Soft but Sharp', desc: 'Gentle enough to hold space for your whole self. Sharp enough to give you the real answer.' },
  { label: 'Anti-Hustle', desc: 'Built for women who are done proving themselves. Rest is not resistance — it is resource.' },
]

const FRAMEWORKS = [
  { name: 'Energy-First Branding™', desc: 'Build your brand around your capacity, values, and rhythm — not someone else\'s blueprint.', icon: <Zap /> },
  { name: 'Soft System™', desc: 'A strategic operating system for your business that flows with your life rather than against it.', icon: <Cog /> },
  { name: 'AI Energy Twin™', desc: 'Your voice, strategy, and presence — embedded in an AI that works while you rest.', icon: <Bot /> },
] 
 
export default function About() {
  return (
    <main className="min-h-screen bg-plum-900 pt-24">
      {/* Hero */}
      <section className="relative py-20 px-5 overflow-hidden">
        <GlowOrb color="lavender" size={600} opacity={0.11} className="-top-10 left-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeUp>
            <SectionLabel>About Tae Studio</SectionLabel>
            <h1 className="font-serif text-[clamp(40px,8vw,68px)] font-light leading-[0.95] tracking-[-0.02em] mt-6 mb-6">
              <span className="text-ink">Strategy built</span>
              <br />
              <em className="text-lavender-light">from the inside out.</em>
            </h1>
            <p className="font-sans text-ink-soft text-base md:text-lg leading-relaxed max-w-xl mx-auto">
              Tae is a strategic advisor, brand architect, and AI implementation specialist helping ambitious women build aligned, sustainable businesses — without the burnout.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <FadeUp>
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-plum-800/60 border border-white/[0.07] relative">
              <img
                src="https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Tasia.jpg"
                alt="Tae Studio"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum-950/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-serif italic text-gold text-sm">"Healing is the strategy. Alignment is the ROI."</p>
                <p className="font-mono text-[13px] tracking-widest text-ink-dim uppercase mt-1">— Tae Studio</p>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div>
              <GoldDivider className="mb-8 justify-start" />
              <h2 className="font-serif text-3xl font-light text-ink mb-6 leading-tight">
                The story behind the studio.
              </h2>
              <div className="space-y-4 font-sans text-sm text-ink-soft leading-relaxed">
                <p>
                  After years in corporate environments watching brilliant women — especially women of color — get systematically overlooked, underpaid, and burned out building other people's visions, Tae built something different.
                </p>
                <p>
                  Tae Studio is the intersection of strategic intelligence and emotional truth. A place where the advice isn't watered down, the frameworks are built for real lives, and the tools are designed to work with your energy — not against it.
                </p>
                <p>
                  The Soft Strategy Desk™ is the flagship expression of that vision: AI-powered, deeply human, and built for women who are done spiraling and ready to move.
                </p>
              </div>
              <div className="mt-8">
                <Link to="/desk">
                  <GoldButton size="md">Experience the Desk →</GoldButton>
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-5 bg-gradient-to-b from-transparent to-plum-950/40">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-14">
            <SectionLabel>The Philosophy</SectionLabel>
            <h2 className="font-serif text-[clamp(28px,5vw,44px)] font-light mt-5 text-ink">
              What we believe.
            </h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((v, i) => (
              <FadeUp key={v.label} delay={i * 0.08}>
                <Card className="p-7">
                  <h3 className="font-serif text-lg font-semibold text-gold mb-3">{v.label}</h3>
                  <p className="font-sans text-sm text-ink-soft leading-relaxed">{v.desc}</p>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Frameworks */}
      <section className="relative py-20 px-5">
        <GlowOrb color="gold" size={500} opacity={0.09} className="top-0 right-0" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <FadeUp className="text-center mb-14">
            <SectionLabel>Proprietary Frameworks</SectionLabel>
            <h2 className="font-serif text-[clamp(28px,5vw,44px)] font-light mt-5 text-ink">
              The tools behind the work.
            </h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FRAMEWORKS.map((f, i) => (
              <FadeUp key={f.name} delay={i * 0.1}>
                <Card className="p-7 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lavender/20 to-gold/10 mx-auto mb-5 flex items-center justify-center">
                    <span className="font-serif font-bold text-lavender text-xl">{f.icon}</span>
                  </div>
                  <h3 className="font-serif text-base font-semibold text-ink mb-3">{f.name}</h3>
                  <p className="font-sans text-sm text-ink-soft leading-relaxed">{f.desc}</p>
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
              Ready to build something<br />
              <em className="text-lavender-light">that actually holds?</em>
            </h2>
            <p className="font-sans text-ink-soft text-sm mb-10 leading-relaxed">
              Start with the free Alignment Guide, or jump straight into the Desk.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/desk"><GoldButton>Open the Desk →</GoldButton></Link>
              <Link to="/alignment-guide">
                <button className="font-sans text-sm text-ink-soft hover:text-gold transition-colors underline underline-offset-4">
                  Get the free guide
                </button>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </main>
  )
}
 