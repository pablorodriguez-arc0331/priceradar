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
            className="text-sm font-medium text-foreground"
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
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
              'flex h-10 w-full rounded-md border border-input bg-background/80 px-3 py-2',
              'text-sm placeholder:text-muted-foreground',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
              'focus-visible:border-ring focus-visible:shadow-[0_0_0_4px_hsl(var(--ring)/0.12)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-9',
              rightElement && 'pr-10',
              error && 'border-destructive focus-visible:ring-destructive focus-visible:shadow-[0_0_0_4px_hsl(var(--destructive)/0.12)]',
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
          <p id={errorId} role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input }
