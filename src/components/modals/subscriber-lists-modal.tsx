"use client"

import { useEffect, useState, ReactNode } from "react"
import { api } from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { List, Subscriber, SubscriberList } from "@/lib/api/types"

interface SubscriberListsModalProps {
  subscriber: Subscriber
  onSuccess?: () => void
  children: ReactNode
}

export function SubscriberListsModal({
  subscriber,
  onSuccess,
  children
}: SubscriberListsModalProps) {
  const [open, setOpen] = useState(false)
  const [lists, setLists] = useState<List[]>([])
  const [subscriberLists, setSubscriberLists] = useState<SubscriberList[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLists = async () => {
    try {
      const data = await api.lists.getLists({})
      setLists(data)
    } catch (error) {
      console.error("Error fetching lists:", error)
      toast.error("Failed to fetch lists")
    }
  }

  const fetchSubscriberLists = async () => {
    try {
      const data = await api.subscriberLists.getSubscriberLists({
        subscriber_id: subscriber.id
      })
      setSubscriberLists(data)
    } catch (error) {
      console.error("Error fetching subscriber lists:", error)
      toast.error("Failed to fetch subscriber lists")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      setLoading(true)
      fetchLists()
      fetchSubscriberLists()
    }
  }, [open])

  const isSubscribed = (listId: number) => {
    return subscriberLists.some(sl => sl.list_id === listId)
  }

  const handleToggleList = async (listId: number) => {
    try {
      const existingSubscription = subscriberLists.find(sl => sl.list_id === listId)
      
      if (existingSubscription) {
        await api.subscriberLists.deleteSubscriberList(subscriber.id, listId)
        setSubscriberLists(prev => prev.filter(sl => sl.list_id !== listId))
        toast.success("Subscriber removed from list")
      } else {
        try {
          const newSubscriberList = await api.subscriberLists.createSubscriberList({
            subscriber_id: subscriber.id,
            list_id: listId,
            status: "Confirmed",
            meta: {}
          })
          setSubscriberLists(prev => [...prev, newSubscriberList])
          toast.success("Subscriber added to list")
        } catch (error: any) {
          // If the subscription already exists, just refresh the list
          if (error.response?.status === 500 && error.response?.data?.includes("duplicate key value")) {
            await fetchSubscriberLists()
            toast.info("Subscriber is already in this list")
            return
          }
          throw error
        }
      }
      onSuccess?.()
    } catch (error) {
      console.error("Error toggling list subscription:", error)
      toast.error("Failed to update list subscription")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Lists for {subscriber.email}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid gap-4 py-4">
            {lists.map((list) => (
              <div key={list.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`list-${list.id}`}
                  checked={isSubscribed(list.id)}
                  onCheckedChange={() => handleToggleList(list.id)}
                />
                <Label htmlFor={`list-${list.id}`}>
                  {list.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 