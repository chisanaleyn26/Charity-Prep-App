'use server'

import { createClient } from '@/lib/supabase/server'
import { Document, Page, Text, View, StyleSheet, pdf, Image, SVG } from '@react-pdf/renderer'
import { calculateComplianceScore } from '@/lib/compliance/calculator'
import { format } from 'date-fns'

// Certificate Styles
const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  border: {
    borderWidth: 3,
    borderColor: '#243837',
    borderStyle: 'solid',
    padding: 40,
    minHeight: '90%',
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#243837',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 30,
  },
  content: {
    textAlign: 'center',
    marginBottom: 40,
  },
  certifyText: {
    fontSize: 14,
    marginBottom: 20,
    color: '#333333',
  },
  organizationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#243837',
    marginBottom: 20,
  },
  achievement: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 10,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#B1FA63',
    marginBottom: 10,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 30,
  },
  modules: {
    marginTop: 30,
    marginBottom: 30,
  },
  moduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 60,
  },
  moduleName: {
    fontSize: 12,
    color: '#333333',
  },
  moduleScore: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#243837',
  },
  validitySection: {
    marginTop: 40,
    textAlign: 'center',
  },
  validityText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 60,
    right: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 20,
  },
  signature: {
    textAlign: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#333333',
    width: 200,
    marginTop: 40,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#666666',
  },
  certificateNumber: {
    position: 'absolute',
    top: 30,
    right: 30,
    fontSize: 10,
    color: '#999999',
  },
  ribbon: {
    position: 'absolute',
    top: 100,
    right: -30,
    backgroundColor: '#B1FA63',
    padding: 10,
    transform: 'rotate(45deg)',
    width: 150,
    textAlign: 'center',
  },
  ribbonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#243837',
  },
})

export interface CertificateData {
  organizationId: string
  organizationName: string
  period: {
    start: Date
    end: Date
  }
  scores: {
    overall: number
    safeguarding: number
    overseas: number
    income: number
  }
  certificateNumber: string
  issueDate: Date
  expiryDate: Date
}

/**
 * Generate compliance certificate
 */
