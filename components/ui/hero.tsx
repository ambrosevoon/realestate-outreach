'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Building2, ChevronRight, LayoutDashboard, Mail, Sparkles } from 'lucide-react'
import { MeshGradient, PulsingBorder } from '@paper-design/shaders-react'
import { motion } from 'framer-motion'
import { SmartFlowLogo } from '@/components/brand/SmartFlowLogo'

type HeroLink = {
  label: string
  href: string
}

type HeroProps = {
  variant?: 'full' | 'compact'
  title: string
  eyebrow?: string
  description: string
  stats?: Array<{ label: string; value: string }>
  navLinks?: HeroLink[]
  primaryAction?: HeroLink
  secondaryAction?: HeroLink
  className?: string
}

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export default function ShaderShowcase({
  variant = 'full',
  title,
  eyebrow = 'Premium real-estate automation',
  description,
  stats = [],
  navLinks = [],
  primaryAction,
  secondaryAction,
  className,
}: HeroProps) {
  const [isActive, setIsActive] = useState(false)

  const palette = useMemo(
    () =>
      variant === 'compact'
        ? ['#02040a', '#12304b', '#16687d', '#b6884d', '#0a1220']
        : ['#02040a', '#0f2940', '#0f6d7d', '#c49a5c', '#0a1220'],
    [variant]
  )

  return (
    <section
      className={cn(
        'group relative overflow-hidden border border-white/10 text-white shadow-[0_40px_120px_-64px_rgba(0,0,0,0.95)]',
        variant === 'compact'
          ? 'min-h-[19rem] rounded-[2rem]'
          : 'min-h-screen rounded-none',
        className
      )}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      <svg className="absolute inset-0 h-0 w-0">
        <defs>
          <filter id="sf-glass" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.004" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.5" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.04
                      0 0 0 0.9 0"
            />
          </filter>
          <linearGradient id="sf-hero-text" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8edd4" />
            <stop offset="35%" stopColor="#90edf1" />
            <stop offset="70%" stopColor="#c79a5b" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>
      </svg>

      <MeshGradient
        className="absolute inset-0 h-full w-full"
        colors={palette}
        speed={0.22}
      />
      <MeshGradient
        className="absolute inset-0 h-full w-full opacity-35"
        colors={['#02040a', '#ffffff', '#4fd1d9', '#d6a15c']}
        speed={0.14}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_22%),radial-gradient(circle_at_20%_20%,rgba(79,209,217,0.16),transparent_24%),linear-gradient(180deg,rgba(2,4,10,0.12),rgba(2,4,10,0.7))]" />
      <div className="absolute -right-20 top-12 h-56 w-56 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative z-10 flex min-h-inherit flex-col">
        <header
          className={cn(
            'flex items-center justify-between gap-4',
            variant === 'compact' ? 'px-6 pt-6' : 'px-6 py-6 md:px-10'
          )}
        >
          <SmartFlowLogo size={variant === 'compact' ? 'sm' : 'md'} />

          {navLinks.length > 0 && (
            <nav className="hidden items-center gap-2 md:flex">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-stone-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </header>

        <div
          className={cn(
            'relative flex flex-1 flex-col justify-end',
            variant === 'compact'
              ? 'px-6 pb-6 pt-8'
              : 'px-6 pb-8 pt-12 md:px-10 md:pb-10'
          )}
        >
          <motion.div
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-stone-200 backdrop-blur-sm"
            style={{ filter: 'url(#sf-glass)' }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            {eyebrow}
          </motion.div>

          <div
            className={cn(
              'mt-5 grid gap-8',
              variant === 'compact' ? 'lg:grid-cols-[minmax(0,1fr)_17rem]' : 'lg:grid-cols-[minmax(0,1fr)_20rem]'
            )}
          >
            <div className="max-w-4xl">
              <motion.h1
                className={cn(
                  'font-semibold leading-[0.95] tracking-[-0.05em]',
                  variant === 'compact'
                    ? 'max-w-3xl text-4xl md:text-5xl'
                    : 'max-w-4xl text-5xl md:text-7xl lg:text-[6.4rem]'
                )}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <span
                  className="bg-[length:180%_180%] bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #f8edd4 0%, #92edf0 28%, #d6a15c 72%, #ffffff 100%)',
                  }}
                >
                  {title}
                </span>
              </motion.h1>

              <motion.p
                className={cn(
                  'mt-5 max-w-2xl text-pretty font-light leading-relaxed text-stone-300/92',
                  variant === 'compact' ? 'text-base md:text-lg' : 'text-lg md:text-xl'
                )}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                {description}
              </motion.p>

              {(primaryAction || secondaryAction) && (
                <motion.div
                  className="mt-8 flex flex-wrap items-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                >
                  {secondaryAction && (
                    <Link
                      href={secondaryAction.href}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-stone-100 transition hover:border-cyan-300/40 hover:bg-white/10"
                    >
                      <LayoutDashboard className="h-4 w-4 text-cyan-300" />
                      {secondaryAction.label}
                    </Link>
                  )}
                  {primaryAction && (
                    <Link
                      href={primaryAction.href}
                      className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#eed8ae_0%,#d2a461_45%,#8d6736_100%)] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                    >
                      <Mail className="h-4 w-4" />
                      {primaryAction.label}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </motion.div>
              )}
            </div>

            <motion.div
              className="relative self-end justify-self-end"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <div className="relative flex h-40 w-40 items-center justify-center md:h-48 md:w-48">
                <PulsingBorder
                  colors={['#5ee7ef', '#0f6d7d', '#d2a461', '#f6edd2', '#ffffff']}
                  colorBack="#00000000"
                  speed={1.2}
                  roundness={1}
                  thickness={0.08}
                  margin={0.16}
                  softness={0.18}
                  intensity={isActive ? 4.8 : 3.2}
                  bloom={0.75}
                  spots={12}
                  spotSize={0.12}
                  pulse={0.1}
                  smoke={0.25}
                  smokeSize={3}
                  style={{ width: '100%', height: '100%', borderRadius: '999px' }}
                />
                <div className="absolute inset-[28%] rounded-full border border-white/10 bg-black/35 backdrop-blur-md" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-stone-100/90 md:h-12 md:w-12" />
                </div>
              </div>

              {stats.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {stats.slice(0, 4).map(stat => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-sm"
                    >
                      <div className="text-[0.65rem] uppercase tracking-[0.24em] text-stone-400">
                        {stat.label}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-stone-100">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
