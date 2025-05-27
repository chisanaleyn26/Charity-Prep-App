// Database optimization utilities for Supabase

import { createClient } from '@/lib/supabase/server'
import { createClient as createClientClient } from '@/lib/supabase/client'

// Cache for frequently accessed data
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Database query optimizer
export class DatabaseOptimizer {
  private static readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
  private static readonly SHORT_TTL = 30 * 1000 // 30 seconds
  private static readonly LONG_TTL = 60 * 60 * 1000 // 1 hour

  // Generate cache key from query parameters
  private static generateCacheKey(
    table: string,
    filters: Record<string, any> = {},
    options: Record<string, any> = {}
  ): string {
    return `${table}:${JSON.stringify(filters)}:${JSON.stringify(options)}`
  }

  // Check if cached data is still valid
  private static isCacheValid(cacheKey: string): boolean {
    const cached = queryCache.get(cacheKey)
    if (!cached) return false
    
    return Date.now() - cached.timestamp < cached.ttl
  }

  // Get data from cache
  private static getCachedData(cacheKey: string): any | null {
    if (this.isCacheValid(cacheKey)) {
      return queryCache.get(cacheKey)?.data || null
    }
    
    // Remove expired cache
    queryCache.delete(cacheKey)
    return null
  }

  // Set data in cache
  private static setCachedData(cacheKey: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    queryCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  // Optimized query with caching
  static async cachedQuery<T = any>(
    table: string,
    filters: Record<string, any> = {},
    options: {
      select?: string
      orderBy?: string
      limit?: number
      offset?: number
      cache?: boolean
      ttl?: number
      joins?: string[]
    } = {}
  ): Promise<{ data: T[] | null; error: any; cached?: boolean }> {
    const { cache = true, ttl = this.DEFAULT_TTL, ...queryOptions } = options
    const cacheKey = this.generateCacheKey(table, filters, queryOptions)

    // Check cache first
    if (cache) {
      const cachedData = this.getCachedData(cacheKey)
      if (cachedData) {
        return { data: cachedData, error: null, cached: true }
      }
    }

    try {
      const supabase = await createClient()
      let query = supabase.from(table)

      // Apply select
      if (queryOptions.select) {
        query = query.select(queryOptions.select)
      } else {
        query = query.select('*')
      }

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else if (typeof value === 'object' && value !== null) {
          // Handle complex filters like { gte: 100 }, { ilike: '%search%' }
          Object.entries(value).forEach(([operator, operatorValue]) => {
            switch (operator) {
              case 'eq':
                query = query.eq(key, operatorValue)
                break
              case 'neq':
                query = query.neq(key, operatorValue)
                break
              case 'gt':
                query = query.gt(key, operatorValue)
                break
              case 'gte':
                query = query.gte(key, operatorValue)
                break
              case 'lt':
                query = query.lt(key, operatorValue)
                break
              case 'lte':
                query = query.lte(key, operatorValue)
                break
              case 'like':
                query = query.like(key, operatorValue)
                break
              case 'ilike':
                query = query.ilike(key, operatorValue)
                break
              case 'is':
                query = query.is(key, operatorValue)
                break
              case 'in':
                query = query.in(key, operatorValue)
                break
              case 'contains':
                query = query.contains(key, operatorValue)
                break
              case 'containedBy':
                query = query.containedBy(key, operatorValue)
                break
              case 'overlaps':
                query = query.overlaps(key, operatorValue)
                break
            }
          })
        } else {
          query = query.eq(key, value)
        }
      })

      // Apply ordering
      if (queryOptions.orderBy) {
        const [column, direction = 'asc'] = queryOptions.orderBy.split(':')
        query = query.order(column, { ascending: direction === 'asc' })
      }

      // Apply pagination
      if (queryOptions.limit) {
        query = query.limit(queryOptions.limit)
      }
      if (queryOptions.offset) {
        query = query.range(queryOptions.offset, queryOptions.offset + (queryOptions.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error(`Database query error for table ${table}:`, error)
        return { data: null, error }
      }

      // Cache successful results
      if (cache && data) {
        this.setCachedData(cacheKey, data, ttl)
      }

      return { data, error: null }
    } catch (error) {
      console.error(`Database connection error for table ${table}:`, error)
      return { data: null, error }
    }
  }

  // Optimized insert with conflict resolution
  static async optimizedInsert<T = any>(
    table: string,
    data: Record<string, any> | Record<string, any>[],
    options: {
      onConflict?: string
      ignoreDuplicates?: boolean
      upsert?: boolean
      returning?: string
    } = {}
  ): Promise<{ data: T[] | null; error: any }> {
    try {
      const supabase = await createClient()
      let query = supabase.from(table)

      if (options.upsert) {
        query = query.upsert(data as any, {
          onConflict: options.onConflict,
          ignoreDuplicates: options.ignoreDuplicates
        })
      } else {
        query = query.insert(data as any)
      }

      if (options.returning) {
        query = query.select(options.returning)
      }

      const { data: result, error } = await query

      if (error) {
        console.error(`Database insert error for table ${table}:`, error)
        return { data: null, error }
      }

      // Invalidate related cache entries
      this.invalidateTableCache(table)

      return { data: result, error: null }
    } catch (error) {
      console.error(`Database insert error for table ${table}:`, error)
      return { data: null, error }
    }
  }

  // Optimized update with optimistic locking
  static async optimizedUpdate<T = any>(
    table: string,
    data: Record<string, any>,
    filters: Record<string, any>,
    options: {
      returning?: string
      checkVersion?: boolean
      version?: number
    } = {}
  ): Promise<{ data: T[] | null; error: any }> {
    try {
      const supabase = await createClient()
      let query = supabase.from(table)

      // Add version check for optimistic locking
      if (options.checkVersion && options.version !== undefined) {
        filters.version = options.version
        data.version = options.version + 1
      }

      query = query.update(data)

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })

      if (options.returning) {
        query = query.select(options.returning)
      }

      const { data: result, error } = await query

      if (error) {
        console.error(`Database update error for table ${table}:`, error)
        return { data: null, error }
      }

      // Invalidate related cache entries
      this.invalidateTableCache(table)

      return { data: result, error: null }
    } catch (error) {
      console.error(`Database update error for table ${table}:`, error)
      return { data: null, error }
    }
  }

  // Batch operations for better performance
  static async batchOperation<T = any>(
    operations: Array<{
      type: 'insert' | 'update' | 'delete'
      table: string
      data?: Record<string, any> | Record<string, any>[]
      filters?: Record<string, any>
      options?: Record<string, any>
    }>
  ): Promise<{ results: Array<{ data: T[] | null; error: any }>; errors: any[] }> {
    const results: Array<{ data: T[] | null; error: any }> = []
    const errors: any[] = []

    try {
      const supabase = await createClient()

      // Group operations by table for better performance
      const operationsByTable = operations.reduce((acc, op) => {
        if (!acc[op.table]) acc[op.table] = []
        acc[op.table].push(op)
        return acc
      }, {} as Record<string, typeof operations>)

      // Execute operations table by table
      for (const [table, tableOps] of Object.entries(operationsByTable)) {
        for (const operation of tableOps) {
          try {
            let result
            
            switch (operation.type) {
              case 'insert':
                result = await this.optimizedInsert(table, operation.data!, operation.options)
                break
              case 'update':
                result = await this.optimizedUpdate(table, operation.data!, operation.filters!, operation.options)
                break
              case 'delete':
                // Implement delete operation
                let deleteQuery = supabase.from(table).delete()
                Object.entries(operation.filters || {}).forEach(([key, value]) => {
                  deleteQuery = deleteQuery.eq(key, value)
                })
                result = await deleteQuery
                break
              default:
                result = { data: null, error: `Unknown operation type: ${operation.type}` }
            }
            
            results.push(result)
          } catch (opError) {
            const errorResult = { data: null, error: opError }
            results.push(errorResult)
            errors.push(opError)
          }
        }
      }

      return { results, errors }
    } catch (error) {
      console.error('Batch operation error:', error)
      return {
        results: operations.map(() => ({ data: null, error })),
        errors: [error]
      }
    }
  }

  // Invalidate cache for a table
  static invalidateTableCache(table: string): void {
    const keysToDelete: string[] = []
    
    queryCache.forEach((_, key) => {
      if (key.startsWith(`${table}:`)) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => queryCache.delete(key))
  }

  // Clear all cache
  static clearCache(): void {
    queryCache.clear()
  }

  // Get cache statistics
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: queryCache.size,
      keys: Array.from(queryCache.keys())
    }
  }

  // Paginated query with total count
  static async paginatedQuery<T = any>(
    table: string,
    filters: Record<string, any> = {},
    pagination: {
      page: number
      pageSize: number
      orderBy?: string
    },
    options: {
      select?: string
      cache?: boolean
      ttl?: number
    } = {}
  ): Promise<{
    data: T[] | null
    error: any
    pagination: {
      page: number
      pageSize: number
      totalCount: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }> {
    const { page, pageSize, orderBy } = pagination
    const offset = (page - 1) * pageSize

    // Get total count
    const countResult = await this.cachedQuery(
      table,
      filters,
      { select: '*', cache: options.cache, ttl: options.ttl }
    )

    const totalCount = countResult.data?.length || 0
    const totalPages = Math.ceil(totalCount / pageSize)

    // Get paginated data
    const dataResult = await this.cachedQuery<T>(
      table,
      filters,
      {
        select: options.select,
        orderBy,
        limit: pageSize,
        offset,
        cache: options.cache,
        ttl: options.ttl
      }
    )

    return {
      data: dataResult.data,
      error: dataResult.error,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  }

  // Query with aggregations
  static async aggregateQuery(
    table: string,
    aggregations: {
      count?: string | boolean
      sum?: string[]
      avg?: string[]
      min?: string[]
      max?: string[]
    },
    filters: Record<string, any> = {},
    options: {
      groupBy?: string[]
      having?: Record<string, any>
      cache?: boolean
      ttl?: number
    } = {}
  ): Promise<{ data: any[] | null; error: any }> {
    try {
      const supabase = await createClient()
      
      // Build select clause with aggregations
      const selectParts: string[] = []
      
      if (aggregations.count) {
        if (typeof aggregations.count === 'string') {
          selectParts.push(`${aggregations.count}.count()`)
        } else {
          selectParts.push('count(*)')
        }
      }
      
      aggregations.sum?.forEach(field => selectParts.push(`${field}.sum()`))
      aggregations.avg?.forEach(field => selectParts.push(`${field}.avg()`))
      aggregations.min?.forEach(field => selectParts.push(`${field}.min()`))
      aggregations.max?.forEach(field => selectParts.push(`${field}.max()`))
      
      if (options.groupBy) {
        selectParts.push(...options.groupBy)
      }

      let query = supabase.from(table).select(selectParts.join(', '))

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })

      const { data, error } = await query

      if (error) {
        console.error(`Database aggregation error for table ${table}:`, error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error(`Database aggregation error for table ${table}:`, error)
      return { data: null, error }
    }
  }
}

// Connection pool monitoring
export class ConnectionMonitor {
  private static metrics = {
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    avgResponseTime: 0,
    connectionErrors: 0,
    cacheHits: 0,
    cacheMisses: 0
  }

  static trackQuery(success: boolean, responseTime: number, cached: boolean = false) {
    this.metrics.totalQueries++
    
    if (success) {
      this.metrics.successfulQueries++
    } else {
      this.metrics.failedQueries++
    }
    
    // Update average response time
    this.metrics.avgResponseTime = (
      (this.metrics.avgResponseTime * (this.metrics.totalQueries - 1) + responseTime) /
      this.metrics.totalQueries
    )
    
    if (cached) {
      this.metrics.cacheHits++
    } else {
      this.metrics.cacheMisses++
    }
  }

  static trackConnectionError() {
    this.metrics.connectionErrors++
  }

  static getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalQueries > 0 
        ? (this.metrics.successfulQueries / this.metrics.totalQueries) * 100 
        : 0,
      cacheHitRate: (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
        ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100
        : 0
    }
  }

  static resetMetrics() {
    this.metrics = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      avgResponseTime: 0,
      connectionErrors: 0,
      cacheHits: 0,
      cacheMisses: 0
    }
  }
}

// Export utilities
export { DatabaseOptimizer, ConnectionMonitor }