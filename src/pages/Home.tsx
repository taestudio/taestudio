import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ChevronDown, Zap, Gem, Target, Heart } from 'lucide-react'
import { GoldDivider, GoldButton, FadeUp, GlowOrb } from '../components/ui'
import { useServices, type Service } from '../lib/services'

// ─── Layout constants ─────────────────────────────────────────────────────────

const CARD_W = 220
const CARD_H = 300
const CR = 110   // circle edge radius (where lines attach)
const R  = 320   // pentagon arm radius: center → card center

// Mobile card dimensions — wide single-row cards
const MOBILE_CARD_W = 320
const MOBILE_CARD_H = 200

// Pentagon: 5 arms at 72° intervals starting from top (north = 0°)
// All arms identical in length (R - CR = 185px), equally spaced.
const PENT_ANGLES = [0, 72, 144, 216, 288].map(d => d * Math.PI / 180) 

// Hub container bounds — derived so bounding box is exact
const CX = Math.ceil(R * Math.sin(72 * Math.PI / 180) + CARD_W / 2)   // ≈ 362
const CY = R + CARD_H / 2                                               // 405
const HUB_W = CX * 2                                                    // ≈ 724
const HUB_H = Math.ceil(CY + R * Math.cos(144 * Math.PI / 180) + CARD_H / 2)  // ≈ 756

// Per-arm geometry: card center, card top-left, circle edge, SVG line path
const PENTAGON = PENT_ANGLES.map(a => {
  const ccx = CX + R  * Math.sin(a)
  const ccy = CY - R  * Math.cos(a)
  const cex = CX + CR * Math.sin(a)
  const cey = CY - CR * Math.cos(a)
  return {
    cardCenter:  [ccx, ccy] as [number, number],
    cardTopLeft: [ccx - CARD_W / 2, ccy - CARD_H / 2] as [number, number],
    circleEdge:  [cex, cey] as [number, number],
    linePath:    `M ${cex.toFixed(1)} ${cey.toFixed(1)} L ${ccx.toFixed(1)} ${ccy.toFixed(1)}`,
  }
})

// ─── Data ─────────────────────────────────────────────────────────────────────

type AccentColor = 'gold' | 'lavender'

interface BranchData {
  id: string
  emoji: string
  label: string
  sub: string
  desc: string
  badge: string
  accent: AccentColor
  href: string
  image: string
}

function serviceToBranch(s: Service): BranchData {
  return {
    id: s.slug,
    emoji: s.icon,
    label: s.name,
    sub: s.tagline,
    desc: s.description,
    badge: s.badge_text,
    accent: s.accent_color,
    href: s.page_href,
    image: s.image_url,
  }
}

// Fallback used while loading or if fetch fails (pentagon requires exactly 5 items)
const FALLBACK_BRANCHES: BranchData[] = [
  { id: 'desk',      emoji: '🧭', label: 'Soft Strategy Desk™',  sub: 'AI Clarity Tool',          desc: 'Four engines. Exact language. Clarity, strategy, and next steps — in minutes.', badge: '$47',     accent: 'gold',     href: '/soft-strategy-desk', image: 'https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/AI%20Twin.jpg' },
  { id: 'alignment', emoji: '✦',  label: 'FREE Alignment Guide',  sub: 'Stop creating from chaos', desc: 'Realign your brand, energy, and strategy before posting from the wrong foundation.', badge: 'Free',    accent: 'lavender', href: '/alignment-guide',    image: 'https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Free%20Alignment.jpg' },
  { id: 'twin',      emoji: '🤖', label: 'Start Your AI Twin',    sub: 'Your voice. Always on.',   desc: 'A custom AI built around your tone, offers, and business systems — working while you rest.', badge: 'Service', accent: 'lavender', href: '/ai-twin',            image: 'https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/AI%20Twin.jpg' },
  { id: 'scripts',   emoji: '📋', label: 'Soft Boundaries',       sub: 'Script Pack — $9',         desc: 'Ready-to-use scripts for workplace, client, and personal boundary moments.', badge: '$9',      accent: 'lavender', href: '/soft-boundaries',    image: 'https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Soft%20boundaries.jpg' },
  { id: 'ebook',     emoji: '📖', label: 'Soft Power Reset',      sub: 'The eBook',                desc: 'Reclaim your energy, authority, and clarity — a guided reset for ambitious women.', badge: 'eBook',   accent: 'lavender', href: '/soft-power-reset',   image: 'https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Soft%20power%20reset.jpg' },
]

