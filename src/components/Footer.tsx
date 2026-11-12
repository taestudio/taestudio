import { Link } from 'react-router-dom'
import { GoldDivider } from './ui'

export default function Footer() {
  return (
    <footer className="bg-plum-950 border-t border-white/[0.05] py-14 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div >
                <img 
                  src="https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Tae%20Studio%20Logo.png"
                  alt="Tae Studio"
                  className="h-24 w-auto"
                  />
              </div>
              
            </div>
            <p className="font-serif italic text-gold text-sm leading-relaxed mb-2">
              "Healing is the strategy. Alignment is the ROI."
            </p>
            <p className="font-sans text-xs text-ink-dim leading-relaxed max-w-xs">
              AI-powered strategy tools and services for ambitious women building businesses on their own terms.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[13px] tracking-widest text-ink-dim uppercase mb-4">Navigate</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', href: '/' },
                { label: 'About', href: '/about' },
                { label: 'Work', href: '/work' },
                { label: 'Offers', href: '/offers' },
                { label: 'Contact', href: '/contact' },
              ].map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="font-sans text-sm text-ink-soft hover:text-ink transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[13px] tracking-widest text-ink-dim uppercase mb-4">Products</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Alignment Guide — Free', href: '/alignment-guide' },
                { label: 'Soft Boundaries Pack', href: '/soft-boundaries' },
                { label: 'Soft Power Reset eBook', href: '/soft-power-reset' },
                { label: 'Start Your AI Twin', href: '/ai-twin' },
                { label: 'Soft Strategy Desk™', href: '/soft-strategy-desk' },
              ].map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="font-sans text-sm text-ink-soft hover:text-ink transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <GoldDivider className="mb-8" />

     <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
  <p className="font-sans text-xs text-ink-dim">
    © {new Date().getFullYear()} Tae Studio. AI-assisted guidance for informational purposes only. Not professional advice.
  </p>

  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
    <div className="flex items-center justify-center gap-5">
      <Link
        to="/privacy-policy"
        className="font-sans text-xs text-ink-dim hover:text-ink-soft transition-colors"
      >
        Privacy Policy
      </Link>

      <Link
        to="/terms-of-use"
        className="font-sans text-xs text-ink-dim hover:text-ink-soft transition-colors"
      >
        Terms of Use
      </Link>
    </div>

    <span className="hidden sm:block text-white/10">|</span>

    <a
      href="https://www.sitesonpolaris.com"
      target="_blank"
      rel="noopener noreferrer"
      className="font-sans text-xs text-ink-dim hover:text-ink-soft transition-colors"
    >
      Designed by Sites on Polaris
    </a>
  </div>
</div>
      </div>
    </footer>
  )
}
