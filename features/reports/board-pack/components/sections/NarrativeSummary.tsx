"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, User, Sparkles } from "lucide-react"

interface NarrativeSummaryProps {
  data: any
}

export default function NarrativeSummary({ data }: NarrativeSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Executive Summary</CardTitle>
        </div>
        <CardDescription>
          AI-generated narrative overview of the reporting period
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metadata */}
        {(data?.period || data?.generated_by || data?.generated_at) && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {data?.period && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Period: {data.period}</span>
              </div>
            )}
            {data?.generated_by && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Prepared by: {data.generated_by}</span>
              </div>
            )}
            {data?.generated_at && (
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI Generated
              </Badge>
            )}
          </div>
        )}

        {/* Main Narrative */}
        {data?.narrative ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {data.narrative.split('\n\n').map((paragraph: string, index: number) => (
              <p key={index} className="text-sm leading-relaxed mb-3">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No narrative summary available</p>
          </div>
        )}

        {/* Key Highlights */}
        {data?.highlights && data.highlights.length > 0 && (
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-medium text-sm">Key Highlights</h4>
            <ul className="space-y-2">
              {data.highlights.map((highlight: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas of Focus */}
        {data?.focus_areas && data.focus_areas.length > 0 && (
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-medium text-sm">Areas Requiring Focus</h4>
            <div className="flex flex-wrap gap-2">
              {data.focus_areas.map((area: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Conclusion */}
        {data?.conclusion && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-2">Conclusion</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.conclusion}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}