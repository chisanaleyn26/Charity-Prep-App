"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertCircle, CheckCircle, Users } from "lucide-react"

interface SafeguardingReportProps {
  data: any
}

export default function SafeguardingReport({ data }: SafeguardingReportProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Safeguarding Report</CardTitle>
        </div>
        <CardDescription>
          Safeguarding policies, incidents, and compliance status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Policies Section */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Policies & Procedures
          </h4>
          <div className="grid gap-2">
            {data?.policies ? (
              Object.entries(data.policies).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <Badge variant={value ? "success" : "destructive"}>
                    {value ? "In Place" : "Missing"}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No policy data available</p>
            )}
          </div>
        </div>

        {/* Incidents Section */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Incidents & Actions
          </h4>
          {data?.incidents && data.incidents.length > 0 ? (
            <div className="space-y-2">
              {data.incidents.map((incident: any, index: number) => (
                <div key={index} className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {incident.type || 'Incident'} - {incident.date || 'Date not specified'}
                    </span>
                    <Badge variant={incident.resolved ? "success" : "warning"}>
                      {incident.resolved ? "Resolved" : "Ongoing"}
                    </Badge>
                  </div>
                  {incident.description && (
                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No incidents reported</p>
          )}
        </div>

        {/* Training Section */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Training & Compliance
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {data?.training?.completed || 0}
              </div>
              <div className="text-sm text-muted-foreground">Staff Trained</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {data?.training?.percentage || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Compliance Rate</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {data?.summary && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">{data.summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}