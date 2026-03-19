import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, LayoutDashboard, User, Radar, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store'
import { useOnlineStatus } from '@/hooks'
import { Button } from '@/components/ui/Button'

// ─── Header ───────────────────────────────────────────────────────────────────
export function Header() {
  const isOnline = useOnlineStatus()

  return (
    <header className="glass sticky top-0 z-40 flex h-14 items-center justify-between px-4">
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <Link
        to="/"
        className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        aria-label="PriceRadar — Home"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 border border-accent/20 glow-cyan">
          <Radar className="h-4 w-4 text-accent" aria-hidden="true" />
        </div>
        <span className="font-display text-base font-bold tracking-tight text-foreground">
          Price<span className="text-accent">Radar</span>
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 rounded-full bg-amber-950/60 border border-amber-700/40 px-2 py-1"
              role="status"
              aria-label="You are offline"
            >
              <WifiOff className="h-3 w-3 text-amber-400" aria-hidden="true" />
              <span className="text-xs font-medium text-amber-400">Offline</span>
            </motion.div>
          )}
        </AnimatePresence>
        <UserMenuButton />
      </div>
    </header>
  )
}

function UserMenuButton() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/auth')}
        className="border-accent/30 text-accent hover:bg-accent/10 hover:border-accent min-h-[36px]"
      >
        Sign in
      </Button>
    )
  }

  return (
    <Link
      to="/settings"
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full overflow-hidden',
        'border border-accent/30 hover:border-accent transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
      aria-label="Account settings"
    >
      {user?.avatar_url ? (
        <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-accent/10">
          <User className="h-4 w-4 text-accent" aria-hidden="true" />
        </div>
      )}
    </Link>
  )
}

// ─── Bottom Navigation ────────────────────────────────────────────────────────
const NAV_TABS = [
  { path: '/', label: 'Home', icon: Home, exactMatch: true },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/dashboard', label: 'Watchlist', icon: LayoutDashboard, requiresAuth: true },
  { path: '/settings', label: 'Account', icon: User },
]

export function BottomNav() {
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const isActive = (tab: typeof NAV_TABS[0]) => {
    if (tab.exactMatch) return location.pathname === tab.path
    return location.pathname.startsWith(tab.path)
  }

  const handleTabClick = (tab: typeof NAV_TABS[0]) => {
    if (tab.requiresAuth && !isAuthenticated) {
      navigate('/auth', { state: { returnTo: tab.path } })
      return
    }
    navigate(tab.path)
  }

  return (
    <nav
      className="glass fixed bottom-0 inset-x-0 z-40 flex pb-safe"
      aria-label="Main navigation"
      style={{ height: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {NAV_TABS.map(tab => {
        const active = isActive(tab)
        const Icon = tab.icon

        return (
          <button
            key={tab.path}
            onClick={() => handleTabClick(tab)}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1',
              'min-h-[44px] min-w-[44px]',
              'transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
              active ? 'text-accent' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-current={active ? 'page' : undefined}
            aria-label={tab.label}
          >
            <div className="relative">
              <Icon
                className={cn('h-5 w-5 transition-transform', active && 'scale-110')}
                aria-hidden="true"
              />
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-accent"
                  style={{ boxShadow: '0 0 8px rgba(6, 182, 212, 0.8)' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </div>
            <span
              className={cn(
                'text-[10px] font-medium',
                active ? 'text-accent' : 'text-muted-foreground',
              )}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
interface PageProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export function Page({ children, className, id = 'main-content' }: PageProps) {
  return (
    <motion.main
      id={id}
      className={cn('px-4 pb-nav pt-4', className)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
    >
      {children}
    </motion.main>
  )
}
