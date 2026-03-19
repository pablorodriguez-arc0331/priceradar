import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Radar } from 'lucide-react'
import { faEye, faEyeSlash, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from '@/components/ui/FaIcon'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
} from '@/lib/supabase'
import { useAuthStore, useToast } from '@/store'
import { cn } from '@/lib/utils'
import { useDocumentTitle } from '@/hooks'

type AuthMode = 'signin' | 'signup'

export function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { initAuth } = useAuthStore()
  const toast = useToast()

  const returnTo = (location.state as { returnTo?: string })?.returnTo ?? '/dashboard'
  useDocumentTitle('Sign In — PriceRadar')
  const [mode, setMode] = useState<AuthMode>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  const updateField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = (): boolean => {
    const newErrors: Partial<typeof form> = {}
    if (mode === 'signup' && !form.name.trim()) newErrors.name = 'Name is required.'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Enter a valid email address.'
    if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGoogle = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
      // Redirect handled by Supabase OAuth callback
    } catch {
      toast('error', 'Sign-in failed', 'Could not connect to Google. Try again.')
      setIsGoogleLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsEmailLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error } = await signUpWithEmail(form.email, form.password, form.name)
        if (error) throw error
        // If email confirmation is disabled, session is returned immediately
        if (data.session) {
          await initAuth()
          navigate(returnTo, { replace: true })
        } else {
          toast('success', 'Check your email', 'We sent a confirmation link to ' + form.email)
        }
      } else {
        const { error } = await signInWithEmail(form.email, form.password)
        if (error) throw error
        // initAuth syncs the store — onAuthStateChange fires first but we await to be safe
        await initAuth()
        navigate(returnTo, { replace: true })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Check your credentials and try again.'
      toast('error', 'Sign-in failed', message)
    } finally {
      setIsEmailLoading(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 pb-[calc(4rem+env(safe-area-inset-bottom,0px))]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Logo */}
        <div className="text-center space-y-1">
          <Link to="/" className="inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md" aria-label="Price Radar — Home">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
              <Radar className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
          </Link>
          <h1 className="font-display text-xl font-bold text-foreground">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {mode === 'signin'
              ? 'Sign in to access your watchlist and alerts'
              : 'Start tracking prices for free. No credit card needed.'}
          </p>
        </div>

        {/* Mode toggle */}
        <div
          className="flex rounded-xl border border-border bg-muted/40 p-1"
          role="tablist"
          aria-label="Sign in or create account"
        >
          {(['signin', 'signup'] as const).map(m => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => { setMode(m); setErrors({}) }}
              className={cn(
                'relative flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                mode === m
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {mode === m && (
                <motion.span
                  layoutId="auth-tab-indicator"
                  className="absolute inset-0 rounded-lg bg-background shadow-sm"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </span>
            </button>
          ))}
        </div>

        {/* Google OAuth */}
        <Button
          variant="outline"
          fullWidth
          size="lg"
          onClick={handleGoogle}
          loading={isGoogleLoading}
          leftIcon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          }
        >
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Email form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: mode === 'signin' ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'signin' ? 12 : -12 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            onSubmit={handleEmailSubmit}
            className="space-y-4"
            noValidate
          >
            {mode === 'signup' && (
              <Input
                label="Your name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={updateField('name')}
                error={errors.name}
                placeholder="Sam"
                required
              />
            )}

            <Input
              label="Email address"
              type="email"
              autoComplete={mode === 'signin' ? 'email' : 'email'}
              value={form.email}
              onChange={updateField('email')}
              error={errors.email}
              placeholder="you@example.com"
              leftIcon={<FaIcon icon={faEnvelope} className="h-4 w-4" />}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={form.password}
              onChange={updateField('password')}
              error={errors.password}
              placeholder={mode === 'signin' ? '••••••••' : 'At least 8 characters'}
              hint={mode === 'signup' ? 'Minimum 8 characters' : undefined}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <FaIcon icon={faEyeSlash} className="h-4 w-4" />
                    : <FaIcon icon={faEye} className="h-4 w-4" />
                  }
                </button>
              }
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isEmailLoading}
            >
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </motion.form>
        </AnimatePresence>

      </motion.div>
    </div>
  )
}
