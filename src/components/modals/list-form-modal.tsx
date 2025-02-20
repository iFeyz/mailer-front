"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil } from "lucide-react"

interface List {
  id: number;
  uuid: string;
  name: string;
  type: 'Public' | 'Private' | 'Temporary';
  optin: 'Single' | 'Double';
  tags: string[];
  description: string;
  created_at: string;
  updated_at: string;
}

interface ListFormModalProps {
  list?: List;
  onSuccess: () => void;
  mode?: 'create' | 'edit';
}

export function ListFormModal({ list, onSuccess, mode = 'create' }: ListFormModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "Public" as const,
    optin: "Single" as const,
    tags: [] as string[],
    description: ""
  })

  useEffect(() => {
    if (list && mode === 'edit') {
      setFormData({
        name: list.name,
        type: list.type,
        optin: list.optin,
        tags: list.tags,
        description: list.description
      })
    }
  }, [list, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (mode === 'create') {
        await api.lists.createList(formData)
      } else if (list) {
        const updateData = {
          ...formData,
          uuid: list.uuid
        }
        await api.lists.updateList(list.id, {
            ...formData,
            id: list.id,
            uuid: list.uuid
          })
      }
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} list:`, error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'create' ? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create List
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create' : 'Edit'} List</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'Public' | 'Private' | 'Temporary') =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Public">Public</SelectItem>
                <SelectItem value="Private">Private</SelectItem>
                <SelectItem value="Temporary">Temporary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="optin">Opt-in Type</Label>
            <Select
              value={formData.optin}
              onValueChange={(value: 'Single' | 'Double') =>
                setFormData({ ...formData, optin: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select opt-in type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single Opt-in</SelectItem>
                <SelectItem value="Double">Double Opt-in</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags.join(", ")}
              onChange={(e) => setFormData({ 
                ...formData, 
                tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
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