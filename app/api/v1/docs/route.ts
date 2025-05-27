import { NextRequest, NextResponse } from 'next/server'

// GET /api/v1/docs - API documentation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'

  const documentation = {
    title: 'Charity Prep API v1',
    version: '1.0.0',
    description: 'RESTful API for charity compliance management',
    base_url: process.env.NEXT_PUBLIC_APP_URL + '/api/v1',
    
    authentication: {
      type: 'API Key',
      methods: [
        {
          type: 'Bearer Token',
          description: 'Include API key in Authorization header',
          example: 'Authorization: Bearer your-api-key'
        },
        {
          type: 'Basic Auth',
          description: 'Use organization ID as username and API key as password',
          example: 'Authorization: Basic base64(org_id:api_key)'
        }
      ],
      note: 'API access requires Premium subscription'
    },

    rate_limiting: {
      description: 'Rate limits apply per organization based on subscription tier',
      window: '15 minutes',
      limits: {
        essentials: 100,
        standard: 500,
        premium: 2000,
        public: 50
      },
      headers: {
        'X-RateLimit-Limit': 'Total requests allowed in window',
        'X-RateLimit-Remaining': 'Requests remaining in current window',
        'X-RateLimit-Reset': 'Unix timestamp when window resets'
      }
    },

    endpoints: {
      status: {
        path: '/status',
        methods: ['GET'],
        description: 'Get API status and health information',
        auth_required: false,
        example: {
          request: 'GET /api/v1/status',
          response: {
            success: true,
            data: {
              api: { status: 'operational', version: 'v1' },
              database: { status: 'operational' },
              authentication: { status: 'unauthenticated' }
            }
          }
        }
      },

      organizations: {
        path: '/organizations',
        methods: ['GET', 'PUT'],
        description: 'Manage organization information',
        auth_required: true,
        parameters: {
          GET: {
            include: 'Comma-separated list: subscription,usage,members,compliance_score',
            fields: 'Comma-separated list of fields to return'
          },
          PUT: {
            name: 'Organization name',
            description: 'Organization description',
            website: 'Website URL',
            charity_number: 'Charity registration number',
            contact_email: 'Primary contact email'
          }
        },
        example: {
          request: 'GET /api/v1/organizations?include=subscription,compliance_score',
          response: {
            success: true,
            data: {
              id: 'org_123',
              name: 'Example Charity',
              subscription: { tier: 'STANDARD', status: 'active' },
              compliance_score: { overall_score: 85 }
            }
          }
        }
      },

      compliance: {
        path: '/compliance',
        methods: ['GET', 'POST'],
        description: 'Access compliance data and records',
        auth_required: true,
        parameters: {
          GET: {
            type: 'Filter by type: safeguarding,fundraising,overseas_activities,all',
            status: 'Filter by status: compliant,non_compliant,pending,all',
            limit: 'Number of records to return (max 100)',
            offset: 'Number of records to skip',
            start_date: 'Start date filter (YYYY-MM-DD)',
            end_date: 'End date filter (YYYY-MM-DD)'
          },
          POST: {
            type: 'Record type: safeguarding,fundraising,overseas',
            '...fields': 'Type-specific fields (see schemas below)'
          }
        },
        schemas: {
          safeguarding: {
            person_name: 'string (required)',
            role_type: 'employee|volunteer|trustee (required)',
            dbs_certificate_number: 'string (optional)',
            dbs_issue_date: 'YYYY-MM-DD (optional)',
            dbs_type: 'basic|standard|enhanced|enhanced_barred (optional)',
            works_with_children: 'boolean (required)',
            works_with_vulnerable_adults: 'boolean (required)',
            training_completed: 'boolean (optional)',
            training_date: 'YYYY-MM-DD (optional)'
          },
          fundraising: {
            activity_type: 'street_collection|house_to_house|event|online|other (required)',
            description: 'string (required)',
            planned_date: 'YYYY-MM-DD (optional)',
            location: 'string (optional)',
            permit_required: 'boolean (required)',
            permit_obtained: 'boolean (optional)',
            permit_reference: 'string (optional)',
            estimated_income: 'number (optional)'
          },
          overseas: {
            country_code: 'string (2 chars, required)',
            activity_description: 'string (required)',
            partner_organization: 'string (optional)',
            amount_gbp: 'number (required)',
            transfer_method: 'bank_transfer|cash|in_kind|other (required)',
            purpose: 'string (required)',
            approval_required: 'boolean (required)',
            approval_obtained: 'boolean (optional)',
            approval_reference: 'string (optional)'
          }
        },
        example: {
          request: 'GET /api/v1/compliance?type=safeguarding&limit=10',
          response: {
            success: true,
            data: {
              summary: { overall_score: 85, safeguarding_score: 90 },
              data: {
                safeguarding: [
                  {
                    id: 'rec_123',
                    person_name: 'John Doe',
                    role_type: 'volunteer',
                    works_with_children: true
                  }
                ]
              }
            }
          }
        }
      }
    },

    response_format: {
      success_response: {
        success: true,
        data: '...',
        timestamp: '2024-01-01T00:00:00.000Z'
      },
      error_response: {
        success: false,
        error: {
          message: 'Error description',
          code: 'ERROR_CODE',
          details: '...'
        },
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    },

    error_codes: {
      AUTHENTICATION_REQUIRED: 'API key required',
      FEATURE_ACCESS_DENIED: 'Feature not available in current plan',
      RATE_LIMIT_EXCEEDED: 'Too many requests',
      INVALID_QUERY: 'Invalid query parameters',
      INVALID_DATA: 'Invalid request data',
      ORGANIZATION_NOT_FOUND: 'Organization not found',
      FETCH_ERROR: 'Failed to fetch data',
      CREATE_ERROR: 'Failed to create record',
      UPDATE_ERROR: 'Failed to update record',
      INTERNAL_ERROR: 'Internal server error'
    },

    getting_started: {
      steps: [
        '1. Ensure you have a Premium subscription',
        '2. Generate an API key in Settings > API Keys',
        '3. Include the API key in Authorization header',
        '4. Make requests to https://your-domain.com/api/v1/endpoint',
        '5. Check response status and handle errors appropriately'
      ],
      example_curl: `curl -X GET \\
  "https://your-domain.com/api/v1/organizations" \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json"`
    },

    sdks: {
      javascript: {
        npm: 'npm install @charity-prep/api-client',
        example: `import { CharityPrepAPI } from '@charity-prep/api-client';

const api = new CharityPrepAPI('your-api-key');
const org = await api.organizations.get();`
      },
      python: {
        pip: 'pip install charity-prep-api',
        example: `from charity_prep import CharityPrepAPI

api = CharityPrepAPI('your-api-key')
org = api.organizations.get()`
      },
      note: 'SDKs coming soon - use REST API directly for now'
    },

    changelog: {
      'v1.0.0': {
        date: '2024-01-01',
        changes: [
          'Initial API release',
          'Organizations endpoint',
          'Compliance data endpoints',
          'Rate limiting',
          'API key authentication'
        ]
      }
    }
  }

  if (format === 'html') {
    // Return HTML documentation
    const html = generateHtmlDocs(documentation)
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    })
  }

  return NextResponse.json({
    success: true,
    data: documentation,
    timestamp: new Date().toISOString()
  })
}

