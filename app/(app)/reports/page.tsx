import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Sparkles, Download, Award, Package, ChevronRight } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Report cards data
const reportTypes = [
  {
    title: 'Annual Return',
    description: 'Generate and export your charity data for the Charity Commission Annual Return',
    href: '/reports/annual-return',
    icon: FileText,
    status: 'required',
    statusColor: 'text-amber-600 bg-amber-50',
    features: ['Auto-fill from your data', 'Compliance checks', 'PDF export']
  },
  {
    title: 'Board Pack',
    description: 'Create comprehensive board meeting reports with AI-powered insights',
    href: '/reports/board-pack',
    icon: Package,
    status: 'optional',
    statusColor: 'text-blue-600 bg-blue-50',
    features: ['Executive summary', 'Risk analysis', 'Financial overview']
  },
  {
    title: 'AI Reports',
    description: 'Generate custom reports with AI assistance for any compliance need',
    href: '/reports/ai',
    icon: Sparkles,
    status: 'beta',
    statusColor: 'text-purple-600 bg-purple-50',
    features: ['Natural language queries', 'Custom templates', 'Smart insights']
  },
  {
    title: 'Certificates',
    description: 'Generate compliance certificates and attestations for stakeholders',
    href: '/reports/certificates',
    icon: Award,
    status: 'new',
    statusColor: 'text-green-600 bg-green-50',
    features: ['Digital signatures', 'QR verification', 'Bulk generation']
  },
  {
    title: 'Export Data',
    description: 'Export all your compliance data in various formats for analysis',
    href: '/reports/export',
    icon: Download,
    status: 'available',
    statusColor: 'text-gray-600 bg-gray-50',
    features: ['CSV, Excel, PDF', 'Scheduled exports', 'Custom fields']
  }
]

// Server Component for fetching user data
async function ReportsContent() {
  // Check for dev mode
  const isDevMode = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_AUTO_LOGIN === 'true'
  
  if (!isDevMode) {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      redirect('/login')
    }
  }

  // TODO: Fetch compliance score once the materialized view is properly typed
  // For now, use a placeholder value
  const overallScore = 75

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#B1FA63]/30 hover:shadow-md transition-all duration-300 group">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-gray-900 leading-none tracking-tight">{Math.round(overallScore)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#B1FA63]/30 hover:shadow-md transition-all duration-300 group">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">Reports Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-gray-900 leading-none tracking-tight">12</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#B1FA63]/30 hover:shadow-md transition-all duration-300 group">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">Next Annual Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-gray-900 leading-none tracking-tight">45 days</div>
          </CardContent>
        </Card>
      </div>

      {/* Report Types Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.href} className="relative overflow-hidden bg-white border border-gray-200 rounded-xl hover:border-[#B1FA63]/30 hover:shadow-md transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 bg-[#243837] rounded-lg flex items-center justify-center group-hover:scale-105 group-hover:bg-[#B1FA63] transition-all duration-200 flex-shrink-0">
                    <Icon className="h-5 w-5 text-[#B1FA63] group-hover:text-[#243837]" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${report.statusColor}`}>
                    {report.status}
                  </span>
                </div>
                <CardTitle className="mt-4 text-lg font-medium text-gray-900 leading-normal">{report.title}</CardTitle>
                <CardDescription className="mt-2 text-sm text-gray-700 leading-relaxed">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-700 space-y-1 mb-4">
                  {report.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-[#B1FA63] rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={report.href}>
                  <Button className="w-full bg-[#B1FA63] hover:bg-[#9FE851] text-[#243837] font-medium border-[#B1FA63] hover:border-[#9FE851] group">
                    Generate Report
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// Loading skeleton component
function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-12 w-12 rounded-lg" />
              <Skeleton className="h-6 w-32 mt-4" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      {/* Header Section with Consistent Pattern */}
      <div className="bg-gradient-to-br from-[#B1FA63]/5 via-[#B1FA63]/3 to-transparent rounded-xl p-6 border border-[#B1FA63]/20 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-[#243837] rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-[#B1FA63]" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-light text-gray-900 leading-tight tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-base text-gray-700 leading-relaxed mt-2">
              Generate compliance reports, board packs, and export your charity data.
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsContent />
      </Suspense>
    </div>
  )
}