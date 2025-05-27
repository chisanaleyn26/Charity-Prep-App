'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  FileText, 
  BarChart3, 
  Shield, 
  DollarSign,
  Globe,
  AlertTriangle,
  Target,
  MessageSquare,
  Sparkles,
  GripVertical
} from 'lucide-react'
import { BoardPackTemplate, BoardPackSection } from '../types/board-pack'
import { getBoardPackTemplates } from '../actions/board-pack'
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TemplateSelectorProps {
  onSelectTemplate: (template: BoardPackTemplate) => void
}

// Icon mapping for section types
const sectionIcons = {
  'compliance-overview': Shield,
  'financial-summary': DollarSign,
  'risk-analysis': AlertTriangle,
  'fundraising-report': BarChart3,
  'safeguarding-report': Shield,
  'overseas-activities': Globe,
  'key-metrics': Target,
  'recommendations': MessageSquare,
  'narrative-summary': Sparkles
}

// Sortable section item
function SortableSection({ 
  section, 
  onToggle 
}: { 
  section: BoardPackSection
  onToggle: (id: string, enabled: boolean) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const Icon = sectionIcons[section.type] || FileText

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        section.enabled ? 'bg-background' : 'bg-muted/50'
      }`}
    >
      <button
        className="cursor-grab hover:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      
      <Icon className="h-4 w-4 text-muted-foreground" />
      
      <div className="flex-1">
        <h4 className="text-sm font-medium">{section.title}</h4>
        <p className="text-xs text-muted-foreground">{section.description}</p>
      </div>
      
      <Switch
        checked={section.enabled}
        onCheckedChange={(checked) => onToggle(section.id, checked)}
      />
    </div>
  )
}

export default function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<BoardPackTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [customizedTemplate, setCustomizedTemplate] = useState<BoardPackTemplate | null>(null)
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    try {
      const data = await getBoardPackTemplates()
      setTemplates(data)
      
      // Select default template
      const defaultTemplate = data.find(t => t.isDefault) || data[0]
      if (defaultTemplate) {
        setSelectedTemplateId(defaultTemplate.id)
        setCustomizedTemplate({ ...defaultTemplate })
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleTemplateSelect(templateId: string) {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplateId(templateId)
      setCustomizedTemplate({ ...template })
    }
  }

  function handleSectionToggle(sectionId: string, enabled: boolean) {
    if (!customizedTemplate) return

    setCustomizedTemplate({
      ...customizedTemplate,
      sections: customizedTemplate.sections.map(section =>
        section.id === sectionId ? { ...section, enabled } : section
      )
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id || !customizedTemplate) {
      return
    }

    const oldIndex = customizedTemplate.sections.findIndex(s => s.id === active.id)
    const newIndex = customizedTemplate.sections.findIndex(s => s.id === over.id)

    const newSections = arrayMove(customizedTemplate.sections, oldIndex, newIndex)
    
    // Update order numbers
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index + 1
    }))

    setCustomizedTemplate({
      ...customizedTemplate,
      sections: updatedSections
    })
  }

  function handleGenerateReport() {
    if (customizedTemplate) {
      onSelectTemplate(customizedTemplate)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            Loading templates...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Template</CardTitle>
          <CardDescription>
            Choose a board pack template or customize sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedTemplateId}
            onValueChange={handleTemplateSelect}
          >
            <div className="grid gap-4">
              {templates.map((template) => (
                <div key={template.id} className="flex items-start space-x-2">
                  <RadioGroupItem value={template.id} id={template.id} />
                  <Label
                    htmlFor={template.id}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{template.name}</span>
                      {template.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                    <div className="flex gap-1 mt-2">
                      {template.sections.filter(s => s.enabled).map((section) => {
                        const Icon = sectionIcons[section.type] || FileText
                        return (
                          <Badge
                            key={section.id}
                            variant="outline"
                            className="text-xs"
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {section.title}
                          </Badge>
                        )
                      })}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Section Customization */}
      {customizedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Customize Sections</CardTitle>
            <CardDescription>
              Enable/disable sections and drag to reorder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={customizedTemplate.sections.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {customizedTemplate.sections.map((section) => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      onToggle={handleSectionToggle}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {customizedTemplate.sections.filter(s => s.enabled).length} of{' '}
                {customizedTemplate.sections.length} sections enabled
              </div>
              <Button onClick={handleGenerateReport}>
                Generate Board Pack
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}