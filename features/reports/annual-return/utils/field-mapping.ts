import type { AnnualReturnData, ARFieldMapping } from '../types/annual-return';

// Maps our data structure to Charity Commission Annual Return fields
export function mapDataToARFields(data: AnnualReturnData): ARFieldMapping[] {
  const mappings: ARFieldMapping[] = [];

  // Section A: Charity Information (pre-filled by Commission)
  
  // Section B: Safeguarding
  mappings.push({
    fieldId: 'b1',
    questionNumber: 'B1',
    description: 'Total number of staff and volunteers',
    dataPath: 'safeguarding.totalStaffVolunteers',
    value: data.safeguarding.totalStaffVolunteers,
    formattedValue: data.safeguarding.totalStaffVolunteers.toString(),
    copyText: data.safeguarding.totalStaffVolunteers.toString()
  });

  mappings.push({
    fieldId: 'b2',
    questionNumber: 'B2',
    description: 'Number working with children',
    dataPath: 'safeguarding.workingWithChildren',
    value: data.safeguarding.workingWithChildren,
    formattedValue: data.safeguarding.workingWithChildren.toString(),
    copyText: data.safeguarding.workingWithChildren.toString()
  });

  mappings.push({
    fieldId: 'b3',
    questionNumber: 'B3',
    description: 'Number working with vulnerable adults',
    dataPath: 'safeguarding.workingWithVulnerableAdults',
    value: data.safeguarding.workingWithVulnerableAdults,
    formattedValue: data.safeguarding.workingWithVulnerableAdults.toString(),
    copyText: data.safeguarding.workingWithVulnerableAdults.toString()
  });

  mappings.push({
    fieldId: 'b4',
    questionNumber: 'B4',
    description: 'Number with valid DBS checks',
    dataPath: 'safeguarding.dbsChecksValid',
    value: data.safeguarding.dbsChecksValid,
    formattedValue: data.safeguarding.dbsChecksValid.toString(),
    copyText: data.safeguarding.dbsChecksValid.toString()
  });

  mappings.push({
    fieldId: 'b5',
    questionNumber: 'B5',
    description: 'Safeguarding training completed',
    dataPath: 'safeguarding.trainingCompletedCount',
    value: data.safeguarding.trainingCompletedCount,
    formattedValue: `${data.safeguarding.trainingCompletedCount} staff/volunteers`,
    copyText: data.safeguarding.trainingCompletedCount.toString()
  });

  // Section C: International Operations
  mappings.push({
    fieldId: 'c1',
    questionNumber: 'C1',
    description: 'Does the charity operate internationally?',
    dataPath: 'overseas.hasOverseasOperations',
    value: data.overseas.hasOverseasOperations,
    formattedValue: data.overseas.hasOverseasOperations ? 'Yes' : 'No',
    copyText: data.overseas.hasOverseasOperations ? 'Yes' : 'No'
  });

  if (data.overseas.hasOverseasOperations) {
    mappings.push({
      fieldId: 'c2',
      questionNumber: 'C2',
      description: 'Total overseas expenditure',
      dataPath: 'overseas.totalOverseasSpend',
      value: data.overseas.totalOverseasSpend,
      formattedValue: `£${data.overseas.totalOverseasSpend.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      copyText: data.overseas.totalOverseasSpend.toFixed(2)
    });

    mappings.push({
      fieldId: 'c3',
      questionNumber: 'C3',
      description: 'Countries of operation',
      dataPath: 'overseas.countriesOperatedIn',
      value: data.overseas.countriesOperatedIn,
      formattedValue: data.overseas.countriesOperatedIn.map(c => c.countryName).join(', '),
      copyText: data.overseas.countriesOperatedIn.map(c => c.countryName).join(', ')
    });

    // Add transfer methods breakdown
    const bankTransfers = data.overseas.transferMethods.find(t => t.method === 'bank_transfer');
    const otherTransfers = data.overseas.transferMethods.filter(t => t.method !== 'bank_transfer');
    
    mappings.push({
      fieldId: 'c4',
      questionNumber: 'C4',
      description: 'Bank transfers amount',
      dataPath: 'overseas.transferMethods',
      value: bankTransfers?.amount || 0,
      formattedValue: `£${(bankTransfers?.amount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      copyText: (bankTransfers?.amount || 0).toFixed(2)
    });

    if (otherTransfers.length > 0) {
      mappings.push({
        fieldId: 'c5',
        questionNumber: 'C5',
        description: 'Non-bank transfer methods used',
        dataPath: 'overseas.transferMethods',
        value: otherTransfers,
        formattedValue: otherTransfers.map(t => `${t.method}: £${t.amount.toFixed(2)}`).join('; '),
        copyText: otherTransfers.map(t => `${t.method}: £${t.amount.toFixed(2)}`).join('; ')
      });
    }

    mappings.push({
      fieldId: 'c6',
      questionNumber: 'C6',
      description: 'Number of overseas partners',
      dataPath: 'overseas.partnersTotal',
      value: data.overseas.partnersTotal,
      formattedValue: data.overseas.partnersTotal.toString(),
      copyText: data.overseas.partnersTotal.toString()
    });

    mappings.push({
      fieldId: 'c7',
      questionNumber: 'C7',
      description: 'Partners with verified registration',
      dataPath: 'overseas.partnersVerified',
      value: data.overseas.partnersVerified,
      formattedValue: `${data.overseas.partnersVerified} of ${data.overseas.partnersTotal}`,
      copyText: data.overseas.partnersVerified.toString()
    });
  }

  // Section D: Fundraising & Income
  mappings.push({
    fieldId: 'd1',
    questionNumber: 'D1',
    description: 'Total income for the year',
    dataPath: 'fundraising.totalIncome',
    value: data.fundraising.totalIncome,
    formattedValue: `£${data.fundraising.totalIncome.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    copyText: data.fundraising.totalIncome.toFixed(2)
  });

  // Income by source
  data.fundraising.incomeBySource.forEach((source, index) => {
    mappings.push({
      fieldId: `d2_${index}`,
      questionNumber: `D2.${index + 1}`,
      description: `Income from ${source.source}`,
      dataPath: `fundraising.incomeBySource[${index}]`,
      value: source.amount,
      formattedValue: `£${source.amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${source.percentage.toFixed(1)}%)`,
      copyText: source.amount.toFixed(2)
    });
  });

  if (data.fundraising.highestCorporateDonation) {
    mappings.push({
      fieldId: 'd3',
      questionNumber: 'D3',
      description: 'Highest donation from a company',
      dataPath: 'fundraising.highestCorporateDonation',
      value: data.fundraising.highestCorporateDonation,
      formattedValue: `£${data.fundraising.highestCorporateDonation.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      copyText: data.fundraising.highestCorporateDonation.toFixed(2)
    });
  }

  if (data.fundraising.highestIndividualDonation) {
    mappings.push({
      fieldId: 'd4',
      questionNumber: 'D4',
      description: 'Highest donation from an individual',
      dataPath: 'fundraising.highestIndividualDonation',
      value: data.fundraising.highestIndividualDonation,
      formattedValue: `£${data.fundraising.highestIndividualDonation.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      copyText: data.fundraising.highestIndividualDonation.toFixed(2)
    });
  }

  mappings.push({
    fieldId: 'd5',
    questionNumber: 'D5',
    description: 'Related party transactions',
    dataPath: 'fundraising.hasRelatedPartyTransactions',
    value: data.fundraising.hasRelatedPartyTransactions,
    formattedValue: data.fundraising.hasRelatedPartyTransactions ? `Yes - £${data.fundraising.relatedPartyAmount.toFixed(2)}` : 'No',
    copyText: data.fundraising.hasRelatedPartyTransactions ? 'Yes' : 'No'
  });

  if (data.fundraising.hasRelatedPartyTransactions) {
    mappings.push({
      fieldId: 'd6',
      questionNumber: 'D6',
      description: 'Total related party transactions',
      dataPath: 'fundraising.relatedPartyAmount',
      value: data.fundraising.relatedPartyAmount,
      formattedValue: `£${data.fundraising.relatedPartyAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      copyText: data.fundraising.relatedPartyAmount.toFixed(2)
    });
  }

  mappings.push({
    fieldId: 'd7',
    questionNumber: 'D7',
    description: 'Professional fundraiser used',
    dataPath: 'fundraising.usesProfessionalFundraiser',
    value: data.fundraising.usesProfessionalFundraiser,
    formattedValue: data.fundraising.usesProfessionalFundraiser ? 'Yes' : 'No',
    copyText: data.fundraising.usesProfessionalFundraiser ? 'Yes' : 'No'
  });

  return mappings;
}

// Get fields by section
export function getFieldsBySection(mappings: ARFieldMapping[], section: 'safeguarding' | 'overseas' | 'fundraising' | 'all') {
  if (section === 'all') return mappings;
  
  const sectionPrefixes = {
    safeguarding: 'b',
    overseas: 'c',
    fundraising: 'd'
  };
  
  const prefix = sectionPrefixes[section];
  return mappings.filter(m => m.fieldId.startsWith(prefix));
}

// Format value for display
export function formatFieldValue(value: any, fieldType: string): string {
  if (value === null || value === undefined) return 'Not provided';
  
  if (fieldType === 'currency') {
    return `£${Number(value).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  if (fieldType === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  return value.toString();
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// Export all fields as text for pasting into form
export function exportFieldsAsText(mappings: ARFieldMapping[]): string {
  return mappings
    .map(m => `${m.questionNumber}: ${m.copyText}`)
    .join('\n');
}