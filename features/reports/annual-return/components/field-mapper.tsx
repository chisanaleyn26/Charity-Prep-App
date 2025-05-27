'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { Copy, Check, AlertCircle, FileText } from 'lucide-react'
import { toast } from 'sonner'
import type { AnnualReturnData } from '../types/annual-return'

// Field mapping for Annual Return form
const ANNUAL_RETURN_FIELD_MAPPING = {
  'charity-name': 'organizationName',
  'charity-number': 'charityNumber',
  'financial-year-end': 'financialYearEnd',
  'total-income': 'totalIncome',
  'total-expenditure': 'totalExpenditure',
  'staff-volunteers': 'totalStaffVolunteers',
  'overseas-spend': 'totalOverseasSpend',
  'placeholder': 'placeholder'
}

interface FieldMapperProps {
  data: AnnualReturnData
  financialYear: number
}

interface FieldGroup {
  title: string
  description: string
  fields: Array<{
    id: string
    label: string
    value: any
    type: 'text' | 'number' | 'currency' | 'boolean' | 'array'
    required: boolean
    helpText?: string
  }>
}

export function FieldMapper({ data, financialYear }: FieldMapperProps) {
  const [copiedFields, setCopiedFields] = useState<Set<string>>(new Set())

  const copyToClipboard = async (fieldId: string, value: any) => {
    try {
      await navigator.clipboard.writeText(String(value))
      setCopiedFields(prev => new Set([...prev, fieldId]))
      toast.success('Copied to clipboard')
      setTimeout(() => {
        setCopiedFields(prev => {
          const next = new Set(prev)
          next.delete(fieldId)
          return next
        })
      }, 2000)
    } catch (error) {
      toast.error('Failed to copy - please try again')
    }
  }

  const getValue = (path: string): any => {
    if (path === 'placeholder') return null
    
    const parts = path.split('.')
    let value: any = data
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part as keyof typeof value]
      } else {
        return null
      }
    }
    
    return value
  }

  const formatValue = (value: any, type: string): string => {
    if (value === null || value === undefined) return 'Not provided'
    
    switch (type) {
      case 'currency':
        return formatCurrency(Number(value))
      case 'boolean':
        return value ? 'Yes' : 'No'
      case 'array':
        return Array.isArray(value) ? value.join(', ') : String(value)
      default:
        return String(value)
    }
  }

  const fieldGroups: FieldGroup[] = [
    {
      title: 'Part A - Charity Information',
      description: 'Basic information about your charity',
      fields: [
        { id: 'A1_CharityName', label: 'Charity Name', value: getValue('organization.name'), type: 'text', required: true },
        { id: 'A2_CharityNumber', label: 'Registered Charity Number', value: getValue('organization.charity_number'), type: 'text', required: true },
        { id: 'A3_CharityType', label: 'Charity Type', value: getValue('organization.charity_type'), type: 'text', required: true },
        { id: 'A4_FinancialYearEnd', label: 'Financial Year End', value: getValue('organization.financial_year_end'), type: 'text', required: true },
      ]
    },
    {
      title: 'Part B - Income',
      description: 'Income received during the financial year',
      fields: [
        { id: 'B1_TotalIncome', label: 'Total Income', value: getValue('income.totalIncome'), type: 'currency', required: true },
        { id: 'B2_DonationsLegacies', label: 'Donations and Legacies', value: getValue('income.breakdown.donations_legacies'), type: 'currency', required: true },
        { id: 'B3_CharitableActivities', label: 'Charitable Activities', value: getValue('income.breakdown.charitable_activities'), type: 'currency', required: true },
        { id: 'B4_OtherTrading', label: 'Other Trading Activities', value: getValue('income.breakdown.other_trading'), type: 'currency', required: true },
        { id: 'B5_Investments', label: 'Investments', value: getValue('income.breakdown.investments'), type: 'currency', required: true },
        { id: 'B6_Other', label: 'Other Income', value: getValue('income.breakdown.other'), type: 'currency', required: true },
      ]
    },
    {
      title: 'Part D - Overseas Activities',
      description: 'International operations and spending',
      fields: [
        { id: 'D1_OverseasSpend', label: 'Total Overseas Expenditure', value: getValue('overseas.totalSpend'), type: 'currency', required: false },
        { id: 'D2_CountriesCount', label: 'Number of Countries', value: getValue('overseas.countries.length'), type: 'number', required: false },
        { id: 'D3_CountriesList', label: 'Countries of Operation', value: getValue('overseas.countries'), type: 'array', required: false },
      ]
    },
    {
      title: 'Part E - Fundraising',
      description: 'Fundraising activities and methods',
      fields: [
        { id: 'E1_FundraisingMethods', label: 'Fundraising Methods Used', value: getValue('fundraising.methodsUsed'), type: 'array', required: true },
        { id: 'E2_ProfessionalFundraiser', label: 'Used Professional Fundraiser', value: getValue('fundraising.usesProfessionalFundraiser'), type: 'boolean', required: true },
      ]
    },
    {
      title: 'Part G - Related Party Transactions',
      description: 'Trustee benefits and related party dealings',
      fields: [
        { id: 'G2_RelatedPartyTransactions', label: 'Had Related Party Transactions', value: getValue('income.hasRelatedPartyTransactions'), type: 'boolean', required: true },
      ]
    },
    {
      title: 'Part H - Safeguarding',
      description: 'Working with children and vulnerable adults',
      fields: [
        { id: 'H1_WorkingWithChildren', label: 'Number Working with Children', value: getValue('safeguarding.workingWithChildren'), type: 'number', required: false },
        { id: 'H2_SafeguardingPolicy', label: 'Has Safeguarding Policy', value: data.safeguarding.policiesReviewedDate !== null, type: 'boolean', required: false },
      ]
    },
    {
      title: 'Additional Information',
      description: 'Supplementary data for the Annual Return',
      fields: [
        { id: 'HighestCorporateDonation', label: 'Highest Corporate Donation', value: getValue('income.highestCorporateDonation'), type: 'currency', required: false },
        { id: 'HighestIndividualDonation', label: 'Highest Individual Donation', value: getValue('income.highestIndividualDonation'), type: 'currency', required: false },
        { id: 'StaffVolunteersCount', label: 'Total Staff and Volunteers', value: getValue('safeguarding.totalStaffVolunteers'), type: 'number', required: false },
      ]
    }
  ]

  const missingRequiredFields = fieldGroups.flatMap(group =>
    group.fields
      .filter(field => field.required && (field.value === null || field.value === undefined))
      .map(field => field.label)
  )

  return (
    <div className="space-y-6">
      {missingRequiredFields.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Missing Required Information
            </CardTitle>
            <CardDescription>
              The following required fields are missing data:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {missingRequiredFields.map(field => (
                <Badge key={field} variant="outline" className="bg-white">
                  {field}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {fieldGroups.map((group, groupIndex) => (
          <Card key={groupIndex}>
            <CardHeader>
              <CardTitle className="text-xl">{group.title}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.fields.map((field, fieldIndex) => {
                const isPlaceholder = ANNUAL_RETURN_FIELD_MAPPING[field.id as keyof typeof ANNUAL_RETURN_FIELD_MAPPING] === 'placeholder'
                const isMissing = field.value === null || field.value === undefined
                
                return (
                  <div key={field.id}>
                    {fieldIndex > 0 && <Separator className="mb-4" />}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">
                            {field.label}
                          </label>
                          {field.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Field ID: {field.id}
                        </div>
                        {field.helpText && (
                          <p className="text-xs text-muted-foreground">{field.helpText}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-right ${isMissing || isPlaceholder ? 'text-muted-foreground' : ''}`}>
                          {isPlaceholder ? (
                            <span className="text-sm italic">Not tracked</span>
                          ) : (
                            <span className="font-mono text-sm">
                              {formatValue(field.value, field.type)}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(field.id, field.value)}
                          disabled={isMissing || isPlaceholder}
                          className="h-8 w-8 p-0"
                        >
                          {copiedFields.has(field.id) ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}