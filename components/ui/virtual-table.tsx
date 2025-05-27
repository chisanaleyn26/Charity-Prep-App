'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface VirtualTableProps<T> {
  data: T[]
  columns: {
    key: string
    header: string
    width?: number
    render?: (item: T) => React.ReactNode
  }[]
  rowHeight?: number
  visibleRows?: number
  className?: string
  onRowClick?: (item: T) => void
}

export function VirtualTable<T extends Record<string, any>>({
  data,
  columns,
  rowHeight = 52,
  visibleRows = 10,
  className,
  onRowClick
}: VirtualTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(visibleRows * rowHeight)

  // Calculate visible range
  const startIndex = Math.floor(scrollTop / rowHeight)
  const endIndex = Math.min(startIndex + Math.ceil(containerHeight / rowHeight) + 1, data.length)
  const visibleData = data.slice(startIndex, endIndex)
  const totalHeight = data.length * rowHeight
  const offsetY = startIndex * rowHeight

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Resize observer
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-auto border rounded-lg", className)}
      style={{ height: `${visibleRows * rowHeight}px` }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight }}>
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  style={{ width: column.width }}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <tr style={{ height: offsetY }} />
            {visibleData.map((item, index) => (
              <TableRow
                key={startIndex + index}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                style={{ height: rowHeight }}
              >
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render ? column.render(item) : item[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Hook for infinite scrolling
export function useInfiniteScroll<T>(
  loadMore: () => Promise<T[]>,
  options?: {
    threshold?: number
    rootMargin?: string
  }
) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<IntersectionObserver>()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const newItems = await loadMore()
      setItems(prev => [...prev, ...newItems])
      setHasMore(newItems.length > 0)
    } catch (error) {
      console.error('Failed to load more items:', error)
    } finally {
      setLoading(false)
    }
  }, [loadMore, loading, hasMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          load()
        }
      },
      {
        threshold: options?.threshold || 0.1,
        rootMargin: options?.rootMargin || '100px'
      }
    )

    observerRef.current = observer

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [load, options?.threshold, options?.rootMargin])

  return {
    items,
    loading,
    hasMore,
    loadMoreRef,
    reset: () => {
      setItems([])
      setHasMore(true)
    }
  }
}

// Optimized table with search and sort
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Search } from 'lucide-react'

interface OptimizedTableProps<T> extends VirtualTableProps<T> {
  searchable?: boolean
  sortable?: boolean
  searchKeys?: string[]
}

export function OptimizedTable<T extends Record<string, any>>({
  data: initialData,
  searchable = false,
  sortable = false,
  searchKeys = [],
  ...props
}: OptimizedTableProps<T>) {
  const [data, setData] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  // Filter data
  useEffect(() => {
    let filtered = [...initialData]

    if (searchable && searchTerm) {
      filtered = filtered.filter(item => {
        const searchIn = searchKeys.length > 0 ? searchKeys : Object.keys(item)
        return searchIn.some(key => 
          String(item[key]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    if (sortable && sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    setData(filtered)
  }, [initialData, searchTerm, sortConfig, searchable, sortable, searchKeys])

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' }
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' }
      }
      return null
    })
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      )}
      
      <VirtualTable
        {...props}
        data={data}
        columns={props.columns.map(col => ({
          ...col,
          header: sortable ? (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
              onClick={() => handleSort(col.key)}
            >
              {col.header}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ) : col.header
        }))}
      />
    </div>
  )
}