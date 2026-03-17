import { motion } from 'framer-motion'

// Animated blob configuration
const BLOBS = [
  {
    // Primary — accent blue, top-right
    className: 'absolute -top-24 -right-24 h-[380px] w-[380px] rounded-full opacity-[0.18] dark:opacity-25',
    style: { background: 'radial-gradient(circle, #2563EB 0%, #3B82F6 60%, transparent 100%)' },
    animate: {
      x: [0, 40, -15, 0],
      y: [0, -60, 30, 0],
      scale: [1, 1.08, 0.94, 1],
    },
    transition: { duration: 22, ease: 'easeInOut', repeat: Infinity },
  },
  {
    // Secondary — violet, bottom-left
    className: 'absolute -bottom-24 -left-24 h-[420px] w-[420px] rounded-full opacity-[0.14] dark:opacity-20',
    style: { background: 'radial-gradient(circle, #7C3AED 0%, #8B5CF6 60%, transparent 100%)' },
    animate: {
      x: [0, -35, 25, 0],
      y: [0, 50, -40, 0],
      scale: [1, 0.93, 1.07, 1],
    },
    transition: { duration: 26, ease: 'easeInOut', repeat: Infinity, delay: 9 },
  },
  {
    // Tertiary — teal, mid-left
    className: 'absolute top-1/3 -left-20 h-[300px] w-[300px] rounded-full opacity-[0.12] dark:opacity-[0.18]',
    style: { background: 'radial-gradient(circle, #0D9488 0%, #14B8A6 60%, transparent 100%)' },
    animate: {
      x: [0, 25, -18, 0],
      y: [0, -40, 55, 0],
      scale: [1, 1.1, 0.9, 1],
    },
    transition: { duration: 30, ease: 'easeInOut', repeat: Infinity, delay: 4 },
  },
]

export function GlassBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Base background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/[0.04]" />

      {/* Animated blobs */}
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className={`${blob.className} blur-3xl`}
          style={blob.style}
          animate={blob.animate}
          transition={blob.transition as Parameters<typeof motion.div>[0]['transition']}
        />
      ))}
    </div>
  )
}
