import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  HelpCircle, 
  MessageCircle, 
  Video, 
  FileText,
  Mail,
  Phone,
  ExternalLink,
  Search,
  ChevronRight,
  Lightbulb,
  Zap,
  Shield,
  Globe,
  DollarSign,
  Download,
  Upload,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

const faqs = [
  {
    category: 'Getting Started',
    icon: Zap,
    questions: [
      {
        q: 'How do I add my first DBS check?',
        a: 'Navigate to Compliance > Safeguarding and click "Add DBS Check". Enter the volunteer details, DBS number, and expiry date. The system will automatically track and notify you before expiry.'
      },
      {
        q: 'What is a compliance score?',
        a: 'Your compliance score is a percentage (0-100%) that reflects how well your charity meets regulatory requirements across safeguarding, overseas activities, and fundraising compliance.'
      },
      {
        q: 'How do I import existing data?',
        a: 'Go to Documents > Import and upload your CSV or Excel files. Our AI will automatically map columns and help you import safeguarding records, income data, and more.'
      }
    ]
  },
  {
    category: 'Compliance',
    icon: Shield,
    questions: [
      {
        q: 'What counts as an overseas activity?',
        a: 'Any charitable work, funding, or operations conducted outside the UK. This includes grants to overseas partners, direct service delivery, or volunteer programs abroad.'
      },
      {
        q: 'How often should I update safeguarding records?',
        a: 'Update immediately when: new volunteers join, DBS checks are renewed, training is completed, or any safeguarding incidents occur. Review all records quarterly.'
      },
      {
        q: 'What fundraising activities need to be tracked?',
        a: 'All public fundraising including: events, online campaigns, grant applications, regular giving programs, and commercial partnerships. Track income source and compliance measures.'
      }
    ]
  },
  {
    category: 'Reports & Export',
    icon: FileText,
    questions: [
      {
        q: 'How do I generate my Annual Return?',
        a: 'Go to Reports > Annual Return. The system automatically compiles your data into the Charity Commission format. Review, edit if needed, and copy sections to paste into the official portal.'
      },
      {
        q: 'Can I create custom board reports?',
        a: 'Yes! Reports > Board Pack lets you select sections, customize content, and generate professional PDF reports with your compliance data, trends, and AI-powered insights.'
      },
      {
        q: 'How do I export my data?',
        a: 'Reports > Export allows you to download all your data in CSV, Excel, or PDF formats. You can also schedule regular automated exports for backup or reporting.'
      }
    ]
  },
  {
    category: 'AI Features',
    icon: Lightbulb,
    questions: [
      {
        q: 'How does document extraction work?',
        a: 'Upload any document (PDF, image, email) and our AI extracts relevant compliance data. It identifies DBS numbers, dates, names, and other key information automatically.'
      },
      {
        q: 'What can the AI assistant help with?',
        a: 'Ask compliance questions, get regulation explanations, draft policies, analyze risks, or get suggestions for improving your compliance score. Access it via the chat icon.'
      },
      {
        q: 'Is my data used to train AI models?',
        a: 'No. Your data is never used for AI training. We use secure, private AI processing that keeps your charity data completely confidential.'
      }
    ]
  }
]

const tutorials = [
  {
    title: 'Quick Start Guide',
    duration: '5 min',
    icon: Zap,
    description: 'Get up and running with your first compliance checks',
    link: '#'
  },
  {
    title: 'Managing Safeguarding',
    duration: '10 min',
    icon: Shield,
    description: 'Complete guide to DBS checks and volunteer management',
    link: '#'
  },
  {
    title: 'Overseas Compliance',
    duration: '8 min',
    icon: Globe,
    description: 'Track and report international charitable activities',
    link: '#'
  },
  {
    title: 'Annual Return Preparation',
    duration: '15 min',
    icon: Calendar,
    description: 'Step-by-step Annual Return completion',
    link: '#'
  }
]

export default function HelpPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">
          Everything you need to master Charity Prep
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Video Tutorials</CardTitle>
              <CardDescription>Learn with guided walkthroughs</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Documentation</CardTitle>
              <CardDescription>Detailed guides and references</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Contact Support</CardTitle>
              <CardDescription>Get help from our team</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="faq" className="space-y-4">
        <TabsList>
          <TabsTrigger value="faq">FAQs</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* FAQs */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {faqs.map((category) => (
                  <div key={category.category} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <category.icon className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">{category.category}</h3>
                    </div>
                    <div className="space-y-4 ml-7">
                      {category.questions.map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <h4 className="font-medium flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5" />
                            {item.q}
                          </h4>
                          <p className="text-sm text-muted-foreground ml-6">
                            {item.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tutorials */}
        <TabsContent value="tutorials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>
                Step-by-step guides to get you started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorials.map((tutorial) => (
                  <div
                    key={tutorial.title}
                    className="group border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <tutorial.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {tutorial.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {tutorial.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {tutorial.duration}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interactive Guides</CardTitle>
              <CardDescription>
                Learn by doing with our interactive walkthroughs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Start the onboarding tour
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Learn how to import data
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate your first report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>
                We&apos;re here to help with your compliance journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email Support</p>
                      <a href="mailto:support@charityprep.uk" className="text-sm text-primary hover:underline">
                        support@charityprep.uk
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-muted-foreground">
                        Mon-Fri, 9am-5pm GMT
                      </p>
                      <a href="tel:+442012345678" className="text-sm text-primary hover:underline">
                        020 1234 5678
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Live Chat</p>
                      <p className="text-sm text-muted-foreground">
                        Available during business hours
                      </p>
                      <Button size="sm" className="mt-2">
                        Start Chat
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Send us a message</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Topic</label>
                      <select className="w-full mt-1 px-3 py-2 border rounded-md">
                        <option>Technical Support</option>
                        <option>Billing Question</option>
                        <option>Feature Request</option>
                        <option>Compliance Question</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <textarea 
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        rows={4}
                        placeholder="How can we help?"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
              <CardDescription>
                Helpful links and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="#" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <ExternalLink className="h-4 w-4" />
                  Charity Commission Guidelines
                </Link>
                <Link href="#" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <ExternalLink className="h-4 w-4" />
                  Annual Return Requirements 2024
                </Link>
                <Link href="#" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <ExternalLink className="h-4 w-4" />
                  Safeguarding Best Practices
                </Link>
                <Link href="#" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <ExternalLink className="h-4 w-4" />
                  API Documentation
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}