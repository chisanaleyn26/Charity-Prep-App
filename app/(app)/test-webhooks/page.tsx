'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle, CreditCard, Mail } from 'lucide-react'

type WebhookEvent = {
  id: string
  type: string
  timestamp: Date
  status: 'success' | 'failed' | 'pending'
  data: any
}

export default function TestWebhooksPage() {
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([])
  const [testInProgress, setTestInProgress] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)

  // Stripe webhook test
  const testStripeWebhook = async (eventType: string) => {
    setTestInProgress(true)
    setTestResults(null)

    try {
      // Create test webhook payload
      const testPayload = {
        id: `evt_test_${Date.now()}`,
        object: 'event',
        type: eventType,
        created: Math.floor(Date.now() / 1000),
        data: {
          object: getMockDataForEvent(eventType)
        }
      }

      // Note: In production, stripe-signature would be computed using webhook secret
      // For testing, we'll simulate the webhook locally
      const response = await fetch('/api/webhooks/stripe/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      })

      const result = await response.json()
      
      const event: WebhookEvent = {
        id: testPayload.id,
        type: eventType,
        timestamp: new Date(),
        status: response.ok ? 'success' : 'failed',
        data: result
      }

      setWebhookEvents(prev => [event, ...prev])
      setTestResults({
        type: 'stripe',
        success: response.ok,
        status: response.status,
        data: result
      })

    } catch (error) {
      console.error('Webhook test failed:', error)
      setTestResults({
        type: 'stripe',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setTestInProgress(false)
    }
  }

  // Email webhook test
  const testEmailWebhook = async () => {
    setTestInProgress(true)
    setTestResults(null)

    try {
      const testEmail = {
        from: 'donor@example.com',
        to: 'charity@charityprep.uk',
        subject: 'Test Donation Receipt',
        text: 'Thank you for your donation of £100',
        html: '<p>Thank you for your donation of <strong>£100</strong></p>',
        attachments: []
      }

      const response = await fetch('/api/webhooks/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': process.env.NEXT_PUBLIC_EMAIL_WEBHOOK_SECRET || 'test'
        },
        body: JSON.stringify(testEmail)
      })

      const result = await response.json()
      
      const event: WebhookEvent = {
        id: `email_${Date.now()}`,
        type: 'email.received',
        timestamp: new Date(),
        status: response.ok ? 'success' : 'failed',
        data: result
      }

      setWebhookEvents(prev => [event, ...prev])
      setTestResults({
        type: 'email',
        success: response.ok,
        status: response.status,
        data: result
      })

    } catch (error) {
      console.error('Email webhook test failed:', error)
      setTestResults({
        type: 'email',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setTestInProgress(false)
    }
  }

  const getMockDataForEvent = (eventType: string) => {
    switch (eventType) {
      case 'checkout.session.completed':
        return {
          id: 'cs_test_123',
          customer: 'cus_test_123',
          subscription: 'sub_test_123',
          metadata: {
            organizationId: 'org_test_123',
            tier: 'standard'
          }
        }
      
      case 'customer.subscription.updated':
        return {
          id: 'sub_test_123',
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          metadata: {
            organizationId: 'org_test_123'
          }
        }
      
      case 'invoice.payment_succeeded':
        return {
          id: 'in_test_123',
          customer: 'cus_test_123',
          amount_paid: 7900,
          currency: 'gbp'
        }
      
      case 'invoice.payment_failed':
        return {
          id: 'in_test_123',
          customer: 'cus_test_123',
          amount_due: 7900,
          currency: 'gbp'
        }
      
      default:
        return {}
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Webhook Testing</h1>
        <p className="text-muted-foreground">Test webhook integrations and view responses</p>
      </div>

      <Tabs defaultValue="stripe" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stripe">
            <CreditCard className="h-4 w-4 mr-2" />
            Stripe Webhooks
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Webhook Testing</CardTitle>
              <CardDescription>
                Test different Stripe webhook events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => testStripeWebhook('checkout.session.completed')}
                  disabled={testInProgress}
                  variant="outline"
                >
                  Test Checkout Complete
                </Button>
                <Button
                  onClick={() => testStripeWebhook('customer.subscription.updated')}
                  disabled={testInProgress}
                  variant="outline"
                >
                  Test Subscription Update
                </Button>
                <Button
                  onClick={() => testStripeWebhook('invoice.payment_succeeded')}
                  disabled={testInProgress}
                  variant="outline"
                >
                  Test Payment Success
                </Button>
                <Button
                  onClick={() => testStripeWebhook('invoice.payment_failed')}
                  disabled={testInProgress}
                  variant="outline"
                >
                  Test Payment Failed
                </Button>
              </div>

              {testResults && testResults.type === 'stripe' && (
                <Alert className={testResults.success ? 'border-green-500' : 'border-red-500'}>
                  <AlertDescription>
                    {testResults.success ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Webhook processed successfully</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>Webhook failed: {testResults.error || 'Unknown error'}</span>
                      </div>
                    )}
                    {testResults.data && (
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(testResults.data, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Webhook Testing</CardTitle>
              <CardDescription>
                Test inbound email processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={testEmailWebhook}
                disabled={testInProgress}
                className="w-full"
              >
                Send Test Email
              </Button>

              {testResults && testResults.type === 'email' && (
                <Alert className={testResults.success ? 'border-green-500' : 'border-red-500'}>
                  <AlertDescription>
                    {testResults.success ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Email processed successfully</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>Email processing failed: {testResults.error || 'Unknown error'}</span>
                      </div>
                    )}
                    {testResults.data && (
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(testResults.data, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Log */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Event Log</CardTitle>
          <CardDescription>
            Recent webhook events and responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {webhookEvents.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No webhook events yet. Run a test above to see results.
              </p>
            ) : (
              webhookEvents.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {event.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : event.status === 'failed' ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="font-medium text-sm">{event.type}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}