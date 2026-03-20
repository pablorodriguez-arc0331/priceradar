import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToastStore } from '@/store'
import type { Toast, ToastVariant } from '@/types'

const TOAST_CONFIG: Record<ToastVariant, {
  icon: React.ElementType
  bg: string
  border: string
  iconColor: string
}> = {
  success: {
    icon: CheckCircle,
    bg: 'bg-[#0D2818]',
    border: 'border-[#10B981]/40',
    iconColor: 'text-signal-low',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-[#2A0D12]',
    border: 'border-[#F43F5E]/40',
    iconColor: 'text-signal-high',
  },
  info: {
    icon: Info,
    bg: 'bg-[#071E2E]',
    border: 'border-[#06B6D4]/40',
    iconColor: 'text-accent',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[#231A06]',
    border: 'border-amber-500/40',
    iconColor: 'text-amber-400',
  },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const config = TOAST_CONFIG[toast.variant]
  const Icon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 64, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 64, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        'shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
        'w-full max-w-sm',
        config.bg,
        config.border,
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', config.iconColor)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onRemove}
        className={cn(
          'shrink-0 rounded p-0.5 transition-colors',
          'hover:bg-black/10',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div
      className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px)+0.5rem)] right-4 z-50 flex flex-col gap-2 md:bottom-4"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="sync">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
