'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function OverseasActivitiesTable({ initialActivities = [] }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overseas Activities</CardTitle>
        <CardDescription>
          Track and manage your charity's international operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          {initialActivities.length === 0 
            ? "No overseas activities found" 
            : `${initialActivities.length} activities`}
        </div>
      </CardContent>
    </Card>
  )
}