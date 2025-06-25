"use client"

import type React from "react"

import { useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { sendEmailVerificationAction } from "@/app/_actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail } from "lucide-react"
import Link from "next/link"

export default function EmailVerificationForm() {
  const [email, setEmail] = useState("")

  const { execute, result, isExecuting } = useAction(sendEmailVerificationAction)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    execute({ email })
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="mt-1"
          />
        </div>
      </div>

      {result?.data?.error && (
        <Alert variant="destructive">
          <AlertDescription>{result.data.error}</AlertDescription>
        </Alert>
      )}

      {result?.data?.success && (
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>{result.data.message}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full bg-black hover:bg-gray-800" disabled={isExecuting}>
        {isExecuting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending verification email...
          </>
        ) : (
          "Send Verification Email"
        )}
      </Button>

      <div className="text-center">
        <Link href="/" className="text-sm text-black hover:text-gray-800">
          Back to home
        </Link>
      </div>
    </form>
  )
}
