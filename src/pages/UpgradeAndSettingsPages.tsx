import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks'
import {
  Check, Lock, Sparkles, Bell, TrendingDown, LayoutDashboard, Zap,
  User, LogOut, Mail, Shield, ChevronRight, AlertTriangle, Pencil, X,
} from 'lucide-react'
import { Page } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { useAuthStore, useToast } from '@/store'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import type { UsePushNotificationsReturn } from '@/hooks/usePushNotifications'
import { cn } from '@/lib/utils'
import type { AppUser } from '@/types'
import { updateProfile } from '@/services/supabase'

// ────────────────────────────────────────────────────────────────────────────
// Upgrade Page
// ────────────────────────────────────────────────────────────────────────────

const FREE_FEATURES = [
  { text: 'Unlimited price checks', included: true },
  { text: 'High/low price signal', included: true },
  { text: 'Track up to 3 products', included: true },
  { text: 'Price alerts (email)', included: true },
  { text: 'Full price history chart', included: false },
  { text: 'Track unlimited products', included: false },
  { text: 'Faster price refresh', included: false },
]

const PAID_FEATURES = [
  { text: 'Everything in Free', icon: Check },
  { text: 'Full price history — up to 1 year', icon: TrendingDown },
  { text: 'Unlimited product tracking', icon: LayoutDashboard },
  { text: 'Faster price refresh (every hour)', icon: Zap },
  { text: 'Priority email + push alerts', icon: Bell },
]

