export function GlassBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Ambient glow — top left */}
      <div
        className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
        }}
      />
      {/* Ambient glow — bottom right */}
      <div
        className="absolute -bottom-40 -right-20 h-[400px] w-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
