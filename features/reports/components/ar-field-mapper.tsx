'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { ARFieldMapping } from '../services/ar-field-mapper'

interface ARFieldMapperProps {
  fieldMappings: ARFieldMapping[]
  selectedField: string | null
  onFieldSelect: (fieldId: string) => void
}

export function ARFieldMapper({ fieldMappings, selectedField, onFieldSelect }: ARFieldMapperProps) {
  // Group fields by section for the form view
  const fieldsBySection = fieldMappings.reduce((acc, field) => {
    if (!acc[field.section]) {
      acc[field.section] = []
    }
    acc[field.section].push(field)
    return acc
  }, {} as Record<string, ARFieldMapping[]>)

  const getFieldStatus = (field: ARFieldMapping) => {
    if (!field.required) return 'optional'
    if (field.value === null || field.value === undefined || field.value === '') return 'missing'
    return 'complete'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Form Preview */}
      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="text-center mb-4">
          <h3 className="font-semibold text-lg">Charity Commission Annual Return</h3>
          <p className="text-sm text-muted-foreground">Form Preview</p>
        </div>

        <div className="space-y-6">
          {Object.entries(fieldsBySection).map(([section, fields]) => (
            <div key={section} className="space-y-3">
              <h4 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
                {section}
              </h4>
              
              <div className="space-y-2">
                {fields.map(field => {
                  const status = getFieldStatus(field)
                  const isSelected = selectedField === field.fieldId
                  
                  return (
                    <div
                      key={field.fieldId}
                      className={`p-3 border rounded-md cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/10 shadow-sm' 
                          : 'hover:border-gray-300 hover:bg-muted/50'
                      }`}
                      onClick={() => onFieldSelect(field.fieldId)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status)}
                            <span className="text-sm font-medium">{field.fieldName}</span>
                            <span className="text-xs text-muted-foreground">({field.fieldId})</span>
                          </div>
                          
                          {/* Show value preview */}
                          {field.value !== null && field.value !== undefined && field.value !== '' && (
                            <div className="mt-1 text-xs text-muted-foreground truncate max-w-full">
                              {field.value.toString()}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {field.required && (
                            <Badge variant={status === 'missing' ? 'destructive' : 'secondary'} className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Connection Lines (when field is selected) */}
      {selectedField && (
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/30" />
          <div className="text-center py-2">
            <Badge variant="outline" className="bg-background">
              Field Mapped
            </Badge>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {fieldMappings.filter(f => getFieldStatus(f) === 'complete').length}
            </div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {fieldMappings.filter(f => getFieldStatus(f) === 'missing').length}
            </div>
            <div className="text-xs text-muted-foreground">Missing</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {fieldMappings.filter(f => !f.required).length}
            </div>
            <div className="text-xs text-muted-foreground">Optional</div>
          </div>
        </div>
      </Card>
    </div>
  )
}