export function UpgradePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const toast = useToast()

  const reason = (location.state as { reason?: string })?.reason
  useDocumentTitle('Upgrade to PriceRadar Pro — PriceRadar')

  const handleUpgrade = () => {
    // In production: open Stripe checkout
    toast('info', 'Coming soon', 'Stripe checkout will be connected before launch.')
  }

  if (user?.plan === 'paid') {
    return (
      <Page className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-low-bg">
          <Check className="h-6 w-6 text-signal-low" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">You're on the paid plan</p>
          <p className="text-xs text-muted-foreground mt-1">Full price history and unlimited tracking are active.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/settings')}>
          Manage subscription
        </Button>
      </Page>
    )
  }

  return (
    <Page className="space-y-5 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="text-center space-y-2 pt-4"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-subtle px-3 py-1 text-xs font-medium text-accent">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Price Radar Pro
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
          {reason === 'tracking_limit'
            ? "You've reached the free limit"
            : 'See the full price story'}
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          {reason === 'tracking_limit'
            ? 'Upgrade to track unlimited products and never miss a deal.'
            : 'Full price history shows you exactly when to buy — and when to wait.'}
        </p>
      </motion.div>

      {/* Pricing card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.1 }}
        className="rounded-2xl border-2 border-accent bg-card p-5 space-y-4 shadow-md"
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pro</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="price text-3xl font-bold text-foreground">$4.99</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
          </div>
          <div className="rounded-full bg-accent/10 px-2.5 py-1">
            <p className="text-xs font-semibold text-accent">Cancel anytime</p>
          </div>
        </div>

        <ul className="space-y-2.5" role="list">
          {PAID_FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <li key={i} className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal-low-bg">
                  <Icon className="h-3 w-3 text-signal-low" aria-hidden="true" />
                </div>
                <span className="text-sm text-foreground">{f.text}</span>
              </li>
            )
          })}
        </ul>

        <Button fullWidth size="lg" onClick={handleUpgrade} leftIcon={<Lock className="h-4 w-4" />}>
          Unlock Pro — $4.99/mo
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Billed monthly. No contracts. Cancel from settings at any time.
        </p>
      </motion.div>

      {/* Feature comparison */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="space-y-3"
        aria-label="Feature comparison"
      >
        <p className="text-xs font-medium text-muted-foreground text-center uppercase tracking-wide">
          Free vs Pro
        </p>
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-3 border-b border-border bg-muted/40 px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">Feature</p>
            <p className="text-xs font-medium text-muted-foreground text-center">Free</p>
            <p className="text-xs font-medium text-accent text-center">Pro</p>
          </div>
          {FREE_FEATURES.map((f, i) => (
            <div
              key={i}
              className="grid grid-cols-3 items-center px-3 py-2.5 border-b border-border last:border-0"
            >
              <p className="text-xs text-foreground">{f.text}</p>
              <div className="flex justify-center">
                {f.included
                  ? <Check className="h-4 w-4 text-signal-low" aria-label="Included" />
                  : <span className="h-4 w-4 flex items-center justify-center text-muted-foreground text-base leading-none" aria-label="Not included">—</span>
                }
              </div>
              <div className="flex justify-center">
                <Check className="h-4 w-4 text-signal-low" aria-label="Included" />
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Continue free */}
      <div className="text-center">
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Continue with free plan
        </button>
      </div>
    </Page>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Settings Page
// ────────────────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, setUser, signOut, isAuthenticated } = useAuthStore()
  const toast = useToast()
  const push = usePushNotifications(user?.id)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(user?.name ?? '')
  const [savingName, setSavingName] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
  useDocumentTitle('Account Settings — PriceRadar')

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus()
  }, [editingName])

  const handleStartEdit = () => {
    setNameValue(user?.name ?? '')
    setEditingName(true)
  }

  const handleCancelEdit = () => {
    setEditingName(false)
    setNameValue(user?.name ?? '')
  }

  const handleSaveName = async () => {
    const trimmed = nameValue.trim()
    if (!trimmed || trimmed === user?.name) { setEditingName(false); return }
    if (!user) return
    setSavingName(true)
    try {
      await updateProfile(user.id, { name: trimmed })
      setUser({ ...user, name: trimmed })
      toast('success', 'Name updated')
      setEditingName(false)
    } catch {
      toast('error', 'Could not save name', 'Please try again.')
    } finally {
      setSavingName(false)
    }
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveName()
    if (e.key === 'Escape') handleCancelEdit()
  }

  const handleSignOut = async () => {
    await signOut()
    toast('info', 'Signed out')
    navigate('/')
  }

  if (!isAuthenticated) {
    return (
      <Page className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <User className="h-10 w-10 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold text-foreground">No account yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Sign in to manage your watchlist and alerts.
          </p>
        </div>
        <Button onClick={() => navigate('/auth')}>Sign in or sign up</Button>
      </Page>
    )
  }

  return (
    <Page className="space-y-6">
      <h1 className="font-display text-xl font-bold text-foreground">Account</h1>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
      >
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-border">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user?.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent-subtle">
              <User className="h-5 w-5 text-accent" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-1.5">
              <input
                ref={nameInputRef}
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                onKeyDown={handleNameKeyDown}
                disabled={savingName}
                maxLength={60}
                className={cn(
                  'flex-1 min-w-0 rounded-md border border-[rgba(28,28,28,0.28)]',
                  'bg-transparent px-2 py-0.5 text-sm font-semibold text-foreground',
                  'focus:outline-none focus:border-[#1C1C1C]',
                  'disabled:opacity-50',
                )}
                aria-label="Display name"
              />
              <button
                onClick={handleSaveName}
                disabled={savingName || !nameValue.trim()}
                className="shrink-0 rounded-md bg-[#1C1C1C] px-2 py-1 text-[11px] font-semibold text-[#FFFEFD] disabled:opacity-40 hover:bg-[#1C1C1C]/85 transition-colors"
                aria-label="Save name"
              >
                {savingName ? '…' : 'Save'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={savingName}
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-[rgba(28,28,28,0.06)] transition-colors"
                aria-label="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartEdit}
              className="group flex items-center gap-1.5 text-left focus-visible:outline-none"
              aria-label="Edit display name"
            >
              <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
              <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            </button>
          )}
          <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
        </div>

        <div className={cn(
          'rounded-full px-2.5 py-1 text-xs font-semibold shrink-0',
          user?.plan === 'paid'
            ? 'bg-signal-low-bg text-signal-low'
            : 'bg-muted text-muted-foreground',
        )}>
          {user?.plan === 'paid' ? 'Pro' : 'Free'}
        </div>
      </motion.div>

      {/* Settings sections */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Subscription */}
        <SettingsSection title="Subscription">
          {user?.plan === 'free' ? (
            <SettingsRow
              icon={Sparkles}
              label="Upgrade to Pro"
              sublabel="Unlock full price history and unlimited tracking"
              onClick={() => navigate('/upgrade')}
              accent
            />
          ) : (
            <SettingsRow
              icon={Shield}
              label="Manage subscription"
              sublabel="Cancel or update billing"
              onClick={() => toast('info', 'Opens Stripe billing portal')}
            />
          )}
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsRow
            icon={Mail}
            label="Email alerts"
            sublabel={user?.alert_preferences.email_enabled ? 'Enabled' : 'Disabled'}
            onClick={() => toast('info', 'Alert preferences coming soon')}
          />
          <PushNotificationRow
            user={user}
            push={push}
            onUpgrade={() => navigate('/upgrade')}
            onSubscribeSuccess={() => {
              if (user) setUser({ ...user, alert_preferences: { ...user.alert_preferences, push_enabled: true } })
              toast('success', 'Push notifications enabled', 'You\'ll be notified when prices change.')
            }}
            onUnsubscribeSuccess={() => {
              if (user) setUser({ ...user, alert_preferences: { ...user.alert_preferences, push_enabled: false } })
              toast('info', 'Push notifications disabled')
            }}
            onError={() => toast('error', 'Something went wrong', 'Please try again.')}
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account">
          <SettingsRow
            icon={LogOut}
            label="Sign out"
            sublabel="You'll need to sign in again to access your watchlist"
            onClick={handleSignOut}
            danger
          />
        </SettingsSection>
      </motion.div>

      {/* App version */}
      <p className="text-center text-xs text-muted-foreground">
        Price Radar v0.1.0 · Built with ☕️ in Guatemala
      </p>
    </Page>
  )
}

