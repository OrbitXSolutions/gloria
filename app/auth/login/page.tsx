import type { Metadata } from "next"
import LoginForm from "./LoginForm"
import { useTranslations } from "next-intl"

export const metadata: Metadata = {
  title: "Login - Eleva",
  description: "Sign in to your Eleva account",
}

export default function LoginPage() {
  const t = useTranslations()

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
            <p className="text-lg opacity-90">{t("auth.forms.login.subtitle")}</p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-light mb-4">{t("auth.forms.login.title")}</h2>
              <p className="text-lg opacity-80 leading-relaxed">
                {t("auth.forms.login.description")}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm opacity-75">{t("auth.forms.login.features.exclusiveCollections")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm opacity-75">{t("auth.forms.login.features.personalizedExperience")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm opacity-75">{t("auth.forms.login.features.priorityAccess")}</span>
              </div>
            </div>
          </div>

          {/* <div className="text-xs opacity-60">{t("common.copyright.rights")}</div> */}
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ELEVA</h1>
            <p className="text-gray-600">{t("auth.forms.login.subtitle")}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-light text-gray-900 mb-2">{t("auth.forms.login.title")}</h2>
            <p className="text-gray-600">{t("auth.forms.login.subtitle")}</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
