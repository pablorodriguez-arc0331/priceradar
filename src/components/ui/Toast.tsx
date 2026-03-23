import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToastStore } from '@/store'
import type { Toast, ToastVariant } from '@/types'

const TOAST_CONFIG: Record<ToastVariant, {
  icon: React.ElementType
  bg: string; border: string; iconColor: string; titleColor: string; descColor: string
}> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-zinc-900/95', border: 'border-emerald-500/25', iconColor: 'text-emerald-400', titleColor: 'text-zinc-50', descColor: 'text-zinc-400',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-zinc-900/95', border: 'border-red-500/25', iconColor: 'text-red-400', titleColor: 'text-zinc-50', descColor: 'text-zinc-400',
  },
  info: {
    icon: Info,
    bg: 'bg-zinc-900/95', border: 'border-white/[0.08]', iconColor: 'text-blue-400', titleColor: 'text-zinc-50', descColor: 'text-zinc-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-zinc-900/95', border: 'border-amber-500/25', iconColor: 'text-amber-400', titleColor: 'text-zinc-50', descColor: 'text-zinc-400',
  },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const t = TOAST_CONFIG[toast.variant]
  const Icon = t.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 64, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 64, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4',
        'shadow-[0_8px_32px_rgba(0,0,0,0.60)] backdrop-blur-xl',
        'w-full max-w-sm',
        t.bg,
        t.border,
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', t.iconColor)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold', t.titleColor)}>{toast.title}</p>
        {toast.description && (
          <p className={cn('mt-0.5 text-xs', t.descColor)}>{toast.description}</p>
        )}
        {toast.action && (
          <button
            onClick={() => { toast.action!.onClick(); onRemove() }}
            className={cn(
              'mt-1.5 text-xs font-semibold text-blue-400 underline-offset-2 hover:underline',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded',
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onRemove}
        className={cn(
          'shrink-0 rounded p-0.5 transition-colors',
          'hover:bg-white/[0.08]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
        aria-label="Dismiss notification"
      >
        <X className={cn('h-4 w-4', t.descColor)} />
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
