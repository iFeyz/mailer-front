"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Play, Pause, Square, Clock, Ban } from "lucide-react"
import { Campaign, CampaignStatus } from "@/lib/api/types"
import { api } from "@/lib/api-config"
import { toast } from "sonner"

interface CampaignStatusManagerProps {
  campaign: Campaign
  onStatusChange: () => void
}

const statusConfig = {
  Draft: {
    icon: Clock,
    color: "secondary",
    allowedTransitions: ["Running", "Scheduled", "Cancelled"],
  },
  Running: {
    icon: Play,
    color: "default",
    allowedTransitions: ["Paused", "Finished", "Cancelled"],
  },
  Scheduled: {
    icon: Clock,
    color: "outline",
    allowedTransitions: ["Running", "Cancelled"],
  },
  Paused: {
    icon: Pause,
    color: "destructive",
    allowedTransitions: ["Running", "Finished", "Cancelled"],
  },
  Cancelled: {
    icon: Ban,
    color: "destructive",
    allowedTransitions: [],
  },
  Finished: {
    icon: Square,
    color: "outline",
    allowedTransitions: [],
  },
} as const

export function CampaignStatusManager({ campaign, onStatusChange }: CampaignStatusManagerProps) {
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: CampaignStatus) => {
    if (!campaign.can_change_status) {
      toast.error("Cannot change campaign status at this time")
      return
    }

    try {
      setLoading(true)
      await api.campaigns.updateStatus(campaign.id, newStatus)
      toast.success(`Campaign status updated to ${newStatus}`)
      onStatusChange()
    } catch (error: any) {
      console.error("Error updating campaign status:", error)
      toast.error(error.response?.data?.message || "Failed to update campaign status")
    } finally {
      setLoading(false)
    }
  }

  const StatusIcon = statusConfig[campaign.status].icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 space-x-2 border"
          disabled={loading || !campaign.can_change_status}
        >
          <StatusIcon className="h-4 w-4" />
          <Badge variant={statusConfig[campaign.status].color as any}>
            {campaign.status}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusConfig[campaign.status].allowedTransitions.map((status) => {
          const Icon = statusConfig[status as CampaignStatus].icon
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusChange(status as CampaignStatus)}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>Change to {status}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 