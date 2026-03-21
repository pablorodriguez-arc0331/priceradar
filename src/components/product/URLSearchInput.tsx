import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { IconAlert, IconClipboard } from '@/components/ui/Icons'
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
  placeholder = 'Paste Amazon product link',
  className,
}: URLSearchInputProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { lookup, isLoading, error, hint, setError } = useProductLookup()

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const handleSubmit = async (urlOverride?: string) => {
    const url = urlOverride ?? value
    const productId = await lookup(url)
    if (productId) navigate(`/product/${productId}`)
  }

  // Auto-submit on paste event (keyboard paste or drag-drop)
  const handlePaste = async (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').trim()
    if (!pasted) return
    setValue(pasted)
    setTimeout(() => handleSubmit(pasted), 50)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') { setValue(''); setError(null) }
  }

  const handleClear = () => {
    setValue('')
    setError(null)
    inputRef.current?.focus()
  }

  // Clipboard button — reads from OS clipboard and auto-submits
  const handlePasteButton = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const trimmed = text.trim()
      if (!trimmed) return
      setValue(trimmed)
      setError(null)
      await handleSubmit(trimmed)
    } catch {
      // Clipboard permission denied — focus input so user can paste manually
      inputRef.current?.focus()
    }
  }

  const hasValue = value.trim().length > 0

  return (
    <div className={cn('w-full space-y-2', className)}>

      {/* ── Input field ─────────────────────────────────────────────────── */}
      <div
        className="search-border-wrap relative rounded-xl p-px"
        data-focused={isFocused ? 'true' : undefined}
        data-error={error ? 'true' : undefined}
      >
        {/* Inner container — clips to rounded and provides the background that "cuts" the border */}
        <div className="relative flex items-center rounded-[calc(0.75rem-1px)] bg-background overflow-hidden">

          {/* Left search icon */}
          <img
            src="/assets/search.png"
            alt=""
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute left-3.5 h-5 w-5 shrink-0 object-contain transition-opacity duration-300',
              isFocused ? 'opacity-100' : 'opacity-40',
            )}
          />

          <input
            ref={inputRef}
            type="url"
            value={value}
            onChange={e => { setValue(e.target.value); if (error) setError(null) }}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={cn(
              'w-full h-14 rounded-[calc(0.75rem-1px)] bg-transparent',
              'pl-11 pr-12 text-base text-foreground placeholder:text-muted-foreground',
              'transition-colors duration-200',
              'focus-visible:outline-none',
              'disabled:opacity-50',
            )}
            aria-label="Amazon product URL"
            aria-describedby={error ? 'search-error' : 'search-hint'}
            aria-invalid={!!error}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={isLoading}
          />

          {/* Right icon: paste | clear | spinner */}
          <div className="absolute right-3 flex items-center">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.span
                  key="spinner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-8 w-8"
                >
                  <Spinner className="h-4 w-4 text-muted-foreground" />
                </motion.span>
              ) : hasValue ? (
                <motion.button
                  key="clear"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  onClick={handleClear}
                  type="button"
                  aria-label="Clear"
                  className={cn(
                    'flex items-center justify-center h-8 w-8 rounded-lg',
                    'text-muted-foreground hover:text-foreground hover:bg-muted',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              ) : (
                <motion.button
                  key="paste"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  onClick={handlePasteButton}
                  type="button"
                  aria-label="Paste from clipboard"
                  className={cn(
                    'flex items-center justify-center h-8 w-8 rounded-lg',
                    'text-muted-foreground hover:text-foreground hover:bg-muted',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  <IconClipboard className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* ── Inline error ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.p
            id="search-error"
            role="alert"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-start gap-1.5 text-xs text-destructive overflow-hidden"
          >
            <IconAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden="true" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {!error && !hint && (
        <p id="search-hint" className="sr-only">
          Paste an Amazon product URL to check price history and compare retailers.
        </p>
      )}

      {/* Hint — non-error status message (e.g. "Retrying…") */}
      <AnimatePresence>
        {hint && !error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-muted-foreground"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Check Price button — full-width below input ──────────────────── */}
      <Button
        onClick={() => handleSubmit()}
        disabled={!hasValue || isLoading}
        loading={isLoading}
        fullWidth
        size="lg"
        aria-label="Check price"
      >
        {isLoading ? (hint ?? 'Checking price…') : 'Check Price'}
      </Button>
    </div>
  )
}
