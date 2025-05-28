'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CustomCalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  modifiers?: {
    hasDeadlines?: (date: Date) => boolean
    overdue?: (date: Date) => boolean
    upcoming?: (date: Date) => boolean
  }
  className?: string
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function CustomCalendar({ selected, onSelect, modifiers, className }: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(() => selected || new Date())
  
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()
  
  // Get previous month's last days
  const prevMonth = new Date(currentYear, currentMonth, 0)
  const daysInPrevMonth = prevMonth.getDate()
  
  // Calculate calendar grid
  const calendarDays: (Date | null)[] = []
  
  // Previous month's trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push(new Date(currentYear, currentMonth - 1, daysInPrevMonth - i))
  }
  
  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentYear, currentMonth, day))
  }
  
  // Next month's leading days
  const remainingCells = 42 - calendarDays.length // 6 rows × 7 days
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push(new Date(currentYear, currentMonth + 1, day))
  }
  
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }
  
  const isSelected = (date: Date) => {
    return selected && date.toDateString() === selected.toDateString()
  }
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth
  }
  
  const handleDateClick = (date: Date) => {
    if (onSelect) {
      onSelect(date)
    }
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }
  
  const getDayModifiers = (date: Date) => {
    if (!modifiers) return {}
    
    return {
      hasDeadlines: modifiers.hasDeadlines?.(date) || false,
      overdue: modifiers.overdue?.(date) || false,
      upcoming: modifiers.upcoming?.(date) || false,
    }
  }
  
  // Split days into weeks (7 days each)
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }
  
  return (
    <div className={cn('w-full', className)}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-lg font-semibold text-gray-900">
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Calendar Grid */}
      <div className="w-full">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {DAYS.map((day) => (
            <div
              key={day}
              className="h-10 flex items-center justify-center text-sm font-medium text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar weeks */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-0">
              {week.map((date, dayIndex) => {
                if (!date) return <div key={dayIndex} className="h-10" />
                
                const dayModifiers = getDayModifiers(date)
                const isCurrentMonthDay = isCurrentMonth(date)
                const isTodayDay = isToday(date)
                const isSelectedDay = isSelected(date)
                
                return (
                  <div key={dayIndex} className="h-10 flex items-center justify-center">
                    <button
                      onClick={() => handleDateClick(date)}
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all duration-200',
                        'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        {
                          // Current month styling
                          'text-gray-900 font-medium': isCurrentMonthDay,
                          'text-gray-400': !isCurrentMonthDay,
                          
                          // Today styling
                          'bg-gray-100 font-semibold': isTodayDay && !isSelectedDay,
                          
                          // Selected styling
                          'bg-blue-600 text-white font-semibold hover:bg-blue-700': isSelectedDay,
                          
                          // Deadline modifiers
                          'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100': 
                            dayModifiers.overdue && isCurrentMonthDay && !isSelectedDay,
                          'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100': 
                            dayModifiers.upcoming && isCurrentMonthDay && !isSelectedDay,
                          'font-bold': dayModifiers.hasDeadlines && isCurrentMonthDay,
                        }
                      )}
                    >
                      {date.getDate()}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}