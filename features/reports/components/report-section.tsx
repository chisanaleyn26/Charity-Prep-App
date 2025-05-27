'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Edit2, Save, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { BoardPackSection } from '../services/template-service'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ReportSectionProps {
  section: BoardPackSection
  organizationName: string
  onEdit: (content: any) => void
}

const COLORS = ['#B1FA63', '#FE7733', '#B2A1FF', '#243837', '#D1D1D1']

export function ReportSection({ section, organizationName, onEdit }: ReportSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(
    typeof section.content === 'string' ? section.content : ''
  )

  const handleSave = () => {
    onEdit(editedContent)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedContent(typeof section.content === 'string' ? section.content : '')
    setIsEditing(false)
  }

  const renderContent = () => {
    switch (section.type) {
      case 'narrative':
        if (isEditing) {
          return (
            <div className="space-y-4">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[200px] font-serif"
                placeholder="Enter your narrative content..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          )
        }
        return (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
              {section.content || 'No content generated yet.'}
            </div>
          </div>
        )
        
      case 'data':
        return renderDataSection()
        
      case 'chart':
        return renderChartSection()
        
      case 'table':
        return renderTableSection()
        
      default:
        return <div>Unknown section type</div>
    }
  }

  const renderDataSection = () => {
    if (!section.content) return <div>No data available</div>
    
    const data = section.content
    
    if (section.id === 'compliance-status') {
      const score = data.overall_score || 0
      const level = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Improvement' : 'Critical'
      const levelColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : score >= 40 ? 'text-orange-600' : 'text-red-600'
      
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold">{score}%</div>
            <div className={`text-lg font-medium ${levelColor}`}>{level}</div>
          </div>
          
          <Progress value={score} className="h-4" />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-semibold">{data.safeguarding_score || 0}%</div>
              <div className="text-sm text-muted-foreground">Safeguarding</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-semibold">{data.has_overseas_activity ? '✓' : '✗'}</div>
              <div className="text-sm text-muted-foreground">International</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-semibold">{data.has_diverse_income ? '✓' : '✗'}</div>
              <div className="text-sm text-muted-foreground">Income Diversity</div>
            </div>
          </div>
        </div>
      )
    }
    
    return <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
  }

  const renderChartSection = () => {
    if (!section.content) return <div>No data available</div>
    
    if (section.id === 'financial-overview' && section.content.bySource) {
      return (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={section.content.bySource}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {section.content.bySource.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `£${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-4">
            <div className="text-2xl font-semibold">
              £{section.content.total.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Income</div>
          </div>
        </div>
      )
    }
    
    if (section.id === 'compliance-trends' && Array.isArray(section.content)) {
      return (
        <div className="space-y-2">
          {section.content.map((item: any) => (
            <div key={item.month} className="flex items-center justify-between">
              <span className="text-sm">{item.month}</span>
              <div className="flex items-center gap-2 flex-1 mx-4">
                <Progress value={item.score} className="flex-1" />
                <span className="text-sm font-medium w-12 text-right">{Math.round(item.score)}%</span>
              </div>
            </div>
          ))}
        </div>
      )
    }
    
    return <div>Chart visualization not available</div>
  }

  const renderTableSection = () => {
    if (!section.content || !Array.isArray(section.content)) {
      return <div>No data available</div>
    }
    
    if (section.id === 'safeguarding-summary') {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>DBS Number</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {section.content.slice(0, 10).map((record: any) => {
              const expiryDate = new Date(record.expiry_date)
              const today = new Date()
              const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              
              let status = 'valid'
              let statusColor = 'bg-green-100 text-green-800'
              
              if (daysUntilExpiry < 0) {
                status = 'expired'
                statusColor = 'bg-red-100 text-red-800'
              } else if (daysUntilExpiry <= 30) {
                status = 'expiring soon'
                statusColor = 'bg-orange-100 text-orange-800'
              } else if (daysUntilExpiry <= 90) {
                status = 'attention'
                statusColor = 'bg-yellow-100 text-yellow-800'
              }
              
              return (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.person_name}</TableCell>
                  <TableCell>{record.role_title}</TableCell>
                  <TableCell className="font-mono text-sm">{record.dbs_certificate_number}</TableCell>
                  <TableCell>{format(expiryDate, 'dd MMM yyyy')}</TableCell>
                  <TableCell>
                    <Badge className={statusColor} variant="secondary">
                      {status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )
    }
    
    if (section.id === 'overseas-activities') {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Amount (GBP)</TableHead>
              <TableHead>Transfer Method</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {section.content.map((activity: any) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">
                  {activity.countries?.name || activity.country_code}
                </TableCell>
                <TableCell>{activity.activity_name}</TableCell>
                <TableCell>£{activity.amount_gbp.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={
                    activity.transfer_method === 'bank_transfer' ? 'default' : 'secondary'
                  }>
                    {activity.transfer_method.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(activity.transfer_date), 'dd MMM yyyy')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }
    
    return (
      <Table>
        <TableBody>
          {section.content.map((item: any, index: number) => (
            <TableRow key={index}>
              <TableCell>{JSON.stringify(item)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{section.title}</h3>
          {section.type === 'narrative' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  // TODO: Regenerate content with AI
                  console.log('Regenerate content')
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  )
}