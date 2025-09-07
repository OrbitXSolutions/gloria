import { Suspense } from "react";
import PhoneConfirmationForm from "./PhoneConfirmationForm";

export default function ConfirmPhonePage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image and Promo */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/banner-register.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-light mb-4">GLORIA</h1>
            <p className="text-xl font-light opacity-90">Gloriate Your Style</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-light">Verify Your Phone</h2>
            <p className="text-lg opacity-80 leading-relaxed">
              We've sent a verification code to your phone number. Enter the
              code to confirm your account and unlock exclusive access.
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
            <p className="text-gray-600">Gloriate Your Style</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-light text-gray-900 mb-2">
              Verify Your Phone
            </h2>
            <p className="text-gray-600">
              Enter the verification code sent to your phone number
            </p>
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <PhoneConfirmationForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
