export { GlassBackground } from './GlassBackground'
export { ThemeProvider } from './ThemeProvider'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Radar, WifiOff, Download, X, Bell, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { usePWAInstall, useOnlineStatus } from '@/hooks'
import { useTrackedStore, useToast, useAuthStore } from '@/store'

// ─── Empty State ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  variant: 'dashboard' | 'search' | 'no-history' | 'error'
  query?: string
  onAction?: () => void
  className?: string
}

const EMPTY_CONFIGS = {
  dashboard: {
    icon: Search,
    title: "You're not watching anything yet",
    body: "Find a product and add it to your watchlist. We'll track the price and alert you when it drops.",
    cta: 'Find a product',
  },
  search: {
    icon: Search,
    title: 'No results found',
    body: 'Try pasting a direct product URL from Amazon, Walmart, eBay, Best Buy, or Target.',
    cta: null,
  },
  'no-history': {
    icon: Radar,
    title: 'Not enough history yet',
    body: "We don't have enough price data for this product. Track it — we'll build history over time.",
    cta: 'Track this product',
  },
  error: {
    icon: WifiOff,
    title: 'Something went wrong',
    body: "We couldn't load this data. Check your connection and try again.",
    cta: 'Try again',
  },
}

export function EmptyState({ variant, query, onAction, className }: EmptyStateProps) {
  const navigate = useNavigate()
  const config = EMPTY_CONFIGS[variant]
  const Icon = config.icon

  const handleAction = () => {
    if (onAction) { onAction(); return }
    if (variant === 'dashboard') navigate('/search')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-muted/20 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{config.title}</p>
        {query && (
          <p className="text-xs font-medium text-muted-foreground">
            for "<span className="text-foreground">{query}</span>"
          </p>
        )}
        <p className="text-xs text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
          {config.body}
        </p>
      </div>
      {config.cta && (
        <Button size="sm" onClick={handleAction}>
          {config.cta}
        </Button>
      )}
    </motion.div>
  )
}

// ─── Alert Setup Sheet (mobile bottom drawer) ─────────────────────────────────
interface AlertSetupSheetProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  currentPrice: number
  trackedId: string
}

export function AlertSetupSheet({
  isOpen,
  onClose,
  productName,
  currentPrice,
  trackedId,
}: AlertSetupSheetProps) {
  const { updateAlert } = useTrackedStore()
  const { user } = useAuthStore()
  const toast = useToast()
  const [targetPrice, setTargetPrice] = useState(
    String(Math.round(currentPrice * 0.9 * 100) / 100),
  )
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const price = parseFloat(targetPrice)
    if (isNaN(price) || price <= 0) {
      setError('Enter a valid price.')
      return
    }
    if (price >= currentPrice) {
      setError(`Price must be below current $${currentPrice.toFixed(2)}.`)
      return
    }
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 400))
    updateAlert(trackedId, user?.id ?? '', price, true)
    toast('success', 'Alert set', `We'll notify you when price drops below $${price.toFixed(2)}.`)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="alert-overlay"
            className="fixed inset-0 z-40 bg-[rgba(28,28,28,0.40)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            key="alert-sheet"
            className="glass fixed bottom-0 inset-x-0 z-50 rounded-t-2xl px-4 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden="true" />

            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Set price alert</h2>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-[240px]">
                  {productName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close alert sheet"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-muted/40 px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Current price</span>
                <span className="price text-sm font-bold text-foreground">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>

              <Input
                label="Alert me when price drops to"
                type="number"
                step="0.01"
                min="0.01"
                value={targetPrice}
                onChange={e => { setTargetPrice(e.target.value); setError('') }}
                error={error}
                leftIcon={<span className="text-sm font-medium">$</span>}
                hint="We'll email you when this price is reached."
              />

              <div className="flex gap-2">
                <Button variant="outline" fullWidth onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  fullWidth
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  leftIcon={<Bell className="h-4 w-4" />}
                >
                  Set Alert
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Offline Banner ────────────────────────────────────────────────────────────
export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline-banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          className="overflow-hidden"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 bg-[rgba(28,28,28,0.04)] border-b border-[rgba(28,28,28,0.10)] px-4 py-2">
            <Wifi className="h-3.5 w-3.5 text-[#1C1C1C] shrink-0 opacity-50" aria-hidden="true" />
            <p className="text-xs font-medium text-[#1C1C1C]">
              You're offline — showing cached data
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── PWA Install Banner ────────────────────────────────────────────────────────
export function InstallBanner() {
  const { shouldShow, promptInstall, dismissPrompt } = usePWAInstall()

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          key="install-banner"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="mx-4 mb-3 flex items-center gap-3 rounded-xl border border-accent/20 bg-accent-subtle px-4 py-3"
          role="complementary"
          aria-label="Install Price Radar app"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent">
            <Radar className="h-4 w-4 text-[#FFFEFD]" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">Add to Home Screen</p>
            <p className="text-xs text-muted-foreground">Get alerts even when the browser is closed</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button size="sm" onClick={promptInstall} leftIcon={<Download className="h-3.5 w-3.5" />}>
              Install
            </Button>
            <button
              onClick={dismissPrompt}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Dismiss install prompt"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────
export function SectionHeading({
  children,
  action,
  className,
}: {
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <h2 className="text-base font-semibold text-foreground">{children}</h2>
      {action}
    </div>
  )
}
