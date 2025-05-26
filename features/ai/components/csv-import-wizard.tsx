'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileSpreadsheet,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  RefreshCw
} from 'lucide-react'
import { parseCSVFile, validateCSV, normalizeCSVData } from '../services/csv-parser'
import { mapColumnsWithAI, IMPORT_SCHEMAS, generateCSVTemplate, type ImportType } from '../services/column-mapper'
import { ColumnMapper } from './column-mapper'
import { toast } from 'sonner'
import type { CSVParseResult } from '../services/csv-parser'
import type { CSVColumnMapping } from '../types/extraction'
import { 
  importSafeguardingRecords,
  importOverseasActivities,
  importIncomeRecords,
  type ImportResult
} from '@/lib/api/import'
import { createClient } from '@/lib/supabase/client'

interface CSVImportWizardProps {
  onComplete?: (importedCount: number, totalCount: number, type: string) => void
  onCancel?: () => void
}

type WizardStep = 'upload' | 'type' | 'mapping' | 'preview' | 'import'

export function CSVImportWizard({ onComplete, onCancel }: CSVImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCSVData] = useState<CSVParseResult | null>(null)
  const [importType, setImportType] = useState<ImportType>('safeguarding')
  const [columnMapping, setColumnMapping] = useState<CSVColumnMapping | null>(null)
  const [mappedData, setMappedData] = useState<any[]>([])
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)

  const steps: Array<{ id: WizardStep; label: string; description: string }> = [
    { id: 'upload', label: 'Upload File', description: 'Select your CSV file' },
    { id: 'type', label: 'Import Type', description: 'Choose data category' },
    { id: 'mapping', label: 'Map Columns', description: 'Match CSV to fields' },
    { id: 'preview', label: 'Preview', description: 'Review before import' },
    { id: 'import', label: 'Import', description: 'Process your data' }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }
    
    setFile(selectedFile)
    
    try {
      const parsed = await parseCSVFile(selectedFile)
      setCSVData(parsed)
      toast.success(`Loaded ${parsed.rowCount} rows from ${parsed.headers.length} columns`)
      setCurrentStep('type')
    } catch (error) {
      console.error('Failed to parse CSV:', error)
      toast.error('Failed to parse CSV file')
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (!droppedFile || !droppedFile.name.endsWith('.csv')) {
      toast.error('Please drop a CSV file')
      return
    }
    
    setFile(droppedFile)
    
    try {
      const parsed = await parseCSVFile(droppedFile)
      setCSVData(parsed)
      toast.success(`Loaded ${parsed.rowCount} rows`)
      setCurrentStep('type')
    } catch (error) {
      toast.error('Failed to parse CSV file')
    }
  }, [])

  const handleTypeSelect = async () => {
    if (!csvData) return
    
    toast.loading('AI is analyzing your columns...')
    
    try {
      const mapping = await mapColumnsWithAI(csvData, importType)
      setColumnMapping(mapping)
      toast.dismiss()
      toast.success('AI mapping complete!')
      setCurrentStep('mapping')
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to map columns')
    }
  }

  const handleMappingComplete = (mapping: CSVColumnMapping) => {
    setColumnMapping(mapping)
    
    if (!csvData) return
    
    // Apply mappings to data
    const { applyColumnMappings } = require('../services/column-mapper')
    const mapped = applyColumnMappings(csvData.rows, mapping.mappings, importType)
    setMappedData(mapped)
    
    setCurrentStep('preview')
  }

  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const handleDownloadTemplate = (type: ImportType) => {
    try {
      const template = generateCSVTemplate(type)
      const blob = new Blob([template], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_template.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Template downloaded!')
    } catch (error) {
      toast.error('Failed to generate template')
    }
  }

  const handleImport = async () => {
    if (!csvData || !columnMapping || !file) return
    
    setImporting(true)
    setProgress(0)
    
    try {
      // Get organization ID
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated')
        return
      }
      
      // Get user's organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()
        
      if (!membership) {
        toast.error('No organization found')
        return
      }
      
      // Convert file to CSV string
      const csvContent = await file.text()
      
      // Convert column mapping to simple string record
      const simpleMappings: Record<string, string> = {}
      for (const [field, mapping] of Object.entries(columnMapping.mappings)) {
        if (mapping.csv_column) {
          simpleMappings[mapping.csv_column] = field
        }
      }
      
      // Call appropriate import function based on type
      let result: ImportResult
      
      switch (importType) {
        case 'safeguarding':
          result = await importSafeguardingRecords(
            membership.organization_id,
            csvContent,
            simpleMappings
          )
          break
          
        case 'overseas_activities':
          result = await importOverseasActivities(
            membership.organization_id,
            csvContent,
            simpleMappings
          )
          break
          
        case 'fundraising':
          result = await importIncomeRecords(
            membership.organization_id,
            csvContent,
            simpleMappings
          )
          break
          
        default:
          throw new Error('Invalid import type')
      }
      
      setImportResult(result)
      setProgress(100)
      
      if (result.success) {
        toast.success(`Successfully imported ${result.imported} records!`)
        if (result.skipped > 0) {
          toast.warning(`${result.skipped} records were skipped due to errors`)
        }
        onComplete?.(result.imported, result.imported + result.skipped, importType)
        setCurrentStep('import')
      } else {
        toast.error('Import failed')
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Select a CSV file containing your compliance data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  id="csv-upload"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileSelect}
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">
                    Drop your CSV file here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports standard CSV format with headers
                  </p>
                </label>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Download Templates</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Safeguarding
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Fundraising
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Overseas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
        
      case 'type':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Select Import Type</CardTitle>
              <CardDescription>
                Choose the type of data you're importing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={importType} onValueChange={(v) => setImportType(v as ImportType)}>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="safeguarding" className="mt-1" />
                    <div className="flex-1">
                      <div className="font-medium">Safeguarding Records</div>
                      <div className="text-sm text-muted-foreground">
                        DBS checks, training records, and role information
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadTemplate('safeguarding')
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Template
                      </Button>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="fundraising" className="mt-1" />
                    <div className="flex-1">
                      <div className="font-medium">Income Records</div>
                      <div className="text-sm text-muted-foreground">
                        Donations, grants, and other income sources
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadTemplate('fundraising')
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Template
                      </Button>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="overseas_activities" className="mt-1" />
                    <div className="flex-1">
                      <div className="font-medium">Overseas Activities</div>
                      <div className="text-sm text-muted-foreground">
                        International transfers and activities
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadTemplate('overseas_activities')
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Template
                      </Button>
                    </div>
                  </label>
                </div>
              </RadioGroup>
              
              {csvData && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">File Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p>Rows: {csvData.rowCount}</p>
                    <p>Columns: {csvData.headers.length}</p>
                    <p>Size: {(file?.size || 0 / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
        
      case 'mapping':
        return columnMapping && csvData ? (
          <ColumnMapper
            csvData={csvData}
            mapping={columnMapping}
            importType={importType}
            onMappingChange={setColumnMapping}
            onComplete={handleMappingComplete}
          />
        ) : null
        
      case 'preview':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Preview Import</CardTitle>
              <CardDescription>
                Review the first few rows before importing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-4">
                  {mappedData.slice(0, 5).map((row, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(row).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium text-muted-foreground">
                                {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}:
                              </span>{' '}
                              <span>{value as string || '-'}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing 5 of {mappedData.length} rows
                </p>
                <Badge variant="secondary">
                  Ready to import
                </Badge>
              </div>
            </CardContent>
          </Card>
        )
        
      case 'import':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {importResult?.success ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Import Complete!
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    Import Failed
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {importResult?.success ? (
                <>
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {importResult.imported}
                    </div>
                    <p className="text-muted-foreground">Records imported successfully</p>
                    {importResult.skipped > 0 && (
                      <p className="text-sm text-amber-600 mt-2">
                        {importResult.skipped} records skipped
                      </p>
                    )}
                  </div>
                  
                  {importResult.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">Some records had errors:</p>
                          <ul className="text-sm list-disc list-inside">
                            {importResult.errors.slice(0, 5).map((error, idx) => (
                              <li key={idx}>
                                Row {error.row}: {error.message}
                                {error.field && ` (${error.field})`}
                              </li>
                            ))}
                          </ul>
                          {importResult.errors.length > 5 && (
                            <p className="text-sm italic">
                              ...and {importResult.errors.length - 5} more errors
                            </p>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    The import failed. Please check your data and try again.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setCurrentStep('upload')
                    setFile(null)
                    setCSVData(null)
                    setColumnMapping(null)
                    setMappedData([])
                    setImportResult(null)
                  }}
                >
                  Import Another File
                </Button>
                <Button 
                  className="flex-1"
                  onClick={onCancel}
                >
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex flex-col items-center ${idx <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                idx < currentStepIndex ? 'bg-primary border-primary text-white' :
                idx === currentStepIndex ? 'border-primary' : 'border-gray-300'
              }`}>
                {idx < currentStepIndex ? <CheckCircle className="h-5 w-5" /> : idx + 1}
              </div>
              <span className="text-xs mt-1 font-medium">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 w-20 mx-2 ${idx < currentStepIndex ? 'bg-primary' : 'bg-gray-300'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {renderStepContent()}
      
      {/* Navigation */}
      {currentStep !== 'import' && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              const prevStep = steps[currentStepIndex - 1]
              if (prevStep) setCurrentStep(prevStep.id)
            }}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Button
            onClick={() => {
              switch (currentStep) {
                case 'type':
                  handleTypeSelect()
                  break
                case 'preview':
                  handleImport()
                  break
                default:
                  const nextStep = steps[currentStepIndex + 1]
                  if (nextStep) setCurrentStep(nextStep.id)
              }
            }}
            disabled={
              (currentStep === 'upload' && !file) ||
              (currentStep === 'preview' && importing)
            }
          >
            {currentStep === 'type' && (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Map with AI
              </>
            )}
            {currentStep === 'preview' && (
              <>
                Import {mappedData.length} Records
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
            {!['type', 'preview'].includes(currentStep) && (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}
      
      {importing && (
        <Progress value={progress} className="h-2" />
      )}
    </div>
  )
}