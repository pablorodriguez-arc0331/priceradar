import { CSSProperties, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// ─── Base icon component — CSS mask approach ─────────────────────────────────
// Uses the SVG asset as a mask and `background-color: currentColor` for color.
// This means all Tailwind `text-*` classes (text-accent, text-signal-low, etc.)
// work exactly as they did with inline SVGs.

type IconProps = HTMLAttributes<HTMLSpanElement> & {
  size?: number | string
}

function Icon({
  src,
  size = 20,
  className,
  style,
  ...props
}: IconProps & { src: string }) {
  const dimension = typeof size === 'number' ? `${size}px` : size
  const maskStyle: CSSProperties = {
    display: 'inline-block',
    flexShrink: 0,
    width: dimension,
    height: dimension,
    backgroundColor: 'currentColor',
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    ...style,
  }
  return (
    <span
      className={cn('shrink-0', className)}
      style={maskStyle}
      aria-hidden="true"
      {...props}
    />
  )
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export function IconLogOut({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/arrow-right-from-bracket-graphite-thin-full.svg" size={size} {...props} />
}

export function IconArrowRight({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/arrow-right-graphite-thin-full.svg" size={size} {...props} />
}

export function IconBell({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/bell-graphite-thin-full.svg" size={size} {...props} />
}

export function IconChart({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/chart-simple-graphite-thin-full.svg" size={size} {...props} />
}

export function IconUser({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/circle-user-graphite-thin-full.svg" size={size} {...props} />
}

export function IconClock({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/clock-graphite-thin-full.svg" size={size} {...props} />
}

export function IconMail({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/envelope-graphite-thin-full.svg" size={size} {...props} />
}

export function IconFire({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/fire-graphite-thin-full.svg" size={size} {...props} />
}

export function IconGrid({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/grid-graphite-thin-full.svg" size={size} {...props} />
}

export function IconHouse({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/house-graphite-thin-full.svg" size={size} {...props} />
}

export function IconSearch({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/magnifying-glass-graphite-thin-full.svg" size={size} {...props} />
}

export function IconShare({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/share-nodes-graphite-thin-full.svg" size={size} {...props} />
}

export function IconShield({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/shield-graphite-thin-full.svg" size={size} {...props} />
}

export function IconTag({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/tag-graphite-thin-full.svg" size={size} {...props} />
}

export function IconTrash({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/trash-graphite-thin-full.svg" size={size} {...props} />
}

export function IconAlert({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/triangle-exclamation-graphite-thin-full.svg" size={size} {...props} />
}

export function IconRefresh({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/arrows-rotate-graphite-thin-full.svg" size={size} {...props} />
}

export function IconClipboard({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/clipboard-graphite-thin-full.svg" size={size} {...props} />
}

export function IconList({ size = 20, ...props }: IconProps) {
  return <Icon src="/assets/list-graphite-thin-full.svg" size={size} {...props} />
}
