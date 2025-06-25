"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Edit, Trash2, Home, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/lib/common/profile-queries";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export function AddressesClient() {
  const { user: authUser } = useSupabaseUser();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  useEffect(() => {
    async function loadAddresses() {
      if (!authUser?.id) return;

      try {
        const addressesData = await getUserAddresses(
          Number.parseInt(authUser.id)
        );
        setAddresses(addressesData);
      } catch (error) {
        console.error("Error loading addresses:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAddresses();
  }, [authUser]);

  const handleCreateAddress = async (formData: FormData) => {
    if (!authUser?.id) return;

    const addressData = {
      full_name: formData.get("name") as string,
      address: formData.get("address1") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      state_code: formData.get("state") as string,
      is_default: formData.get("default") === "on",
      notes: formData.get("address2") as string,
    };

    const result = await createAddress(
      addressData,
      Number.parseInt(authUser.id)
    );
    if (result.success) {
      toast.success("Address added successfully");
      setIsAddDialogOpen(false);
      // Reload addresses
      const addressesData = await getUserAddresses(
        Number.parseInt(authUser.id)
      );
      setAddresses(addressesData);
    } else {
      toast.error("Failed to add address");
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!authUser?.id) return;

    const result = await deleteAddress(addressId, Number.parseInt(authUser.id));
    if (result.success) {
      toast.success("Address deleted successfully");
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
    } else {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (addressId: number) => {
    if (!authUser?.id) return;

    const result = await updateAddress(
      addressId,
      { is_default: true },
      Number.parseInt(authUser.id)
    );
    if (result.success) {
      toast.success("Default address updated");
      // Reload addresses to update UI
      const addressesData = await getUserAddresses(
        Number.parseInt(authUser.id)
      );
      setAddresses(addressesData);
    } else {
      toast.error("Failed to update default address");
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Shipping Addresses
          </h1>
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
            <form action={handleCreateAddress} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address1">Address</Label>
                  <Input
                    id="address1"
                    name="address1"
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address2">Additional Notes (Optional)</Label>
                  <Input
                    id="address2"
                    name="address2"
                    placeholder="Apt, suite, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Region</Label>
                  <Input id="state" name="state" placeholder="NY" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2 md:col-span-2">
                  <Checkbox id="default" name="default" />
                  <Label htmlFor="default">Set as default address</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Address</Button>
              </div>
            </form>
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
                  <Home className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">Address</CardTitle>
                </div>
                {address.is_default && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Default
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{address.full_name}</p>
                <p className="text-sm text-gray-600">{address.email}</p>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>{address.address}</p>
                {address.notes && <p>{address.notes}</p>}
                <p>{address.state?.name_en || address.state_code}</p>
                <p>{address.phone}</p>
              </div>

              <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteAddress(address.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                {!address.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                  >
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No addresses saved
            </h3>
            <p className="text-gray-600 mb-4">
              Add your first shipping address to get started.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
