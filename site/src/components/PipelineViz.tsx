import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type PathDef = {
  label: string
  labelClass: 'fast' | 'medium' | 'full'
  nodes: string[]
}

const PATHS: PathDef[] = [
  {
    label: 'Lean track — simple tasks',
    labelClass: 'fast',
    nodes: [
      'feasibility',
      'lean-track-check',
      'lean-track-implementation',
      'validation',
      'pr-creation',
      'approval-wait',
      'completed',
    ],
  },
  {
    label: 'Standard track — medium tasks',
    labelClass: 'medium',
    nodes: [
      'feasibility',
      'lean-track-check',
      'design',
      'verification',
      'test-strategy',
      'implementation',
      'self-review',
      'validation',
      'pr-creation',
      'approval-wait',
      'completed',
    ],
  },
  {
    label: 'Rigorous track — complex tasks',
    labelClass: 'full',
    nodes: [
      'feasibility',
      'lean-track-check',
      'design',
      'design-review',
      'verification',
      'test-strategy',
      'implementation',
      'self-review',
      'code-review',
      'permissions-check',
      'validation',
      'pr-creation',
      'approval-wait',
      'completed',
    ],
  },
]

function humanGate(name: string) {
  return name === 'approval-wait' || name === 'design-review'
}

const pathOuter = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: 'easeOut' as const,
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
}

const labelItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

const nodesRow = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.028, delayChildren: 0.02 },
  },
}

const nodePiece = {
  hidden: { opacity: 0, scale: 0.93 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.26, ease: 'easeOut' as const },
  },
}

export function PipelineViz() {
  return (
    <div className="pipeline-viz">
      {PATHS.map((path) => (
        <motion.div
          key={path.label}
          className="pipeline-path"
          variants={pathOuter}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className={`pipeline-path-label ${path.labelClass}`} variants={labelItem}>
            {path.label}
          </motion.div>
          <motion.div className="pipeline-nodes" variants={nodesRow}>
            {path.nodes.flatMap((node, i) => {
              const keyBase = `${path.label}-${node}-${i}`
              const cells: ReactNode[] = [
                <motion.span
                  key={`${keyBase}-n`}
                  className={`p-node${humanGate(node) ? ' human' : ''}`}
                  variants={nodePiece}
                  whileHover={{ scale: 1.04 }}
                >
                  {node}
                </motion.span>,
              ]
              if (i < path.nodes.length - 1) {
                cells.push(
                  <motion.span key={`${keyBase}-a`} className="p-arrow" variants={nodePiece} aria-hidden>
                    &rarr;
                  </motion.span>,
                )
              }
              return cells
            })}
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
