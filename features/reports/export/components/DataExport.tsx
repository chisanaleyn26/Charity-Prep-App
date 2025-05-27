'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Download, 
  FileText, 
  Calendar,
  Filter,
  Columns,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Settings,
  Database
} from 'lucide-react'
import { 
  ExportTemplate, 
  ExportConfig, 
  ExportJob,
  DATA_SOURCE_METADATA 
} from '../types/export'
import { 
  getExportTemplates, 
  getExportConfigs,
  getExportHistory,
  startExportJob 
} from '../actions/export'
import ExportWizard from './ExportWizard'
import ExportHistory from './ExportHistory'
import ScheduledExports from './ScheduledExports'
import QuickExport from './QuickExport'
import { useToast } from '@/hooks/use-toast'

export default function DataExport() {
  const [templates, setTemplates] = useState<ExportTemplate[]>([])
  const [configs, setConfigs] = useState<ExportConfig[]>([])
  const [history, setHistory] = useState<ExportJob[]>([])
  const [activeTab, setActiveTab] = useState('quick')
  const [showWizard, setShowWizard] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [templatesData, configsData, historyData] = await Promise.all([
        getExportTemplates(),
        getExportConfigs(),
        getExportHistory()
      ])
      
      setTemplates(templatesData)
      setConfigs(configsData)
      setHistory(historyData)
    } catch (error) {
      console.error('Failed to load export data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load export data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleQuickExport(template: ExportTemplate) {
    try {
      const job = await startExportJob(
        template.dataSource,
        template.format,
        template.config
      )
      
      toast({
        title: 'Export Started',
        description: `Exporting ${DATA_SOURCE_METADATA[template.dataSource].name}...`
      })
      
      // Add to history
      setHistory([job, ...history])
      
      // Switch to history tab
      setActiveTab('history')
    } catch (error) {
      console.error('Export failed:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to start export. Please try again.',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2">Loading export options...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Export</h2>
          <p className="text-muted-foreground mt-1">
            Export your charity data in various formats
          </p>
        </div>
        <Button onClick={() => setShowWizard(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Custom Export
        </Button>
      </div>

      {/* Export Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Total Exports
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{history.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Scheduled
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configs.length}</div>
            <p className="text-xs text-muted-foreground">Active exports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Templates
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Last Export
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {history[0] ? new Date(history[0].startedAt).toLocaleDateString() : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              {history[0]?.status || 'No exports yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick">Quick Export</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Exports</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-4">
          <QuickExport 
            templates={templates} 
            onExport={handleQuickExport}
          />
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <ScheduledExports 
            configs={configs}
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ExportHistory 
            jobs={history}
            onRefresh={loadData}
          />
        </TabsContent>
      </Tabs>

      {/* Export Wizard Modal */}
      {showWizard && (
        <ExportWizard
          onClose={() => setShowWizard(false)}
          onComplete={(config) => {
            setShowWizard(false)
            loadData()
            toast({
              title: 'Export Created',
              description: 'Your custom export has been created successfully.'
            })
          }}
        />
      )}
    </div>
  )
}