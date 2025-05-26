'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function Features() {
  const features = [
    {
      title: 'Email Processing',
      description: 'Forward receipts to data@charityprep.uk and watch AI categorize everything automatically.',
    },
    {
      title: 'Smart Tracking',
      description: 'Upload photos of DBS certificates. OCR extracts dates and details instantly.',
    },
    {
      title: 'Natural Search',
      description: 'Ask "Show DBS expiring in March" and get exactly what you need.',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const statsVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  return (
    <section id="features" className="py-32 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="text-5xl lg:text-6xl font-light text-[#1a1a1a] leading-tight tracking-tight mb-8"
          >
            Software that actually
            <br />
            <span className="font-medium">helps</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-xl text-[#666] font-light max-w-2xl mx-auto"
          >
            Stop fighting spreadsheets.
            <br />
            Start focusing on your mission.
          </motion.p>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-16"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="border-l-2 border-[#B1FA63] pl-8"
            >
              <h3 className="text-2xl font-medium text-[#1a1a1a] mb-4">
                {feature.title}
              </h3>
              <p className="text-lg text-[#666] font-light leading-relaxed max-w-2xl">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Simple stats */}
        <motion.div 
          variants={statsVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-20 pt-20 border-t border-[#B1FA63] border-opacity-30"
        >
          <div className="grid grid-cols-3 gap-8 text-center">
            <motion.div variants={itemVariants}>
              <div className="text-3xl font-light text-[#1a1a1a] mb-2">10+</div>
              <div className="text-sm text-[#999] font-light">Hours saved monthly</div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="text-3xl font-light text-[#1a1a1a] mb-2">247</div>
              <div className="text-sm text-[#999] font-light">Charities ready</div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="text-3xl font-light text-[#1a1a1a] mb-2">5min</div>
              <div className="text-sm text-[#999] font-light">Setup time</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}