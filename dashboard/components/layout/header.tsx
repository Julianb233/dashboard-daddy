"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Moon, Sun, LogOut, User, Settings, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MobileSidebar } from "./sidebar"
import { cn } from "@/lib/utils"

interface HeaderProps {
  title?: string
  className?: string
}

export function Header({ title = "Dashboard Daddy", className }: HeaderProps) {
  const { data: session, status } = useSession()
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    } else {
      setIsDark(false)
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setIsDark(false)
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setIsDark(true)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" })
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (session?.user?.name) {
      const names = session.user.name.split(" ")
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return session.user.name.substring(0, 2).toUpperCase()
    }
    if (session?.user?.email) {
      return session.user.email.substring(0, 2).toUpperCase()
    }
    return "DD"
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-16 items-center justify-between",
        "border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "px-4 md:px-6",
        className
      )}
    >
      {/* Left side: Mobile menu + Title */}
      <div className="flex items-center gap-4">
        <MobileSidebar />
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      </div>

      {/* Right side: Theme toggle + User menu */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="h-9 w-9"
          >
            {isDark ? (
              <Sun className="h-5 w-5 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="h-5 w-5 transition-transform hover:-rotate-12" />
            )}
          </Button>
        )}

        {/* User Avatar Dropdown */}
        {status === "loading" ? (
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          </div>
        ) : session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 gap-2 rounded-full pl-2 pr-3 hover:bg-accent"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src={session.user.image || undefined}
                    alt={session.user.name || "User avatar"}
                  />
                  <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline-block text-sm font-medium max-w-[120px] truncate">
                  {session.user.name || session.user.email}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user.name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="default" size="sm">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
