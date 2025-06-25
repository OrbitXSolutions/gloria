"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { verifyOtpAction } from "@/app/_actions/auth";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function OtpForm() {
  const [otp, setOtp] = useState("");
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const router = useRouter();

  const { execute, result, isExecuting } = useAction(verifyOtpAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        router.push("/");
        router.refresh();
      }
    },
  });

  useEffect(() => {
    if (!phone) {
      router.push("/auth/register");
    }
  }, [phone, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6 && phone) {
      execute({ token: otp, phone });
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (value.length === 6 && phone) {
      execute({ token: value, phone });
    }
  };

  if (!phone) {
    return null;
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium">{phone}</span>
          </p>

          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={handleOtpChange}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
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
        disabled={isExecuting || otp.length !== 6}
      >
        {isExecuting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify Code"
        )}
      </Button>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">{"Didn't receive the code?"}</p>
        <Button
          type="button"
          variant="ghost"
          className="text-black hover:text-gray-800"
          onClick={() => {
            // You can implement resend OTP functionality here
            console.log("Resend OTP");
          }}
        >
          Resend Code
        </Button>
        <div>
          <Link
            href="/auth/register"
            className="text-sm text-black hover:text-gray-800"
          >
            Back to registration
          </Link>
        </div>
      </div>
    </form>
  );
}
