import { EtherealButton } from '@/components/custom-ui/ethereal-button'
import { DynamicCTAButton } from '@/components/marketing/dynamic-cta-button'
import Link from 'next/link'
import { CheckCircle2, Sparkles, Shield, Globe, TrendingUp, Users, ArrowRight, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#F8F8F8] via-white to-[#B1FA63]/3 pt-16 pb-24 px-6 overflow-hidden">
        {/* Modern Geometric Background */}
        <div className="absolute inset-0 z-0">
          {/* Large primary circle - top right */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#B1FA63]/15 rounded-full blur-2xl"></div>
          
          {/* Medium circle - bottom left */}
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#243837]/12 rounded-full blur-xl"></div>
          
          {/* Small accent circle - top left */}
          <div className="absolute top-20 left-16 w-32 h-32 bg-[#B1FA63]/20 rounded-full blur-lg"></div>
          
          {/* Geometric rectangles */}
          <div className="absolute top-1/3 right-1/4 w-24 h-48 bg-[#B1FA63]/18 rounded-2xl rotate-12 blur-md"></div>
          <div className="absolute bottom-1/3 left-1/3 w-16 h-32 bg-[#243837]/15 rounded-xl -rotate-12 blur-md"></div>
          
          {/* Floating squares - more visible */}
          <div className="absolute top-1/2 right-12 w-12 h-12 bg-[#B1FA63]/25 rounded-lg rotate-45"></div>
          <div className="absolute top-1/4 left-1/2 w-8 h-8 bg-[#243837]/20 rounded-md -rotate-12"></div>
          
          {/* Linear elements - thicker and more visible */}
          <div className="absolute top-16 right-1/3 w-0.5 h-24 bg-[#B1FA63]/30"></div>
          <div className="absolute bottom-1/4 left-1/4 w-20 h-0.5 bg-[#243837]/25"></div>
          
          {/* More visible grid dots */}
          <div className="absolute top-40 left-1/2 w-3 h-3 bg-[#B1FA63]/35 rounded-full"></div>
          <div className="absolute bottom-40 right-1/3 w-2 h-2 bg-[#243837]/30 rounded-full"></div>
          <div className="absolute top-2/3 left-20 w-2.5 h-2.5 bg-[#B1FA63]/25 rounded-full"></div>
          
          {/* Additional geometric elements for more visual interest */}
          <div className="absolute top-3/4 right-1/3 w-6 h-6 bg-[#B1FA63]/20 rounded-sm rotate-45"></div>
          <div className="absolute top-1/6 right-16 w-4 h-4 bg-[#243837]/18 rounded-full"></div>
          
          {/* Organic shape - more visible */}
          <div className="absolute top-1/2 left-1/4 w-40 h-28 bg-[#B1FA63]/12 blur-xl transform -translate-y-1/2 rounded-3xl rotate-6"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-6xl lg:text-7xl font-light text-[#243837] leading-tight mb-6 tracking-tight" style={{ letterSpacing: '-0.08em' }}>
            Charity Compliance
            <br />
            <span className="font-semibold text-[#243837]">Made</span> <span className="font-semibold text-[#B1FA63]">Simple.</span>
          </h1>
          
          <p className="text-xl text-[#243837]/80 leading-relaxed max-w-2xl mx-auto font-normal mb-12" style={{ letterSpacing: '-0.06em' }}>
            Transform charity compliance from annual panic into year-round confidence. 
            AI-powered tools designed specifically for UK charity administrators.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-6 mb-12">
            <DynamicCTAButton size="lg" className="px-10 py-4 text-base font-medium">
              Get Started
            </DynamicCTAButton>
            
            <div className="flex items-center justify-center gap-8 text-sm text-[#243837]/60 font-normal">
              <span>✓ 5-minute setup</span>
              <span>✓ Built for 2024 regulations</span>
              <span>✓ UK charity specialists</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-light text-[#243837] mb-6 tracking-tight" style={{ letterSpacing: '-0.08em' }}>
              Everything you need for stress-free compliance
            </h2>
            <p className="text-xl text-[#243837]/60 max-w-3xl mx-auto font-light" style={{ letterSpacing: '-0.06em' }}>
              Purpose-built for the new charity regulations, not adapted from generic software
            </p>
          </div>
          
          <div className="space-y-16">
            {/* Feature 1 */}
            <div className="flex items-start gap-8 group">
              <div className="w-2 h-16 bg-[#B1FA63] rounded-full group-hover:h-20 transition-all duration-300 flex-shrink-0 mt-2"></div>
              <div className="flex-1">
                <h3 className="text-2xl font-medium text-[#243837] mb-4 tracking-tight">Safeguarding Tracker</h3>
                <p className="text-lg text-[#243837]/70 leading-relaxed font-light">
                  DBS checks, training records, and policy management. Upload certificates and get automatic expiry alerts.
                </p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="flex items-start gap-8 group">
              <div className="w-2 h-16 bg-[#B1FA63] rounded-full group-hover:h-20 transition-all duration-300 flex-shrink-0 mt-2"></div>
              <div className="flex-1">
                <h3 className="text-2xl font-medium text-[#243837] mb-4 tracking-tight">Overseas Operations</h3>
                <p className="text-lg text-[#243837]/70 leading-relaxed font-light">
                  Track international programs, expenditure, and partnerships. Built for the new overseas reporting requirements.
                </p>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="flex items-start gap-8 group">
              <div className="w-2 h-16 bg-[#B1FA63] rounded-full group-hover:h-20 transition-all duration-300 flex-shrink-0 mt-2"></div>
              <div className="flex-1">
                <h3 className="text-2xl font-medium text-[#243837] mb-4 tracking-tight">Fundraising Intelligence</h3>
                <p className="text-lg text-[#243837]/70 leading-relaxed font-light">
                  Income categorization, donor tracking, and method compliance. Forward receipts and watch AI categorize everything.
                </p>
              </div>
            </div>
            
            {/* Feature 4 */}
            <div className="flex items-start gap-8 group">
              <div className="w-2 h-16 bg-[#B1FA63] rounded-full group-hover:h-20 transition-all duration-300 flex-shrink-0 mt-2"></div>
              <div className="flex-1">
                <h3 className="text-2xl font-medium text-[#243837] mb-4 tracking-tight">AI Magic Import</h3>
                <p className="text-lg text-[#243837]/70 leading-relaxed font-light">
                  Email receipts to data@charityprep.uk or snap photos of documents. Our AI extracts and categorizes automatically.
                </p>
              </div>
            </div>
            
            {/* Feature 5 */}
            <div className="flex items-start gap-8 group">
              <div className="w-2 h-16 bg-[#B1FA63] rounded-full group-hover:h-20 transition-all duration-300 flex-shrink-0 mt-2"></div>
              <div className="flex-1">
                <h3 className="text-2xl font-medium text-[#243837] mb-4 tracking-tight">Natural Language Search</h3>
                <p className="text-lg text-[#243837]/70 leading-relaxed font-light">
                  Ask "Show DBS expiring in March" or "Find overseas grants from 2023" and get instant, accurate results.
                </p>
              </div>
            </div>
            
            {/* Feature 6 */}
            <div className="flex items-start gap-8 group">
              <div className="w-2 h-16 bg-[#B1FA63] rounded-full group-hover:h-20 transition-all duration-300 flex-shrink-0 mt-2"></div>
              <div className="flex-1">
                <h3 className="text-2xl font-medium text-[#243837] mb-4 tracking-tight">Instant Reports</h3>
                <p className="text-lg text-[#243837]/70 leading-relaxed font-light">
                  Generate Annual Return exports, board packs with AI narratives, and compliance certificates in seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-br from-[#F8F8F8] to-[#B1FA63]/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-[#243837] mb-4 tracking-tight" style={{ letterSpacing: '-0.08em' }}>
              Simple, predictable pricing
            </h2>
            <p className="text-lg text-[#243837]/70 max-w-2xl mx-auto" style={{ letterSpacing: '-0.06em' }}>
              Annual billing based on your charity's income. No hidden fees, no per-user charges.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Essentials Tier */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E0E0E0] hover:shadow-lg transition-all duration-300 flex flex-col h-full mt-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-[#243837] mb-2">Essentials</h3>
                <p className="text-sm text-[#243837]/60 mb-6">Perfect for small charities under £100k</p>
                <div className="mb-6">
                  <div className="text-4xl font-light text-[#243837] mb-1">£290</div>
                  <div className="text-[#243837]/60">per year</div>
                  <div className="text-sm text-[#243837]/50">(~£24/month)</div>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8 text-[#243837]/80 flex-grow">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#B1FA63] mt-0.5 flex-shrink-0" />
                  <span>Core compliance tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#B1FA63] mt-0.5 flex-shrink-0" />
                  <span>Basic reporting</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#B1FA63] mt-0.5 flex-shrink-0" />
                  <span>Email support</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#B1FA63] mt-0.5 flex-shrink-0" />
                  <span>Up to 10 users</span>
                </li>
              </ul>
              
              <DynamicCTAButton variant="tertiary" className="w-full mt-auto">
                Get Started
              </DynamicCTAButton>
            </div>
            
            {/* Standard Tier - Highlighted */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#B1FA63] relative flex flex-col h-full">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#B1FA63] text-[#243837] px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-[#243837] mb-2">Standard</h3>
                <p className="text-sm text-[#243837]/60 mb-6">For growing charities £100k-1M</p>
                <div className="mb-6">
                  <div className="text-4xl font-light text-[#243837] mb-1">£790</div>
                  <div className="text-[#243837]/60">per year</div>
                  <div className="text-sm text-[#243837]/50">(~£66/month)</div>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8 text-[#243837]/80 flex-grow">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#B1FA63] mt-0.5 flex-shrink-0" />
                  <span className="font-medium">Everything in Essentials</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#B1FA63] mt-0.5 flex-shrink-0" />
                  <span>Advanced compliance modules</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#B1FA63] mt-0.5 flex-shrink-0" />
                  <span>AI-powered insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#B1FA63] mt-0.5 flex-shrink-0" />
                  <span>Up to 50 users</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#B1FA63] mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <DynamicCTAButton className="w-full mt-auto">
                Get Started
              </DynamicCTAButton>
            </div>
            
            {/* Premium Tier */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E0E0E0] hover:shadow-lg transition-all duration-300 flex flex-col h-full mt-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-[#243837] mb-2">Premium</h3>
                <p className="text-sm text-[#243837]/60 mb-6">For large charities over £1M</p>
                <div className="mb-6">
                  <div className="text-4xl font-light text-[#243837] mb-1">£1,490</div>
                  <div className="text-[#243837]/60">per year</div>
                  <div className="text-sm text-[#243837]/50">(~£124/month)</div>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8 text-[#243837]/80 flex-grow">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#B1FA63] mt-0.5 flex-shrink-0" />
                  <span className="font-medium">Everything in Standard</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#B1FA63] mt-0.5 flex-shrink-0" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#B1FA63] mt-0.5 flex-shrink-0" />
                  <span>Dedicated success manager</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#B1FA63] mt-0.5 flex-shrink-0" />
                  <span>SLA guarantee</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#B1FA63] mt-0.5 flex-shrink-0" />
                  <span>White-label options</span>
                </li>
              </ul>
              
              <DynamicCTAButton variant="tertiary" className="w-full mt-auto">
                Get Started
              </DynamicCTAButton>
            </div>
          </div>
          
          <div className="mt-12 text-center text-[#243837]/60 space-y-2">
            <p>All plans include 14-day free trial • No credit card required</p>
            <p>Cancel anytime • Prices exclude VAT where applicable</p>
          </div>
        </div>
      </section>

    </>
  )
}