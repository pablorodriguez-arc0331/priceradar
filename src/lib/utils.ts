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
  // low = good price = green — deal signal
  low: {
    bg: 'bg-[rgba(22,163,74,0.08)]',
    text: 'text-[#16A34A]',
    border: 'border-[rgba(22,163,74,0.30)]',
    badgeBg: 'bg-[rgba(22,163,74,0.10)] text-[#16A34A] border-[rgba(22,163,74,0.30)]',
  },
  // high = expensive = red — warning signal
  high: {
    bg: 'bg-[rgba(220,38,38,0.08)]',
    text: 'text-[#DC2626]',
    border: 'border-[rgba(220,38,38,0.30)]',
    badgeBg: 'bg-[rgba(220,38,38,0.08)] text-[#DC2626] border-[rgba(220,38,38,0.30)]',
  },
  // neutral = mid-range = gray
  neutral: {
    bg: 'bg-[rgba(107,114,128,0.08)]',
    text: 'text-[#6B7280]',
    border: 'border-[rgba(107,114,128,0.20)]',
    badgeBg: 'bg-[rgba(107,114,128,0.08)] text-[#6B7280] border-[rgba(107,114,128,0.20)]',
  },
  no_data: {
    bg: 'bg-[rgba(107,114,128,0.05)]',
    text: 'text-[#9CA3AF]',
    border: 'border-[rgba(107,114,128,0.15)]',
    badgeBg: 'bg-[rgba(107,114,128,0.05)] text-[#9CA3AF] border-[rgba(107,114,128,0.15)]',
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
