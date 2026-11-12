import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { GoldButton } from './ui'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Work', href: '/work' },
  { label: 'Offers', href: '/offers' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Glass header bar */}
      <motion.header
        animate={scrolled && !open ? 'scrolled' : 'top'}
        variants={{
          top: {
            backgroundColor: 'rgba(13,4,21,0)',
            backdropFilter: 'blur(0px)',
            WebkitBackdropFilter: 'blur(0px)',
            borderBottomColor: 'rgba(255,255,255,0)',
            boxShadow: '0 0 0 rgba(0,0,0,0)',
          },
          scrolled: {
            backgroundColor: 'rgba(13,4,21,0.72)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            borderBottomColor: 'rgba(255,255,255,0.06)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.32)',
          },
        }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="fixed top-0 left-0 right-0 z-40 h-[68px] border-b pointer-events-none"
        style={{ willChange: 'backdrop-filter, background-color' }}
      />

      {/* Logo — top left */}
      <Link
        to="/"
        aria-label="Tae Studio — Home"
        className="fixed top-3 left-5 z-50"
      >
        <img
          src="https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Logo%20Icon.png"
          alt="Tae Studio logo"
          className="h-12 w-auto"
        />
      </Link>

      {/* Menu toggle — top right */}
      <button
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen(o => !o)}
        className="fixed top-[15px] right-5 z-50 w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.11] border border-white/[0.10] hover:border-white/[0.22] backdrop-blur-sm transition-all duration-200"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="flex items-center"
            >
              <X size={15} className="text-ink" />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="flex items-center"
            >
              <Menu size={15} className="text-ink-soft" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Full-screen overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[45] bg-plum-950/97 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            {/* Ambient glow */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[320px] pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,169,74,0.22) 0%, transparent 70%)' }}
            />

            <nav className="flex flex-col items-center gap-6">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={link.href}
                    className={`font-serif text-[clamp(28px,5vw,44px)] font-light tracking-wide transition-colors duration-200 ${
                      location.pathname === link.href
                        ? 'text-gold'
                        : 'text-ink hover:text-gold'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.05 * NAV_LINKS.length + 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6"
              >
                <Link to="/soft-strategy-desk">
                  <GoldButton size="lg">Get the Desk — $47 →</GoldButton>
                </Link>
              </motion.div>
            </nav>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42, duration: 0.4 }}
              className="absolute bottom-7 font-mono text-[13px] tracking-[0.22em] text-ink-dim uppercase"
            >
              Tae Studio
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
