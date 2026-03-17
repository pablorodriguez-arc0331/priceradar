/**
 * src/components/product/ProductImage.tsx
 *
 * Renders a product image with a category-based icon fallback.
 * Handles: null src, load errors, and unsupported URLs gracefully.
 */

import { useState } from 'react'
import {
  Laptop,
  Smartphone,
  Home,
  Shirt,
  Sparkles,
  Dumbbell,
  Package,
  Utensils,
  BookOpen,
  Car,
  Gamepad2,
  Baby,
  Music,
  Camera,
  Watch,
  Tv,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Category → Icon mapping ──────────────────────────────────────────────────

const CATEGORY_MAP: Array<[string[], React.ElementType]> = [
  [['tv', 'television', 'monitor', 'display', 'oled', 'qled'], Tv],
  [['laptop', 'computer', 'pc', 'mac', 'notebook', 'tablet', 'ipad'], Laptop],
  [['phone', 'smartphone', 'iphone', 'android', 'mobile'], Smartphone],
  [['camera', 'photo', 'photography', 'lens'], Camera],
  [['headphone', 'earphone', 'earbud', 'speaker', 'audio', 'sound'], Music],
  [['watch', 'smartwatch', 'wearable', 'fitness tracker'], Watch],
  [['game', 'gaming', 'console', 'playstation', 'xbox', 'nintendo'], Gamepad2],
  [['electronics', 'tech', 'device', 'gadget'], Laptop],
  [['home', 'kitchen', 'garden', 'furniture', 'appliance'], Home],
  [['food', 'cooking', 'cookware', 'instant pot', 'air fryer'], Utensils],
  [['clothing', 'fashion', 'apparel', 'shirt', 'shoe', 'dress', 'jacket'], Shirt],
  [['beauty', 'skincare', 'makeup', 'cosmetic', 'hair', 'perfume'], Sparkles],
  [['health', 'wellness', 'vitamin', 'supplement', 'medical'], Sparkles],
  [['sport', 'fitness', 'gym', 'exercise', 'outdoor', 'yoga', 'dumbbell'], Dumbbell],
  [['book', 'textbook', 'novel', 'magazine', 'reading'], BookOpen],
  [['car', 'automotive', 'vehicle', 'auto', 'tire', 'motor'], Car],
  [['baby', 'infant', 'toddler', 'kids', 'toy', 'children'], Baby],
]

function getCategoryIcon(category: string | null | undefined): React.ElementType {
  if (!category) return Package
  const normalized = category.toLowerCase()
  for (const [keywords, Icon] of CATEGORY_MAP) {
    if (keywords.some(k => normalized.includes(k))) return Icon
  }
  return Package
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ProductImageProps {
  /** Raw image URL from API or DB. Null/undefined triggers icon fallback immediately. */
  src: string | null | undefined
  alt: string
  category?: string | null
  /** Class applied to both the img and the fallback container */
  className?: string
  /** Class for the icon inside the fallback container */
  iconClassName?: string
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
}

export function ProductImage({
  src,
  alt,
  category,
  className,
  iconClassName,
  loading = 'lazy',
  fetchPriority,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false)
  const Icon = getCategoryIcon(category)

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted/30',
          className,
        )}
        aria-label={alt}
        role="img"
      >
        <Icon
          className={cn('text-muted-foreground/40', iconClassName ?? 'h-8 w-8')}
          aria-hidden="true"
        />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn('object-contain', className)}
      loading={loading}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(fetchPriority ? { fetchPriority } as any : {})}
      onError={() => setHasError(true)}
    />
  )
}
