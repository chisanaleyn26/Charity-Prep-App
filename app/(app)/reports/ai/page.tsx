'use client'

import { ReportGenerator } from '@/features/ai/components/report-generator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Sparkles,
  Info,
  FileText,
  Shield,
  TrendingUp,
  Globe
} from 'lucide-react'

export default function AIReportsPage() {
  return (
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Report Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate professional compliance reports with AI-powered narratives
          </p>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Our AI analyzes your compliance data to create comprehensive reports with insights, 
            trends, and recommendations. Reports are generated based on real data from your 
            organization and formatted for trustees, regulators, and stakeholders.
          </AlertDescription>
        </Alert>

        {/* Report Generator */}
        <ReportGenerator />

        {/* Examples Section */}
        <Card>
          <CardHeader>
            <CardTitle>What Our AI Reports Include</CardTitle>
            <CardDescription>
              Each report is tailored to its purpose with relevant sections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-primary/10 rounded shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Executive Summary</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      High-level overview of key findings and performance metrics
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 bg-primary/10 rounded shrink-0">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Trend Analysis</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Identification of patterns and changes over time
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-primary/10 rounded shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Risk Assessment</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Highlighting areas of concern and compliance risks
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 bg-primary/10 rounded shrink-0">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Strategic Recommendations</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Actionable insights to improve compliance and operations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-center text-muted-foreground">
                All reports are generated in real-time based on your latest data and can be 
                exported in multiple formats for easy sharing with stakeholders.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}