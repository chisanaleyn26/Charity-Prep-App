import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRecentActivities, getRecentAuditLogs } from '@/lib/services/activity-logging.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    // Await params first
    const { orgId } = await params
    
    const supabase = await createClient()
    
    // Verify user has access to this organization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: member } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)
      .single()
    
    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'activities' // 'activities' or 'audit'
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Fetch data based on type
    let data: any[]
    if (type === 'audit') {
      data = await getRecentAuditLogs(orgId, limit)
    } else {
      data = await getRecentActivities(orgId, limit)
    }
    
    // Transform data into a consistent format for the frontend
    const activities = data.map(item => {
      if (type === 'audit') {
        // Transform audit log
        return {
          id: item.id,
          type: item.action,
          title: getAuditTitle(item.action, item.resource_name),
          description: getAuditDescription(item),
          user: {
            name: item.user_name || 'System',
            email: item.user_email
          },
          timestamp: item.created_at,
          icon: getActionIcon(item.action),
          color: getSeverityColor(item.severity),
          metadata: {
            resource_type: item.resource_type,
            resource_id: item.resource_id,
            severity: item.severity
          }
        }
      } else {
        // Transform activity
        return {
          id: item.id,
          type: item.activity_type,
          title: getActivityTitle(item.activity_type, item.resource_name),
          description: getActivityDescription(item),
          user: {
            name: item.user_name || 'Unknown User',
            email: item.user_email
          },
          timestamp: item.created_at,
          icon: getActivityIcon(item.activity_type),
          color: getActivityColor(item.activity_type),
          metadata: item.metadata
        }
      }
    })
    
    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

// Helper functions for formatting
function getAuditTitle(action: string, resourceName?: string): string {
  const [resource, verb] = action.split('.')
  const readableResource = resource.replace(/_/g, ' ')
  
  switch (verb) {
    case 'created':
      return `New ${readableResource} created${resourceName ? `: ${resourceName}` : ''}`
    case 'updated':
      return `${readableResource} updated${resourceName ? `: ${resourceName}` : ''}`
    case 'deleted':
      return `${readableResource} deleted${resourceName ? `: ${resourceName}` : ''}`
    default:
      return action
  }
}

function getAuditDescription(log: any): string {
  const [resource] = log.action.split('.')
  
  switch (resource) {
    case 'safeguarding_records':
      return 'Safeguarding compliance record modified'
    case 'overseas_activities':
      return 'Overseas activity record modified'
    case 'documents':
      return 'Document management action'
    case 'organization_members':
      return 'Team member access changed'
    default:
      return 'Organization data modified'
  }
}

function getActivityTitle(type: string, resourceName?: string): string {
  const titles: Record<string, string> = {
    'page.view': 'Page viewed',
    'compliance.score.view': 'Compliance score checked',
    'safeguarding.list': 'Viewed safeguarding records',
    'safeguarding.create': `Created safeguarding record${resourceName ? `: ${resourceName}` : ''}`,
    'document.upload': `Uploaded document${resourceName ? `: ${resourceName}` : ''}`,
    'report.generate': 'Generated report',
    'ai.chat.message': 'Used AI assistant',
    'search.perform': 'Performed search'
  }
  
  return titles[type] || type
}

function getActivityDescription(activity: any): string {
  if (activity.metadata?.description) {
    return activity.metadata.description
  }
  
  const descriptions: Record<string, string> = {
    'page.view': `Visited ${activity.metadata?.page || 'page'}`,
    'document.upload': `File size: ${activity.metadata?.fileSize || 'Unknown'}`,
    'report.generate': `Report type: ${activity.metadata?.reportType || 'Unknown'}`,
    'ai.chat.message': 'Asked compliance question',
    'search.perform': `Searched for: "${activity.metadata?.query || ''}"`
  }
  
  return descriptions[activity.activity_type] || 'Activity performed'
}

function getActionIcon(action: string): string {
  const [resource, verb] = action.split('.')
  
  if (verb === 'deleted') return 'Trash2'
  if (verb === 'created') return 'Plus'
  if (verb === 'updated') return 'Edit'
  
  const icons: Record<string, string> = {
    'safeguarding_records': 'Shield',
    'overseas_activities': 'Globe',
    'documents': 'FileText',
    'organization_members': 'Users'
  }
  
  return icons[resource] || 'Activity'
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    'page.view': 'Eye',
    'compliance.score.view': 'TrendingUp',
    'safeguarding': 'Shield',
    'overseas': 'Globe',
    'document': 'FileText',
    'report': 'FileText',
    'ai': 'Sparkles',
    'search': 'Search',
    'profile': 'User',
    'member': 'Users'
  }
  
  const category = type.split('.')[0]
  return icons[category] || 'Activity'
}

function getSeverityColor(severity?: string): string {
  const colors: Record<string, string> = {
    'critical': 'red',
    'error': 'red',
    'warning': 'yellow',
    'info': 'blue'
  }
  
  return colors[severity || 'info'] || 'gray'
}

function getActivityColor(type: string): string {
  const category = type.split('.')[0]
  const colors: Record<string, string> = {
    'page': 'gray',
    'compliance': 'blue',
    'safeguarding': 'green',
    'overseas': 'purple',
    'document': 'yellow',
    'report': 'indigo',
    'ai': 'pink',
    'search': 'gray',
    'auth': 'red'
  }
  
  return colors[category] || 'gray'
}