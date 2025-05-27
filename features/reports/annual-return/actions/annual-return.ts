'use server'

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { AnnualReturnData, MissingField, CountrySpend, TransferMethodBreakdown, IncomeSource } from '../types/annual-return';

export async function generateAnnualReturnData(): Promise<{ success: boolean; data?: AnnualReturnData; error?: string }> {
  try {
    const supabase = createServerClient();
    
    // Get current user and organization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get organization details
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', user.user_metadata.organization_id)
      .single();

    if (!org) {
      return { success: false, error: 'Organization not found' };
    }

    const currentYear = new Date(org.financial_year_end).getFullYear();

    // Fetch all compliance data in parallel
    const [
      safeguardingData,
      overseasData,
      partnersData,
      incomeData,
      countriesData
    ] = await Promise.all([
      // Safeguarding records
      supabase
        .from('safeguarding_records')
        .select('*')
        .eq('organization_id', org.id)
        .is('deleted_at', null),
      
      // Overseas activities
      supabase
        .from('overseas_activities')
        .select('*')
        .eq('organization_id', org.id)
        .eq('financial_year', currentYear)
        .is('deleted_at', null),
      
      // Overseas partners
      supabase
        .from('overseas_partners')
        .select('*')
        .eq('organization_id', org.id)
        .is('deleted_at', null),
      
      // Income records
      supabase
        .from('income_records')
        .select('*')
        .eq('organization_id', org.id)
        .eq('financial_year', currentYear)
        .is('deleted_at', null),
      
      // Countries reference
      supabase
        .from('countries')
        .select('*')
    ]);

    // Process safeguarding data
    const safeguardingRecords = safeguardingData.data || [];
    const now = new Date();
    const validDBS = safeguardingRecords.filter(r => new Date(r.expiry_date) > now);
    const expiredDBS = safeguardingRecords.filter(r => new Date(r.expiry_date) <= now);
    const workingWithChildren = safeguardingRecords.filter(r => r.works_with_children);
    const workingWithVulnerable = safeguardingRecords.filter(r => r.works_with_vulnerable_adults);
    const trainingCompleted = safeguardingRecords.filter(r => r.training_completed);

    // Process overseas data
    const overseasActivities = overseasData.data || [];
    const partners = partnersData.data || [];
    const countries = countriesData.data || [];
    
    const countrySpendMap = new Map<string, CountrySpend>();
    const transferMethodMap = new Map<string, number>();
    
    overseasActivities.forEach(activity => {
      // Group by country
      const country = countries.find(c => c.code === activity.country_code);
      if (!countrySpendMap.has(activity.country_code)) {
        countrySpendMap.set(activity.country_code, {
          countryCode: activity.country_code,
          countryName: country?.name || activity.country_code,
          totalSpend: 0,
          activities: 0,
          isHighRisk: country?.is_high_risk || false
        });
      }
      
      const countryData = countrySpendMap.get(activity.country_code)!;
      countryData.totalSpend += Number(activity.amount_gbp);
      countryData.activities += 1;
      
      // Group by transfer method
      const currentAmount = transferMethodMap.get(activity.transfer_method) || 0;
      transferMethodMap.set(activity.transfer_method, currentAmount + Number(activity.amount_gbp));
    });

    const totalOverseasSpend = Array.from(countrySpendMap.values()).reduce((sum, c) => sum + c.totalSpend, 0);
    
    const transferMethods: TransferMethodBreakdown[] = Array.from(transferMethodMap.entries()).map(([method, amount]) => ({
      method,
      amount,
      percentage: totalOverseasSpend > 0 ? (amount / totalOverseasSpend) * 100 : 0,
      requiresExplanation: !['bank_transfer', 'wire_transfer'].includes(method)
    }));

    // Process income data
    const incomeRecords = incomeData.data || [];
    const incomeBySourceMap = new Map<string, number>();
    let highestCorporate = 0;
    let highestIndividual = 0;
    let relatedPartyTotal = 0;
    
    incomeRecords.forEach(record => {
      const currentAmount = incomeBySourceMap.get(record.source) || 0;
      incomeBySourceMap.set(record.source, currentAmount + Number(record.amount));
      
      if (record.donor_type === 'corporate' && Number(record.amount) > highestCorporate) {
        highestCorporate = Number(record.amount);
      }
      if (record.donor_type === 'individual' && Number(record.amount) > highestIndividual) {
        highestIndividual = Number(record.amount);
      }
      if (record.is_related_party) {
        relatedPartyTotal += Number(record.amount);
      }
    });

    const totalIncome = Array.from(incomeBySourceMap.values()).reduce((sum, amount) => sum + amount, 0);
    
    const incomeSources: IncomeSource[] = Array.from(incomeBySourceMap.entries()).map(([source, amount]) => ({
      source,
      amount,
      percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0
    }));

    // Check for missing fields
    const missingFields: MissingField[] = [];
    
    if (safeguardingRecords.length === 0) {
      missingFields.push({
        section: 'safeguarding',
        field: 'dbs_records',
        description: 'No DBS records found',
        required: true,
        impact: 'high'
      });
    }

    if (overseasActivities.length > 0 && partners.filter(p => p.is_active).length === 0) {
      missingFields.push({
        section: 'overseas',
        field: 'partners',
        description: 'Overseas activities recorded but no partner organizations',
        required: false,
        impact: 'medium'
      });
    }

    if (incomeRecords.length === 0) {
      missingFields.push({
        section: 'fundraising',
        field: 'income',
        description: 'No income records for the financial year',
        required: true,
        impact: 'high'
      });
    }

    // Calculate completeness
    const totalFields = 15; // Approximate number of required fields
    const completedFields = totalFields - missingFields.filter(f => f.required).length;
    const completeness = Math.round((completedFields / totalFields) * 100);

    const annualReturnData: AnnualReturnData = {
      organizationId: org.id,
      charityName: org.name,
      charityNumber: org.charity_number,
      financialYearEnd: org.financial_year_end,
      safeguarding: {
        totalStaffVolunteers: safeguardingRecords.length,
        workingWithChildren: workingWithChildren.length,
        workingWithVulnerableAdults: workingWithVulnerable.length,
        dbsChecksValid: validDBS.length,
        dbsChecksExpired: expiredDBS.length,
        policiesReviewedDate: null, // Would come from policies table
        trainingCompletedCount: trainingCompleted.length
      },
      overseas: {
        hasOverseasOperations: overseasActivities.length > 0,
        totalOverseasSpend: totalOverseasSpend,
        countriesOperatedIn: Array.from(countrySpendMap.values()).sort((a, b) => b.totalSpend - a.totalSpend),
        transferMethods: transferMethods.sort((a, b) => b.amount - a.amount),
        partnersVerified: partners.filter(p => p.registration_verified && p.is_active).length,
        partnersTotal: partners.filter(p => p.is_active).length
      },
      fundraising: {
        totalIncome,
        incomeBySource: incomeSources.sort((a, b) => b.amount - a.amount),
        highestCorporateDonation: highestCorporate || null,
        highestIndividualDonation: highestIndividual || null,
        hasRelatedPartyTransactions: relatedPartyTotal > 0,
        relatedPartyAmount: relatedPartyTotal,
        fundraisingMethods: [], // Would come from fundraising_methods table
        usesProfessionalFundraiser: false // Would come from fundraising_methods table
      },
      generatedAt: new Date().toISOString(),
      completeness,
      missingFields
    };

    // Revalidate the annual return page
    revalidatePath('/reports/annual-return');

    return { success: true, data: annualReturnData };
  } catch (error) {
    console.error('Failed to generate annual return data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate annual return data' 
    };
  }
}

