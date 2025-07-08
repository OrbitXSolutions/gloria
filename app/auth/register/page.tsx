import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register - Gloria",
  description: "Create your Gloria account",
};

export default function RegisterPage() {
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
              <h2 className="text-3xl font-light mb-4">Join the Elite</h2>
              <p className="text-lg opacity-80 leading-relaxed">
                Become part of an exclusive community where luxury fashion meets
                unparalleled service and style.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm opacity-75">
                  Curated Designer Collections
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm opacity-75">
                  Personal Style Consultation
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm opacity-75">
                  Exclusive Member Events
                </span>
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

          <div className="mb-8">
            <h2 className="text-3xl font-light text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">
              Join our exclusive fashion community
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
