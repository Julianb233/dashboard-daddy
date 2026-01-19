"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Bot, FolderKanban, Settings, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle
} from "@/components/ui/sheet"

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/settings", label: "Settings", icon: Settings },
]

interface NavLinkProps {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
  isCollapsed?: boolean
  onClick?: () => void
}

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  isCollapsed = false,
  onClick
}: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground/70",
        isCollapsed && "justify-center px-2"
      )}
      title={isCollapsed ? label : undefined}
    >
      <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  )
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "hidden md:flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar",
        className
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-lg text-sidebar-foreground hover:opacity-90 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <span>Dashboard Daddy</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-sidebar-foreground/50 text-center">
          Dashboard Daddy v1.0
        </p>
      </div>
    </aside>
  )
}

interface MobileSidebarProps {
  className?: string
}

export function MobileSidebar({ className }: MobileSidebarProps) {
  const pathname = usePathname()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("md:hidden", className)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        {/* Logo Section */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold text-lg text-sidebar-foreground"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Bot className="h-5 w-5" />
            </div>
            <span>Dashboard Daddy</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <SheetClose asChild key={item.href}>
              <NavLink
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
              />
            </SheetClose>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4 mt-auto">
          <p className="text-xs text-sidebar-foreground/50 text-center">
            Dashboard Daddy v1.0
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