function generateHtmlDocs(docs: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${docs.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #7f8c8d; }
        code { background: #f8f9fa; padding: 2px 6px; border-radius: 3px; font-family: 'Monaco', 'Consolas', monospace; }
        pre { background: #2d3748; color: #e2e8f0; padding: 20px; border-radius: 6px; overflow-x: auto; }
        .endpoint { background: #f8f9fa; border-left: 4px solid #3498db; padding: 15px; margin: 15px 0; }
        .method { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; margin-right: 10px; }
        .get { background: #27ae60; }
        .post { background: #f39c12; }
        .put { background: #8e44ad; }
        .delete { background: #e74c3c; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #f8f9fa; }
        .toc { background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px; }
        .toc ul { list-style: none; padding-left: 20px; }
        .toc a { color: #3498db; text-decoration: none; }
        .toc a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${docs.title}</h1>
        <p><strong>Version:</strong> ${docs.version}</p>
        <p>${docs.description}</p>
        <p><strong>Base URL:</strong> <code>${docs.base_url}</code></p>

        <div class="toc">
            <h3>Table of Contents</h3>
            <ul>
                <li><a href="#authentication">Authentication</a></li>
                <li><a href="#rate-limiting">Rate Limiting</a></li>
                <li><a href="#endpoints">Endpoints</a></li>
                <li><a href="#errors">Error Codes</a></li>
                <li><a href="#getting-started">Getting Started</a></li>
            </ul>
        </div>

        <h2 id="authentication">Authentication</h2>
        <p>${docs.authentication.type} authentication is required for most endpoints.</p>
        <h3>Methods:</h3>
        <ul>
            ${docs.authentication.methods.map((method: any) => `
                <li><strong>${method.type}:</strong> ${method.description}
                    <br><code>${method.example}</code>
                </li>
            `).join('')}
        </ul>
        <p><em>Note: ${docs.authentication.note}</em></p>

        <h2 id="rate-limiting">Rate Limiting</h2>
        <p>${docs.rate_limiting.description}</p>
        <p><strong>Window:</strong> ${docs.rate_limiting.window}</p>
        <table>
            <tr><th>Plan</th><th>Requests per Window</th></tr>
            ${Object.entries(docs.rate_limiting.limits).map(([plan, limit]) => `
                <tr><td>${plan}</td><td>${limit}</td></tr>
            `).join('')}
        </table>

        <h2 id="endpoints">Endpoints</h2>
        ${Object.entries(docs.endpoints).map(([name, endpoint]: [string, any]) => `
            <div class="endpoint">
                <h3>${endpoint.path}</h3>
                <div>
                    ${endpoint.methods.map((method: string) => `<span class="method ${method.toLowerCase()}">${method}</span>`).join('')}
                    ${endpoint.auth_required ? '<span style="color: #e74c3c; font-weight: bold;">AUTH REQUIRED</span>' : ''}
                </div>
                <p>${endpoint.description}</p>
                ${endpoint.example ? `
                    <h4>Example:</h4>
                    <pre><code>${endpoint.example.request}</code></pre>
                    <pre><code>${JSON.stringify(endpoint.example.response, null, 2)}</code></pre>
                ` : ''}
            </div>
        `).join('')}

        <h2 id="errors">Error Codes</h2>
        <table>
            <tr><th>Code</th><th>Description</th></tr>
            ${Object.entries(docs.error_codes).map(([code, description]) => `
                <tr><td><code>${code}</code></td><td>${description}</td></tr>
            `).join('')}
        </table>

        <h2 id="getting-started">Getting Started</h2>
        <ol>
            ${docs.getting_started.steps.map((step: string) => `<li>${step}</li>`).join('')}
        </ol>
        <h3>Example cURL Request:</h3>
        <pre><code>${docs.getting_started.example_curl}</code></pre>

        <hr style="margin: 40px 0;">
        <p style="text-align: center; color: #7f8c8d;">
            Generated on ${new Date().toISOString()} | 
            <a href="?format=json" style="color: #3498db;">View as JSON</a>
        </p>
    </div>
</body>
</html>`
}