import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion, useMotionValue, animate } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

// ─── Status messages per phase ────────────────────────────────────────────────
const PHASE_1_MESSAGES = [
  'Fetching price history…',
  'Reading product data…',
  'Analyzing retailer prices…',
]
const PHASE_2_MESSAGES = [
  'Comparing 5 retailers…',
  'Checking Walmart & Best Buy…',
  'Scanning Target & eBay…',
  'Finding the best deal…',
]

// ─── Waveform ─────────────────────────────────────────────────────────────────
const BAR_COUNT = 28
const BAR_DELAYS = Array.from({ length: BAR_COUNT }, (_, i) => i * 0.07)

// ─── Background blob definitions ──────────────────────────────────────────────
const BLOBS = [
  {
    size: 520,
    style: { top: '-10%', left: '-8%' },
    gradient: 'radial-gradient(ellipse, rgba(59,130,246,0.13) 0%, rgba(59,130,246,0.04) 50%, transparent 75%)',
    x: [0, 60, -30, 80, 0], y: [0, -40, 60, 20, 0],
    borderRadius: ['60% 40% 55% 45% / 50% 60% 40% 50%','40% 60% 35% 65% / 65% 35% 65% 35%','55% 45% 60% 40% / 40% 60% 50% 50%','45% 55% 40% 60% / 55% 45% 55% 45%','60% 40% 55% 45% / 50% 60% 40% 50%'],
    duration: 22,
  },
  {
    size: 380,
    style: { bottom: '-5%', right: '-5%' },
    gradient: 'radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 55%, transparent 75%)',
    x: [0, -50, 30, -70, 0], y: [0, 40, -60, -20, 0],
    borderRadius: ['45% 55% 65% 35% / 55% 45% 55% 45%','65% 35% 45% 55% / 35% 65% 45% 55%','40% 60% 55% 45% / 60% 40% 60% 40%','55% 45% 40% 60% / 45% 55% 40% 60%','45% 55% 65% 35% / 55% 45% 55% 45%'],
    duration: 28,
  },
  {
    size: 260,
    style: { top: '30%', left: '5%' },
    gradient: 'radial-gradient(ellipse, rgba(16,185,129,0.09) 0%, rgba(16,185,129,0.03) 55%, transparent 75%)',
    x: [0, 40, -20, 50, 0], y: [0, -50, 30, 60, 0],
    borderRadius: ['70% 30% 50% 50% / 30% 70% 50% 50%','30% 70% 60% 40% / 60% 40% 30% 70%','50% 50% 40% 60% / 50% 50% 70% 30%','40% 60% 70% 30% / 40% 60% 50% 50%','70% 30% 50% 50% / 30% 70% 50% 50%'],
    duration: 18,
  },
  {
    size: 440,
    style: { top: '-15%', right: '-10%' },
    gradient: 'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, rgba(59,130,246,0.03) 50%, transparent 75%)',
    x: [0, -40, 70, -30, 0], y: [0, 60, 20, -50, 0],
    borderRadius: ['50% 50% 40% 60% / 60% 40% 55% 45%','60% 40% 55% 45% / 45% 55% 40% 60%','35% 65% 60% 40% / 55% 45% 60% 40%','60% 40% 45% 55% / 40% 60% 45% 55%','50% 50% 40% 60% / 60% 40% 55% 45%'],
    duration: 25,
  },
  {
    size: 180,
    style: { bottom: '15%', left: '40%' },
    gradient: 'radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.05) 55%, transparent 75%)',
    x: [0, -30, 50, -40, 0], y: [0, -40, -20, 30, 0],
    borderRadius: ['60% 40% 30% 70% / 60% 30% 70% 40%','30% 70% 60% 40% / 40% 60% 30% 70%','50% 50% 70% 30% / 30% 70% 50% 50%','70% 30% 40% 60% / 60% 40% 70% 30%','60% 40% 30% 70% / 60% 30% 70% 40%'],
    duration: 15,
  },
]

// ─── Progress stages ───────────────────────────────────────────────────────────
//  Phase 1 (isLoading):           0 % → 44 %  over ~5 s
//  Phase 2 (isLoadingComparison): 45% → 92 %  over ~10 s
//  Done:                          → 100% instantly, then modal exits

// ─── Component ────────────────────────────────────────────────────────────────
interface ProductLoadingOverlayProps {
  isLoading: boolean
  isLoadingComparison: boolean
}

