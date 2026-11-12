import React from 'react'
import { motion } from 'framer-motion'

export function GoldDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-px w-10 bg-gradient-to-r from-transparent to-gold" />
      <span className="text-gold text-[7px]">◆</span>
      <div className="h-px w-10 bg-gradient-to-l from-transparent to-gold" />
    </div>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-full px-4 py-1.5">
      <span className="font-mono text-[13px] tracking-[0.18em] text-gold uppercase">{children}</span>
    </div>
  )
}

export function GoldButton({
  children,
  onClick,
  href,
  disabled,
  className = '',
  size = 'md',
}: {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-7 py-3.5 text-base',
    lg: 'px-10 py-4 text-lg',
  }
  const base = `inline-flex items-center justify-center font-serif font-semibold tracking-wide rounded-2xl transition-all duration-250 ${sizes[size]} ${className}`
  const active = `bg-gradient-to-br from-gold-light via-gold to-gold-dark text-plum-900 shadow-[0_4px_24px_rgba(212,169,74,0.35)] hover:shadow-[0_8px_32px_rgba(212,169,74,0.5)] hover:-translate-y-0.5`
  const disabledCls = `bg-plum-500/50 text-ink-dim cursor-not-allowed`

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${active}`}>
        {children}
      </a>
    )
  }
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${disabled ? disabledCls : active}`}>
      {children}
    </button>
  )
}

export function GhostButton({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center font-sans text-sm text-ink-soft hover:text-ink transition-colors duration-200 ${className}`}
    >
      {children}
    </button>
  )
}

export function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function GlowOrb({
  color = 'gold',
  size = 400,
  opacity = 0.15,
  className = '',
}: {
  color?: 'gold' | 'lavender'
  size?: number
  opacity?: number
  className?: string
}) {
  const c = color === 'gold' ? '212,169,74' : '167,123,255'
  return (
    <div
      className={`absolute pointer-events-none rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(ellipse at center, rgba(${c},${opacity}) 0%, transparent 70%)`,
        filter: 'blur(1px)',
      }}
    />
  )
}

export function Card({
  children,
  className = '',
  hover = false,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}) {
  const hoverCls = hover
    ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(30,18,40,0.4)] hover:border-lavender/30 transition-all duration-250'
    : ''
  return (
    <div
      onClick={onClick}
      className={`bg-plum-800/60 border border-white/[0.07] rounded-3xl ${hoverCls} ${className}`}
    >
      {children}
    </div>
  )
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[13px] tracking-widest text-lavender uppercase bg-lavender/10 border border-lavender/20 rounded-full px-3 py-1">
      {children}
    </span>
  )
}

export function Loader({ label = 'Thinking through your situation...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div className="w-9 h-9 border-2 border-lavender/20 border-t-lavender rounded-full animate-spin" />
      <p className="font-serif italic text-ink-soft text-sm">{label}</p>
    </div>
  )
}
