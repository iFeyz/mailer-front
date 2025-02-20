"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api-config"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Subscriber, SubscriberStatus } from "@/lib/api/types"
import { useForm } from "react-hook-form"
import { JsonValue } from "type-fest"

interface CreateSubscriberModalProps {
  mode?: "create" | "edit"
  subscriber?: Subscriber
  onSuccess?: () => void
  children?: React.ReactNode
}

interface SubscriberFormData {
  email: string
  name: string
  status: SubscriberStatus
  attribs: string
}

export function CreateSubscriberModal({ mode = "create", subscriber, onSuccess, children }: CreateSubscriberModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const defaultValues: SubscriberFormData = {
    email: subscriber?.email || "",
    name: subscriber?.name || "",
    status: subscriber?.status || "Enabled",
    attribs: subscriber?.attribs ? JSON.stringify(subscriber.attribs) : "{}"
  }

  const form = useForm<SubscriberFormData>({
    defaultValues
  })

  useEffect(() => {
    if (mode === "edit" && subscriber) {
      form.reset({
        email: subscriber.email,
        name: subscriber.name || "",
        status: subscriber.status,
        attribs: JSON.stringify(subscriber.attribs)
      })
    }
  }, [subscriber, form, mode])

  const onSubmit = async (data: SubscriberFormData) => {
    try {
      setLoading(true)
      const parsedData = {
        ...data,
        attribs: JSON.parse(data.attribs)
      }
      
      if (mode === "edit" && subscriber) {
        await api.subscribers.updateSubscriber(subscriber.id, parsedData)
        toast.success("Subscriber updated successfully")
      } else {
        await api.subscribers.createSubscriber(parsedData)
        toast.success("Subscriber created successfully")
      }
      onSuccess?.()
      setOpen(false)
      form.reset(defaultValues)
    } catch (error) {
      console.error("Error saving subscriber:", error)
      if (error instanceof SyntaxError) {
        toast.error("Invalid JSON in attributes field")
      } else {
        toast.error("Failed to save subscriber")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Subscriber
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New" : "Edit"} Subscriber</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              disabled={mode === "edit"}
              {...form.register("email")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...form.register("name")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attribs">Attributes (JSON)</Label>
            <Input
              id="attribs"
              {...form.register("attribs")}
              placeholder='{"country": "US", "interests": ["tech", "news"]}'
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : mode === "create" ? "Create" : "Update"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 