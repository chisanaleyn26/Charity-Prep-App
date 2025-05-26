'use server'

import { createClient } from '@/lib/supabase/server'
import { generateAnnualReturn } from './annual-return'
import { getDashboardData } from './dashboard'
import { generateBoardNarrative } from '@/lib/ai/narrative-generator'
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer'
import { calculateComplianceScore } from '@/lib/compliance/calculator'

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#B1FA63',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#243837',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#243837',
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  list: {
    marginLeft: 20,
  },
  listItem: {
    marginBottom: 5,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#F5F5F5',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
  highlight: {
    backgroundColor: '#B1FA63',
    padding: 2,
  },
})

export interface BoardPackOptions {
  sections: Array<
    | 'executive_summary'
    | 'compliance_overview'
    | 'financial_summary'
    | 'safeguarding_report'
    | 'overseas_activities'
    | 'risk_assessment'
    | 'recommendations'
  >
  period: {
    start: Date
    end: Date
  }
  includeNarrative: boolean
  branding?: {
    primaryColor?: string
    logo?: string
  }
}

/**
 * Generate Board Pack PDF
 */
export async function generateBoardPack(
  organizationId: string,
  options: BoardPackOptions
): Promise<{ pdf?: Buffer; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Get organization details
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()
    
    if (!org) {
      return { error: 'Organization not found' }
    }
    
    // Get all necessary data
    const [dashboardData, annualReturnData] = await Promise.all([
      getDashboardData(organizationId),
      generateAnnualReturn(organizationId)
    ])
    
    if ('error' in dashboardData || !annualReturnData.data) {
      return { error: 'Failed to gather report data' }
    }
    
    // Generate AI narrative if requested
    let narrative: string | undefined
    if (options.includeNarrative) {
      const { data: safeguarding } = await supabase
        .from('safeguarding_records')
        .select('*')
        .eq('organization_id', organizationId)
      
      const { data: overseas } = await supabase
        .from('overseas_activities')
        .select('*')
        .eq('organization_id', organizationId)
      
      const { data: income } = await supabase
        .from('income_records')
        .select('*')
        .eq('organization_id', organizationId)
      
      const { data: countries } = await supabase
        .from('countries')
        .select('*')
      
      const scores = calculateComplianceScore(
        safeguarding || [],
        overseas || [],
        income || [],
        countries || []
      )
      
      const narrativeResult = await generateBoardNarrative(
        org.name,
        scores,
        options.period,
        {
          tone: 'formal',
          includeRecommendations: true,
          highlightRisks: true,
          audienceLevel: 'board'
        }
      )
      
      narrative = narrativeResult.narrative
    }
    
    // Create PDF document
    const BoardPackDocument = (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{org.name}</Text>
            <Text style={styles.subtitle}>
              Board Report - {options.period.start.toLocaleDateString()} to {options.period.end.toLocaleDateString()}
            </Text>
          </View>
          
          {/* Executive Summary */}
          {options.sections.includes('executive_summary') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Executive Summary</Text>
              <Text style={styles.paragraph}>
                Compliance Score: {dashboardData.compliance.score}% ({dashboardData.compliance.level})
              </Text>
              <Text style={styles.paragraph}>
                {dashboardData.compliance.message}
              </Text>
              {narrative && (
                <Text style={styles.paragraph}>{narrative.split('\n')[0]}</Text>
              )}
            </View>
          )}
          
          {/* Compliance Overview */}
          {options.sections.includes('compliance_overview') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Compliance Overview</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.tableCell}>Module</Text>
                  <Text style={styles.tableCell}>Score</Text>
                  <Text style={styles.tableCell}>Status</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Safeguarding</Text>
                  <Text style={styles.tableCell}>{dashboardData.compliance.breakdown.safeguarding}%</Text>
                  <Text style={styles.tableCell}>
                    {dashboardData.compliance.breakdown.safeguarding >= 90 ? 'Good' : 'Needs Attention'}
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Overseas Activities</Text>
                  <Text style={styles.tableCell}>{dashboardData.compliance.breakdown.overseas}%</Text>
                  <Text style={styles.tableCell}>
                    {dashboardData.compliance.breakdown.overseas >= 90 ? 'Good' : 'Needs Attention'}
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Income Tracking</Text>
                  <Text style={styles.tableCell}>{dashboardData.compliance.breakdown.income}%</Text>
                  <Text style={styles.tableCell}>
                    {dashboardData.compliance.breakdown.income >= 90 ? 'Good' : 'Needs Attention'}
                  </Text>
                </View>
              </View>
            </View>
          )}
          
          {/* Financial Summary */}
          {options.sections.includes('financial_summary') && annualReturnData.data && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Financial Summary</Text>
              <Text style={styles.paragraph}>
                Total Income: £{annualReturnData.data.financialSummary.totalIncome.toLocaleString()}
              </Text>
              <Text style={styles.paragraph}>
                Total Expenditure: £{annualReturnData.data.financialSummary.totalExpenditure.toLocaleString()}
              </Text>
              <Text style={styles.paragraph}>
                Restricted Funds: £{annualReturnData.data.financialSummary.restrictedFunds.toLocaleString()}
              </Text>
              <Text style={styles.paragraph}>
                Major Donors: {annualReturnData.data.financialSummary.majorDonors}
              </Text>
            </View>
          )}
          
          {/* Footer */}
          <Text style={styles.footer}>
            Generated by Charity Prep on {new Date().toLocaleDateString()} | Page 1
          </Text>
        </Page>
        
        {/* Additional pages for other sections */}
        {options.sections.includes('safeguarding_report') && annualReturnData.data && (
          <Page size="A4" style={styles.page}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Safeguarding Report</Text>
              <Text style={styles.paragraph}>
                Valid DBS Checks: {annualReturnData.data.safeguarding.dbsChecksValid} of {annualReturnData.data.safeguarding.dbsChecksTotal}
              </Text>
              <Text style={styles.paragraph}>
                Training Completed: {annualReturnData.data.safeguarding.trainingCompleted}
              </Text>
              <Text style={styles.paragraph}>
                Policy Last Reviewed: {annualReturnData.data.safeguarding.policyLastReviewed || 'Not recorded'}
              </Text>
              {dashboardData.alerts
                .filter(a => a.type === 'error' && a.title.includes('DBS'))
                .map((alert, i) => (
                  <Text key={i} style={[styles.paragraph, { color: '#CC5757' }]}>
                    ⚠️ {alert.message}
                  </Text>
                ))}
            </View>
            <Text style={styles.footer}>
              Generated by Charity Prep on {new Date().toLocaleDateString()} | Page 2
            </Text>
          </Page>
        )}
      </Document>
    )
    
    // Generate PDF buffer
    const pdfBuffer = await pdf(BoardPackDocument).toBuffer()
    
    return { pdf: pdfBuffer }
    
  } catch (error) {
    console.error('Board pack generation error:', error)
    return { error: 'Failed to generate board pack' }
  }
}

/**
 * Email board pack to trustees
 */
export async function emailBoardPack(
  organizationId: string,
  pdfBuffer: Buffer,
  recipients: string[]
): Promise<{ success?: boolean; error?: string }> {
  // This would integrate with an email service
  // For now, we'll just create notifications
  const supabase = await createClient()
  
  try {
    for (const email of recipients) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()
      
      if (user) {
        await supabase
          .from('notifications')
          .insert({
            organization_id: organizationId,
            user_id: user.id,
            type: 'board_pack_ready',
            title: 'Board Pack Available',
            message: 'The latest board pack has been generated and is ready for review.',
            severity: 'info',
            link: `/reports/board-pack`
          })
      }
    }
    
    return { success: true }
  } catch (error) {
    return { error: 'Failed to send notifications' }
  }
}