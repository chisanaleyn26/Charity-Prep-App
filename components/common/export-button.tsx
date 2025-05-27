'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  exportSafeguardingRecords,
  exportOverseasActivities,
  exportIncomeRecords
} from '@/lib/api/export'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

interface ExportButtonProps {
  organizationId: string
  dataType: 'safeguarding' | 'overseas' | 'fundraising' | 'all'
  financialYear?: number
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function ExportButton({ 
  organizationId, 
  dataType, 
  financialYear,
  variant = 'outline',
  size = 'default',
  className 
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async (type?: string) => {
    const exportType = type || dataType
    setExporting(true)
    
    try {
      let result
      
      switch (exportType) {
        case 'safeguarding':
          result = await exportSafeguardingRecords(organizationId)
          break
        case 'overseas':
          result = await exportOverseasActivities(organizationId, financialYear)
          break
        case 'fundraising':
          result = await exportIncomeRecords(organizationId, financialYear)
          break
        default:
          throw new Error('Invalid export type')
      }
      
      if ('error' in result) {
        throw new Error(result.error)
      }
      
      // Download the CSV
      const blob = new Blob([result.data], { type: result.mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>Export downloaded successfully</span>
        </div>
      )
    } catch (error) {
      console.error('Export error:', error)
      toast.error(error instanceof Error ? error.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  if (dataType === 'all') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant} 
            size={size}
            className={className}
            disabled={exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport('safeguarding')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Safeguarding Records
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('overseas')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Overseas Activities
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('fundraising')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Income Records
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => handleExport()}
      disabled={exporting}
    >
      <Download className="h-4 w-4 mr-2" />
      {exporting ? 'Exporting...' : 'Export CSV'}
    </Button>
  )
}