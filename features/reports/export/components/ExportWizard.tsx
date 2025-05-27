'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { 
  FileText,
  Database,
  Settings,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react'
import { 
  DataSourceType, 
  ExportFormat, 
  ExportConfig,
  DATA_SOURCE_METADATA 
} from '../types/export'
import { createExportConfig, startExportJob } from '../actions/export'
import { useToast } from '@/hooks/use-toast'

interface ExportWizardProps {
  onClose: () => void
  onComplete: (config: ExportConfig) => void
}

const steps = [
  { id: 'source', title: 'Select Data', icon: Database },
  { id: 'format', title: 'Choose Format', icon: FileText },
  { id: 'configure', title: 'Configure', icon: Settings },
  { id: 'review', title: 'Review', icon: Check }
]

export default function ExportWizard({ onClose, onComplete }: ExportWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [config, setConfig] = useState<Partial<ExportConfig>>({
    name: '',
    description: '',
    dataSource: 'compliance-scores' as DataSourceType,
    format: 'excel' as ExportFormat
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  async function handleComplete() {
    if (!config.name || !config.dataSource || !config.format) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      // Create the export config
      const newConfig = await createExportConfig(config as Omit<ExportConfig, 'id' | 'createdAt' | 'updatedAt'>)
      
      // Start the export job
      await startExportJob(newConfig.dataSource, newConfig.format, newConfig)
      
      onComplete(newConfig)
    } catch (error) {
      console.error('Failed to create export:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to create export. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'source':
        return (
          <div className="space-y-4">
            <RadioGroup
              value={config.dataSource}
              onValueChange={(value) => setConfig({ ...config, dataSource: value as DataSourceType })}
            >
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(DATA_SOURCE_METADATA).map(([key, metadata]) => (
                  <Label
                    key={key}
                    htmlFor={key}
                    className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent"
                  >
                    <RadioGroupItem value={key} id={key} />
                    <div className="flex-1">
                      <p className="font-medium">{metadata.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {metadata.description}
                      </p>
                    </div>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>
        )

      case 'format':
        const selectedSource = DATA_SOURCE_METADATA[config.dataSource!]
        return (
          <div className="space-y-4">
            <RadioGroup
              value={config.format}
              onValueChange={(value) => setConfig({ ...config, format: value as ExportFormat })}
            >
              <div className="grid grid-cols-1 gap-3">
                {selectedSource.availableFormats.map((format) => (
                  <Label
                    key={format}
                    htmlFor={format}
                    className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent"
                  >
                    <RadioGroupItem value={format} id={format} />
                    <div>
                      <p className="font-medium">{format.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        {format === 'csv' && 'Comma-separated values, opens in Excel'}
                        {format === 'excel' && 'Microsoft Excel workbook'}
                        {format === 'json' && 'JavaScript Object Notation'}
                        {format === 'pdf' && 'Portable Document Format'}
                        {format === 'xml' && 'Extensible Markup Language'}
                      </p>
                    </div>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>
        )

      case 'configure':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Export Name</Label>
              <Input
                id="name"
                placeholder="e.g., Monthly Compliance Report"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this export..."
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
              />
            </div>
          </div>
        )

      case 'review':
        const sourceMetadata = DATA_SOURCE_METADATA[config.dataSource!]
        return (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                    <dd className="text-sm">{config.name || 'Unnamed Export'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Data Source</dt>
                    <dd className="text-sm">{sourceMetadata.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Format</dt>
                    <dd className="text-sm">{config.format?.toUpperCase()}</dd>
                  </div>
                  {config.description && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                      <dd className="text-sm">{config.description}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Custom Export</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <Progress value={progress} />
            <div className="flex justify-between text-sm text-muted-foreground">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-1 ${
                    index <= currentStep ? 'text-foreground' : ''
                  }`}
                >
                  <step.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[300px]">
            {renderStepContent()}
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading}>
                {loading ? 'Creating...' : 'Create Export'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}