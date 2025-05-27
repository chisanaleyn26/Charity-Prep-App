"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, DollarSign, Calendar } from "lucide-react"

interface FundraisingReportProps {
  data: any
}

export default function FundraisingReport({ data }: FundraisingReportProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <CardTitle>Fundraising Activities</CardTitle>
        </div>
        <CardDescription>
          Overview of fundraising methods and performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data?.methods && data.methods.length > 0 ? (
          <div className="space-y-3">
            {data.methods.map((method: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{method.name || 'Unnamed Method'}</h4>
                  <Badge variant={method.is_active ? "default" : "secondary"}>
                    {method.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Income:</span>
                    <span className="font-medium">
                      £{method.income_amount?.toLocaleString() || '0'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-medium">{method.frequency || 'N/A'}</span>
                  </div>
                </div>
                
                {method.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {method.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No fundraising data available</p>
          </div>
        )}
        
        {data?.total_income && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Fundraising Income</span>
              <span className="text-lg font-bold text-primary">
                £{data.total_income.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}