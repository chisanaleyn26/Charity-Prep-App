'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trophy, TrendingUp, CheckCircle, Star } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { getEligibleCertificates, Certificate } from '../services/certificate-generator'
import { CertificateDisplay } from './certificate-display'
import { getComplianceScore } from '@/features/compliance/services/compliance-score'

export function CertificatesGallery() {
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [earnedCount, setEarnedCount] = useState(0)
  const organization = useAuthStore(state => state.organization)

  useEffect(() => {
    loadCertificates()
  }, [organization])

  async function loadCertificates() {
    if (!organization) return

    try {
      setLoading(true)
      
      // Get current compliance data
      const scoreData = await getComplianceScore(organization.id)
      
      // For demo purposes, let's simulate some data
      const complianceData = {
        currentScore: scoreData?.overall || 73,
        previousScore: 65, // Simulated previous score
        completionPercentage: scoreData?.overall || 73
      }
      
      // Get eligible certificates
      const eligibleCerts = getEligibleCertificates(
        organization.name,
        complianceData
      )
      
      setCertificates(eligibleCerts)
      setEarnedCount(eligibleCerts.length)
    } catch (error) {
      console.error('Error loading certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  const potentialCertificates = [
    {
      icon: Trophy,
      title: '80% Compliance',
      description: 'Achieve 80% or higher compliance score',
      earned: certificates.some(c => c.type === 'compliance-achievement')
    },
    {
      icon: CheckCircle,
      title: 'Annual Return Ready',
      description: 'Complete 95% of Annual Return requirements',
      earned: certificates.some(c => c.type === 'annual-return-ready')
    },
    {
      icon: Star,
      title: 'Perfect Compliance',
      description: 'Reach 100% compliance across all modules',
      earned: certificates.some(c => c.type === 'milestone-reached')
    },
    {
      icon: TrendingUp,
      title: 'Most Improved',
      description: 'Improve compliance score by 20% or more',
      earned: certificates.some(c => c.type === 'improvement-award')
    }
  ]

  return (
    <div className="space-y-6">
      {/* Achievement Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
          <CardDescription>
            You've earned {earnedCount} out of {potentialCertificates.length} possible certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {potentialCertificates.map((cert, index) => {
              const Icon = cert.icon
              return (
                <div
                  key={index}
                  className={`text-center p-4 rounded-lg border transition-colors ${
                    cert.earned 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-muted/50 border-muted-foreground/20'
                  }`}
                >
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${
                    cert.earned ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div className="font-medium text-sm">{cert.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {cert.description}
                  </div>
                  {cert.earned && (
                    <div className="text-xs text-primary mt-2">✓ Earned</div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Earned Certificates */}
      {certificates.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Certificates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((certificate) => (
              <CertificateDisplay
                key={certificate.id}
                certificate={certificate}
              />
            ))}
          </div>
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>
                Keep improving your compliance score to earn certificates! 
                You're close to earning your first achievement.
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Tips for Earning More */}
      <Card>
        <CardHeader>
          <CardTitle>How to Earn More Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="text-sm">
                <strong>Improve Compliance Score:</strong> Add missing DBS records, 
                document overseas activities, and track all income sources.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="text-sm">
                <strong>Complete Annual Return:</strong> Fill in all required fields 
                to earn the "Annual Return Ready" certificate.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="text-sm">
                <strong>Maintain Consistency:</strong> Regular updates and timely 
                renewals help achieve perfect compliance.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="text-sm">
                <strong>Show Improvement:</strong> Track your progress month-over-month 
                to earn improvement awards.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}