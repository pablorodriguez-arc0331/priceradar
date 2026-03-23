import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { PriceVerdict } from '@/types'

// ─── Class merger ─────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Price formatting ─────────────────────────────────────────────────────────
export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

export function formatPriceDelta(delta: number): string {
  const abs = Math.abs(delta)
  const sign = delta < 0 ? '−' : '+'
  return `${sign}${abs.toFixed(0)}%`
}

// ─── Signal config ────────────────────────────────────────────────────────────
export const SIGNAL_CONFIG: Record<
  PriceVerdict,
  { bg: string; text: string; border: string; badgeBg: string }
> = {
  // low = good price = emerald — visually positive
  low: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/25',
    badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  // high = expensive = red — warning
  high: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/25',
    badgeBg: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  // neutral = mid-range = zinc
  neutral: {
    bg: 'bg-zinc-800/60',
    text: 'text-zinc-400',
    border: 'border-zinc-700/50',
    badgeBg: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50',
  },
  no_data: {
    bg: 'bg-zinc-900/40',
    text: 'text-zinc-500',
    border: 'border-zinc-800/50',
    badgeBg: 'bg-zinc-900/40 text-zinc-500 border-zinc-800/50',
  },
}

// ─── Date formatting ──────────────────────────────────────────────────────────
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ─── URL validation (Amazon-only) ─────────────────────────────────────────────

const AMAZON_SHORT_LINK_HOSTS = new Set(['a.co', 'amzn.com', 'amzn.to', 'amzn.eu', 'amzn.asia'])

export function isValidAmazonUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname.includes('amazon.') || AMAZON_SHORT_LINK_HOSTS.has(parsed.hostname)
  } catch {
    return false
  }
}

// Keep alias so callers that use isValidProductUrl still compile
export const isValidProductUrl = isValidAmazonUrl

export function extractAsinFromUrl(url: string): string | null {
  // All short-link domains must be resolved server-side — no ASIN in the URL
  try { if (AMAZON_SHORT_LINK_HOSTS.has(new URL(url).hostname)) return null } catch { /* fall through */ }
  const pathMatch = url.match(
    /\/(?:dp|gp\/product|gp\/aw\/d|product-reviews|ask\/questions\/asin)\/([A-Z0-9]{10})/
  )
  if (pathMatch) return pathMatch[1]
  const paramMatch = url.match(/[?&]asin=([A-Z0-9]{10})/)
  if (paramMatch) return paramMatch[1]
  return null
}

export function detectRetailerFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('amazon')) return 'amazon'
    return null
  } catch {
    return null
  }
}

// ─── Free tier limits ─────────────────────────────────────────────────────────
export const FREE_TIER_LIMIT = 3

export function isAtTrackingLimit(count: number, plan: string): boolean {
  return plan === 'free' && count >= FREE_TIER_LIMIT
}

// ─── Generate fake product ID for mock routing ────────────────────────────────
export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
