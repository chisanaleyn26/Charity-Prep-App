'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Download,
  FileText,
  Presentation,
  FileSpreadsheet,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle
} from 'lucide-react'
import { BoardPackTemplate, BoardPackData, ExportFormat } from '../types/board-pack'
import { generateBoardPackData, exportBoardPack } from '../actions/board-pack'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { isAuthError } from '@/lib/errors/auth-errors'

// Section Components
import ComplianceOverview from './sections/ComplianceOverview'
import FinancialSummary from './sections/FinancialSummary'
import RiskAnalysis from './sections/RiskAnalysis'
import FundraisingReport from './sections/FundraisingReport'
import SafeguardingReport from './sections/SafeguardingReport'
import OverseasActivities from './sections/OverseasActivities'
import KeyMetrics from './sections/KeyMetrics'
import Recommendations from './sections/Recommendations'
import NarrativeSummary from './sections/NarrativeSummary'

interface ReportBuilderProps {
  template: BoardPackTemplate
  onBack: () => void
}

// Section component mapping
const sectionComponents: Record<string, React.ComponentType<{ data: any }>> = {
  'compliance-overview': ComplianceOverview,
  'financial-summary': FinancialSummary,
  'risk-analysis': RiskAnalysis,
  'fundraising-report': FundraisingReport,
  'safeguarding-report': SafeguardingReport,
  'overseas-activities': OverseasActivities,
  'key-metrics': KeyMetrics,
  'recommendations': Recommendations,
  'narrative-summary': NarrativeSummary
}

export default function ReportBuilder({ template, onBack }: ReportBuilderProps) {
  const [boardPackData, setBoardPackData] = useState<BoardPackData | null>(null)
  const [loading, setLoading] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null)
  const [error, setError] = useState<{ message: string; action?: string; redirectTo?: string } | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Default to last quarter
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 3)

  async function handleGenerateReport() {
    setLoading(true)
    setError(null)

    try {
      const data = await generateBoardPackData(template.id, {
        start: startDate,
        end: endDate
      })
      setBoardPackData(data)
      
      // Check if there were any section errors
      if (data.metadata?.errors) {
        const errorCount = Object.keys(data.metadata.errors).length
        toast({
          title: 'Board Pack Generated with Warnings',
          description: `Generated successfully, but ${errorCount} section(s) had issues.`,
          variant: 'default'
        })
      } else {
        toast({
          title: 'Board Pack Generated',
          description: 'Your board pack has been generated successfully.'
        })
      }
    } catch (err) {
      console.error('Failed to generate board pack:', err)
      
      // Handle auth errors specially
      if (isAuthError(err)) {
        const authError = err as any
        setError({
          message: authError.userMessage || authError.message,
          action: authError.suggestedAction,
          redirectTo: authError.redirectTo
        })
        
        // Auto-redirect after a delay if redirect is suggested
        if (authError.redirectTo) {
          setTimeout(() => {
            router.push(authError.redirectTo)
          }, 3000)
        }
      } else {
        setError({
          message: err instanceof Error ? err.message : 'Failed to generate board pack',
          action: 'Please try again or contact support if the issue persists.'
        })
      }
      
      toast({
        title: 'Generation Failed',
        description: err instanceof Error ? err.message : 'Failed to generate board pack',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleExport(format: ExportFormat) {
    if (!boardPackData) return

    setExportingFormat(format)

    try {
      const result = await exportBoardPack(boardPackData, format)
      
      // Download the file
      const link = document.createElement('a')
      link.href = result.url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: 'Export Successful',
        description: `Board pack exported as ${format.toUpperCase()}`
      })
    } catch (err) {
      console.error('Failed to export board pack:', err)
      toast({
        title: 'Export Failed',
        description: 'Failed to export board pack. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setExportingFormat(null)
    }
  }

  if (!boardPackData && !loading && !error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{template.name}</CardTitle>
          <CardDescription>{template.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-2">Report Period</h3>
            <p className="text-sm text-muted-foreground">
              {format(startDate, 'MMMM d, yyyy')} - {format(endDate, 'MMMM d, yyyy')}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-2">Included Sections</h3>
            <div className="flex flex-wrap gap-2">
              {template.sections
                .filter(s => s.enabled)
                .map(section => (
                  <Badge key={section.id} variant="secondary">
                    {section.title}
                  </Badge>
                ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleGenerateReport} className="flex-1">
              Generate Report
            </Button>
            <Button variant="outline" onClick={onBack}>
              Back to Templates
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-medium">Generating Board Pack</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This may take a few moments...
              </p>
            </div>
            <Progress value={33} className="w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unable to Generate Board Pack</AlertTitle>
            <AlertDescription className="mt-2">
              <p>{error.message}</p>
              {error.action && (
                <p className="mt-2 text-sm font-medium">{error.action}</p>
              )}
              {error.redirectTo && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Redirecting in 3 seconds...
                </p>
              )}
            </AlertDescription>
          </Alert>
          <div className="flex gap-3 mt-4">
            {error.redirectTo ? (
              <Button onClick={() => router.push(error.redirectTo!)}>
                {error.action || 'Continue'}
              </Button>
            ) : (
              <Button onClick={handleGenerateReport} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button variant="outline" onClick={onBack}>
              Back to Templates
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>
                Generated on {format(boardPackData.generatedAt, 'MMMM d, yyyy \'at\' h:mm a')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
                disabled={!!exportingFormat}
              >
                {exportingFormat === 'pdf' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span className="ml-2">PDF</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('docx')}
                disabled={!!exportingFormat}
              >
                {exportingFormat === 'docx' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                <span className="ml-2">Word</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pptx')}
                disabled={!!exportingFormat}
              >
                {exportingFormat === 'pptx' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Presentation className="h-4 w-4" />
                )}
                <span className="ml-2">PowerPoint</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Report Content */}
      <Tabs defaultValue={template.sections.filter(s => s.enabled)[0]?.id} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {template.sections
            .filter(s => s.enabled)
            .map(section => (
              <TabsTrigger key={section.id} value={section.id}>
                {section.title}
              </TabsTrigger>
            ))}
        </TabsList>

        {template.sections
          .filter(s => s.enabled)
          .map(section => {
            const SectionComponent = sectionComponents[section.type]
            const sectionData = boardPackData.sections[section.id]

            return (
              <TabsContent key={section.id} value={section.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {SectionComponent && sectionData ? (
                      <SectionComponent data={sectionData} />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No data available for this section
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )
          })}
      </Tabs>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={onBack}>
              Back to Templates
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGenerateReport}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button onClick={() => handleExport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Download Board Pack
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}