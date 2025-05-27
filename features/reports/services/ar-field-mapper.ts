import { AnnualReturnData } from './annual-return-service'

// Charity Commission Annual Return field mappings
export interface ARFieldMapping {
  fieldId: string
  fieldName: string
  section: string
  value: string | number | boolean | null
  required: boolean
  help?: string
}

export function mapToCharityCommissionFields(data: AnnualReturnData): ARFieldMapping[] {
  const mappings: ARFieldMapping[] = [
    // Section A: Charity Information
    {
      fieldId: 'A1',
      fieldName: 'Charity Name',
      section: 'Charity Information',
      value: data.charityName,
      required: true
    },
    {
      fieldId: 'A2',
      fieldName: 'Registered Charity Number',
      section: 'Charity Information',
      value: data.charityNumber,
      required: true
    },
    {
      fieldId: 'A3',
      fieldName: 'Financial Year End Date',
      section: 'Charity Information',
      value: data.financialYearEnd,
      required: true
    },
    
    // Section B: People
    {
      fieldId: 'B1',
      fieldName: 'Number of Employees',
      section: 'People',
      value: data.totalStaff,
      required: true,
      help: 'Total number of paid staff employed during the year'
    },
    {
      fieldId: 'B2',
      fieldName: 'Number of Volunteers',
      section: 'People',
      value: data.totalVolunteers,
      required: true,
      help: 'Total number of unpaid volunteers who helped during the year'
    },
    {
      fieldId: 'B3',
      fieldName: 'Number of Trustees',
      section: 'People',
      value: data.totalTrustees,
      required: true,
      help: 'Total number of charity trustees'
    },
    
    // Section C: Safeguarding
    {
      fieldId: 'C1',
      fieldName: 'Working with Children',
      section: 'Safeguarding',
      value: data.workingWithChildren ? 'Yes' : 'No',
      required: true,
      help: 'Does your charity work with children?'
    },
    {
      fieldId: 'C2',
      fieldName: 'Working with Vulnerable Adults',
      section: 'Safeguarding',
      value: data.workingWithVulnerableAdults ? 'Yes' : 'No',
      required: true,
      help: 'Does your charity work with vulnerable adults?'
    },
    {
      fieldId: 'C3',
      fieldName: 'DBS Checks Complete',
      section: 'Safeguarding',
      value: data.dbsChecksComplete ? 'Yes' : 'No',
      required: data.workingWithChildren || data.workingWithVulnerableAdults,
      help: 'Have all required DBS checks been completed and are up to date?'
    },
    {
      fieldId: 'C4',
      fieldName: 'Safeguarding Policies Reviewed',
      section: 'Safeguarding',
      value: data.safeguardingPoliciesReviewed ? 'Yes' : 'No',
      required: data.workingWithChildren || data.workingWithVulnerableAdults,
      help: 'Have safeguarding policies been reviewed in the last 12 months?'
    },
    
    // Section D: International Operations
    {
      fieldId: 'D1',
      fieldName: 'Operates Overseas',
      section: 'International',
      value: data.operatesOverseas ? 'Yes' : 'No',
      required: true,
      help: 'Did your charity operate outside the UK?'
    },
    {
      fieldId: 'D2',
      fieldName: 'Countries of Operation',
      section: 'International',
      value: data.countriesList.join(', '),
      required: data.operatesOverseas,
      help: 'List all countries where your charity operated'
    },
    {
      fieldId: 'D3',
      fieldName: 'Total Overseas Expenditure',
      section: 'International',
      value: data.overseasExpenditure,
      required: data.operatesOverseas,
      help: 'Total amount spent on overseas activities in GBP'
    },
    {
      fieldId: 'D4',
      fieldName: 'Non-Bank Transfer Percentage',
      section: 'International',
      value: data.nonBankTransferPercentage.toFixed(1) + '%',
      required: data.operatesOverseas && data.nonBankTransferPercentage > 0,
      help: 'Percentage of overseas funds transferred via non-bank methods'
    },
    
    // Section E: Income
    {
      fieldId: 'E1',
      fieldName: 'Total Income',
      section: 'Income',
      value: data.totalIncome,
      required: true,
      help: 'Total income received during the financial year'
    },
    {
      fieldId: 'E2',
      fieldName: 'Income from Donations and Legacies',
      section: 'Income',
      value: data.incomeFromDonationsAndLegacies,
      required: true,
      help: 'Income from donations, gifts, and legacies'
    },
    {
      fieldId: 'E3',
      fieldName: 'Income from Charitable Activities',
      section: 'Income',
      value: data.incomeFromCharitableActivities,
      required: true,
      help: 'Income from activities in furtherance of charity objectives'
    },
    {
      fieldId: 'E4',
      fieldName: 'Income from Other Trading Activities',
      section: 'Income',
      value: data.incomeFromOtherTrading,
      required: true,
      help: 'Income from trading subsidiaries, charity shops, etc.'
    },
    {
      fieldId: 'E5',
      fieldName: 'Income from Investments',
      section: 'Income',
      value: data.incomeFromInvestments,
      required: true,
      help: 'Income from investments, interest, dividends'
    },
    
    // Section F: Major Donations
    {
      fieldId: 'F1',
      fieldName: 'Highest Corporate Donation',
      section: 'Major Donations',
      value: data.highestCorporateDonation || 'None',
      required: false,
      help: 'Highest single donation from a corporate entity'
    },
    {
      fieldId: 'F2',
      fieldName: 'Highest Individual Donation',
      section: 'Major Donations',
      value: data.highestIndividualDonation || 'None',
      required: false,
      help: 'Highest single donation from an individual'
    },
    {
      fieldId: 'F3',
      fieldName: 'Related Party Transactions',
      section: 'Major Donations',
      value: data.hasRelatedPartyTransactions ? 'Yes' : 'No',
      required: true,
      help: 'Were there any transactions with related parties?'
    },
    {
      fieldId: 'F4',
      fieldName: 'Related Party Transaction Value',
      section: 'Major Donations',
      value: data.relatedPartyAmount,
      required: data.hasRelatedPartyTransactions,
      help: 'Total value of related party transactions'
    },
    
    // Section G: Fundraising
    {
      fieldId: 'G1',
      fieldName: 'Fundraising Methods Used',
      section: 'Fundraising',
      value: data.fundraisingMethods.join(', '),
      required: true,
      help: 'List all fundraising methods used during the year'
    },
    {
      fieldId: 'G2',
      fieldName: 'Professional Fundraiser Used',
      section: 'Fundraising',
      value: data.usesProfessionalFundraiser ? 'Yes' : 'No',
      required: true,
      help: 'Did you use a professional fundraising organization?'
    }
  ]
  
  return mappings
}

