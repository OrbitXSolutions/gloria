"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { loginAction } from "@/app/_actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginForm() {
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
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="emailOrPhone">Email or Phone Number</Label>
          <Input
            id="emailOrPhone"
            name="emailOrPhone"
            type="text"
            required
            value={formData.emailOrPhone}
            onChange={handleInputChange}
            placeholder="Enter your email or phone number"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-black hover:text-gray-800"
        >
          Forgot your password?
        </Link>
      </div>

      {result?.data?.error && (
        <Alert variant="destructive">
          <AlertDescription>{result.data.error}</AlertDescription>
        </Alert>
      )}

      {result?.data?.success && (
        <Alert>
          <AlertDescription>{result.data.message}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full bg-black hover:bg-gray-800"
        disabled={isExecuting}
      >
        {isExecuting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <div className="text-center">
        <span className="text-sm text-gray-600">
          {"Don't have an account? "}
          <Link
            href="/auth/register"
            className="font-medium text-black hover:text-gray-800"
          >
            Sign up
          </Link>
        </span>
      </div>
    </form>
  );
}
