'use client';

import { useState } from 'react';
import { Check, Download, Calendar, Shield, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ExportFormat, ExportOptions, exportComplianceData } from '../services/export-service';

interface ExportWizardProps {
  organizationId: string;
}

const exportModules = [
  { id: 'safeguarding', name: 'Safeguarding Records', icon: Shield },
  { id: 'fundraising', name: 'Fundraising Activities', icon: '💰' },
  { id: 'overseas', name: 'Overseas Activities', icon: '🌍' },
  { id: 'documents', name: 'Documents', icon: FileText },
  { id: 'compliance', name: 'Compliance Scores', icon: '📊' },
  { id: 'income', name: 'Income Records', icon: '💷' }
];

const exportFormats: { value: ExportFormat; label: string; description: string }[] = [
  { value: 'csv', label: 'CSV', description: 'Compatible with Excel and most spreadsheet software' },
  { value: 'json', label: 'JSON', description: 'Structured data format for developers' },
  { value: 'excel', label: 'Excel', description: 'Native Excel format with multiple sheets' },
  { value: 'pdf', label: 'PDF', description: 'Formatted report for printing and sharing' }
];

export function ExportWizard({ organizationId }: ExportWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [gdprCompliant, setGdprCompliant] = useState(false);
  const [scheduleExport, setScheduleExport] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    const options: ExportOptions = {
      format,
      modules: selectedModules,
      gdprCompliant
    };

    // Simulate progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await exportComplianceData(organizationId, options);
      
      clearInterval(progressInterval);
      setExportProgress(100);

      if (result.success && result.data) {
        // Create download link
        const blob = new Blob([result.data as string], { 
          type: format === 'json' ? 'application/json' : 'text/csv' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Reset wizard
        setTimeout(() => {
          setStep(1);
          setSelectedModules([]);
          setIsExporting(false);
          setExportProgress(0);
        }, 2000);
      }
    } catch (error) {
      clearInterval(progressInterval);
      setIsExporting(false);
      console.error('Export failed:', error);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedModules.length > 0;
      case 2:
        return true; // Format is always selected
      case 3:
        return true; // Options are optional
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                step >= s
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {step > s ? <Check className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`flex-1 h-1 mx-2 transition-colors ${
                  step > s ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Modules */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Data to Export</CardTitle>
            <CardDescription>
              Choose which compliance modules you want to include in your export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {exportModules.map((module) => (
                <div
                  key={module.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedModules.includes(module.id)
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleModuleToggle(module.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedModules.includes(module.id)}
                      onCheckedChange={() => handleModuleToggle(module.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {typeof module.icon === 'string' ? (
                          <span className="text-xl">{module.icon}</span>
                        ) : (
                          <module.icon className="w-5 h-5 text-purple-600" />
                        )}
                        <Label className="font-medium cursor-pointer">
                          {module.name}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Choose Format */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Export Format</CardTitle>
            <CardDescription>
              Select the format that best suits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <div className="space-y-3">
                {exportFormats.map((fmt) => (
                  <div
                    key={fmt.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      format === fmt.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <RadioGroupItem value={fmt.value} />
                      <div className="flex-1">
                        <div className="font-medium">{fmt.label}</div>
                        <div className="text-sm text-gray-600">{fmt.description}</div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Export Options */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>
                Configure additional export settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* GDPR Compliance */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>GDPR Compliant Export</Label>
                  <p className="text-sm text-gray-600">
                    Remove personal information from the export
                  </p>
                </div>
                <Switch
                  checked={gdprCompliant}
                  onCheckedChange={setGdprCompliant}
                />
              </div>

              {/* Schedule Export */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Schedule Regular Export</Label>
                    <p className="text-sm text-gray-600">
                      Automatically export data on a schedule
                    </p>
                  </div>
                  <Switch
                    checked={scheduleExport}
                    onCheckedChange={setScheduleExport}
                  />
                </div>

                {scheduleExport && (
                  <div className="ml-8 space-y-3">
                    <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Export Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Export Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Modules:</span>
                  <span className="font-medium">{selectedModules.length} selected</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Format:</span>
                  <span className="font-medium">{format.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GDPR Compliant:</span>
                  <span className="font-medium">{gdprCompliant ? 'Yes' : 'No'}</span>
                </div>
                {scheduleExport && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Schedule:</span>
                    <span className="font-medium capitalize">{frequency}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1 || isExporting}
        >
          Previous
        </Button>
        
        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="min-w-[150px]"
          >
            {isExporting ? (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                Exporting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Data
              </div>
            )}
          </Button>
        )}
      </div>

      {/* Export Progress */}
      {isExporting && (
        <div className="mt-4">
          <Progress value={exportProgress} className="h-2" />
          <p className="text-sm text-gray-600 mt-2 text-center">
            {exportProgress === 100 ? 'Export complete!' : 'Preparing your export...'}
          </p>
        </div>
      )}
    </div>
  );
}