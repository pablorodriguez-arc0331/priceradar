import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BellOff, ChevronLeft } from 'lucide-react'
import { IconBell, IconClock, IconShare } from '@/components/ui/Icons'
import { Page } from '@/components/layout'
import { SignalBadge, SignalBadgeSkeleton } from '@/components/product/SignalBadge'
import { ProductImage } from '@/components/product/ProductImage'
import { PriceComparisonTable } from '@/components/product/PriceComparisonTable'
import { PriceHistoryChart, PriceHistoryChartSkeleton } from '@/components/product/PriceHistoryChart'
import { AlertSetupSheet, EmptyState } from '@/components/common'
import { Button } from '@/components/ui/Button'
import { useProduct, useDocumentTitle } from '@/hooks'
import { recordSearchHistory } from '@/services/supabase'
import { useAuthStore, useTrackedStore, useToast } from '@/store'
import { formatPrice, formatRelativeTime, isAtTrackingLimit, FREE_TIER_LIMIT } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function ProductResultPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, error, isLoadingComparison } = useProduct(id)
  const { user, isAuthenticated } = useAuthStore()
  const { trackedProducts, fetchTracked, addTracked, removeTracked } = useTrackedStore()
  const toast = useToast()

  // Ensure tracked products are loaded when user is authenticated
  // (they may not be if the user navigated directly to this page)
  useEffect(() => {
    if (user && trackedProducts.length === 0) {
      fetchTracked(user.id)
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Record this product view in personal history
  useEffect(() => {
    if (!product || !id) return

    if (isAuthenticated && user) {
      // Fire-and-forget — don't block the UI
      recordSearchHistory(user.id, id).catch(() => {})
    } else {
      // Anonymous: upsert into localStorage
      try {
        const key = 'price-radar-history'
        const raw = localStorage.getItem(key)
        const arr: Array<{ productId: string; checkedAt: string }> = raw ? JSON.parse(raw) : []
        const filtered = arr.filter(e => e.productId !== id)
        filtered.unshift({ productId: id, checkedAt: new Date().toISOString() })
        localStorage.setItem(key, JSON.stringify(filtered.slice(0, 20)))
      } catch { /* ignore storage errors */ }
    }
  }, [product?.id, isAuthenticated, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const [alertSheetOpen, setAlertSheetOpen] = useState(false)
  const [isTracking, setIsTracking] = useState(false)

  const isPaid = user?.plan === 'paid'
  const existingTracked = trackedProducts.find(t => t.product_id === id)
  const isTracked = !!existingTracked
  const atLimit = isAtTrackingLimit(user?.tracked_count ?? 0, user?.plan ?? 'free')
  useDocumentTitle(product ? `${product.name} — Price History & Comparison | PriceRadar` : 'PriceRadar')

  const handleTrack = async () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { returnTo: `/product/${id}` } })
      return
    }
    if (atLimit && !isTracked) {
      navigate('/upgrade', { state: { reason: 'tracking_limit' } })
      return
    }
    if (!product) return

    setIsTracking(true)
    try {
      if (isTracked) {
        await removeTracked(existingTracked.id, user!.id)
        toast('info', 'Removed from watchlist')
      } else {
        await addTracked(user!.id, {
          id: `t_${Date.now()}`,
          user_id: user!.id,
          product_id: product.id,
          product,
          signal: product.signal,
          current_price: product.signal.current_best_price,
          current_retailer: product.signal.current_best_retailer,
          alert_enabled: false,
          alert_status: 'active',
          added_at: new Date().toISOString(),
          last_checked_at: new Date().toISOString(),
        })
        toast('success', 'Added to watchlist', 'Set an alert to get notified when the price drops.')
      }
    } catch (err) {
      toast('error', 'Something went wrong', err instanceof Error ? err.message : 'Please try again.')
    }
    setIsTracking(false)
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: product?.name, url })
    } else {
      await navigator.clipboard.writeText(url)
      toast('success', 'Link copied', 'Share this price check with anyone.')
    }
  }

  if (error) {
    return (
      <Page>
        <EmptyState variant="error" onAction={() => navigate(-1)} className="mt-8" />
      </Page>
    )
  }

  return (
    <>
      <Page className="space-y-5 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className={cn(
            'flex items-center gap-1 text-sm text-muted-foreground',
            'hover:text-foreground transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded',
            '-ml-1 py-1 pl-1',
          )}
          aria-label="Go back"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        {/* Product header */}
        {isLoading ? <ProductHeaderSkeleton /> : product ? <ProductHeader product={product} /> : null}

        {/* Signal hero */}
        <section aria-label="Price signal" className="flex flex-col items-center gap-3 py-2">
          {isLoading
            ? <SignalBadgeSkeleton size="hero" />
            : product
              ? (
                <>
                  <SignalBadge
                    verdict={product.signal.verdict}
                    label={product.signal.label}
                    subtext={product.signal.subtext}
                    size="hero"
                  />
                  <div className="text-center">
                    <p className="price font-display text-4xl font-bold text-foreground">
                      {formatPrice(product.signal.current_best_price)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Best price · {product.signal.current_best_retailer}
                    </p>
                  </div>
                </>
              )
              : null
          }
        </section>

        {/* CTAs */}
        {product && (
          <div className="flex gap-2">
            <Button
              variant={isTracked ? 'outline' : 'primary'}
              fullWidth
              onClick={handleTrack}
              loading={isTracking}
              leftIcon={isTracked
                ? <BellOff className="h-4 w-4" />
                : <IconBell className="h-4 w-4" />
              }
            >
              {isTracked ? 'Remove from watchlist' : 'Track this product'}
            </Button>

            {isTracked && (
              <Button
                variant="outline"
                size="default"
                onClick={() => setAlertSheetOpen(true)}
                aria-label="Set price alert"
              >
                <IconBell className="h-4 w-4" />
              </Button>
            )}

            <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share this price check">
              <IconShare className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Guest nudge */}
        {!isAuthenticated && product && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between rounded-lg border border-accent/20 bg-accent-subtle px-3 py-2.5"
          >
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Free account</span>
              {' '}— track this and get price alerts
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/auth', { state: { returnTo: `/product/${id}` } })}
            >
              Sign up free
            </Button>
          </motion.div>
        )}

        {/* Tracking limit nudge */}
        {isAuthenticated && atLimit && !isTracked && product && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">
              Tracking <span className="font-semibold text-foreground">{FREE_TIER_LIMIT}/{FREE_TIER_LIMIT}</span> products
            </p>
            <Button size="sm" onClick={() => navigate('/upgrade')}>Upgrade</Button>
          </div>
        )}

        {/* Price comparison table */}
        <section aria-labelledby="prices-heading" className="space-y-3">
          <h2 id="prices-heading" className="text-base font-semibold text-foreground">
            Prices right now
          </h2>
          <PriceComparisonTable
            prices={product?.retailer_prices ?? []}
            isLoading={isLoading}
            isLoadingComparison={isLoadingComparison}
            isAuthenticated={isAuthenticated}
            isPaid={isPaid}
            onSignIn={() => navigate('/auth', { state: { returnTo: `/product/${id}` } })}
            onUpgrade={() => navigate('/upgrade', { state: { reason: 'comparison' } })}
          />
        </section>

        {/* Price history chart */}
        <section aria-labelledby="history-heading">
          {isLoading
            ? <PriceHistoryChartSkeleton />
            : product
              ? <PriceHistoryChart product={product} isPaid={isPaid} />
              : null
          }
        </section>

        {/* Stats grid */}
        {product && !isLoading && <StatsGrid signal={product.signal} />}
      </Page>

      {/* Alert sheet — rendered outside Page to escape z-index stack */}
      {existingTracked && product && (
        <AlertSetupSheet
          isOpen={alertSheetOpen}
          onClose={() => setAlertSheetOpen(false)}
          productName={product.name}
          currentPrice={product.signal.current_best_price}
          trackedId={existingTracked.id}
        />
      )}
    </>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ProductHeader({ product }: { product: { name: string; image_url?: string; category?: string; signal: { last_checked_at: string } } }) {
  return (
    <div className="flex items-start gap-3">
      <div className="glass h-16 w-16 shrink-0 overflow-hidden rounded-xl">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          category={product.category}
          className="h-full w-full p-2"
          iconClassName="h-7 w-7"
          loading="eager"
          fetchpriority="high"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
          {product.category ?? 'Product'}
        </p>
        <h1 className="font-display text-base font-semibold text-foreground leading-snug line-clamp-3">
          {product.name}
        </h1>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <IconClock className="h-3 w-3" aria-hidden="true" />
          Updated {formatRelativeTime(product.signal.last_checked_at)}
        </p>
      </div>
    </div>
  )
}

function StatsGrid({ signal }: {
  signal: {
    historical_low: number
    historical_high: number
    current_best_price: number
    percentile: number
    reference_range_days: number
  }
}) {
  const savings = signal.historical_high - signal.current_best_price
  const savingsPct = Math.round((savings / signal.historical_high) * 100)

  const stats = [
    { label: `${signal.reference_range_days}d Low`, value: formatPrice(signal.historical_low) },
    { label: `${signal.reference_range_days}d High`, value: formatPrice(signal.historical_high) },
    { label: 'vs. High', value: savings > 0 ? `-${savingsPct}%` : '—', highlight: savings > 0 },
    { label: 'Price rank', value: `${signal.percentile}th%` },
  ]

  return (
    <section aria-label="Price statistics">
      <div className="grid grid-cols-4 gap-2">
        {stats.map(stat => (
          <div key={stat.label} className="glass-card flex flex-col items-center rounded-xl px-2 py-3.5 text-center">
            <p className={cn('price font-display text-sm font-bold', stat.highlight ? 'text-signal-low' : 'text-foreground')}>
              {stat.value}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground font-sans">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProductHeaderSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <div className="skeleton h-16 w-16 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-24" />
      </div>
    </div>
  )
}
