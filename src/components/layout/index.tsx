import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Radar, Home, Search, LayoutDashboard, User, WifiOff } from 'lucide-react'
import { IconUser } from '@/components/ui/Icons'
import { useAuthStore } from '@/store'
import { cn } from '@/lib/utils'
import { useOnlineStatus } from '@/hooks'
import { Button } from '@/components/ui/Button'

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_TABS = [
  { path: '/', label: 'Home', icon: Home, exactMatch: true },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/dashboard', label: 'Watchlist', icon: LayoutDashboard, requiresAuth: true },
  { path: '/settings', label: 'Account', icon: User },
]

// ─── Desktop Nav ──────────────────────────────────────────────────────────────
function DesktopNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const isActive = (tab: typeof NAV_TABS[0]) => {
    if (tab.exactMatch) return location.pathname === tab.path
    return location.pathname.startsWith(tab.path)
  }

  const handleClick = (tab: typeof NAV_TABS[0]) => {
    if (tab.requiresAuth && !isAuthenticated) {
      navigate('/auth', { state: { returnTo: tab.path } })
      return
    }
    navigate(tab.path)
  }

  return (
    <nav className="hidden md:flex items-center gap-1" aria-label="Desktop navigation">
      {NAV_TABS.map(tab => {
        const active = isActive(tab)
        const Icon = tab.icon
        return (
          <button
            key={tab.path}
            onClick={() => handleClick(tab)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
              active
                ? 'bg-white/[0.08] text-zinc-50'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]',
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────
export function Header() {
  const isOnline = useOnlineStatus()

  return (
    <header
      className="glass sticky top-0 z-40 flex items-center justify-between gap-4"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75em)',
        paddingRight: '1em',
        paddingBottom: '0.75em',
        paddingLeft: '1em',
      }}
    >
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <Link
        to="/"
        className="flex shrink-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-md"
        aria-label="PriceRadar — Home"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 glow-cyan">
          <Radar className="h-4 w-4 text-blue-400" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <span className="font-display text-base font-bold tracking-tight text-zinc-50">
          Price<span className="text-blue-400">Radar</span>
        </span>
      </Link>

      <DesktopNav />

      <div className="flex items-center gap-2">
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex items-center gap-1 rounded-full bg-white/[0.06] border border-white/[0.08] px-2 py-1"
              role="status"
              aria-label="You are offline"
            >
              <WifiOff className="h-3 w-3 text-zinc-400" strokeWidth={1.5} aria-hidden="true" />
              <span className="text-xs font-medium text-zinc-400">Offline</span>
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
        className="min-h-[36px]"
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
        'border border-white/[0.08] hover:border-white/[0.18] transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
      )}
      aria-label="Account settings"
    >
      {user?.avatar_url ? (
        <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-zinc-800">
          <IconUser className="h-4 w-4 text-zinc-400" aria-hidden="true" />
        </div>
      )}
    </Link>
  )
}

// ─── Bottom Navigation ────────────────────────────────────────────────────────
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
      className="liquid-glass-nav fixed left-4 right-4 z-40 flex md:hidden"
      aria-label="Main navigation"
      style={{
        bottom: 0,
        marginBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        height: '72px',
      }}
    >
      {NAV_TABS.map(tab => {
        const active = isActive(tab)
        const Icon = tab.icon

        return (
          <motion.button
            key={tab.path}
            onClick={() => handleTabClick(tab)}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1',
              'min-h-[44px] min-w-[44px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset',
            )}
            aria-current={active ? 'page' : undefined}
            aria-label={tab.label}
          >
            {active && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute top-2 h-0.5 w-5 rounded-full bg-blue-400"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Icon
              className={cn(
                'h-5 w-5 transition-all',
                active ? 'text-zinc-50' : 'text-zinc-500',
              )}
              strokeWidth={active ? 2 : 1.5}
              aria-hidden="true"
            />
            <span
              className={cn(
                'text-[10px] font-medium transition-colors',
                active ? 'text-zinc-50' : 'text-zinc-500',
              )}
            >
              {tab.label}
            </span>
          </motion.button>
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
      className={cn('px-4 pb-nav pt-4 md:mx-auto md:w-full md:max-w-5xl md:px-8', className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      {children}
    </motion.main>
  )
}
