"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { loginAction } from "@/app/_actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, Mail } from "lucide-react"
import Link from "next/link"

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  })
  const router = useRouter()

  const { execute, result, isExecuting } = useAction(loginAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        router.push("/")
        router.refresh()
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

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="emailOrPhone" className="text-sm font-medium text-gray-700">
            Email or Phone Number
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
              value={formData.emailOrPhone}
              onChange={handleInputChange}
              placeholder="Enter your email or phone"
              className="pl-10 h-12 border-gray-200 focus:border-gray-900 focus:ring-gray-900 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
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
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
        </div>

        <Link
          href="/auth/forgot-password"
          className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
        >
          Forgot password?
        </Link>
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
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">New to Eleva?</span>
        </div>
      </div>

      <Link href="/auth/register">
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-medium rounded-lg transition-all duration-200"
        >
          Create Account
        </Button>
      </Link>
    </form>
  )
}
