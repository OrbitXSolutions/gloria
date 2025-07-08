import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password - Gloria",
  description: "Create a new password",
};

export default function ResetPasswordPage() {
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
            <h1 className="text-4xl font-bold mb-2">GLORIA</h1>
            <p className="text-lg opacity-90">Luxury Fashion Redefined</p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-light mb-4">New Beginning</h2>
              <p className="text-lg opacity-80 leading-relaxed">
                Create a strong, secure password to protect your exclusive
                access to luxury fashion collections.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm opacity-75">Enhanced Security</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm opacity-75">Protected Shopping</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm opacity-75">Secure Transactions</span>
              </div>
            </div>
          </div>

          <div className="text-xs opacity-60">
            © 2024 Gloria. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">GLORIA</h1>
            <p className="text-gray-600">Luxury Fashion Redefined</p>
          </div>

          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-light text-gray-900 mb-2">
              Reset Password
            </h2>
            <p className="text-gray-600">Create your new secure password</p>
          </div>

          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
