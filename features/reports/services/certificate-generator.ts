import { ComplianceScores } from '@/features/compliance/types/compliance-score'

export interface Certificate {
  id: string
  type: 'compliance-achievement' | 'annual-return-ready' | 'milestone-reached' | 'improvement-award'
  title: string
  subtitle: string
  description: string
  issuedTo: string
  issuedDate: string
  verificationCode: string
  shareableLink?: string
  data: any
}

export interface CertificateTemplate {
  type: Certificate['type']
  title: (data: any) => string
  subtitle: (data: any) => string
  description: (data: any) => string
  eligibility: (data: any) => boolean
  style: {
    bgColor: string
    accentColor: string
    textColor: string
    icon: string
  }
}

// Certificate templates
export const certificateTemplates: CertificateTemplate[] = [
  {
    type: 'compliance-achievement',
    title: (data) => `${data.score}% Compliant`,
    subtitle: () => 'Compliance Achievement Certificate',
    description: (data) => `This certifies that ${data.organizationName} has achieved ${data.score}% compliance with UK charity regulations.`,
    eligibility: (data) => data.score >= 80,
    style: {
      bgColor: '#F0FDF4',
      accentColor: '#B1FA63',
      textColor: '#243837',
      icon: '🏆'
    }
  },
  {
    type: 'annual-return-ready',
    title: () => 'Annual Return Ready',
    subtitle: () => 'Submission Readiness Certificate',
    description: (data) => `This certifies that ${data.organizationName} has completed all required data collection for their Annual Return submission.`,
    eligibility: (data) => data.completionPercentage >= 95,
    style: {
      bgColor: '#F3F4F6',
      accentColor: '#243837',
      textColor: '#243837',
      icon: '✅'
    }
  },
  {
    type: 'milestone-reached',
    title: () => '100% Compliance Achieved',
    subtitle: () => 'Excellence in Compliance',
    description: (data) => `${data.organizationName} has achieved perfect compliance across all regulatory requirements.`,
    eligibility: (data) => data.score === 100,
    style: {
      bgColor: '#FEF3C7',
      accentColor: '#FE7733',
      textColor: '#243837',
      icon: '🌟'
    }
  },
  {
    type: 'improvement-award',
    title: (data) => `${data.improvement}% Improvement`,
    subtitle: () => 'Most Improved Compliance',
    description: (data) => `Recognizing ${data.organizationName}'s ${data.improvement}% improvement in compliance score over the past quarter.`,
    eligibility: (data) => data.improvement >= 20,
    style: {
      bgColor: '#EDE9FE',
      accentColor: '#B2A1FF',
      textColor: '#243837',
      icon: '📈'
    }
  }
]

export function generateCertificate(
  type: Certificate['type'],
  organizationName: string,
  data: any
): Certificate | null {
  const template = certificateTemplates.find(t => t.type === type)
  if (!template) return null
  
  if (!template.eligibility(data)) return null
  
  const verificationCode = generateVerificationCode()
  
  return {
    id: crypto.randomUUID(),
    type,
    title: template.title(data),
    subtitle: template.subtitle(data),
    description: template.description({ ...data, organizationName }),
    issuedTo: organizationName,
    issuedDate: new Date().toISOString(),
    verificationCode,
    shareableLink: `/verify/${verificationCode}`,
    data
  }
}

export function getEligibleCertificates(
  organizationName: string,
  complianceData: {
    currentScore: number
    previousScore?: number
    completionPercentage: number
  }
): Certificate[] {
  const certificates: Certificate[] = []
  
  // Check each template
  certificateTemplates.forEach(template => {
    const data = {
      organizationName,
      score: complianceData.currentScore,
      completionPercentage: complianceData.completionPercentage,
      improvement: complianceData.previousScore 
        ? complianceData.currentScore - complianceData.previousScore 
        : 0
    }
    
    const certificate = generateCertificate(template.type, organizationName, data)
    if (certificate) {
      certificates.push(certificate)
    }
  })
  
  return certificates
}

export function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function getCertificateStyle(type: Certificate['type']) {
  const template = certificateTemplates.find(t => t.type === type)
  return template?.style || {
    bgColor: '#F3F4F6',
    accentColor: '#243837',
    textColor: '#243837',
    icon: '📄'
  }
}

// Generate QR code data for verification
export function generateQRCodeData(certificate: Certificate): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://charityprep.uk'
  return `${baseUrl}/verify/${certificate.verificationCode}`
}

// Social sharing text
export function generateShareText(certificate: Certificate): {
  twitter: string
  linkedin: string
  email: { subject: string; body: string }
} {
  const baseText = `${certificate.issuedTo} has earned: ${certificate.title}`
  
  return {
    twitter: `🎉 ${baseText} via @CharityPrep #CharityCompliance #UKCharity`,
    linkedin: `Proud to announce: ${baseText}\n\n${certificate.description}\n\nAchieved using Charity Prep's compliance management platform.`,
    email: {
      subject: `${certificate.issuedTo} - ${certificate.title}`,
      body: `We're pleased to share that ${certificate.description}\n\nView certificate: ${certificate.shareableLink}\n\nThis achievement was made possible through diligent compliance management and the support of our team.`
    }
  }
}