// Format value for Charity Commission submission
export function formatValueForSubmission(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  
  if (typeof value === 'number') {
    // Format currency values
    if (value >= 1000) {
      return value.toLocaleString('en-GB')
    }
    return value.toString()
  }
  
  return value.toString()
}

// Export data in CSV format for Annual Return
export function exportAsCSV(mappings: ARFieldMapping[]): string {
  const headers = ['Field ID', 'Field Name', 'Section', 'Value', 'Required']
  const rows = mappings.map(field => [
    field.fieldId,
    field.fieldName,
    field.section,
    formatValueForSubmission(field.value),
    field.required ? 'Yes' : 'No'
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  return csvContent
}

// Generate completion report
export function generateCompletionReport(mappings: ARFieldMapping[]): {
  complete: number
  required: number
  missing: ARFieldMapping[]
  sections: Record<string, { complete: number; total: number }>
} {
  const requiredFields = mappings.filter(f => f.required)
  const completeFields = requiredFields.filter(f => 
    f.value !== null && 
    f.value !== undefined && 
    f.value !== '' &&
    f.value !== 0
  )
  
  const missingFields = requiredFields.filter(f => 
    f.value === null || 
    f.value === undefined || 
    f.value === '' ||
    f.value === 0
  )
  
  // Group by section
  const sections: Record<string, { complete: number; total: number }> = {}
  
  mappings.forEach(field => {
    if (!sections[field.section]) {
      sections[field.section] = { complete: 0, total: 0 }
    }
    
    sections[field.section].total++
    
    if (field.value !== null && field.value !== undefined && field.value !== '') {
      sections[field.section].complete++
    }
  })
  
  return {
    complete: completeFields.length,
    required: requiredFields.length,
    missing: missingFields,
    sections
  }
}