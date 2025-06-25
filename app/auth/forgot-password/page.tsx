import type { Metadata } from "next"
import ForgotPasswordForm from "./ForgotPasswordForm"

export const metadata: Metadata = {
  title: "Forgot Password - Eleva",
  description: "Reset your password",
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image/Promo */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/placeholder.svg?height=1080&width=720')`,
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Promo Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <h1 className="text-4xl font-bold mb-2">ELEVA</h1>
            <p className="text-lg opacity-90">Luxury Fashion Redefined</p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-light mb-4">Secure Recovery</h2>
              <p className="text-lg opacity-80 leading-relaxed">
                Your account security is our priority. We'll help you regain access to your exclusive fashion world
                safely.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm opacity-75">Bank-Level Security</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm opacity-75">Instant Recovery Process</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm opacity-75">24/7 Support Available</span>
              </div>
            </div>
          </div>

          <div className="text-xs opacity-60">© 2024 Eleva. All rights reserved.</div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ELEVA</h1>
            <p className="text-gray-600">Luxury Fashion Redefined</p>
          </div>

          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-light text-gray-900 mb-2">Forgot Password?</h2>
            <p className="text-gray-600">No worries, we'll send you reset instructions</p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
