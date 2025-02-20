"use client"

import { useEffect, useState, useCallback, useRef } from "react"
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
import { toast } from "sonner"
import { 
  Campaign as ApiCampaign, 
  CampaignStatus, 
  List, 
  SubscriptionStatus 
} from "@/lib/api/types"
import { SearchBar } from "@/components/search-bar"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { CampaignFormModal } from "@/components/modals/campaign-form-modal"
import { Trash2, List as ListIcon, Plus, X, Send, FileText, Clock } from "lucide-react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link"
import { CampaignStatsModal } from "@/components/modals/campaign-stats-modal"
import { CampaignStatusManager } from "@/components/campaign-status-manager"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CampaignList {
  id: number
  campaign_id: number
  list_id: number
  list_name: string
}

interface CampaignsResponse {
  items: ApiCampaign[];
  total?: number;
}

interface UpdateCampaignDto {
  to_send?: number;
  // ... other existing properties
}

export default function CampaignsPage() {
    const searchParams = useSearchParams()
    const [campaigns, setCampaigns] = useState<CampaignsResponse>({ items: [] })
    const [campaignLists, setCampaignLists] = useState<Record<number, CampaignList[]>>({})
    const [availableLists, setAvailableLists] = useState<List[]>([])
    const [loading, setLoading] = useState(true)
    const [listsLoading, setListsLoading] = useState(false)
    const [selectedList, setSelectedList] = useState<string>("")
    const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null)
    const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all")
    const [searchTerm, setSearchTerm] = useState("")

    // Use a ref to track if this is the initial mount
    const isInitialMount = useRef(true)

    const fetchCampaigns = useCallback(async () => {
        try {
            setLoading(true)
            const params = {
                page: Number(searchParams.get("page")) || 1,
                per_page: 10,
                query: searchTerm,
                order_by: searchParams.get("order_by") || "created_at",
                order: (searchParams.get("order") || "DESC") as "ASC" | "DESC",
                status: statusFilter !== "all" ? statusFilter : undefined
            }
            const data = await api.campaigns.getCampaigns(params)
            setCampaigns(Array.isArray(data) ? { items: data } : data)
        } catch (error: any) {
            console.error("Error fetching campaigns:", error)
            toast.error(error.response?.data?.message || "Failed to fetch campaigns")
        } finally {
            setLoading(false)
        }
    }, [searchParams, statusFilter, searchTerm])

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
        if (!selectedList || selectedList === "none") return

        try {
            const campaign = campaigns.items.find(c => c.id === campaignId)
            if (!campaign) {
                throw new Error("Campaign not found")
            }

            // Get the number of sequence emails for this campaign
            const sequenceEmails = await api.sequenceEmails.getAll({ campaign_id: campaignId })
            const numberOfEmails = sequenceEmails.length || 1 // If no sequence emails, default to 1

            // Get confirmed subscribers in the list
            const subscriberLists = await api.subscriberLists.getSubscriberLists({
                list_id: parseInt(selectedList),
                status: "Confirmed" as SubscriptionStatus
            })

            // Calculate total new emails to send (subscribers × number of sequence emails)
            const newEmailsToSend = subscriberLists.length * numberOfEmails

            // Add list to campaign
            await api.campaigns.addListToCampaign(campaignId, parseInt(selectedList))

            // Update campaign's to_send count
            await api.campaigns.updateCampaign(campaignId, {
                to_send: (campaign.to_send || 0) + newEmailsToSend
            })

            await fetchCampaignLists(campaignId)
            setSelectedList("")
            toast.success("List added to campaign")
            fetchCampaigns() // Refresh campaign data to show updated to_send count
        } catch (error) {
            console.error("Error adding list:", error)
            toast.error("Failed to add list")
        }
    }

    const handleRemoveList = async (campaignId: number, listId: number) => {
        try {
            const campaign = campaigns.items.find(c => c.id === campaignId)
            if (!campaign) {
                throw new Error("Campaign not found")
            }

            // Get the number of sequence emails for this campaign
            const sequenceEmails = await api.sequenceEmails.getAll({ campaign_id: campaignId })
            const numberOfEmails = sequenceEmails.length || 1

            // Get confirmed subscribers in the list before removing it
            const subscriberLists = await api.subscriberLists.getSubscriberLists({
                list_id: listId,
                status: "Confirmed" as SubscriptionStatus
            })

            // Calculate total emails to remove (subscribers × number of sequence emails)
            const emailsToRemove = subscriberLists.length * numberOfEmails

            // Remove list from campaign
            await api.campaigns.removeListFromCampaign(campaignId, listId)

            // Update campaign's to_send count
            await api.campaigns.updateCampaign(campaignId, {
                to_send: Math.max(0, (campaign.to_send || 0) - emailsToRemove)
            })

            await fetchCampaignLists(campaignId)
            toast.success("List removed from campaign")
            fetchCampaigns() // Refresh campaign data to show updated to_send count
        } catch (error) {
            console.error("Error removing list:", error)
            toast.error("Failed to remove list")
        }
    }

    // Single useEffect for initial load and subsequent filter/search changes
    useEffect(() => {
        if (isInitialMount.current) {
            // Only fetch on mount
            fetchCampaigns()
            isInitialMount.current = false
            return
        }

        // Debounce subsequent changes
        const timer = setTimeout(() => {
            fetchCampaigns()
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm, statusFilter, searchParams, fetchCampaigns])

    // Handlers
    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term)
    }, [])

    const handleStatusFilter = useCallback((value: string) => {
        setStatusFilter(value as CampaignStatus | "all")
    }, [])

    const handleStatusChange = async (campaignId: number, newStatus: CampaignStatus) => {
        try {
            await api.campaigns.updateStatus(campaignId, newStatus)
            toast.success(`Campaign status updated to ${newStatus}`)
            fetchCampaigns()
        } catch (error: any) {
            console.error("Error updating campaign status:", error)
            toast.error(error.response?.data?.message || "Failed to update campaign status")
        }
    }

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

    const handleSort = (column: string) => {
        const currentOrderBy = searchParams.get("order_by") || "created_at"
        const currentOrder = searchParams.get("order") || "DESC"
        
        const newOrder = currentOrderBy === column && currentOrder === "DESC" ? "ASC" : "DESC"
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set("order_by", column)
        newSearchParams.set("order", newOrder)
        window.history.pushState({}, '', `?${newSearchParams.toString()}`)
        fetchCampaigns()
    }

    // Add this function to load lists when popover opens
    const handlePopoverOpen = async (campaignId: number) => {
        try {
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
                [campaignId]: lists
            }))
            setAvailableLists(availableLists)
        } catch (error) {
            console.error("Error loading lists:", error)
            toast.error("Failed to load lists")
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
                <Select
                    value={statusFilter}
                    onValueChange={handleStatusFilter}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Campaigns</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Running">Active</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Paused">Paused</SelectItem>
                        <SelectItem value="Finished">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>Name</TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("type")}>Type</TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("subject")}>Subject</TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>Status</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>Lists</TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("created_at")}>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaigns.items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">No campaigns found</TableCell>
                                </TableRow>
                            ) : (
                                campaigns.items.map((campaign) => (
                                    <TableRow key={campaign.id}>
                                        <TableCell>{campaign.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={campaign.campaign_type === 'Regular' ? 'default' : 'secondary'}>
                                                {campaign.campaign_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{campaign.subject}</TableCell>
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
                                                                campaign.status === 'Scheduled' ? 'outline' :
                                                                campaign.status === 'Paused' ? 'destructive' :
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
                                                    <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'Scheduled')}>
                                                        Set as Scheduled
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'Paused')}>
                                                        Set as Paused
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
                                                        onClick={() => handlePopoverOpen(campaign.id)}
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
                                        <TableCell>{formatDate(campaign.created_at || '')}</TableCell>
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