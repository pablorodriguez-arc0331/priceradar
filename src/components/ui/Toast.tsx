import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, Info, X } from 'lucide-react'
import { IconAlert } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'
import { useToastStore } from '@/store'
import type { Toast, ToastVariant } from '@/types'

const TOAST_CONFIG: Record<ToastVariant, {
  icon: React.ElementType
  bg: string; border: string; iconColor: string; titleColor: string; descColor: string
}> = {
  success: {
    icon: CheckCircle,
    bg: 'bg-[#1C1C1C]', border: 'border-[rgba(255,254,253,0.15)]', iconColor: 'text-[#FFFEFD]', titleColor: 'text-[#FFFEFD]', descColor: 'text-[rgba(255,254,253,0.65)]',
  },
  error: {
    icon: IconAlert,
    bg: 'bg-[#1C1C1C]', border: 'border-[rgba(255,254,253,0.15)]', iconColor: 'text-[#FFFEFD]', titleColor: 'text-[#FFFEFD]', descColor: 'text-[rgba(255,254,253,0.65)]',
  },
  info: {
    icon: Info,
    bg: 'bg-[#FFFEFD]', border: 'border-[rgba(28,28,28,0.15)]', iconColor: 'text-[#1C1C1C]', titleColor: 'text-[#1C1C1C]', descColor: 'text-[rgba(28,28,28,0.55)]',
  },
  warning: {
    icon: IconAlert,
    bg: 'bg-[#FFFEFD]', border: 'border-[rgba(28,28,28,0.25)]', iconColor: 'text-[#1C1C1C]', titleColor: 'text-[#1C1C1C]', descColor: 'text-[rgba(28,28,28,0.55)]',
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
        'flex items-start gap-3 rounded-lg border p-4',
        'shadow-[0_8px_32px_rgba(0,0,0,0.18)]',
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
      </div>
      <button
        onClick={onRemove}
        className={cn(
          'shrink-0 rounded p-0.5 transition-colors',
          'hover:bg-[rgba(28,28,28,0.08)]',
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
