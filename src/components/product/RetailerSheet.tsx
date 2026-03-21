import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Globe } from 'lucide-react'
import { IconRefresh } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'

interface RetailerSheetProps {
  url: string
  retailerName: string
  price: string
  isOpen: boolean
  onClose: () => void
}

type LoadState = 'loading' | 'loaded' | 'blocked'

// All major retailers (Target, Walmart, Best Buy) block iframes via X-Frame-Options /
// CSP frame-ancestors. The onLoad event fires even for blocked iframes (the browser
// received a response, just an empty one). We can't detect the block cross-origin, so
// we rely solely on the timeout to show the fallback CTA.
const BLOCK_TIMEOUT_MS = 1200

export function RetailerSheet({ url, retailerName, price, isOpen, onClose }: RetailerSheetProps) {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Lock body scroll while sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Reset state each time the sheet opens with a new URL
  useEffect(() => {
    if (!isOpen) return
    setLoadState('loading')

    // If the iframe hasn't reported a meaningful load within BLOCK_TIMEOUT_MS,
    // assume the site blocked embedding and show the fallback CTA.
    timeoutRef.current = setTimeout(() => setLoadState('blocked'), BLOCK_TIMEOUT_MS)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isOpen, url])

  const handleIframeLoad = () => {
    // Do NOT cancel the timeout here. onLoad fires even when the retailer blocks
    // the iframe via X-Frame-Options — the iframe body will be empty cross-origin
    // and we have no way to detect it. Let the timeout drive the blocked fallback.
  }

  const openExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="retailer-backdrop"
            className="fixed inset-0 z-40 bg-[rgba(28,28,28,0.40)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="retailer-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={`${retailerName} product page`}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-[#FFFEFD] overflow-hidden"
            style={{ height: '88dvh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="h-1 w-10 rounded-full bg-[rgba(28,28,28,0.15)]" aria-hidden="true" />
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 pb-3 shrink-0">
              <button
                onClick={onClose}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  'bg-[rgba(28,28,28,0.06)] text-[#1C1C1C]',
                  'hover:bg-[rgba(28,28,28,0.12)] transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {/* URL bar */}
              <div className="flex flex-1 min-w-0 items-center gap-2 rounded-lg bg-[rgba(28,28,28,0.06)] px-3 py-1.5">
                <Globe className="h-3.5 w-3.5 shrink-0 text-[rgba(28,28,28,0.40)]" aria-hidden="true" />
                <span className="truncate text-xs text-[rgba(28,28,28,0.60)]">
                  {retailerName} · {price}
                </span>
                {loadState === 'loading' && (
                  <IconRefresh className="h-3 w-3 shrink-0 animate-spin text-[rgba(28,28,28,0.40)] ml-auto" aria-label="Loading" />
                )}
              </div>

              {/* Open externally */}
              <button
                onClick={openExternal}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  'bg-[rgba(28,28,28,0.06)] text-[#1C1C1C]',
                  'hover:bg-[rgba(28,28,28,0.12)] transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
                aria-label={`Open ${retailerName} in browser`}
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>

            {/* Content area */}
            <div className="relative flex-1 border-t border-[rgba(28,28,28,0.08)] overflow-hidden">

              {/* Loading shimmer */}
              <AnimatePresence>
                {loadState === 'loading' && (
                  <motion.div
                    key="loading"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#FFFEFD]"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconRefresh className="h-5 w-5 animate-spin text-[rgba(28,28,28,0.35)]" aria-hidden="true" />
                    <p className="text-xs text-[rgba(28,28,28,0.50)]">Loading {retailerName}…</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Blocked fallback */}
              <AnimatePresence>
                {loadState === 'blocked' && (
                  <motion.div
                    key="blocked"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#FFFEFD] px-8 text-center"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(28,28,28,0.12)] bg-[rgba(28,28,28,0.04)]">
                      <Globe className="h-8 w-8 text-[rgba(28,28,28,0.35)]" aria-hidden="true" />
                    </div>

                    <div className="space-y-1.5 max-w-[260px]">
                      <p className="font-display text-base font-semibold text-[#1C1C1C]">
                        {retailerName} blocks in-app browsing
                      </p>
                      <p className="text-xs text-[rgba(28,28,28,0.55)] leading-relaxed">
                        Tap below to open the product page in your browser. You'll be brought back here when done.
                      </p>
                    </div>

                    <button
                      onClick={openExternal}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-xl',
                        'bg-[#1C1C1C] text-[#FFFEFD]',
                        'px-6 py-3 text-sm font-semibold',
                        'hover:bg-[#1C1C1C]/85 active:scale-95 transition-all',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      )}
                    >
                      Open {retailerName}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* iframe — always rendered so load event fires */}
              <iframe
                src={isOpen ? url : undefined}
                className={cn(
                  'h-full w-full border-0 transition-opacity duration-300',
                  loadState === 'loaded' ? 'opacity-100' : 'opacity-0 pointer-events-none',
                )}
                onLoad={handleIframeLoad}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
                title={`${retailerName} product page`}
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
