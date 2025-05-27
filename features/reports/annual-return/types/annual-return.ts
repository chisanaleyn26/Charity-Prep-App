// Annual Return types based on Charity Commission requirements
export interface AnnualReturnData {
  // Organization details
  organizationId: string;
  charityName: string;
  charityNumber: string;
  financialYearEnd: string;
  
  // Compliance data
  safeguarding: SafeguardingSection;
  overseas: OverseasSection;
  fundraising: FundraisingSection;
  
  // Metadata
  generatedAt: string;
  completeness: number;
  missingFields: MissingField[];
}

export interface SafeguardingSection {
  totalStaffVolunteers: number;
  workingWithChildren: number;
  workingWithVulnerableAdults: number;
  dbsChecksValid: number;
  dbsChecksExpired: number;
  policiesReviewedDate: string | null;
  trainingCompletedCount: number;
}

export interface OverseasSection {
  hasOverseasOperations: boolean;
  totalOverseasSpend: number;
  countriesOperatedIn: CountrySpend[];
  transferMethods: TransferMethodBreakdown[];
  partnersVerified: number;
  partnersTotal: number;
}

export interface CountrySpend {
  countryCode: string;
  countryName: string;
  totalSpend: number;
  activities: number;
  isHighRisk: boolean;
}

export interface TransferMethodBreakdown {
  method: string;
  amount: number;
  percentage: number;
  requiresExplanation: boolean;
}

export interface FundraisingSection {
  totalIncome: number;
  incomeBySource: IncomeSource[];
  highestCorporateDonation: number | null;
  highestIndividualDonation: number | null;
  hasRelatedPartyTransactions: boolean;
  relatedPartyAmount: number;
  fundraisingMethods: string[];
  usesProfessionalFundraiser: boolean;
}

export interface IncomeSource {
  source: string;
  amount: number;
  percentage: number;
}

export interface MissingField {
  section: 'safeguarding' | 'overseas' | 'fundraising';
  field: string;
  description: string;
  required: boolean;
  impact: 'high' | 'medium' | 'low';
}

// Field mapping for Annual Return form
export interface ARFieldMapping {
  fieldId: string;
  questionNumber: string;
  description: string;
  dataPath: string;
  value: any;
  formattedValue: string;
  copyText: string;
}

// Export formats
export type ExportFormat = 'csv' | 'json' | 'clipboard';

export interface ARGeneratorState {
  isLoading: boolean;
  isGenerating: boolean;
  data: AnnualReturnData | null;
  error: string | null;
  selectedSection: 'all' | 'safeguarding' | 'overseas' | 'fundraising';
  copiedFields: Set<string>;
}