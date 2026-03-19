import { useEffect, lazy, Suspense, Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Header, BottomNav } from '@/components/layout'
import { ToastContainer } from '@/components/ui/Toast'
import { OfflineBanner, GlassBackground } from '@/components/common'
import { useAuthStore } from '@/store'

// Lazy-loaded pages
const LandingPage = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })))
const SearchPage = lazy(() => import('@/pages/SearchPage').then(m => ({ default: m.SearchPage })))
const ProductResultPage = lazy(() => import('@/pages/ProductResultPage').then(m => ({ default: m.ProductResultPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const AuthPage = lazy(() => import('@/pages/AuthPage').then(m => ({ default: m.AuthPage })))
const UpgradePage = lazy(() => import('@/pages/UpgradeAndSettingsPages').then(m => ({ default: m.UpgradePage })))
const SettingsPage = lazy(() => import('@/pages/UpgradeAndSettingsPages').then(m => ({ default: m.SettingsPage })))
const PricingPage = lazy(() => import('@/pages/PricingPage').then(m => ({ default: m.PricingPage })))
const TermsPage = lazy(() => import('@/pages/LegalPages').then(m => ({ default: m.TermsPage })))
const PrivacyPage = lazy(() => import('@/pages/LegalPages').then(m => ({ default: m.PrivacyPage })))
const RefundPage = lazy(() => import('@/pages/LegalPages').then(m => ({ default: m.RefundPage })))

function PageSkeleton() {
  return (
    <div className="px-4 pt-6 space-y-4" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-6 w-32" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-48 w-full rounded-xl" />
    </div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()
  if (isLoading) return <PageSkeleton />
  if (!isAuthenticated) {
    localStorage.setItem('auth-return-to', location.pathname)
    return <Navigate to="/auth" state={{ returnTo: location.pathname }} replace />
  }
  return <>{children}</>
}

function AuthCallback() {
  const navigate = useNavigate()
  const { initAuth } = useAuthStore()
  useEffect(() => {
    const returnTo = localStorage.getItem('auth-return-to') ?? '/dashboard'
    localStorage.removeItem('auth-return-to')
    initAuth().then(() => navigate(returnTo, { replace: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <PageSkeleton />
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-5xl font-bold text-muted-foreground/30">:(</p>
          <p className="text-sm font-semibold text-foreground">Something went wrong</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/' }}
            className="text-sm text-accent underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Reload app
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function NotFound() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl font-bold text-muted-foreground/30">404</p>
      <p className="text-sm font-semibold text-foreground">Page not found</p>
      <a href="/" className="text-sm text-accent underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Go home</a>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageSkeleton />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/product/:id" element={<ProductResultPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/upgrade" element={<UpgradePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/refund" element={<RefundPage />} />
          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

function AppShell() {
  const location = useLocation()
  const isAuthPage = location.pathname.startsWith('/auth')
  return (
    <div className="full-height relative">
      <GlassBackground />
      <div className="relative z-10 flex flex-col full-height">
        {!isAuthPage && <><OfflineBanner /><Header /></>}
        <AnimatedRoutes />
        {!isAuthPage && <BottomNav />}
        <ToastContainer />
      </div>
    </div>
  )
}

export function App() {
  const { initAuth } = useAuthStore()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { initAuth() }, [])
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppShell />
      </ErrorBoundary>
    </BrowserRouter>
  )
}
