'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import { getSuggestionForColumn, IMPORT_SCHEMAS, type ImportType } from '../services/column-mapper'
import type { CSVParseResult } from '../services/csv-parser'
import type { CSVColumnMapping } from '../types/extraction'

interface ColumnMapperProps {
  csvData: CSVParseResult
  mapping: CSVColumnMapping
  importType: ImportType
  onMappingChange: (mapping: CSVColumnMapping) => void
  onComplete: (mapping: CSVColumnMapping) => void
}

export function ColumnMapper({
  csvData,
  mapping,
  importType,
  onMappingChange,
  onComplete
}: ColumnMapperProps) {
  const [localMapping, setLocalMapping] = useState(mapping)
  const [suggesting, setSuggesting] = useState<string | null>(null)

  const schema = IMPORT_SCHEMAS[importType]
  const requiredFields = Object.entries(schema.fields)
    .filter(([, info]) => info.required)
    .map(([field]) => field)

  const handleFieldChange = (targetField: string, csvColumn: string | null) => {
    const updatedMapping: CSVColumnMapping = {
      ...localMapping,
      mappings: {
        ...localMapping.mappings,
        [targetField]: {
          csv_column: csvColumn,
          confidence: csvColumn ? 0.9 : 0, // User-selected mappings have high confidence
          reason: csvColumn ? 'User selected' : 'No column selected'
        }
      }
    }
    
    // Update unmapped columns
    const mappedColumns = Object.values(updatedMapping.mappings)
      .map(m => m.csv_column)
      .filter(Boolean) as string[]
    
    updatedMapping.unmapped_columns = csvData.headers.filter(
      h => !mappedColumns.includes(h)
    )
    
    // Update missing required
    updatedMapping.missing_required = requiredFields.filter(
      field => !updatedMapping.mappings[field]?.csv_column
    )
    
    setLocalMapping(updatedMapping)
    onMappingChange(updatedMapping)
  }

  const handleGetSuggestion = async (targetField: string) => {
    setSuggesting(targetField)
    try {
      const suggestion = await getSuggestionForColumn(
        targetField,
        csvData.rows.slice(0, 5).map(row => row[targetField]),
        localMapping.unmapped_columns
      )
      
      if (suggestion) {
        handleFieldChange(targetField, suggestion)
        toast.success(`AI suggested: ${suggestion}`)
      } else {
        toast.info('No suggestion available')
      }
    } catch (error) {
      toast.error('Failed to get suggestion')
    } finally {
      setSuggesting(null)
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <Badge className="bg-green-100 text-green-800">High</Badge>
    } else if (confidence >= 0.5) {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
    } else if (confidence > 0) {
      return <Badge className="bg-red-100 text-red-800">Low</Badge>
    }
    return null
  }

  const isValidMapping = () => {
    return localMapping.missing_required.length === 0
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Map CSV Columns</CardTitle>
          <CardDescription>
            Match your CSV columns to the required fields. AI has suggested some mappings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {Object.entries(schema.fields).map(([targetField, fieldInfo]) => {
                const currentMapping = localMapping.mappings[targetField]
                const isRequired = fieldInfo.required
                
                return (
                  <div 
                    key={targetField} 
                    className={`p-4 border rounded-lg ${
                      isRequired && !currentMapping?.csv_column
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Field Info */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {targetField.split('_').map(w => 
                                w.charAt(0).toUpperCase() + w.slice(1)
                              ).join(' ')}
                            </h4>
                            {isRequired && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                            {currentMapping?.confidence !== undefined && getConfidenceBadge(currentMapping.confidence)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {fieldInfo.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Type: {fieldInfo.type}
                          </p>
                        </div>
                        
                        {/* AI Suggestion Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleGetSuggestion(targetField)}
                          disabled={suggesting === targetField}
                        >
                          {suggesting === targetField ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Column Selector */}
                      <Select
                        value={currentMapping?.csv_column || ''}
                        onValueChange={(value) => handleFieldChange(targetField, value || null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a CSV column..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {csvData.headers.map((header) => {
                            const dataType = csvData.dataTypes[header]
                            const isUsed = Object.values(localMapping.mappings)
                              .some(m => m.csv_column === header && m.csv_column !== currentMapping?.csv_column)
                            
                            return (
                              <SelectItem 
                                key={header} 
                                value={header}
                                disabled={isUsed}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className={isUsed ? 'text-muted-foreground' : ''}>
                                    {header}
                                  </span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {dataType?.type || 'unknown'}
                                  </span>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      
                      {/* Sample Data */}
                      {currentMapping?.csv_column && (
                        <div className="bg-muted p-2 rounded text-xs">
                          <span className="font-medium">Sample values: </span>
                          {csvData.sampleData
                            .slice(0, 3)
                            .map(row => row[currentMapping.csv_column!])
                            .filter(Boolean)
                            .join(', ') || 'No data'}
                        </div>
                      )}
                      
                      {/* AI Reason */}
                      {currentMapping?.reason && currentMapping.reason !== 'User selected' && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Info className="h-3 w-3" />
                          {currentMapping.reason}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
          
          {/* Summary */}
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Mapped fields:</span>
              <span className="font-medium">
                {Object.values(localMapping.mappings).filter(m => m.csv_column).length} / {Object.keys(schema.fields).length}
              </span>
            </div>
            
            {localMapping.missing_required.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Missing required fields: {localMapping.missing_required.join(', ')}
                </span>
              </div>
            )}
            
            {localMapping.unmapped_columns.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Unmapped CSV columns: {localMapping.unmapped_columns.join(', ')}
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => onComplete(localMapping)}
              disabled={!isValidMapping()}
            >
              {isValidMapping() ? (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                'Map Required Fields First'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}