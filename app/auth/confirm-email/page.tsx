import { Suspense } from "react";
import EmailConfirmationForm from "./EmailConfirmationForm";

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image and Promo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/placeholder.svg?height=1080&width=1080"
            alt="Luxury Fashion"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-light mb-4">GLORIA</h1>
            <p className="text-xl font-light opacity-90">Elevate Your Style</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-light">Almost There!</h2>
            <p className="text-lg opacity-80 leading-relaxed">
              We've sent a confirmation link to your email. Click the link to
              verify your account and start shopping our exclusive collection.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-light text-gray-900 mb-2">GLORIA</h1>
            <p className="text-gray-600">Elevate Your Style</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-light text-gray-900 mb-2">
              Confirm Your Email
            </h2>
            <p className="text-gray-600">
              Check your inbox and click the confirmation link to activate your
              account
            </p>
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <EmailConfirmationForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
