import { motion } from 'framer-motion'

// Animated blob configuration
const BLOBS = [
  {
    // Primary — electric cyan, top-right
    className: 'absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full opacity-25',
    style: { background: 'radial-gradient(circle, #06B6D4 0%, #0891B2 50%, transparent 100%)' },
    animate: { x: [0, 40, -15, 0], y: [0, -60, 30, 0], scale: [1, 1.08, 0.94, 1] },
    transition: { duration: 22, ease: 'easeInOut', repeat: Infinity },
  },
  {
    // Secondary — violet, bottom-left
    className: 'absolute -bottom-32 -left-32 h-[460px] w-[460px] rounded-full opacity-20',
    style: { background: 'radial-gradient(circle, #7C3AED 0%, #6D28D9 50%, transparent 100%)' },
    animate: { x: [0, -35, 25, 0], y: [0, 50, -40, 0], scale: [1, 0.93, 1.07, 1] },
    transition: { duration: 26, ease: 'easeInOut', repeat: Infinity, delay: 9 },
  },
  {
    // Tertiary — deep cyan-teal, mid-right
    className: 'absolute top-1/2 -right-20 h-[320px] w-[320px] rounded-full opacity-[0.15]',
    style: { background: 'radial-gradient(circle, #0E7490 0%, #164E63 60%, transparent 100%)' },
    animate: { x: [0, 25, -18, 0], y: [0, -40, 55, 0], scale: [1, 1.1, 0.9, 1] },
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
      <div className="absolute inset-0 bg-gradient-to-br from-[#050D1A] via-[#070F20] to-[#050D1A]" />

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
