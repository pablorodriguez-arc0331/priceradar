import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
  required?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightElement, required, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const errorId = error ? `${inputId}-error` : undefined
    const hintId = hint ? `${inputId}-hint` : undefined

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-zinc-300"
          >
            {label}
            {required && (
              <span className="ml-1 text-destructive" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
            aria-invalid={!!error}
            aria-required={required}
            className={cn(
              'flex h-10 w-full rounded-md border border-white/[0.08] bg-zinc-900/80 px-3 py-2',
              'text-[16px] text-zinc-50 placeholder:text-zinc-500',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0',
              'focus-visible:border-white/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-9',
              rightElement && 'pr-10',
              error && 'border-red-500/40 focus-visible:ring-red-500/30',
              className,
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-xs text-zinc-500">
            {hint}
          </p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input }
