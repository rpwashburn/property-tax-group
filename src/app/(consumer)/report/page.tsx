import { getPropertyDataByAccountNumber } from "@/lib/property-analysis/server"
import type { PropertyData } from "@/lib/property-analysis/types"
import { StartClient } from "./start-client"
import { ReportErrorPage } from "./components/report-error-page"

type SearchParams = { [key: string]: string | string[] | undefined }

// This is now a Server Component
export default async function StartPage({ searchParams }: { searchParams: SearchParams }) {
  const accountNumber = searchParams.accountNumber as string | undefined

  if (!accountNumber) {
    return <ReportErrorPage errorType="noAccountNumber" />
  }

  let propertyData: PropertyData | null = null
  try {
    propertyData = await getPropertyDataByAccountNumber(accountNumber)
  } catch (error) {
    console.error("Failed to load property data on server:", error)
    // propertyData will remain null, leading to the propertyNotFound case
  }

  if (!propertyData) {
    return <ReportErrorPage errorType="propertyNotFound" accountNumber={accountNumber} />
  }

  return <StartClient propertyData={propertyData} accountNumber={accountNumber} />
}
