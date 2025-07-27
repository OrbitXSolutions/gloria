"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { registerAction } from "@/app/_actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, User, Mail, Phone } from "lucide-react";
import Link from "next/link";
import LoadingIndicator from "@/components/atoms/LoadingIndicator";
import { useTranslations } from "next-intl";

export default function RegisterForm() {
  const t = useTranslations();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();

  const { execute, result, isExecuting } = useAction(registerAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.needsVerification && data.phone) {
        router.push(`/auth/verify-otp?phone=${encodeURIComponent(data.phone)}`);
      } else if (data?.success && !data.needsVerification) {
        router.push("/");
        router.refresh();
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700"
            >
              {t("auth.forms.register.firstName")}
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder={t("auth.forms.register.firstNamePlaceholder")}
                className="pl-10 h-12 border-gray-200 focus:border-primary-700 focus:ring-primary-700 rounded-lg"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className="text-sm font-medium text-gray-700"
            >
              {t("auth.forms.register.lastName")}
            </Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder={t("auth.forms.register.lastNamePlaceholder")}
              className="h-12 border-gray-200 focus:border-primary-700 focus:ring-primary-700 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            {t("auth.forms.register.email")}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t("auth.forms.register.emailPlaceholder")}
              className="pl-10 h-12 border-gray-200 focus:border-primary-700 focus:ring-primary-700 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            {t("auth.forms.register.phone")}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleInputChange}
              placeholder={t("auth.forms.register.phonePlaceholder")}
              className="pl-10 h-12 border-gray-200 focus:border-primary-700 focus:ring-primary-700 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            {t("auth.forms.register.password")}
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder={t("auth.forms.register.passwordPlaceholder")}
              className="pr-10 h-12 border-gray-200 focus:border-primary-700 focus:ring-primary-700 rounded-lg"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700"
          >
            {t("auth.forms.register.confirmPassword")}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder={t("auth.forms.register.confirmPasswordPlaceholder")}
              className="pr-10 h-12 border-gray-200 focus:border-primary-700 focus:ring-primary-700 rounded-lg"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <label className="ml-2 block text-xs text-gray-700">
          {t("auth.forms.register.termsAgreement")}{" "}
          <Link
            href="/terms"
            className="text-primary-700 hover:text-gray-700 font-medium"
          >
            {t("auth.forms.register.termsOfService")}
          </Link>{" "}
          {t("auth.forms.register.and")}{" "}
          <Link
            href="/privacy"
            className="text-primary-700 hover:text-gray-700 font-medium"
          >
            {t("auth.forms.register.privacyPolicy")}
          </Link>
        </label>
      </div>

      {result?.data?.error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {result.data.error}
          </AlertDescription>
        </Alert>
      )}

      {result?.data?.success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {result.data.message}
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full h-12 bg-primary-700 hover:bg-gray-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
        disabled={isExecuting}
      >
        {isExecuting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t("auth.forms.register.creatingAccount")}
          </>
        ) : (
          t("auth.forms.register.createAccountButton")
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">
            {t("auth.forms.register.alreadyHaveAccount")}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-12 border-primary-700 text-primary-700 hover:bg-primary-700 hover:text-white font-medium rounded-lg transition-all duration-200"
      >
        <Link href="/auth/login">
          {" "}
          {t("auth.forms.register.signInButton")}
          <LoadingIndicator loaderClassName="text-primary" />
        </Link>
      </Button>
    </form>
  );
}
