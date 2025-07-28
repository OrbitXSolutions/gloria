"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload, Save, X } from "lucide-react";
import {
  getUserProfile,
  updateUserProfile,
} from "@/lib/common/profile-queries";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "next-intl";
import { PhoneInput } from "@/components/ui/phone-input";
import { createClient } from "@/lib/supabase/client";
import { getUserAvatarUrl } from "@/lib/constants/supabase-storage";

export function SettingsClient() {
  const { user: authUser } = useSupabaseUser();
  const t = useTranslations("toast");
  const profileT = useTranslations("profile.settings");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    async function loadUserData() {
      if (!authUser?.id) return;

      try {
        const supabase = createClient();

        // First, get the database user ID from the users table
        const { data: userDataResult, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('user_id', authUser.id)
          .single();

        if (userError || !userDataResult?.id) {
          console.error("Error fetching database user ID:", userError);
          setLoading(false);
          return;
        }

        const databaseUserId = userDataResult.id;

        // Now get the user profile using the database user ID
        const userData = await getUserProfile(databaseUserId);
        if (userData) {
          setUser(userData);
          // Initialize form data
          setFormData({
            firstName: userData.first_name || "",
            lastName: userData.last_name || "",
            email: userData.email || "",
            phone: userData.phone || "",
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [authUser]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !authUser?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingAvatar(true);

    try {
      const supabase = createClient();

      // First, get the database user ID
      const { data: userDataResult, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', authUser.id)
        .single();

      if (userError || !userDataResult?.id) {
        toast.error("Failed to get user information");
        return;
      }

      const databaseUserId = userDataResult.id;

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${databaseUserId}-${Date.now()}.${fileExt}`;
      const filePath = `users/${fileName}`;

      // Upload the file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Failed to upload image");
        return;
      }

      // Update the user profile with the new avatar path
      const result = await updateUserProfile(databaseUserId, {
        avatar: filePath
      });

      if (result.success) {
        // Update local state
        setUser((prev: any) => ({
          ...prev,
          avatar: filePath
        }));
        toast.success("Profile picture updated successfully");
      } else {
        toast.error("Failed to update profile picture");
      }

    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAvatar = async () => {
    if (!authUser?.id) return;

    setUploadingAvatar(true);

    try {
      const supabase = createClient();

      // Get the database user ID
      const { data: userDataResult, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', authUser.id)
        .single();

      if (userError || !userDataResult?.id) {
        toast.error("Failed to get user information");
        return;
      }

      const databaseUserId = userDataResult.id;

      // Remove the avatar from storage if it exists
      if (user?.avatar) {
        const { error: deleteError } = await supabase.storage
          .from('images')
          .remove([user.avatar]);

        if (deleteError) {
          console.error("Error deleting old avatar:", deleteError);
        }
      }

      // Update the user profile to remove avatar
      const result = await updateUserProfile(databaseUserId, {
        avatar: null
      });

      if (result.success) {
        setUser((prev: any) => ({
          ...prev,
          avatar: null
        }));
        toast.success("Profile picture removed");
      } else {
        toast.error("Failed to remove profile picture");
      }

    } catch (error) {
      console.error("Error removing avatar:", error);
      toast.error("Failed to remove profile picture");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted - preventing default");
    if (!authUser?.id) return;

    setSaving(true);

    try {
      const supabase = createClient();

      // First, get the database user ID from the users table
      const { data: userDataResult, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', authUser.id)
        .single();

      if (userError || !userDataResult?.id) {
        toast.error(t("profile.updateFailed"));
        return;
      }

      const databaseUserId = userDataResult.id;

      const updates = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      };

      const result = await updateUserProfile(databaseUserId, updates);
      if (result.success) {
        toast.success(t("profile.updated"));
        setUser(result.data);
      } else {
        toast.error(t("profile.updateFailed"));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("profile.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">{t("profile.loadFailed")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{profileT("title")}</h1>
        <p className="text-gray-600 mt-1">
          {profileT("subtitle")}
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            {profileT("profileInformation")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={getUserAvatarUrl(user.avatar)}
                  alt={`${user.first_name || 'User'} ${user.last_name || ''}`}
                />
                <AvatarFallback className="text-lg font-medium bg-gradient-to-br from-gray-100 to-gray-200">
                  {user.first_name?.[0]}
                  {user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <Spinner className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingAvatar ? "Uploading..." : profileT("changePhoto")}
                </Button>
                {user.avatar && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeAvatar}
                    disabled={uploadingAvatar}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-sm text-gray-500">
                {profileT("photoDescription")}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">{profileT("firstName")}</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder={profileT("firstName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{profileT("lastName")}</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder={profileT("lastName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{profileT("emailAddress")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={profileT("emailAddress")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{profileT("phoneNumber")}</Label>
                <PhoneInput
                  id="phone"
                  value={formData.phone}
                  onChange={(value) => handleInputChange("phone", value)}
                  placeholder={profileT("phoneNumber")}
                />
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {profileT("saveChanges")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
