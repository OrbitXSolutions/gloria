"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Package, Heart, Crown, Edit, TrendingUp, Calendar, Star } from "lucide-react"
import Link from "next/link"

export function ProfileOverview() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Overview</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
        <Button className="mt-4 sm:mt-0">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder.svg?height=96&width=96" />
              <AvatarFallback className="text-xl font-medium bg-gradient-to-br from-gray-100 to-gray-200">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-900">John Doe</h2>
                <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800">
                  <Crown className="h-3 w-3 mr-1" />
                  VIP Member
                </Badge>
              </div>
              <p className="text-gray-600">john.doe@example.com</p>
              <p className="text-gray-600">+1 (555) 123-4567</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Member since Jan 2024
                </span>
                <span className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  4.9 Rating
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">24</p>
                <p className="text-sm text-gray-600">Favorites</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">$2,450</p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Gold</p>
                <p className="text-sm text-gray-600">VIP Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">#ORD-2024-001</p>
                <p className="text-sm text-gray-600">Chanel No. 5 - 100ml</p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200">
                Delivered
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">#ORD-2024-002</p>
                <p className="text-sm text-gray-600">Dior Sauvage - 60ml</p>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Shipped
              </Badge>
            </div>
            <Link href="/profile/orders">
              <Button variant="outline" className="w-full">
                View All Orders
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Favorite Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <img
                src="/placeholder.svg?height=48&width=48"
                alt="Product"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Tom Ford Black Orchid</p>
                <p className="text-sm text-gray-600">$180.00</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <img
                src="/placeholder.svg?height=48&width=48"
                alt="Product"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Creed Aventus</p>
                <p className="text-sm text-gray-600">$365.00</p>
              </div>
            </div>
            <Link href="/profile/favorites">
              <Button variant="outline" className="w-full">
                View All Favorites
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
