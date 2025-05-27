'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EtherealCard, EtherealCardContent, EtherealCardHeader, EtherealCardTitle, EtherealCardDescription } from '@/components/custom-ui/ethereal-card'
import { EtherealButton } from '@/components/custom-ui/ethereal-button'
import { EtherealInput } from '@/components/custom-ui/ethereal-input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Mail, Phone, Globe, Calendar, ArrowRight } from 'lucide-react'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { FormErrorBoundary } from '@/components/common/error-boundary'

// Check for dev mode
const isDevMode = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_AUTO_LOGIN === 'true'

export default function OnboardingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  useEffect(() => {
    // Skip onboarding in dev mode
    if (isDevMode) {
      router.push('/dashboard')
    }
  }, [router])
  
  const [formData, setFormData] = useState({
    name: '',
    charity_number: '',
    income_band: '',
    financial_year_end: '',
    primary_email: '',
    phone: '',
    website: '',
    address_line1: '',
    city: '',
    postcode: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { createOrganization } = await import('@/lib/api/organizations')
      const result = await createOrganization(formData)

      if ('error' in result) {
        setError(result.error)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Failed to create organization. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#243837] mb-2">Welcome to Charity Prep!</h1>
          <p className="text-lg text-[#616161]">Let&apos;s set up your charity&apos;s account</p>
        </div>

        <EtherealCard variant="elevated">
          <EtherealCardHeader>
            <EtherealCardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-[#B1FA63]" />
              Organization Details
            </EtherealCardTitle>
            <EtherealCardDescription>
              We need some basic information about your charity to get started
            </EtherealCardDescription>
          </EtherealCardHeader>

          <EtherealCardContent>
            <FormErrorBoundary onError={(error) => console.error('Onboarding form error:', error)}>
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#243837]">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Charity Name *</Label>
                    <EtherealInput
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="St. Mary's Trust"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="charity_number">Charity Number</Label>
                    <EtherealInput
                      id="charity_number"
                      value={formData.charity_number}
                      onChange={(e) => setFormData({ ...formData, charity_number: e.target.value })}
                      placeholder="1234567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="income_band">Annual Income Band *</Label>
                    <Select 
                      value={formData.income_band} 
                      onValueChange={(value) => setFormData({ ...formData, income_band: value })}
                      required
                    >
                      <SelectTrigger id="income_band">
                        <SelectValue placeholder="Select income band" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Under £100,000</SelectItem>
                        <SelectItem value="medium">£100,000 - £1 million</SelectItem>
                        <SelectItem value="large">Over £1 million</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="financial_year_end">Financial Year End *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#616161]" />
                      <EtherealInput
                        id="financial_year_end"
                        value={formData.financial_year_end}
                        onChange={(e) => setFormData({ ...formData, financial_year_end: e.target.value })}
                        placeholder="31-03"
                        pattern="^\d{2}-\d{2}$"
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-[#616161] mt-1">Format: DD-MM (e.g., 31-03 for March 31st)</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#243837]">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary_email">Primary Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#616161]" />
                      <EtherealInput
                        id="primary_email"
                        type="email"
                        value={formData.primary_email}
                        onChange={(e) => setFormData({ ...formData, primary_email: e.target.value })}
                        placeholder="info@charity.org"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#616161]" />
                      <EtherealInput
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="020 1234 5678"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#616161]" />
                    <EtherealInput
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://www.charity.org"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#243837]">Address</h3>
                
                <EtherealInput
                  id="address_line1"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  placeholder="Street address"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EtherealInput
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />

                  <EtherealInput
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    placeholder="Postcode"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <EtherealButton
                type="submit"
                size="lg"
                variant="primary"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" variant="dark" />
                    Creating your organization...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </EtherealButton>
            </form>
            </FormErrorBoundary>
          </EtherealCardContent>
        </EtherealCard>
      </div>
    </div>
  )
}