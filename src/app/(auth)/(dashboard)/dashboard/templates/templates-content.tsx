"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { api } from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { TemplateFormModal } from "@/components/modals/template-form-modal"
import { Trash2, FileText } from "lucide-react"
import { SearchBar } from "@/components/search-bar"
import { toast } from "sonner"
import { Template } from "@/lib/api/types"
import { EmailPreviewModal } from "@/components/modals/email-preview-modal"

export function TemplatesContent() {
  const searchParams = useSearchParams()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = useCallback(async (searchTerm?: string) => {
    try {
      setLoading(true)
      const params = {
        page: Number(searchParams.get("page")) || 1,
        per_page: 10,
        query: searchTerm || searchParams.get("query") || "",
        order_by: "created_at",
        order: "DESC" as const
      }
      const data = await api.templates.getTemplates(params)
      setTemplates(data || [])
    } catch (error) {
      console.error("Error fetching templates:", error)
      toast.error("Failed to fetch templates")
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleSearch = useCallback((term: string) => {
    fetchTemplates(term)
  }, [fetchTemplates])

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return
    try {
      await api.templates.deleteTemplate(id)
      toast.success("Template deleted successfully")
      fetchTemplates()
    } catch (error) {
      console.error("Error deleting template:", error)
      toast.error("Failed to delete template")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Templates</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a 
              href="https://www.usewaypoint.com/open-source/emailbuilderjs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Use EmailBuilder.js Playground
            </a>
          </Button>
          <TemplateFormModal mode="create" onSuccess={fetchTemplates} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <SearchBar 
            placeholder="Search templates..." 
            onSearch={handleSearch}
          />
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No templates found
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>
                      <Badge variant={template.template_type === 'Campaign' ? 'default' : 'secondary'}>
                        {template.template_type === 'Campaign' ? 'Campaign' : 'Transactional'}
                      </Badge>
                    </TableCell>
                    <TableCell>{template.subject}</TableCell>
                    <TableCell>
                      <Badge variant={template.is_default ? 'default' : 'outline'}>
                        {template.is_default ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(template.created_at || '')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <EmailPreviewModal 
                          subject={template.subject}
                          body={template.body}
                        />
                        <TemplateFormModal mode="edit" template={template} onSuccess={fetchTemplates} />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
} 