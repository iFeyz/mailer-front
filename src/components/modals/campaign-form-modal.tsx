import { ReactNode, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Campaign, CreateCampaignDto, ContentType, CampaignType, UpdateCampaignDto, Template } from "@/lib/api/types"
import { api } from "@/lib/api-config"
import { toast } from "sonner"
import { PenSquare, Plus } from "lucide-react"
import { DateTimePicker } from "@/components/ui/date-time-picker"

interface CampaignFormModalProps {
  mode?: "create" | "edit"
  campaign?: Campaign
  onSuccess?: () => void
  children?: ReactNode
}

export function CampaignFormModal({ mode = "create", campaign, onSuccess, children }: CampaignFormModalProps) {
  const form = useForm<CreateCampaignDto>({
    defaultValues: {
      name: campaign?.name || "",
      subject: campaign?.subject || "",
      from_email: campaign?.from_email || "",
      campaign_type: campaign?.campaign_type || "Regular",
      messenger: campaign?.messenger || "smtp",
      sequence_start_date: campaign?.sequence_start_date || undefined,
      sequence_end_date: campaign?.sequence_end_date || undefined,
      template_id: campaign?.template_id,
      content_type: campaign?.content_type || "Html"
    },
  })

  const [templates, setTemplates] = useState<Template[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true)
      const data = await api.templates.getTemplates({
        page: 1,
        per_page: 100,
        order_by: "name",
        order: "ASC"
      })
      setTemplates(data || [])
    } catch (error) {
      console.error("Error fetching templates:", error)
      toast.error("Failed to fetch templates")
    } finally {
      setLoadingTemplates(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const selectedTemplate = templates.find(t => t.id === form.watch("template_id"))

  useEffect(() => {
    if (selectedTemplate) {
      form.setValue("subject", selectedTemplate.subject)
      form.setValue("body", selectedTemplate.body)
    }
  }, [selectedTemplate, form])

  useEffect(() => {
    if (mode === "edit" && campaign) {
      form.reset({
        name: campaign.name,
        subject: campaign.subject,
        from_email: campaign.from_email,
        campaign_type: campaign.campaign_type,
        messenger: campaign.messenger,
        template_id: campaign.template_id || undefined,
        sequence_start_date: campaign.sequence_start_date || undefined,
        sequence_end_date: campaign.sequence_end_date || undefined
      })
    }
  }, [mode, campaign, form])

  const onSubmit = async (data: CreateCampaignDto) => {
    try {
      if (mode === "edit" && campaign) {
        await api.campaigns.updateCampaign(campaign.id, {
          ...data,
          sequence_start_date: data.sequence_start_date ? new Date(data.sequence_start_date).toISOString() : undefined,
          sequence_end_date: data.sequence_end_date ? new Date(data.sequence_end_date).toISOString() : undefined,
        })
        toast.success("Campaign updated successfully")
      } else {
        await api.campaigns.createCampaign({
          ...data,
          sequence_start_date: data.sequence_start_date ? new Date(data.sequence_start_date).toISOString() : undefined,
          sequence_end_date: data.sequence_end_date ? new Date(data.sequence_end_date).toISOString() : undefined,
        })
        toast.success("Campaign created successfully")
      }
      onSuccess?.()
    } catch (error) {
      console.error("Error submitting campaign:", error)
      toast.error(mode === "edit" ? "Failed to update campaign" : "Failed to create campaign")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            {mode === "edit" ? <PenSquare className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Campaign" : "Create Campaign"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              rules={{ required: "Subject is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="from_email"
              rules={{ required: "From email is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="template_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <Select
                    value={field.value?.toString() || "none"}
                    onValueChange={(value) => {
                      field.onChange(value === "none" ? undefined : parseInt(value))
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No template</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />


            <Button type="submit">
              {mode === "edit" ? "Update Campaign" : "Create Campaign"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 