'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Copy,
  FileDown,
  Loader2
} from 'lucide-react';
import { generateAnnualReturnData, exportAnnualReturnData } from '../actions/annual-return';
import { mapDataToARFields, getFieldsBySection } from '../utils/field-mapping';
import { ARPreview } from './ARPreview';
import { FieldMapper } from './FieldMapper';
import type { AnnualReturnData, ARGeneratorState } from '../types/annual-return';

interface ARGeneratorProps {
  initialData?: AnnualReturnData | null;
}

export function ARGenerator({ initialData = null }: ARGeneratorProps) {
  const [state, setState] = useState<ARGeneratorState>({
    isLoading: !initialData,
    isGenerating: false,
    data: initialData,
    error: null,
    selectedSection: 'all',
    copiedFields: new Set()
  });

  // Generate data on mount if not provided
  useEffect(() => {
    if (!initialData) {
      handleGenerate();
    }
  }, []);

  const handleGenerate = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const result = await generateAnnualReturnData();
    
    if (result.success && result.data) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        data: result.data,
        copiedFields: new Set() 
      }));
      toast.success('Annual Return data generated successfully');
    } else {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: result.error || 'Failed to generate data' 
      }));
      toast.error(result.error || 'Failed to generate Annual Return data');
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    setState(prev => ({ ...prev, isGenerating: true }));
    
    const result = await exportAnnualReturnData(format);
    
    if (result.success && result.data) {
      // Create download link
      const blob = new Blob([result.data], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported as ${format.toUpperCase()}`);
    } else {
      toast.error(result.error || 'Export failed');
    }
    
    setState(prev => ({ ...prev, isGenerating: false }));
  };

  const handleFieldCopied = (fieldId: string) => {
    setState(prev => ({
      ...prev,
      copiedFields: new Set([...prev.copiedFields, fieldId])
    }));
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Generating Annual Return data...</p>
        </div>
      </div>
    );
  }

  if (state.error && !state.data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{state.error}</span>
          <Button variant="outline" size="sm" onClick={handleGenerate}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!state.data) return null;

  const fieldMappings = mapDataToARFields(state.data);
  const sectionFields = getFieldsBySection(fieldMappings, state.selectedSection);
  const completedFields = fieldMappings.filter(f => f.value !== null && f.value !== undefined);

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completeness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{state.data.completeness}%</span>
                <Badge variant={state.data.completeness >= 90 ? "default" : "secondary"}>
                  {state.data.completeness >= 90 ? "Ready" : "In Progress"}
                </Badge>
              </div>
              <Progress value={state.data.completeness} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Fields Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {completedFields.length} / {fieldMappings.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {state.data.missingFields.filter(f => f.required).length} required fields missing
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleGenerate}
              disabled={state.isGenerating}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleExport('csv')}
                disabled={state.isGenerating}
              >
                <FileDown className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleExport('json')}
                disabled={state.isGenerating}
              >
                <FileDown className="h-4 w-4 mr-1" />
                JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missing fields alert */}
      {state.data.missingFields.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">Missing Information:</p>
            <ul className="list-disc list-inside space-y-1">
              {state.data.missingFields.map((field, index) => (
                <li key={index} className="text-sm">
                  {field.description}
                  {field.required && <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Main content tabs */}
      <Tabs value={state.selectedSection} onValueChange={(v) => setState(prev => ({ ...prev, selectedSection: v as any }))}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Fields</TabsTrigger>
          <TabsTrigger value="safeguarding">Safeguarding</TabsTrigger>
          <TabsTrigger value="overseas">International</TabsTrigger>
          <TabsTrigger value="fundraising">Fundraising</TabsTrigger>
        </TabsList>

        <TabsContent value={state.selectedSection} className="space-y-6 mt-6">
          {/* Split view */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Field mapper */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Your Data</CardTitle>
                  <CardDescription>
                    Click copy button to copy individual field values
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldMapper 
                    fields={sectionFields}
                    copiedFields={state.copiedFields}
                    onFieldCopied={handleFieldCopied}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right: Form preview */}
            <div className="lg:sticky lg:top-4">
              <Card>
                <CardHeader>
                  <CardTitle>Annual Return Form Preview</CardTitle>
                  <CardDescription>
                    How your data maps to the official form
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ARPreview 
                    data={state.data}
                    highlightedFields={sectionFields.map(f => f.fieldId)}
                    section={state.selectedSection}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}