"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { User, Package, Heart, Settings, CreditCard, MapPin, Bell, Shield, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navigation = [
  { name: "Overview", href: "/profile", icon: User },
  { name: "Orders", href: "/profile/orders", icon: Package },
  { name: "Favorites", href: "/profile/favorites", icon: Heart },
  { name: "Addresses", href: "/profile/addresses", icon: MapPin },
  { name: "Payment", href: "/profile/payment", icon: CreditCard },
  { name: "Notifications", href: "/profile/notifications", icon: Bell },
  { name: "Security", href: "/profile/security", icon: Shield },
  { name: "Settings", href: "/profile/settings", icon: Settings },
]

export function ProfileMobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const currentPage = navigation.find((item) => item.href === pathname)

  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center space-x-3">
        {currentPage?.icon && <currentPage.icon className="h-5 w-5 text-gray-600" />}
        <h1 className="text-lg font-semibold text-gray-900">{currentPage?.name || "Profile"}</h1>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <div className="py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Profile Menu</h2>
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
