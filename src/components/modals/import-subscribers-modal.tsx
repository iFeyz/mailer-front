import { ReactNode, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api-config"
import { toast } from "sonner"
import { Upload } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { List } from "@/lib/api/types"

interface ImportSubscribersModalProps {
  onSuccess?: () => void
  children?: ReactNode
}

export function ImportSubscribersModal({ onSuccess, children }: ImportSubscribersModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [lists, setLists] = useState<List[]>([])
  const [selectedList, setSelectedList] = useState<string>("none")

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const data = await api.lists.getLists({})
        setLists(data)
      } catch (error) {
        console.error("Error fetching lists:", error)
        toast.error("Failed to fetch lists")
      }
    }
    fetchLists()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
    } else {
      toast.error("Please select a valid CSV file")
      e.target.value = ""
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first")
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result as string
        const lines = text.split("\n")
        const total = lines.length - 1 // Exclude header row
        let processed = 0

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue

          const [email, name] = line.split(",").map(field => field.trim())
          if (email) {
            try {
              // Create subscriber
              const subscriber = await api.subscribers.createSubscriber({
                email,
                name: name || undefined
              })

              // Add to selected list if one is chosen
              if (selectedList && selectedList !== "none") {
                await api.subscriberLists.createSubscriberList({
                  subscriber_id: subscriber.id,
                  list_id: parseInt(selectedList),
                  status: "Confirmed",
                  meta: {}
                })
              }

              processed++
              setProgress((processed / total) * 100)
            } catch (error) {
              console.error(`Error adding subscriber ${email}:`, error)
              // Continue with next subscriber
            }
          }
        }

        toast.success(`Successfully imported ${processed} subscribers`)
        onSuccess?.()
        setFile(null)
        setUploading(false)
        setProgress(0)
      }

      reader.readAsText(file)
    } catch (error) {
      console.error("Error processing CSV:", error)
      toast.error("Failed to process CSV file")
      setUploading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Import Subscribers
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Subscribers from CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Upload a CSV file with the following columns:
            </p>
            <code className="text-sm bg-muted p-2 rounded block">
              email,name
            </code>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Add subscribers to list (optional):</p>
            <Select value={selectedList} onValueChange={setSelectedList}>
              <SelectTrigger>
                <SelectValue placeholder="Select a list" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No list</SelectItem>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id.toString()}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
          />

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                Importing subscribers... {Math.round(progress)}%
              </p>
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? "Importing..." : "Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 