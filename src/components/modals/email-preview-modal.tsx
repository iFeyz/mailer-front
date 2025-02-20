"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useState } from "react"

interface EmailPreviewModalProps {
  subject: string
  body: string
}

export function EmailPreviewModal({ subject, body }: EmailPreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-auto">
          <div className="border-b pb-2">
            <p className="text-sm text-muted-foreground">Subject:</p>
            <p className="font-medium">{subject}</p>
          </div>
          <iframe
            srcDoc={body}
            className="w-full h-[60vh] border rounded-lg"
            title="Email Preview"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 