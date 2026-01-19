"use client"

import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export function DashboardLayout({
  children,
  title,
  className
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - hidden on mobile, visible on md+ */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header with mobile menu toggle */}
        <Header title={title} />

        {/* Main content */}
        <main
          className={cn(
            "flex-1 overflow-auto",
            "p-4 md:p-6 lg:p-8",
            "bg-muted/30",
            className
          )}
        >
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
