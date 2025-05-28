'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Download, 
  ExternalLink, 
  Calendar,
  Users,
  HardDrive,
  Zap,
  FileText,
  AlertTriangle,
  Crown,
  CheckCircle
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { 
  getSubscriptionOverview, 
  createPortalSession,
  cancelSubscription,
  reactivateSubscription,
  getInvoices,
  getPaymentMethod
} from '@/features/subscription/actions/billing'
import { STRIPE_PRODUCTS, formatPrice } from '@/lib/payments/stripe'
import { UpgradeModal } from './upgrade-modal'
import { toast } from 'sonner'

interface BillingData {
  subscription: {
    tier: string
    status: string
    billingCycle: 'monthly' | 'yearly'
    currentPeriodEnd: Date
    cancelAtPeriodEnd: boolean
  } | null
  usage: {
    users: { current: number; limit: number }
    storage: { current: number; limit: number }
    aiRequests: { current: number; limit: number }
    exports: { current: number; limit: number }
  } | null
  invoices: Array<{
    id: string
    number: string
    amount: number
    status: string
    paidAt?: string
    hostedUrl?: string
  }>
  paymentMethod: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  } | null
}

export function BillingDashboard() {
  const [billingData, setBillingData] = useState<BillingData>({
    subscription: null,
    usage: null,
    invoices: [],
    paymentMethod: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const { currentOrganization } = useAuthStore()

  useEffect(() => {
    loadBillingData()
  }, [currentOrganization?.id])

  const loadBillingData = async () => {
    if (!currentOrganization?.id) return
    
    setIsLoading(true)
    try {
      // Load subscription overview
      const overview = await getSubscriptionOverview(currentOrganization.id)
      
      // Load invoices and payment method
      const [invoicesData, paymentMethodData] = await Promise.all([
        getInvoices(currentOrganization.id),
        getPaymentMethod(currentOrganization.id)
      ])
      
      setBillingData({
        subscription: overview.hasSubscription ? {
          tier: overview.tier!,
          status: overview.status!,
          billingCycle: overview.billingCycle!,
          currentPeriodEnd: new Date(overview.currentPeriodEnd!),
          cancelAtPeriodEnd: overview.cancelAtPeriodEnd!
        } : null,
        usage: overview.usage,
        invoices: invoicesData.invoices || [],
        paymentMethod: paymentMethodData.paymentMethod
      })
    } catch (error) {
      console.error('Error loading billing data:', error)
      toast.error('Failed to load billing information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!currentOrganization?.id) return
    
    setActionLoading('cancel')
    try {
      const result = await cancelSubscription({ organizationId: currentOrganization.id })
      await loadBillingData()
      toast.success(result.message)
    } catch (error) {
      console.error('Error canceling subscription:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to cancel subscription')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReactivateSubscription = async () => {
    if (!currentOrganization?.id) return
    
    setActionLoading('reactivate')
    try {
      const result = await reactivateSubscription({ organizationId: currentOrganization.id })
      await loadBillingData()
      toast.success(result.message)
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to reactivate subscription')
    } finally {
      setActionLoading(null)
    }
  }

  const handleManagePayment = async () => {
    if (!currentOrganization?.id) return
    
    setActionLoading('payment')
    try {
      // Server action will handle the redirect
      await createPortalSession({ organizationId: currentOrganization.id })
    } catch (error) {
      console.error('Error creating portal session:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to open billing portal')
      setActionLoading(null)
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Current Plan
              </CardTitle>
              <CardDescription>
                Your subscription details and billing information
              </CardDescription>
            </div>
            {billingData.subscription && (
              <Badge variant={billingData.subscription.status === 'active' ? 'default' : 'secondary'}>
                {billingData.subscription.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {billingData.subscription ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">
                    {STRIPE_PRODUCTS[billingData.subscription.tier as keyof typeof STRIPE_PRODUCTS]?.name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {billingData.subscription.billingCycle === 'yearly' ? 'Annual' : 'Monthly'} billing
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {billingData.subscription.cancelAtPeriodEnd 
                      ? `Cancels on ${billingData.subscription.currentPeriodEnd.toLocaleDateString()}`
                      : `Next billing: ${billingData.subscription.currentPeriodEnd.toLocaleDateString()}`
                    }
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-light">
                    {formatPrice(
                      STRIPE_PRODUCTS[billingData.subscription.tier as keyof typeof STRIPE_PRODUCTS]?.price[
                        billingData.subscription.billingCycle === 'yearly' ? 'yearly' : 'monthly'
                      ] || 0
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    per {billingData.subscription.billingCycle === 'yearly' ? 'year' : 'month'}
                  </p>
                </div>
              </div>

              {billingData.subscription.cancelAtPeriodEnd && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your subscription will be canceled at the end of the current billing period.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowUpgradeModal(true)}
                  disabled={billingData.subscription.cancelAtPeriodEnd}
                >
                  Change Plan
                </Button>
                
                {billingData.subscription.cancelAtPeriodEnd ? (
                  <Button 
                    variant="outline"
                    onClick={handleReactivateSubscription}
                    disabled={actionLoading === 'reactivate'}
                  >
                    {actionLoading === 'reactivate' ? 'Reactivating...' : 'Reactivate'}
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={handleCancelSubscription}
                    disabled={actionLoading === 'cancel'}
                  >
                    {actionLoading === 'cancel' ? 'Canceling...' : 'Cancel Subscription'}
                  </Button>
                )}

                <Button 
                  variant="outline"
                  onClick={handleManagePayment}
                  disabled={actionLoading === 'payment'}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {actionLoading === 'payment' ? 'Loading...' : 'Manage Payment'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
              <p className="text-gray-600 mb-4">
                Upgrade to unlock advanced features and higher limits
              </p>
              <Button onClick={() => setShowUpgradeModal(true)}>
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
          <TabsTrigger value="payment">Payment Method</TabsTrigger>
        </TabsList>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          {billingData.usage ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="w-4 h-4" />
                    Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Current Usage</span>
                      <span>
                        {billingData.usage.users.current} of {billingData.usage.users.limit === -1 ? '∞' : billingData.usage.users.limit}
                      </span>
                    </div>
                    {billingData.usage.users.limit !== -1 && (
                      <Progress 
                        value={getUsagePercentage(billingData.usage.users.current, billingData.usage.users.limit)}
                        className="h-2"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Storage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HardDrive className="w-4 h-4" />
                    Storage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Current Usage</span>
                      <span>
                        {formatBytes(billingData.usage.storage.current)} of {billingData.usage.storage.limit === -1 ? '∞' : formatBytes(billingData.usage.storage.limit)}
                      </span>
                    </div>
                    {billingData.usage.storage.limit !== -1 && (
                      <Progress 
                        value={getUsagePercentage(billingData.usage.storage.current, billingData.usage.storage.limit)}
                        className="h-2"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="w-4 h-4" />
                    AI Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>This Month</span>
                      <span>
                        {billingData.usage.aiRequests.current} of {billingData.usage.aiRequests.limit === -1 ? '∞' : billingData.usage.aiRequests.limit}
                      </span>
                    </div>
                    {billingData.usage.aiRequests.limit !== -1 && (
                      <Progress 
                        value={getUsagePercentage(billingData.usage.aiRequests.current, billingData.usage.aiRequests.limit)}
                        className="h-2"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Exports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-4 h-4" />
                    Exports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>This Month</span>
                      <span>
                        {billingData.usage.exports.current} of {billingData.usage.exports.limit === -1 ? '∞' : billingData.usage.exports.limit}
                      </span>
                    </div>
                    {billingData.usage.exports.limit !== -1 && (
                      <Progress 
                        value={getUsagePercentage(billingData.usage.exports.current, billingData.usage.exports.limit)}
                        className="h-2"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No usage data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Billing History Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Download past invoices and view payment history</CardDescription>
            </CardHeader>
            <CardContent>
              {billingData.invoices.length > 0 ? (
                <div className="space-y-4">
                  {billingData.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Invoice #{invoice.number}</p>
                          <p className="text-sm text-gray-600">
                            {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : 'Pending'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold">{formatPrice(invoice.amount)}</p>
                        {invoice.hostedUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={invoice.hostedUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No invoices available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Method Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your default payment method</CardDescription>
            </CardHeader>
            <CardContent>
              {billingData.paymentMethod ? (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {billingData.paymentMethod.brand.toUpperCase()} •••• {billingData.paymentMethod.last4}
                      </p>
                      <p className="text-sm text-gray-600">
                        Expires {billingData.paymentMethod.expMonth}/{billingData.paymentMethod.expYear}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleManagePayment}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Update
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No payment method on file</p>
                  <Button onClick={handleManagePayment}>
                    Add Payment Method
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={billingData.subscription?.tier as any}
        onUpgrade={() => {
          setShowUpgradeModal(false)
          loadBillingData()
        }}
      />
    </div>
  )
}