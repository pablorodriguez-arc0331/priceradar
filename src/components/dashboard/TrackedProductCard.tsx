import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { BellOff } from 'lucide-react'
import { IconArrowRight, IconBell, IconTrash, IconClock } from '@/components/ui/Icons'
import { cn, formatPrice, formatRelativeTime } from '@/lib/utils'
import { SignalBadge } from '@/components/product/SignalBadge'
import { ProductImage } from '@/components/product/ProductImage'
import { useTrackedStore, useToast } from '@/store'
import type { TrackedProduct } from '@/types'

interface TrackedProductCardProps {
  item: TrackedProduct
  layout?: 'grid' | 'list'
}

// ─── Price display helper — never shows $0.00 ─────────────────────────────────
function PriceDisplay({
  price,
  className,
}: {
  price: number
  className?: string
}) {
  if (!price || price <= 0) {
    return <span className={cn('text-zinc-500', className)}>Unavailable</span>
  }
  return <span className={className}>{formatPrice(price)}</span>
}

export function TrackedProductCard({ item, layout = 'grid' }: TrackedProductCardProps) {
  const navigate = useNavigate()
  const { removeTracked, addTracked, updateAlert } = useTrackedStore()
  const toast = useToast()
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRemoving(true)
    await new Promise(r => setTimeout(r, 200))
    // Snapshot before removal so undo can restore it
    const snapshot = { ...item }
    try {
      await removeTracked(item.id, item.user_id)
      toast(
        'info',
        'Removed from watchlist',
        item.product.name,
        {
          label: 'Undo',
          onClick: () => addTracked(snapshot.user_id, snapshot).catch(() => {
            toast('error', 'Could not restore product', 'Please add it again manually.')
          }),
        },
      )
    } catch {
      setIsRemoving(false)
      toast('error', 'Could not remove product', 'Tap to retry.', {
        label: 'Retry',
        onClick: () => handleRemove({ stopPropagation: () => {} } as React.MouseEvent),
      })
    }
  }

  const handleAlertToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateAlert(item.id, item.user_id, item.alert_target_price, !item.alert_enabled)
    toast(
      'info',
      item.alert_enabled ? 'Alert paused' : 'Alert active',
      item.alert_enabled ? 'You won\'t be notified about this product.' : 'We\'ll notify you when the price drops.',
    )
  }

  const handleCardClick = () => navigate(`/product/${item.product_id}`)

  if (layout === 'list') {
    return (
      <SwipeToDelete onDelete={handleRemove} disabled={isRemoving}>
        <ListCard
          item={item}
          isRemoving={isRemoving}
          onRemove={handleRemove}
          onAlertToggle={handleAlertToggle}
          onClick={handleCardClick}
        />
      </SwipeToDelete>
    )
  }

  return (
    <GridCard
      item={item}
      isRemoving={isRemoving}
      onRemove={handleRemove}
      onAlertToggle={handleAlertToggle}
      onClick={handleCardClick}
    />
  )
}

