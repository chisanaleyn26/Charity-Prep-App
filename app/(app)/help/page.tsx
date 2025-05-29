'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  HelpCircle,
  Search,
  ChevronRight,
  ChevronDown,
  Zap,
  Shield,
  FileText,
  Lightbulb,
  Calendar
} from 'lucide-react'

const faqs = [
  {
    category: 'Getting Started',
    icon: Zap,
    questions: [
      {
        q: 'How do I add my first safeguarding record?',
        a: 'Navigate to Safeguarding in the sidebar and click "Add Record". Enter the person\'s name, role, DBS certificate number, issue date, and expiry date. The system will automatically track expiry dates and send notifications 30 days before they expire.'
      },
      {
        q: 'What is a compliance score?',
        a: 'Your compliance score is a percentage (0-100%) that reflects how well your charity meets regulatory requirements across three key areas: safeguarding (DBS checks), overseas activities reporting, and fundraising compliance. Each area contributes to your overall score.'
      },
      {
        q: 'How do I switch between organizations?',
        a: 'Use the organization switcher at the top of the sidebar. Click on your current organization name to see a dropdown of all organizations you have access to, then select the one you want to switch to.'
      },
      {
        q: 'How do notifications work?',
        a: 'Notifications appear automatically for important events like DBS expiries, deadline reminders, and compliance alerts. Access them via the Notifications link in the sidebar. You\'ll see a badge with the unread count.'
      }
    ]
  },
  {
    category: 'Compliance Management',
    icon: Shield,
    questions: [
      {
        q: 'What safeguarding information should I track?',
        a: 'Track all DBS checks for staff and volunteers including: person name, role, DBS certificate number, issue date, expiry date, and check level (Basic, Standard, or Enhanced). Also note if they have safeguarding training and are in regulated activity.'
      },
      {
        q: 'How do I record overseas activities?',
        a: 'Go to Overseas in the sidebar and click "Add Activity". Record the country, activity type, description, expenditure amount, beneficiaries reached, and whether it\'s been reported to the Charity Commission. High-risk countries are automatically flagged.'
      },
      {
        q: 'What fundraising records do I need to maintain?',
        a: 'Navigate to Fundraising and add records for each campaign including: campaign name, type (events, online, grants, etc.), start/end dates, target amount, amount raised, and any compliance measures taken. This helps track your fundraising compliance.'
      },
      {
        q: 'How are high-risk countries identified?',
        a: 'The system automatically identifies high-risk countries based on Charity Commission guidelines. When you select a country for an overseas activity, you\'ll see a warning badge if it\'s classified as high-risk, requiring additional reporting.'
      }
    ]
  },
  {
    category: 'Calendar & Deadlines',
    icon: Calendar,
    questions: [
      {
        q: 'How do I manage deadlines?',
        a: 'The Calendar page shows all your upcoming deadlines including Annual Return due dates, DBS expiry dates, and custom deadlines. Each deadline shows days remaining and is color-coded by urgency (red for overdue, amber for soon, green for later).'
      },
      {
        q: 'Can I add custom deadlines?',
        a: 'Yes! On the Calendar page, click "Add Deadline" to create custom deadlines for grant applications, report submissions, or any other important dates. Set the title, description, due date, and category.'
      },
      {
        q: 'How do deadline notifications work?',
        a: 'The system automatically creates notifications based on your organization\'s reminder settings (default 30 days before). You\'ll receive notifications for DBS expiries, Annual Return deadlines, and any custom deadlines you\'ve created.'
      }
    ]
  },
  {
    category: 'AI Features',
    icon: Lightbulb,
    questions: [
      {
        q: 'What can the Compliance Chat help with?',
        a: 'The AI Compliance Chat can answer questions about charity regulations, help interpret Charity Commission guidance, suggest compliance improvements, and provide tailored advice based on your charity\'s specific situation. Access it via Compliance Chat in the sidebar.'
      },
      {
        q: 'How does Smart Import work?',
        a: 'Smart Import uses AI to extract data from documents and emails. Upload spreadsheets, PDFs, or forward emails to automatically extract safeguarding records, financial data, or other compliance information. The AI maps the data to the correct fields.'
      },
      {
        q: 'Is my data kept private when using AI features?',
        a: 'Yes, absolutely. Your data is never used to train AI models. All AI processing happens in isolated, secure environments. Your charity\'s information remains completely confidential and is only used to provide you with personalized assistance.'
      },
      {
        q: 'Can the AI generate reports for me?',
        a: 'Yes! The AI can help generate narrative sections for your Annual Return, create summaries of your compliance status, and draft board reports. It uses your actual data to create accurate, professional reports tailored to your charity.'
      }
    ]
  },
  {
    category: 'Data & Security',
    icon: FileText,
    questions: [
      {
        q: 'How do I export my data?',
        a: 'Go to Reports > Export Data to download your information in CSV or Excel format. You can export safeguarding records, overseas activities, fundraising data, or all data at once. This is useful for backups or external reporting.'
      },
      {
        q: 'Is my data backed up?',
        a: 'Yes, all data is automatically backed up continuously. You can also create your own backups by exporting data regularly. We recommend downloading a full export monthly for your own records.'
      },
      {
        q: 'Who can access my charity\'s data?',
        a: 'Only users you\'ve invited to your organization can access your data. You can manage team members in Settings > Organization. Each user can be assigned different permission levels to control what they can view and edit.'
      },
      {
        q: 'How do I delete old records?',
        a: 'You can delete individual records by clicking the delete button on any item. Deleted records are soft-deleted and can be recovered within 30 days. After that, they are permanently removed in compliance with data protection regulations.'
      }
    ]
  }
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    faqs.map(f => f.category) // All expanded by default
  )
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([])

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(q => q !== questionId)
        : [...prev, questionId]
    )
  }

  // Filter FAQs based on search term
  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      item => 
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <h1 className="text-5xl font-extralight text-foreground tracking-tight leading-none flex items-center gap-4">
            <HelpCircle className="h-12 w-12 text-muted-foreground" />
            FAQ
          </h1>
          <p className="text-lg text-muted-foreground font-normal leading-relaxed tracking-wide">
            Find answers to common questions about CharityPrep.
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search frequently asked questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQ Content */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground text-center">
                Try searching with different keywords
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((category) => (
            <Card key={category.category}>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleCategory(category.category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                  </div>
                  {expandedCategories.includes(category.category) ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              
              {expandedCategories.includes(category.category) && (
                <CardContent>
                  <div className="space-y-4">
                    {category.questions.map((item, idx) => {
                      const questionId = `${category.category}-${idx}`
                      const isExpanded = expandedQuestions.includes(questionId)
                      
                      return (
                        <div 
                          key={idx} 
                          className="border-b last:border-0 pb-4 last:pb-0"
                        >
                          <button
                            className="w-full text-left"
                            onClick={() => toggleQuestion(questionId)}
                          >
                            <h4 className="font-medium flex items-start gap-2 hover:text-primary transition-colors">
                              <ChevronRight className={`h-4 w-4 text-muted-foreground mt-0.5 transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`} />
                              {item.q}
                            </h4>
                          </button>
                          {isExpanded && (
                            <p className="text-sm text-muted-foreground ml-6 mt-2">
                              {item.a}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Help Card */}
      <Card>
        <CardContent className="flex items-center justify-between py-6">
          <div className="space-y-1">
            <h3 className="font-semibold">Can't find what you're looking for?</h3>
            <p className="text-sm text-muted-foreground">
              Contact our support team at support@charityprep.uk
            </p>
          </div>
          <HelpCircle className="h-8 w-8 text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  )
}