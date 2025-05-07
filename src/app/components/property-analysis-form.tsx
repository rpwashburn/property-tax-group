"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getPropertyDataByAccountNumber } from "@/lib/property-analysis/server"

export function PropertyAnalysisForm() {
  const searchParams = useSearchParams()
  const [accountNumber, setAccountNumber] = useState(searchParams.get("accountNumber") || "")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    setAccountNumber(value)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = await getPropertyDataByAccountNumber(accountNumber)
      if (!data) {
        toast({
          title: "Error",
          description: "Property not found",
          variant: "destructive",
        })
        return
      }
      router.push(`/start?accountNumber=${accountNumber}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load property data",
        variant: "destructive",
      })
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