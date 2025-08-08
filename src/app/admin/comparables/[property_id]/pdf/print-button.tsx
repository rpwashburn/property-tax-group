"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import type { ApiPropertyResponse, DetailedComparablesResponse } from "@/lib/properties/types/types"

// Create a wrapper component for PDF functionality
const PDFDownloadWrapper = dynamic(
  () => import("./pdf-download-wrapper"),
  {
    ssr: false,
    loading: () => (
      <Button disabled className="gap-2">
        <Download className="h-4 w-4 animate-spin" />
        Loading PDF...
      </Button>
    ),
  }
)

interface PrintButtonProps {
  property: ApiPropertyResponse
  comparablesData: DetailedComparablesResponse
}

export function PrintButton({ property, comparablesData }: PrintButtonProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const fileName = `comparables-analysis-${property.accountId}-${new Date().toISOString().split('T')[0]}.pdf`

  if (!isClient) {
    return (
      <Button disabled className="gap-2">
        <Download className="h-4 w-4" />
        Download PDF
      </Button>
    )
  }

  return (
    <PDFDownloadWrapper
      property={property}
      comparablesData={comparablesData}
      fileName={fileName}
    />
  )
} 