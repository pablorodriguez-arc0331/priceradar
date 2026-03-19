import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { savePushSubscription, deletePushSubscription, updateProfile } from '@/services/supabase'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

// Detect iOS devices (push only works in standalone/PWA mode on iOS 16.4+)
function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(navigator as unknown as { MSStream?: unknown }).MSStream
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
}

// ─── usePushNotifications ─────────────────────────────────────────────────────

export type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported'

export interface UsePushNotificationsReturn {
  isSupported: boolean
  /** iOS in Safari (not installed as PWA) — push requires Home Screen install */
  needsHomeScreenInstall: boolean
  permission: PushPermission
  isSubscribed: boolean
  isLoading: boolean
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
}

export function usePushNotifications(userId: string | undefined): UsePushNotificationsReturn {
  // iOS requires the app to be installed as a PWA (Home Screen) for push to work.
  // Detect this case separately so the UI can show a helpful hint.
  const needsHomeScreenInstall =
    typeof window !== 'undefined' &&
    isIOS() &&
    !isStandalone() &&
    'serviceWorker' in navigator

  const isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    !!VAPID_PUBLIC_KEY

  const [permission, setPermission] = useState<PushPermission>(
    !isSupported
      ? 'unsupported'
      : (Notification.permission as PushPermission),
  )
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if user already has an active subscription in DB on mount
  useEffect(() => {
    if (!userId || !isSupported || permission !== 'granted') return
    let cancelled = false

    ;(async () => {
      try {
        const registration = await navigator.serviceWorker.ready
        const existing = await registration.pushManager.getSubscription()
        if (!existing || cancelled) return

        // Verify it's also stored in DB (could be out of sync)
        const { data } = await supabase
          .from('push_subscriptions')
          .select('id')
          .eq('user_id', userId)
          .eq('endpoint', existing.endpoint)
          .maybeSingle()

        if (!cancelled) setIsSubscribed(!!data)
      } catch {
        // Ignore — non-critical check
      }
    })()

    return () => { cancelled = true }
  }, [userId, isSupported, permission])

  const subscribe = useCallback(async () => {
    if (!userId || !isSupported || !VAPID_PUBLIC_KEY) return

    setIsLoading(true)
    try {
      // 1. Request notification permission
      const result = await Notification.requestPermission()
      setPermission(result as PushPermission)
      if (result !== 'granted') return

      // 2. Get active SW registration
      const registration = await navigator.serviceWorker.ready

      // 3. Subscribe via Push API
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      })

      const json = subscription.toJSON()
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error('Incomplete subscription data from browser')
      }

      // 4. Save subscription to DB
      await savePushSubscription(userId, {
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        user_agent: navigator.userAgent.slice(0, 255),
      })

      // 5. Mark push_alerts = true in profile
      await updateProfile(userId, { push_alerts: true })

      setIsSubscribed(true)
    } catch (err) {
      console.error('[usePushNotifications] subscribe error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [userId, isSupported])

  const unsubscribe = useCallback(async () => {
    if (!userId || !isSupported) return

    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        await deletePushSubscription(userId, subscription.endpoint)
      }

      // Mark push_alerts = false in profile
      await updateProfile(userId, { push_alerts: false })

      setIsSubscribed(false)
    } catch (err) {
      console.error('[usePushNotifications] unsubscribe error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [userId, isSupported])

  return { isSupported, needsHomeScreenInstall, permission, isSubscribed, isLoading, subscribe, unsubscribe }
}
