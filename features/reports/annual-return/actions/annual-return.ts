'use server'

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { fetchAnnualReturnData, getUserOrganization, formatAnnualReturnAsCSV } from '../services/annual-return.service';
import type { AnnualReturnData } from '../types/annual-return';

/**
 * Server Actions for Annual Return
 * These handle authentication, authorization, and call the service layer
 */

export async function generateAnnualReturnData(): Promise<{ success: boolean; data?: AnnualReturnData; error?: string }> {
  try {
    const supabase = await createServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized - please log in' };
    }

    // Get user's organization
    const membership = await getUserOrganization(user.id);
    
    // Check permissions (viewer role can still view reports)
    if (!['admin', 'member', 'viewer'].includes(membership.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Fetch the data using the service
    const data = await fetchAnnualReturnData(membership.organizationId);

    // Revalidate the page cache
    revalidatePath('/reports/annual-return');

    return { success: true, data };
  } catch (error) {
    console.error('Failed to generate annual return data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate annual return data' 
    };
  }
}

export async function exportAnnualReturnData(format: 'csv' | 'json'): Promise<{ 
  success: boolean; 
  data?: string; 
  error?: string; 
  filename?: string; 
  mimeType?: string;
}> {
  try {
    const supabase = await createServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized - please log in' };
    }

    // Get user's organization
    const membership = await getUserOrganization(user.id);
    
    // Fetch the data
    const data = await fetchAnnualReturnData(membership.organizationId);
    
    const filename = `annual-return-${data.charityNumber}-${new Date().toISOString().split('T')[0]}`;

    if (format === 'json') {
      return {
        success: true,
        data: JSON.stringify(data, null, 2),
        filename: `${filename}.json`,
        mimeType: 'application/json'
      };
    }

    if (format === 'csv') {
      const csvContent = formatAnnualReturnAsCSV(data);
      return {
        success: true,
        data: csvContent,
        filename: `${filename}.csv`,
        mimeType: 'text/csv'
      };
    }

    return { success: false, error: 'Invalid format' };
  } catch (error) {
    console.error('Failed to export annual return data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to export data' 
    };
  }
}