'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { BoardPackData } from '../services/template-service'
import { generatePDF } from '../services/pdf-generator'

interface PDFGeneratorProps {
  boardPackData: BoardPackData
  trigger: React.ReactElement
}

export function PDFGenerator({ boardPackData, trigger }: PDFGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  const handleGeneratePDF = async () => {
    setGenerating(true)
    setError(null)
    setShowDialog(true)

    try {
      // Generate PDF
      const pdfBlob = await generatePDF(boardPackData)
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `board-pack-${boardPackData.organization.name.replace(/\s+/g, '-').toLowerCase()}-${boardPackData.date}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // Close dialog after short delay
      setTimeout(() => {
        setShowDialog(false)
      }, 1500)
    } catch (error) {
      console.error('Error generating PDF:', error)
      setError('Failed to generate PDF. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <div onClick={handleGeneratePDF}>
        {trigger}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generating PDF</DialogTitle>
            <DialogDescription>
              {generating 
                ? 'Please wait while we create your board pack PDF...'
                : error 
                ? 'An error occurred while generating the PDF.'
                : 'Your PDF has been generated successfully!'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 text-center">
            {generating && (
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            )}
            {error && (
              <div className="text-red-600">{error}</div>
            )}
            {!generating && !error && (
              <div className="text-green-600">✓ PDF Downloaded</div>
            )}
          </div>

          {!generating && (
            <DialogFooter>
              <Button onClick={() => setShowDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}