// ─── SVG Connector Lines ──────────────────────────────────────────────────────

function ConnectorLines() {
  return (
    <svg
      viewBox={`0 0 ${HUB_W} ${HUB_H}`}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
      preserveAspectRatio="none"
      style={{ zIndex: 0 }}
    >
      <defs>
        <linearGradient id="lineGradGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4A94A" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#D4A94A" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {PENTAGON.map(({ linePath }, i) => (
        <motion.path
          key={i}
          d={linePath}
          fill="none"
          stroke="url(#lineGradGold)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 + i * 0.11 }}
        />
      ))}
      {PENTAGON.map(({ cardCenter: [cx, cy] }, i) => (
        <motion.circle
          key={`dot-${i}`}
          cx={cx}
          cy={cy}
          r="3"
          fill="#D4A94A"
          fillOpacity="0.6"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.7 + i * 0.08, duration: 0.3 }}
        />
      ))}
    </svg>
  )
}

// ─── Grid Background ──────────────────────────────────────────────────────────

function GridBg() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{
        backgroundImage: `
          linear-gradient(rgba(167,123,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(167,123,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '52px 52px',
      }}
    />
  )
}

// ─── Center Circle ────────────────────────────────────────────────────────────

function CenterCircle() {
  return (

<div className="relative flex items-center justify-center flex-shrink-0"> 
  {/* Glow */}
  <motion.div
    className="absolute rounded-full w-[180px] h-[180px] md:w-[260px] md:h-[260px]"
    style={{
      background:
        'radial-gradient(ellipse, rgba(212,169,74,0.18) 0%, transparent 70%)',
    }}
    animate={{ scale: [1, 1.14, 1], opacity: [0.5, 0.85, 0.5] }}
    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
  />
  
  {/* Outer Ring */}
  <div className="absolute rounded-full border border-gold/20 w-[165px] h-[165px] md:w-[240px] md:h-[240px]" />

  {/* Dashed Ring */} 
  <motion.div
    className="absolute rounded-full w-[150px] h-[150px] md:w-[218px] md:h-[218px]"
    style={{
      border: '1px dashed rgba(167,123,255,0.45)',
    }}
    animate={{ rotate: 360 }}
    transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
  />

  {/* Gold Ring */}
  <div
    className="absolute rounded-full w-[135px] h-[135px] md:w-[196px] md:h-[196px]"
    style={{ 
      boxShadow:
        '0 0 0 1.5px rgba(212,169,74,0.65), 0 0 28px rgba(212,169,74,0.22)',
    }}
  /> 

  {/* Profile Image */}
  <div className="relative overflow-hidden rounded-full z-10 w-[130px] h-[130px] md:w-[188px] md:h-[188px]">
    <img
      src="https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Tasia.jpg"
      alt="Tae Studio"
      className="w-full h-full object-cover object-top"
    />
    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
  </div>
 
  {/* Name */}
  <div className="absolute -bottom-8 md:-bottom-11 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
    <p className="font-mono text-[11px] md:text-[13px] tracking-[0.22em] text-ink-dim uppercase mt-0.5">
      Tae Studio
    </p>
  </div>
</div> 
     
  )
}

// ─── Flip Card ────────────────────────────────────────────────────────────────

function FlipCard({ branch, delay = 0, touchMode = false, w = CARD_W, h = CARD_H }: { branch: BranchData; delay?: number; touchMode?: boolean; w?: number; h?: number }) {
  const [flipped, setFlipped] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [hinted, setHinted] = useState(false)
  const [btnHovered, setBtnHovered] = useState(false)
  const isGold = branch.accent === 'gold'

  const borderColor   = isGold ? 'rgba(212,169,74,0.28)' : 'rgba(167,123,255,0.28)'
  const borderFlipped = isGold ? 'rgba(212,169,74,0.65)' : 'rgba(167,123,255,0.65)'
  const accentBar     = isGold ? 'rgba(212,169,74,0.7)'  : 'rgba(167,123,255,0.7)'
  const labelColor    = isGold ? '#e8c97a'               : '#c4a3ff'

  const badgeStyle: React.CSSProperties = isGold
    ? { color: '#D4A94A', border: '1px solid rgba(212,169,74,0.4)', background: 'rgba(212,169,74,0.2)' }
    : { color: '#A77BFF', border: '1px solid rgba(167,123,255,0.4)', background: 'rgba(167,123,255,0.2)' }

  // ── Touch mode: tap-to-reveal overlay ────────────────────────────────────────
  if (touchMode) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: w, height: h, flexShrink: 0, position: 'relative', borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }}
        onClick={() => { setRevealed(r => !r); setHinted(true) }}
      >
        {/* Front image layer */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <img
            src={branch.image}
            alt={branch.label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
          />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '62%', background: 'linear-gradient(to top, rgba(14,8,22,0.96) 0%, rgba(14,8,22,0.65) 55%, transparent 100%)' }} />
          <div style={{ position: 'absolute', top: 9, right: 9, ...badgeStyle, borderRadius: 9999, padding: '2px 7px', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {branch.badge}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 12px 12px' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: labelColor, marginBottom: 2, lineHeight: 1.3 }}>
              {branch.label}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em' }}>
              {branch.sub}
            </p>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: accentBar, opacity: 0.55 }} />
        </div>

        {/* Tap hint indicator */}
        <AnimatePresence>
          {!hinted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0, 0.9, 0.6], scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.5, delay: delay + 0.6 }}
              style={{
                position: 'absolute', bottom: 28, right: 9,
                width: 18, height: 18, borderRadius: '50%',
                border: `1px solid ${isGold ? 'rgba(212,169,74,0.7)' : 'rgba(167,123,255,0.7)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontSize: 11, color: isGold ? '#e8c97a' : '#c4a3ff', lineHeight: 1 }}>↑</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slide-up reveal panel */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ y: h }}
              animate={{ y: 0 }}
              exit={{ y: h }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(10,6,18,0.92)',
                backdropFilter: 'blur(22px)',
                WebkitBackdropFilter: 'blur(22px)',
                border: `1px solid ${borderFlipped}`,
                borderRadius: 14,
                boxShadow: `0 0 36px ${isGold ? 'rgba(212,169,74,0.12)' : 'rgba(167,123,255,0.12)'}`,
                display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accentBar }} />
              <div style={{ padding: '16px 14px 12px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ ...badgeStyle, borderRadius: 9999, padding: '2px 7px', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    {branch.badge}
                  </span>
                </div>
                <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: labelColor, marginBottom: 3, lineHeight: 1.3, fontWeight: 500 }}>
                  {branch.label}
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 10, letterSpacing: '0.04em' }}>
                  {branch.sub}
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {branch.desc}
                </p>
                <Link
                  to={branch.href}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    marginTop: 12, fontSize: 13, fontWeight: 600, color: labelColor,
                    textDecoration: 'none',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1px solid ${isGold ? 'rgba(212,169,74,0.35)' : 'rgba(167,123,255,0.35)'}`,
                    background: btnHovered
                      ? (isGold ? 'rgba(212,169,74,0.18)' : 'rgba(167,123,255,0.18)')
                      : (isGold ? 'rgba(212,169,74,0.09)' : 'rgba(167,123,255,0.09)'),
                    transform: btnHovered ? 'scale(1.02)' : 'scale(1)',
                    transition: 'background 0.18s ease, transform 0.18s ease, border-color 0.18s ease',
                  }}
                  onMouseEnter={() => setBtnHovered(true)}
                  onMouseLeave={() => setBtnHovered(false)}
                  onClick={e => { e.stopPropagation(); setRevealed(false) }}
                >
                  Learn more <ArrowUpRight size={14} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card border */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 14, border: `1px solid ${revealed ? borderFlipped : borderColor}`, pointerEvents: 'none', transition: 'border-color 0.3s' }} />
      </motion.div>
    )
  }

  // ── Desktop mode: 3D hover flip ───────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: w, height: h, perspective: 1100, flexShrink: 0 }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped(f => !f)}
      className="cursor-pointer"
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* FRONT */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: 14,
            overflow: 'hidden',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 6px 28px rgba(0,0,0,0.45)',
          }}
        >
          <img
            src={branch.image}
            alt={branch.label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
          />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '62%', background: 'linear-gradient(to top, rgba(14,8,22,0.96) 0%, rgba(14,8,22,0.65) 55%, transparent 100%)' }} />
          <div style={{ position: 'absolute', top: 9, right: 9, ...badgeStyle, borderRadius: 9999, padding: '2px 7px', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {branch.badge}
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 12px 12px' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: labelColor, marginBottom: 2, lineHeight: 1.3 }}>
              {branch.label}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em' }}>
              {branch.sub}
            </p>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: accentBar, opacity: 0.55 }} />
        </div>

        {/* BACK */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: 14,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            border: `1px solid ${borderFlipped}`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.5), 0 0 36px ${isGold ? 'rgba(212,169,74,0.1)' : 'rgba(167,123,255,0.1)'}`,
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: 70, height: 70, background: isGold ? 'radial-gradient(circle at 0% 0%, rgba(212,169,74,0.16) 0%, transparent 70%)' : 'radial-gradient(circle at 0% 0%, rgba(167,123,255,0.16) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accentBar }} />
          <div style={{ padding: '18px 14px 14px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 9 }}>
              <span style={{ ...badgeStyle, borderRadius: 9999, padding: '2px 7px', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                {branch.badge}
              </span>
            </div>
            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: labelColor, marginBottom: 2, lineHeight: 1.3, fontWeight: 500 }}>
              {branch.label}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 11, letterSpacing: '0.04em' }}>
              {branch.sub}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.68, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical' }}>
              {branch.desc}
            </p>
            <Link
              to={branch.href}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                marginTop: 12, fontSize: 13, fontWeight: 600, color: labelColor,
                textDecoration: 'none',
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${isGold ? 'rgba(212,169,74,0.35)' : 'rgba(167,123,255,0.35)'}`,
                background: btnHovered
                  ? (isGold ? 'rgba(212,169,74,0.18)' : 'rgba(167,123,255,0.18)')
                  : (isGold ? 'rgba(212,169,74,0.09)' : 'rgba(167,123,255,0.09)'),
                transform: btnHovered ? 'scale(1.02)' : 'scale(1)',
                transition: 'background 0.18s ease, transform 0.18s ease, border-color 0.18s ease',
              }}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              onClick={e => e.stopPropagation()}
            >
              Learn more <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Desktop Hub ──────────────────────────────────────────────────────────────

function DesktopHub({ branches }: { branches: BranchData[] }) {
  const usePentagon = branches.length === 5

  if (usePentagon) {
    return (
      <div className="hidden md:flex md:justify-center">
        <div className="relative hub-scale" style={{ width: HUB_W, height: HUB_H }}>
          <ConnectorLines />

          {/* Center circle */}
          <div
            style={{
              position: 'absolute',
              left: CX,
              top: CY,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <CenterCircle />
            </motion.div>
          </div>

          {/* 5 cards at pentagon vertices */}
          {branches.map((branch, i) => {
            const [left, top] = PENTAGON[i].cardTopLeft
            return (
              <div
                key={branch.id}
                style={{ position: 'absolute', left, top, zIndex: 20 }}
              >
                <FlipCard branch={branch} delay={0.3 + i * 0.1} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Grid layout: center circle on top, cards in a grid below
  return (
    <div className="hidden md:flex flex-col items-center w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-14"
      >
        <CenterCircle />
      </motion.div>
      <div
        className="grid w-full max-w-4xl"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}
      >
        {branches.map((branch, i) => (
          <div key={branch.id} className="flex justify-center">
            <FlipCard branch={branch} delay={0.3 + Math.min(i, 6) * 0.08} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Mobile Hub ───────────────────────────────────────────────────────────────

function MobileHub({ branches }: { branches: BranchData[] }) {
  return (
    <div className="flex flex-col items-center gap-8 md:hidden pt-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <CenterCircle />
      </motion.div>
      <div className="flex flex-col items-center gap-4 w-full max-w-sm px-4 mt-8">
        {branches.map((branch, i) => (
          <div key={branch.id} className="flex justify-center w-full">
            <FlipCard branch={branch} delay={0.2 + i * 0.07} touchMode w={MOBILE_CARD_W} h={MOBILE_CARD_H} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Text Intro (Phase 1) ─────────────────────────────────────────────────────

function TextIntro() {
  return (
    <motion.div
      className="text-center px-5 pt-36 flex flex-col items-center gap-5"
      exit={{ opacity: 0, y: -8, transition: { duration: 0.55, ease: 'easeIn' } }}
    >
      {/* Studio label */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.35 }}
        className="inline-flex items-center gap-2 px-4 py-1.5"
      >
        <img 
          src="https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/media/Tae%20Studio/Tae%20Studio%20Logo.png"
          alt="Tae Studio logo"
          className="h-32 md:h-48 w-auto"/>
      </motion.div>

      {/* Headline */}
      <div className="overflow-hidden">
        <motion.h1
          className="font-serif font-light leading-[0.95] tracking-[-0.02em]"
          style={{ fontSize: 'clamp(52px, 10vw, 96px)' }}
        >
          <motion.span
            className="block text-ink"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            Strategy that
          </motion.span>
          <motion.em
            className="block text-lavender-light"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
          >
            feels like you.
          </motion.em>
        </motion.h1>
      </div>

      {/* Quote */}
      <motion.p
        className="font-serif italic text-gold/80 text-sm sm:text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.6 }}
      >
        "Healing is the strategy. Alignment is the ROI."
      </motion.p>
    </motion.div>
  )
}

// ─── Hub Reveal (Phase 2) ─────────────────────────────────────────────────────

function HubReveal({ branches }: { branches: BranchData[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full flex flex-col items-center"
    >
      <DesktopHub branches={branches} />
      <MobileHub branches={branches} />
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [heroPhase, setHeroPhase] = useState<'text' | 'hub'>('text')
  const { services, loading: servicesLoading } = useServices()

  // Derive branches: show all services once loaded; fallback (5 items) while loading
  const branches: BranchData[] = !servicesLoading && services.length > 0
    ? services.map(serviceToBranch)
    : FALLBACK_BRANCHES

  useEffect(() => {
    const t = setTimeout(() => setHeroPhase('hub'), 3800)
    return () => clearTimeout(t)
  }, [])

  return (
    <main className="min-h-screen bg-plum-900 overflow-x-hidden">

      {/* ── Full-viewport hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex justify-center overflow-visible">
        <GridBg />
        <GlowOrb color="lavender" size={700} opacity={0.1}  className="-top-20 left-1/2 -translate-x-1/2" />
        <GlowOrb color="gold"     size={350} opacity={0.08} className="top-40 left-10" />
        <GlowOrb color="gold"     size={300} opacity={0.07} className="top-40 right-10" />
        <GlowOrb color="lavender" size={280} opacity={0.07} className="bottom-20 left-1/4" />
        <GlowOrb color="lavender" size={280} opacity={0.07} className="bottom-20 right-1/4" />

        {/* Phase content */}
<div className="relative z-10 w-full flex justify-center pt-16 pb-20">
  <AnimatePresence mode="wait">
            {heroPhase === 'text' ? (
              <TextIntro key="text" />
            ) : (
              <HubReveal key="hub" branches={branches} />
            )}
          </AnimatePresence>
        </div>

        {/* Scroll indicator — appears once hub is visible */}
        <AnimatePresence>
          {heroPhase === 'hub' && (
            <motion.div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 0.5 }}
            >
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown size={18} className="text-ink-dim" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      

      {/* ── CTA section ───────────────────────────────────────────────────── */}
      <section className="relative py-20 px-5">
        <GlowOrb color="gold" size={500} opacity={0.1} className="top-0 left-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <FadeUp>
            <GoldDivider className="mb-8" />
            <h2 className="font-serif text-[clamp(28px,5vw,44px)] font-light text-ink mb-4 leading-tight">
              Start with clarity.
              <br />
              <em className="text-lavender-light">End with momentum.</em>
            </h2>
            <p className="font-sans text-ink-soft text-sm mb-10 leading-relaxed max-w-sm mx-auto">
              $47 · Unlimited sessions · Exact language and a clear next move for whatever you're navigating right now.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/soft-strategy-desk">
                <GoldButton size="lg">Get the Desk — $47 →</GoldButton>
              </Link>
              <Link to="/alignment-guide">
                <button className="font-sans text-sm text-ink-soft hover:text-gold transition-colors">
                  Or start with the free guide →
                </button>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
 {/* ── Social Proof ──────────────────────────────────────────────────── */}
      <SocialProofSection />
      {/* ── Philosophy ────────────────────────────────────────────────────── */}
      <PhilosophySection />

      {/* ── Desk Spotlight ────────────────────────────────────────────────── */}
      <DeskSpotlightSection />

     

      {/* ── Ecosystem Ladder ──────────────────────────────────────────────── */}
      <EcosystemLadderSection services={services} />

    </main>
  )
}

// ─── Philosophy Section ───────────────────────────────────────────────────────

const BELIEFS = [
  { icon: <Zap />, title: 'Energy-First Strategy', body: 'Your business plan should be built around how you actually operate — not a productivity template designed for someone else.' },
  { icon: <Gem />, title: 'Soft but Sharp', body: 'Gentle does not mean vague. The clearest, most powerful brand language comes from deep alignment, not aggressive positioning.' },
  { icon: <Target />, title: 'Anti-Hustle Execution', body: 'More output is not the answer. The right move at the right time beats a calendar full of exhausting activity every time.' },
  { icon: <Heart />, title: 'Healing is the Strategy', body: "When you clear the internal chaos, external results follow. Burnout isn't a badge — it's a signal the system is misaligned." },
]

function PhilosophySection() {
  return ( 
    <section className="relative py-28 px-5 overflow-hidden">
      <GlowOrb color="lavender" size={600} opacity={0.07} className="top-0 right-0 translate-x-1/3 -translate-y-1/4" />
      <GlowOrb color="gold" size={400} opacity={0.06} className="bottom-0 left-0 -translate-x-1/4 translate-y-1/4" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <FadeUp>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-lavender/10 border border-lavender/20 rounded-full px-4 py-1.5 mb-6">
              <span className="font-mono text-[13px] tracking-[0.18em] text-lavender uppercase">Philosophy</span>
            </div>
            <h2 className="font-serif font-light text-[clamp(28px,4.5vw,42px)] text-ink leading-tight mb-4">
              Built different.<br />
              <em className="text-lavender-light">On purpose.</em>
            </h2>
            <p className="font-sans text-ink-soft text-sm max-w-md mx-auto leading-relaxed">
              Tae Studio exists for women who are done performing hustle. Every tool, offer, and framework is built around one premise: clarity before action.
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {BELIEFS.map((b, i) => (
            <FadeUp key={b.title} delay={i * 0.1}>
              <div
                className="rounded-2xl p-6 border border-white/[0.07] hover:border-lavender/25 transition-colors duration-300"
                style={{ background: 'rgba(167,123,255,0.04)' }}
              >
                <span className="text-lavender text-lg mb-3 block">{b.icon}</span>
                <h3 className="font-serif italic text-[15px] text-lavender-light mb-2">{b.title}</h3>
                <p className="font-sans text-[15px] text-ink-soft leading-relaxed">{b.body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Desk Spotlight Section ───────────────────────────────────────────────────

const ENGINES_PREVIEW = [
  { emoji: '🛡️', label: 'Corporate Survival', desc: 'Scripts, boundaries, and exit strategies for navigating toxic work environments.' },
  { emoji: '💸', label: 'Content-to-Cash', desc: 'Turn your ideas into hooks, captions, and offers that convert.' },
  { emoji: '🧭', label: 'Decision Clarity', desc: 'Cut through the noise and find your clearest, most aligned next step.' },
  { emoji: '🌿', label: 'Soft Business Builder', desc: 'Build your offer, funnel, and content plan — without the overwhelm.' },
]

function DeskSpotlightSection() {
  return (
    <section className="relative py-28 px-5 overflow-hidden">
      {/* Divider */}
      <div className="max-w-xl mx-auto mb-20">
        <GoldDivider />
      </div>

      <GlowOrb color="lavender" size={700} opacity={0.09} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left: copy */}
          <FadeUp>
            <div className="inline-flex items-center gap-2 bg-lavender/10 border border-lavender/20 rounded-full px-4 py-1.5 mb-6">
              <span className="font-mono text-[13px] tracking-[0.18em] text-lavender uppercase">Flagship Tool</span>
            </div>
            <h2 className="font-serif font-light text-[clamp(30px,4.5vw,46px)] text-ink leading-tight mb-5">
              Soft Strategy Desk™
              <br />
              <em className="text-lavender-light">$47 · Unlimited sessions.</em>
            </h2>
            <p className="font-sans text-sm text-ink-soft leading-relaxed mb-4 max-w-sm">
              Four AI engines tuned for the way ambitious women think, decide, and build. Choose your engine, answer a few prompts, and walk away with exact language and a clear next move — in minutes.
            </p>
            <p className="font-sans text-[14px] text-ink-dim mb-8">
              Instant access · Works on mobile and desktop
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/soft-strategy-desk">
                <GoldButton>Get the Desk — $47 →</GoldButton>
              </Link>
              <Link to="/offers" className="inline-flex items-center gap-1.5 font-sans text-sm text-ink-soft hover:text-lavender transition-colors self-center">
                See all offers <ArrowUpRight size={13} />
              </Link>
            </div>
          </FadeUp>

          {/* Right: engine tiles */}
          <div className="grid grid-cols-2 gap-3">
            {ENGINES_PREVIEW.map((e, i) => (
              <FadeUp key={e.label} delay={0.1 + i * 0.08}>
                <Link
                  to="/desk"
                  className="group block rounded-2xl p-4 border border-white/[0.07] hover:border-lavender/35 transition-all duration-250 hover:-translate-y-0.5"
                  style={{ background: 'rgba(167,123,255,0.05)' }}
                >
                  <span className="text-2xl mb-3 block">{e.emoji}</span>
                  <p className="font-serif italic text-[13px] text-lavender-light mb-1 leading-snug">{e.label}</p>
                  <p className="font-sans text-[14px] text-ink-dim leading-relaxed">{e.desc}</p>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Social Proof Section ─────────────────────────────────────────────────────

const TESTIMONIALS = [
  
  {
    quote: "This isn't a chatbot. It actually understands the nuance of being a Black woman in corporate — the politics, the exhaustion, the strategy required.",
    name: 'Danielle R.',
    role: 'Senior Manager & Side-Business Owner',
  },
  {
    quote: "The Decision Clarity engine saved me from making a $12k mistake. It helped me see exactly what I was afraid of versus what the data actually said.",
    name: 'Kezia M.',
    role: 'Creator & Digital Product Seller',
  },
  {
    quote: "I'd been spinning on my brand positioning for months. One session with the Desk and I finally had the exact words I'd been searching for.",
    name: 'Marielle T.',
    role: 'Corporate-to-Consultant',
  },
]

function SocialProofSection() {
  return (
    <section className="relative py-24 px-5 overflow-hidden">
      <GlowOrb color="gold" size={500} opacity={0.07} className="top-0 left-1/2 -translate-x-1/2" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <FadeUp>
          <div className="text-center mb-14">
            <GoldDivider className="mb-8" />
            <p className="font-mono text-[13px] tracking-[0.18em] text-gold uppercase mb-4">From Women Who've Sat at the Desk</p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.12}>
              <div
                className="rounded-2xl p-7 border border-white/[0.07] h-full flex flex-col"
                style={{ background: 'rgba(212,169,74,0.04)' }}
              >
                <p className="font-serif italic text-[18px] text-ink/80 leading-relaxed flex-1 mb-6">
                  "{t.quote}"
                </p>
                <div>
                  <p className="font-sans text-[14px] text-gold font-medium">{t.name}</p>
                  <p className="font-sans text-[14px] text-ink-dim">{t.role}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Ecosystem Ladder Section ─────────────────────────────────────────────────

function EcosystemLadderSection({ services }: { services: Service[] }) {
  const steps = services.length > 0 ? services : [
    { slug: 'alignment-guide', name: 'FREE Alignment Guide',       price_display: 'Free',      description: 'Realign your brand and energy before you build anything else.',                         accent_color: 'gold',     page_href: '/alignment-guide'    } as Service,
    { slug: 'soft-boundaries', name: 'Soft Boundaries Script Pack', price_display: '$9',        description: 'Exact scripts for workplace, client, and personal boundary moments.',                  accent_color: 'lavender', page_href: '/soft-boundaries'    } as Service,
    { slug: 'ai-twin',         name: 'Start Your AI Twin',          price_display: 'From $888', description: 'A custom AI built on your tone, offers, and systems.',                                accent_color: 'gold',     page_href: '/ai-twin'            } as Service,
    { slug: 'strategy-desk',   name: 'Soft Strategy Desk™',         price_display: '$47',       description: 'Four engines. Unlimited sessions. Exact language and your next move — instantly.',    accent_color: 'lavender', page_href: '/soft-strategy-desk' } as Service,
  ]

  return (
    <section className="relative py-28 px-5 overflow-hidden">
      <GlowOrb color="lavender" size={500} opacity={0.07} className="bottom-0 right-0 translate-x-1/4 translate-y-1/4" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <FadeUp>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-full px-4 py-1.5 mb-6">
              <span className="font-mono text-[13px] tracking-[0.18em] text-gold uppercase">The Ecosystem</span>
            </div>
            <h2 className="font-serif font-light text-[clamp(26px,4vw,40px)] text-ink leading-tight mb-4">
              Every stage. <em className="text-gold">Every budget.</em>
            </h2>
            <p className="font-sans text-ink-soft text-sm max-w-sm mx-auto leading-relaxed">
              Start free. Go deeper when you're ready. Every offer is designed to lead you to the next level of clarity.
            </p>
          </div>
        </FadeUp>

        {/* Desktop: horizontal row */}
        <div className={`hidden md:grid gap-4 mb-12`} style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
          {steps.map((s, i) => {
            const isLavender = s.accent_color === 'lavender'
            const accentColor = isLavender ? '#A77BFF' : '#D4A94A'
            const accentBg = isLavender ? 'rgba(167,123,255,0.07)' : 'rgba(212,169,74,0.07)'
            const accentBorder = isLavender ? 'rgba(167,123,255,0.22)' : 'rgba(212,169,74,0.22)'
            const step = String(i + 1).padStart(2, '0')
            return (
              <FadeUp key={s.slug} delay={i * 0.1}>
                <Link
                  to={s.page_href}
                  className="group block rounded-2xl p-5 border h-full hover:-translate-y-1 transition-all duration-250"
                  style={{ background: accentBg, borderColor: accentBorder }}
                >
                  <span className="font-mono text-[13px] tracking-[0.15em] mb-3 block" style={{ color: accentColor }}>
                    {step}
                  </span>
                  <p className="font-serif italic text-[14px] text-ink leading-snug mb-1">{s.name}</p>
                  <p className="font-sans font-semibold text-[14px] mb-2" style={{ color: accentColor }}>{s.price_display}</p>
                  <p className="font-sans text-[14px] text-ink-dim leading-relaxed line-clamp-3">{s.description}</p>
                  <span className="inline-flex items-center gap-1 font-sans text-[14px] mt-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accentColor }}>
                    Learn more <ArrowUpRight size={10} />
                  </span>
                </Link>
              </FadeUp>
            )
          })}
        </div>

        {/* Connector arrows between steps — desktop only */}
        <div className="hidden md:flex justify-center mb-4 -mt-8 pointer-events-none select-none">
          <div className={`grid w-full max-w-5xl px-2`} style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
            {steps.map((_, i) => (
              <div key={i} className="flex items-center justify-end pr-2">
                {i < steps.length - 1 && <ArrowUpRight size={12} className="text-ink-dim opacity-30 rotate-45" />}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical list */}
        <div className="md:hidden flex flex-col gap-3">
          {steps.map((s, i) => {
            const isLavender = s.accent_color === 'lavender'
            const accentColor = isLavender ? '#A77BFF' : '#D4A94A'
            const accentBg = isLavender ? 'rgba(167,123,255,0.07)' : 'rgba(212,169,74,0.07)'
            const accentBorder = isLavender ? 'rgba(167,123,255,0.22)' : 'rgba(212,169,74,0.22)'
            const step = String(i + 1).padStart(2, '0')
            return (
              <FadeUp key={s.slug} delay={i * 0.08}>
                <Link
                  to={s.page_href}
                  className="flex items-center gap-4 rounded-2xl p-4 border"
                  style={{ background: accentBg, borderColor: accentBorder }}
                >
                  <span className="font-mono text-[13px] tracking-widest shrink-0 w-6" style={{ color: accentColor }}>{step}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif italic text-[14px] text-ink mb-0.5">{s.name}</p>
                    <p className="font-sans font-semibold text-[14px]" style={{ color: accentColor }}>{s.price_display}</p>
                  </div>
                  <ArrowUpRight size={13} style={{ color: accentColor }} className="shrink-0 opacity-60" />
                </Link>
              </FadeUp>
            )
          })}
        </div>

        <FadeUp delay={0.4}>
          <div className="text-center mt-12">
            <Link to="/offers">
              <button className="font-sans text-sm text-ink-soft hover:text-gold transition-colors inline-flex items-center gap-1.5">
                View the full ecosystem <ArrowUpRight size={13} />
              </button>
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
 