'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Download, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react'
import { ExportJob } from '../types/export'
import { formatDistanceToNow } from 'date-fns'

interface ExportHistoryProps {
  jobs: ExportJob[]
  onRefresh: () => void
}

export default function ExportHistory({ jobs, onRefresh }: ExportHistoryProps) {
  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'processing':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Export History</h3>
            <p className="text-muted-foreground">
              Your export history will appear here once you create your first export.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Export History</CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <h4 className="font-medium">
                      {job.fileName || 'Export Job'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Started {formatDistanceToNow(new Date(job.startedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {getStatusBadge(job.status)}
              </div>

              {job.status === 'processing' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} />
                  {job.processedRows !== undefined && job.totalRows && (
                    <p className="text-xs text-muted-foreground text-center">
                      {job.processedRows} of {job.totalRows} rows processed
                    </p>
                  )}
                </div>
              )}

              {job.status === 'completed' && (
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Size: {formatFileSize(job.fileSize)}</p>
                    {job.totalRows && (
                      <p>Rows: {job.totalRows.toLocaleString()}</p>
                    )}
                  </div>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}

              {job.status === 'failed' && job.error && (
                <div className="flex items-start gap-2 pt-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-600">{job.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}