export async function generateComplianceCertificate(
  organizationId: string,
  period: { start: Date; end: Date }
): Promise<{ pdf?: Buffer; certificateNumber?: string; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Get organization
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()
    
    if (!org) {
      return { error: 'Organization not found' }
    }
    
    // Get compliance data
    const { data: safeguarding } = await supabase
      .from('safeguarding_records')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('created_at', period.start.toISOString())
      .lte('created_at', period.end.toISOString())
    
    const { data: overseas } = await supabase
      .from('overseas_activities')
      .select('*, countries(*)')
      .eq('organization_id', organizationId)
      .gte('activity_date', period.start.toISOString())
      .lte('activity_date', period.end.toISOString())
    
    const { data: income } = await supabase
      .from('income_records')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('date_received', period.start.toISOString())
      .lte('date_received', period.end.toISOString())
    
    const { data: countries } = await supabase
      .from('countries')
      .select('*')
    
    // Calculate scores
    const scores = calculateComplianceScore(
      safeguarding || [],
      overseas || [],
      income || [],
      countries || []
    )
    
    // Check if meets threshold for certification
    if (scores.overall < 80) {
      return { 
        error: `Compliance score of ${scores.overall}% is below the required 80% threshold for certification` 
      }
    }
    
    // Generate certificate number
    const certificateNumber = `CP${org.charity_number || org.id.substring(0, 6).toUpperCase()}-${format(new Date(), 'yyyyMMdd')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    
    const issueDate = new Date()
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + 12) // Valid for 12 months
    
    // Store certificate record
    await supabase
      .from('compliance_certificates')
      .insert({
        organization_id: organizationId,
        certificate_number: certificateNumber,
        period_start: period.start,
        period_end: period.end,
        overall_score: scores.overall,
        safeguarding_score: scores.safeguarding,
        overseas_score: scores.overseas,
        income_score: scores.income,
        issue_date: issueDate,
        expiry_date: expiryDate,
        status: 'active'
      })
    
    // Create certificate PDF
    const CertificateDocument = (
      <Document>
        <Page size="A4" orientation="portrait" style={styles.page}>
          <View style={styles.border}>
            <Text style={styles.certificateNumber}>{certificateNumber}</Text>
            
            <View style={styles.header}>
              <Text style={styles.title}>Certificate of Compliance</Text>
              <Text style={styles.subtitle}>Charity Commission Standards</Text>
            </View>
            
            <View style={styles.content}>
              <Text style={styles.certifyText}>This is to certify that</Text>
              <Text style={styles.organizationName}>{org.name}</Text>
              {org.charity_number && (
                <Text style={styles.achievement}>Registered Charity No. {org.charity_number}</Text>
              )}
              
              <Text style={styles.achievement}>has achieved a compliance score of</Text>
              <Text style={styles.score}>{scores.overall}%</Text>
              <Text style={styles.scoreLabel}>OVERALL COMPLIANCE SCORE</Text>
              
              <View style={styles.modules}>
                <View style={styles.moduleRow}>
                  <Text style={styles.moduleName}>Safeguarding Compliance</Text>
                  <Text style={styles.moduleScore}>{scores.safeguarding}%</Text>
                </View>
                <View style={styles.moduleRow}>
                  <Text style={styles.moduleName}>Overseas Activities Compliance</Text>
                  <Text style={styles.moduleScore}>{scores.overseas}%</Text>
                </View>
                <View style={styles.moduleRow}>
                  <Text style={styles.moduleName}>Income & Funding Compliance</Text>
                  <Text style={styles.moduleScore}>{scores.income}%</Text>
                </View>
              </View>
              
              <View style={styles.validitySection}>
                <Text style={styles.validityText}>
                  Assessment Period: {format(period.start, 'dd MMMM yyyy')} - {format(period.end, 'dd MMMM yyyy')}
                </Text>
                <Text style={styles.validityText}>
                  Issue Date: {format(issueDate, 'dd MMMM yyyy')}
                </Text>
                <Text style={styles.validityText}>
                  Valid Until: {format(expiryDate, 'dd MMMM yyyy')}
                </Text>
              </View>
            </View>
            
            <View style={styles.footer}>
              <View style={styles.signature}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Compliance Officer</Text>
              </View>
              <View style={styles.signature}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Date</Text>
              </View>
            </View>
            
            {scores.overall >= 95 && (
              <View style={styles.ribbon}>
                <Text style={styles.ribbonText}>EXCELLENT</Text>
              </View>
            )}
          </View>
        </Page>
      </Document>
    )
    
    // Generate PDF buffer
    const pdfBuffer = await pdf(CertificateDocument).toBuffer()
    
    return { 
      pdf: pdfBuffer,
      certificateNumber 
    }
    
  } catch (error) {
    console.error('Certificate generation error:', error)
    return { error: 'Failed to generate certificate' }
  }
}

/**
 * Verify certificate authenticity
 */
export async function verifyCertificate(
  certificateNumber: string
): Promise<{ 
  valid: boolean
  certificate?: any
  error?: string 
}> {
  try {
    const supabase = await createClient()
    
    const { data: certificate } = await supabase
      .from('compliance_certificates')
      .select(`
        *,
        organizations (
          name,
          charity_number
        )
      `)
      .eq('certificate_number', certificateNumber)
      .single()
    
    if (!certificate) {
      return { valid: false, error: 'Certificate not found' }
    }
    
    // Check if expired
    const now = new Date()
    const expiryDate = new Date(certificate.expiry_date)
    
    if (now > expiryDate) {
      return { 
        valid: false, 
        error: 'Certificate has expired',
        certificate 
      }
    }
    
    // Check if revoked
    if (certificate.status !== 'active') {
      return { 
        valid: false, 
        error: `Certificate status: ${certificate.status}`,
        certificate 
      }
    }
    
    return { 
      valid: true,
      certificate 
    }
    
  } catch (error) {
    console.error('Certificate verification error:', error)
    return { 
      valid: false,
      error: 'Failed to verify certificate' 
    }
  }
}

/**
 * Revoke certificate
 */
export async function revokeCertificate(
  certificateNumber: string,
  reason: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('compliance_certificates')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revocation_reason: reason
      })
      .eq('certificate_number', certificateNumber)
    
    if (error) throw error
    
    return { success: true }
    
  } catch (error) {
    console.error('Certificate revocation error:', error)
    return { error: 'Failed to revoke certificate' }
  }
}

/**
 * List organization certificates
 */
export async function listCertificates(
  organizationId: string,
  options?: {
    status?: 'active' | 'expired' | 'revoked'
    limit?: number
  }
): Promise<{ certificates?: any[]; error?: string }> {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('compliance_certificates')
      .select('*')
      .eq('organization_id', organizationId)
      .order('issue_date', { ascending: false })
    
    if (options?.status) {
      if (options.status === 'expired') {
        query = query.lt('expiry_date', new Date().toISOString())
      } else {
        query = query.eq('status', options.status)
      }
    }
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    const { data: certificates, error } = await query
    
    if (error) throw error
    
    return { certificates: certificates || [] }
    
  } catch (error) {
    console.error('List certificates error:', error)
    return { error: 'Failed to list certificates' }
  }
}