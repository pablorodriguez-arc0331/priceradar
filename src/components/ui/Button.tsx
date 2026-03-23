import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg',
    'font-sans text-sm font-medium',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-40',
    'touch-action-manipulation',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-[#1C1C1C] text-white font-semibold hover:bg-[#1C1C1C]/85 active:bg-[#1C1C1C]',
        secondary:
          'bg-white text-[#111827] border border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]',
        outline:
          'border border-[#E5E7EB] bg-transparent text-[#111827] hover:bg-[#F9FAFB] hover:border-[#D1D5DB]',
        ghost:
          'text-[#111827] hover:bg-[#F3F4F6]',
        destructive:
          'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
        link:
          'text-[#111827] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm:      'h-9 px-3 text-xs rounded-md min-h-[36px]',
        default: 'h-11 px-4 min-h-[44px]',
        lg:      'h-12 px-6 text-base rounded-xl min-h-[44px]',
        xl:      'h-14 px-8 text-base rounded-xl min-h-[44px]',
        icon:    'h-11 w-11 min-h-[44px] min-w-[44px]',
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
        whileHover={disabled || loading ? {} : { y: -1 }}
        whileTap={disabled || loading ? {} : { scale: 0.95, y: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
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
