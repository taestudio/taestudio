import { FadeUp, GlowOrb, GoldDivider } from '../components/ui'

const SECTIONS = [
  {
    num: '1',
    title: 'Overview',
    content: `This Privacy Policy explains how Tae Studio ("we," "us," or "our") collects, uses, and protects your personal information when you use the Soft Strategy Desk™, visit our website, or receive communications from us. By using the Tool or submitting your email address, you agree to the practices described in this policy.`,
  },
  {
    num: '2',
    title: 'Information We Collect',
    content: null,
    blocks: [
      {
        label: 'Information You Provide',
        items: [
          'Email address — collected when you unlock full access to the Soft Strategy Desk™',
          'Input content — the text you enter into the Tool\'s fields',
        ],
      },
      {
        label: 'Information Collected Automatically',
        items: [
          'Usage data — general interaction data collected through cookies and, where enabled, analytics tools',
          'Anti-spam data — when Google reCAPTCHA runs, Google collects device and interaction data to verify you are human',
        ],
      },
      {
        label: 'Information We Do Not Collect',
        items: ['We do not collect payment information, government IDs, or sensitive personal data.'],
      },
    ],
  },
  {
    num: '3',
    title: 'Cookies, Analytics & reCAPTCHA',
    content: `On your first visit we ask for your consent before loading cookies for analytics and Google reCAPTCHA. If you decline, forms on this site still work — they are protected by rate limiting alone. If you accept, reCAPTCHA v3 runs invisibly in the background to protect our forms from spam and abuse, and Google collects information such as device data and interactions with the site. You can change your choice at any time via the "Cookie Settings" link in the footer.`,
  },
  {
    num: '4',
    title: 'How We Use Your Information',
    items: [
      'Provide access to the Soft Strategy Desk™ and its four engines',
      'Send emails about content, offers, and updates from Tae Studio',
      'Improve the Tool based on general usage patterns',
      'Protect the site from spam and abuse',
      'Comply with applicable laws',
    ],
    note: 'We do not sell your data, build advertising profiles, or train AI models on your inputs.',
  },
  {
    num: '5',
    title: 'AI-Generated Content Disclosure',
    content: `The Soft Strategy Desk™ uses Claude (Anthropic) to generate responses. Your inputs are processed by Anthropic's API per their Privacy Policy at anthropic.com/privacy. Outputs are for informational purposes only — not legal, financial, or mental health advice.`,
  },
  {
    num: '6',
    title: 'Email Communications',
    content: `By submitting your email you opt in to receive communications from Tae Studio. Unsubscribe anytime via the link in any email. We use Stan Store to manage communications.`,
  },
  {
    num: '7',
    title: 'Data Sharing',
    content: `We do not sell your data. We may share with: Anthropic (API processing), Stan Store (email and sales), Google (reCAPTCHA spam protection), and legal authorities if required by law.`,
  },
  {
    num: '8',
    title: 'Data Retention',
    items: [
      'Email addresses: retained until you unsubscribe or request deletion',
      'Tool inputs: processed in real-time, not stored beyond the active session',
      'Saved outputs: browser session only, clear when tab closes',
      'Your cookie consent choice: stored on your device until you clear it',
    ],
  },
  {
    num: '9',
    title: 'Your Rights',
    content: `You may access, correct, delete, or port your data, and opt out of marketing at any time. Contact tadams0622@icloud.com. We respond within 30 days.`,
  },
  {
    num: '10',
    title: "Children's Privacy",
    content: `This Tool is for users 18 and older. We do not knowingly collect data from children under 13.`,
  },
  {
    num: '11',
    title: 'Security',
    content: `We take reasonable measures to protect your information. No internet transmission is 100% secure.`,
  },
  {
    num: '12',
    title: 'Changes',
    content: `We may update this policy from time to time. Continued use after changes constitutes acceptance.`,
  },
  {
    num: '13',
    title: 'Contact',
    content: `Tae Studio · tadams0622@icloud.com · Delaware`,
  },
]

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-plum-900 pt-24">
      {/* Hero */}
      <section className="relative py-20 px-5 overflow-hidden">
        <GlowOrb color="lavender" size={500} opacity={0.09} className="-top-10 left-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <FadeUp>
            <p className="font-mono text-[13px] tracking-widest text-gold uppercase mb-5">Legal</p>
            <h1 className="font-serif text-[clamp(36px,7vw,60px)] font-light leading-[1] tracking-[-0.02em] mb-6 text-ink">
              Privacy Policy
            </h1>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
              {[
                'Effective: May 1, 2026',
                'Updated: November 12, 2026',
                'Tae Studio · Delaware',
              ].map(m => (
                <span key={m} className="font-sans text-xs text-ink-dim">{m}</span>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Content */}
      <section className="pb-28 px-5">
        <div className="max-w-2xl mx-auto">
          <GoldDivider className="m-14" />

          <div className="space-y-12">
            {SECTIONS.map(s => (
              <FadeUp key={s.num}>
                <div className="flex gap-5 items-start">
                  <span className="font-mono text-[13px] text-gold tracking-widest pt-1 w-6 flex-shrink-0">{s.num.padStart(2, '0')}</span>
                  <div className="flex-1">
                    <h2 className="font-serif text-xl font-semibold text-ink mb-4">{s.title}</h2>

                    {'content' in s && s.content && (
                      <p className="font-sans text-sm text-ink-soft leading-relaxed">{s.content}</p>
                    )}

                    {'blocks' in s && s.blocks && (
                      <div className="space-y-5">
                        {s.blocks.map(b => (
                          <div key={b.label}>
                            <p className="font-sans text-xs font-semibold text-ink uppercase tracking-wide mb-2">{b.label}</p>
                            <ul className="space-y-1.5">
                              {b.items.map(item => (
                                <li key={item} className="font-sans text-sm text-ink-soft leading-relaxed flex gap-2">
                                  <span className="text-gold/50 mt-1.5 flex-shrink-0">—</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {'items' in s && s.items && (
                      <ul className="space-y-1.5">
                        {s.items.map(item => (
                          <li key={item} className="font-sans text-sm text-ink-soft leading-relaxed flex gap-2">
                            <span className="text-gold/50 mt-1.5 flex-shrink-0">—</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}

                    {'note' in s && s.note && (
                      <p className="font-sans text-sm text-ink-soft leading-relaxed mt-4 italic border-l-2 border-gold/30 pl-4">
                        {s.note}
                      </p>
                    )}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          <GoldDivider className="mt-14 mb-8" />
          <p className="font-sans text-xs text-ink-dim text-center">Last updated: November 12, 2026</p>
        </div>
      </section>
    </main>
  )
}
