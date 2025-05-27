'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  ChevronDown,
  ChevronRight,
  Filter,
  Download
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  mobile?: 'hidden' | 'primary' | 'secondary' | 'visible'
  render?: (value: any, row: any) => React.ReactNode
  className?: string
}

export interface TableAction {
  label: string
  icon?: React.ReactNode
  onClick: (row: any) => void
  variant?: 'default' | 'destructive'
  disabled?: (row: any) => boolean
}

interface ResponsiveTableProps {
  data: any[]
  columns: TableColumn[]
  actions?: TableAction[]
  title?: string
  subtitle?: string
  loading?: boolean
  emptyMessage?: string
  searchable?: boolean
  filterable?: boolean
  exportable?: boolean
  onSearch?: (query: string) => void
  onFilter?: (filters: Record<string, any>) => void
  onExport?: () => void
  className?: string
}

export function ResponsiveTable({
  data,
  columns,
  actions = [],
  title,
  subtitle,
  loading = false,
  emptyMessage = 'No data available',
  searchable = false,
  filterable = false,
  exportable = false,
  onSearch,
  onFilter,
  onExport,
  className
}: ResponsiveTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const primaryColumns = columns.filter(col => col.mobile === 'primary')
  const secondaryColumns = columns.filter(col => col.mobile === 'secondary')
  const hiddenColumns = columns.filter(col => col.mobile === 'hidden')
  const visibleColumns = columns.filter(col => col.mobile === 'visible' || !col.mobile)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {title && <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>}
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          
          <div className="flex items-center gap-2">
            {searchable && (
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full sm:w-64 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            {filterable && (
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            )}
            
            {exportable && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <ScrollArea className="w-full">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                        >
                          {column.label}
                        </th>
                      ))}
                      {actions.length > 0 && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className={`px-6 py-4 whitespace-nowrap text-sm ${column.className || ''}`}
                          >
                            {column.render 
                              ? column.render(row[column.key], row)
                              : row[column.key]
                            }
                          </td>
                        ))}
                        {actions.length > 0 && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {actions.map((action, actionIndex) => (
                                  <DropdownMenuItem
                                    key={actionIndex}
                                    onClick={() => action.onClick(row)}
                                    disabled={action.disabled?.(row)}
                                    className={action.variant === 'destructive' ? 'text-red-600' : ''}
                                  >
                                    {action.icon && <span className="mr-2">{action.icon}</span>}
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3 p-4">
              {data.map((row, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    {/* Primary Information */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        {primaryColumns.map((column) => (
                          <div key={column.key} className="mb-1">
                            <div className="font-medium text-sm truncate">
                              {column.render 
                                ? column.render(row[column.key], row)
                                : row[column.key]
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-2">
                        {secondaryColumns.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(index)}
                            className="h-6 w-6 p-0"
                          >
                            {expandedRows.has(index) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        
                        {actions.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions.map((action, actionIndex) => (
                                <DropdownMenuItem
                                  key={actionIndex}
                                  onClick={() => action.onClick(row)}
                                  disabled={action.disabled?.(row)}
                                  className={action.variant === 'destructive' ? 'text-red-600' : ''}
                                >
                                  {action.icon && <span className="mr-2">{action.icon}</span>}
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    {/* Secondary Information */}
                    {secondaryColumns.length > 0 && (
                      <div className="space-y-1">
                        {secondaryColumns.slice(0, 2).map((column) => (
                          <div key={column.key} className="text-xs text-muted-foreground">
                            <span className="font-medium">{column.label}: </span>
                            {column.render 
                              ? column.render(row[column.key], row)
                              : row[column.key]
                            }
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Expanded Information */}
                    {expandedRows.has(index) && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        {secondaryColumns.slice(2).map((column) => (
                          <div key={column.key} className="text-xs">
                            <span className="font-medium text-muted-foreground">{column.label}: </span>
                            <span>
                              {column.render 
                                ? column.render(row[column.key], row)
                                : row[column.key]
                              }
                            </span>
                          </div>
                        ))}
                        
                        {hiddenColumns.map((column) => (
                          <div key={column.key} className="text-xs">
                            <span className="font-medium text-muted-foreground">{column.label}: </span>
                            <span>
                              {column.render 
                                ? column.render(row[column.key], row)
                                : row[column.key]
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Mobile-specific status badge component
export function MobileStatusBadge({ status, children }: { status: string; children: React.ReactNode }) {
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('active') || statusLower.includes('valid') || statusLower.includes('compliant')) {
      return 'bg-green-100 text-green-800'
    }
    if (statusLower.includes('expir') || statusLower.includes('overdue')) {
      return 'bg-red-100 text-red-800'
    }
    if (statusLower.includes('warning') || statusLower.includes('pending')) {
      return 'bg-yellow-100 text-yellow-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {children}
    </span>
  )
}