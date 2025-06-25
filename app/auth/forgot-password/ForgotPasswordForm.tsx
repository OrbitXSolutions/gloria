"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { forgotPasswordAction } from "@/app/_actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const router = useRouter();

  const { execute, result, isExecuting } = useAction(forgotPasswordAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.isPhoneReset && data.phone) {
        router.push(
          `/auth/verify-otp?phone=${encodeURIComponent(data.phone)}&reset=true`
        );
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute({ emailOrPhone });
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
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="Enter your email or phone number"
            className="mt-1"
          />
        </div>
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
            Sending...
          </>
        ) : (
          "Send Reset Instructions"
        )}
      </Button>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center text-sm text-black hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
