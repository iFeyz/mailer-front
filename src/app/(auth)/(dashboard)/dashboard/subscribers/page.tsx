"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api-config"
import { toast } from "sonner"
import { CreateSubscriberModal } from "@/components/modals/create-subscriber-modal"
import { ImportSubscribersModal } from "@/components/modals/import-subscribers-modal"
import { formatDate } from "@/lib/utils"
import { Subscriber, List, SubscriberPaginationParams } from "@/lib/api/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  ListChecks,
  ArrowUpDown,
} from "lucide-react"
import { SubscriberListsModal } from "@/components/modals/subscriber-lists-modal"
import { Input } from "@/components/ui/input"

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [lists, setLists] = useState<List[]>([])
  const [selectedList, setSelectedList] = useState("none")
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC")
  const PER_PAGE = 10

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true)
      const params: SubscriberPaginationParams = {
        page: currentPage,
        per_page: PER_PAGE,
        query: searchQuery,
        list_id: selectedList !== "none" ? [parseInt(selectedList)] : undefined,
        order_by: sortBy,
        order: sortOrder
      }
      
      const response = await api.subscribers.getSubscribers(params)
      
      if (searchQuery && !Array.isArray(response)) {
        setSubscribers([response as unknown as Subscriber])
        setHasMore(false)
      } else {
        const items = Array.isArray(response) ? response : response.items || []
        setSubscribers(items)
        setHasMore(items.length === PER_PAGE)
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error)
      toast.error("Failed to fetch subscribers")
      setSubscribers([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery, selectedList, sortBy, sortOrder])

  const fetchLists = async () => {
    try {
      const data = await api.lists.getLists({})
      setLists(data)
    } catch (error) {
      console.error("Error fetching lists:", error)
      toast.error("Failed to fetch lists")
    }
  }

  useEffect(() => {
    fetchLists()
  }, [])

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  const handleDelete = async (id: number) => {
    try {
      await api.subscribers.deleteSubscriber(id)
      toast.success("Subscriber deleted successfully")
      fetchSubscribers()
    } catch (error) {
      console.error("Error deleting subscriber:", error)
      toast.error("Failed to delete subscriber")
    }
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setSearchInput("")
    setSearchQuery("")
    setSelectedList("none")
    setSortBy("created_at")
    setSortOrder("DESC")
    setCurrentPage(1)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")
    } else {
      setSortBy(field)
      setSortOrder("DESC")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Subscribers</h1>
        <div className="flex items-center space-x-2">
          <ImportSubscribersModal onSuccess={fetchSubscribers} />
          <CreateSubscriberModal onSuccess={fetchSubscribers} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className="max-w-sm"
          />
          <Button 
            onClick={handleSearch}
            variant="secondary"
          >
            Search
          </Button>
        </div>

        <Select
          value={selectedList}
          onValueChange={(value) => {
            setSelectedList(value)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by list" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">All Lists</SelectItem>
            {lists.map((list) => (
              <SelectItem key={list.id} value={list.id.toString()}>
                {list.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value) => {
            setSortBy(value)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Date Added</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")}
        >
          {sortOrder === "ASC" ? "↑" : "↓"}
        </Button>

        <Button
          variant="outline"
          onClick={resetFilters}
        >
          Reset Filters
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No subscribers found
        </div>
      ) : (
        <>
          <div className="border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("email")}
                      className="p-0"
                    >
                      Email
                      <ArrowUpDown className="h-4 w-4 ml-2" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("name")}
                      className="p-0"
                    >
                      Name
                      <ArrowUpDown className="h-4 w-4 ml-2" />
                    </Button>
                  </th>
                  <th className="text-left p-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("created_at")}
                      className="p-0"
                    >
                      Created
                      <ArrowUpDown className="h-4 w-4 ml-2" />
                    </Button>
                  </th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b last:border-0">
                    <td className="p-2">{subscriber.email}</td>
                    <td className="p-2">{subscriber.name || "-"}</td>
                    <td className="p-2">
                      {subscriber.created_at ? formatDate(subscriber.created_at) : "-"}
                    </td>
                    <td className="p-2 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <SubscriberListsModal
                          subscriber={subscriber}
                          onSuccess={fetchSubscribers}
                        >
                          <Button variant="ghost" size="sm">
                            <ListChecks className="h-4 w-4" />
                          </Button>
                        </SubscriberListsModal>
                        <CreateSubscriberModal
                          mode="edit"
                          subscriber={subscriber}
                          onSuccess={fetchSubscribers}
                        >
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </CreateSubscriberModal>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(subscriber.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} - Showing {subscribers.length} subscribers
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={!hasMore}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 