/**
 * Export Service for Charity Prep
 * Handles data exports in multiple formats
 */

import { createClient } from '@/lib/supabase/server';

export type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  modules: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeArchived?: boolean;
  gdprCompliant?: boolean;
}

export interface ExportResult {
  success: boolean;
  format: ExportFormat;
  data?: string | Blob;
  filename: string;
  error?: string;
}

interface ModuleExportData {
  safeguarding?: any[];
  fundraising?: any[];
  overseas?: any[];
  documents?: any[];
  compliance_scores?: any[];
  income?: any[];
}

export async function exportComplianceData(
  organizationId: string,
  options: ExportOptions
): Promise<ExportResult> {
  try {
    const supabase = await createClient();
    
    // Fetch data for selected modules
    const data: ModuleExportData = {};
    
    for (const module of options.modules) {
      switch (module) {
        case 'safeguarding':
          const { data: safeguardingData } = await supabase
            .from('safeguarding')
            .select('*')
            .eq('organization_id', organizationId);
          data.safeguarding = safeguardingData || [];
          break;
          
        case 'fundraising':
          const { data: fundraisingData } = await supabase
            .from('fundraising_records')
            .select('*')
            .eq('organization_id', organizationId);
          data.fundraising = fundraisingData || [];
          break;
          
        case 'overseas':
          const { data: overseasData } = await supabase
            .from('overseas_activities')
            .select('*')
            .eq('organization_id', organizationId);
          data.overseas = overseasData || [];
          break;
          
        case 'documents':
          const { data: documentsData } = await supabase
            .from('documents')
            .select('*')
            .eq('organization_id', organizationId);
          data.documents = documentsData || [];
          break;
          
        case 'compliance':
          const { data: complianceData } = await supabase
            .from('compliance_scores')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .limit(12); // Last 12 months
          data.compliance_scores = complianceData || [];
          break;
          
        case 'income':
          const { data: incomeData } = await supabase
            .from('income_records')
            .select('*')
            .eq('organization_id', organizationId);
          data.income = incomeData || [];
          break;
      }
    }
    
    // Apply GDPR compliance if requested
    const processedData = options.gdprCompliant 
      ? applyGDPRCompliance(data)
      : data;
    
    // Generate export based on format
    switch (options.format) {
      case 'csv':
        return generateCSVExport(processedData, options);
      case 'json':
        return generateJSONExport(processedData, options);
      case 'excel':
        return generateExcelExport(processedData, options);
      case 'pdf':
        return generatePDFExport(processedData, options);
      default:
        throw new Error('Unsupported export format');
    }
  } catch (error) {
    return {
      success: false,
      format: options.format,
      filename: '',
      error: error instanceof Error ? error.message : 'Export failed'
    };
  }
}

function applyGDPRCompliance(data: ModuleExportData): ModuleExportData {
  const processed = { ...data };
  
  // Remove personal information
  if (processed.safeguarding) {
    processed.safeguarding = processed.safeguarding.map(record => ({
      ...record,
      staff_name: '[REDACTED]',
      staff_email: '[REDACTED]',
      notes: record.notes ? '[REDACTED]' : null
    }));
  }
  
  if (processed.fundraising) {
    processed.fundraising = processed.fundraising.map(record => ({
      ...record,
      contact_name: '[REDACTED]',
      contact_email: '[REDACTED]',
      donor_details: record.donor_details ? '[REDACTED]' : null
    }));
  }
  
  return processed;
}

function generateCSVExport(data: ModuleExportData, options: ExportOptions): ExportResult {
  let csv = '';
  const filename = `charity-prep-export-${new Date().toISOString().split('T')[0]}.csv`;
  
  // Process each module into CSV format
  for (const [module, records] of Object.entries(data)) {
    if (!records || records.length === 0) continue;
    
    csv += `\n${module.toUpperCase()}\n`;
    
    // Get headers from first record
    const headers = Object.keys(records[0]);
    csv += headers.join(',') + '\n';
    
    // Add data rows
    for (const record of records) {
      const values = headers.map(header => {
        const value = record[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csv += values.join(',') + '\n';
    }
  }
  
  return {
    success: true,
    format: 'csv',
    data: csv,
    filename
  };
}

function generateJSONExport(data: ModuleExportData, options: ExportOptions): ExportResult {
  const filename = `charity-prep-export-${new Date().toISOString().split('T')[0]}.json`;
  
  const exportData = {
    exportDate: new Date().toISOString(),
    organization: 'charity-prep-export',
    modules: options.modules,
    data
  };
  
  return {
    success: true,
    format: 'json',
    data: JSON.stringify(exportData, null, 2),
    filename
  };
}

function generateExcelExport(data: ModuleExportData, options: ExportOptions): ExportResult {
  // For MVP, we'll return CSV format that can be opened in Excel
  // In production, use a library like xlsx
  const csvResult = generateCSVExport(data, options);
  return {
    ...csvResult,
    format: 'excel',
    filename: csvResult.filename.replace('.csv', '.xlsx')
  };
}

function generatePDFExport(data: ModuleExportData, options: ExportOptions): ExportResult {
  const filename = `charity-prep-export-${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Simple HTML-based PDF (similar to board pack PDF)
  let html = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        h1 { color: #4C1D95; }
        h2 { color: #6B46C1; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .metadata { color: #666; font-size: 0.9em; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>Charity Prep Compliance Data Export</h1>
      <div class="metadata">
        <p>Export Date: ${new Date().toLocaleDateString()}</p>
        <p>Modules: ${options.modules.join(', ')}</p>
        ${options.gdprCompliant ? '<p>GDPR Compliant: Yes (Personal data redacted)</p>' : ''}
      </div>
  `;
  
  // Add each module's data
  for (const [module, records] of Object.entries(data)) {
    if (!records || records.length === 0) continue;
    
    html += `<h2>${module.charAt(0).toUpperCase() + module.slice(1).replace('_', ' ')}</h2>`;
    html += '<table>';
    
    // Headers
    const headers = Object.keys(records[0]);
    html += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    
    // Data rows
    for (const record of records) {
      html += '<tr>';
      for (const header of headers) {
        html += `<td>${record[header] || ''}</td>`;
      }
      html += '</tr>';
    }
    
    html += '</table>';
  }
  
  html += '</body></html>';
  
  return {
    success: true,
    format: 'pdf',
    data: html,
    filename
  };
}

// Scheduled export functionality
export interface ScheduledExport {
  id: string;
  organizationId: string;
  options: ExportOptions;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  lastRun?: Date;
  nextRun: Date;
}

export async function createScheduledExport(
  export_: Omit<ScheduledExport, 'id'>
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('scheduled_exports')
      .insert([{
        organization_id: export_.organizationId,
        options: export_.options,
        frequency: export_.frequency,
        recipients: export_.recipients,
        next_run: export_.nextRun
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, id: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create scheduled export'
    };
  }
}

export async function getScheduledExports(
  organizationId: string
): Promise<ScheduledExport[]> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('scheduled_exports')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  
  return data || [];
}