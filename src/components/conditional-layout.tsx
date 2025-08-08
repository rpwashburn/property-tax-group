"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { FloatingAdminButton } from "@/components/floating-admin-button"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Check if this is a PDF route
  const isPDFRoute = pathname.startsWith('/pdf') || pathname.includes('/pdf')
  
  if (isPDFRoute) {
    // PDF layout - no header/footer
    return (
      <div className="w-full min-h-screen bg-white">
        {children}
      </div>
    )
  }
  
  // Regular layout - with header/footer
  return (
    <>
      <Header />
      <main className="flex flex-col flex-grow">
        {children}
      </main>
      <Footer />
      <FloatingAdminButton />
    </>
  )
} 