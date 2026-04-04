import { motion, useReducedMotionConfig } from 'framer-motion'

export function AmbientBackground() {
  const hideAmbientMotion = useReducedMotionConfig() === true

  return (
    <>
      <div className="grid-bg" aria-hidden />
      <div className="noise-layer" aria-hidden />
      {!hideAmbientMotion && (
        <>
          <div className="scan-line" aria-hidden />
          <motion.div
            className="aurora-blob aurora-blob--a"
            aria-hidden
            initial={{ opacity: 0.35, scale: 1 }}
            animate={{
              opacity: [0.28, 0.45, 0.32],
              scale: [1, 1.06, 1],
              x: [0, 12, -6, 0],
              y: [0, -10, 6, 0],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="aurora-blob aurora-blob--b"
            aria-hidden
            initial={{ opacity: 0.3, scale: 1 }}
            animate={{
              opacity: [0.22, 0.4, 0.26],
              scale: [1, 1.08, 1],
              x: [0, -14, 8, 0],
              y: [0, 14, -4, 0],
            }}
            transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </>
      )}
    </>
  )
}
