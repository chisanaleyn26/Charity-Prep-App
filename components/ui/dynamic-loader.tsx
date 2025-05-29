'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import { 
  FormSkeleton,
  ChartSkeleton,
  TableSkeleton,
  DocumentUploadSkeleton,
  CardGridSkeleton,
  StatsSkeleton
} from './loading-skeletons'

// Dynamic component loader with different loading states
export function createDynamicComponent<T = any>(
  loader: () => Promise<{ default: ComponentType<T> }>,
  loadingComponent?: ComponentType,
  ssr: boolean = false
) {
  return dynamic(loader, {
    loading: loadingComponent ? () => loadingComponent({}) : undefined,
    ssr
  })
}

// Pre-configured dynamic loaders for common heavy components

// PDF Viewer (heavy library)
export const DynamicPDFViewer = dynamic(
  () => import('@/components/reports/pdf-viewer').catch(() => ({ default: () => <div>PDF Viewer not available</div> })),
  {
    loading: () => <ChartSkeleton height="h-96" />,
    ssr: false
  }
)

// Chart components (recharts is heavy)
export const DynamicChart = dynamic(
  () => import('@/features/dashboard/components/compliance-trend-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

export const DynamicCategoryChart = dynamic(
  () => import('@/features/dashboard/components/category-breakdown-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

// Document processor (OCR libraries are heavy)
export const DynamicDocumentProcessor = dynamic(
  () => import('@/features/ai/components/document-extractor'),
  {
    loading: () => <DocumentUploadSkeleton />,
    ssr: false
  }
)


// Rich text editor (heavy editor)
export const DynamicRichTextEditor = dynamic(
  () => import('@/components/ui/rich-text-editor').catch(() => ({ default: () => <FormSkeleton /> })),
  {
    loading: () => <FormSkeleton />,
    ssr: false
  }
)

// Date picker (react-day-picker)
export const DynamicDatePicker = dynamic(
  () => import('@/components/ui/date-picker'),
  {
    loading: () => <div className="h-10 bg-gray-100 animate-pulse rounded" />,
    ssr: false
  }
)

// Data tables with sorting/filtering
export const DynamicDataTable = dynamic(
  () => import('@/components/ui/data-table'),
  {
    loading: () => <TableSkeleton />,
    ssr: false
  }
)

// Report generator (complex forms)
export const DynamicReportGenerator = dynamic(
  () => import('@/features/ai/components/report-generator'),
  {
    loading: () => <FormSkeleton />,
    ssr: false
  }
)

// Calendar component
export const DynamicCalendar = dynamic(
  () => import('@/components/ui/calendar'),
  {
    loading: () => <CardGridSkeleton count={1} />,
    ssr: false
  }
)

// Map component (if using maps)
export const DynamicMap = dynamic(
  () => import('@/components/ui/map').catch(() => ({ default: () => <div>Map not available</div> })),
  {
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
    ssr: false
  }
)

// QR Code generator
export const DynamicQRCode = dynamic(
  () => import('@/components/ui/qr-code').catch(() => ({ default: () => <div>QR Code not available</div> })),
  {
    loading: () => <div className="h-32 w-32 bg-gray-100 animate-pulse rounded" />,
    ssr: false
  }
)

// File uploader with preview
export const DynamicFileUploader = dynamic(
  () => import('@/components/ui/file-uploader'),
  {
    loading: () => <DocumentUploadSkeleton />,
    ssr: false
  }
)

// Advanced search component
export const DynamicAdvancedSearch = dynamic(
  () => import('@/features/ai/components/smart-search'),
  {
    loading: () => <FormSkeleton />,
    ssr: false
  }
)

// Analytics dashboard
export const DynamicAnalyticsDashboard = dynamic(
  () => import('@/features/analytics/components/dashboard'),
  {
    loading: () => <StatsSkeleton />,
    ssr: false
  }
)

// Export utilities
export const DynamicExportDialog = dynamic(
  () => import('@/components/ui/export-dialog'),
  {
    loading: () => <FormSkeleton />,
    ssr: false
  }
)

// Utility function to create dynamic component with error boundary
export function withErrorBoundary<T = any>(
  DynamicComponent: ComponentType<T>,
  fallback?: ComponentType<T>
) {
  return function WrappedComponent(props: T) {
    try {
      return <DynamicComponent {...props} />
    } catch (error) {
      console.error('Dynamic component failed to load:', error)
      return fallback ? <fallback {...props} /> : <div>Component failed to load</div>
    }
  }
}

// Preload specific components when user hovers or focuses
export function preloadComponent(loader: () => Promise<any>) {
  return () => {
    // Only preload in browser
    if (typeof window !== 'undefined') {
      loader().catch(() => {
        // Silently fail - component will load normally when needed
      })
    }
  }
}

// Pre-configured preloaders
export const preloadPDFViewer = preloadComponent(() => import('@/components/reports/pdf-viewer'))
export const preloadDocumentProcessor = preloadComponent(() => import('@/features/ai/components/document-extractor'))
export const preloadCharts = preloadComponent(() => import('@/features/dashboard/components/compliance-trend-chart'))