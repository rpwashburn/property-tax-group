"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Home, MapPin, AlertCircle, Clock } from "lucide-react"
import type { ApiPropertyResponse } from "@/lib/properties/types/types"

interface PropertyHeaderProps {
  accountId: string
  propertyData: ApiPropertyResponse
}

export function PropertyHeader({ accountId, propertyData }: PropertyHeaderProps) {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <motion.div variants={fadeIn} className="text-center space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Home className="h-6 w-6 text-primary" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Property Analysis</h1>
            <p className="text-muted-foreground">Account #{accountId}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-2">
            <MapPin className="h-3 w-3" />
            Houston, TX (HCAD)
          </Badge>
          {propertyData.status.protested === "Y" && (
            <Badge variant="destructive" className="gap-2">
              <AlertCircle className="h-3 w-3" />
              Protested
            </Badge>
          )}
          {propertyData.status.noticed === "Y" && (
            <Badge variant="outline" className="gap-2">
              <Clock className="h-3 w-3" />
              Noticed
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  )
}
