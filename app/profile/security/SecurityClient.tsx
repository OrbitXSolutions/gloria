"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Key,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Monitor,
  Trash2,
} from "lucide-react";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  loginAlerts: boolean;
}

interface LoginSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export function SecurityClient() {
  const { user } = useSupabaseUser();
  const t = useTranslations("toast");
  const securityT = useTranslations("profile.security");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    emailNotifications: true,
    smsNotifications: false,
    loginAlerts: true,
  });

  const [sessions] = useState<LoginSession[]>([
    {
      id: "1",
      device: "Chrome on Windows",
      location: "New York, US",
      lastActive: "Active now",
      current: true,
    },
    {
      id: "2",
      device: "Safari on iPhone",
      location: "New York, US",
      lastActive: "2 hours ago",
      current: false,
    },
    {
      id: "3",
      device: "Chrome on MacBook",
      location: "New York, US",
      lastActive: "1 day ago",
      current: false,
    },
  ]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      toast.error(t("security.passwordMismatch"));
      return;
    }

    if (passwords.new.length < 8) {
      toast.error(t("security.passwordTooShort"));
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (error) throw error;

      toast.success(t("security.passwordUpdated"));
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      toast.error(error.message || t("security.passwordUpdateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof SecuritySettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    toast.success(value ? t("security.settingEnabled", { setting: key }) : t("security.settingDisabled", { setting: key }));
  };

  const handleLogoutSession = (sessionId: string) => {
    toast.success(t("security.sessionTerminated"));
  };

  const handleLogoutAllSessions = () => {
    toast.success(t("security.allSessionsTerminated"));
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">
            {t("security.loginRequired")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{securityT("title")}</h1>
        <p className="text-gray-600 mt-1">
          {securityT("subtitle")}
        </p>
      </div>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">Email Verified</p>
                <p className="text-sm text-gray-600">Your email is verified</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Smartphone className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">2FA Enabled</p>
                <p className="text-sm text-gray-600">
                  Extra security layer active
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="font-semibold text-gray-900">Strong Password</p>
                <p className="text-sm text-gray-600">
                  Last changed 30 days ago
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      current: e.target.value,
                    }))
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, new: e.target.value }))
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      confirm: e.target.value,
                    }))
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Password must be at least 8 characters long and include a mix of
                letters, numbers, and symbols.
              </AlertDescription>
            </Alert>

            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">SMS Authentication</p>
              <p className="text-sm text-gray-600">Receive codes via SMS</p>
            </div>
            <Switch
              checked={settings.twoFactorEnabled}
              onCheckedChange={(checked) =>
                handleSettingChange("twoFactorEnabled", checked)
              }
            />
          </div>

          {settings.twoFactorEnabled && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication is enabled. You'll receive SMS codes
                at {user.phone || "your phone number"}.
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Backup Codes</h4>
            <p className="text-sm text-gray-600">
              Generate backup codes to access your account if you lose your
              phone.
            </p>
            <Button variant="outline">Generate Backup Codes</Button>
          </div>
        </CardContent>
      </Card> */}

      {/* Notification Settings */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Security Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">
                Get notified about account activity via email
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                handleSettingChange("emailNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">SMS Notifications</p>
              <p className="text-sm text-gray-600">
                Get notified about account activity via SMS
              </p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(checked) =>
                handleSettingChange("smsNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Login Alerts</p>
              <p className="text-sm text-gray-600">
                Get alerted when someone logs into your account
              </p>
            </div>
            <Switch
              checked={settings.loginAlerts}
              onCheckedChange={(checked) =>
                handleSettingChange("loginAlerts", checked)
              }
            />
          </div>
        </CardContent>
      </Card> */}

      {/* Active Sessions */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Monitor className="h-5 w-5 mr-2" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Monitor className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 flex items-center">
                      {session.device}
                      {session.current && (
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-green-100 text-green-800"
                        >
                          Current
                        </Badge>
                      )}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {session.location}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {session.lastActive}
                      </span>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLogoutSession(session.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">
                Logout All Other Sessions
              </p>
              <p className="text-sm text-gray-600">
                This will log you out of all devices except this one
              </p>
            </div>
            <Button variant="outline" onClick={handleLogoutAllSessions}>
              Logout All Others
            </Button>
          </div>
        </CardContent>
      </Card> */}

      {/* Account Deletion */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Once you delete your account, there is no going back. Please be
              certain.
            </AlertDescription>
          </Alert>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">Delete Account</p>
              <p className="text-sm text-gray-600">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
