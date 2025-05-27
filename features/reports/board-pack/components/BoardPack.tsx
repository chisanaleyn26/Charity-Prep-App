'use client'

import { useState } from 'react'
import { BoardPackTemplate } from '../types/board-pack'
import TemplateSelector from './TemplateSelector'
import ReportBuilder from './ReportBuilder'

export default function BoardPack() {
  const [selectedTemplate, setSelectedTemplate] = useState<BoardPackTemplate | null>(null)

  if (!selectedTemplate) {
    return <TemplateSelector onSelectTemplate={setSelectedTemplate} />
  }

  return (
    <ReportBuilder 
      template={selectedTemplate} 
      onBack={() => setSelectedTemplate(null)} 
    />
  )
}