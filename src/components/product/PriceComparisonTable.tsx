import { ExternalLink, TrendingDown, TrendingUp, Minus, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn, formatPrice, formatPriceDelta } from '@/lib/utils'
import type { RetailerPrice } from '@/types'
import { appendAffiliateTag } from '@/lib/affiliate'

interface PriceComparisonTableProps {
  prices: RetailerPrice[]
  isLoading?: boolean
  isPaid?: boolean
  onUpgrade?: () => void
}

// Retailers that require a premium subscription to compare
const PREMIUM_RETAILER_SLUGS = new Set(['walmart', 'bestbuy'])

export function PriceComparisonTable({ prices, isLoading = false, isPaid = false, onUpgrade }: PriceComparisonTableProps) {
  if (isLoading) return <PriceTableSkeleton />

  if (prices.length === 0) return null

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  }
  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  }

  return (
    <div className="glass overflow-hidden rounded-xl">
      <table className="w-full" role="table">
        <caption className="sr-only">Current prices across retailers</caption>
        <thead>
          <tr className="border-b border-[var(--glass-border)] bg-black/[0.03] dark:bg-white/[0.03]">
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
              Retailer
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
              Price
            </th>
            <th scope="col" className="hidden px-4 py-3 text-right text-xs font-medium text-muted-foreground sm:table-cell">
              vs Avg
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
              <span className="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <motion.tbody
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {prices.map((item) => {
            const isPremiumLocked = !isPaid && PREMIUM_RETAILER_SLUGS.has(item.retailer.slug)

            return (
              <motion.tr
                key={item.retailer.slug}
                variants={rowVariants}
                className={cn(
                  'border-b border-[var(--glass-border)] last:border-0',
                  'transition-colors',
                  item.is_best_price && !isPremiumLocked && 'bg-signal-low-bg/30',
                  !item.is_available && !isPremiumLocked && 'opacity-40',
                  isPremiumLocked && 'bg-muted/20',
                )}
              >
                {/* Retailer */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <RetailerLogo retailer={item.retailer} dimmed={isPremiumLocked} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={cn('text-sm font-medium', isPremiumLocked ? 'text-muted-foreground' : 'text-foreground')}>
                          {item.retailer.name}
                        </span>
                        {item.is_best_price && !isPremiumLocked && (
                          <span className="rounded-full bg-signal-low-bg px-1.5 py-0.5 text-[10px] font-semibold text-signal-low">
                            Best price
                          </span>
                        )}
                        {isPremiumLocked && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                            Premium
                          </span>
                        )}
                      </div>
                      {!isPremiumLocked && item.product_title && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1 max-w-[160px]">
                          {item.product_title}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="px-4 py-3 text-right">
                  {isPremiumLocked ? (
                    <span className="inline-block h-4 w-14 rounded bg-muted/60 blur-sm select-none" aria-hidden="true" />
                  ) : item.is_available ? (
                    <div className="inline-flex flex-col items-end">
                      <span className="price text-sm font-bold text-foreground">
                        {formatPrice(item.price)}
                      </span>
                      {item.original_price && item.original_price > item.price && (
                        <span className="price text-xs text-muted-foreground line-through">
                          {formatPrice(item.original_price)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Not found</span>
                  )}
                </td>

                {/* Delta vs avg */}
                <td className="hidden px-4 py-3 text-right sm:table-cell">
                  {!isPremiumLocked && item.is_available && item.delta_vs_avg !== undefined ? (
                    <DeltaBadge delta={item.delta_vs_avg} />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>

                {/* Buy CTA */}
                <td className="px-4 py-3 text-right">
                  {isPremiumLocked ? (
                    <button
                      onClick={onUpgrade}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md px-3 py-1.5',
                        'text-xs font-semibold',
                        'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400',
                        'border border-amber-300/40 dark:border-amber-700/40',
                        'transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        'min-h-[32px]',
                      )}
                      aria-label={`Upgrade to see ${item.retailer.name} price`}
                    >
                      <Lock className="h-3 w-3" aria-hidden="true" />
                      Unlock
                    </button>
                  ) : item.is_available ? (
                    <a
                      href={appendAffiliateTag(item.affiliate_url)}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5',
                        'text-xs font-semibold',
                        'bg-accent text-white hover:bg-accent-hover',
                        'transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        'min-h-[32px]',
                      )}
                      aria-label={`Buy on ${item.retailer.name} for ${formatPrice(item.price)} — opens in new tab`}
                    >
                      Buy
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </motion.tr>
            )
          })}
        </motion.tbody>
      </table>

      {/* Premium upsell banner — shown when at least one retailer is locked */}
      {!isPaid && prices.some(p => PREMIUM_RETAILER_SLUGS.has(p.retailer.slug)) && (
        <div className="border-t border-[var(--glass-border)] bg-amber-50/50 dark:bg-amber-950/10 px-4 py-2.5 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            <Lock className="inline h-3 w-3 mr-1 text-amber-600" aria-hidden="true" />
            <span className="font-medium text-foreground">Upgrade</span> to compare prices across all retailers
          </p>
          <button
            onClick={onUpgrade}
            className="shrink-0 rounded-md bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            See plans
          </button>
        </div>
      )}
    </div>
  )
}

function DeltaBadge({ delta }: { delta: number }) {
  const isNegative = delta < 0  // negative delta = price dropped = good
  const isZero = Math.abs(delta) < 2

  const Icon = isZero ? Minus : isNegative ? TrendingDown : TrendingUp
  const color = isZero
    ? 'text-signal-neutral'
    : isNegative
    ? 'text-signal-low'
    : 'text-signal-high'

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', color)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {isZero ? 'Avg' : formatPriceDelta(delta)}
    </span>
  )
}

function RetailerLogo({ retailer, dimmed = false }: { retailer: RetailerPrice['retailer']; dimmed?: boolean }) {
  const COLORS: Record<string, string> = {
    amazon: 'bg-[#FF9900]',
    walmart: 'bg-[#0071CE]',
    ebay: 'bg-[#E53238]',
    bestbuy: 'bg-[#1D3557]',
    target: 'bg-[#CC0000]',
  }

  return (
    <div
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white text-[10px] font-bold',
        COLORS[retailer.slug] ?? 'bg-muted',
        dimmed && 'opacity-40 grayscale',
      )}
      aria-hidden="true"
    >
      {retailer.name.charAt(0)}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PriceTableSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-xl">
      <div className="border-b border-[var(--glass-border)] bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
        <div className="skeleton h-4 w-32" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between border-b border-[var(--glass-border)] px-4 py-3 last:border-0">
          <div className="flex items-center gap-2">
            <div className="skeleton h-7 w-7 rounded-md" />
            <div className="skeleton h-4 w-20" />
          </div>
          <div className="skeleton h-5 w-16" />
          <div className="hidden skeleton h-4 w-10 sm:block" />
          <div className="skeleton h-7 w-12 rounded-md" />
        </div>
      ))}
    </div>
  )
}
