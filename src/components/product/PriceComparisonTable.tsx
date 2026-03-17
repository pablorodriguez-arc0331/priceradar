import { ExternalLink, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn, formatPrice, formatPriceDelta } from '@/lib/utils'
import type { RetailerPrice } from '@/types'
import { appendAffiliateTag } from '@/lib/affiliate'

interface PriceComparisonTableProps {
  prices: RetailerPrice[]
  isLoading?: boolean
}

export function PriceComparisonTable({ prices, isLoading = false }: PriceComparisonTableProps) {
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
      {prices.length === 1 && (
        <p className="border-b border-[var(--glass-border)] bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          This product is currently only available from this retailer
        </p>
      )}
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
          {prices.map((item) => (
            <motion.tr
              key={item.retailer.id}
              variants={rowVariants}
              className={cn(
                'border-b border-[var(--glass-border)] last:border-0',
                'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors',
                item.is_best_price && 'bg-signal-low-bg/30',
                !item.is_available && 'opacity-50',
              )}
            >
              {/* Retailer */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <RetailerLogo retailer={item.retailer} />
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {item.retailer.name}
                    </span>
                    {item.is_best_price && (
                      <span className="ml-2 rounded-full bg-signal-low-bg px-1.5 py-0.5 text-[10px] font-semibold text-signal-low">
                        Best price
                      </span>
                    )}
                    {!item.is_available && (
                      <span className="ml-2 text-xs text-muted-foreground">Out of stock</span>
                    )}
                  </div>
                </div>
              </td>

              {/* Price */}
              <td className="px-4 py-3 text-right">
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
              </td>

              {/* Delta vs avg */}
              <td className="hidden px-4 py-3 text-right sm:table-cell">
                {item.delta_vs_avg !== undefined ? (
                  <DeltaBadge delta={item.delta_vs_avg} />
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>

              {/* Buy CTA */}
              <td className="px-4 py-3 text-right">
                {item.is_available ? (
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
                  <span className="text-xs text-muted-foreground">Unavailable</span>
                )}
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
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

function RetailerLogo({ retailer }: { retailer: RetailerPrice['retailer'] }) {
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
