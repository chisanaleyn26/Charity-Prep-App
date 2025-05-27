'use client'

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { AnnualReturnData } from '../types/annual-return';

interface ARPreviewProps {
  data: AnnualReturnData;
  highlightedFields?: string[];
  section: 'all' | 'safeguarding' | 'overseas' | 'fundraising';
}

export function ARPreview({ data, highlightedFields = [], section }: ARPreviewProps) {
  const isFieldHighlighted = (fieldId: string) => {
    if (highlightedFields.length === 0) return false;
    return highlightedFields.includes(fieldId);
  };

  const FieldRow = ({ 
    fieldId, 
    label, 
    value, 
    required = false 
  }: { 
    fieldId: string; 
    label: string; 
    value: React.ReactNode; 
    required?: boolean;
  }) => (
    <div 
      className={cn(
        "p-4 rounded-lg border transition-colors",
        isFieldHighlighted(fieldId) 
          ? "border-primary bg-primary/5" 
          : "border-border bg-muted/30"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-muted-foreground">
              {fieldId.toUpperCase()}
            </span>
            {required && <Badge variant="outline" className="text-xs">Required</Badge>}
          </div>
          <p className="text-sm">{label}</p>
        </div>
        <div className="text-right">
          <div className="font-medium">{value || '-'}</div>
        </div>
      </div>
    </div>
  );

  const showSection = (sectionName: string) => {
    return section === 'all' || section === sectionName;
  };

  return (
    <div className="space-y-6">
      {/* Form header */}
      <div className="text-center space-y-2 p-6 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold">Charity Commission Annual Return</h3>
        <p className="text-sm text-muted-foreground">Financial Year Ending: {new Date(data.financialYearEnd).toLocaleDateString('en-GB')}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="secondary">{data.charityName}</Badge>
          <Badge variant="outline">{data.charityNumber}</Badge>
        </div>
      </div>

      {/* Section B: Safeguarding */}
      {showSection('safeguarding') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold">
              B
            </div>
            <h4 className="font-semibold">Safeguarding</h4>
          </div>
          
          <div className="space-y-3">
            <FieldRow
              fieldId="b1"
              label="Total number of staff and volunteers"
              value={data.safeguarding.totalStaffVolunteers}
              required
            />
            <FieldRow
              fieldId="b2"
              label="Number working with children"
              value={data.safeguarding.workingWithChildren}
            />
            <FieldRow
              fieldId="b3"
              label="Number working with vulnerable adults"
              value={data.safeguarding.workingWithVulnerableAdults}
            />
            <FieldRow
              fieldId="b4"
              label="Number with valid DBS checks"
              value={data.safeguarding.dbsChecksValid}
              required
            />
            {data.safeguarding.dbsChecksExpired > 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  ⚠️ {data.safeguarding.dbsChecksExpired} DBS checks have expired
                </p>
              </div>
            )}
            <FieldRow
              fieldId="b5"
              label="Safeguarding training completed"
              value={`${data.safeguarding.trainingCompletedCount} staff/volunteers`}
            />
          </div>
        </div>
      )}

      {showSection('safeguarding') && showSection('overseas') && <Separator />}

      {/* Section C: International Operations */}
      {showSection('overseas') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold">
              C
            </div>
            <h4 className="font-semibold">International Operations</h4>
          </div>
          
          <div className="space-y-3">
            <FieldRow
              fieldId="c1"
              label="Does the charity operate internationally?"
              value={data.overseas.hasOverseasOperations ? 'Yes' : 'No'}
              required
            />
            
            {data.overseas.hasOverseasOperations && (
              <>
                <FieldRow
                  fieldId="c2"
                  label="Total overseas expenditure"
                  value={`£${data.overseas.totalOverseasSpend.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}
                  required
                />
                
                <FieldRow
                  fieldId="c3"
                  label="Countries of operation"
                  value={
                    <div className="space-y-1">
                      {data.overseas.countriesOperatedIn.slice(0, 3).map((country, idx) => (
                        <div key={idx} className="text-sm">
                          {country.countryName}: £{country.totalSpend.toLocaleString()}
                          {country.isHighRisk && (
                            <Badge variant="destructive" className="ml-2 text-xs">High Risk</Badge>
                          )}
                        </div>
                      ))}
                      {data.overseas.countriesOperatedIn.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{data.overseas.countriesOperatedIn.length - 3} more countries
                        </p>
                      )}
                    </div>
                  }
                />

                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium">Transfer Methods</p>
                  {data.overseas.transferMethods.map((method, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="capitalize">{method.method.replace('_', ' ')}</span>
                      <span>
                        £{method.amount.toLocaleString()} ({method.percentage.toFixed(1)}%)
                        {method.requiresExplanation && (
                          <Badge variant="outline" className="ml-2 text-xs">Explain</Badge>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <FieldRow
                  fieldId="c6"
                  label="Number of overseas partners"
                  value={data.overseas.partnersTotal}
                />
                
                <FieldRow
                  fieldId="c7"
                  label="Partners with verified registration"
                  value={`${data.overseas.partnersVerified} of ${data.overseas.partnersTotal}`}
                />
              </>
            )}
          </div>
        </div>
      )}

      {(showSection('overseas') || showSection('safeguarding')) && showSection('fundraising') && <Separator />}

      {/* Section D: Fundraising & Income */}
      {showSection('fundraising') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold">
              D
            </div>
            <h4 className="font-semibold">Fundraising & Income</h4>
          </div>
          
          <div className="space-y-3">
            <FieldRow
              fieldId="d1"
              label="Total income for the year"
              value={`£${data.fundraising.totalIncome.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}
              required
            />

            <div className="p-3 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">Income Breakdown</p>
              {data.fundraising.incomeBySource.map((source, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="capitalize">{source.source.replace('_', ' ')}</span>
                  <span>
                    £{source.amount.toLocaleString()} ({source.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>

            {data.fundraising.highestCorporateDonation && (
              <FieldRow
                fieldId="d3"
                label="Highest donation from a company"
                value={`£${data.fundraising.highestCorporateDonation.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}
              />
            )}

            {data.fundraising.highestIndividualDonation && (
              <FieldRow
                fieldId="d4"
                label="Highest donation from an individual"
                value={`£${data.fundraising.highestIndividualDonation.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}
              />
            )}

            <FieldRow
              fieldId="d5"
              label="Related party transactions"
              value={
                data.fundraising.hasRelatedPartyTransactions 
                  ? `Yes - £${data.fundraising.relatedPartyAmount.toLocaleString()}`
                  : 'No'
              }
              required
            />

            <FieldRow
              fieldId="d7"
              label="Professional fundraiser used"
              value={data.fundraising.usesProfessionalFundraiser ? 'Yes' : 'No'}
            />
          </div>
        </div>
      )}

      {/* Form footer */}
      <div className="text-center p-4 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground">
          This is a preview of how your data maps to the official Annual Return form.
          Copy individual values to paste into the Charity Commission portal.
        </p>
      </div>
    </div>
  );
}