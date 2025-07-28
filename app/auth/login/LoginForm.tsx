"use client";

import React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { loginAction } from "@/app/_actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import LoadingIndicator from "@/components/atoms/LoadingIndicator";
import SignInWithGoogle from "@/components/_common/sign-in-with-google";
import { useTranslations } from "next-intl";

export default function LoginForm() {
  const t = useTranslations();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });
  const router = useRouter();

  const { execute, result, isExecuting } = useAction(loginAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        router.push("/");
        router.refresh();
      }
    },
    onError: ({ error }) => {
      // Handle specific confirmation errors
      if (error?.serverError) {
        const errorMessage = error.serverError.toLowerCase();
        const isEmail = formData.emailOrPhone.includes("@");

        // Check for email confirmation errors
        if (
          errorMessage.includes("email not confirmed") ||
          errorMessage.includes("email_not_confirmed") ||
          errorMessage.includes("confirm your email")
        ) {
          router.push(
            `/auth/confirm-email?email=${encodeURIComponent(
              formData.emailOrPhone
            )}`
          );
          return;
        }

        // Check for phone confirmation errors
        if (
          errorMessage.includes("phone not confirmed") ||
          errorMessage.includes("phone_not_confirmed") ||
          errorMessage.includes("confirm your phone") ||
          errorMessage.includes("sms not confirmed")
        ) {
          router.push(
            `/auth/confirm-phone?phone=${encodeURIComponent(
              formData.emailOrPhone
            )}`
          );
          return;
        }
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

  // Check if we need to redirect based on error message
  const handleAuthError = (errorMessage: string) => {
    const isEmail = formData.emailOrPhone.includes("@");
    const lowerError = errorMessage.toLowerCase();

    if (
      lowerError.includes("email not confirmed") ||
      lowerError.includes("email_not_confirmed") ||
      lowerError.includes("confirm your email")
    ) {
      router.push(
        `/auth/confirm-email?email=${encodeURIComponent(formData.emailOrPhone)}`
      );
      return true;
    }

    if (
      lowerError.includes("phone not confirmed") ||
      lowerError.includes("phone_not_confirmed") ||
      lowerError.includes("confirm your phone") ||
      lowerError.includes("sms not confirmed")
    ) {
      router.push(
        `/auth/confirm-phone?phone=${encodeURIComponent(formData.emailOrPhone)}`
      );
      return true;
    }

    return false;
  };

  // Handle error display and redirects
  React.useEffect(() => {
    if (result?.data?.error) {
      const shouldRedirect = handleAuthError(result.data.error);
      if (shouldRedirect) {
        // Don't show error if we're redirecting
        return;
      }
    }
  }, [result?.data?.error]);

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="emailOrPhone"
            className="text-sm font-medium text-gray-700"
          >
            {t("auth.forms.login.emailOrPhone")}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="emailOrPhone"
              name="emailOrPhone"
              type="text"
              required
              value={formData.emailOrPhone}
              onChange={handleInputChange}
              placeholder={t("auth.forms.login.emailOrPhonePlaceholder")}
              className="pl-10 h-12 border-gray-200 focus:border-primary-700 focus:ring-primary-700 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            {t("auth.forms.login.password")}
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder={t("auth.forms.login.passwordPlaceholder")}
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
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-primary-700 focus:ring-primary-700 border-gray-300 rounded"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-700"
          >
            {t("auth.forms.login.rememberMe")}
          </label>
        </div>

        <Link
          href="/auth/forgot-password"
          className="text-sm font-medium text-primary-700 hover:text-gray-700 transition-colors"
        >
          {t("auth.forms.login.forgotPassword")}
        </Link>
      </div>

      {result?.data?.error && !handleAuthError(result.data.error) && (
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
        className="w-full mb-0 h-12 bg-primary-700 hover:bg-primary-500 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
        disabled={isExecuting}
      >
        {isExecuting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t("auth.forms.login.signingIn")}
          </>
        ) : (
          t("auth.forms.login.signInButton")
        )}
      </Button>
      <SignInWithGoogle />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">
            {t("auth.forms.login.newToEleva")}
          </span>
        </div>
      </div>

      <Button
        asChild
        type="button"
        variant="outline"
        className="w-full h-12 border-primary-700 text-primary-700  hover:bg-primary-700 hover:text-white font-medium rounded-lg transition-all duration-200"
      >
        <Link href="/auth/register">
          {t("auth.forms.login.createAccountButton")}
          <LoadingIndicator loaderClassName="text-primary" />
        </Link>
      </Button>
    </form>
  );
}
