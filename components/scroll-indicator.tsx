'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

interface ScrollIndicatorProps {
  isVisible: boolean
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ isVisible }) => {
  if (!isVisible) return null

  return (
    <div className="flex flex-col items-center justify-center space-y-2 mb-4">
      {/* Animated Scroll Text */}
      <motion.div 
        className="text-white font-bold text-sm uppercase tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 1, 0],
          transition: { 
            duration: 1.5, 
            repeat: Infinity, 
            repeatType: 'loop' 
          }
        }}
      >
        Scroll
      </motion.div>

      {/* Animated Bouncing Arrow */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          transition: {
            duration: 1.2,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut'
          }
        }}
      >
        <ArrowDown 
          className="text-white h-6 w-6" 
          strokeWidth={1.5}
        />
      </motion.div>
    </div>
  )
}

export default ScrollIndicator
