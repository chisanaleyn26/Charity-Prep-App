'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { createSafeguardingRecord, updateSafeguardingRecord } from '../../services/safeguarding-aligned'
import type { SafeguardingRecord, SafeguardingRoleType, DBSCheckType } from '../../types/safeguarding-aligned'

interface SafeguardingFormProps {
  record?: SafeguardingRecord
  onSubmit?: () => void
  onCancel?: () => void
}

export function SafeguardingFormAligned({ record, onSubmit, onCancel }: SafeguardingFormProps) {
  const [formData, setFormData] = useState({
    person_name: record?.person_name || '',
    dbs_certificate_number: record?.dbs_certificate_number || '',
    role_title: record?.role_title || '',
    role_type: record?.role_type || 'employee' as SafeguardingRoleType,
    department: record?.department || '',
    dbs_check_type: record?.dbs_check_type || 'basic' as DBSCheckType,
    issue_date: record?.issue_date ? new Date(record.issue_date).toISOString().split('T')[0] : '',
    expiry_date: record?.expiry_date ? new Date(record.expiry_date).toISOString().split('T')[0] : '',
    reference_checks_completed: record?.reference_checks_completed ?? false,
    training_completed: record?.training_completed ?? false,
    training_date: record?.training_date ? new Date(record.training_date).toISOString().split('T')[0] : '',
    works_with_children: record?.works_with_children ?? false,
    works_with_vulnerable_adults: record?.works_with_vulnerable_adults ?? false,
    unsupervised_access: record?.unsupervised_access ?? false,
    is_active: record?.is_active ?? true,
    notes: record?.notes || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const submitData = {
        person_name: formData.person_name,
        dbs_certificate_number: formData.dbs_certificate_number || null,
        role_title: formData.role_title,
        role_type: formData.role_type,
        department: formData.department || null,
        dbs_check_type: formData.dbs_check_type,
        issue_date: new Date(formData.issue_date),
        expiry_date: new Date(formData.expiry_date),
        reference_checks_completed: formData.reference_checks_completed,
        training_completed: formData.training_completed,
        training_date: formData.training_date ? new Date(formData.training_date) : null,
        works_with_children: formData.works_with_children,
        works_with_vulnerable_adults: formData.works_with_vulnerable_adults,
        unsupervised_access: formData.unsupervised_access,
        is_active: formData.is_active,
        notes: formData.notes || null
      }

      if (record) {
        await updateSafeguardingRecord({ id: record.id, ...submitData })
      } else {
        await createSafeguardingRecord(submitData)
      }
      
      onSubmit?.()
    } catch (error) {
      console.error('Error submitting safeguarding record:', error)
      alert(error instanceof Error ? error.message : 'Failed to save record')
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="person_name">Person Name *</Label>
              <Input
                id="person_name"
                value={formData.person_name}
                onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="role_title">Role Title *</Label>
              <Input
                id="role_title"
                value={formData.role_title}
                onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="role_type">Role Type *</Label>
              <Select value={formData.role_type} onValueChange={(value: SafeguardingRoleType) => setFormData({ ...formData, role_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="trustee">Trustee</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="issue_date">Issue Date *</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="expiry_date">Expiry Date *</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="dbs_check_type">DBS Check Type *</Label>
              <Select value={formData.dbs_check_type} onValueChange={(value: DBSCheckType) => setFormData({ ...formData, dbs_check_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="enhanced">Enhanced</SelectItem>
                  <SelectItem value="enhanced_barred">Enhanced + Barred List</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dbs_certificate_number">DBS Certificate Number (12 digits)</Label>
              <Input
                id="dbs_certificate_number"
                value={formData.dbs_certificate_number}
                onChange={(e) => setFormData({ ...formData, dbs_certificate_number: e.target.value })}
                pattern="^\d{12}$"
                placeholder="123456789012"
              />
            </div>


            <div>
              <Label htmlFor="training_date">Training Completion Date</Label>
              <Input
                id="training_date"
                type="date"
                value={formData.training_date}
                onChange={(e) => setFormData({ ...formData, training_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reference_checks_completed"
                checked={formData.reference_checks_completed}
                onCheckedChange={(checked) => setFormData({ ...formData, reference_checks_completed: !!checked })}
              />
              <Label htmlFor="reference_checks_completed">Reference Checks Completed</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="training_completed"
                checked={formData.training_completed}
                onCheckedChange={(checked) => setFormData({ ...formData, training_completed: !!checked })}
              />
              <Label htmlFor="training_completed">Training Completed</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="works_with_children"
                checked={formData.works_with_children}
                onCheckedChange={(checked) => setFormData({ ...formData, works_with_children: !!checked })}
              />
              <Label htmlFor="works_with_children">Works with Children</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="works_with_vulnerable_adults"
                checked={formData.works_with_vulnerable_adults}
                onCheckedChange={(checked) => setFormData({ ...formData, works_with_vulnerable_adults: !!checked })}
              />
              <Label htmlFor="works_with_vulnerable_adults">Works with Vulnerable Adults</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="unsupervised_access"
                checked={formData.unsupervised_access}
                onCheckedChange={(checked) => setFormData({ ...formData, unsupervised_access: !!checked })}
              />
              <Label htmlFor="unsupervised_access">Unsupervised Access</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
              />
              <Label htmlFor="is_active">Active Record</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              {record ? 'Update' : 'Create'} Record
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}