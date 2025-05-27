'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Calendar,
  Clock,
  Mail,
  Settings,
  Trash2,
  Play,
  Pause,
  FileText
} from 'lucide-react'
import { ExportConfig, DATA_SOURCE_METADATA } from '../types/export'
import { deleteExportConfig } from '../actions/export'
import { useToast } from '@/hooks/use-toast'

interface ScheduledExportsProps {
  configs: ExportConfig[]
  onUpdate: () => void
}

export default function ScheduledExports({ configs, onUpdate }: ScheduledExportsProps) {
  const { toast } = useToast()

  async function handleDelete(configId: string) {
    if (!confirm('Are you sure you want to delete this scheduled export?')) {
      return
    }

    try {
      await deleteExportConfig(configId)
      toast({
        title: 'Export Deleted',
        description: 'Scheduled export has been deleted successfully.'
      })
      onUpdate()
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete scheduled export.',
        variant: 'destructive'
      })
    }
  }

  function getFrequencyText(schedule: ExportConfig['schedule']) {
    if (!schedule) return 'Not scheduled'
    
    switch (schedule.frequency) {
      case 'daily':
        return `Daily at ${schedule.time || '09:00'}`
      case 'weekly':
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        return `Weekly on ${days[schedule.dayOfWeek || 1]} at ${schedule.time || '09:00'}`
      case 'monthly':
        return `Monthly on day ${schedule.dayOfMonth || 1} at ${schedule.time || '09:00'}`
      case 'quarterly':
        return `Quarterly at ${schedule.time || '09:00'}`
    }
  }

  if (configs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Scheduled Exports</h3>
            <p className="text-muted-foreground mb-4">
              Set up automated exports to receive data on a regular schedule.
            </p>
            <Button>
              <Clock className="h-4 w-4 mr-2" />
              Create Scheduled Export
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {configs.map((config) => {
        const metadata = DATA_SOURCE_METADATA[config.dataSource]
        
        return (
          <Card key={config.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{config.name}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </div>
                <Switch
                  checked={config.schedule?.enabled || false}
                  onCheckedChange={(checked) => {
                    // TODO: Update config
                    toast({
                      title: checked ? 'Export Enabled' : 'Export Disabled',
                      description: `${config.name} has been ${checked ? 'enabled' : 'disabled'}.`
                    })
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Source:</span>
                  <span className="font-medium">{metadata.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Schedule:</span>
                  <span className="font-medium">
                    {getFrequencyText(config.schedule)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">{config.format.toUpperCase()}</Badge>
                  {config.recipients && config.recipients.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="text-xs">
                        {config.recipients.length} recipient{config.recipients.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {config.schedule?.lastRun && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Last run: {new Date(config.schedule.lastRun).toLocaleString()}
                  </p>
                  {config.schedule.nextRun && (
                    <p className="text-xs text-muted-foreground">
                      Next run: {new Date(config.schedule.nextRun).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(config.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}