"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil } from "lucide-react"
import { Template, TemplateType } from "@/lib/api/types"

interface TemplateFormModalProps {
  template?: Template
  onSuccess?: () => void
  mode?: 'create' | 'edit'
}

export function TemplateFormModal({ template, onSuccess, mode = 'create' }: TemplateFormModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    template_type: "Campaign" as TemplateType,
    subject: "",
    body: "",
    is_default: false
  })

  useEffect(() => {
    if (template && mode === 'edit') {
      setFormData({
        name: template.name,
        template_type: template.template_type,
        subject: template.subject,
        body: template.body,
        is_default: template.is_default
      })
    }
  }, [template, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (mode === 'create') {
        await api.templates.createTemplate(formData)
        toast.success("Template created successfully")
      } else if (template) {
        await api.templates.updateTemplate(template.id, formData)
        toast.success("Template updated successfully")
      }
      setOpen(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} template:`, error)
      toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} template`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'create' ? (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create' : 'Edit'} Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={formData.template_type}
              onChange={(e) => setFormData(prev => ({ ...prev, template_type: e.target.value as TemplateType }))}
            >
              <option value="Campaign">Campaign</option>
              <option value="Tx">Transactional</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              required
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              required
              className="min-h-[200px]"
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
              placeholder="You can use {{variables}} in your template"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
            />
            <Label htmlFor="is_default">Set as default template</Label>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (mode === 'create' ? 'Creating...' : 'Saving...') : (mode === 'create' ? 'Create' : 'Save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 