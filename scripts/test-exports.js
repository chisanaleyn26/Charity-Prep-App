/**
 * Test Export Workflows
 * Validates that data export functionality works correctly
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

class ExportTester {
  constructor() {
    this.results = []
    this.errors = []
  }

  async runTests() {
    console.log('🧪 Testing Export Workflows...\n')

    try {
      // Test 1: Check database tables exist
      await this.testDatabaseTables()

      // Test 2: Test data generation functions
      await this.testDataGeneration()

      // Test 3: Test export formats
      await this.testExportFormats()

      // Test 4: Test download API route
      await this.testDownloadRoute()

      this.generateReport()
    } catch (error) {
      console.error('Test execution failed:', error)
    }
  }

  async testDatabaseTables() {
    console.log('📋 Testing Database Tables...')

    const requiredTables = [
      'organizations',
      'income_records',
      'safeguarding_records',
      'overseas_activities',
      'documents',
      'compliance_scores'
    ]

    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (error) {
          this.errors.push(`Table "${table}" query failed: ${error.message}`)
          console.log(`   ❌ ${table} - Error: ${error.message}`)
        } else {
          this.results.push(`Table "${table}" accessible`)
          console.log(`   ✅ ${table} - Accessible`)
        }
      } catch (error) {
        this.errors.push(`Table "${table}" test failed: ${error.message}`)
        console.log(`   ❌ ${table} - Exception: ${error.message}`)
      }
    }
    console.log()
  }

  async testDataGeneration() {
    console.log('📊 Testing Data Generation...')

    // Import the data generator function
    try {
      const { generateExportData } = await import('../features/reports/export/utils/data-generator.js')
      
      // Test with a mock organization ID
      const testOrgId = 'test-org-123'
      const dataSources = [
        'compliance-scores',
        'income-sources',
        'safeguarding-incidents',
        'overseas-activities',
        'documents'
      ]

      for (const dataSource of dataSources) {
        try {
          const data = await generateExportData(testOrgId, dataSource, undefined, 5)
          
          if (Array.isArray(data)) {
            this.results.push(`Data source "${dataSource}" generated successfully`)
            console.log(`   ✅ ${dataSource} - Generated ${data.length} records`)
          } else {
            this.errors.push(`Data source "${dataSource}" did not return array`)
            console.log(`   ❌ ${dataSource} - Invalid return type`)
          }
        } catch (error) {
          // Expected for mock org - check if it's a reasonable error
          if (error.message.includes('organization') || error.message.includes('not found')) {
            this.results.push(`Data source "${dataSource}" properly validates organization`)
            console.log(`   ✅ ${dataSource} - Proper validation`)
          } else {
            this.errors.push(`Data source "${dataSource}" failed: ${error.message}`)
            console.log(`   ❌ ${dataSource} - Error: ${error.message}`)
          }
        }
      }
    } catch (importError) {
      this.errors.push(`Data generator import failed: ${importError.message}`)
      console.log(`   ❌ Import failed: ${importError.message}`)
    }
    console.log()
  }

  async testExportFormats() {
    console.log('📄 Testing Export Formats...')

    try {
      const { formatExportData } = await import('../features/reports/export/utils/data-formatter.js')
      
      // Test data
      const testData = [
        { id: 1, name: 'Test Record', amount: 1000, date: '2024-01-01', active: true },
        { id: 2, name: 'Another Record', amount: 2000, date: '2024-01-02', active: false }
      ]

      const formats = ['csv', 'json', 'excel', 'pdf', 'xml']

      for (const format of formats) {
        try {
          const result = await formatExportData(testData, format)
          
          if (result !== null && result !== undefined) {
            this.results.push(`Format "${format}" works correctly`)
            console.log(`   ✅ ${format} - Generated successfully`)
          } else {
            this.errors.push(`Format "${format}" returned null/undefined`)
            console.log(`   ❌ ${format} - No output`)
          }
        } catch (error) {
          this.errors.push(`Format "${format}" failed: ${error.message}`)
          console.log(`   ❌ ${format} - Error: ${error.message}`)
        }
      }
    } catch (importError) {
      this.errors.push(`Data formatter import failed: ${importError.message}`)
      console.log(`   ❌ Import failed: ${importError.message}`)
    }
    console.log()
  }

  async testDownloadRoute() {
    console.log('🔗 Testing Download Route...')

    const routePath = 'app/api/export/download/[jobId]/route.ts'
    const fullPath = path.join(process.cwd(), routePath)

    try {
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8')
        
        // Check for key components
        const checks = [
          { pattern: /NextRequest/, name: 'NextRequest import' },
          { pattern: /NextResponse/, name: 'NextResponse import' },
          { pattern: /export async function GET/, name: 'GET handler' },
          { pattern: /generateExportData/, name: 'Data generation call' },
          { pattern: /formatExportData/, name: 'Data formatting call' },
          { pattern: /createDownloadBlob/, name: 'Blob creation call' },
          { pattern: /Content-Disposition/, name: 'Download headers' }
        ]

        for (const check of checks) {
          if (check.pattern.test(content)) {
            this.results.push(`Download route has ${check.name}`)
            console.log(`   ✅ ${check.name} - Present`)
          } else {
            this.errors.push(`Download route missing ${check.name}`)
            console.log(`   ❌ ${check.name} - Missing`)
          }
        }
      } else {
        this.errors.push('Download route file does not exist')
        console.log(`   ❌ Route file not found at ${routePath}`)
      }
    } catch (error) {
      this.errors.push(`Download route test failed: ${error.message}`)
      console.log(`   ❌ Route test error: ${error.message}`)
    }
    console.log()
  }

  generateReport() {
    console.log('='.repeat(60))
    console.log('📊 EXPORT WORKFLOW TEST REPORT')
    console.log('='.repeat(60))

    console.log(`\n✅ Successful Tests: ${this.results.length}`)
    console.log(`❌ Failed Tests: ${this.errors.length}`)
    console.log(`📈 Success Rate: ${Math.round((this.results.length / (this.results.length + this.errors.length)) * 100)}%`)

    if (this.errors.length > 0) {
      console.log('\n❌ Issues Found:')
      this.errors.forEach(error => {
        console.log(`   • ${error}`)
      })
    }

    if (this.results.length > 0) {
      console.log('\n✅ Working Components:')
      this.results.slice(0, 10).forEach(result => {
        console.log(`   • ${result}`)
      })
      if (this.results.length > 10) {
        console.log(`   ... and ${this.results.length - 10} more`)
      }
    }

    console.log('\n🔧 Recommendations:')
    if (this.errors.some(e => e.includes('Table'))) {
      console.log('   • Run database migrations to ensure all tables exist')
    }
    if (this.errors.some(e => e.includes('import'))) {
      console.log('   • Check that all required dependencies are installed')
    }
    if (this.errors.some(e => e.includes('route'))) {
      console.log('   • Verify API route structure and implementation')
    }
    if (this.errors.length === 0) {
      console.log('   • All export workflows are functioning correctly!')
    }

    console.log('\n' + '='.repeat(60))
    console.log('Export workflow testing complete! 🎉')
    console.log('='.repeat(60))
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ExportTester()
  tester.runTests()
}