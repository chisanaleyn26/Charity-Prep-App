'use client'

import { useState } from 'react'
import { SmartSearch } from '@/features/ai/components/smart-search'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Sparkles,
  User,
  DollarSign,
  Globe,
  Calendar,
  ExternalLink,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react'
import type { SearchResult } from '@/features/ai/services/search-executor'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function SearchPage() {
  const router = useRouter()
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)

  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result)
  }

  const navigateToRecord = () => {
    if (!selectedResult) return

    switch (selectedResult.type) {
      case 'safeguarding':
        router.push(`/safeguarding/${selectedResult.id}`)
        break
      case 'income':
        router.push(`/fundraising/${selectedResult.id}`)
        break
      case 'overseas':
        router.push(`/overseas/${selectedResult.id}`)
        break
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Smart Search
        </h1>
        <p className="text-muted-foreground mt-1">
          Search across all your compliance data using natural language
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Column */}
        <div className="lg:col-span-2">
          <SmartSearch
            onResultClick={handleResultClick}
            autoFocus
          />
        </div>

        {/* Details Column */}
        <div className="lg:col-span-1">
          {selectedResult ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedResult.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {selectedResult.description}
                    </CardDescription>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={navigateToRecord}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="metadata">Raw Data</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    {selectedResult.type === 'safeguarding' && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Person</p>
                          <p className="text-sm">{selectedResult.metadata.person_name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Role</p>
                          <p className="text-sm">{selectedResult.metadata.role || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">DBS Certificate</p>
                          <p className="text-sm font-mono">
                            {selectedResult.metadata.dbs_certificate_number || 'Pending'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                          <p className="text-sm">{formatDate(selectedResult.metadata.issue_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Check Type</p>
                          <Badge variant="secondary">
                            {selectedResult.metadata.check_type || 'Standard'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Works with Children</p>
                            {selectedResult.metadata.works_with_children ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Vulnerable Adults</p>
                            {selectedResult.metadata.works_with_vulnerable_adults ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedResult.type === 'income' && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Donor</p>
                          <p className="text-sm">{selectedResult.metadata.donor_name || 'Anonymous'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Amount</p>
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(selectedResult.metadata.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Date Received</p>
                          <p className="text-sm">{formatDate(selectedResult.metadata.date_received)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Source Type</p>
                          <Badge>{selectedResult.metadata.source_type}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Reference</p>
                          <p className="text-sm font-mono">
                            {selectedResult.metadata.reference || 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Gift Aid</p>
                            {selectedResult.metadata.gift_aid_eligible ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Restricted</p>
                            {selectedResult.metadata.restricted_funds ? (
                              <CheckCircle className="h-4 w-4 text-amber-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedResult.type === 'overseas' && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Recipient</p>
                          <p className="text-sm">{selectedResult.metadata.recipient_name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Amount (GBP)</p>
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(selectedResult.metadata.amount_gbp)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Country</p>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span className="text-sm">
                              {selectedResult.metadata.country_name || selectedResult.metadata.country_code}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Transfer Date</p>
                          <p className="text-sm">{formatDate(selectedResult.metadata.transfer_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Activity Type</p>
                          <Badge>{selectedResult.metadata.activity_type}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Purpose</p>
                          <p className="text-sm">{selectedResult.metadata.purpose}</p>
                        </div>
                        {selectedResult.metadata.beneficiaries_count && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Beneficiaries</p>
                            <p className="text-sm">
                              {selectedResult.metadata.beneficiaries_count.toLocaleString()} people
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="metadata">
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-96">
                      {JSON.stringify(selectedResult.metadata, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a search result to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}