export async function exportAnnualReturnData(format: 'csv' | 'json') {
  const result = await generateAnnualReturnData();
  
  if (!result.success || !result.data) {
    return { success: false, error: result.error };
  }

  const data = result.data;

  if (format === 'json') {
    return {
      success: true,
      data: JSON.stringify(data, null, 2),
      filename: `annual-return-${data.charityNumber}-${new Date().toISOString().split('T')[0]}.json`,
      mimeType: 'application/json'
    };
  }

  if (format === 'csv') {
    // Create CSV format matching Charity Commission requirements
    const csvRows = [
      ['Charity Annual Return Data Export'],
      ['Generated:', new Date().toISOString()],
      [''],
      ['Organization Details'],
      ['Charity Name:', data.charityName],
      ['Charity Number:', data.charityNumber],
      ['Financial Year End:', data.financialYearEnd],
      [''],
      ['Safeguarding'],
      ['Total Staff/Volunteers:', data.safeguarding.totalStaffVolunteers],
      ['Working with Children:', data.safeguarding.workingWithChildren],
      ['Working with Vulnerable Adults:', data.safeguarding.workingWithVulnerableAdults],
      ['Valid DBS Checks:', data.safeguarding.dbsChecksValid],
      ['Expired DBS Checks:', data.safeguarding.dbsChecksExpired],
      ['Training Completed:', data.safeguarding.trainingCompletedCount],
      [''],
      ['International Operations'],
      ['Has Overseas Operations:', data.overseas.hasOverseasOperations ? 'Yes' : 'No'],
      ['Total Overseas Spend:', `£${data.overseas.totalOverseasSpend.toFixed(2)}`],
      ['Number of Countries:', data.overseas.countriesOperatedIn.length],
      ['Partners Verified:', `${data.overseas.partnersVerified} of ${data.overseas.partnersTotal}`],
      [''],
      ['Countries:'],
      ...data.overseas.countriesOperatedIn.map(c => 
        [c.countryName, `£${c.totalSpend.toFixed(2)}`, `${c.activities} activities`, c.isHighRisk ? 'HIGH RISK' : '']
      ),
      [''],
      ['Transfer Methods:'],
      ...data.overseas.transferMethods.map(t => 
        [t.method, `£${t.amount.toFixed(2)}`, `${t.percentage.toFixed(1)}%`, t.requiresExplanation ? 'REQUIRES EXPLANATION' : '']
      ),
      [''],
      ['Fundraising & Income'],
      ['Total Income:', `£${data.fundraising.totalIncome.toFixed(2)}`],
      ['Highest Corporate Donation:', data.fundraising.highestCorporateDonation ? `£${data.fundraising.highestCorporateDonation.toFixed(2)}` : 'None'],
      ['Highest Individual Donation:', data.fundraising.highestIndividualDonation ? `£${data.fundraising.highestIndividualDonation.toFixed(2)}` : 'None'],
      ['Has Related Party Transactions:', data.fundraising.hasRelatedPartyTransactions ? 'Yes' : 'No'],
      ['Related Party Amount:', `£${data.fundraising.relatedPartyAmount.toFixed(2)}`],
      [''],
      ['Income by Source:'],
      ...data.fundraising.incomeBySource.map(s => 
        [s.source, `£${s.amount.toFixed(2)}`, `${s.percentage.toFixed(1)}%`]
      )
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');

    return {
      success: true,
      data: csvContent,
      filename: `annual-return-${data.charityNumber}-${new Date().toISOString().split('T')[0]}.csv`,
      mimeType: 'text/csv'
    };
  }

  return { success: false, error: 'Invalid format' };
}