import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProductLookup } from '@/hooks'
import { Button, Spinner } from '@/components/ui/Button'

interface URLSearchInputProps {
  autoFocus?: boolean
  size?: 'default' | 'large'
  placeholder?: string
  className?: string
}

export function URLSearchInput({
  autoFocus = false,
  size = 'default',
  placeholder = 'Paste an Amazon product link',
  className,
}: URLSearchInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { lookup, isLoading, error, setError } = useProductLookup()

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  // Auto-submit on paste
  const handlePaste = async (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').trim()
    if (!pasted) return
    setValue(pasted)
    // Small delay to let React update value before submit
    setTimeout(() => handleSubmit(pasted), 100)
  }

  const handleSubmit = async (urlOverride?: string) => {
    const url = urlOverride ?? value
    const productId = await lookup(url)
    if (productId) {
      navigate(`/product/${productId}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') {
      setValue('')
      setError(null)
    }
  }

  const handleClear = () => {
    setValue('')
    setError(null)
    inputRef.current?.focus()
  }

  const isLarge = size === 'large'

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      <div className="relative flex items-center">
        <Search
          className={cn(
            'pointer-events-none absolute left-3 shrink-0 text-muted-foreground',
            isLarge ? 'h-5 w-5' : 'h-4 w-4',
          )}
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          type="url"
          value={value}
          onChange={e => {
            setValue(e.target.value)
            if (error) setError(null)
          }}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border border-input bg-background/80',
            'text-foreground placeholder:text-muted-foreground',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
            'focus-visible:border-ring focus-visible:shadow-[0_0_0_4px_hsl(var(--ring)/0.15)]',
            'disabled:opacity-50',
            isLarge
              ? 'h-14 pl-11 pr-32 text-base shadow-sm'
              : 'h-10 pl-9 pr-24 text-sm',
            error && 'border-destructive focus-visible:ring-destructive focus-visible:shadow-[0_0_0_4px_hsl(var(--destructive)/0.15)]',
          )}
          aria-label="Amazon product URL"
          aria-describedby={error ? 'search-error' : 'search-hint'}
          aria-invalid={!!error}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {/* Right side actions */}
        <div className={cn('absolute right-1.5 flex items-center gap-1')}>
          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={handleClear}
                className={cn(
                  'rounded-md p-1 text-muted-foreground',
                  'hover:bg-muted hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
                type="button"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>

          <Button
            onClick={() => handleSubmit()}
            disabled={!value.trim() || isLoading}
            size={isLarge ? 'default' : 'sm'}
            className="shrink-0"
            aria-label="Check price"
          >
            {isLoading ? (
              <>
                <Spinner className="h-4 w-4" />
                <span>Checking…</span>
              </>
            ) : (
              'Check Price'
            )}
          </Button>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id="search-error"
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 text-xs text-destructive overflow-hidden"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </motion.p>
        )}
        {!error && (
          <p id="search-hint" className="sr-only">
            Paste an Amazon product URL to check price history and find the best deal instantly.
          </p>
        )}
      </AnimatePresence>
    </div>
  )
}
