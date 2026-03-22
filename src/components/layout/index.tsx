import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Radar } from 'lucide-react'
import { IconSearch, IconUser } from '@/components/ui/Icons'
import { useAuthStore } from '@/store'
import { cn } from '@/lib/utils'
import { useOnlineStatus } from '@/hooks'
import { Button } from '@/components/ui/Button'

// ─── Nav config (shared) ──────────────────────────────────────────────────────
const NAV_TABS = [
  { path: '/', label: 'Home', img: '/assets/house-graphite-thin-full.svg', exactMatch: true },
  { path: '/search', label: 'Search', img: '/assets/magnifying-glass-graphite-thin-full.svg' },
  { path: '/dashboard', label: 'Watchlist', img: '/assets/grid-graphite-thin-full.svg', requiresAuth: true },
  { path: '/settings', label: 'Account', img: '/assets/circle-user-graphite-thin-full.svg' },
]

// ─── Desktop Nav (shown inside Header on md+) ─────────────────────────────────
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
        return (
          <button
            key={tab.path}
            onClick={() => handleClick(tab)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-accent/10 text-accent'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5',
            )}
          >
            <img
              src={tab.img}
              alt=""
              aria-hidden="true"
              className={cn('h-3.5 w-3.5 object-contain', active ? 'opacity-100' : 'opacity-40')}
            />
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
        className="flex shrink-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        aria-label="PriceRadar — Home"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
          <Radar className="h-4 w-4 text-accent" aria-hidden="true" />
        </div>
        <span className="font-display text-base font-bold tracking-tight text-foreground">
          Price<span className="text-accent">Radar</span>
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
              className="flex items-center gap-1 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] px-2 py-1"
              role="status"
              aria-label="You are offline"
            >
              <IconSearch className="h-3 w-3 text-[#6B7280]" aria-hidden="true" />
              <span className="text-xs font-medium text-[#6B7280]">Offline</span>
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
          <IconUser className="h-4 w-4 text-accent" aria-hidden="true" />
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
        height: '80px',
      }}
    >
      {NAV_TABS.map(tab => {
        const active = isActive(tab)

        return (
          <button
            key={tab.path}
            onClick={() => handleTabClick(tab)}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1',
              'min-h-[44px] min-w-[44px]',
              'transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
            )}
            aria-current={active ? 'page' : undefined}
            aria-label={tab.label}
          >
            <img
              src={tab.img}
              alt=""
              aria-hidden="true"
              className={cn(
                'h-6 w-6 object-contain transition-all',
                active ? 'opacity-100 scale-110' : 'opacity-35',
              )}
            />
            <span
              className={cn(
                'text-[11px] font-medium',
                active ? 'text-[#1C1C1C]' : 'text-muted-foreground',
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
      className={cn('px-4 pb-nav pt-4 md:mx-auto md:w-full md:max-w-5xl md:px-8', className)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
    >
      {children}
    </motion.main>
  )
}
