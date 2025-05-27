'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Cookie, Settings, Shield, BarChart3, ChevronDown, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  performance: boolean
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    performance: false,
  })

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookie-consent')
    if (!cookieConsent) {
      setIsVisible(true)
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(cookieConsent)
        setPreferences(savedPreferences)
      } catch (error) {
        console.error('Failed to parse cookie preferences:', error)
        setIsVisible(true)
      }
    }
  }, [])

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      performance: true,
    }
    savePreferences(allAccepted)
  }

  const acceptSelected = () => {
    savePreferences(preferences)
  }

  const rejectOptional = () => {
    const minimal = {
      necessary: true,
      analytics: false,
      marketing: false,
      performance: false,
    }
    savePreferences(minimal)
  }

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setIsVisible(false)
    
    // Apply preferences
    applyCookieSettings(prefs)
    
    // Reload page if analytics settings changed to ensure tracking scripts load properly
    if (prefs.analytics !== preferences.analytics) {
      window.location.reload()
    }
  }

  const applyCookieSettings = (prefs: CookiePreferences) => {
    // Set global flags for other components to check
    window.cookiePreferences = prefs
    
    // Analytics
    if (prefs.analytics && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      })
    } else if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      })
    }
    
    // Marketing
    if (!prefs.marketing) {
      // Clear marketing cookies if they exist
      document.cookie.split(";").forEach(cookie => {
        const [name] = cookie.split("=")
        if (name.trim().startsWith('_utm') || name.trim().startsWith('_fb')) {
          document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        }
      })
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/50 backdrop-blur-sm">
      <Card className="mx-auto max-w-4xl border-sage-200 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-inchworm/10 rounded-lg">
              <Cookie className="h-5 w-5 text-inchworm" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gunmetal">
                We value your privacy
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                We use cookies to enhance your experience, analyze performance, and provide personalized content. 
                You can customize your preferences below.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={acceptAll}
              className="bg-inchworm text-gunmetal hover:bg-inchworm/90"
            >
              Accept All
            </Button>
            <Button 
              onClick={rejectOptional}
              variant="outline"
            >
              Reject Optional
            </Button>
            <Button 
              onClick={() => setShowDetails(!showDetails)}
              variant="ghost"
              className="sm:ml-auto"
            >
              <Settings className="h-4 w-4 mr-2" />
              Customize
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Detailed Settings */}
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleContent className="space-y-4">
              <div className="grid gap-4">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <h4 className="font-medium text-gunmetal">Necessary Cookies</h4>
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Essential for website functionality, security, and your user experience. 
                      These cannot be disabled.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-10 h-6 bg-green-100 rounded-full flex items-center justify-end pr-1">
                      <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-gunmetal">Analytics Cookies</h4>
                      <Badge variant="outline" className="text-xs">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Help us understand how you use our website to improve performance and user experience.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                      className={`w-10 h-6 rounded-full flex items-center transition-all ${
                        preferences.analytics 
                          ? 'bg-inchworm justify-end pr-1' 
                          : 'bg-gray-300 justify-start pl-1'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                    </button>
                  </div>
                </div>

                {/* Performance Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                      <h4 className="font-medium text-gunmetal">Performance Cookies</h4>
                      <Badge variant="outline" className="text-xs">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Monitor website performance and optimize loading times for better user experience.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, performance: !prev.performance }))}
                      className={`w-10 h-6 rounded-full flex items-center transition-all ${
                        preferences.performance 
                          ? 'bg-inchworm justify-end pr-1' 
                          : 'bg-gray-300 justify-start pl-1'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                    </button>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <ExternalLink className="h-4 w-4 text-orange-600" />
                      <h4 className="font-medium text-gunmetal">Marketing Cookies</h4>
                      <Badge variant="outline" className="text-xs">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enable personalized advertising and measure the effectiveness of our marketing campaigns.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                      className={`w-10 h-6 rounded-full flex items-center transition-all ${
                        preferences.marketing 
                          ? 'bg-inchworm justify-end pr-1' 
                          : 'bg-gray-300 justify-start pl-1'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button 
                  onClick={acceptSelected}
                  className="bg-inchworm text-gunmetal hover:bg-inchworm/90"
                >
                  Save Preferences
                </Button>
                <Link href="/privacy" className="flex-1">
                  <Button variant="ghost" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy Policy
                  </Button>
                </Link>
                <Link href="/cookies" className="flex-1">
                  <Button variant="ghost" className="w-full">
                    <Cookie className="h-4 w-4 mr-2" />
                    Cookie Policy
                  </Button>
                </Link>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook to check cookie preferences
export function useCookiePreferences(): CookiePreferences | null {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (consent) {
      try {
        setPreferences(JSON.parse(consent))
      } catch (error) {
        console.error('Failed to parse cookie preferences:', error)
      }
    }
  }, [])

  return preferences
}

// Utility to check if specific cookie type is allowed
export function isCookieAllowed(type: keyof CookiePreferences): boolean {
  if (typeof window === 'undefined') return false
  
  const consent = localStorage.getItem('cookie-consent')
  if (!consent) return false
  
  try {
    const preferences = JSON.parse(consent)
    return preferences[type] === true
  } catch (error) {
    return false
  }
}

// Global type for cookie preferences
declare global {
  interface Window {
    cookiePreferences?: CookiePreferences
  }
}