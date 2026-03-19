import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, List, RefreshCw } from 'lucide-react'
import { Page } from '@/components/layout'
import { TrackedProductCard, TrackedProductCardSkeleton } from '@/components/dashboard/TrackedProductCard'
import { EmptyState } from '@/components/common'
import { Button } from '@/components/ui/Button'
import { useAuthStore, useTrackedStore, useUIStore, useToast } from '@/store'
import { useDocumentTitle } from '@/hooks'
import { cn, FREE_TIER_LIMIT } from '@/lib/utils'
import type { PriceVerdict } from '@/types'

const VERDICT_FILTERS: { label: string; value: PriceVerdict | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Price Low', value: 'low' },
  { label: 'Price High', value: 'high' },
  { label: 'Average', value: 'neutral' },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { trackedProducts, isLoading, fetchTracked } = useTrackedStore()
  const { dashboardView, dashboardFilters, setDashboardView, setDashboardFilter } = useUIStore()
  const toast = useToast()
  const [isRefreshing, setIsRefreshing] = useState(false)

  useDocumentTitle('My Watchlist — PriceRadar')
  const isPaid = user?.plan === 'paid'
  const trackingCount = trackedProducts.length
  const atLimit = !isPaid && trackingCount >= FREE_TIER_LIMIT

  useEffect(() => {
    if (user) fetchTracked(user.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleRefresh = async () => {
    if (!user) return
    setIsRefreshing(true)
    await new Promise(r => setTimeout(r, 1200))
    toast('success', 'Prices updated', 'All products refreshed.')
    setIsRefreshing(false)
  }

  // Filter logic
  const filtered = trackedProducts.filter(item => {
    if (dashboardFilters.verdict !== 'all' && item.signal?.verdict !== dashboardFilters.verdict) {
      return false
    }
    if (dashboardFilters.alertEnabled !== null && item.alert_enabled !== dashboardFilters.alertEnabled) {
      return false
    }
    return true
  })

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  }

  return (
    <Page className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">
            {user?.name ? `${user.name}'s Watchlist` : 'My Watchlist'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLoading ? 'Loading…' : `${trackingCount} product${trackingCount !== 1 ? 's' : ''} tracked`}
            {!isPaid && !isLoading && (
              <span className={cn('ml-1', atLimit && 'text-signal-high font-semibold')}>
                · {trackingCount}/{FREE_TIER_LIMIT} free
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            aria-label="Refresh all prices"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
              aria-hidden="true"
            />
          </Button>

          {/* View toggle */}
          <div
            className="glass flex rounded-lg p-0.5"
            role="group"
            aria-label="View layout"
          >
            {(['grid', 'list'] as const).map(view => (
              <button
                key={view}
                onClick={() => setDashboardView(view)}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  dashboardView === view
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                aria-pressed={dashboardView === view}
                aria-label={`${view} view`}
              >
                {view === 'grid'
                  ? <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                  : <List className="h-3.5 w-3.5" aria-hidden="true" />
                }
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade nudge when at limit */}
      <AnimatePresence>
        {atLimit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between rounded-lg border border-accent/20 bg-accent-subtle px-3 py-2.5">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Tracking limit reached.</span>
                {' '}Upgrade for unlimited products.
              </p>
              <Button size="sm" onClick={() => navigate('/upgrade')}>
                Upgrade
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      {trackedProducts.length > 0 && !isLoading && (
        <VerdictFilters
          active={dashboardFilters.verdict}
          onChange={(v) => setDashboardFilter('verdict', v)}
        />
      )}

      {/* Product grid/list */}
      {isLoading ? (
        <div
          className={cn(
            dashboardView === 'grid'
              ? 'grid grid-cols-2 gap-3 sm:grid-cols-3'
              : 'flex flex-col gap-2',
          )}
        >
          {[...Array(4)].map((_, i) => (
            <TrackedProductCardSkeleton key={i} layout={dashboardView} />
          ))}
        </div>
      ) : trackedProducts.length === 0 ? (
        <EmptyState variant="dashboard" />
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No products match this filter.</p>
          <button
            onClick={() => setDashboardFilter('verdict', 'all')}
            className="mt-2 text-xs text-accent underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <motion.div
          key={dashboardView}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            dashboardView === 'grid'
              ? 'grid grid-cols-2 gap-3 sm:grid-cols-3'
              : 'flex flex-col gap-2',
          )}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map(item => (
              <motion.div key={item.id} variants={itemVariants} layout>
                <TrackedProductCard item={item} layout={dashboardView} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add product CTA */}
      {!isLoading && trackedProducts.length > 0 && !atLimit && (
        <Button
          variant="outline"
          fullWidth
          onClick={() => navigate('/search')}
        >
          + Track another product
        </Button>
      )}
    </Page>
  )
}

// ─── Verdict filter chips ──────────────────────────────────────────────────────
function VerdictFilters({
  active,
  onChange,
}: {
  active: PriceVerdict | 'all'
  onChange: (v: PriceVerdict | 'all') => void
}) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide"
      role="group"
      aria-label="Filter by price signal"
    >
      {VERDICT_FILTERS.map(f => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
            'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            active === f.value
              ? 'bg-accent text-[#050D1A] font-semibold border-accent'
              : 'glass-card text-muted-foreground border-transparent hover:border-accent/30 hover:text-foreground',
          )}
          aria-pressed={active === f.value}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
