import { getUnifiedPropertyData } from "@/lib/property-analysis/services/property-service"
import type { EnrichedPropertyData } from "@/lib/properties"
import { StartClient } from "./start-client"
import { ReportErrorPage } from "./components/shared/report-error-page"

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

  let propertyData: EnrichedPropertyData | null = null
  try {
    propertyData = await getUnifiedPropertyData(accountNumber)
  } catch (error) {
    console.error("Failed to load property data on server:", error)
    // propertyData will remain null, leading to the propertyNotFound case
  }

  if (!propertyData) {
    return <ReportErrorPage errorType="propertyNotFound" accountNumber={accountNumber} />
  }

  return <StartClient propertyData={propertyData} accountNumber={accountNumber} />
}
