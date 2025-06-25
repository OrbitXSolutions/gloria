"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Heart, Search, Filter, ShoppingCart, Star, Trash2 } from "lucide-react"

const favorites = [
  {
    id: 1,
    name: "Chanel No. 5",
    brand: "Chanel",
    price: 180.0,
    originalPrice: 200.0,
    image: "/placeholder.svg?height=200&width=200",
    category: "Women",
    rating: 4.8,
    reviews: 1250,
    inStock: true,
    dateAdded: "2024-01-15",
  },
  {
    id: 2,
    name: "Creed Aventus",
    brand: "Creed",
    price: 365.0,
    originalPrice: 365.0,
    image: "/placeholder.svg?height=200&width=200",
    category: "Men",
    rating: 4.9,
    reviews: 890,
    inStock: true,
    dateAdded: "2024-01-20",
  },
  {
    id: 3,
    name: "Tom Ford Black Orchid",
    brand: "Tom Ford",
    price: 180.0,
    originalPrice: 220.0,
    image: "/placeholder.svg?height=200&width=200",
    category: "Unisex",
    rating: 4.7,
    reviews: 650,
    inStock: false,
    dateAdded: "2024-01-25",
  },
  {
    id: 4,
    name: "Dior Sauvage",
    brand: "Dior",
    price: 120.0,
    originalPrice: 140.0,
    image: "/placeholder.svg?height=200&width=200",
    category: "Men",
    rating: 4.6,
    reviews: 2100,
    inStock: true,
    dateAdded: "2024-02-01",
  },
]

export function FavoritesClient() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const filteredFavorites = favorites.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category.toLowerCase() === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Sort favorites
  filteredFavorites.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      case "oldest":
        return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600 mt-1">{favorites.length} saved items</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search favorites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="unisex">Unisex</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Favorites Grid */}
      {filteredFavorites.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites found</h3>
            <p className="text-gray-600">Try adjusting your search or browse our collection to add favorites.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFavorites.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/50 rounded-t-lg flex items-center justify-center">
                      <Badge variant="secondary" className="bg-white text-gray-900">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">{item.brand}</p>
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                    </div>
                    <span className="text-sm text-gray-400">({item.reviews})</span>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</span>
                      {item.originalPrice > item.price && (
                        <span className="text-sm text-gray-500 line-through">${item.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  <Button className="w-full" disabled={!item.inStock}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.inStock ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
