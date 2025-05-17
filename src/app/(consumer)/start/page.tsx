import { getPropertyDataByAccountNumber } from "@/lib/property-analysis/server"
import type { PropertyData } from "@/lib/property-analysis/types"
import { StartClient } from "./start-client"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

// This is now a Server Component
export default async function StartPage({ searchParams }: { searchParams: SearchParams }) {
  const accountNumber = (await searchParams).accountNumber as string | undefined

  let propertyData: PropertyData | null = null
  if (accountNumber) {
    try {
      propertyData = await getPropertyDataByAccountNumber(accountNumber)
    } catch (error) {
      console.error("Failed to load property data on server:", error)
    }
  }

  return <StartClient propertyData={propertyData} accountNumber={accountNumber || null} />
}
