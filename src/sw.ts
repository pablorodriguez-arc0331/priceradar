/**
 * src/sw.ts — Custom Service Worker
 *
 * Compiled by vite-plugin-pwa (injectManifest strategy).
 * self.__WB_MANIFEST is replaced at build time with the precache manifest.
 *
 * Responsibilities:
 *  1. Precache the app shell (HTML, JS, CSS, icons)
 *  2. Runtime caching strategies (fonts, images, Supabase data)
 *  3. Push event handler — shows price alert notifications
 *  4. Notification click handler — focuses / opens the app
 */

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

export {}  // Treat this file as an ES module so `declare` below shadows the global

declare const self: ServiceWorkerGlobalScope

// ── Precache app shell ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
precacheAndRoute((self as any).__WB_MANIFEST ?? [])
cleanupOutdatedCaches()

// ── Runtime caching ────────────────────────────────────────────────────────────

// Google Fonts — CacheFirst, 1 year
registerRoute(
  ({ url }) =>
    url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
)

// Product images (Unsplash) — CacheFirst, 30 days
registerRoute(
  ({ url }) => url.hostname === 'images.unsplash.com',
  new CacheFirst({
    cacheName: 'product-images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
)

// Supabase price data — NetworkFirst with 6h cache fallback
registerRoute(
  ({ url }) =>
    /supabase\.co\/rest\/v1\/(products|price_points|price_signals|retailers)/.test(url.href),
  new NetworkFirst({
    cacheName: 'supabase-price-data',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 6 * 60 * 60 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
)

// Supabase auth — never cache
registerRoute(
  ({ url }) => /supabase\.co\/auth\//.test(url.href),
  new NetworkOnly(),
)

// ── Push Notifications ─────────────────────────────────────────────────────────

interface PushPayload {
  title?: string
  body?: string
  url?: string
  icon?: string
  badge?: string
  tag?: string
}

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return

  let payload: PushPayload = {}
  try {
    payload = event.data.json() as PushPayload
  } catch {
    payload = { title: 'Price Alert', body: event.data.text() }
  }

  const options: NotificationOptions = {
    body: payload.body ?? '',
    icon: payload.icon ?? '/icons/icon-192x192.png',
    badge: payload.badge ?? '/icons/icon-72x72.png',
    tag: payload.tag ?? 'price-alert',
    data: { url: payload.url ?? '/' },
    requireInteraction: false,
    // Vibrate on Android (ignored on iOS): short-pause-short pattern
    vibrate: [100, 50, 100],
    // Re-alert even if a notification with the same tag already exists
    renotify: true,
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'Price Radar', options),
  )
})

// ── Notification Click ─────────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  const targetUrl: string = (event.notification.data as { url?: string })?.url ?? '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open in a tab, navigate it and focus
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && 'navigate' in client) {
            return (client as WindowClient).navigate(targetUrl).then((c) => c?.focus())
          }
        }
        // Otherwise open a new tab
        return self.clients.openWindow(targetUrl)
      }),
  )
})
