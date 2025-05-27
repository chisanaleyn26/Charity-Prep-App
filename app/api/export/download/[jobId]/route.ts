import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateExportData } from '@/features/reports/export/utils/data-generator'
import { formatExportData, createDownloadBlob } from '@/features/reports/export/utils/data-formatter'
import { ExportFormat, DataSourceType } from '@/features/reports/export/types/export'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()
    
    if (!membership) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Parse jobId to extract export parameters
    // Format: {dataSource}-{format}-{timestamp}
    const [dataSource, format, timestamp] = params.jobId.split('-')
    
    if (!dataSource || !format) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
    }

    // Validate parameters
    const validDataSources: DataSourceType[] = [
      'compliance-scores', 'safeguarding-incidents', 'overseas-activities', 
      'income-sources', 'documents', 'annual-return', 'board-pack', 'all-data'
    ]
    const validFormats: ExportFormat[] = ['csv', 'excel', 'json', 'pdf', 'xml']

    if (!validDataSources.includes(dataSource as DataSourceType)) {
      return NextResponse.json({ error: 'Invalid data source' }, { status: 400 })
    }

    if (!validFormats.includes(format as ExportFormat)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }

    // Generate export data
    const rawData = await generateExportData(
      membership.organization_id,
      dataSource as DataSourceType
    )

    // Format data
    const formattedData = await formatExportData(
      rawData,
      format as ExportFormat
    )

    // Create download blob
    const { blob, mimeType } = createDownloadBlob(formattedData, format as ExportFormat)

    // Generate filename
    const fileName = `charity-prep-${dataSource}-${new Date().toISOString().split('T')[0]}.${format}`

    // Create response with file download
    const response = new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

    return response

  } catch (error) {
    console.error('Export download error:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Export file not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    )
  }
}