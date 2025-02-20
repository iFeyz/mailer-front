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
import { ListFormModal } from "@/components/modals/list-form-modal"
import { SearchBar } from "@/components/search-bar"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { List, ListType, ListOptin } from "@/lib/api/types"

export default function ListsPage() {
  const searchParams = useSearchParams()
  const [lists, setLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLists = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: Number(searchParams.get("page")) || 1,
        per_page: 10,
        query: searchParams.get("query") || "",
        order_by: "created_at",
        order: "DESC" as const
      }
      const data = await api.lists.getLists(params)
      setLists(data)
    } catch (error) {
      console.error("Error fetching lists:", error)
      toast.error("Failed to fetch lists")
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchLists()
  }, [fetchLists])

  const handleSearch = useCallback(() => {
    fetchLists()
  }, [fetchLists])

  const handleDelete = async (id: number) => {
    try {
      await api.lists.deleteList(id)
      toast.success("List deleted successfully")
      fetchLists()
    } catch (error) {
      console.error("Error deleting list:", error)
      toast.error("Failed to delete list")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Lists</h1>
        <ListFormModal mode="create" onSuccess={fetchLists} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <SearchBar 
            placeholder="Search lists..." 
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
                <TableHead>Opt-in</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No lists found
                  </TableCell>
                </TableRow>
              ) : (
                lists.map((list) => (
                  <TableRow key={list.id}>
                    <TableCell>{list.name}</TableCell>
                    <TableCell>
                      <Badge variant={
                        list.type === "Public" ? "default" :
                        list.type === "Private" ? "secondary" :
                        "outline"
                      }>
                        {list.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={list.optin === "Double" ? "default" : "secondary"}>
                        {list.optin}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {list.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{list.created_at ? formatDate(list.created_at) : "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ListFormModal 
                          mode="edit" 
                          list={list} 
                          onSuccess={fetchLists} 
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(list.id)}
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