import { useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Clock, Trash2 } from 'lucide-react'
import { Page } from '@/components/layout'
import { URLSearchInput } from '@/components/product/URLSearchInput'
import { SignalBadge } from '@/components/product/SignalBadge'
import { formatPrice } from '@/lib/utils'
import { useRecentProducts, useDocumentTitle } from '@/hooks'
import { ProductImage } from '@/components/product/ProductImage'

const RETAILER_COLORS: Record<string, string> = {
  Amazon: 'bg-[#FF9900]',
  Walmart: 'bg-[#0071CE]',
  eBay: 'bg-[#E53238]',
  'Best Buy': 'bg-[#1D3557]',
  Target: 'bg-[#CC0000]',
}

function getRetailerName(url: string): string {
  if (!url) return 'Other'
  if (url.includes('amazon')) return 'Amazon'
  if (url.includes('walmart')) return 'Walmart'
  if (url.includes('ebay')) return 'eBay'
  if (url.includes('bestbuy')) return 'Best Buy'
  if (url.includes('target.com')) return 'Target'
  return 'Other'
}

// ─── Swipe-to-dismiss row ─────────────────────────────────────────────────────
function SwipeToDismiss({
  children,
  onDismiss,
}: {
  children: React.ReactNode
  onDismiss: () => void
}) {
  const DISMISS_THRESHOLD = -72
  const DELETE_WIDTH = 72
  const x = useMotionValue(0)
  const deleteOpacity = useTransform(x, [0, -DELETE_WIDTH], [0, 1])
  const constraintsRef = useRef(null)

  const handleDragEnd = () => {
    if (x.get() < DISMISS_THRESHOLD / 2) {
      animate(x, DISMISS_THRESHOLD, { type: 'spring', stiffness: 400, damping: 35 })
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 35 })
    }
  }

  const handleDelete = () => {
    animate(x, 0, { type: 'spring', stiffness: 400, damping: 35 })
    onDismiss()
  }

  return (
    <div ref={constraintsRef} className="relative overflow-hidden rounded-xl">
      {/* Delete zone */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-signal-high rounded-r-xl"
        style={{ width: DELETE_WIDTH, opacity: deleteOpacity }}
      >
        <button
          onClick={handleDelete}
          className="flex flex-col items-center gap-1 text-white"
          aria-label="Remove from recently checked"
          type="button"
        >
          <Trash2 className="h-5 w-5" aria-hidden="true" />
          <span className="text-[10px] font-medium">Remove</span>
        </button>
      </motion.div>

      {/* Draggable row */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: DISMISS_THRESHOLD, right: 0 }}
        dragElastic={{ left: 0.1, right: 0.05 }}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="relative z-10"
        whileTap={{ cursor: 'grabbing' }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export function SearchPage() {
  const { data: recentProducts, isLoading: recentLoading, dismiss } = useRecentProducts(6)
  useDocumentTitle('Check a Price — PriceRadar')

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  }

  return (
    <Page className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-foreground">Check a price</h1>
        <p className="text-xs text-muted-foreground">
          Paste an Amazon link to see price history and compare retailers
        </p>
      </div>

      <URLSearchInput size="large" autoFocus />

      {/* Recently checked products from DB */}
      {(recentLoading || recentProducts.length > 0) && (
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          aria-labelledby="recent-heading"
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <h2 id="recent-heading" className="text-sm font-semibold text-foreground">
                Recently checked
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">Swipe left to remove</p>
          </div>

          <div className="space-y-2">
            {recentLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 animate-pulse"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-muted" />
                      <div className="h-2.5 w-1/3 rounded bg-muted" />
                    </div>
                    <div className="h-4 w-14 rounded bg-muted" />
                  </div>
                ))
              : recentProducts.map((product, i) => {
                  const signal = product.price_signals?.[0]
                  const retailer = product.live_retailer ?? getRetailerName(product.source_url ?? '')
                  const retailerColor = RETAILER_COLORS[retailer]

                  // Use live_price from price_points; fall back to signal price; never show $0
                  const displayPrice: number | null =
                    product.live_price ??
                    (signal?.current_best_price > 0 ? Number(signal.current_best_price) : null)

                  return (
                    <motion.div key={product.id} variants={itemVariants}>
                      <SwipeToDismiss onDismiss={() => dismiss(product.id)}>
                        <a
                          href={`/product/${product.id}`}
                          className="glass-card flex items-center gap-3 rounded-xl p-3 hover:brightness-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`${product.name}${signal ? ` — ${signal.label}` : ''}`}
                        >
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/20">
                            <ProductImage
                              src={product.image_url}
                              alt={product.name}
                              category={product.category}
                              className="h-full w-full p-1"
                              iconClassName="h-4 w-4"
                              loading={i === 0 ? 'eager' : 'lazy'}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {/* Retailer badge */}
                              <span className="flex items-center gap-1">
                                {retailerColor && (
                                  <span
                                    className={`inline-block h-1.5 w-1.5 rounded-full ${retailerColor}`}
                                    aria-hidden="true"
                                  />
                                )}
                                <span className="text-xs text-muted-foreground">{retailer}</span>
                              </span>
                              {displayPrice !== null && (
                                <>
                                  <span className="text-muted-foreground/40 text-xs">·</span>
                                  <span className="price text-xs font-medium text-foreground">
                                    {formatPrice(displayPrice)}
                                  </span>
                                </>
                              )}
                              {displayPrice === null && (
                                <>
                                  <span className="text-muted-foreground/40 text-xs">·</span>
                                  <span className="text-xs text-muted-foreground">Price unavailable</span>
                                </>
                              )}
                            </div>
                          </div>
                          {signal && (
                            <SignalBadge
                              verdict={signal.verdict}
                              label={signal.label}
                              size="inline"
                              animated={false}
                            />
                          )}
                        </a>
                      </SwipeToDismiss>
                    </motion.div>
                  )
                })}
          </div>
        </motion.section>
      )}

      {/* How to paste */}
      <div className="glass-card rounded-xl px-4 py-4 space-y-2">
        <p className="text-xs font-semibold text-foreground">
          How to check a price
        </p>
        <ol className="space-y-1.5 list-none">
          {[
            'Find a product on Amazon',
            'Copy the URL from your browser\'s address bar',
            'Paste it above — we\'ll show price history and compare retailers',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 border border-accent/25 font-display text-[10px] font-bold text-accent mt-0.5">
                {i + 1}
              </span>
              <span className="text-xs text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </Page>
  )
}
