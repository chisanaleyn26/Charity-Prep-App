'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

// Google Analytics tracking
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track page views
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
        page_location: window.location.origin + url,
        page_title: document.title,
      })
    }
  }, [pathname, searchParams])

  if (!process.env.NEXT_PUBLIC_GA_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure',
            send_page_view: false
          });
        `}
      </Script>
    </>
  )
}

// PostHog Analytics (Alternative/Additional)
export function PostHogAnalytics() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return null
  }

  return (
    <Script id="posthog-analytics" strategy="afterInteractive">
      {`
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        posthog.init('${process.env.NEXT_PUBLIC_POSTHOG_KEY}', {
          api_host: '${process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'}',
          autocapture: false,
          capture_pageview: false
        })
      `}
    </Script>
  )
}

// Event tracking utilities
export const analytics = {
  // Track page view
  trackPageView: (url: string, title?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_location: url,
        page_title: title || document.title,
      })
    }
  },

  // Track custom events
  trackEvent: (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        custom_parameter: true,
        ...parameters,
      })
    }
  },

  // Track user actions
  trackUserAction: (action: string, category: string, label?: string, value?: number) => {
    analytics.trackEvent('user_action', {
      action,
      category,
      label,
      value,
    })
  },

  // Track feature usage
  trackFeatureUsage: (feature: string, action: string, metadata?: Record<string, any>) => {
    analytics.trackEvent('feature_usage', {
      feature,
      action,
      ...metadata,
    })
  },

  // Track form interactions
  trackFormStart: (formName: string) => {
    analytics.trackEvent('form_start', { form_name: formName })
  },

  trackFormComplete: (formName: string, success: boolean = true) => {
    analytics.trackEvent('form_complete', { 
      form_name: formName,
      success: success ? 'true' : 'false'
    })
  },

  trackFormFieldInteraction: (formName: string, fieldName: string) => {
    analytics.trackEvent('form_field_interaction', {
      form_name: formName,
      field_name: fieldName,
    })
  },

  // Track business events
  trackSignup: (method: string) => {
    analytics.trackEvent('sign_up', { method })
  },

  trackLogin: (method: string) => {
    analytics.trackEvent('login', { method })
  },

  trackSubscription: (plan: string, value: number) => {
    analytics.trackEvent('subscribe', {
      plan,
      value,
      currency: 'GBP',
    })
  },

  trackDocumentUpload: (type: string, size: number) => {
    analytics.trackEvent('document_upload', {
      document_type: type,
      file_size: size,
    })
  },

  trackReportGeneration: (reportType: string, success: boolean) => {
    analytics.trackEvent('report_generation', {
      report_type: reportType,
      success: success ? 'true' : 'false',
    })
  },

  trackSearch: (query: string, results: number) => {
    analytics.trackEvent('search', {
      search_term: query.substring(0, 100), // Limit for privacy
      results_count: results,
    })
  },

  trackAiInteraction: (feature: string, success: boolean, responseTime?: number) => {
    analytics.trackEvent('ai_interaction', {
      ai_feature: feature,
      success: success ? 'true' : 'false',
      response_time: responseTime,
    })
  },

  trackError: (errorType: string, errorMessage: string, severity: string) => {
    analytics.trackEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage.substring(0, 100),
      severity,
    })
  },

  trackPerformance: (metric: string, value: number, url?: string) => {
    analytics.trackEvent('performance_metric', {
      metric_name: metric,
      metric_value: Math.round(value),
      page_url: url || window.location.pathname,
    })
  },

  // E-commerce tracking
  trackPurchase: (transactionId: string, value: number, items: any[]) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: value,
        currency: 'GBP',
        items: items,
      })
    }
  },

  // Conversion tracking
  trackConversion: (conversionType: string, value?: number) => {
    analytics.trackEvent('conversion', {
      conversion_type: conversionType,
      value: value,
    })
  },

  // User identification (for authenticated users)
  identifyUser: (userId: string, traits?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
        user_id: userId,
        custom_map: traits,
      })
    }
  },

  // Set user properties
  setUserProperty: (property: string, value: string | number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'user_property', {
        [property]: value,
      })
    }
  },

  // Track timing events
  trackTiming: (category: string, variable: string, value: number, label?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: variable,
        value: Math.round(value),
        event_category: category,
        event_label: label,
      })
    }
  },
}

// Hook for tracking page views automatically
export function useAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    analytics.trackPageView(window.location.href, document.title)
  }, [pathname])

  return analytics
}

// Higher-order component for tracking component views
export function withAnalytics<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return function AnalyticsWrappedComponent(props: T) {
    useEffect(() => {
      analytics.trackEvent('component_view', {
        component_name: componentName,
      })
    }, [])

    return <Component {...props} />
  }
}