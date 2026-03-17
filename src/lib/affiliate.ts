/**
 * src/lib/affiliate.ts
 *
 * Amazon Associates affiliate tag utilities.
 * Tag: priceradar05-20
 */

export const AMAZON_AFFILIATE_TAG = 'priceradar05-20'

/**
 * Appends the Amazon Associates tag to any Amazon URL.
 * - Removes any existing `tag` param to prevent duplicates
 * - Preserves all other query params
 * - No-ops on non-Amazon URLs
 *
 * Examples:
 *   https://amazon.com/dp/B09XS7JWHH
 *     → https://amazon.com/dp/B09XS7JWHH?tag=priceradar05-20
 *
 *   https://amazon.com/dp/B09XS7JWHH?ref=sr_1_1&tag=old-tag-20
 *     → https://amazon.com/dp/B09XS7JWHH?ref=sr_1_1&tag=priceradar05-20
 *
 *   https://walmart.com/search?q=headphones
 *     → https://walmart.com/search?q=headphones  (unchanged)
 */
export function appendAffiliateTag(url: string): string {
  try {
    const u = new URL(url)
    if (!u.hostname.includes('amazon.')) return url
    u.searchParams.delete('tag')
    u.searchParams.set('tag', AMAZON_AFFILIATE_TAG)
    return u.toString()
  } catch {
    return url
  }
}

/**
 * Builds a clean Amazon product affiliate URL from an ASIN.
 *
 * Example:
 *   buildAmazonAffiliateUrl('B09XS7JWHH')
 *     → https://www.amazon.com/dp/B09XS7JWHH?tag=priceradar05-20
 */
export function buildAmazonAffiliateUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_AFFILIATE_TAG}`
}
