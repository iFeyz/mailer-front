"use client"

import { Suspense } from "react"
import { ListsContent } from "./lists-content"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function ListsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ListsContent />
    </Suspense>
  )
} 