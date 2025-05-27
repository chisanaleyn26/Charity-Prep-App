import { BoardPackData } from './template-service'

// Simple PDF generation using browser APIs
// In production, you might use @react-pdf/renderer or similar
export async function generatePDF(boardPackData: BoardPackData): Promise<Blob> {
  // Create HTML content
  const htmlContent = generateHTMLContent(boardPackData)
  
  // Convert HTML to PDF using browser print functionality
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('Failed to open print window')
  }
  
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  
  // Wait for content to load
  await new Promise(resolve => {
    printWindow.onload = resolve
  })
  
  // Trigger print dialog
  printWindow.print()
  
  // For now, we'll return a mock blob
  // In production, you'd use a proper PDF library
  const pdfContent = `Mock PDF Content for ${boardPackData.organization.name}`
  return new Blob([pdfContent], { type: 'application/pdf' })
}

function generateHTMLContent(boardPackData: BoardPackData): string {
  const { organization, date, sections } = boardPackData
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Board Pack - ${organization.name}</title>
  <style>
    @media print {
      body { margin: 0; }
      .page-break { page-break-after: always; }
    }
    
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #333;
    }
    
    .header h1 {
      margin: 0;
      color: #243837;
      font-size: 28px;
    }
    
    .header .subtitle {
      color: #666;
      margin-top: 10px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section h2 {
      color: #243837;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    
    .narrative {
      text-align: justify;
      white-space: pre-wrap;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    
    .compliance-score {
      text-align: center;
      margin: 20px 0;
    }
    
    .compliance-score .score {
      font-size: 48px;
      font-weight: bold;
      color: #B1FA63;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${organization.name}</h1>
    <div class="subtitle">
      Board Pack for ${new Date(date).toLocaleDateString('en-GB', { 
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}
    </div>
    <div class="subtitle">
      Charity Number: ${organization.charityNumber}
    </div>
  </div>
  
  ${sections.map(section => renderSection(section)).join('')}
  
  <div class="footer">
    <p>Generated on ${new Date().toLocaleDateString('en-GB')} by Charity Prep</p>
    <p>© ${new Date().getFullYear()} ${organization.name}. All rights reserved.</p>
  </div>
</body>
</html>
  `
}

function renderSection(section: any): string {
  let content = ''
  
  switch (section.type) {
    case 'narrative':
      content = `<div class="narrative">${section.content || 'No content available'}</div>`
      break
      
    case 'data':
      if (section.id === 'compliance-status' && section.content) {
        content = `
          <div class="compliance-score">
            <div class="score">${section.content.overall_score || 0}%</div>
            <div>Compliance Score</div>
          </div>
        `
      } else {
        content = `<pre>${JSON.stringify(section.content, null, 2)}</pre>`
      }
      break
      
    case 'table':
      if (Array.isArray(section.content) && section.content.length > 0) {
        if (section.id === 'safeguarding-summary') {
          content = `
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>DBS Number</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                ${section.content.slice(0, 10).map((record: any) => `
                  <tr>
                    <td>${record.person_name}</td>
                    <td>${record.role_title}</td>
                    <td>${record.dbs_certificate_number}</td>
                    <td>${new Date(record.expiry_date).toLocaleDateString('en-GB')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `
        } else {
          content = `<p>Table data available but not formatted</p>`
        }
      } else {
        content = `<p>No data available</p>`
      }
      break
      
    case 'chart':
      // For HTML/Print version, we'll show a simple data summary
      if (section.content) {
        content = `<p>Chart data: ${JSON.stringify(section.content, null, 2)}</p>`
      } else {
        content = `<p>No chart data available</p>`
      }
      break
      
    default:
      content = `<p>Section type "${section.type}" not supported</p>`
  }
  
  return `
    <div class="section">
      <h2>${section.title}</h2>
      ${content}
    </div>
    ${section.order % 3 === 0 ? '<div class="page-break"></div>' : ''}
  `
}