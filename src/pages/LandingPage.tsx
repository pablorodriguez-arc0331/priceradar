import { motion } from 'framer-motion'
import { ArrowRight, Bell, TrendingDown, Radar, Package } from 'lucide-react'
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from '@/components/ui/FaIcon'
import { URLSearchInput } from '@/components/product/URLSearchInput'
import { SignalBadge } from '@/components/product/SignalBadge'
import { Page } from '@/components/layout'
import { InstallBanner } from '@/components/common'
import { cn, formatPrice } from '@/lib/utils'
import { useDocumentTitle } from '@/hooks'

const STEPS = [
  {
    icon: ArrowRight,
    step: '01',
    title: 'Paste an Amazon product link',
    body: 'Copy any Amazon product URL and paste it here. No extension needed.',
  },
  {
    icon: TrendingDown,
    step: '02',
    title: 'Get the verdict instantly',
    body: "We compare the current price to its history and tell you: is this a good deal right now?",
  },
  {
    icon: Bell,
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
            <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              <Radar className="h-3.5 w-3.5" aria-hidden="true" />
              Amazon price intelligence
            </div>
            <h1
              id="hero-heading"
              className="font-display text-4xl font-bold tracking-tight text-foreground leading-tight"
            >
              Is this price actually
              <br />
              <span className="text-accent">a good deal?</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Paste an Amazon link and we'll show you the full price history and compare it against Walmart and Best Buy — so you always know if now is the right time to buy.
            </p>
          </motion.div>

          {/* URL input — the primary CTA */}
          <motion.div variants={itemVariants} className="mx-auto max-w-lg">
            <URLSearchInput size="large" autoFocus={false} />
            <p className="mt-2 text-xs text-muted-foreground">
              No account needed to check prices
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
          <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
            className="text-base font-semibold text-foreground text-center"
          >
            How it works
          </h2>
          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <StepCard key={i} {...step} delay={i * 0.08} />
            ))}
          </div>
        </motion.section>

        {/* Trust signals */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-xl px-5 py-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <FaIcon icon={faShieldHalved} className="h-4 w-4 text-signal-low shrink-0" aria-hidden="true" />
            <p className="text-sm font-semibold text-foreground">Designed for smart buyers</p>
          </div>
          <ul className="space-y-2" role="list">
            {[
              'No browser extension required — works on any device',
              'Multi-retailer comparison in one view',
              'Historical high/low signal — not just today\'s price',
              'Free price checks, no account required',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
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
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 shrink-0 rounded-lg border border-border bg-muted/20 flex items-center justify-center">
          <Package className="h-7 w-7 text-muted-foreground/40" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
            Wireless Noise-Canceling Headphones
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
      <div className="space-y-1.5 border-t border-border pt-3">
        {DEMO_PRICES.map((rp) => (
          <div key={rp.retailer} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RetailerDot slug={rp.slug} />
              <span className="text-xs text-muted-foreground">{rp.retailer}</span>
              {rp.best && (
                <span className="rounded-full bg-signal-low-bg px-1.5 py-0.5 text-[10px] font-semibold text-signal-low">
                  Best
                </span>
              )}
            </div>
            <span className={cn(
              'price text-xs font-bold',
              rp.best ? 'text-signal-low' : 'text-foreground',
            )}>
              {formatPrice(rp.price)}
            </span>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        ↑ This is what you'll see for any product you search
      </p>
    </div>
  )
}

function RetailerDot({ slug }: { slug: string }) {
  const COLORS: Record<string, string> = {
    amazon: 'bg-[#FF9900]',
    walmart: 'bg-[#0071CE]',
    bestbuy: 'bg-[#1D3557]',
  }
  return (
    <div
      className={cn('h-2 w-2 rounded-full', COLORS[slug] ?? 'bg-muted-foreground')}
      aria-hidden="true"
    />
  )
}

// ─── Step card ─────────────────────────────────────────────────────────────────
function StepCard({
  icon: Icon,
  step,
  title,
  body,
  delay,
}: {
  icon: React.ElementType
  step: string
  title: string
  body: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28, delay }}
      className="glass-card flex items-start gap-3 rounded-xl px-4 py-3.5 border-l-2 border-l-accent/30"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
        <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
      </div>
      <div className="space-y-0.5">
        <p className="font-display text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
      </div>
      <span className="ml-auto shrink-0 font-display text-xs font-bold text-accent/40">{step}</span>
    </motion.div>
  )
}
