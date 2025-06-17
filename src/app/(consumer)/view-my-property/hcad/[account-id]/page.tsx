import type React from "react"
import { getPropertyDataByAccountNumber } from "@/lib/properties"
import { PropertyDetailsView } from "@/components/property/property-details-view"
import { PropertyErrorView } from "@/components/property/property-error-view"

interface ViewPropertyPageProps {
  params: Promise<{
    "account-id": string
  }>
}

export default async function ViewPropertyPage({ params }: ViewPropertyPageProps) {
  const { "account-id": accountId } = await params

  // Fetch property data from API (server-side)
  let propertyData = null
  let error = null

  try {
    propertyData = await getPropertyDataByAccountNumber(accountId)
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch property data"
    console.error("Error fetching property data:", err)
  }

  // Handle error states
  if (error || !propertyData) {
    return (
      <PropertyErrorView
        accountId={accountId}
        error={error}
      />
    )
  }
  // Render main property details
  return <PropertyDetailsView accountId={accountId} propertyData={propertyData} />
}