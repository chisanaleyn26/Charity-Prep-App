'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  FileSpreadsheet, 
  FileJson,
  Download,
  Shield,
  DollarSign,
  Globe,
  Database,
  TrendingUp,
  Presentation
} from 'lucide-react'
import { ExportTemplate, DATA_SOURCE_METADATA } from '../types/export'

interface QuickExportProps {
  templates: ExportTemplate[]
  onExport: (template: ExportTemplate) => void
}

const iconMap: Record<string, any> = {
  Shield,
  DollarSign,
  Globe,
  Database,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  Presentation
}

const formatIcons = {
  csv: FileText,
  excel: FileSpreadsheet,
  json: FileJson,
  pdf: FileText,
  xml: FileText
}

export default function QuickExport({ templates, onExport }: QuickExportProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => {
        const metadata = DATA_SOURCE_METADATA[template.dataSource]
        const Icon = iconMap[metadata.icon] || FileText
        const FormatIcon = formatIcons[template.format] || FileText

        return (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Icon className="h-8 w-8 text-primary" />
                <Badge variant="secondary">
                  <FormatIcon className="h-3 w-3 mr-1" />
                  {template.format.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Data Source:</p>
                  <p>{metadata.name}</p>
                </div>
                
                {template.config.filters?.dateRange && (
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Period:</p>
                    <p>
                      {new Date(template.config.filters.dateRange.start).toLocaleDateString()} - 
                      {new Date(template.config.filters.dateRange.end).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  onClick={() => onExport(template)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Custom Export Card */}
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center justify-center">
            <Database className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg text-center">Custom Export</CardTitle>
          <CardDescription className="text-center">
            Create a custom export with specific data and filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Choose your data source, format, columns, and filters
          </p>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              // This will be handled by parent component
              document.querySelector<HTMLButtonElement>('[data-custom-export]')?.click()
            }}
          >
            Create Custom Export
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}