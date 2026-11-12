import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getConsent, setConsent } from '../lib/recaptcha'

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!getConsent()) {
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
    const onChange = () => setVisible(false)
    window.addEventListener('consent-changed', onChange)
    return () => window.removeEventListener('consent-changed', onChange)
  }, [])

  const choose = (choice: 'accepted' | 'declined') => {
    setConsent(choice)
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          className="fixed bottom-0 left-0 right-0 z-[300] px-4 pb-4"
          role="dialog"
          aria-label="Cookie and privacy settings"
        >
          <div className="max-w-3xl mx-auto bg-plum-800 border border-gold/25 rounded-3xl shadow-[0_12px_48px_rgba(0,0,0,0.45)] p-5 md:p-6">
            <p className="font-serif text-sm font-semibold text-gold mb-2">Cookies &amp; privacy</p>
            <p className="font-sans text-[13px] text-ink-soft leading-relaxed mb-4">
              We use cookies for analytics and Google reCAPTCHA to verify you're human and protect
              this site from spam. reCAPTCHA collects device and interaction data from Google. Choose
              "Accept" to allow these, or "Decline" to continue with essential functionality only. See
              our{' '}
              <Link to="/privacy-policy" className="text-gold hover:text-gold-light underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => choose('accepted')}
                className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl font-sans text-sm font-semibold bg-gradient-to-br from-gold-light via-gold to-gold-dark text-plum-900 hover:shadow-[0_4px_20px_rgba(212,169,74,0.3)] transition-all"
              >
                Accept
              </button>
              <button
                onClick={() => choose('declined')}
                className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl font-sans text-sm text-ink-soft border border-white/[0.12] hover:border-white/[0.25] hover:text-ink transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