// ─── Swipe-to-Delete wrapper (list layout only) ────────────────────────────────
function SwipeToDelete({
  children,
  onDelete,
  disabled,
}: {
  children: React.ReactNode
  onDelete: (e: React.MouseEvent) => void
  disabled?: boolean
}) {
  const DELETE_THRESHOLD = -72
  const DELETE_WIDTH = 72

  const x = useMotionValue(0)
  const constraintsRef = useRef(null)

  const deleteOpacity = useTransform(x, [0, -DELETE_WIDTH], [0, 1])

  const handleDragEnd = () => {
    const current = x.get()
    if (current < DELETE_THRESHOLD / 2) {
      animate(x, DELETE_THRESHOLD, { type: 'spring', stiffness: 400, damping: 35 })
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 35 })
    }
  }

  const handleClose = () => {
    animate(x, 0, { type: 'spring', stiffness: 400, damping: 35 })
  }

  return (
    <div ref={constraintsRef} className="relative overflow-hidden rounded-xl">
      {/* Delete button revealed beneath */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-red-500/10 border-l border-red-500/20"
        style={{ width: DELETE_WIDTH, opacity: deleteOpacity }}
      >
        <button
          onClick={(e) => { handleClose(); onDelete(e) }}
          disabled={disabled}
          className="flex flex-col items-center gap-1 text-red-400"
          aria-label="Delete from watchlist"
          type="button"
        >
          <IconTrash className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-medium">Delete</span>
        </button>
      </motion.div>

      {/* Draggable content */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: DELETE_THRESHOLD, right: 0 }}
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

// ─── Grid Card ────────────────────────────────────────────────────────────────
function GridCard({ item, isRemoving, onRemove, onAlertToggle, onClick }: CardInternalProps) {
  return (
    <motion.article
      layout
      animate={{ opacity: isRemoving ? 0 : 1, scale: isRemoving ? 0.95 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        'group relative flex flex-col rounded-xl overflow-hidden border border-white/[0.06] bg-zinc-900/80 backdrop-blur-sm',
        'cursor-pointer transition-all duration-200 hover:border-white/[0.12] hover:shadow-[0_0_24px_-4px_rgba(255,255,255,0.08)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
        'overflow-hidden',
      )}
      role="article"
      aria-label={`${item.product.name} — ${item.signal.label}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Product image */}
      <div className="relative h-32 w-full overflow-hidden bg-zinc-800/40">
        <ProductImage
          src={item.product.image_url}
          alt={item.product.name}
          category={item.product.category}
          className="h-full w-full object-cover"
          iconClassName="h-10 w-10"
          loading="lazy"
        />
        {/* Signal badge — top right */}
        <div className="absolute right-2 top-2">
          <SignalBadge
            verdict={item.signal.verdict}
            label={item.signal.label}
            size="inline"
            animated={false}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-xs font-medium text-zinc-100 leading-snug">
          {item.product.name}
        </p>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <PriceDisplay
              price={item.current_price}
              className="price text-lg font-bold text-zinc-100"
            />
            <p className="text-xs text-zinc-500">
              {item.current_retailer || 'Unknown retailer'}
            </p>
          </div>
          {item.alert_target_price && (
            <p className="text-right text-xs text-zinc-500">
              Alert at<br />
              <span className="price font-semibold text-zinc-100">
                {formatPrice(item.alert_target_price)}
              </span>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-2">
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <IconClock className="h-3 w-3" aria-hidden="true" />
            {formatRelativeTime(item.last_checked_at)}
          </span>
          <div className="flex items-center gap-1">
            <CardAction
              icon={item.alert_enabled ? IconBell : BellOff}
              label={item.alert_enabled ? 'Pause alert' : 'Enable alert'}
              onClick={onAlertToggle}
              active={item.alert_enabled}
            />
            <CardAction
              icon={IconTrash}
              label="Remove from watchlist"
              onClick={onRemove}
              danger
            />
          </div>
        </div>
      </div>
    </motion.article>
  )
}

// ─── List Card ────────────────────────────────────────────────────────────────
function ListCard({ item, isRemoving, onAlertToggle, onClick }: CardInternalProps) {
  return (
    <motion.article
      layout
      animate={{ opacity: isRemoving ? 0 : 1, x: isRemoving ? -20 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl p-3 border border-white/[0.06] bg-zinc-900/80 backdrop-blur-sm',
        'cursor-pointer transition-all duration-200 hover:border-white/[0.12] hover:shadow-[0_0_24px_-4px_rgba(255,255,255,0.08)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
      )}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Thumbnail */}
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/[0.06] bg-zinc-800/40">
        <ProductImage
          src={item.product.image_url}
          alt={item.product.name}
          category={item.product.category}
          className="h-full w-full object-cover"
          iconClassName="h-5 w-5"
          loading="lazy"
        />
      </div>

      {/* Main info */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p className="truncate text-sm font-medium text-zinc-100">
          {item.product.name}
        </p>
        <div className="flex items-center gap-2">
          <SignalBadge
            verdict={item.signal.verdict}
            label={item.signal.label}
            size="inline"
            animated={false}
          />
          <span className="text-xs text-zinc-500">
            {formatRelativeTime(item.last_checked_at)}
          </span>
        </div>
      </div>

      {/* Price + actions */}
      <div className="flex shrink-0 items-center gap-2">
        <div className="text-right">
          <PriceDisplay
            price={item.current_price}
            className="price text-sm font-bold text-zinc-100"
          />
          <p className="text-xs text-zinc-500">
            {item.current_retailer || 'Unknown'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <CardAction
            icon={item.alert_enabled ? IconBell : BellOff}
            label={item.alert_enabled ? 'Pause alert' : 'Enable alert'}
            onClick={onAlertToggle}
            active={item.alert_enabled}
          />
        </div>
        <IconArrowRight className="h-4 w-4 text-zinc-500" aria-hidden="true" />
      </div>
    </motion.article>
  )
}

// ─── Card action button ────────────────────────────────────────────────────────
function CardAction({
  icon: Icon,
  label,
  onClick,
  active,
  danger,
}: {
  icon: React.ElementType
  label: string
  onClick: (e: React.MouseEvent) => void
  active?: boolean
  danger?: boolean
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
        danger && 'text-zinc-500 hover:bg-red-500/10 hover:text-red-400',
        active && !danger && 'text-blue-400 hover:bg-blue-500/10',
        !active && !danger && 'text-zinc-500 hover:bg-muted hover:text-zinc-100',
      )}
      aria-label={label}
      type="button"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </motion.button>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const skeletonContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
const skeletonItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 28 } },
}

export function TrackedProductCardSkeleton({ layout = 'grid' }: { layout?: 'grid' | 'list' }) {
  if (layout === 'list') {
    return (
      <motion.div
        variants={skeletonItem}
        className="flex items-center gap-3 rounded-xl p-3 border border-white/[0.06] bg-zinc-900/80"
      >
        <div className="skeleton h-12 w-12 rounded-lg shrink-0" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-5 w-24 rounded-full" />
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="skeleton h-5 w-16" />
          <div className="skeleton h-3 w-12" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={skeletonItem}
      className="flex flex-col rounded-xl overflow-hidden border border-white/[0.06] bg-zinc-900/80"
    >
      <div className="skeleton h-32 w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-3 w-2/3" />
        <div className="flex justify-between items-end mt-1">
          <div className="skeleton h-7 w-20" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
      </div>
    </motion.div>
  )
}

export { skeletonContainer, skeletonItem }

// ─── Internal types ───────────────────────────────────────────────────────────
interface CardInternalProps {
  item: TrackedProduct
  isRemoving: boolean
  onRemove: (e: React.MouseEvent) => void
  onAlertToggle: (e: React.MouseEvent) => void
  onClick: () => void
}
