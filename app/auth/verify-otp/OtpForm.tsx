"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { verifyOtpAction, resendOtpAction } from "@/app/_actions/auth";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export default function OtpForm() {
  const t = useTranslations();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const router = useRouter();

  const { execute, result, isExecuting } = useAction(verifyOtpAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        router.push("/welcome");
        router.refresh();
      }
    },
  });

  const { execute: executeResend, result: resendResult, isExecuting: isResending } = useAction(resendOtpAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        setTimeLeft(60);
        setCanResend(false);
        toast.success(t("auth.forms.verifyOtp.otpResent"));
      }
    },
    onError: (error) => {
      toast.error(error.error?.serverError || t("auth.forms.verifyOtp.resendError"));
    },
  });

  useEffect(() => {
    if (!phone) {
      router.push("/auth/register");
    }
  }, [phone, router]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

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

  const handleResend = () => {
    if (phone && !isResending) {
      executeResend({ phone });
    }
  };

  if (!phone) {
    return null;
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-6">
            {t("auth.forms.verifyOtp.otpSent")}{" "}
            <span className="font-medium text-gray-900">{phone}</span>
          </p>

          <div className="flex justify-center mb-6">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={handleOtpChange}
              className="gap-3"
            >
              <InputOTPGroup className="gap-3">
                <InputOTPSlot
                  index={0}
                  className="w-12 h-12 text-lg font-semibold border-gray-200 focus:border-gray-900 rounded-lg"
                />
                <InputOTPSlot
                  index={1}
                  className="w-12 h-12 text-lg font-semibold border-gray-200 focus:border-gray-900 rounded-lg"
                />
                <InputOTPSlot
                  index={2}
                  className="w-12 h-12 text-lg font-semibold border-gray-200 focus:border-gray-900 rounded-lg"
                />
                <InputOTPSlot
                  index={3}
                  className="w-12 h-12 text-lg font-semibold border-gray-200 focus:border-gray-900 rounded-lg"
                />
                <InputOTPSlot
                  index={4}
                  className="w-12 h-12 text-lg font-semibold border-gray-200 focus:border-gray-900 rounded-lg"
                />
                <InputOTPSlot
                  index={5}
                  className="w-12 h-12 text-lg font-semibold border-gray-200 focus:border-gray-900 rounded-lg"
                />
              </InputOTPGroup>
            </InputOTP>
          </div>
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
          <AlertDescription className="text-green-800">
            {result.data.message}
          </AlertDescription>
        </Alert>
      )}

      {resendResult?.data?.error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {resendResult.data.error}
          </AlertDescription>
        </Alert>
      )}

      {resendResult?.data?.success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {resendResult.data.message}
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
        disabled={isExecuting || otp.length !== 6}
      >
        {isExecuting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t("auth.forms.verifyOtp.verifying")}
          </>
        ) : (
          t("auth.forms.verifyOtp.verifyButton")
        )}
      </Button>

      <div className="text-center space-y-4">
        <div className="text-sm text-gray-600">
          {canResend ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
              disabled={isResending}
              className="text-gray-900 hover:text-gray-700 font-medium p-0 h-auto"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("auth.forms.verifyOtp.resendingOtp")}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("auth.forms.verifyOtp.resendOtp")}
                </>
              )}
            </Button>
          ) : (
            <span>
              {t("auth.forms.verifyOtp.resendIn")}{" "}
              <span className="font-medium text-gray-900">{timeLeft}s</span>
            </span>
          )}
        </div>

        <Link
          href="/auth/register"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("auth.forms.verifyOtp.backToLogin")}
        </Link>
      </div>
    </form>
  );
}
