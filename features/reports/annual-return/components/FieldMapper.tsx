'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Check, 
  CopyIcon,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard, exportFieldsAsText } from '../utils/field-mapping';
import type { ARFieldMapping } from '../types/annual-return';

interface FieldMapperProps {
  fields: ARFieldMapping[];
  copiedFields: Set<string>;
  onFieldCopied: (fieldId: string) => void;
}

export function FieldMapper({ fields, copiedFields, onFieldCopied }: FieldMapperProps) {
  const [copyingAll, setCopyingAll] = useState(false);

  const handleCopyField = async (field: ARFieldMapping) => {
    const success = await copyToClipboard(field.copyText);
    if (success) {
      onFieldCopied(field.fieldId);
      toast.success(`Copied ${field.questionNumber} to clipboard`);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleCopyAll = async () => {
    setCopyingAll(true);
    const allText = exportFieldsAsText(fields);
    const success = await copyToClipboard(allText);
    
    if (success) {
      // Mark all fields as copied
      fields.forEach(field => onFieldCopied(field.fieldId));
      toast.success('Copied all fields to clipboard');
    } else {
      toast.error('Failed to copy to clipboard');
    }
    
    setCopyingAll(false);
  };

  const groupedFields = fields.reduce((acc, field) => {
    const section = field.fieldId[0].toUpperCase();
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, ARFieldMapping[]>);

  const sectionNames: Record<string, string> = {
    'B': 'Safeguarding',
    'C': 'International Operations',
    'D': 'Fundraising & Income'
  };

  return (
    <div className="space-y-6">
      {/* Quick actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {fields.length} fields ready to copy
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyAll}
          disabled={copyingAll}
        >
          <CopyIcon className="h-4 w-4 mr-2" />
          Copy All Fields
        </Button>
      </div>

      {/* Field list */}
      <div className="space-y-6">
        {Object.entries(groupedFields).map(([section, sectionFields]) => (
          <div key={section} className="space-y-3">
            <h5 className="font-medium text-sm text-muted-foreground">
              Section {section}: {sectionNames[section] || 'Other'}
            </h5>
            
            <div className="space-y-2">
              {sectionFields.map((field) => {
                const isCopied = copiedFields.has(field.fieldId);
                const isEmpty = field.value === null || field.value === undefined || 
                               (typeof field.value === 'string' && field.value.trim() === '');
                
                return (
                  <Card 
                    key={field.fieldId} 
                    className={`p-4 transition-colors ${
                      isCopied ? 'bg-primary/5 border-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {field.questionNumber}
                          </Badge>
                          {isEmpty && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Empty
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm font-medium">{field.description}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {field.formattedValue}
                          </code>
                          {field.formattedValue !== field.copyText && (
                            <span className="text-xs text-muted-foreground">
                              → copies as: "{field.copyText}"
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant={isCopied ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCopyField(field)}
                        className="shrink-0"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Helper text */}
      <div className="rounded-lg bg-muted p-4 space-y-2">
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>To complete your Annual Return:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Copy individual field values using the buttons above</li>
              <li>Go to the Charity Commission website</li>
              <li>Paste each value into the corresponding field</li>
              <li>Or use "Copy All Fields" to get everything at once</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}