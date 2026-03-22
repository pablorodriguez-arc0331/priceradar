import { useState } from 'react'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn, formatPrice, formatPriceDelta } from '@/lib/utils'
import type { RetailerPrice } from '@/types'
import { appendAffiliateTag } from '@/lib/affiliate'
import { RetailerSheet } from './RetailerSheet'

// Retailers whose Buy button requires a paid account (DB-sourced rows only)
const GATED_RETAILER_SLUGS = new Set(['walmart', 'bestbuy'])
// Retailers whose Buy button requires at least being signed in (DB-sourced rows only)
const AUTH_GATED_SLUGS = new Set(['target'])

interface PriceComparisonTableProps {
  prices: RetailerPrice[]
  isLoading?: boolean
  isLoadingComparison?: boolean
  isAuthenticated?: boolean
  isPaid?: boolean
  onUpgrade?: () => void
  onSignIn?: () => void
}

export function PriceComparisonTable({
  prices,
  isLoading = false,
  isLoadingComparison = false,
  isAuthenticated = false,
  isPaid = false,
  onUpgrade,
  onSignIn,
}: PriceComparisonTableProps) {
  const [sheet, setSheet] = useState<{ url: string; retailerName: string; price: string } | null>(null)

  const openRetailer = (item: RetailerPrice) => {
    const url = appendAffiliateTag(item.affiliate_url)
    if (item.retailer.slug === 'amazon') {
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }
    setSheet({ url, retailerName: item.retailer.name, price: formatPrice(item.price) })
  }

  if (isLoading) return <PriceTableSkeleton />

  if (prices.length === 0 && !isLoadingComparison) return null

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
          <tr className="border-b border-[var(--glass-border)] bg-[rgba(28,28,28,0.02)]">
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
          {prices.map((item, index) => {
            const isCheapest = index === 0 && prices.length > 1
            const isMostExpensive = index === prices.length - 1 && prices.length > 1
            // All Gemini-sourced rows are locked until user signs in
            const isGeminiLocked = item.source === 'gemini' && !isAuthenticated
            const isBuyLocked = !isGeminiLocked && GATED_RETAILER_SLUGS.has(item.retailer.slug) && (!isAuthenticated || !isPaid)
            const isAuthLocked = !isGeminiLocked && AUTH_GATED_SLUGS.has(item.retailer.slug) && !isAuthenticated
            return (
            <motion.tr
              key={item.retailer.slug}
              variants={rowVariants}
              className={cn(
                'border-b border-[var(--glass-border)] last:border-0',
                'transition-colors',
                item.is_best_price && 'bg-signal-low-bg',
                !item.is_available && 'opacity-40',
              )}
            >
              {/* Retailer */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <RetailerLogo retailer={item.retailer} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium text-foreground">
                        {item.retailer.name}
                      </span>
                      {item.is_best_price && (
                        <span className="rounded-full bg-signal-low-bg px-1.5 py-0.5 text-[10px] font-semibold text-signal-low">
                          Best price
                        </span>
                      )}
                    </div>
                    {item.product_title && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1 max-w-[160px]">
                        {item.product_title}
                      </p>
                    )}
                  </div>
                </div>
              </td>

              {/* Price */}
              <td className="px-4 py-3 text-right">
                {item.is_available ? (
                  <div className="inline-flex flex-col items-end">
                    <span className={cn(
                      'price font-display text-sm font-bold',
                      isCheapest ? 'text-signal-low' : isMostExpensive ? 'text-signal-high' : 'text-foreground',
                    )}>
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
                {item.is_available && item.delta_vs_avg !== undefined ? (
                  <DeltaBadge delta={item.delta_vs_avg} />
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>

              {/* Buy CTA */}
              <td className="px-4 py-3 text-right">
                {isGeminiLocked || isBuyLocked || isAuthLocked ? (
                  <button
                    onClick={!isAuthenticated ? onSignIn : onUpgrade}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-3 py-1.5',
                      'text-xs font-semibold',
                      'bg-muted/60 text-muted-foreground',
                      'border border-border',
                      'transition-colors hover:bg-muted',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      'min-h-[32px]',
                    )}
                    aria-label={!isAuthenticated ? 'Sign in to buy' : 'Upgrade to buy'}
                  >
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    {!isAuthenticated ? 'Sign in' : 'Upgrade'}
                  </button>
                ) : item.is_available ? (
                  <button
                    onClick={() => openRetailer(item)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5',
                      'text-xs font-semibold',
                      'bg-[#0D99FF] text-white hover:bg-[#0088EE]',
                      'transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      'min-h-[32px]',
                    )}
                    aria-label={`Buy on ${item.retailer.name} for ${formatPrice(item.price)}`}
                  >
                    Buy
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
            </motion.tr>
            )
          })}
        </motion.tbody>
      </table>

      {/* Retailer in-app browser sheet */}
      <RetailerSheet
        isOpen={sheet !== null}
        url={sheet?.url ?? ''}
        retailerName={sheet?.retailerName ?? ''}
        price={sheet?.price ?? ''}
        onClose={() => setSheet(null)}
      />

      {/* AI search indicator while Gemini comparison is loading */}
      {isLoadingComparison && (
        <div className="border-t border-[var(--glass-border)] px-4 py-3 space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <svg className="h-3.5 w-3.5 shrink-0 animate-spin text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>AI searching Walmart, Best Buy &amp; Target…</span>
          </div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
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

function RetailerLogo({ retailer }: { retailer: RetailerPrice['retailer'] }) {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold font-display bg-[#F3F4F6] text-[#111827] border border-[#E5E7EB]"
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
      <div className="border-b border-[var(--glass-border)] bg-[rgba(28,28,28,0.02)] px-4 py-3">
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
