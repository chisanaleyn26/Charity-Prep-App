'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Upload, FileText, Calendar, Tag, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { createDocument } from '../services/documents'
import type { CreateDocumentInput } from '../types/documents'

interface DocumentUploadFormProps {
  onSuccess: () => void
}

interface FormData {
  file: FileList
  document_type: 'policy' | 'certificate' | 'report' | 'form' | 'other'
  category: string
  description: string
  expires_at: string
  is_public: boolean
  tags: string
}

export function DocumentUploadForm({ onSuccess }: DocumentUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [enableOcr, setEnableOcr] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>()

  const selectedFile = watch('file')?.[0]

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      const newTags = [...tags, currentTag.trim()]
      setTags(newTags)
      setValue('tags', newTags.join(','))
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove)
    setTags(newTags)
    setValue('tags', newTags.join(','))
  }

  const onSubmit = async (data: FormData) => {
    if (!selectedFile) {
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const supabase = createClient()
      
      // Generate unique file path
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `documents/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      setUploadProgress(50)

      // Get the public URL for OCR processing if it's an image or PDF
      let extractedData = null
      const isImageOrPDF = selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf'
      
      if (isImageOrPDF && enableOcr) {
        try {
          setUploadProgress(60)
          const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath)

          if (urlData?.publicUrl) {
            // Determine document type for OCR
            let ocrDocumentType = 'general'
            if (data.document_type === 'certificate' && data.category === 'Safeguarding') {
              ocrDocumentType = 'dbs_certificate'
            } else if (data.document_type === 'receipt' || data.category === 'Financial') {
              ocrDocumentType = 'receipt'
            }

            // Process with OCR
            const { extractFromImage } = await import('@/features/ai/services/document-ocr')
            const ocrResult = await extractFromImage(urlData.publicUrl, ocrDocumentType)
            
            if (ocrResult.success && ocrResult.data) {
              extractedData = ocrResult.data
              
              // Auto-populate description if empty
              if (!data.description && extractedData) {
                if (ocrDocumentType === 'dbs_certificate' && extractedData.person_name) {
                  data.description = `DBS Certificate for ${extractedData.person_name}`
                } else if (ocrDocumentType === 'receipt' && extractedData.vendor_name) {
                  data.description = `Receipt from ${extractedData.vendor_name} - £${extractedData.amount}`
                }
              }
            }
          }
        } catch (ocrError) {
          console.error('OCR processing failed:', ocrError)
          // Continue without OCR data
        }
      }

      setUploadProgress(80)

      // Create document record
      const documentInput: CreateDocumentInput = {
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
        storage_path: filePath,
        document_type: data.document_type,
        category: data.category || undefined,
        description: data.description || undefined,
        tags: tags.length > 0 ? tags : undefined,
        expires_at: data.expires_at || undefined,
        is_public: data.is_public || false,
        extracted_data: extractedData || undefined
      }

      await createDocument(documentInput)
      setUploadProgress(100)

      // Success
      onSuccess()
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const documentTypes = [
    { value: 'policy', label: 'Policy' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'report', label: 'Report' },
    { value: 'form', label: 'Form' },
    { value: 'other', label: 'Other' }
  ]

  const categories = [
    'Safeguarding',
    'Financial',
    'Legal',
    'HR',
    'Operations',
    'Fundraising',
    'Governance'
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* File Upload */}
      <div className="space-y-2">
        <Label htmlFor="file" className="text-sm font-semibold text-gray-900 tracking-wide">
          Document File *
        </Label>
        <div className="relative">
          <Input
            id="file"
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            {...register('file', { required: 'Please select a file' })}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 border-gray-200 rounded-xl"
          />
          {selectedFile && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>{selectedFile.name}</span>
              <span className="text-gray-400">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
        </div>
        {errors.file && (
          <p className="text-sm text-red-600 font-medium">{errors.file.message}</p>
        )}
      </div>

      {/* Document Type */}
      <div className="space-y-2">
        <Label htmlFor="document_type" className="text-sm font-semibold text-gray-900 tracking-wide">
          Document Type *
        </Label>
        <Select onValueChange={(value) => setValue('document_type', value as any)}>
          <SelectTrigger className="border-gray-200 rounded-xl">
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            {documentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.document_type && (
          <p className="text-sm text-red-600 font-medium">{errors.document_type.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-semibold text-gray-900 tracking-wide">
          Category
        </Label>
        <Select onValueChange={(value) => setValue('category', value)}>
          <SelectTrigger className="border-gray-200 rounded-xl">
            <SelectValue placeholder="Select category (optional)" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold text-gray-900 tracking-wide">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Brief description of the document"
          {...register('description')}
          className="border-gray-200 rounded-xl min-h-[80px] resize-none"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-900 tracking-wide">
          Tags
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="border-gray-200 rounded-xl"
          />
          <Button
            type="button"
            onClick={addTag}
            variant="outline"
            className="border-gray-200 rounded-xl"
          >
            <Tag className="h-4 w-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-gray-50 text-gray-700 border-gray-200 cursor-pointer"
                onClick={() => removeTag(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Expiry Date */}
      <div className="space-y-2">
        <Label htmlFor="expires_at" className="text-sm font-semibold text-gray-900 tracking-wide">
          Expiry Date (Optional)
        </Label>
        <Input
          id="expires_at"
          type="date"
          {...register('expires_at')}
          className="border-gray-200 rounded-xl"
        />
      </div>

      {/* Public Toggle */}
      <div className="flex items-center space-x-2">
        <input
          id="is_public"
          type="checkbox"
          {...register('is_public')}
          className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
        />
        <Label htmlFor="is_public" className="text-sm font-medium text-gray-900">
          Make this document publicly accessible
        </Label>
      </div>

      {/* OCR Toggle */}
      {selectedFile && (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf') && (
        <div className="flex items-center space-x-2">
          <input
            id="enable_ocr"
            type="checkbox"
            checked={enableOcr}
            onChange={(e) => setEnableOcr(e.target.checked)}
            className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
          />
          <Label htmlFor="enable_ocr" className="text-sm font-medium text-gray-900">
            Extract text and data using AI (OCR)
          </Label>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="submit"
          disabled={isUploading || !selectedFile}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-800 transition-all duration-300 px-6 py-2 rounded-xl border border-gray-200"
        >
          {isUploading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </>
          )}
        </Button>
      </div>
    </form>
  )
}