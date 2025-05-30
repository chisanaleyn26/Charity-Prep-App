'use client'

import { useState, useEffect } from 'react'
import { FileText, Upload, Download, Eye, Trash2, Search, Filter, FolderOpen, Calendar, Tag } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DocumentUploadForm } from '@/features/documents/components/document-upload-form'
import { DocumentTable } from '@/features/documents/components/document-table'
import { getDocuments, getDocumentStats } from '@/features/documents/services/documents'
import type { Document, DocumentStats } from '@/features/documents/types/documents'
import { mockDocuments } from '@/lib/mock-data'
import { appConfig } from '@/lib/config'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      if (appConfig.features.mockMode) {
        // Use mock data
        setDocuments(mockDocuments)
        const mockStats: DocumentStats = {
          totalDocuments: mockDocuments.length,
          expiringSoon: mockDocuments.filter(d => {
            if (!d.expiry_date) return false
            const expiry = new Date(d.expiry_date)
            const thirtyDaysFromNow = new Date()
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
            return expiry > new Date() && expiry <= thirtyDaysFromNow
          }).length,
          totalSizeBytes: mockDocuments.reduce((sum, d) => sum + (d.file_size || 0), 0),
          categoriesCount: new Set(mockDocuments.map(d => d.category)).size
        }
        setStats(mockStats)
      } else {
        const [documentsData, statsData] = await Promise.all([
          getDocuments(),
          getDocumentStats()
        ])
        setDocuments(documentsData)
        setStats(statsData)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleUploadSuccess = () => {
    setIsUploadDialogOpen(false)
    fetchDocuments()
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || doc.document_type === filterType
    return matchesSearch && matchesType
  })

  const documentTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'policy', label: 'Policies' },
    { value: 'certificate', label: 'Certificates' },
    { value: 'report', label: 'Reports' },
    { value: 'form', label: 'Forms' },
    { value: 'other', label: 'Other' }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'policy': return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'certificate': return 'bg-green-50 text-green-600 border-green-200'
      case 'report': return 'bg-purple-50 text-purple-600 border-purple-200'
      case 'form': return 'bg-amber-50 text-amber-600 border-amber-200'
      default: return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section with Consistent Pattern */}
      <div className="bg-gradient-to-br from-[#B1FA63]/5 via-[#B1FA63]/3 to-transparent rounded-xl p-6 border border-[#B1FA63]/20 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="h-12 w-12 bg-[#243837] rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-[#B1FA63]" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-light text-gray-900 leading-tight tracking-tight">
                Documents
              </h1>
              <p className="text-base text-gray-700 leading-relaxed mt-2">
                Manage your organization&apos;s policies, certificates, and important documents.
              </p>
            </div>
          </div>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#B1FA63] hover:bg-[#9FE851] text-[#243837] font-medium border-[#B1FA63] hover:border-[#9FE851]">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold tracking-tight">Upload Document</DialogTitle>
                <DialogDescription className="text-gray-600 font-medium">
                  Upload a new document to your organization&apos;s library
                </DialogDescription>
              </DialogHeader>
              <DocumentUploadForm onSuccess={handleUploadSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#B1FA63]/30 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-[#243837] rounded-lg flex items-center justify-center group-hover:scale-105 group-hover:bg-[#B1FA63] transition-all duration-200 flex-shrink-0">
                <FileText className="h-5 w-5 text-[#B1FA63] group-hover:text-[#243837]" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
                Total Documents
              </h3>
              <p className="text-3xl font-light text-gray-900 leading-none tracking-tight">
                {stats.totalDocuments}
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#B1FA63]/30 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-[#243837] rounded-lg flex items-center justify-center group-hover:scale-105 group-hover:bg-[#B1FA63] transition-all duration-200 flex-shrink-0">
                <Calendar className="h-5 w-5 text-[#B1FA63] group-hover:text-[#243837]" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
                Expiring Soon
              </h3>
              <p className="text-3xl font-light text-gray-900 leading-none tracking-tight">
                {stats.expiringSoon}
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#B1FA63]/30 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-[#243837] rounded-lg flex items-center justify-center group-hover:scale-105 group-hover:bg-[#B1FA63] transition-all duration-200 flex-shrink-0">
                <FolderOpen className="h-5 w-5 text-[#B1FA63] group-hover:text-[#243837]" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
                Storage Used
              </h3>
              <p className="text-3xl font-light text-gray-900 leading-none tracking-tight">
                {(stats.totalSizeBytes / 1024 / 1024).toFixed(1)}MB
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#B1FA63]/30 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-[#243837] rounded-lg flex items-center justify-center group-hover:scale-105 group-hover:bg-[#B1FA63] transition-all duration-200 flex-shrink-0">
                <Tag className="h-5 w-5 text-[#B1FA63] group-hover:text-[#243837]" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
                Categories
              </h3>
              <p className="text-3xl font-light text-gray-900 leading-none tracking-tight">
                {stats.categoriesCount}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 hover:border-gray-300 transition-all duration-300">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 rounded-xl focus:border-gray-400 transition-colors"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[200px] border-gray-200 rounded-xl">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Documents Table */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <DocumentTable 
          documents={filteredDocuments}
          onDocumentUpdate={fetchDocuments}
          getTypeColor={getTypeColor}
        />
      )}
    </div>
  )
}