'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function Pricing() {
  const plans = [
    {
      name: 'Essentials',
      price: '£199',
      period: '/year',
      description: 'For smaller charities',
      note: 'Income under £100k',
      features: [
        'All compliance modules',
        'AI email processing',
        'Annual return generation',
        'Smart reminders',
        '2 user accounts',
      ],
    },
    {
      name: 'Standard',
      price: '£549',
      period: '/year',
      description: 'For growing charities',
      note: '£100k - £1M income',
      popular: true,
      features: [
        'Everything in Essentials',
        'Up to 5 user accounts',
        'Document OCR extraction',
        'Priority support',
        'Advanced reporting',
      ],
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

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <section id="pricing" className="py-32 px-4 bg-[#fafafa]">
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
            Simple
            <br />
            <span className="font-medium">pricing</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-xl text-[#666] font-light"
          >
            Choose what works for your charity.
          </motion.p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`bg-white border rounded-2xl p-8 transition-all duration-200 hover:shadow-sm flex flex-col h-full ${
                plan.popular ? 'border-[#B1FA63]' : 'border-[#eee] hover:border-[#B1FA63]'
              }`}
            >
              {plan.popular && (
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="inline-block bg-[#B1FA63] text-[#1a1a1a] text-xs font-medium px-3 py-1 rounded-full mb-6"
                >
                  Popular
                </motion.div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-medium text-[#1a1a1a] mb-2">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-light text-[#1a1a1a]">
                    {plan.price}
                  </span>
                  <span className="text-[#666] ml-2">{plan.period}</span>
                </div>
                <p className="text-[#666] font-light mb-1">{plan.description}</p>
                <p className="text-sm text-[#999] font-light">{plan.note}</p>
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li 
                    key={featureIndex} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + featureIndex * 0.1, duration: 0.4 }}
                    className="flex items-start gap-3"
                  >
                    <span className="w-1.5 h-1.5 bg-[#1a1a1a] rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-[#1a1a1a] font-light">{feature}</span>
                  </motion.li>
                ))}
              </ul>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/login"
                  className={`block w-full text-center py-3 rounded-full font-medium transition-colors duration-200 ${
                    plan.popular 
                      ? 'bg-[#B1FA63] text-[#1a1a1a] hover:bg-[#9FE050]'
                      : 'border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#B1FA63] hover:text-[#1a1a1a]'
                  }`}
                >
                  Try CharityPrep
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="flex justify-center items-center gap-8 text-sm text-[#999] font-light">
            <span>30-day trial</span>
            <span className="w-1 h-1 bg-[#ddd] rounded-full"></span>
            <span>No credit card required</span>
            <span className="w-1 h-1 bg-[#ddd] rounded-full"></span>
            <span>Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}