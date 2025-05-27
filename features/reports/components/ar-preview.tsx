'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Download, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Mail
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { AnnualReturnData, getAnnualReturnData, getCurrentFinancialYear } from '../services/annual-return-service'
import { ARFieldMapping, mapToCharityCommissionFields, exportAsCSV, generateCompletionReport } from '../services/ar-field-mapper'
import { ARFieldMapper } from './ar-field-mapper'
import { ARExportOptions } from './ar-export-options'

export function ARPreview() {
  const [loading, setLoading] = useState(true)
  const [arData, setArData] = useState<AnnualReturnData | null>(null)
  const [fieldMappings, setFieldMappings] = useState<ARFieldMapping[]>([])
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [copiedFields, setCopiedFields] = useState<Set<string>>(new Set())
  const organization = useAuthStore(state => state.organization)

  useEffect(() => {
    loadAnnualReturnData()
  }, [organization])

  async function loadAnnualReturnData() {
    if (!organization) return

    try {
      setLoading(true)
      const currentYear = getCurrentFinancialYear(organization.financial_year_end)
      const data = await getAnnualReturnData(organization.id, currentYear)
      const mappings = mapToCharityCommissionFields(data)
      
      setArData(data)
      setFieldMappings(mappings)
    } catch (error) {
      console.error('Error loading Annual Return data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyField = (field: ARFieldMapping) => {
    if (field.value !== null && field.value !== undefined) {
      navigator.clipboard.writeText(field.value.toString())
      setCopiedFields(new Set([...copiedFields, field.fieldId]))
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedFields(prev => {
          const newSet = new Set(prev)
          newSet.delete(field.fieldId)
          return newSet
        })
      }, 2000)
    }
  }

  const exportData = () => {
    const csv = exportAsCSV(fieldMappings)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `annual-return-${organization?.charity_number}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading || !arData) {
    return null
  }

  const completionReport = generateCompletionReport(fieldMappings)
  const completionPercentage = Math.round((completionReport.complete / completionReport.required) * 100)

  // Group fields by section
  const fieldsBySection = fieldMappings.reduce((acc, field) => {
    if (!acc[field.section]) {
      acc[field.section] = []
    }
    acc[field.section].push(field)
    return acc
  }, {} as Record<string, ARFieldMapping[]>)

  // Calculate days until deadline
  const yearEnd = new Date(organization?.financial_year_end || '')
  const deadline = new Date(yearEnd)
  deadline.setMonth(deadline.getMonth() + 10) // 10 months after year end
  const daysUntilDeadline = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Annual Return Status</CardTitle>
              <CardDescription>
                Financial Year Ending {new Date(organization?.financial_year_end || '').toLocaleDateString('en-GB', { 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={completionPercentage} className="h-3" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{completionReport.complete}</div>
              <div className="text-sm text-muted-foreground">Fields Complete</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{completionReport.missing.length}</div>
              <div className="text-sm text-muted-foreground">Fields Missing</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{daysUntilDeadline}</div>
              <div className="text-sm text-muted-foreground">Days Until Deadline</div>
            </div>
          </div>

          {completionReport.missing.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Missing Required Fields</AlertTitle>
              <AlertDescription>
                The following required fields need attention:
                <ul className="list-disc list-inside mt-2">
                  {completionReport.missing.slice(0, 3).map(field => (
                    <li key={field.fieldId}>{field.fieldName}</li>
                  ))}
                  {completionReport.missing.length > 3 && (
                    <li>...and {completionReport.missing.length - 3} more</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Your Data */}
        <Card>
          <CardHeader>
            <CardTitle>Your Data</CardTitle>
            <CardDescription>Review and copy individual fields</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={Object.keys(fieldsBySection)[0]} className="w-full">
              <TabsList className="grid grid-cols-2 lg:grid-cols-3 w-full">
                {Object.keys(fieldsBySection).slice(0, 6).map(section => (
                  <TabsTrigger key={section} value={section} className="text-xs">
                    {section}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {Object.entries(fieldsBySection).map(([section, fields]) => (
                <TabsContent key={section} value={section} className="space-y-3 mt-4">
                  {fields.map(field => (
                    <div
                      key={field.fieldId}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedField === field.fieldId ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedField(field.fieldId)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              {field.fieldId}
                            </span>
                            <span className="font-medium text-sm">{field.fieldName}</span>
                            {field.required && (
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <div className="mt-1">
                            {field.value !== null && field.value !== undefined && field.value !== '' ? (
                              <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                {field.value.toString()}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground italic">Not provided</div>
                            )}
                          </div>
                          {field.help && (
                            <p className="text-xs text-muted-foreground mt-1">{field.help}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyField(field)
                          }}
                          disabled={!field.value}
                        >
                          {copiedFields.has(field.fieldId) ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Right Panel - Official Form Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Annual Return Form</CardTitle>
            <CardDescription>How it maps to the official form</CardDescription>
          </CardHeader>
          <CardContent>
            <ARFieldMapper 
              fieldMappings={fieldMappings}
              selectedField={selectedField}
              onFieldSelect={setSelectedField}
            />
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <ARExportOptions 
        arData={arData}
        fieldMappings={fieldMappings}
        onExport={exportData}
      />
    </div>
  )
}