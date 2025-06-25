"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Edit, Trash2, Home, Building, Star } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const addresses = [
  {
    id: 1,
    type: "home",
    isDefault: true,
    name: "John Doe",
    company: "",
    address1: "123 Main Street",
    address2: "Apt 4B",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    phone: "+1 (555) 123-4567",
  },
  {
    id: 2,
    type: "work",
    isDefault: false,
    name: "John Doe",
    company: "Tech Corp Inc.",
    address1: "456 Business Ave",
    address2: "Suite 200",
    city: "New York",
    state: "NY",
    zipCode: "10002",
    country: "United States",
    phone: "+1 (555) 987-6543",
  },
]

export function AddressesClient() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Addresses</h1>
          <p className="text-gray-600 mt-1">Manage your delivery addresses</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <Input id="company" placeholder="Company name" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address1">Address Line 1</Label>
                <Input id="address1" placeholder="123 Main Street" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                <Input id="address2" placeholder="Apt, suite, etc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="New York" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ny">New York</SelectItem>
                    <SelectItem value="ca">California</SelectItem>
                    <SelectItem value="tx">Texas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input id="zip" placeholder="10001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+1 (555) 123-4567" />
              </div>
              <div className="flex items-center space-x-2 md:col-span-2">
                <Checkbox id="default" />
                <Label htmlFor="default">Set as default address</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Save Address</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <Card key={address.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {address.type === "home" ? (
                    <Home className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Building className="h-5 w-5 text-gray-600" />
                  )}
                  <CardTitle className="text-lg capitalize">{address.type} Address</CardTitle>
                </div>
                {address.isDefault && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Star className="h-3 w-3 mr-1" />
                    Default
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{address.name}</p>
                {address.company && <p className="text-sm text-gray-600">{address.company}</p>}
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>{address.address1}</p>
                {address.address2 && <p>{address.address2}</p>}
                <p>
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p>{address.country}</p>
                <p>{address.phone}</p>
              </div>

              <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                {!address.isDefault && (
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4 mr-2" />
                    Set Default
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {addresses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-gray-600 mb-4">Add your first shipping address to get started.</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
