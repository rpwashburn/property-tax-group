"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { ComparablesPDFDocument } from "./comparables-pdf-document"
import type { ApiPropertyResponse, DetailedComparablesResponse } from "@/lib/properties/types/types"

interface PDFDownloadWrapperProps {
  property: ApiPropertyResponse
  comparablesData: DetailedComparablesResponse
  fileName: string
}

export default function PDFDownloadWrapper({ 
  property, 
  comparablesData, 
  fileName 
}: PDFDownloadWrapperProps) {
  return (
    <PDFDownloadLink
      document={<ComparablesPDFDocument property={property} comparablesData={comparablesData} />}
      fileName={fileName}
    >
      {({ /* blob, url, */ loading, error }) => {
        if (loading) {
          return (
            <Button disabled className="gap-2">
              <Download className="h-4 w-4 animate-spin" />
              Generating PDF...
            </Button>
          )
        }

        if (error) {
          return (
            <Button variant="destructive" disabled className="gap-2">
              <Download className="h-4 w-4" />
              Error generating PDF
            </Button>
          )
        }

        return (
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        )
      }}
    </PDFDownloadLink>
  )
} 