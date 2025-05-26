// AI Prompt Templates for various extraction and generation tasks

export const EXTRACTION_PROMPTS = {
  DBS_CERTIFICATE: `Extract the following information from this DBS certificate:

1. Full name of the person
2. DBS certificate number (exactly 12 digits)
3. Date of issue (format: YYYY-MM-DD)
4. Type of check (Basic, Standard, Enhanced, or Enhanced with Barred List)
5. Any visible expiry date if mentioned

Return as JSON with these fields:
{
  "person_name": "string",
  "dbs_certificate_number": "string (12 digits)",
  "issue_date": "YYYY-MM-DD",
  "dbs_check_type": "basic" | "standard" | "enhanced" | "enhanced_barred",
  "expiry_date": "YYYY-MM-DD or null",
  "confidence": 0.0-1.0
}

If any field cannot be determined with confidence, set it to null.`,

  RECEIPT: `Extract expense/donation information from this receipt:

1. Vendor/Organization name
2. Total amount (in original currency)
3. Currency (GBP, USD, EUR, etc.)
4. Date of transaction
5. Category (if determinable)
6. Any reference numbers

Return as JSON:
{
  "vendor_name": "string",
  "amount": number,
  "currency": "string",
  "transaction_date": "YYYY-MM-DD",
  "category": "string or null",
  "reference_number": "string or null",
  "confidence": 0.0-1.0
}`,

  EMAIL_DONATION: `Extract donation information from this email:

Look for:
- Donor name (individual or organization)
- Donation amount
- Date received
- Any restrictions or designations
- Reference numbers
- Gift Aid declaration

Return as JSON matching our income_records schema:
{
  "donor_name": "string",
  "amount": number,
  "date_received": "YYYY-MM-DD",
  "source": "online" | "cash" | "cheque" | "bank_transfer" | "other",
  "donor_type": "individual" | "corporate" | "foundation" | "trust" | "government" | "other",
  "is_anonymous": boolean,
  "restricted_funds": boolean,
  "restriction_details": "string or null",
  "gift_aid_eligible": boolean,
  "reference_number": "string or null",
  "confidence": 0.0-1.0
}`,

  OVERSEAS_TRANSFER: `Extract international transfer information:

Look for:
- Recipient country
- Transfer amount and currency
- Transfer method
- Date of transfer
- Purpose/Activity description
- Any partner organization mentioned

Return as JSON:
{
  "country_name": "string",
  "amount": number,
  "currency": "string",
  "amount_gbp": number (convert if possible),
  "transfer_method": "bank_transfer" | "wire_transfer" | "cash_courier" | "other",
  "transfer_date": "YYYY-MM-DD",
  "activity_description": "string",
  "partner_organization": "string or null",
  "confidence": 0.0-1.0
}`
} as const

export const MAPPING_PROMPTS = {
  CSV_COLUMNS: `You are a CSV column mapping expert. Map the provided CSV columns to our database schema.

CSV Headers: {{headers}}

Target Schema Fields:
{{schemaFields}}

For each target field, identify the most likely CSV column that contains that data.
Consider variations in naming, abbreviations, and common alternatives.

Return as JSON:
{
  "mappings": {
    "target_field_1": {
      "csv_column": "matched column name or null",
      "confidence": 0.0-1.0,
      "reason": "brief explanation"
    }
  },
  "unmapped_columns": ["columns that don't match any field"],
  "missing_required": ["required fields with no match"]
}`,

  DATA_TYPE_INFERENCE: `Analyze these sample values and infer the data type:

Values: {{sampleValues}}

Determine:
1. Data type (string, number, date, boolean, etc.)
2. Format pattern if applicable
3. Any validation rules observable

Return as JSON:
{
  "type": "string" | "number" | "date" | "boolean" | "email" | "phone",
  "format": "pattern or null",
  "nullable": boolean,
  "examples": ["clean examples"],
  "confidence": 0.0-1.0
}`
} as const

export const GENERATION_PROMPTS = {
  COMPLIANCE_NARRATIVE: `Generate a professional narrative for a charity trustee report.

Topic: {{topic}}
Data Context: {{dataContext}}

Requirements:
- Professional but accessible tone
- Include specific numbers and achievements
- Highlight improvements and challenges
- Suggest next steps
- Length: {{paragraphs}} paragraphs

Structure:
1. Opening statement on current status
2. Key achievements and metrics
3. Areas for improvement
4. Recommended actions

Keep the tone positive but honest about challenges.`,

  SEARCH_QUERY: `Convert this natural language search into a structured query.

User Query: "{{query}}"

Available search contexts:
- Safeguarding: person_name, dbs_certificate_number, expiry_date, status
- Overseas: country_code, activity_type, amount_gbp, transfer_date
- Fundraising: activity_name, donor_name, amount, date_received

Interpret the user's intent and return:
{
  "context": "safeguarding" | "overseas" | "fundraising" | "all",
  "filters": {
    "field": "operator", 
    "value": "value"
  },
  "sort": {
    "field": "field_name",
    "direction": "asc" | "desc"
  },
  "interpretation": "explanation of what was understood"
}`,

  COMPLIANCE_ADVICE: `You are a UK charity compliance expert assistant.

Context about the charity: {{organizationContext}}
Relevant regulations: {{regulations}}
User Question: {{question}}

Provide helpful, actionable advice that:
1. Directly answers the question
2. Cites specific regulations when relevant (with section numbers)
3. Gives practical steps to take
4. Warns about common pitfalls
5. Suggests where to find more information

Keep response concise but comprehensive. Use bullet points for action items.`
} as const

// Helper function to inject variables into prompts
export function fillPrompt(template: string, variables: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key]?.toString() || match
  })
}

// Confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,    // Auto-approve
  MEDIUM: 0.5,  // Require review
  LOW: 0.3,     // Suggest manual entry
} as const

// Response format specifications
export const RESPONSE_FORMATS = {
  JSON: {
    type: 'json_object' as const,
    instructions: 'Always return valid JSON. Use null for missing values.'
  },
  STRUCTURED: {
    type: 'text' as const,
    instructions: 'Return structured text with clear sections and formatting.'
  }
} as const