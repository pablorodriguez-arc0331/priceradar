import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToastStore, useThemeStore } from '@/store'
import type { Toast, ToastVariant } from '@/types'

const TOAST_CONFIG: Record<ToastVariant, {
  icon: React.ElementType
  dark: { bg: string; border: string; iconColor: string; titleColor: string; descColor: string }
  light: { bg: string; border: string; iconColor: string; titleColor: string; descColor: string }
}> = {
  success: {
    icon: CheckCircle,
    dark:  { bg: 'bg-[#0D2818]', border: 'border-[#10B981]/40', iconColor: 'text-[#10B981]', titleColor: 'text-white',        descColor: 'text-white/60' },
    light: { bg: 'bg-[#ECFDF5]', border: 'border-[#10B981]/50', iconColor: 'text-[#059669]', titleColor: 'text-[#065F46]',    descColor: 'text-[#065F46]/70' },
  },
  error: {
    icon: AlertCircle,
    dark:  { bg: 'bg-[#2A0D12]', border: 'border-[#F43F5E]/40', iconColor: 'text-[#F43F5E]', titleColor: 'text-white',        descColor: 'text-white/60' },
    light: { bg: 'bg-[#FFF1F2]', border: 'border-[#F43F5E]/50', iconColor: 'text-[#E11D48]', titleColor: 'text-[#9F1239]',    descColor: 'text-[#9F1239]/70' },
  },
  info: {
    icon: Info,
    dark:  { bg: 'bg-[#071E2E]', border: 'border-[#06B6D4]/40', iconColor: 'text-[#06B6D4]', titleColor: 'text-white',        descColor: 'text-white/60' },
    light: { bg: 'bg-[#ECFEFF]', border: 'border-[#06B6D4]/50', iconColor: 'text-[#0891B2]', titleColor: 'text-[#164E63]',    descColor: 'text-[#164E63]/70' },
  },
  warning: {
    icon: AlertTriangle,
    dark:  { bg: 'bg-[#231A06]', border: 'border-amber-500/40', iconColor: 'text-amber-400',  titleColor: 'text-white',        descColor: 'text-white/60' },
    light: { bg: 'bg-[#FFFBEB]', border: 'border-amber-400/50', iconColor: 'text-amber-600',  titleColor: 'text-amber-900',    descColor: 'text-amber-800/70' },
  },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const config = TOAST_CONFIG[toast.variant]
  const theme = useThemeStore(s => s.theme)
  const t = theme === 'light' ? config.light : config.dark
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
          'hover:bg-black/10',
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
