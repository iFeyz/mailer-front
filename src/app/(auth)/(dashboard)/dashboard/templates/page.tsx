"use client"

import { Suspense } from "react"
import { TemplatesContent } from "./templates-content"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function TemplatesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TemplatesContent />
    </Suspense>
  )
}