'use client'

import React from 'react'
import { BillingDashboard } from '@/features/subscription/components/billing-dashboard'

export default function BillingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription, billing information, and usage metrics.
          </p>
        </div>
        
        <BillingDashboard />
      </div>
    </div>
  )
}