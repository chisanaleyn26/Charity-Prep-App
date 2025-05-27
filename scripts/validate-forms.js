/**
 * Form Validation Checker
 * Scans the codebase for forms and checks their validation status
 */

import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

const FORM_PATTERNS = [
  /useForm\(/g,
  /onSubmit|handleSubmit/g,
  /<form/g,
  /react-hook-form/g,
  /zodResolver/g,
  /FormField/g
]

const VALIDATION_PATTERNS = [
  { pattern: /zodResolver/, name: 'Zod Validation', weight: 5 },
  { pattern: /FormMessage/, name: 'Field Error Messages', weight: 3 },
  { pattern: /toast\.(error|success)/, name: 'Toast Notifications', weight: 2 },
  { pattern: /setError/, name: 'Manual Error Setting', weight: 2 },
  { pattern: /isSubmitting|loading/, name: 'Loading States', weight: 2 },
  { pattern: /required/, name: 'Required Fields', weight: 1 },
  { pattern: /disabled.*submitting/, name: 'Submission Prevention', weight: 1 }
]

class FormValidator {
  constructor() {
    this.results = []
    this.summary = {
      totalForms: 0,
      validatedForms: 0,
      issuesFound: 0,
      recommendations: []
    }
  }

  async scanProject() {
    console.log('🔍 Scanning project for forms...\n')
    
    try {
      // Find all component files
      const files = await glob('**/*.{tsx,ts}', {
        cwd: process.cwd(),
        ignore: ['node_modules/**', 'dist/**', '.next/**', 'out/**']
      })

      for (const file of files) {
        await this.analyzeFile(file)
      }

      this.generateReport()
    } catch (error) {
      console.error('Error scanning project:', error)
    }
  }

  async analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // Check if file contains forms
    const hasFormPatterns = FORM_PATTERNS.some(pattern => pattern.test(content))
    
    if (!hasFormPatterns) return

    console.log(`📋 Analyzing form in: ${filePath}`)
    this.summary.totalForms++

    const fileResult = {
      file: filePath,
      validationScore: 0,
      features: [],
      issues: [],
      recommendations: []
    }

    // Check validation patterns
    for (const { pattern, name, weight } of VALIDATION_PATTERNS) {
      if (pattern.test(content)) {
        fileResult.features.push(name)
        fileResult.validationScore += weight
      }
    }

    // Specific checks
    this.checkFormPatterns(content, fileResult)
    this.checkErrorHandling(content, fileResult)
    this.checkValidationSchemas(content, fileResult)

    // Determine overall quality
    fileResult.quality = this.getQualityRating(fileResult.validationScore)
    
    if (fileResult.validationScore >= 8) {
      this.summary.validatedForms++
    }

    this.results.push(fileResult)
  }

  checkFormPatterns(content, result) {
    // Check for react-hook-form usage
    if (!content.includes('useForm')) {
      result.issues.push('Not using react-hook-form')
      result.recommendations.push('Consider using react-hook-form for better form handling')
    }

    // Check for form validation
    if (!content.includes('zodResolver') && !content.includes('yupResolver')) {
      result.issues.push('No schema validation detected')
      result.recommendations.push('Add Zod or Yup validation schema')
    }

    // Check for loading states
    if (!content.includes('isSubmitting') && !content.includes('loading')) {
      result.issues.push('No loading state management')
      result.recommendations.push('Add loading states to prevent multiple submissions')
    }

    // Check for error handling
    if (!content.includes('toast.error') && !content.includes('alert') && !content.includes('setError')) {
      result.issues.push('Poor error handling')
      result.recommendations.push('Add proper error handling with toast notifications')
    }

    // Check for field validation messages
    if (!content.includes('FormMessage') && !content.includes('error')) {
      result.issues.push('No field-level error messages')
      result.recommendations.push('Add field-level validation messages')
    }
  }

  checkErrorHandling(content, result) {
    // Check for alert() usage (anti-pattern)
    if (content.includes('alert(')) {
      result.issues.push('Using alert() for error display')
      result.recommendations.push('Replace alert() with toast notifications')
    }

    // Check for try-catch blocks
    if (!content.includes('try') || !content.includes('catch')) {
      result.issues.push('Missing try-catch error handling')
      result.recommendations.push('Add try-catch blocks for async operations')
    }
  }

  checkValidationSchemas(content, result) {
    // Check for comprehensive validation
    const validationKeywords = ['min', 'max', 'required', 'email', 'regex', 'refine']
    const foundValidations = validationKeywords.filter(keyword => content.includes(keyword))
    
    if (foundValidations.length < 3) {
      result.issues.push('Limited validation rules')
      result.recommendations.push('Add more comprehensive validation rules')
    }

    // Check for cross-field validation
    if (content.includes('superRefine')) {
      result.features.push('Cross-field validation')
      result.validationScore += 2
    }
  }

  getQualityRating(score) {
    if (score >= 12) return 'Excellent'
    if (score >= 8) return 'Good'
    if (score >= 5) return 'Fair'
    if (score >= 2) return 'Poor'
    return 'Very Poor'
  }

  generateReport() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 FORM VALIDATION REPORT')
    console.log('='.repeat(60))

    // Summary
    console.log(`\n📈 Summary:`)
    console.log(`   Total forms found: ${this.summary.totalForms}`)
    console.log(`   Well-validated forms: ${this.summary.validatedForms}`)
    console.log(`   Coverage: ${Math.round((this.summary.validatedForms / this.summary.totalForms) * 100)}%`)

    // Results by quality
    const qualityGroups = {}
    this.results.forEach(result => {
      if (!qualityGroups[result.quality]) {
        qualityGroups[result.quality] = []
      }
      qualityGroups[result.quality].push(result)
    })

    console.log(`\n📋 Forms by Quality:`)
    Object.entries(qualityGroups).forEach(([quality, forms]) => {
      const emoji = {
        'Excellent': '🟢',
        'Good': '🟡',
        'Fair': '🟠',
        'Poor': '🔴',
        'Very Poor': '⚫'
      }[quality] || '⚪'
      
      console.log(`   ${emoji} ${quality}: ${forms.length} forms`)
    })

    // Detailed results
    console.log(`\n📝 Detailed Results:`)
    this.results.forEach(result => {
      console.log(`\n   📄 ${result.file}`)
      console.log(`      Quality: ${result.quality} (Score: ${result.validationScore})`)
      
      if (result.features.length > 0) {
        console.log(`      ✅ Features: ${result.features.join(', ')}`)
      }
      
      if (result.issues.length > 0) {
        console.log(`      ❌ Issues: ${result.issues.join(', ')}`)
      }
      
      if (result.recommendations.length > 0) {
        console.log(`      💡 Recommendations:`)
        result.recommendations.forEach(rec => {
          console.log(`         - ${rec}`)
        })
      }
    })

    // Top recommendations
    const allRecommendations = this.results.flatMap(r => r.recommendations)
    const recommendationCounts = {}
    allRecommendations.forEach(rec => {
      recommendationCounts[rec] = (recommendationCounts[rec] || 0) + 1
    })

    const topRecommendations = Object.entries(recommendationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    if (topRecommendations.length > 0) {
      console.log(`\n🎯 Top Recommendations:`)
      topRecommendations.forEach(([rec, count]) => {
        console.log(`   ${count}x ${rec}`)
      })
    }

    // Action items
    console.log(`\n📋 Action Items:`)
    const poorQualityForms = this.results.filter(r => ['Poor', 'Very Poor'].includes(r.quality))
    if (poorQualityForms.length > 0) {
      console.log(`   🔧 ${poorQualityForms.length} forms need immediate attention`)
      poorQualityForms.forEach(form => {
        console.log(`      - ${form.file}`)
      })
    } else {
      console.log(`   ✅ All forms meet minimum quality standards`)
    }

    console.log('\n' + '='.repeat(60))
    console.log('Form validation analysis complete! 🎉')
    console.log('='.repeat(60))
  }
}

// Run the analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new FormValidator()
  validator.scanProject()
}