import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function DocumentationPage() {
  return (
    <section className="hub-section">
      <div className="section-label" style={{ textAlign: 'center' }}>
        // documentation
      </div>
      <h2>Documentation</h2>
      <p className="hub-intro">
        Install, pipeline, commands, agents, platforms, and examples live on one guide page. Use Support for
        troubleshooting.
      </p>
      <div className="hub-grid hub-grid--two">
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Link className="hub-card" to="/guide">
            <h3>Guide</h3>
            <p>Everything in one place: install, tracks, slash commands, delegation, hosts, and sample flows.</p>
          </Link>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Link className="hub-card" to="/support">
            <h3>Support</h3>
            <p>Common failures, <code>agentic-swe doctor</code>, migrations, and where to get help.</p>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
