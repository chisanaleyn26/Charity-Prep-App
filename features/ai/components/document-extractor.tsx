'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Upload, 
  FileImage,
  FileText,
  Camera,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react'
import { processDocument } from '../services/document-processor'
import { toast } from 'sonner'
import type { ExtractionResult, ExtractionField } from '../types/extraction'

interface DocumentExtractorProps {
  onExtractComplete?: (data: any) => void
  allowedTypes?: string[]
  documentType?: string
}

export function DocumentExtractor({ 
  onExtractComplete,
  allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  documentType
}: DocumentExtractorProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [selectedField, setSelectedField] = useState<string | null>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('File type not supported')
      return
    }
    
    setFile(selectedFile)
    setResult(null)
    
    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }, [allowedTypes])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (!droppedFile) return
    
    if (!allowedTypes.includes(droppedFile.type)) {
      toast.error('File type not supported')
      return
    }
    
    setFile(droppedFile)
    setResult(null)
    
    if (droppedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(droppedFile)
    }
  }, [allowedTypes])

  const handleExtract = async () => {
    if (!file) return
    
    setExtracting(true)
    setProgress(0)
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)
      
      const result = await processDocument(file, documentType)
      
      clearInterval(progressInterval)
      setProgress(100)
      
      if (result.status === 'success' && result.extractions[0]) {
        setResult(result.extractions[0])
        if (result.extractions[0].success) {
          toast.success('Document extracted successfully!')
          onExtractComplete?.(result.extractions[0].data)
        } else {
          toast.error('Extraction failed: ' + result.extractions[0].error)
        }
      } else {
        toast.error('Failed to process document')
      }
    } catch (error) {
      console.error('Extraction error:', error)
      toast.error('Failed to extract document')
    } finally {
      setExtracting(false)
      setProgress(0)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getFieldHighlight = (field: ExtractionField) => {
    if (!field.location) return null
    
    const { x, y, width, height } = field.location
    return {
      position: 'absolute' as const,
      left: `${x}%`,
      top: `${y}%`,
      width: `${width}%`,
      height: `${height}%`,
      border: '2px solid',
      borderColor: selectedField === field.field_name ? '#B1FA63' : 'transparent',
      backgroundColor: selectedField === field.field_name ? 'rgba(177, 250, 99, 0.2)' : 'transparent',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Document Upload
          </CardTitle>
          <CardDescription>
            Upload a document to extract data automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <input
                type="file"
                id="file-upload"
                className="sr-only"
                accept={allowedTypes.join(',')}
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400 group-hover:text-primary transition-colors" />
                <p className="text-sm font-medium mb-1 group-hover:text-primary transition-colors">
                  Drop your document here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: JPEG, PNG, PDF
                </p>
              </label>
            </div>
          ) : (
            <>
              {/* File Info */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setFile(null)
                    setPreview(null)
                    setResult(null)
                  }}
                >
                  Remove
                </Button>
              </div>

              {/* Document Preview */}
              {preview && (
                <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setZoom(z => Math.max(50, z - 10))}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setZoom(z => Math.min(200, z + 10))}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setRotation(r => (r + 90) % 360)}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <div 
                    className="relative overflow-auto max-h-[400px] p-4"
                    style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
                  >
                    <img 
                      src={preview} 
                      alt="Document preview" 
                      className="max-w-full h-auto"
                    />
                    {/* Field highlights */}
                    {result?.fields?.map((field, idx) => (
                      <div
                        key={idx}
                        style={getFieldHighlight(field) || {}}
                        onClick={() => setSelectedField(field.field_name)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Extract Button */}
              <Button
                onClick={handleExtract}
                disabled={extracting}
                className="w-full"
              >
                {extracting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting... {progress}%
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Extract with AI
                  </>
                )}
              </Button>

              {extracting && (
                <Progress value={progress} className="h-2" />
              )}
            </>
          )}

          {/* Quick Capture */}
          <div className="flex items-center justify-center">
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Use Camera
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Extraction Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Extracted Data
            </span>
            {result && (
              <Badge className={getConfidenceColor(result.confidence)}>
                {Math.round(result.confidence * 100)}% Confident
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            AI-extracted information from your document
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!result ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Upload a document to see extracted data</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {result.success ? (
                  result.fields?.map((field, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedField === field.field_name
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedField(field.field_name)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <label className="text-sm font-medium">
                          {field.field_name.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </label>
                        <Badge 
                          variant="outline" 
                          className={getConfidenceColor(field.confidence)}
                        >
                          {Math.round(field.confidence * 100)}%
                        </Badge>
                      </div>
                      <div className="text-sm">
                        {field.value || '-'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500 opacity-50" />
                    <p className="text-red-600">{result.error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => setResult(null)}
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}