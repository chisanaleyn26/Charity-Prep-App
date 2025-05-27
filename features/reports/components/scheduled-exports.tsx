'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Mail, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { getScheduledExports, type ScheduledExport } from '../services/export-service';

interface ScheduledExportsProps {
  organizationId: string;
  onCreateNew: () => void;
}

export function ScheduledExports({ organizationId, onCreateNew }: ScheduledExportsProps) {
  const [exports, setExports] = useState<ScheduledExport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScheduledExports();
  }, [organizationId]);

  const loadScheduledExports = async () => {
    try {
      const data = await getScheduledExports(organizationId);
      setExports(data);
    } catch (error) {
      console.error('Failed to load scheduled exports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNextRun = (date: Date) => {
    const next = new Date(date);
    const now = new Date();
    const diff = next.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    return 'soon';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">Loading scheduled exports...</div>
        </CardContent>
      </Card>
    );
  }

  if (exports.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <Calendar className="w-12 h-12 mx-auto text-gray-400" />
            <div>
              <h3 className="font-medium text-lg">No scheduled exports</h3>
              <p className="text-gray-600 mt-1">
                Set up automatic exports to receive regular compliance data reports
              </p>
            </div>
            <Button onClick={onCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create Scheduled Export
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Scheduled Exports</h3>
        <Button size="sm" onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      {exports.map((export_) => (
        <Card key={export_.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {export_.options.format.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {export_.frequency}
                  </Badge>
                  {export_.options.gdprCompliant && (
                    <Badge variant="default" className="bg-green-600">
                      GDPR
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    Next run: {formatNextRun(export_.nextRun)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {export_.recipients.length} recipient{export_.recipients.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  Modules: {export_.options.modules.join(', ')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}