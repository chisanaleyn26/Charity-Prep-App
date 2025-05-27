'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format } from 'date-fns'
import { 
  CalendarIcon, 
  FileText, 
  Sparkles, 
  Download, 
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { boardPackTemplates, generateBoardPackData, BoardPackData } from '../services/template-service'
import { ReportSection } from './report-section'
import { PDFGenerator } from './pdf-generator'

export function ReportBuilder() {
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState('standard')
  const [meetingDate, setMeetingDate] = useState<Date>()
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set())
  const [generating, setGenerating] = useState(false)
  const [boardPackData, setBoardPackData] = useState<BoardPackData | null>(null)
  const [editedSections, setEditedSections] = useState<Record<string, any>>({})
  
  const organization = useAuthStore(state => state.organization)
  
  const template = boardPackTemplates.find(t => t.id === selectedTemplate)
  const requiredSections = template?.sections.filter(s => s.required) || []
  const optionalSections = template?.sections.filter(s => !s.required) || []

  // Initialize selected sections with required ones
  useState(() => {
    const required = new Set(requiredSections.map(s => s.id))
    setSelectedSections(required)
  })

  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    const newSections = new Set(selectedSections)
    if (checked) {
      newSections.add(sectionId)
    } else {
      // Don't allow unchecking required sections
      const section = template?.sections.find(s => s.id === sectionId)
      if (!section?.required) {
        newSections.delete(sectionId)
      }
    }
    setSelectedSections(newSections)
  }

  const handleGenerate = async () => {
    if (!organization || !meetingDate) return
    
    setGenerating(true)
    try {
      const data = await generateBoardPackData(
        organization.id,
        selectedTemplate,
        format(meetingDate, 'yyyy-MM-dd'),
        Array.from(selectedSections)
      )
      setBoardPackData(data)
      setStep(3)
    } catch (error) {
      console.error('Error generating board pack:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleSectionEdit = (sectionId: string, newContent: any) => {
    setEditedSections(prev => ({
      ...prev,
      [sectionId]: newContent
    }))
  }

  const getFinalBoardPackData = (): BoardPackData => {
    if (!boardPackData) throw new Error('No board pack data')
    
    return {
      ...boardPackData,
      sections: boardPackData.sections.map(section => ({
        ...section,
        content: editedSections[section.id] || section.content
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {step} of 3</span>
              <span>{step === 1 ? 'Choose Template' : step === 2 ? 'Customize' : 'Review & Export'}</span>
            </div>
            <Progress value={(step / 3) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Template Selection */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Report Template</CardTitle>
            <CardDescription>
              Choose a template that best fits your board meeting needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <div className="grid gap-4">
                {boardPackTemplates.map(template => (
                  <label
                    key={template.id}
                    className="flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-muted/50"
                  >
                    <RadioGroupItem value={template.id} />
                    <div className="space-y-1 leading-none">
                      <div className="font-medium">{template.name}</div>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {template.sections.length} sections • 
                        {template.sections.filter(s => s.required).length} required
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Customization */}
      {step === 2 && template && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Details</CardTitle>
              <CardDescription>
                When is this board pack for?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Meeting Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !meetingDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {meetingDate ? format(meetingDate, 'PPP') : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={meetingDate}
                        onSelect={setMeetingDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Sections</CardTitle>
              <CardDescription>
                Choose which sections to include in your board pack
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {requiredSections.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Required Sections</h4>
                    <div className="space-y-2">
                      {requiredSections.map(section => (
                        <div key={section.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={section.id}
                            checked={true}
                            disabled
                          />
                          <Label
                            htmlFor={section.id}
                            className="text-sm font-normal cursor-not-allowed opacity-75"
                          >
                            {section.title}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {optionalSections.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Optional Sections</h4>
                    <div className="space-y-2">
                      {optionalSections.map(section => (
                        <div key={section.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={section.id}
                            checked={selectedSections.has(section.id)}
                            onCheckedChange={(checked) => 
                              handleSectionToggle(section.id, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={section.id}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {section.title}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!meetingDate && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please select a meeting date before generating the report
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={handleGenerate}
                  disabled={!meetingDate || generating}
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Review & Export */}
      {step === 3 && boardPackData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Review Your Board Pack</CardTitle>
                  <CardDescription>
                    Review and edit sections before exporting
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Email to Trustees
                  </Button>
                  <PDFGenerator
                    boardPackData={getFinalBoardPackData()}
                    trigger={
                      <Button size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    }
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={boardPackData.sections[0]?.id} className="w-full">
                <TabsList className="grid w-full" style={{
                  gridTemplateColumns: `repeat(${Math.min(boardPackData.sections.length, 4)}, 1fr)`
                }}>
                  {boardPackData.sections.map(section => (
                    <TabsTrigger key={section.id} value={section.id} className="text-xs">
                      {section.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {boardPackData.sections.map(section => (
                  <TabsContent key={section.id} value={section.id}>
                    <ReportSection
                      section={section}
                      organizationName={boardPackData.organization.name}
                      onEdit={(content) => handleSectionEdit(section.id, content)}
                    />
                  </TabsContent>
                ))}
              </Tabs>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back to Edit
                </Button>
                <div className="text-sm text-muted-foreground">
                  Generated {new Date(boardPackData.metadata.generatedAt).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}