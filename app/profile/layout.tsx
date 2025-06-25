import type React from "react"
import type { Metadata } from "next"
import { ProfileSidebar } from "./components/ProfileSidebar"
import { ProfileMobileNav } from "./components/ProfileMobileNav"

export const metadata: Metadata = {
  title: "My Profile | Eleva",
  description: "Manage your profile, orders, and preferences",
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <ProfileSidebar />
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden mb-6">
            <ProfileMobileNav />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
