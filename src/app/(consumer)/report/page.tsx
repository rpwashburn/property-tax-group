import { getPropertyDataByAccountNumber } from "@/lib/property-analysis/server"
import type { PropertyData } from "@/lib/property-analysis/types"
import { StartClient } from "./start-client"
import { ReportErrorPage } from "./components/report-error-page"

// Define the shape of the resolved search parameters
type ResolvedSearchParams = { [key: string]: string | string[] | undefined }

// This is now a Server Component
// As per the type error, PageProps expects the searchParams property to be a Promise.
export default async function StartPage(
  { searchParams }: { searchParams: Promise<ResolvedSearchParams> }
) {
  const resolvedParams = await searchParams; // Await the promise to get the actual parameters
  const accountNumber = resolvedParams.accountNumber as string | undefined;

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
