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
import { CampaignFormModal } from "@/components/modals/campaign-form-modal"
import { CampaignStatsModal } from "@/components/modals/campaign-stats-modal"
import { Trash2, PlayCircle, PauseCircle } from "lucide-react"
import { SearchBar } from "@/components/search-bar"
import { toast } from "sonner"
import { Campaign } from "@/lib/api/types"

export function CampaignsContent() {
  const searchParams = useSearchParams()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCampaigns = useCallback(async (searchTerm?: string) => {
    try {
      setLoading(true)
      const params = {
        page: Number(searchParams.get("page")) || 1,
        per_page: 10,
        query: searchTerm || searchParams.get("query") || "",
        order_by: "created_at",
        order: "DESC" as const
      }
      const response = await api.campaigns.getCampaigns(params)
      console.log('API Response:', response)
      
      if (response && 'items' in response) {
        setCampaigns(response.items)
      } else if (Array.isArray(response)) {
        setCampaigns(response)
      } else {
        setCampaigns([])
        console.error('Unexpected response format:', response)
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error)
      toast.error("Failed to fetch campaigns")
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const handleSearch = useCallback((term: string) => {
    fetchCampaigns(term)
  }, [fetchCampaigns])

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return
    try {
      await api.campaigns.deleteCampaign(id)
      toast.success("Campaign deleted successfully")
      fetchCampaigns()
    } catch (error) {
      console.error("Error deleting campaign:", error)
      toast.error("Failed to delete campaign")
    }
  }

  const handleToggleStatus = async (campaign: Campaign) => {
    try {
      const newStatus = campaign.status === "Running" ? "Paused" : "Running"
      await api.campaigns.updateCampaign(campaign.id, { status: newStatus })
      toast.success(`Campaign ${newStatus.toLowerCase()} successfully`)
      fetchCampaigns()
    } catch (error) {
      console.error("Error updating campaign status:", error)
      toast.error("Failed to update campaign status")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <CampaignFormModal mode="create" onSuccess={fetchCampaigns} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <SearchBar 
            placeholder="Search campaigns..." 
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
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!Array.isArray(campaigns) || campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No campaigns found
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant={campaign.campaign_type === "Regular" ? "default" : "secondary"}>
                        {campaign.campaign_type === "Regular" ? "Regular" : 
                         campaign.campaign_type === "Automated" ? "Automated" : "Sequence"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        campaign.status === "Running" ? "default" :
                        campaign.status === "Paused" ? "secondary" :
                        campaign.status === "Draft" ? "outline" :
                        "destructive"
                      }>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign.created_at ? formatDate(campaign.created_at) : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CampaignStatsModal campaignId={campaign.id} />
                        <CampaignFormModal mode="edit" campaign={campaign} onSuccess={fetchCampaigns} />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(campaign)}
                          disabled={campaign.status === "Draft" || campaign.status === "Finished"}
                        >
                          {campaign.status === "Running" ? (
                            <PauseCircle className="h-4 w-4" />
                          ) : (
                            <PlayCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(campaign.id)}
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