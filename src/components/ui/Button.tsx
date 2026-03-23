import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full',
    'font-sans text-sm font-medium',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
    'disabled:pointer-events-none disabled:opacity-40',
    'touch-action-manipulation',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-white text-zinc-950 font-semibold shadow-sm hover:bg-white/90 active:bg-white/80',
        secondary:
          'bg-zinc-900/80 border border-white/[0.08] text-zinc-50 hover:bg-zinc-800 hover:border-white/[0.14]',
        outline:
          'border border-white/[0.08] bg-transparent text-zinc-300 hover:bg-zinc-900/80 hover:text-zinc-50 hover:border-white/[0.14]',
        ghost:
          'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-50',
        destructive:
          'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40',
        link:
          'text-zinc-300 underline-offset-4 hover:underline hover:text-zinc-50 p-0 h-auto rounded-none',
      },
      size: {
        sm:        'h-9 px-3.5 text-xs min-h-[36px]',
        default:   'h-11 px-5 min-h-[44px]',
        lg:        'h-12 px-6 text-base min-h-[44px]',
        xl:        'h-14 px-8 text-base min-h-[44px]',
        icon:      'h-11 w-11 min-h-[44px] min-w-[44px]',
        'icon-sm': 'h-9 w-9',
      },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <motion.div
        whileHover={disabled || loading ? {} : { scale: 1.03 }}
        whileTap={disabled || loading ? {} : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={fullWidth ? 'w-full' : 'inline-flex'}
      >
        <Comp
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          ref={ref}
          disabled={disabled || loading}
          aria-disabled={disabled || loading}
          {...props}
        >
          {loading ? (
            <>
              <Spinner className="h-4 w-4" />
              {children}
            </>
          ) : (
            <>
              {leftIcon}
              {children}
              {rightIcon}
            </>
          )}
        </Comp>
      </motion.div>
    )
  },
)
Button.displayName = 'Button'

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants, Spinner }
