"use client"

import { Suspense } from "react"
import { CampaignsContent } from "./campaigns-content"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function CampaignsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CampaignsContent />
    </Suspense>
  )
}