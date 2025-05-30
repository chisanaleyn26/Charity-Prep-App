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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(overallScore)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Next Annual Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 days</div>
          </CardContent>
        </Card>
      </div>

      {/* Report Types Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.href} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${report.statusColor}`}>
                    {report.status}
                  </span>
                </div>
                <CardTitle className="mt-4">{report.title}</CardTitle>
                <CardDescription className="mt-2">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  {report.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={report.href}>
                  <Button className="w-full group">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-3">
          <h1 className="text-5xl font-extralight text-gray-900 tracking-tight leading-none flex items-center gap-4">
            <FileText className="h-12 w-12 text-gray-600" />
            Reports & Analytics
          </h1>
          <p className="text-lg text-gray-600 font-normal leading-relaxed tracking-wide">
            Generate compliance reports, board packs, and export your charity data.
          </p>
        </div>
      </div>

      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsContent />
      </Suspense>
    </div>
  )
}