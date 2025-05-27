/**
 * Lazy import utilities for reducing initial bundle size
 */

// Chart libraries (recharts is heavy)
export const lazyImportRecharts = () => import('recharts')

// PDF libraries
export const lazyImportPDFLib = () => import('pdf-lib')
export const lazyImportJsPDF = () => import('jspdf')

// Excel/CSV libraries
export const lazyImportXLSX = () => import('xlsx')
export const lazyImportPapaParse = () => import('papaparse')

// Date libraries
export const lazyImportDateFns = () => import('date-fns')
export const lazyImportDayjs = () => import('dayjs')

// Form libraries
export const lazyImportZod = () => import('zod')
export const lazyImportReactHookForm = () => import('react-hook-form')

// Animation libraries
export const lazyImportFramerMotion = () => import('framer-motion')
export const lazyImportLottie = () => import('lottie-react')

// Rich text editors
export const lazyImportQuill = () => import('quill')
export const lazyImportTipTap = () => import('@tiptap/react')

// Map libraries
export const lazyImportMapbox = () => import('mapbox-gl')
export const lazyImportLeaflet = () => import('leaflet')

// QR Code libraries
export const lazyImportQRCode = () => import('qrcode')

// Image processing
export const lazyImportSharp = () => import('sharp')
export const lazyImportJimp = () => import('jimp')

// Syntax highlighting
export const lazyImportPrism = () => import('prismjs')
export const lazyImportHighlight = () => import('highlight.js')

// Markdown
export const lazyImportMarked = () => import('marked')
export const lazyImportMarkdownIt = () => import('markdown-it')

// Utility to preload modules when idle
export function preloadWhenIdle(importFn: () => Promise<any>) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      importFn().catch(() => {
        // Silently fail - will load normally when needed
      })
    })
  }
}

// Utility to preload on hover/focus
export function preloadOnInteraction(
  element: HTMLElement | null,
  importFn: () => Promise<any>
) {
  if (!element) return

  let preloaded = false
  const preload = () => {
    if (!preloaded) {
      preloaded = true
      importFn().catch(() => {})
    }
  }

  element.addEventListener('mouseenter', preload, { once: true })
  element.addEventListener('focus', preload, { once: true })
  element.addEventListener('touchstart', preload, { once: true })
}

// React hook for lazy loading with preload
import { useEffect, useRef, useState } from 'react'

export function useLazyImport<T>(
  importFn: () => Promise<{ default: T }>,
  preloadTrigger?: 'hover' | 'focus' | 'idle'
) {
  const [module, setModule] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (preloadTrigger === 'idle') {
      preloadWhenIdle(importFn)
    } else if (preloadTrigger && elementRef.current) {
      preloadOnInteraction(elementRef.current, importFn)
    }
  }, [importFn, preloadTrigger])

  const load = async () => {
    if (module || loading) return

    setLoading(true)
    try {
      const imported = await importFn()
      setModule(imported.default)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { module, loading, error, load, elementRef }
}

// Cached lazy imports to avoid re-importing
const importCache = new Map<string, Promise<any>>()

export function cachedImport<T>(
  key: string,
  importFn: () => Promise<T>
): Promise<T> {
  if (!importCache.has(key)) {
    importCache.set(key, importFn())
  }
  return importCache.get(key)!
}

// Bundle splitting helpers
export const ChartComponents = {
  LineChart: () => cachedImport('recharts-line', async () => {
    const { LineChart } = await import('recharts')
    return LineChart
  }),
  BarChart: () => cachedImport('recharts-bar', async () => {
    const { BarChart } = await import('recharts')
    return BarChart
  }),
  PieChart: () => cachedImport('recharts-pie', async () => {
    const { PieChart } = await import('recharts')
    return PieChart
  }),
  AreaChart: () => cachedImport('recharts-area', async () => {
    const { AreaChart } = await import('recharts')
    return AreaChart
  })
}

// Optimize icon imports
export const Icons = {
  Lucide: (iconName: string) => cachedImport(`lucide-${iconName}`, async () => {
    const icons = await import('lucide-react')
    return icons[iconName as keyof typeof icons]
  }),
  Radix: (iconName: string) => cachedImport(`radix-${iconName}`, async () => {
    const icons = await import('@radix-ui/react-icons')
    return icons[iconName as keyof typeof icons]
  })
}