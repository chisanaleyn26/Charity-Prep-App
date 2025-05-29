'use client'

import { useState, useEffect } from 'react'
import { X, Download, ExternalLink, FileText, Image, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { getDocumentDownloadUrl } from '../services/documents'
import type { Document } from '../types/documents'

interface DocumentViewerProps {
  document: Document | null
  open: boolean
  onClose: () => void
}

export function DocumentViewer({ document, open, onClose }: DocumentViewerProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (document && open) {
      loadDocumentUrl()
    } else {
      setDownloadUrl(null)
      setError(null)
    }
  }, [document, open])

  const loadDocumentUrl = async () => {
    if (!document) return
    
    setLoading(true)
    setError(null)
    
    try {
      const url = await getDocumentDownloadUrl(document.storage_path)
      setDownloadUrl(url)
    } catch (error) {
      console.error('Failed to get document URL:', error)
      setError('Failed to load document')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (downloadUrl && document) {
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = document.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleOpenInNewTab = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank')
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return Image
    } else if (mimeType === 'application/pdf') {
      return FileText
    } else {
      return File
    }
  }

  const canPreview = (mimeType: string) => {
    return mimeType.startsWith('image/') || mimeType === 'application/pdf'
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!document) return null

  const FileIcon = getFileIcon(document.mime_type)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="pr-12">
            <DialogTitle className="text-lg font-semibold text-gray-900 truncate">
              {document.file_name}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="bg-gray-50">
                {document.document_type}
              </Badge>
              {document.category && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {document.category}
                </Badge>
              )}
              <span className="text-sm text-gray-500">
                {formatFileSize(document.file_size)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!downloadUrl}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                disabled={!downloadUrl}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 mt-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 animate-pulse" />
                <p className="text-gray-600">Loading document...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileIcon className="h-16 w-16 mx-auto mb-4 text-red-300" />
                <p className="text-red-600 font-medium mb-2">Failed to load document</p>
                <p className="text-gray-600 text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadDocumentUrl}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : downloadUrl && canPreview(document.mime_type) ? (
            <div className="h-full">
              {document.mime_type.startsWith('image/') ? (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <img
                    src={downloadUrl}
                    alt={document.file_name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : document.mime_type === 'application/pdf' ? (
                <iframe
                  src={downloadUrl}
                  className="w-full h-full border-0 rounded-lg"
                  title={document.file_name}
                />
              ) : null}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium mb-2">Preview not available</p>
                <p className="text-gray-500 text-sm mb-4">
                  This file type cannot be previewed in the browser
                </p>
                <Button
                  onClick={handleDownload}
                  disabled={!downloadUrl}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download to view
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Document Metadata */}
        <div className="flex-shrink-0 border-t pt-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Type:</span>
              <p className="font-medium">{document.mime_type}</p>
            </div>
            <div>
              <span className="text-gray-500">Uploaded:</span>
              <p className="font-medium">{formatDate(document.created_at)}</p>
            </div>
            {document.expires_at && (
              <div>
                <span className="text-gray-500">Expires:</span>
                <p className="font-medium">{formatDate(document.expires_at)}</p>
              </div>
            )}
            {document.is_public && (
              <div>
                <span className="text-gray-500">Visibility:</span>
                <p className="font-medium text-green-600">Public</p>
              </div>
            )}
          </div>
          
          {document.description && (
            <div className="mt-4">
              <span className="text-gray-500 text-sm">Description:</span>
              <p className="font-medium mt-1">{document.description}</p>
            </div>
          )}
          
          {document.tags && document.tags.length > 0 && (
            <div className="mt-4">
              <span className="text-gray-500 text-sm">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {document.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {document.extracted_data && (
            <div className="mt-4">
              <span className="text-gray-500 text-sm">Extracted Data:</span>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(document.extracted_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}