// ─── Push Notification Row ─────────────────────────────────────────────────────

function PushNotificationRow({
  user,
  push,
  onUpgrade,
  onSubscribeSuccess,
  onUnsubscribeSuccess,
  onError,
}: {
  user: AppUser | null
  push: UsePushNotificationsReturn
  onUpgrade: () => void
  onSubscribeSuccess: () => void
  onUnsubscribeSuccess: () => void
  onError: () => void
}) {
  const toast = useToast()
  const isPremium = user?.plan === 'paid'

  const handleClick = async () => {
    if (!isPremium) { onUpgrade(); return }

    if (push.needsHomeScreenInstall) {
      toast('info', 'Add to Home Screen first', 'Tap the Share button, then "Add to Home Screen" to enable push notifications.')
      return
    }

    if (push.permission === 'denied') {
      toast('error', 'Notifications blocked', 'Open your browser settings, find this site, and allow notifications.')
      return
    }

    try {
      if (push.isSubscribed) {
        await push.unsubscribe()
        onUnsubscribeSuccess()
      } else {
        await push.subscribe()
        onSubscribeSuccess()
      }
    } catch {
      onError()
    }
  }

  // Derive sublabel based on state
  let sublabel: string
  let sublabelIcon: React.ReactNode = null

  if (!isPremium) {
    sublabel = 'Pro feature — tap to upgrade'
  } else if (push.needsHomeScreenInstall) {
    sublabel = 'Add to Home Screen to enable'
    sublabelIcon = <AlertTriangle className="h-3 w-3 text-signal-high mr-1 inline" />
  } else if (!push.isSupported) {
    sublabel = 'Not supported in this browser'
  } else if (push.permission === 'denied') {
    sublabel = 'Blocked — update browser settings'
    sublabelIcon = <AlertTriangle className="h-3 w-3 text-signal-high mr-1 inline" />
  } else if (push.isSubscribed) {
    sublabel = 'On — price changes will notify you'
  } else {
    sublabel = push.permission === 'granted' ? 'Off — tap to enable' : 'Tap to enable'
  }

  const Toggle = (
    <div
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200',
        push.isSubscribed ? 'bg-signal-low' : 'bg-muted',
        push.isLoading && 'opacity-50',
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          'block h-4 w-4 rounded-full bg-[#FFFEFD] shadow-sm transition-transform duration-200',
          push.isSubscribed ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </div>
  )

  return (
    <SettingsRow
      icon={Bell}
      label="Push notifications"
      sublabel={sublabel}
      sublabelPrefix={sublabelIcon}
      onClick={handleClick}
      rightElement={isPremium && push.isSupported && !push.needsHomeScreenInstall && push.permission !== 'denied' ? Toggle : undefined}
      disabled={push.isLoading || (!push.isSupported && !push.needsHomeScreenInstall)}
      accent={!isPremium}
    />
  )
}

// ─── Settings helpers ──────────────────────────────────────────────────────────
function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="px-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
      <div className="overflow-hidden rounded-xl border border-border divide-y divide-border">
        {children}
      </div>
    </div>
  )
}

function SettingsRow({
  icon: Icon,
  label,
  sublabel,
  sublabelPrefix,
  onClick,
  accent,
  danger,
  disabled,
  rightElement,
}: {
  icon: React.ElementType
  label: string
  sublabel?: string
  sublabelPrefix?: React.ReactNode
  onClick: () => void
  accent?: boolean
  danger?: boolean
  disabled?: boolean
  rightElement?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 bg-card px-4 py-3 text-left',
        'transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        danger && 'hover:bg-signal-high-bg',
        accent && 'hover:bg-accent-subtle',
        !danger && !accent && 'hover:bg-muted/40',
      )}
    >
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
        danger ? 'bg-signal-high-bg' : accent ? 'bg-accent-subtle' : 'bg-muted/60',
      )}>
        <Icon
          className={cn(
            'h-4 w-4',
            danger ? 'text-signal-high' : accent ? 'text-accent' : 'text-muted-foreground',
          )}
          aria-hidden="true"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium',
          danger ? 'text-signal-high' : accent ? 'text-accent' : 'text-foreground',
        )}>
          {label}
        </p>
        {sublabel && (
          <p className="text-xs text-muted-foreground truncate">
            {sublabelPrefix}{sublabel}
          </p>
        )}
      </div>
      {rightElement ?? <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />}
    </button>
  )
}
