import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { FadeUp, GoldDivider, GlowOrb, SectionLabel, GoldButton, Card, Tag } from '../components/ui'
import { fetchServiceBySlug } from '../lib/services'

const AI_TWIN_INCLUDES = [
  'Custom AI persona configured around your voice, expertise, and communication style',
  'AI Twin setup designed for your website, content, emails, or client interactions',
  'Strategic AI framework to help you use your Twin effectively',
  'Ready-to-use prompts, guidelines, and usage instructions',
  'Lifetime access to your completed AI Twin framework',
]

const AI_TWIN_STAGES = [
  { 
    step: '01', 
    title: 'Share Your Voice', 
    desc: 'Provide your content, preferences, and expertise so your AI Twin can reflect your unique style.' 
  },
  { 
    step: '02', 
    title: 'AI Twin Creation', 
    desc: 'Your personalized AI Twin is built using your tone, knowledge, frameworks, and brand perspective.' 
  },
  { 
    step: '03', 
    title: 'Receive Your System', 
    desc: 'Get your completed AI Twin with the resources needed to start using it immediately.' 
  },
  { 
    step: '04', 
    title: 'Create With Alignment', 
    desc: 'Use your AI Twin to support content, ideas, strategy, and communication in your voice.' 
  },
]

const FAQS = [
  {
    q: 'Who is this for?',
    a: 'Entrepreneurs, coaches, consultants, creators, and service providers who want an AI-powered version of their expertise, voice, and strategy available whenever they need it.',
  },
  {
    q: 'What do I receive with my AI Twin?',
    a: 'You receive a customized AI Twin built around your voice, knowledge, frameworks, and communication style, along with the resources needed to start using it immediately.',
  },
  {
    q: 'What can my AI Twin help me with?',
    a: 'Your AI Twin can support content creation, brainstorming, client communication, strategy development, messaging, and other tasks based on your unique expertise and workflow.',
  },
  {
    q: 'Do I need technical skills to use it?',
    a: 'No. Your AI Twin is designed to be simple to use. You’ll receive guidance on how to interact with it and get the most value from your customized system.',
  },
  {
    q: 'How is my AI Twin created?',
    a: 'After purchase, you provide information about your voice, expertise, content, and preferences. Your AI Twin is then configured to reflect your unique perspective and approach.',
  },
  {
    q: 'Is this a subscription?',
    a: 'No. The AI Twin is a one-time purchase. You receive your customized AI system without a recurring monthly fee.',
  },
]

export default function AiTwin() {
  const [ctaHref, setCtaHref] = useState('/contact')
  const [priceDisplay, setPriceDisplay] = useState('$888')

  useEffect(() => {
    fetchServiceBySlug('ai-twin').then(s => {
      if (s?.cta_href) setCtaHref(s.cta_href)
      if (s?.price_display) setPriceDisplay(s.price_display)
    })
  }, [])

  const isExternal = ctaHref.startsWith('http')
  const CtaLink = ({ children }: { children: React.ReactNode }) =>
    isExternal ? (
      <a href={ctaHref} target="_blank" rel="noopener noreferrer">{children}</a>
    ) : (
      <Link to={ctaHref}>{children}</Link>
    )
  return (
    <main className="min-h-screen bg-plum-900 pt-24">
      {/* Hero */}
      <section className="relative py-16 md:py-24 px-5 overflow-hidden">
        <GlowOrb color="lavender" size={600} opacity={0.1} className="-top-10 left-0 -translate-x-1/4" />
        <GlowOrb color="gold" size={400} opacity={0.06} className="top-1/2 right-0 translate-x-1/3 -translate-y-1/2" />

        <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Image */}
          <FadeUp>
            <div className="relative rounded-3xl overflow-hidden border border-lavender/20 shadow-[0_8px_48px_rgba(167,123,255,0.15)]">
              <div className="h-72 md:h-[520px] w-full relative">
                <img
                  src="https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/AI%20Twin.jpg"
                  alt="Start Your AI Twin — Tae Studio"
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
            <SectionLabel>Core Service</SectionLabel>
            <h1 className="font-serif text-[clamp(38px,6vw,62px)] font-light leading-[0.95] mt-6 mb-5 tracking-[-0.02em]">
              Start Your
              <br />
              <em className="text-lavender-light">AI Twin™</em>
            </h1>
            <p className="font-sans text-ink-soft text-sm md:text-base leading-relaxed mb-6">
              Your voice, your expertise, your presence — distilled into an AI that represents you accurately, consistently, and on-brand.
            </p>
            <p className="font-serif text-2xl font-light text-ink mb-1">
              <span className="text-gold">{priceDisplay}</span>
            </p>
            <p className="font-sans text-xs text-ink-dim mb-8">Payment plans available · Scope-dependent pricing</p>
            <CtaLink>
              <GoldButton size="lg">Build your AI Twin →</GoldButton>
            </CtaLink>
            
          </FadeUp>
        </div>
      </section>

      {/* What's included + How it works */}
      <section className="py-12 px-5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <FadeUp>
            <Card className="p-8 h-full">
              <h2 className="font-serif text-xl font-semibold text-gold mb-5">What's included</h2>
              <ul className="space-y-4">
                {AI_TWIN_INCLUDES.map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <Check size={15} className="text-gold mt-0.5 flex-shrink-0" />
                    <span className="font-sans text-lg text-ink-soft">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="space-y-5">
              <h2 className="font-serif text-xl font-semibold text-ink mb-2">How it works</h2>
              {AI_TWIN_STAGES.map(stage => (
                <div key={stage.step} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-lavender/10 border border-lavender/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-[16px] text-lavender tracking-wide">{stage.step}</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-ink mb-1">{stage.title}</h3>
                    <p className="font-sans text-md text-ink-soft leading-relaxed">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <GoldDivider className="mb-14" />
          <FadeUp>
            <h2 className="font-serif text-2xl font-light text-ink mb-10 text-center">Common questions</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FAQS.map(faq => (
              <FadeUp key={faq.q}>
                <div className="bg-plum-800/30 border border-white/[0.07] rounded-2xl p-6">
                  <h3 className="font-serif text-sm font-semibold text-ink mb-2">{faq.q}</h3>
                  <p className="font-sans text-sm text-ink-soft leading-relaxed">{faq.a}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-5">
        <GlowOrb color="lavender" size={600} opacity={0.1} className="top-0 left-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <FadeUp>
            <Tag>Ready to build yours?</Tag>
            <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-light mt-6 mb-5 text-ink leading-tight">
              Your brand doesn't rest.<br />
              <em className="text-lavender-light">Neither should your AI.</em>
            </h2>
            <p className="font-sans text-ink-soft text-sm mb-8 leading-relaxed">
              Order today and we'll scope your AI Twin together — built entirely around your voice, your systems, and your goals.
            </p>
            <CtaLink>
              <GoldButton size="lg">Build your AI Twin →</GoldButton>
            </CtaLink>
            
          </FadeUp>
        </div>
      </section>
    </main>
  )
}
