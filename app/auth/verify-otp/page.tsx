import type { Metadata } from "next"
import { Suspense } from "react"
import OtpForm from "./OtpForm"

export const metadata: Metadata = {
  title: "Verify Phone - Eleva",
  description: "Verify your phone number",
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Verify your phone number</h2>
          <p className="mt-2 text-center text-sm text-gray-600">We've sent a 6-digit code to your phone number</p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <OtpForm />
        </Suspense>
      </div>
    </div>
  )
}
