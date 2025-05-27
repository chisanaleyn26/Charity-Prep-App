/**
 * Common error handler for API responses
 */
export function handleApiError(error: any): { error: string } {
  console.error('API Error:', error)
  
  if (error.code === 'PGRST301') {
    return { error: 'You do not have permission to perform this action' }
  }
  
  if (error.code === '23505') {
    return { error: 'This record already exists' }
  }
  
  if (error.code === '23503') {
    return { error: 'Cannot delete record as it is referenced by other data' }
  }
  
  return { error: error.message || 'An unexpected error occurred' }
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Calculate days until a date
 */
export function daysUntil(date: string | Date): number {
  const target = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  
  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Get current financial year based on organization's year end
 */
export function getCurrentFinancialYear(yearEnd: string): number {
  const today = new Date()
  const currentYear = today.getFullYear()
  
  // Parse month and day from MM-DD format
  const [endMonth, endDay] = yearEnd.split('-').map(Number)
  const yearEndDate = new Date(currentYear, endMonth - 1, endDay)
  
  // If we're past the year end date, we're in the next financial year
  if (today > yearEndDate) {
    return currentYear + 1
  }
  
  return currentYear
}