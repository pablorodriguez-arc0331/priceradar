import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, Minus, HelpCircle } from 'lucide-react'
import { cn, SIGNAL_CONFIG } from '@/lib/utils'
import type { PriceVerdict } from '@/types'

interface SignalBadgeProps {
  verdict: PriceVerdict
  label: string
  subtext?: string
  size?: 'hero' | 'default' | 'inline'
  animated?: boolean
  className?: string
}

const ICONS: Record<PriceVerdict, React.ElementType> = {
  low: TrendingDown,
  high: TrendingUp,
  neutral: Minus,
  no_data: HelpCircle,
}

export function SignalBadge({
  verdict,
  label,
  subtext,
  size = 'default',
  animated = true,
  className,
}: SignalBadgeProps) {
  const config = SIGNAL_CONFIG[verdict]
  const Icon = ICONS[verdict]

  const content = (
    <div
      className={cn(
        'inline-flex flex-col items-center border',
        config.badgeBg,
        size === 'hero' && 'rounded-2xl px-6 py-4 gap-1 shadow-[0_0_32px_rgba(0,0,0,0.40)]',
        size === 'default' && 'rounded-full px-3 py-1.5 flex-row gap-1.5',
        size === 'inline' && 'rounded-full px-2 py-0.5 flex-row gap-1',
        className,
      )}
      role="status"
      aria-label={`Price signal: ${label}${subtext ? `. ${subtext}` : ''}`}
    >
      <span
        className={cn(
          'font-display flex items-center gap-1.5',
          size === 'hero' && 'text-2xl font-bold',
          size === 'default' && 'text-sm font-semibold',
          size === 'inline' && 'text-xs font-medium',
        )}
      >
        <Icon
          className={cn(
            size === 'hero' && 'h-7 w-7',
            size === 'default' && 'h-4 w-4',
            size === 'inline' && 'h-3 w-3',
          )}
          strokeWidth={1.5}
          aria-hidden="true"
        />
        {label}
      </span>

      {subtext && size === 'hero' && (
        <span className="text-xs font-normal opacity-70 text-center">{subtext}</span>
      )}
    </div>
  )

  if (!animated) return content

  return (
    <motion.div
      key={verdict}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {content}
    </motion.div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
export function SignalBadgeSkeleton({ size = 'default' }: { size?: 'hero' | 'default' | 'inline' }) {
  return (
    <div
      className={cn(
        'skeleton',
        size === 'hero' && 'h-[88px] w-48 rounded-2xl',
        size === 'default' && 'h-7 w-24 rounded-full',
        size === 'inline' && 'h-5 w-16 rounded-full',
      )}
    />
  )
}
