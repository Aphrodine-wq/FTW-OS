import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GitCommit } from 'lucide-react'

export function GithubTicker() {
  const [commits, setCommits] = useState<string[]>([
    "feat: Initializing core system...",
    "fix: Resolved race condition in payment flow",
    "chore: Updated dependencies",
    "feat: Added new dark mode",
    "refactor: Optimized widget rendering",
    "docs: Updated README.md",
    "feat: Implemented 144hz physics engine",
    "fix: Patched memory leak in sidebar",
    "chore: Cleaning up artifacts"
  ])

  return (
    <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none opacity-50">
      <motion.div 
        className="flex gap-8 items-center whitespace-nowrap text-[10px] font-mono text-white"
        animate={{ x: [0, -1000] }}
        transition={{ 
            repeat: Infinity, 
            duration: 40, 
            ease: "linear" 
        }}
      >
        {/* Duplicated list for seamless loop */}
        {[...commits, ...commits].map((commit, i) => (
            <div key={i} className="flex items-center gap-2">
                <GitCommit className="h-3 w-3 text-white/40" />
                <span>{commit}</span>
                <span className="text-white/30">7m ago</span>
            </div>
        ))}
      </motion.div>
    </div>
  )
}
