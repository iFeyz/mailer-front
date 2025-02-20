"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { List, ListType, ListOptin } from "@/lib/api/types"

interface EditListModalProps {
  list: List
  onSuccess?: () => void
}

export function EditListModal({ list, onSuccess }: EditListModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "public" as ListType,
    optin: "single" as ListOptin,
    description: "",
    tags: ""
  })

  useEffect(() => {
    if (list) {
      setFormData({
        name: list.name,
        type: list.type,
        optin: list.optin,
        description: list.description,
        tags: list.tags.join(", ")
      })
    }
  }, [list])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await api.lists.updateList(list.id, {
        ...formData,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean)
      })
      toast.success("List updated successfully")
      setOpen(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error updating list:", error)
      toast.error("Failed to update list")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit List</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">List Name</Label>
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
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ListType }))}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="optin">Opt-in Method</Label>
            <select
              id="optin"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={formData.optin}
              onChange={(e) => setFormData(prev => ({ ...prev, optin: e.target.value as ListOptin }))}
            >
              <option value="single">Single Opt-in</option>
              <option value="double">Double Opt-in</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="newsletter, updates, marketing"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 