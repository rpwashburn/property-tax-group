"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Home } from "lucide-react"
import Link from "next/link"

interface PropertyErrorViewProps {
  accountId: string
  error: string | null
}

export function PropertyErrorView({ accountId, error }: PropertyErrorViewProps) {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={staggerChildren} className="space-y-6">
            <motion.div variants={fadeIn} className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Property Not Found</h1>
              <p className="text-muted-foreground text-lg">Account #{accountId}</p>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Error Loading Property
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-red-600">{error}</p>
                  <p className="text-sm text-muted-foreground">
                    Please check the account number and try again, or contact support if the issue persists.
                  </p>

                  <div className="flex gap-3 pt-4">
                    <Link href="/view-my-property">
                      <Button variant="outline">Try Another Property</Button>
                    </Link>
                    <Link href="/">
                      <Button>Back to Home</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={staggerChildren} className="space-y-6">
          <motion.div variants={fadeIn} className="text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Property Not Found</h1>
            <p className="text-muted-foreground text-lg">Account #{accountId}</p>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle>No Property Found</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  No property was found for account number: <span className="font-mono font-medium">{accountId}</span>
                </p>
                <p className="text-sm text-muted-foreground">Please verify the account number and try again.</p>
                <div className="flex gap-3 pt-4">
                  <Link href="/view-my-property">
                    <Button variant="outline">Try Another Property</Button>
                  </Link>
                  <Link href="/">
                    <Button>Back to Home</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
