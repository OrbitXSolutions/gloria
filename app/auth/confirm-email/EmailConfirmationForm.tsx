"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { sendEmailVerificationAction } from "@/app/_actions/auth"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Clock, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EmailConfirmationForm() {
  const [countdown, setCountdown] = useState(0)
  const [email, setEmail] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  const { execute, result, isExecuting } = useAction(sendEmailVerificationAction)

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResendEmail = () => {
    if (email) {
      execute({ email })
      setCountdown(60) // 60 second cooldown
    }
  }

  const maskEmail = (email: string) => {
    if (!email.includes("@")) return email
    const [username, domain] = email.split("@")
    const maskedUsername = username.length > 2 ? username.substring(0, 2) + "*".repeat(username.length - 2) : username
    return `${maskedUsername}@${domain}`
  }

  return (
    <div className="space-y-6">
      {/* Email sent confirmation */}
      <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-green-900 mb-2">Email Sent!</h3>
        <p className="text-green-700 text-sm">We've sent a confirmation email to:</p>
        <p className="font-medium text-green-900 mt-1">{email ? maskEmail(email) : "your email address"}</p>
      </div>

      {/* Instructions */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-xs font-medium text-gray-600">1</span>
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <strong>Check your inbox</strong> for an email from ELEVA
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-xs font-medium text-gray-600">2</span>
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <strong>Click the confirmation link</strong> in the email
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-xs font-medium text-gray-600">3</span>
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <strong>Return to login</strong> and access your account
            </p>
          </div>
        </div>
      </div>

      {/* Resend email */}
      <div className="space-y-4">
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

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">Didn't receive the email?</p>
          <Button
            onClick={handleResendEmail}
            disabled={countdown > 0 || isExecuting || !email}
            variant="outline"
            className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {isExecuting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Resend in {countdown}s
              </>
            ) : (
              "Resend Confirmation Email"
            )}
          </Button>
        </div>
      </div>

      {/* Back to login */}
      <div className="text-center pt-4 border-t border-gray-200">
        <Link href="/auth/login" className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
          ← Back to Login
        </Link>
      </div>

      {/* Help text */}
      <div className="text-center">
        <p className="text-xs text-gray-500">Check your spam folder if you don't see the email in your inbox</p>
      </div>
    </div>
  )
}
