"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getUnifiedPropertyData } from "@/lib/property-analysis/services/property-service"

export function PropertyAnalysisForm() {
  const searchParams = useSearchParams()
  const [accountNumber, setAccountNumber] = useState(searchParams.get("accountNumber") || "")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    setAccountNumber(value)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = await getUnifiedPropertyData(accountNumber)
      if (!data) {
        toast.error("Property not found")
        return
      }
      router.push(`/start?accountNumber=${accountNumber}`)
    } catch {
      toast.error("Failed to load property data")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          id="accountNumber"
          placeholder="Enter your 13-digit account number"
          value={accountNumber}
          onChange={handleInputChange}
          maxLength={13}
          pattern="[0-9]{11,13}"
          required
          disabled={isLoading}
        />
        <p className="text-sm text-gray-500">
          Account numbers must be 13 digits (may have up to 2 leading zeros)
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Loading..." : "Analyze Property"}
      </Button>
    </form>
  )
} 