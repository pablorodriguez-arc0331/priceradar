/**
 * supabase/functions/send-price-alerts/index.ts
 *
 * Edge Function: sends Web Push notifications to premium users when a
 * tracked product's price changes (both drops and increases).
 *
 * Called from: fetch-prices (fire-and-forget after price upsert)
 * Input: { product_id: string, current_price: number }
 * Access: service role only (not exposed to the frontend)
 *
 * Note: Deno/ESM errors in VS Code are IDE false positives — runs on Deno.
 */

// @ts-ignore Deno ESM import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-ignore npm: specifier supported by Supabase Edge Runtime
import webpush from 'npm:web-push'

declare const Deno: {
  env: { get(key: string): string | undefined }
  serve(handler: (req: Request) => Promise<Response>): void
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Minimum price change (%) that triggers a notification — avoids noise
const MIN_CHANGE_PCT = 1

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json().catch(() => ({}))
    const { product_id, current_price } = body as { product_id?: string; current_price?: number }

    if (!product_id || typeof current_price !== 'number') {
      return jsonError('product_id and current_price are required', 400)
    }

    const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY')
    if (!vapidPublic || !vapidPrivate) {
      console.error('[send-price-alerts] VAPID keys are not configured')
      return jsonError('Push service not configured', 500)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // ── 1. Find the previous Amazon price for this product ────────────────────
    // After fetch-prices inserts the new price (is_current = true), the trigger
    // sets all prior rows for the same product+retailer to is_current = false.
    // The most recent is_current=false row is the previous price.
    const { data: amazonRetailer } = await supabase
      .from('retailers')
      .select('id')
      .eq('slug', 'amazon')
      .single()

    if (!amazonRetailer) return jsonError('Amazon retailer not found', 500)

    const { data: prevPriceRows } = await supabase
      .from('price_points')
      .select('price')
      .eq('product_id', product_id)
      .eq('retailer_id', amazonRetailer.id)
      .eq('is_current', false)
      .order('captured_at', { ascending: false })
      .limit(1)

    const previousPrice = prevPriceRows?.[0]?.price ? Number(prevPriceRows[0].price) : null

    // Skip if there's no previous price (first-time fetch) or no meaningful change
    if (previousPrice === null) {
      console.log(`[send-price-alerts] No previous price for ${product_id} — skipping`)
      return jsonOk({ sent: 0, reason: 'no_previous_price' })
    }

    const changePct = Math.abs((current_price - previousPrice) / previousPrice) * 100
    if (changePct < MIN_CHANGE_PCT) {
      console.log(`[send-price-alerts] Change ${changePct.toFixed(2)}% < threshold — skipping`)
      return jsonOk({ sent: 0, reason: 'no_meaningful_change' })
    }

    const isPriceDrop = current_price < previousPrice

    // ── 2. Get product name ────────────────────────────────────────────────────
    const { data: product } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', product_id)
      .single()

    if (!product) return jsonError('Product not found', 404)

    // ── 3. Find users tracking this product with alerts enabled ───────────────
    // Also fetch alert_target_price so we can check per-user thresholds.
    const { data: trackedRows } = await supabase
      .from('tracked_products')
      .select('id, user_id, alert_target_price')
      .eq('product_id', product_id)
      .eq('alert_enabled', true)

    if (!trackedRows?.length) {
      return jsonOk({ sent: 0, reason: 'no_tracking_users' })
    }

    // Only notify users whose target price has been reached:
    // - If user set a target price: only notify when current_price <= target
    // - If no target price set: notify on any meaningful price drop
    const eligibleTracked = (trackedRows as Array<{ id: string; user_id: string; alert_target_price: number | null }>)
      .filter(row => {
        if (!isPriceDrop) return false // never notify on price increases
        if (row.alert_target_price === null) return true // no target = notify on any drop
        return current_price <= row.alert_target_price
      })

    if (!eligibleTracked.length) {
      console.log(`[send-price-alerts] No users with target price reached for ${product_id}`)
      return jsonOk({ sent: 0, reason: 'target_price_not_reached' })
    }

    const userIds = eligibleTracked.map(r => r.user_id)

    // ── 4. Filter to users with push_alerts enabled ────────────────────────────
    const { data: eligibleProfiles } = await supabase
      .from('profiles')
      .select('id')
      .in('id', userIds)
      .eq('push_alerts', true)

    if (!eligibleProfiles?.length) {
      return jsonOk({ sent: 0, reason: 'no_eligible_users' })
    }

    const eligibleUserIds = eligibleProfiles.map((p: { id: string }) => p.id)

    // ── 5. Fetch push subscriptions for eligible users ────────────────────────
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('user_id, endpoint, p256dh, auth')
      .in('user_id', eligibleUserIds)

    if (!subscriptions?.length) {
      return jsonOk({ sent: 0, reason: 'no_subscriptions' })
    }

    // ── 6. Build notification payload ─────────────────────────────────────────
    const priceDiff = Math.abs(current_price - previousPrice).toFixed(2)
    const productNameShort = product.name.length > 48
      ? product.name.slice(0, 48) + '…'
      : product.name

    const title = isPriceDrop ? '📉 Price Drop!' : '📈 Price Increased'
    const body = isPriceDrop
      ? `${productNameShort} — now $${current_price.toFixed(2)} (↓$${priceDiff})`
      : `${productNameShort} — now $${current_price.toFixed(2)} (↑$${priceDiff})`

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: `price-alert-${product_id}`,
      url: `/product/${product_id}`,
    })

    // ── 7. Configure VAPID and send ────────────────────────────────────────────
    webpush.setVapidDetails(
      'mailto:support@price-radar.io',
      vapidPublic,
      vapidPrivate,
    )

    const results = await Promise.allSettled(
      (subscriptions as Array<{ user_id: string; endpoint: string; p256dh: string; auth: string }>).map(
        (sub) =>
          webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
          ),
      ),
    )

    const sentCount = results.filter((r) => r.status === 'fulfilled').length

    // Log failed sends and clean up expired/invalid subscriptions (HTTP 410/404)
    const staleEndpoints: string[] = []
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        const sub = (subscriptions as Array<{ endpoint: string }>)[i]
        const reason = (r as PromiseRejectedResult).reason
        const statusCode = reason?.statusCode ?? reason?.status ?? 0
        console.warn(
          `[send-price-alerts] Failed to send to ${sub.endpoint.slice(0, 60)}… (status ${statusCode}):`,
          reason,
        )
        // 410 Gone = subscription permanently expired; 404 Not Found = invalid endpoint
        // Remove these from DB so future sends don't waste time on dead subscriptions
        if (statusCode === 410 || statusCode === 404) {
          staleEndpoints.push(sub.endpoint)
        }
      }
    })

    if (staleEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', staleEndpoints)
        .then(({ error }) => {
          if (error) console.warn('[send-price-alerts] Failed to clean stale subscriptions:', error.message)
          else console.log(`[send-price-alerts] Cleaned ${staleEndpoints.length} stale subscription(s)`)
        })
    }

    // ── 8. Record in price_alerts ──────────────────────────────────────────────
    const alertRows = (subscriptions as Array<{ user_id: string }>)
      .filter((sub, i) => results[i].status === 'fulfilled')
      .map((sub) => {
        const tp = eligibleTracked.find(r => r.user_id === sub.user_id)
        return tp
          ? {
              tracked_product_id: tp.id,
              trigger_price: current_price,
              delivery_method: 'push',
              delivered: true,
            }
          : null
      })
      .filter(Boolean)

    if (alertRows.length > 0) {
      await supabase
        .from('price_alerts')
        .insert(alertRows)
        .then(null, (e: Error) =>
          console.warn('[send-price-alerts] price_alerts insert error:', e.message),
        )
    }

    console.log(
      `[send-price-alerts] Sent ${sentCount}/${subscriptions.length} push notifications for product ${product_id}`,
    )

    return jsonOk({ sent: sentCount, total: subscriptions.length, isPriceDrop })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[send-price-alerts] UNHANDLED ERROR:', msg)
    return jsonError('Internal error', 500)
  }
})

function jsonOk(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
