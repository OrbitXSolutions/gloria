"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { forgotPasswordAction } from "@/app/_actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export default function ForgotPasswordForm() {
  const t = useTranslations();
  const [emailOrPhone, setEmailOrPhone] = useState("")
  const router = useRouter()

  const { execute, result, isExecuting } = useAction(forgotPasswordAction, {
    onSuccess: ({ data }) => {
      // Phone-based reset flow removed; email flow handled inline
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    execute({ emailOrPhone })
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="emailOrPhone" className="text-sm font-medium text-gray-700">
            {t("auth.forms.forgotPassword.emailOrPhone")}
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
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder={t("auth.forms.forgotPassword.emailOrPhonePlaceholder")}
              className="pl-10 h-12 border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-lg"
            />
          </div>
        </div>
      </div>

      {result?.data?.error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{result.data.error}</AlertDescription>
        </Alert>
      )}

      {result?.data?.success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{result.data.message}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
        disabled={isExecuting}
      >
        {isExecuting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t("auth.forms.forgotPassword.sendingInstructions")}
          </>
        ) : (
          t("auth.forms.forgotPassword.sendResetInstructions")
        )}
      </Button>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("auth.forms.forgotPassword.backToSignIn")}
        </Link>
      </div>
    </form>
  )
}
