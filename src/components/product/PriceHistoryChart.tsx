import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts'
import { Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { usePriceHistory } from '@/hooks'
import type { ProductWithPricing, PriceHistoryRange } from '@/types'

interface PriceHistoryChartProps {
  product: ProductWithPricing
  isPaid: boolean
}

const RANGES: { label: string; value: PriceHistoryRange }[] = [
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '180D', value: '180d' },
  { label: '1Y', value: '365d' },
]

export function PriceHistoryChart({ product, isPaid }: PriceHistoryChartProps) {
  const [range, setRange] = useState<PriceHistoryRange>('90d')
  const navigate = useNavigate()
  const history = usePriceHistory(product, range)

  const low = product.signal.historical_low
  const high = product.signal.historical_high
  // Format for Recharts
  const chartData = history.map(p => ({
    date: p.date,
    price: p.price,
    label: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  // X-axis tick reduction: show ~6 labels regardless of range
  const tickInterval = Math.max(1, Math.floor(chartData.length / 6))

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Price History</h2>
        {isPaid && (
          <RangeSelector active={range} onChange={setRange} />
        )}
      </div>

      {/* Empty state — no history data */}
      {isPaid && chartData.length === 0 && (
        <div className="flex h-[220px] items-center justify-center rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">No historical data available for this product.</p>
        </div>
      )}

      {/* Chart container */}
      {(!isPaid || chartData.length > 0) && (
      <div className="relative rounded-xl border border-border overflow-hidden bg-card">
        {/* Chart — always rendered (blurred for non-paid) */}
        <div
          className={cn(
            'transition-all duration-300',
            !isPaid && 'blur-[6px] pointer-events-none select-none',
          )}
          aria-hidden={!isPaid}
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(214 32% 91%)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                interval={tickInterval}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={48}
                domain={[
                  (dataMin: number) => Math.floor(dataMin * 0.95),
                  (dataMax: number) => Math.ceil(dataMax * 1.05),
                ]}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Historical low reference line */}
              <ReferenceLine
                y={low}
                stroke="#16A34A"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: 'Low', position: 'right', fill: '#16A34A', fontSize: 10 }}
              />

              {/* Historical high reference line */}
              <ReferenceLine
                y={high}
                stroke="#DC2626"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: 'High', position: 'right', fill: '#DC2626', fontSize: 10 }}
              />

              {/* Main price line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563EB"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Paywall overlay */}
        {!isPaid && (
          <PaywallOverlay onUpgrade={() => navigate('/upgrade')} />
        )}
      </div>
      )}

      {/* Legend — paid only */}
      {isPaid && (
        <div className="flex items-center gap-4 px-1">
          <LegendItem color="#2563EB" label="Price" />
          <LegendItem color="#16A34A" label={`Low · ${formatPrice(low)}`} dashed />
          <LegendItem color="#DC2626" label={`High · ${formatPrice(high)}`} dashed />
        </div>
      )}
    </div>
  )
}

// ─── Custom tooltip ────────────────────────────────────────────────────────────
interface TooltipData {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}
function CustomTooltip({ active, payload, label }: TooltipData) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="price text-sm font-bold text-foreground">
        {formatPrice(payload[0].value)}
      </p>
    </div>
  )
}

// ─── Range selector ────────────────────────────────────────────────────────────
function RangeSelector({
  active,
  onChange,
}: {
  active: PriceHistoryRange
  onChange: (r: PriceHistoryRange) => void
}) {
  return (
    <div
      className="flex rounded-lg border border-border bg-muted/40 p-0.5 gap-0.5"
      role="group"
      aria-label="Price history range"
    >
      {RANGES.map(r => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={cn(
            'relative rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            active === r.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
          aria-pressed={active === r.value}
        >
          {active === r.value && (
            <motion.span
              layoutId="range-indicator"
              className="absolute inset-0 rounded-md bg-background shadow-sm"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          <span className="relative z-10">{r.label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Paywall overlay ───────────────────────────────────────────────────────────
function PaywallOverlay({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-[2px]"
      aria-label="Price history chart — upgrade to view full data"
    >
      <div className="flex flex-col items-center gap-2 text-center px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted border border-border">
          <Lock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-foreground">See the full price story</p>
        <p className="text-xs text-muted-foreground max-w-[200px]">
          Full price history shows you exactly when to buy
        </p>
      </div>
      <Button size="sm" onClick={onUpgrade}>
        Unlock for $4.99/mo
      </Button>
      <button
        onClick={onUpgrade}
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        See what's included
      </button>
    </motion.div>
  )
}

// ─── Legend item ───────────────────────────────────────────────────────────────
function LegendItem({
  color,
  label,
  dashed = false,
}: {
  color: string
  label: string
  dashed?: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      <svg width="16" height="2" aria-hidden="true">
        {dashed ? (
          <line
            x1="0" y1="1" x2="16" y2="1"
            stroke={color}
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        ) : (
          <line x1="0" y1="1" x2="16" y2="1" stroke={color} strokeWidth="2" />
        )}
      </svg>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
export function PriceHistoryChartSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 w-28" />
        <div className="skeleton h-7 w-36 rounded-lg" />
      </div>
      <div className="skeleton h-[220px] w-full rounded-xl" />
    </div>
  )
}
