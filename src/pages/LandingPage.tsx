import { motion } from 'framer-motion'
import { Radar } from 'lucide-react'
import { IconArrowRight, IconChart, IconTag, IconShield, IconBell } from '@/components/ui/Icons'
import { URLSearchInput } from '@/components/product/URLSearchInput'
import { SignalBadge } from '@/components/product/SignalBadge'
import { Page } from '@/components/layout'
import { InstallBanner } from '@/components/common'
import { cn, formatPrice } from '@/lib/utils'
import { useDocumentTitle } from '@/hooks'

const STEPS = [
  {
    icon: <IconArrowRight className="h-4 w-4 text-blue-400" aria-hidden="true" />,
    step: '01',
    title: 'Paste an Amazon product link',
    body: 'Copy any Amazon product URL and paste it here. No extension needed.',
  },
  {
    icon: <IconChart className="h-4 w-4 text-blue-400" aria-hidden="true" />,
    step: '02',
    title: 'Get the verdict instantly',
    body: "We compare the current price to its history and tell you: is this a good deal right now?",
  },
  {
    icon: <IconBell className="h-4 w-4 text-blue-400" aria-hidden="true" />,
    step: '03',
    title: 'Set an alert, buy at the right time',
    body: "We'll notify you when the price drops to where you want it. You come back, you buy.",
  },
]

export function LandingPage() {
  useDocumentTitle('PriceRadar — Is This Amazon Price a Good Deal?')
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  }

  return (
    <>
      <Page className="space-y-10 pt-6">
        {/* Hero */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-5 text-center"
          aria-labelledby="hero-heading"
        >
          <motion.div variants={itemVariants} className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.05] px-3 py-1 text-xs font-medium text-zinc-300">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
              </span>
              <Radar className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              Amazon price intelligence
            </div>
            <h1
              id="hero-heading"
              className="font-display text-4xl md:text-5xl font-bold tracking-tight text-zinc-50 leading-[1.1]"
              style={{ letterSpacing: '-0.02em' }}
            >
              Is this price actually
              <br />
              <span className="text-white">
                a good deal?
              </span>
            </h1>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
              Paste any Amazon link — we'll show full price history and compare retailers instantly.
            </p>
          </motion.div>

          {/* URL input — the primary CTA */}
          <motion.div variants={itemVariants} className="mx-auto max-w-lg">
            <URLSearchInput size="large" autoFocus={false} />
            <p className="mt-2 text-[11px] text-zinc-600 text-center">
              50K+ prices tracked · Updated hourly · Free forever
            </p>
          </motion.div>
        </motion.section>

        {/* Sample product preview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.3 }}
          className="space-y-3"
          aria-label="Sample price check"
        >
          <p className="text-center text-xs font-medium text-zinc-600 uppercase tracking-wider">
            Example
          </p>
          <SampleProductCard />
        </motion.section>

        {/* How it works */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
          aria-labelledby="how-it-works-heading"
        >
          <h2
            id="how-it-works-heading"
            className="text-base font-semibold text-zinc-100 text-center"
          >
            How it works
          </h2>
          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <StepCard key={i} {...step} delay={i * 0.08} active={i === 0} />
            ))}
          </div>
        </motion.section>

        {/* Trust signals */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-white/[0.06] bg-zinc-900/80 backdrop-blur-sm px-5 py-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <IconShield
              className="h-4 w-4 text-emerald-400 shrink-0"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-zinc-100">Designed for smart buyers</p>
          </div>
          <ul className="space-y-2" role="list">
            {[
              'No browser extension required — works on any device',
              'Multi-retailer comparison in one view',
              'Historical high/low signal — not just today\'s price',
              'Free price checks, no account required',
              'Price alert notifications when your target is hit',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-zinc-500">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </motion.section>
      </Page>

      {/* PWA install banner — above bottom nav */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] inset-x-0 z-30">
        <InstallBanner />
      </div>
    </>
  )
}

// ─── Sample product card — static UI illustration (no external data) ──────────
const DEMO_PRICES = [
  { retailer: 'Amazon', slug: 'amazon', price: 279.99, best: true },
  { retailer: 'Best Buy', slug: 'bestbuy', price: 299.99, best: false },
  { retailer: 'Walmart', slug: 'walmart', price: 319.00, best: false },
]

function SampleProductCard() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/80 backdrop-blur-sm p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 shrink-0 rounded-lg border border-white/[0.08] bg-zinc-800/40 flex items-center justify-center">
          <IconTag className="h-7 w-7 text-zinc-600" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs font-medium text-zinc-100 line-clamp-2 leading-snug">
            Sony WH-1000XM5 Headphones
          </p>
          <SignalBadge
            verdict="low"
            label="Price Low"
            subtext="90-day low · 22% below peak"
            size="default"
          />
        </div>
      </div>

      {/* Mini price comparison */}
      <div className="space-y-1.5 border-t border-white/[0.06] pt-3">
        {DEMO_PRICES.map((rp) => (
          <div key={rp.retailer} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RetailerDot />
              <span className="text-xs text-zinc-500">{rp.retailer}</span>
              {rp.best && (
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Best
                </span>
              )}
            </div>
            <span className={cn(
              'price text-sm font-bold',
              rp.best ? 'text-emerald-400' : 'text-zinc-100',
            )}>
              {formatPrice(rp.price)}
            </span>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-zinc-600">
        ↑ This is what you'll see for any product
      </p>
    </div>
  )
}

function RetailerDot() {
  return (
    <div
      className="h-2 w-2 rounded-full bg-zinc-600"
      aria-hidden="true"
    />
  )
}

// ─── Step card ─────────────────────────────────────────────────────────────────
function StepCard({
  icon,
  step,
  title,
  body,
  delay,
  active,
}: {
  icon: React.ReactNode
  step: string
  title: string
  body: string
  delay: number
  active?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28, delay }}
      className="flex items-start gap-3 rounded-xl px-4 py-3.5 border border-white/[0.06] bg-zinc-900/80 backdrop-blur-sm border-l-2 border-l-blue-500/30 hover:border-l-blue-500/60 transition-colors duration-200"
    >
      <div className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
        active
          ? 'bg-blue-500/10 border-blue-500/20'
          : 'bg-white/[0.04] border-white/[0.08]',
      )}>
        <span className={active ? '[&_svg]:text-blue-400' : '[&_svg]:text-zinc-500'}>{icon}</span>
      </div>
      <div className="space-y-0.5">
        <p className="font-display text-sm font-semibold text-zinc-100">{title}</p>
        <p className="text-xs text-zinc-500 leading-relaxed">{body}</p>
      </div>
      <span className="ml-auto shrink-0 font-display text-xs font-bold text-zinc-700">{step}</span>
    </motion.div>
  )
}
