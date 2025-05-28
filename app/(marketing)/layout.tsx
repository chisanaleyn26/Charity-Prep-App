import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader variant="marketing" />
      <main className="flex-1 flex flex-col">{children}</main>
      <SiteFooter />
    </div>
  )
}