export function ProductLoadingOverlay({ isLoading, isLoadingComparison }: ProductLoadingOverlayProps) {
  const shouldReduce = useReducedMotion()
  const [dismissed, setDismissed] = useState(false)
  const isVisible = (isLoading || isLoadingComparison) && !dismissed

  const [msgIndex, setMsgIndex] = useState(0)
  const messages = isLoading ? PHASE_1_MESSAGES : PHASE_2_MESSAGES

  // Reset dismissed when a new load starts
  useEffect(() => {
    if (isLoading) setDismissed(false)
  }, [isLoading])

  // Cycle status messages
  useEffect(() => {
    if (!isVisible) { setMsgIndex(0); return }
    setMsgIndex(0)
    const id = setInterval(() => setMsgIndex(i => (i + 1) % messages.length), 1600)
    return () => clearInterval(id)
  }, [isVisible, isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Deterministic progress value driven by phase
  const progress = useMotionValue(0)

  useEffect(() => {
    if (!isVisible && !isLoading && !isLoadingComparison) {
      // Done — snap to 100
      animate(progress, 100, { duration: 0.3, ease: 'easeOut' })
      return
    }
    if (isLoading) {
      // Phase 1: crawl toward 44 % over 5 s
      animate(progress, 44, { duration: 5, ease: 'linear' })
    } else if (isLoadingComparison) {
      // Phase 2: start at 47 then crawl to 92 % over 10 s
      animate(progress, 47, { duration: 0.2, ease: 'easeOut' }).then(() => {
        animate(progress, 92, { duration: 10, ease: 'linear' })
      })
    }
  }, [isLoading, isLoadingComparison]) // eslint-disable-line react-hooks/exhaustive-deps

  const phase1Done = !isLoading
  const phase2Done = !isLoadingComparison && !isLoading

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="product-loading-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#09090B]"
          aria-live="polite"
          aria-label="Loading product data"
        >

          {/* ── Animated background blobs ──────────────────────────────── */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {BLOBS.map((blob, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  ...blob.style,
                  width: blob.size,
                  height: blob.size,
                  background: blob.gradient,
                  filter: 'blur(40px)',
                }}
                animate={shouldReduce ? {} : {
                  x: blob.x, y: blob.y, borderRadius: blob.borderRadius,
                }}
                transition={shouldReduce ? {} : {
                  duration: blob.duration, repeat: Infinity, ease: 'easeInOut',
                  times: [0, 0.25, 0.5, 0.75, 1],
                }}
              />
            ))}
          </div>

          {/* ── Grain ──────────────────────────────────────────────────── */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23grain)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat', backgroundSize: '250px 250px',
            }}
            aria-hidden="true"
          />

          {/* ── Center content ─────────────────────────────────────────── */}
          <div className="relative flex w-full max-w-xs flex-col items-center gap-8 px-6">

            {/* Waveform */}
            <div
              className="flex items-center justify-center gap-[3px]"
              style={{ height: 64 }}
              aria-hidden="true"
            >
              {Array.from({ length: BAR_COUNT }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-[3px] rounded-full"
                  style={{
                    background: i % 5 === 0 ? 'rgba(59,130,246,0.75)' : 'rgba(255,255,255,0.2)',
                  }}
                  animate={shouldReduce ? {} : {
                    scaleY: [0.15, 1, 0.25, 0.8, 0.1, 0.9, 0.3],
                    opacity: [0.4, 1, 0.5, 0.9, 0.3, 1, 0.4],
                  }}
                  transition={shouldReduce ? {} : {
                    duration: 1.4 + (i % 4) * 0.2, repeat: Infinity,
                    ease: 'easeInOut', delay: BAR_DELAYS[i % BAR_DELAYS.length],
                    repeatType: 'mirror',
                  }}
                  initial={{ scaleY: 0.15, opacity: 0.3 }}
                />
              ))}
            </div>

            {/* ── Progress stages ──────────────────────────────────────── */}
            <div className="w-full space-y-3">

              {/* Continuous progress bar */}
              <div
                className="relative h-px w-full overflow-hidden rounded-full"
                style={{ background: 'rgba(255,255,255,0.08)' }}
                role="progressbar"
                aria-label="Loading progress"
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: progress,
                    background: 'linear-gradient(90deg, rgba(59,130,246,0.5), rgba(99,179,255,0.95))',
                    boxShadow: '0 0 8px rgba(59,130,246,0.5)',
                  }}
                />
              </div>

              {/* Two step pills */}
              <div className="flex items-center gap-2">
                <StepPill label="Price data" done={phase1Done} active={isLoading} />
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} aria-hidden="true" />
                <StepPill label="Retailer prices" done={phase2Done} active={isLoadingComparison} />
              </div>

              {/* Status message */}
              <div className="relative h-5 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`${isLoading ? 'p1' : 'p2'}-${msgIndex}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } }}
                    exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
                    className="absolute text-center text-xs text-zinc-500"
                  >
                    {messages[msgIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* ── Skip button ───────────────────────────────────────────── */}
            <motion.button
              onClick={() => setDismissed(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 3, duration: 0.4 } }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-zinc-400 hover:border-white/[0.14] hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label="Skip loading and view page"
            >
              View page anyway
              <ArrowRight className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Step pill ────────────────────────────────────────────────────────────────
function StepPill({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`${label}: ${done ? 'complete' : active ? 'in progress' : 'waiting'}`}
    >
      <AnimatePresence mode="wait">
        {done ? (
          <motion.span
            key="done"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-400" strokeWidth={2} aria-hidden="true" />
          </motion.span>
        ) : (
          <motion.span
            key="dot"
            className="h-2 w-2 rounded-full"
            style={{ background: active ? 'rgba(59,130,246,0.9)' : 'rgba(255,255,255,0.15)' }}
            animate={active && !done && !shouldReduceMotionCheck ? { opacity: [1, 0.4, 1] } : {}}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      <span
        className="text-xs font-medium"
        style={{ color: done ? 'rgba(52,211,153,0.9)' : active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}
      >
        {label}
      </span>
    </div>
  )
}

// tiny helper — StepPill is outside the component so can't call the hook directly
const shouldReduceMotionCheck = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches
