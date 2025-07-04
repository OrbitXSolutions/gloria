"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { verifyOtpAction } from "@/app/_actions/auth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Smartphone, CheckCircle, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PhoneConfirmationForm() {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [phone, setPhone] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { execute, result, isExecuting } = useAction(verifyOtpAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        const params = new URLSearchParams({
          type: "phone",
          phone: phone,
        });
        router.push(`/auth/welcome?${params.toString()}`);
        // setTimeout(() => {
        //   router.push("/auth/login")
        // }, 2000)
      }
    },
  });

  useEffect(() => {
    const phoneParam = searchParams.get("phone");
    if (phoneParam) {
      setPhone(decodeURIComponent(phoneParam));
    }
  }, [searchParams]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOtp();
    }
  }, [otp]);

  const handleVerifyOtp = () => {
    if (otp.length === 6 && phone) {
      execute({ token: otp, phone });
    }
  };

  const handleResendCode = () => {
    // This would trigger a new OTP send
    setCountdown(60); // 60 second cooldown
    setOtp("");
  };

  const maskPhone = (phone: string) => {
    if (phone.length <= 4) return phone;
    return phone.substring(0, phone.length - 4) + "****";
  };

  return (
    <div className="space-y-6">
      {/* Phone confirmation */}
      <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-blue-900 mb-2">Code Sent!</h3>
        <p className="text-blue-700 text-sm">
          We've sent a 6-digit verification code to:
        </p>
        <p className="font-medium text-blue-900 mt-1">
          {phone ? maskPhone(phone) : "your phone number"}
        </p>
      </div>

      {/* OTP Input */}
      <div className="space-y-4">
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Enter Verification Code
          </label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              disabled={isExecuting}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
              </InputOTPGroup>
            </InputOTP>
          </div>
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
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <AlertDescription className="text-green-800">
                {result.data.message} Redirecting to login...
              </AlertDescription>
            </div>
          </Alert>
        )}

        {isExecuting && (
          <div className="flex items-center justify-center text-gray-600">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="text-sm">Verifying code...</span>
          </div>
        )}
      </div>

      {/* Resend code */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-3">Didn't receive the code?</p>
        <Button
          onClick={handleResendCode}
          disabled={countdown > 0}
          variant="outline"
          className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          {countdown > 0 ? (
            <>
              <Clock className="mr-2 h-4 w-4" />
              Resend in {countdown}s
            </>
          ) : (
            "Resend Code"
          )}
        </Button>
      </div>

      {/* Back to login */}
      <div className="text-center pt-4 border-t border-gray-200">
        <Link
          href="/auth/login"
          className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
        >
          ← Back to Login
        </Link>
      </div>

      {/* Help text */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Make sure your phone has signal and can receive SMS messages
        </p>
      </div>
    </div>
  );
}
