import { ExportFormat, ExportColumn } from '../types/export'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export async function formatExportData(
  data: any[],
  format: ExportFormat,
  columns?: ExportColumn[]
): Promise<any> {
  switch (format) {
    case 'csv':
      return formatToCSV(data, columns)
    case 'excel':
      return formatToExcel(data, columns)
    case 'json':
      return formatToJSON(data, columns)
    case 'pdf':
      return formatToPDF(data, columns)
    case 'xml':
      return formatToXML(data, columns)
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

function applyColumnTransform(value: any, transform?: string): string {
  if (value === null || value === undefined) return ''

  switch (transform) {
    case 'uppercase':
      return String(value).toUpperCase()
    case 'lowercase':
      return String(value).toLowerCase()
    case 'capitalize':
      return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase()
    case 'currency':
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP'
      }).format(Number(value))
    case 'percentage':
      return `${Number(value).toFixed(2)}%`
    default:
      return String(value)
  }
}

function formatValue(value: any, type: string, format?: string): any {
  if (value === null || value === undefined) return ''

  switch (type) {
    case 'date':
      const date = new Date(value)
      if (format) {
        // Simple date formatting
        return format
          .replace('YYYY', date.getFullYear().toString())
          .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
          .replace('DD', date.getDate().toString().padStart(2, '0'))
      }
      return date.toLocaleDateString('en-GB')
    
    case 'number':
      return Number(value)
    
    case 'boolean':
      return value ? 'Yes' : 'No'
    
    default:
      return String(value)
  }
}

function processData(data: any[], columns?: ExportColumn[]): any[] {
  if (!columns || columns.length === 0) {
    return data
  }

  // Filter and sort columns
  const activeColumns = columns
    .filter(col => col.visible)
    .sort((a, b) => a.order - b.order)

  return data.map(row => {
    const processedRow: any = {}
    
    activeColumns.forEach(col => {
      let value = row[col.field]
      value = formatValue(value, col.type, col.format)
      value = applyColumnTransform(value, col.transform)
      processedRow[col.label || col.field] = value
    })
    
    return processedRow
  })
}

function formatToCSV(data: any[], columns?: ExportColumn[]): string {
  const processedData = processData(data, columns)
  
  if (processedData.length === 0) return ''

  const headers = Object.keys(processedData[0])
  const rows = processedData.map(row => 
    headers.map(header => {
      const value = row[header]
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""')
      return escaped.includes(',') ? `"${escaped}"` : escaped
    }).join(',')
  )

  return [headers.join(','), ...rows].join('\n')
}

function formatToExcel(data: any[], columns?: ExportColumn[]): ArrayBuffer {
  const processedData = processData(data, columns)
  
  const ws = XLSX.utils.json_to_sheet(processedData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Export')

  // Auto-size columns
  const colWidths = columns?.filter(c => c.visible).map(c => ({ wch: c.width || 15 }))
  if (colWidths) {
    ws['!cols'] = colWidths
  }

  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
}

function formatToJSON(data: any[], columns?: ExportColumn[]): string {
  const processedData = processData(data, columns)
  return JSON.stringify(processedData, null, 2)
}

function formatToPDF(data: any[], columns?: ExportColumn[]): Blob {
  const processedData = processData(data, columns)
  
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(18)
  doc.text('Data Export', 14, 20)
  
  // Add timestamp
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 14, 30)
  
  if (processedData.length > 0) {
    const headers = Object.keys(processedData[0])
    const rows = processedData.map(row => headers.map(h => row[h]))
    
    // Add table
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] }
    })
  }
  
  return doc.output('blob')
}

function formatToXML(data: any[], columns?: ExportColumn[]): string {
  const processedData = processData(data, columns)
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<export>\n'
  
  processedData.forEach((row, index) => {
    xml += `  <record id="${index + 1}">\n`
    
    Object.entries(row).forEach(([key, value]) => {
      const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_')
      const safeValue = String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
      
      xml += `    <${safeKey}>${safeValue}</${safeKey}>\n`
    })
    
    xml += '  </record>\n'
  })
  
  xml += '</export>'
  
  return xml
}

// Create download blob
export function createDownloadBlob(
  data: any,
  format: ExportFormat
): { blob: Blob; mimeType: string } {
  let blob: Blob
  let mimeType: string

  switch (format) {
    case 'csv':
      blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
      mimeType = 'text/csv'
      break
    
    case 'excel':
      blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      break
    
    case 'json':
      blob = new Blob([data], { type: 'application/json;charset=utf-8;' })
      mimeType = 'application/json'
      break
    
    case 'pdf':
      blob = data // Already a blob
      mimeType = 'application/pdf'
      break
    
    case 'xml':
      blob = new Blob([data], { type: 'application/xml;charset=utf-8;' })
      mimeType = 'application/xml'
      break
    
    default:
      throw new Error(`Unsupported format: ${format}`)
  }

  return { blob, mimeType }
}