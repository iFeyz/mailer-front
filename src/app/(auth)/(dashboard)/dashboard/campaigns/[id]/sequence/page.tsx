"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { api } from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { SequenceEmail, Campaign, Template } from "@/lib/api/types"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmailPreviewModal } from "@/components/modals/email-preview-modal"
import { Badge } from "@/components/ui/badge"

export default function CampaignSequencePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const campaignId = Number(params.id)
  const [loading, setLoading] = useState(true)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [sequenceEmails, setSequenceEmails] = useState<SequenceEmail[]>([])
  const [newSequence, setNewSequence] = useState({
    subject: "",
    body: "",
    send_at: null as Date | null,
  })
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        // Fetch campaign and sequence emails in parallel
        const [campaignData, sequenceEmailsData] = await Promise.all([
          api.campaigns.getCampaign(campaignId),
          api.sequenceEmails.getAll({ campaign_id: campaignId })
        ])
        
        setCampaign(campaignData)
        setSequenceEmails(sequenceEmailsData)
      } catch (error) {
        console.error("Error loading sequence data:", error)
        toast.error("Failed to load sequence data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [campaignId])

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const data = await api.templates.getTemplates({
        page: 1,
        per_page: 100,
        order_by: "created_at",
        order: "DESC" as const
      })
      setTemplates(data)
    } catch (error) {
      console.error("Error loading templates:", error)
      toast.error("Failed to load templates")
    }
  }

  const handleAddSequence = async () => {
    try {
      if (!newSequence.send_at) return

      // Create the sequence email
      const newEmail = await api.sequenceEmails.CREATE({
        campaign_id: campaignId,
        position: sequenceEmails.length + 1,
        subject: newSequence.subject,
        body: newSequence.body,
        send_at: newSequence.send_at.toISOString(),
        is_active: true,
        content_type: "Html",
        metadata: {}
      })

      // Update local state
      setSequenceEmails(prev => [...prev, newEmail])
      
      // Reset form
      setNewSequence({
        subject: "",
        body: "",
        send_at: null
      })

      toast.success("Sequence email added")
    } catch (error) {
      console.error("Error adding sequence email:", error)
      toast.error("Failed to add sequence email")
    }
  }

  const handleDeleteSequence = async (id: number) => {
    try {
      // Delete the sequence email
      await api.sequenceEmails.DELETE(id)

      // Update local state after successful deletion
      setSequenceEmails(prev => prev.filter(email => email.id !== id))
      toast.success("Sequence email deleted")
    } catch (error) {
      console.error("Error deleting sequence email:", error)
      toast.error("Failed to delete sequence email")
    }
  }

  const loadSequenceEmails = async () => {
    try {
      const data = await api.sequenceEmails.getAll({ campaign_id: campaignId })
      setSequenceEmails(data)
    } catch (error) {
      toast.error("Failed to load sequences")
    }
  }

  const loadCampaign = async () => {
    try {
      const data = await api.campaigns.getCampaign(campaignId)
      setCampaign(data)
    } catch (error) {
      toast.error("Failed to load campaign")
    }
  }

  return (
    <div className="container py-6 space-y-6">
      {campaign && (
        <Card>
          <CardHeader>
            <CardTitle>{campaign.name}</CardTitle>
            <p className="text-sm text-muted-foreground">Campaign ID: {campaign.id}</p>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add New Sequence Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Subject"
            value={newSequence.subject}
            onChange={(e) => setNewSequence(prev => ({
              ...prev,
              subject: e.target.value
            }))}
          />
          <Textarea
            placeholder="Email content"
            value={newSequence.body}
            onChange={(e) => setNewSequence(prev => ({
              ...prev,
              body: e.target.value
            }))}
          />
          <div className="flex justify-end">
            <EmailPreviewModal 
              subject={newSequence.subject}
              body={newSequence.body}
            />
          </div>
          <DateTimePicker
            value={newSequence.send_at}
            onChange={(date) => setNewSequence(prev => ({
              ...prev,
              send_at: date
            }))}
          />
          <Select
            value={selectedTemplateId?.toString() || "none"}
            onValueChange={(value) => {
              const id = value === "none" ? null : parseInt(value)
              setSelectedTemplateId(id)
              if (id) {
                const selectedTemplate = templates.find(template => template.id === id)
                if (selectedTemplate) {
                  setNewSequence(prev => ({
                    ...prev,
                    subject: selectedTemplate.subject,
                    body: selectedTemplate.body
                  }))
                }
              } else {
                setNewSequence(prev => ({
                  ...prev,
                  subject: "",
                  body: ""
                }))
              }
            }}
            onOpenChange={(open) => {
              if (open) {
                loadTemplates()
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a template (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No template</SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id.toString()}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddSequence}>
            Add Sequence Email
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {sequenceEmails.map((sequence) => (
          <Card 
            key={sequence.id} 
            className={!sequence.is_active ? "opacity-80" : ""}
          >
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{sequence.subject}</h3>
                  <p className="text-sm text-muted-foreground">
                    Scheduled for: {new Date(sequence.send_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <EmailPreviewModal 
                    subject={sequence.subject}
                    body={sequence.body}
                  />
                  {sequence.is_active && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSequence(sequence.id)}
                    >
                      Delete
                    </Button>
                  )}
                  {!sequence.is_active && (
                    <Badge variant="secondary">Sent</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 