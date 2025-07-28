"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { resetPasswordAction } from "@/app/_actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react"
import { useTranslations } from "next-intl"

export default function ResetPasswordForm() {
  const t = useTranslations();
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const router = useRouter()

  const { execute, result, isExecuting } = useAction(resetPasswordAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    execute(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const strengthLabels = [
    t("auth.passwordStrength.veryWeak"),
    t("auth.passwordStrength.weak"),
    t("auth.passwordStrength.fair"),
    t("auth.passwordStrength.good"),
    t("auth.passwordStrength.strong")
  ]
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            {t("auth.forms.resetPassword.newPassword")}
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder={t("auth.forms.resetPassword.newPasswordPlaceholder")}
              className="pr-10 h-12 border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-lg"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded-full ${
                      level <= passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600">
                {t("auth.passwordStrength.label")}: {strengthLabels[passwordStrength - 1] || t("auth.passwordStrength.veryWeak")}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            {t("auth.forms.resetPassword.confirmPassword")}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder={t("auth.forms.resetPassword.confirmPasswordPlaceholder")}
              className="pr-10 h-12 border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-lg"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Password Match Indicator */}
          {formData.confirmPassword && (
            <div className="flex items-center space-x-2">
              {formData.password === formData.confirmPassword ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-600">{t("auth.passwordStrength.match")}</span>
                </>
              ) : (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-red-500" />
                  <span className="text-xs text-red-600">{t("auth.passwordStrength.noMatch")}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {result?.data?.error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{result.data.error}</AlertDescription>
        </Alert>
      )}

      {result?.data?.success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{result.data.message} {t("auth.forms.resetPassword.redirecting")}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
        disabled={isExecuting || formData.password !== formData.confirmPassword || passwordStrength < 3}
      >
        {isExecuting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t("auth.forms.resetPassword.resettingPassword")}
          </>
        ) : (
          t("auth.forms.resetPassword.resetPasswordButton")
        )}
      </Button>

      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>{t("auth.passwordStrength.requirements")}:</p>
        <ul className="space-y-1">
          <li className={formData.password.length >= 8 ? "text-green-600" : ""}>• {t("auth.passwordStrength.minLength")}</li>
          <li className={/[A-Z]/.test(formData.password) ? "text-green-600" : ""}>• {t("auth.passwordStrength.uppercase")}</li>
          <li className={/[a-z]/.test(formData.password) ? "text-green-600" : ""}>• {t("auth.passwordStrength.lowercase")}</li>
          <li className={/[0-9]/.test(formData.password) ? "text-green-600" : ""}>• {t("auth.passwordStrength.number")}</li>
        </ul>
      </div>
    </form>
  )
}
