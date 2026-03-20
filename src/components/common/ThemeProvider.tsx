import { useEffect } from 'react'
import { useThemeStore } from '@/store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore(s => s.theme)
  const setSystemTheme = useThemeStore(s => s.setSystemTheme)

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Follow system preference changes when the user hasn't manually overridden
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setSystemTheme])

  return <>{children}</>
}
