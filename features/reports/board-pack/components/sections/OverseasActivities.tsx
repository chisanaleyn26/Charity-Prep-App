"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, MapPin, DollarSign, AlertTriangle } from "lucide-react"

interface OverseasActivitiesProps {
  data: any
}

export default function OverseasActivities({ data }: OverseasActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle>Overseas Activities</CardTitle>
        </div>
        <CardDescription>
          International operations and financial flows
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data?.activities && data.activities.length > 0 ? (
          <div className="space-y-3">
            {data.activities.map((activity: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">{activity.country || 'Unknown Country'}</h4>
                  </div>
                  <Badge variant={activity.is_active ? "default" : "secondary"}>
                    {activity.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Activity Type</p>
                    <p className="text-sm font-medium">{activity.type || 'Not specified'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Financial Flow</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      £{activity.amount?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
                
                {activity.description && (
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                )}
                
                {activity.risks && activity.risks.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        Risk Factors
                      </span>
                    </div>
                    <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                      {activity.risks.map((risk: string, idx: number) => (
                        <li key={idx} className="ml-6">• {risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No overseas activities recorded</p>
          </div>
        )}
        
        {/* Summary Statistics */}
        {(data?.total_countries || data?.total_amount) && (
          <div className="border-t pt-4 grid grid-cols-2 gap-4">
            {data?.total_countries && (
              <div>
                <p className="text-sm text-muted-foreground">Countries Active In</p>
                <p className="text-2xl font-bold text-primary">{data.total_countries}</p>
              </div>
            )}
            {data?.total_amount && (
              <div>
                <p className="text-sm text-muted-foreground">Total Overseas Spend</p>
                <p className="text-2xl font-bold text-primary">
                  £{data.total_amount.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}