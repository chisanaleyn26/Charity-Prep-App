'use server'

import { AIService } from './service'
import { AI_CONFIG } from './config'

export interface CSVMapping {
  [csvHeader: string]: string
}

/**
 * AI-powered CSV column mapper
 */
export async function mapCSVColumns(
  csvHeaders: string[],
  targetSchema: Record<string, string>,
  moduleType: 'safeguarding' | 'overseas' | 'income'
): Promise<{ mapping?: CSVMapping; error?: string }> {
  const ai = AIService.getInstance()
  
  // Create schema description for the AI
  const schemaDescription = Object.entries(targetSchema)
    .map(([field, description]) => `- ${field}: ${description}`)
    .join('\n')
  
  const prompt = `Map these CSV headers to the database schema fields for ${moduleType} records.

CSV Headers:
${csvHeaders.join(', ')}

Database Schema Fields:
${schemaDescription}

Rules:
1. Only map headers that clearly match schema fields
2. Use exact schema field names
3. Headers can be mapped to multiple fields if needed
4. Ignore headers that don't match any schema field
5. Common mappings:
   - "Name" -> "person_name" (for safeguarding)
   - "DBS Number" -> "dbs_certificate_number"
   - "Expires" or "Expiry" -> "expiry_date"
   - "Amount" -> "amount"
   - "Date" -> appropriate date field

Return a JSON object with format: {"CSV Header": "schema_field"}`

  const response = await ai.complete<CSVMapping>(prompt, {
    systemPrompt: AI_CONFIG.prompts.csvMapper,
    jsonMode: true,
    temperature: 0.1 // Very low for consistent mapping
  })
  
  if (!response.success || !response.data) {
    return { error: response.error || 'Failed to map columns' }
  }
  
  // Validate the mapping
  const validatedMapping: CSVMapping = {}
  const validSchemaFields = Object.keys(targetSchema)
  
  for (const [csvHeader, schemaField] of Object.entries(response.data)) {
    if (validSchemaFields.includes(schemaField) && csvHeaders.includes(csvHeader)) {
      validatedMapping[csvHeader] = schemaField
    }
  }
  
  return { mapping: validatedMapping }
}

/**
 * Get schema descriptions for each module
 */
export function getModuleSchema(moduleType: 'safeguarding' | 'overseas' | 'income'): Record<string, string> {
  switch (moduleType) {
    case 'safeguarding':
      return {
        person_name: 'Full name of the person',
        role_title: 'Job title or role',
        role_type: 'Type of role (employee, volunteer, trustee, contractor)',
        department: 'Department or team',
        dbs_check_type: 'DBS check level (basic, standard, enhanced, enhanced_barred)',
        dbs_certificate_number: 'DBS certificate number',
        issue_date: 'Date DBS was issued',
        expiry_date: 'Date DBS expires',
        works_with_children: 'Works with children (true/false)',
        works_with_vulnerable_adults: 'Works with vulnerable adults (true/false)',
        unsupervised_access: 'Has unsupervised access (true/false)',
        training_completed: 'Safeguarding training completed (true/false)',
        training_date: 'Date of safeguarding training',
        reference_checks_completed: 'Reference checks done (true/false)',
        notes: 'Additional notes'
      }
    
    case 'overseas':
      return {
        activity_name: 'Name or title of the activity',
        activity_type: 'Type of activity (humanitarian_aid, development, education, etc)',
        country_code: 'Country code or name',
        transfer_date: 'Date of transfer',
        transfer_method: 'How money was transferred',
        amount: 'Amount in original currency',
        currency: 'Currency code (GBP, USD, EUR, etc)',
        amount_gbp: 'Amount in British Pounds',
        exchange_rate: 'Exchange rate used',
        financial_year: 'Financial year',
        quarter: 'Quarter (1-4)',
        project_code: 'Internal project code',
        description: 'Description of activity',
        beneficiaries_count: 'Number of beneficiaries',
        transfer_reference: 'Transfer reference number',
        sanctions_check_completed: 'Sanctions check done (true/false)',
        reported_to_commission: 'Reported to Charity Commission (true/false)'
      }
    
    case 'income':
      return {
        date_received: 'Date donation received',
        source: 'Income source category',
        amount: 'Amount received',
        donor_type: 'Type of donor (individual, corporate, trust, etc)',
        donor_name: 'Name of donor',
        is_anonymous: 'Anonymous donation (true/false)',
        fundraising_method: 'How funds were raised',
        campaign_name: 'Fundraising campaign name',
        gift_aid_eligible: 'Eligible for Gift Aid (true/false)',
        gift_aid_claimed: 'Gift Aid claimed (true/false)',
        restricted_funds: 'Restricted donation (true/false)',
        restriction_details: 'Details of restrictions',
        is_related_party: 'Related party transaction (true/false)',
        related_party_relationship: 'Relationship if related party',
        reference_number: 'Reference or receipt number',
        financial_year: 'Financial year',
        notes: 'Additional notes'
      }
  }
}