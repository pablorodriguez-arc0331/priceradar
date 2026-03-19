import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faBell, faBellSlash, faTrashCan, faClock } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from '@/components/ui/FaIcon'
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
    return <span className={cn('text-muted-foreground', className)}>Unavailable</span>
  }
  return <span className={className}>{formatPrice(price)}</span>
}

export function TrackedProductCard({ item, layout = 'grid' }: TrackedProductCardProps) {
  const navigate = useNavigate()
  const { removeTracked, updateAlert } = useTrackedStore()
  const toast = useToast()
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRemoving(true)
    await new Promise(r => setTimeout(r, 200))
    try {
      await removeTracked(item.id, item.user_id)
      toast('success', 'Removed from watchlist', item.product.name)
    } catch {
      setIsRemoving(false)
      toast('error', 'Could not remove product', 'Please try again.')
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
  const DELETE_THRESHOLD = -72   // px — how far left to drag to reveal
  const DELETE_WIDTH = 72        // px — width of the revealed delete zone

  const x = useMotionValue(0)
  const constraintsRef = useRef(null)

  // Opacity of delete button fades in as user drags left
  const deleteOpacity = useTransform(x, [0, -DELETE_WIDTH], [0, 1])

  const handleDragEnd = () => {
    const current = x.get()
    if (current < DELETE_THRESHOLD / 2) {
      // Snap open to reveal delete
      animate(x, DELETE_THRESHOLD, { type: 'spring', stiffness: 400, damping: 35 })
    } else {
      // Snap closed
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
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-signal-high"
        style={{ width: DELETE_WIDTH, opacity: deleteOpacity }}
      >
        <button
          onClick={(e) => { handleClose(); onDelete(e) }}
          disabled={disabled}
          className="flex flex-col items-center gap-1 text-white"
          aria-label="Delete from watchlist"
          type="button"
        >
          <FaIcon icon={faTrashCan} className="h-5 w-5" aria-hidden="true" />
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
        'glass-card group relative flex flex-col rounded-xl',
        'cursor-pointer hover:brightness-105 transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'overflow-hidden',
      )}
      role="article"
      aria-label={`${item.product.name} — ${item.signal.label}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Product image */}
      <div className="relative h-32 w-full overflow-hidden bg-muted/30">
        <ProductImage
          src={item.product.image_url}
          alt={item.product.name}
          category={item.product.category}
          className="h-full w-full p-3"
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
        <p className="line-clamp-2 text-xs font-medium text-foreground leading-snug">
          {item.product.name}
        </p>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <PriceDisplay
              price={item.current_price}
              className="price text-lg font-bold text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              {item.current_retailer || 'Unknown retailer'}
            </p>
          </div>
          {item.alert_target_price && (
            <p className="text-right text-xs text-muted-foreground">
              Alert at<br />
              <span className="price font-semibold text-foreground">
                {formatPrice(item.alert_target_price)}
              </span>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <FaIcon icon={faClock} className="h-3 w-3" aria-hidden="true" />
            {formatRelativeTime(item.last_checked_at)}
          </span>
          <div className="flex items-center gap-1">
            <CardAction
              icon={item.alert_enabled ? faBell : faBellSlash}
              label={item.alert_enabled ? 'Pause alert' : 'Enable alert'}
              onClick={onAlertToggle}
              active={item.alert_enabled}
            />
            <CardAction
              icon={faTrashCan}
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
        'glass-card flex items-center gap-3 rounded-xl p-3',
        'cursor-pointer hover:brightness-105 transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Thumbnail */}
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30">
        <ProductImage
          src={item.product.image_url}
          alt={item.product.name}
          category={item.product.category}
          className="h-full w-full p-1"
          iconClassName="h-5 w-5"
          loading="lazy"
        />
      </div>

      {/* Main info */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {item.product.name}
        </p>
        <div className="flex items-center gap-2">
          <SignalBadge
            verdict={item.signal.verdict}
            label={item.signal.label}
            size="inline"
            animated={false}
          />
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(item.last_checked_at)}
          </span>
        </div>
      </div>

      {/* Price + actions */}
      <div className="flex shrink-0 items-center gap-2">
        <div className="text-right">
          <PriceDisplay
            price={item.current_price}
            className="price text-sm font-bold text-foreground"
          />
          <p className="text-xs text-muted-foreground">
            {item.current_retailer || 'Unknown'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <CardAction
            icon={item.alert_enabled ? faBell : faBellSlash}
            label={item.alert_enabled ? 'Pause alert' : 'Enable alert'}
            onClick={onAlertToggle}
            active={item.alert_enabled}
          />
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
    </motion.article>
  )
}

// ─── Card action button ────────────────────────────────────────────────────────
function CardAction({
  icon,
  label,
  onClick,
  active,
  danger,
}: {
  icon: IconDefinition
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
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        danger && 'text-muted-foreground hover:bg-signal-high-bg hover:text-signal-high',
        active && !danger && 'text-accent hover:bg-accent-subtle',
        !active && !danger && 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      aria-label={label}
      type="button"
    >
      <FaIcon icon={icon} className="h-3.5 w-3.5" aria-hidden="true" />
    </motion.button>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function TrackedProductCardSkeleton({ layout = 'grid' }: { layout?: 'grid' | 'list' }) {
  if (layout === 'list') {
    return (
      <div className="glass-card flex items-center gap-3 rounded-xl p-3">
        <div className="skeleton h-12 w-12 rounded-lg shrink-0" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-5 w-24 rounded-full" />
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="skeleton h-5 w-16" />
          <div className="skeleton h-3 w-12" />
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card flex flex-col rounded-xl overflow-hidden">
      <div className="skeleton h-32 w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-3 w-2/3" />
        <div className="flex justify-between items-end mt-1">
          <div className="skeleton h-7 w-20" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// ─── Internal types ───────────────────────────────────────────────────────────
interface CardInternalProps {
  item: TrackedProduct
  isRemoving: boolean
  onRemove: (e: React.MouseEvent) => void
  onAlertToggle: (e: React.MouseEvent) => void
  onClick: () => void
}
