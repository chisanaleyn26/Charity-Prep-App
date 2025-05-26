'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  FileText, 
  Shield, 
  TrendingUp, 
  Globe, 
  Calendar, 
  Users,
  Sparkles,
  Download,
  Share2,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'
import { generateReport, getAvailableReports, type ReportType, type GeneratedReport } from '../services/report-narrator'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

// Date range presets
const dateRangePresets = [
  { label: 'Last Month', getValue: () => {
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - 1)
    return { start, end }
  }},
  { label: 'Last Quarter', getValue: () => {
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - 3)
    return { start, end }
  }},
  { label: 'Last 6 Months', getValue: () => {
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - 6)
    return { start, end }
  }},
  { label: 'Last Year', getValue: () => {
    const end = new Date()
    const start = new Date()
    start.setFullYear(start.getFullYear() - 1)
    return { start, end }
  }},
  { label: 'Year to Date', getValue: () => {
    const end = new Date()
    const start = new Date(end.getFullYear(), 0, 1)
    return { start, end }
  }}
]

export function ReportGenerator() {
  const [selectedType, setSelectedType] = useState<ReportType>('annual_report')
  const [dateRange, setDateRange] = useState(() => dateRangePresets[2].getValue())
  const [includeRecommendations, setIncludeRecommendations] = useState(true)
  const [tone, setTone] = useState<'formal' | 'conversational'>('formal')
  const [length, setLength] = useState<'brief' | 'detailed'>('detailed')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null)
  const [availableReports, setAvailableReports] = useState<any[]>([
    {
      type: 'annual_report',
      name: 'Annual Report',
      description: 'Comprehensive yearly overview for trustees and regulators',
      icon: 'FileText'
    },
    {
      type: 'safeguarding_summary',
      name: 'Safeguarding Summary',
      description: 'Overview of safeguarding compliance and training status',
      icon: 'Shield'
    },
    {
      type: 'financial_overview',
      name: 'Financial Overview',
      description: 'Income analysis with donor insights and trends',
      icon: 'TrendingUp'
    },
    {
      type: 'overseas_impact',
      name: 'Overseas Impact Report',
      description: 'Summary of international activities and beneficiary reach',
      icon: 'Globe'
    },
    {
      type: 'quarterly_update',
      name: 'Quarterly Update',
      description: 'Three-month progress report for stakeholders',
      icon: 'Calendar'
    },
    {
      type: 'trustee_report',
      name: 'Trustee Report',
      description: 'Governance-focused report for board meetings',
      icon: 'Users'
    }
  ])

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      const report = await generateReport(
        selectedType,
        dateRange.start,
        dateRange.end,
        {
          includeRecommendations,
          tone,
          length
        }
      )
      setGeneratedReport(report)
      toast.success('Report generated successfully!')
    } catch (error) {
      console.error('Failed to generate report:', error)
      toast.error('Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadReport = () => {
    if (!generatedReport) return

    // Convert report to markdown
    let markdown = `# ${generatedReport.title}\n\n`
    markdown += `**Generated:** ${new Date(generatedReport.generatedAt).toLocaleString()}\n\n`
    markdown += `**Period:** ${new Date(generatedReport.dataRange.start).toLocaleDateString()} - ${new Date(generatedReport.dataRange.end).toLocaleDateString()}\n\n`
    
    markdown += `## Executive Summary\n\n${generatedReport.executiveSummary}\n\n`
    
    // Key metrics
    if (generatedReport.keyMetrics.length > 0) {
      markdown += `## Key Metrics\n\n`
      generatedReport.keyMetrics.forEach(metric => {
        markdown += `- **${metric.label}:** ${metric.value}`
        if (metric.trend) {
          markdown += ` (${metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'})`
        }
        if (metric.commentary) {
          markdown += ` - ${metric.commentary}`
        }
        markdown += '\n'
      })
      markdown += '\n'
    }
    
    // Sections
    generatedReport.sections.forEach(section => {
      markdown += `## ${section.title}\n\n${section.content}\n\n`
      
      if (section.highlights?.length) {
        markdown += `### Highlights\n`
        section.highlights.forEach(h => markdown += `- ${h}\n`)
        markdown += '\n'
      }
      
      if (section.concerns?.length) {
        markdown += `### Areas of Concern\n`
        section.concerns.forEach(c => markdown += `- ${c}\n`)
        markdown += '\n'
      }
      
      if (section.recommendations?.length) {
        markdown += `### Recommendations\n`
        section.recommendations.forEach(r => markdown += `- ${r}\n`)
        markdown += '\n'
      }
    })
    
    markdown += `## Conclusion\n\n${generatedReport.conclusion}\n`

    // Create download
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generatedReport.type}_${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Report downloaded!')
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'FileText': return <FileText className="h-5 w-5" />
      case 'Shield': return <Shield className="h-5 w-5" />
      case 'TrendingUp': return <TrendingUp className="h-5 w-5" />
      case 'Globe': return <Globe className="h-5 w-5" />
      case 'Calendar': return <Calendar className="h-5 w-5" />
      case 'Users': return <Users className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ChevronUp className="h-4 w-4 text-green-600" />
      case 'down': return <ChevronDown className="h-4 w-4 text-red-600" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Generate AI Report</CardTitle>
          <CardDescription>
            Configure your report parameters and let AI create a professional narrative
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-3">
            <Label>Report Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableReports.map(report => (
                <button
                  key={report.type}
                  onClick={() => setSelectedType(report.type)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedType === report.type
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded ${
                      selectedType === report.type ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {getReportIcon(report.icon)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{report.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label>Date Range</Label>
            <div className="flex flex-wrap gap-2">
              {dateRangePresets.map(preset => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(preset.getValue())}
                  className={
                    dateRange.start.toDateString() === preset.getValue().start.toDateString() &&
                    dateRange.end.toDateString() === preset.getValue().end.toDateString()
                      ? 'border-primary'
                      : ''
                  }
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Selected: {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as any)}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Select value={length} onValueChange={(v) => setLength(v as any)}>
                <SelectTrigger id="length">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">Include Recommendations</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="recommendations"
                  checked={includeRecommendations}
                  onCheckedChange={setIncludeRecommendations}
                />
                <Label htmlFor="recommendations" className="text-sm font-normal">
                  {includeRecommendations ? 'Yes' : 'No'}
                </Label>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Report */}
      {isGenerating && (
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="grid grid-cols-3 gap-4 mt-6">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedReport && !isGenerating && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{generatedReport.title}</CardTitle>
                <CardDescription className="mt-1">
                  Generated on {new Date(generatedReport.generatedAt).toLocaleString()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadReport}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="sections">Full Report</TabsTrigger>
                <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-semibold mb-3">Executive Summary</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {generatedReport.executiveSummary}
                  </p>
                </div>
                
                {generatedReport.sections[0]?.highlights && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Key Highlights
                    </h4>
                    <ul className="space-y-2">
                      {generatedReport.sections[0].highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sections">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {generatedReport.sections.map((section, idx) => (
                      <div key={idx} className="space-y-3">
                        <h3 className="text-lg font-semibold">{section.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {section.content}
                        </p>
                        
                        {section.highlights && section.highlights.length > 0 && (
                          <div className="pl-4 border-l-2 border-green-600/20">
                            <h4 className="text-sm font-medium mb-2 text-green-700">
                              Highlights
                            </h4>
                            <ul className="space-y-1">
                              {section.highlights.map((item, i) => (
                                <li key={i} className="text-sm text-muted-foreground">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {section.concerns && section.concerns.length > 0 && (
                          <div className="pl-4 border-l-2 border-amber-600/20">
                            <h4 className="text-sm font-medium mb-2 text-amber-700">
                              Areas of Concern
                            </h4>
                            <ul className="space-y-1">
                              {section.concerns.map((item, i) => (
                                <li key={i} className="text-sm text-muted-foreground">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {section.recommendations && section.recommendations.length > 0 && (
                          <div className="pl-4 border-l-2 border-blue-600/20">
                            <h4 className="text-sm font-medium mb-2 text-blue-700">
                              Recommendations
                            </h4>
                            <ul className="space-y-1">
                              {section.recommendations.map((item, i) => (
                                <li key={i} className="text-sm text-muted-foreground">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-lg font-semibold mb-3">Conclusion</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {generatedReport.conclusion}
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="metrics">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedReport.keyMetrics.map((metric, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {metric.label}
                            </p>
                            <p className="text-2xl font-bold mt-1">
                              {typeof metric.value === 'number' 
                                ? metric.value.toLocaleString()
                                : metric.value
                              }
                            </p>
                            {metric.commentary && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {metric.commentary}
                              </p>
                            )}
                          </div>
                          {metric.trend && getTrendIcon(metric.trend)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}