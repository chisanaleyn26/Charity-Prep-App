'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Download, Share2, Twitter, Linkedin, Mail, Copy, CheckCircle } from 'lucide-react'
import { Certificate, getCertificateStyle, generateShareText, generateQRCodeData } from '../services/certificate-generator'

interface CertificateDisplayProps {
  certificate: Certificate
  onDownload?: () => void
}

export function CertificateDisplay({ certificate, onDownload }: CertificateDisplayProps) {
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const style = getCertificateStyle(certificate.type)
  const shareText = generateShareText(certificate)
  const qrData = generateQRCodeData(certificate)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(certificate.shareableLink || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    // Generate certificate image
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 800
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Background
      ctx.fillStyle = style.bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Border
      ctx.strokeStyle = style.accentColor
      ctx.lineWidth = 8
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)
      
      // Icon
      ctx.font = '80px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(style.icon, canvas.width / 2, 150)
      
      // Title
      ctx.fillStyle = style.textColor
      ctx.font = 'bold 48px Arial'
      ctx.fillText(certificate.title, canvas.width / 2, 250)
      
      // Subtitle
      ctx.font = '24px Arial'
      ctx.fillStyle = '#666'
      ctx.fillText(certificate.subtitle, canvas.width / 2, 300)
      
      // Description
      ctx.font = '20px Arial'
      ctx.fillStyle = style.textColor
      const words = certificate.description.split(' ')
      let line = ''
      let y = 400
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width
        
        if (testWidth > canvas.width - 200 && n > 0) {
          ctx.fillText(line, canvas.width / 2, y)
          line = words[n] + ' '
          y += 30
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, canvas.width / 2, y)
      
      // Date
      ctx.font = '18px Arial'
      ctx.fillStyle = '#666'
      ctx.fillText(`Issued: ${new Date(certificate.issuedDate).toLocaleDateString('en-GB')}`, canvas.width / 2, canvas.height - 120)
      
      // Verification code
      ctx.font = '16px monospace'
      ctx.fillText(`Verification: ${certificate.verificationCode}`, canvas.width / 2, canvas.height - 80)
    }
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `certificate-${certificate.type}-${certificate.verificationCode}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    })
    
    if (onDownload) onDownload()
  }

  const handleShare = (platform: 'twitter' | 'linkedin' | 'email') => {
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.twitter)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificate.shareableLink || '')}`, '_blank')
        break
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(shareText.email.subject)}&body=${encodeURIComponent(shareText.email.body)}`
        break
    }
    setShowShareDialog(false)
  }

  return (
    <>
      <Card 
        className="relative overflow-hidden transition-all hover:shadow-lg cursor-pointer"
        style={{ backgroundColor: style.bgColor }}
        onClick={() => setShowShareDialog(true)}
      >
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ backgroundColor: style.accentColor }} />
        
        <div className="p-8 text-center space-y-4">
          <div className="text-6xl">{style.icon}</div>
          
          <div>
            <h3 className="text-2xl font-bold" style={{ color: style.textColor }}>
              {certificate.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {certificate.subtitle}
            </p>
          </div>
          
          <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: style.textColor }}>
            {certificate.description}
          </p>
          
          <div className="pt-4 space-y-2">
            <p className="text-xs text-muted-foreground">
              Issued on {new Date(certificate.issuedDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <p className="text-xs font-mono text-muted-foreground">
              {certificate.verificationCode}
            </p>
          </div>
          
          <div className="flex justify-center gap-2 pt-4">
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleDownload(); }}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setShowShareDialog(true); }}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Certificate</DialogTitle>
            <DialogDescription>
              Share your achievement with others
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="mr-2 h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleShare('linkedin')}
              >
                <Linkedin className="mr-2 h-4 w-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleShare('email')}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            </div>
            
            {certificate.shareableLink && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Or copy link:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={certificate.shareableLink}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            <div className="text-center pt-4">
              <div className="inline-block p-4 bg-white rounded-lg border">
                <div className="text-xs text-muted-foreground mb-2">Scan to verify</div>
                {/* In production, you'd generate an actual QR code here */}
                <div className="w-32 h-32 bg-muted rounded flex items-center justify-center text-xs">
                  QR Code
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}