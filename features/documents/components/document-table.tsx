'use client'

import { useState } from 'react'
import { Download, Eye, Trash2, Calendar, FileText, MoreHorizontal, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ResponsiveTable, type TableColumn } from '@/components/ui/responsive-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteDocument, getDocumentDownloadUrl } from '../services/documents'
import { DocumentViewer } from './document-viewer'
import type { Document } from '../types/documents'

interface DocumentTableProps {
  documents: Document[]
  onDocumentUpdate: () => void
  getTypeColor: (type: string) => string
}

export function DocumentTable({ documents, onDocumentUpdate, getTypeColor }: DocumentTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewerDocument, setViewerDocument] = useState<Document | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  const handleDownload = async (document: Document) => {
    try {
      const downloadUrl = await getDocumentDownloadUrl(document.storage_path)
      window.open(downloadUrl, '_blank')
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download document. Please try again.')
    }
  }

  const handleView = (document: Document) => {
    setViewerDocument(document)
    setViewerOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return
    }

    setDeletingId(id)
    try {
      await deleteDocument(id)
      onDocumentUpdate()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete document. Please try again.')
    } finally {
      setDeletingId(null)
    }
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
      month: 'short',
      year: 'numeric'
    })
  }

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiry > new Date() && expiry <= thirtyDaysFromNow
  }

  const columns: TableColumn[] = [
    {
      key: 'document',
      label: 'Document',
      mobile: 'primary',
      render: (_, document: Document) => (
        <div className="space-y-1">
          <div className="font-semibold text-gray-900 tracking-wide">
            {document.file_name}
          </div>
          {document.description && (
            <div className="text-sm text-gray-600 font-medium line-clamp-2">
              {document.description}
            </div>
          )}
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {document.tags.slice(0, 2).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                >
                  {tag}
                </Badge>
              ))}
              {document.tags.length > 2 && (
                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                  +{document.tags.length - 2} more
                </Badge>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      mobile: 'visible',
      render: (_, document: Document) => (
        <Badge variant="outline" className={getTypeColor(document.document_type)}>
          {document.document_type}
        </Badge>
      )
    },
    {
      key: 'category',
      label: 'Category',
      mobile: 'hidden',
      render: (_, document: Document) => (
        <span className="text-gray-700 font-medium">
          {document.category || '-'}
        </span>
      )
    },
    {
      key: 'size',
      label: 'Size',
      mobile: 'secondary',
      render: (_, document: Document) => (
        <span className="text-gray-700 font-medium">
          {formatFileSize(document.file_size)}
        </span>
      )
    },
    {
      key: 'uploaded',
      label: 'Uploaded',
      mobile: 'visible',
      render: (_, document: Document) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-gray-700 font-medium">
            {formatDate(document.created_at)}
          </span>
        </div>
      )
    },
    {
      key: 'expires',
      label: 'Expires',
      mobile: 'visible',
      render: (_, document: Document) => (
        document.expires_at ? (
          <div className="flex items-center gap-2">
            {isExpired(document.expires_at) ? (
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                Expired
              </Badge>
            ) : isExpiringSoon(document.expires_at) ? (
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                Expires Soon
              </Badge>
            ) : (
              <span className="text-gray-700 font-medium">
                {formatDate(document.expires_at)}
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      mobile: 'visible',
      render: (_, document: Document) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(document)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload(document)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              {document.is_public && (
                <DropdownMenuItem onClick={() => handleDownload(document)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Public Link
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDelete(document.id)}
                className="text-red-600 focus:text-red-600"
                disabled={deletingId === document.id}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deletingId === document.id ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  if (documents.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center">
        <FileText className="h-16 w-16 mx-auto mb-6 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2 tracking-wide">No Documents Found</h3>
        <p className="text-gray-600 font-medium tracking-wide">
          Upload your first document to get started with document management.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden hover:border-gray-300 transition-all duration-300">
        <ResponsiveTable
          data={documents}
          columns={columns}
          emptyMessage="No documents found"
          className="rounded-none border-0"
        />
      </div>
      
      <DocumentViewer
        document={viewerDocument}
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false)
          setViewerDocument(null)
        }}
      />
    </>
  )
}