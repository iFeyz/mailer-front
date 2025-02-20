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
import { Trash2, PlayCircle, PauseCircle, Clock, PenSquare, BarChart2, ListIcon, Plus, X } from "lucide-react"
import { SearchBar } from "@/components/search-bar"
import { toast } from "sonner"
import { Campaign, CampaignStatus, CampaignList, List } from "@/lib/api/types"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CampaignsContent() {
  const searchParams = useSearchParams()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [campaignLists, setCampaignLists] = useState<Record<number, CampaignList[]>>({})
  const [availableLists, setAvailableLists] = useState<List[]>([])
  const [selectedList, setSelectedList] = useState<string>("")
  const [listsLoading, setListsLoading] = useState(false)

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
      const newStatus = campaign.status === "Running" ? "Finished" : "Running"
      await api.campaigns.updateCampaign(campaign.id, { status: newStatus })
      toast.success(`Campaign ${newStatus.toLowerCase()} successfully`)
      fetchCampaigns()
    } catch (error) {
      console.error("Error updating campaign status:", error)
      toast.error("Failed to update campaign status")
    }
  }

  const handleStatusChange = async (id: number, newStatus: CampaignStatus) => {
    try {
      await api.campaigns.updateCampaign(id, { status: newStatus })
      toast.success(`Campaign ${newStatus.toLowerCase()} successfully`)
      fetchCampaigns()
    } catch (error) {
      console.error("Error updating campaign status:", error)
      toast.error("Failed to update campaign status")
    }
  }

  const fetchCampaignLists = async (campaignId: number) => {
    try {
      setListsLoading(true)
      const [lists, availableLists] = await Promise.all([
        api.campaigns.getCampaignLists(campaignId),
        api.lists.getLists({
          page: 1,
          per_page: 100,
          order_by: "name",
          order: "ASC"
        })
      ])
      setCampaignLists(prev => ({
        ...prev,
        [campaignId]: lists || []
      }))
      setAvailableLists(availableLists || [])
    } catch (error) {
      console.error("Error fetching lists:", error)
      toast.error("Failed to fetch lists")
    } finally {
      setListsLoading(false)
    }
  }

  const handleAddList = async (campaignId: number) => {
    if (!selectedList) return
    try {
      await api.campaigns.addListToCampaign(campaignId, parseInt(selectedList))
      await fetchCampaignLists(campaignId)
      setSelectedList("")
      toast.success("List added to campaign")
    } catch (error) {
      console.error("Error adding list:", error)
      toast.error("Failed to add list")
    }
  }

  const handleRemoveList = async (campaignId: number, listId: number) => {
    try {
      await api.campaigns.removeListFromCampaign(campaignId, listId)
      await fetchCampaignLists(campaignId)
      toast.success("List removed from campaign")
    } catch (error) {
      console.error("Error removing list:", error)
      toast.error("Failed to remove list")
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
                <TableHead>Lists</TableHead>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 space-x-2 border"
                          >
                            <Badge 
                              variant={
                                campaign.status === 'Running' ? 'default' :
                                campaign.status === 'Draft' ? 'secondary' :
                                campaign.status === 'Cancelled' ? 'destructive' :
                                'outline'
                              }
                            >
                              {campaign.status}
                            </Badge>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'Draft')}>
                            Set as Draft
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'Running')}>
                            Set as Running
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'Finished')}>
                            Set as Finished
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'Cancelled')}>
                            Set as Cancelled
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => fetchCampaignLists(campaign.id)}
                          >
                            <div className="flex items-center gap-2">
                              <ListIcon className="h-4 w-4" />
                              <span>{campaignLists[campaign.id]?.length || 0} Lists</span>
                            </div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Manage Lists</h4>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={selectedList}
                                  onValueChange={setSelectedList}
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a list" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableLists.map((list) => (
                                      <SelectItem 
                                        key={list.id} 
                                        value={list.id.toString()}
                                        disabled={campaignLists[campaign.id]?.some(
                                          cl => cl.list_id === list.id
                                        )}
                                      >
                                        {list.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => handleAddList(campaign.id)}
                                  disabled={!selectedList}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {campaignLists[campaign.id]?.map((list) => (
                                <div 
                                  key={list.id} 
                                  className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
                                >
                                  <span className="text-sm font-medium">{list.list_name}</span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleRemoveList(campaign.id, list.list_id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>{campaign.created_at ? formatDate(campaign.created_at) : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CampaignFormModal mode="edit" campaign={campaign} onSuccess={fetchCampaigns} />
                        <Link href={`/dashboard/campaigns/${campaign.id}/sequence`}>
                          <Button variant="ghost" size="icon">
                            <Clock className="h-4 w-4" />
                          </Button>
                        </Link>
                        <CampaignStatsModal campaignId={campaign.id} />
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