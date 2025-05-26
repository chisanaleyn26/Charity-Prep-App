'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Sparkles, 
  User, 
  DollarSign, 
  Globe,
  Calendar,
  AlertCircle,
  ChevronRight,
  Clock
} from 'lucide-react'
import { executeSearch, type SearchResult, type SearchResponse } from '../services/search-executor'
import { describeSearch } from '../services/search-parser'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'

interface SmartSearchProps {
  onResultClick?: (result: SearchResult) => void
  placeholder?: string
  autoFocus?: boolean
}

export function SmartSearch({ 
  onResultClick,
  placeholder = "Search for people, DBS checks, donations, overseas activities...",
  autoFocus = false
}: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
  const debouncedQuery = useDebounce(query, 500)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Save query to recent searches
  const saveRecentSearch = useCallback((searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }, [recentSearches])

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResponse(null)
      return
    }

    setIsSearching(true)
    try {
      const response = await executeSearch(searchQuery)
      setSearchResponse(response)
      saveRecentSearch(searchQuery)
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }, [saveRecentSearch])

  // Auto-search on debounced query change
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery)
    } else {
      setSearchResponse(null)
    }
  }, [debouncedQuery, performSearch])

  // Get icon for result type
  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'safeguarding':
        return <User className="h-4 w-4" />
      case 'income':
        return <DollarSign className="h-4 w-4" />
      case 'overseas':
        return <Globe className="h-4 w-4" />
    }
  }

  // Get type label
  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'safeguarding':
        return 'Safeguarding'
      case 'income':
        return 'Income'
      case 'overseas':
        return 'Overseas'
    }
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          autoFocus={autoFocus}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              performSearch(query)
            }
          }}
        />
        {query && (
          <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-pulse" />
        )}
      </div>

      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Searches
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, idx) => (
                <Button
                  key={idx}
                  variant="secondary"
                  size="sm"
                  onClick={() => setQuery(search)}
                  className="text-xs"
                >
                  {search}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Examples */}
      {!query && !searchResponse && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Try searching for:</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <button
                onClick={() => setQuery("DBS checks expiring this month")}
                className="text-left p-2 rounded hover:bg-muted transition-colors"
              >
                <span className="text-muted-foreground">→</span> DBS checks expiring this month
              </button>
              <button
                onClick={() => setQuery("Donations over £5000")}
                className="text-left p-2 rounded hover:bg-muted transition-colors"
              >
                <span className="text-muted-foreground">→</span> Donations over £5000
              </button>
              <button
                onClick={() => setQuery("Overseas activities in Kenya")}
                className="text-left p-2 rounded hover:bg-muted transition-colors"
              >
                <span className="text-muted-foreground">→</span> Overseas activities in Kenya
              </button>
              <button
                onClick={() => setQuery("John Smith safeguarding")}
                className="text-left p-2 rounded hover:bg-muted transition-colors"
              >
                <span className="text-muted-foreground">→</span> John Smith safeguarding
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isSearching && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResponse && !isSearching && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {searchResponse.results.length} Results
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {searchResponse.executionTime}ms
              </Badge>
            </div>
            <CardDescription className="text-sm">
              {describeSearch(searchResponse.query)}
              {searchResponse.query.confidence < 0.7 && (
                <span className="text-amber-600 ml-2">
                  (Low confidence - try being more specific)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {searchResponse.results.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No results found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search terms
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {searchResponse.results.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => onResultClick?.(result)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-all hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getResultIcon(result.type)}
                            <span className="font-medium truncate">
                              {result.title}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(result.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {result.description}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            {result.date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(result.date)}
                              </span>
                            )}
                            {result.amount && (
                              <span>{formatCurrency(result.amount)}</span>
                            )}
                            {result.status && (
                              <Badge variant="secondary" className="text-xs">
                                {result.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}