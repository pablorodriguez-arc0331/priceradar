import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Check, X, Sparkles, TrendingDown, LayoutDashboard,
  Zap, Bell, ShieldCheck, HelpCircle, ArrowRight,
} from 'lucide-react'
import { Page } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store'
import { useDocumentTitle } from '@/hooks'
import { cn } from '@/lib/utils'

const FREE_FEATURES = [
  { text: 'Unlimited price checks', included: true },
  { text: 'High / low price signal', included: true },
  { text: 'Retailer price comparison', included: true },
  { text: 'Track up to 3 products', included: true },
  { text: 'Email price alerts', included: true },
  { text: 'Full price history (1 year)', included: false },
  { text: 'Unlimited product tracking', included: false },
  { text: 'Hourly price refresh', included: false },
  { text: 'Push notifications', included: false },
]

const PRO_FEATURES = [
  { icon: Check,          text: 'Everything in Free' },
  { icon: TrendingDown,   text: 'Full price history — up to 1 year' },
  { icon: LayoutDashboard, text: 'Unlimited product tracking' },
  { icon: Zap,            text: 'Hourly price refresh' },
  { icon: Bell,           text: 'Priority email + push alerts' },
  { icon: ShieldCheck,    text: 'Early access to new features' },
]

const FAQS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from Settings at any time. Your Pro access continues until the end of the billing period — no partial-month charges.',
  },
  {
    q: 'Is there a free trial?',
    a: 'The Free plan gives you the core experience with no time limit. Pro is $4.99/month when you\'re ready for the full feature set.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'All major credit and debit cards (Visa, Mastercard, Amex, Discover) via Stripe. Apple Pay and Google Pay are supported on compatible devices.',
  },
  {
    q: 'What happens to my tracked products if I downgrade?',
    a: 'You keep your data. If you have more than 3 tracked products, tracking pauses on the oldest ones until you re-upgrade or remove items.',
  },
  {
    q: 'How accurate are the prices?',
    a: 'Free plan prices are refreshed every few hours. Pro plan prices are refreshed hourly. Prices are sourced directly from retailer listings and may vary slightly from what you see at checkout due to location-based pricing, taxes, or flash promotions.',
  },
  {
    q: 'Do you share my data with advertisers?',
    a: 'Never. We do not sell or share personal data with advertisers. See our Privacy Policy for full details.',
  },
]

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 280, damping: 26, delay: i * 0.06 },
  }),
}

export function PricingPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const isPro = user?.plan === 'paid'
  useDocumentTitle('Pricing — PriceRadar')

  const handleProCTA = () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { returnTo: '/upgrade' } })
    } else {
      navigate('/upgrade')
    }
  }

  return (
    <Page className="space-y-10 pb-10">
      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="text-center space-y-3 pt-4"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Simple, honest pricing
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground leading-tight">
          Know when to buy.<br />
          <span className="text-accent">Always.</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Start free. Upgrade when you need more power.
        </p>
      </motion.div>

      {/* ── Plan cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
        {/* Free */}
        <motion.div
          custom={0}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="glass-card rounded-2xl p-5 space-y-5"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Free</p>
            <div className="mt-1 flex items-end gap-1">
              <span className="font-display text-4xl font-bold text-foreground">$0</span>
              <span className="text-sm text-muted-foreground mb-1">/ forever</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Core price intelligence. No credit card needed.</p>
          </div>

          <Button
            variant="outline"
            fullWidth
            onClick={() => !isAuthenticated ? navigate('/auth') : navigate('/search')}
          >
            {isAuthenticated ? 'You\'re on Free' : 'Get started free'}
          </Button>

          <ul className="space-y-2.5">
            {FREE_FEATURES.map(f => (
              <li key={f.text} className="flex items-center gap-2.5 text-sm">
                {f.included
                  ? <Check className="h-4 w-4 shrink-0 text-signal-low" aria-hidden="true" />
                  : <X className="h-4 w-4 shrink-0 text-muted-foreground/40" aria-hidden="true" />
                }
                <span className={cn(f.included ? 'text-foreground' : 'text-muted-foreground/60')}>{f.text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Pro */}
        <motion.div
          custom={1}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="relative rounded-2xl p-5 space-y-5 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(6,182,212,0.04) 100%)',
            border: '1px solid rgba(6,182,212,0.30)',
            boxShadow: '0 0 32px rgba(6,182,212,0.10)',
          }}
        >
          {/* Badge */}
          <div className="absolute top-3 right-3">
            <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-400 uppercase tracking-wide">
              Popular
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Pro</p>
            <div className="mt-1 flex items-end gap-1">
              <span className="font-display text-4xl font-bold text-foreground">$4.99</span>
              <span className="text-sm text-muted-foreground mb-1">/ month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Full power. Cancel anytime.</p>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={handleProCTA}
            leftIcon={isPro ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          >
            {isPro ? 'Active — Manage subscription' : 'Upgrade to Pro'}
          </Button>

          <ul className="space-y-2.5">
            {PRO_FEATURES.map(f => (
              <li key={f.text} className="flex items-center gap-2.5 text-sm">
                <f.icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span className="text-foreground">{f.text}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ── Guarantee ── */}
      <motion.div
        custom={2}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="glass-card rounded-2xl p-4 flex items-start gap-3"
      >
        <ShieldCheck className="h-5 w-5 shrink-0 text-signal-low mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-foreground">7-day money-back guarantee</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Not happy in your first 7 days? Email us at{' '}
            <a href="mailto:support@price-radar.io" className="text-accent hover:underline">
              support@price-radar.io
            </a>{' '}
            for a full refund, no questions asked. See our{' '}
            <button
              onClick={() => navigate('/refund')}
              className="text-accent hover:underline focus-visible:outline-none"
            >
              Refund Policy
            </button>{' '}
            for details.
          </p>
        </div>
      </motion.div>

      {/* ── FAQ ── */}
      <motion.section
        custom={3}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        aria-labelledby="faq-heading"
        className="space-y-3"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h2 id="faq-heading" className="text-sm font-semibold text-foreground">
            Frequently asked questions
          </h2>
        </div>
        <div className="space-y-2">
          {FAQS.map(faq => (
            <details
              key={faq.q}
              className="glass-card rounded-xl group"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 text-sm font-medium text-foreground select-none list-none">
                {faq.q}
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
                  aria-hidden="true"
                />
              </summary>
              <p className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </motion.section>

      {/* ── Legal footnote ── */}
      <p className="text-center text-[11px] text-muted-foreground/60 leading-relaxed">
        Prices shown are in USD. Subscription renews automatically each month until cancelled.
        By upgrading you agree to our{' '}
        <button onClick={() => navigate('/terms')} className="text-accent/70 hover:text-accent underline-offset-2 hover:underline">
          Terms of Service
        </button>{' '}
        and{' '}
        <button onClick={() => navigate('/privacy')} className="text-accent/70 hover:text-accent underline-offset-2 hover:underline">
          Privacy Policy
        </button>.
        PriceRadar participates in the Amazon Associates affiliate program.
      </p>
    </Page>
  )
}
