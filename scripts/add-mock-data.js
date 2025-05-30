const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const organizationId = '4c24aad5-7856-4e1b-a859-5043f73b7de6'

async function addMockData() {
  console.log('Adding mock data for organization:', organizationId)

  // Add overseas activities
  console.log('\n📍 Adding overseas activities...')
  const overseasActivities = [
    {
      organization_id: organizationId,
      activity_name: 'Clean Water Initiative',
      country_code: 'KE',
      activity_type: 'development',
      start_date: '2023-03-01',
      status: 'active',
      beneficiaries_count: 5000,
      budget_amount: 150000.00,
      partner_organization: 'Water Aid Kenya',
      description: 'Providing clean water access to rural communities through well construction and water purification systems',
      impact_metrics: {
        wells_built: 12,
        people_served: 5000,
        villages_reached: 8
      }
    },
    {
      organization_id: organizationId,
      activity_name: 'Mobile Medical Camps',
      country_code: 'BD',
      activity_type: 'healthcare',
      start_date: '2023-05-15',
      status: 'active',
      beneficiaries_count: 3000,
      budget_amount: 80000.00,
      partner_organization: 'Doctors Without Borders',
      description: 'Providing free medical services and essential medicines to underserved communities',
      impact_metrics: {
        patients_treated: 3000,
        vaccines_administered: 1200,
        health_workshops: 15
      }
    },
    {
      organization_id: organizationId,
      activity_name: 'Rural Education Program',
      country_code: 'IN',
      activity_type: 'education',
      start_date: '2022-09-01',
      status: 'active',
      beneficiaries_count: 1500,
      budget_amount: 120000.00,
      partner_organization: 'Pratham Education Foundation',
      description: 'Supporting primary education in rural areas through teacher training and learning materials',
      impact_metrics: {
        schools_supported: 25,
        teachers_trained: 60,
        students_reached: 1500
      }
    },
    {
      organization_id: organizationId,
      activity_name: 'Earthquake Relief Response',
      country_code: 'TR',
      activity_type: 'emergency_relief',
      start_date: '2023-02-10',
      status: 'completed',
      beneficiaries_count: 10000,
      budget_amount: 250000.00,
      partner_organization: 'Turkish Red Crescent',
      description: 'Emergency shelter, food, and medical aid for earthquake victims',
      impact_metrics: {
        families_helped: 2000,
        shelters_provided: 500,
        meals_distributed: 30000
      }
    },
    {
      organization_id: organizationId,
      activity_name: 'Women Skills Training Program',
      country_code: 'UG',
      activity_type: 'capacity_building',
      start_date: '2023-01-15',
      status: 'active',
      beneficiaries_count: 500,
      budget_amount: 60000.00,
      partner_organization: 'Women for Women International',
      description: 'Vocational training and microfinance support for women entrepreneurs',
      impact_metrics: {
        women_trained: 500,
        businesses_started: 120,
        loans_distributed: 200
      }
    },
    {
      organization_id: organizationId,
      activity_name: 'Maternal Health Program',
      country_code: 'GH',
      activity_type: 'healthcare',
      start_date: '2023-04-01',
      status: 'active',
      beneficiaries_count: 2000,
      budget_amount: 90000.00,
      partner_organization: 'Ghana Health Service',
      description: 'Improving maternal and child health through prenatal care and nutrition programs',
      impact_metrics: {
        mothers_supported: 2000,
        health_checks: 8000,
        nutrition_kits: 1500
      }
    }
  ]

  const { data: overseasData, error: overseasError } = await supabase
    .from('overseas_activities')
    .insert(overseasActivities)
    .select()

  if (overseasError) {
    console.error('Error adding overseas activities:', overseasError)
  } else {
    console.log(`✅ Added ${overseasData.length} overseas activities`)
  }

  // Add income records  
  console.log('\n💰 Adding income records...')
  const incomeRecords = [
    {
      organization_id: organizationId,
      source: 'Individual Donations',
      amount: 250000.00,
      date: '2023-01-15',
      category: 'donations',
      is_recurring: false,
      donor_count: 150,
      notes: 'Q1 individual giving campaign'
    },
    {
      organization_id: organizationId,
      source: 'Corporate Partnership - Tech Corp',
      amount: 500000.00,
      date: '2023-02-01',
      category: 'corporate',
      is_recurring: true,
      notes: '3-year partnership agreement'
    },
    {
      organization_id: organizationId,
      source: 'Government Grant - Education',
      amount: 750000.00,
      date: '2023-03-10',
      category: 'grants',
      is_recurring: false,
      notes: 'Department of Education grant for rural schools'
    },
    {
      organization_id: organizationId,
      source: 'Charity Gala Event',
      amount: 180000.00,
      date: '2023-04-20',
      category: 'events',
      is_recurring: false,
      attendee_count: 300,
      notes: 'Annual fundraising gala'
    },
    {
      organization_id: organizationId,
      source: 'Monthly Giving Program',
      amount: 85000.00,
      date: '2023-05-01',
      category: 'donations',
      is_recurring: true,
      donor_count: 425,
      notes: 'Regular monthly donors'
    },
    {
      organization_id: organizationId,
      source: 'Foundation Grant - Healthcare',
      amount: 300000.00,
      date: '2023-06-15',
      category: 'grants',
      is_recurring: false,
      notes: 'Smith Foundation healthcare initiative'
    }
  ]

  const { data: incomeData, error: incomeError } = await supabase
    .from('income_records')
    .insert(incomeRecords)
    .select()

  if (incomeError) {
    console.error('Error adding income records:', incomeError)
  } else {
    console.log(`✅ Added ${incomeData.length} income records`)
  }

  // Add fundraising events
  console.log('\n🎉 Adding fundraising events...')
  const fundraisingEvents = [
    {
      organization_id: organizationId,
      event_name: 'Spring Charity Gala 2023',
      event_date: '2023-04-20',
      event_type: 'gala',
      location: 'London Hilton Park Lane',
      target_amount: 200000.00,
      raised_amount: 180000.00,
      attendees_count: 300,
      status: 'completed',
      description: 'Annual black-tie fundraising gala with auction and entertainment'
    },
    {
      organization_id: organizationId,
      event_name: 'Marathon for Education',
      event_date: '2023-09-15',
      event_type: 'sporting',
      location: 'Hyde Park, London',
      target_amount: 100000.00,
      raised_amount: 0,
      attendees_count: 0,
      status: 'upcoming',
      description: '10K run to support our education programs'
    },
    {
      organization_id: organizationId,
      event_name: 'Virtual Quiz Night',
      event_date: '2023-02-10',
      event_type: 'virtual',
      location: 'Online',
      target_amount: 15000.00,
      raised_amount: 18500.00,
      attendees_count: 150,
      status: 'completed',
      description: 'Online trivia event with celebrity host'
    },
    {
      organization_id: organizationId,
      event_name: 'Christmas Market Stall',
      event_date: '2022-12-15',
      event_type: 'community',
      location: 'Camden Market, London',
      target_amount: 5000.00,
      raised_amount: 6200.00,
      attendees_count: 500,
      status: 'completed',
      description: 'Selling charity merchandise and homemade goods'
    },
    {
      organization_id: organizationId,
      event_name: 'Summer Garden Party',
      event_date: '2023-07-20',
      event_type: 'social',
      location: 'Kensington Gardens',
      target_amount: 50000.00,
      raised_amount: 0,
      attendees_count: 0,
      status: 'upcoming',
      description: 'Afternoon tea and entertainment in beautiful gardens'
    }
  ]

  const { data: eventsData, error: eventsError } = await supabase
    .from('fundraising_events')
    .insert(fundraisingEvents)
    .select()

  if (eventsError) {
    console.error('Error adding fundraising events:', eventsError)
  } else {
    console.log(`✅ Added ${eventsData.length} fundraising events`)
  }

  // Add documents
  console.log('\n📄 Adding documents...')
  const documents = [
    {
      organization_id: organizationId,
      name: 'Annual Report 2022',
      type: 'report',
      category: 'governance',
      file_path: 'documents/annual-report-2022.pdf',
      file_size: 2048000,
      mime_type: 'application/pdf',
      status: 'processed',
      tags: ['annual report', 'financial', 'governance'],
      metadata: {
        year: 2022,
        pages: 48,
        sections: ['financials', 'impact', 'governance']
      }
    },
    {
      organization_id: organizationId,
      name: 'Board Meeting Minutes - May 2023',
      type: 'minutes',
      category: 'governance',
      file_path: 'documents/board-minutes-may-2023.pdf',
      file_size: 512000,
      mime_type: 'application/pdf',
      status: 'processed',
      tags: ['board', 'minutes', 'governance'],
      metadata: {
        meeting_date: '2023-05-15',
        attendees: 8,
        duration_minutes: 120
      }
    },
    {
      organization_id: organizationId,
      name: 'Safeguarding Policy 2023',
      type: 'policy',
      category: 'compliance',
      file_path: 'documents/safeguarding-policy-2023.pdf',
      file_size: 1024000,
      mime_type: 'application/pdf',
      status: 'processed',
      tags: ['policy', 'safeguarding', 'compliance'],
      metadata: {
        version: '2.0',
        approved_date: '2023-01-10',
        review_date: '2024-01-10'
      }
    },
    {
      organization_id: organizationId,
      name: 'Grant Agreement - Education Project',
      type: 'contract',
      category: 'financial',
      file_path: 'documents/grant-agreement-education.pdf',
      file_size: 768000,
      mime_type: 'application/pdf',
      status: 'processed',
      tags: ['grant', 'contract', 'education'],
      metadata: {
        grant_amount: 750000,
        start_date: '2023-03-01',
        end_date: '2024-02-29'
      }
    },
    {
      organization_id: organizationId,
      name: 'Impact Report Q2 2023',
      type: 'report',
      category: 'operations',
      file_path: 'documents/impact-report-q2-2023.pdf',
      file_size: 3072000,
      mime_type: 'application/pdf',
      status: 'processed',
      tags: ['impact', 'quarterly', 'report'],
      metadata: {
        quarter: 'Q2',
        year: 2023,
        beneficiaries_reached: 15000
      }
    }
  ]

  const { data: docsData, error: docsError } = await supabase
    .from('documents')
    .insert(documents)
    .select()

  if (docsError) {
    console.error('Error adding documents:', docsError)
  } else {
    console.log(`✅ Added ${docsData.length} documents`)
  }

  console.log('\n✨ Mock data setup complete!')
}

// Run the function
addMockData().catch(console.error)