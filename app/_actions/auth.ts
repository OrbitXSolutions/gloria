"use server";

import { createSafeActionClient } from "next-safe-action";
import {
  registerSchema,
  loginSchema,
  otpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  emailVerificationSchema,
} from "@/lib/schemas/auth";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import { z } from "zod";
import createClient from "@/lib/supabase/client";

const action = createSafeActionClient();

export const registerAction = action
  .schema(registerSchema)
  .action(async ({ parsedInput }) => {
    const { firstName, lastName, email, phone, password } = parsedInput;
    const supabase = await createClient();

    try {
      // Parse and format phone number
      const phoneNumber = parsePhoneNumber(phone);
      const formattedPhone = phoneNumber?.format("E.164");

      if (!formattedPhone) {
        return { error: "Invalid phone number format" };
      }

      // Register with Supabase using phone number
      const { data, error } = await supabase.auth.signUp({
        phone: formattedPhone,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            email: email,
            full_name: `${firstName} ${lastName}`,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user && !data.session) {
        // User needs to verify phone number
        return {
          success: true,
          message: "Registration successful! Please verify your phone number.",
          needsVerification: true,
          phone: formattedPhone,
        };
      }

      return {
        success: true,
        message: "Registration successful!",
        needsVerification: false,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return { error: "An unexpected error occurred during registration" };
    }
  });

export const loginAction = action
  .schema(loginSchema)
  .action(async ({ parsedInput }) => {
    const { emailOrPhone, password } = parsedInput;
    const supabase = await createClient();

    try {
      // Detect if input is email or phone
      const isEmail = emailOrPhone.includes("@");
      let signInData;

      if (isEmail) {
        // Sign in with email
        signInData = await supabase.auth.signInWithPassword({
          email: emailOrPhone,
          password,
        });
      } else {
        // Validate and format phone number
        if (!isValidPhoneNumber(emailOrPhone)) {
          return { error: "Invalid phone number format" };
        }

        const phoneNumber = parsePhoneNumber(emailOrPhone);
        const formattedPhone = phoneNumber?.format("E.164");

        if (!formattedPhone) {
          return { error: "Invalid phone number format" };
        }

        // Sign in with phone
        signInData = await supabase.auth.signInWithPassword({
          phone: formattedPhone,
          password,
        });
      }

      const { data, error } = signInData;

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Create or update user in public.users table
        const { error: upsertError } = await supabase.from("users").upsert({
          user_id: data.user.id,
          email: data.user.email || data.user.user_metadata?.email,
          phone: data.user.phone,
          first_name: data.user.user_metadata?.first_name,
          last_name: data.user.user_metadata?.last_name,
          full_name: data.user.user_metadata?.full_name,
          updated_at: new Date().toISOString(),
        });

        if (upsertError) {
          console.error("Error upserting user:", upsertError);
        }

        return { success: true, message: "Login successful!" };
      }

      return { error: "Login failed" };
    } catch (error) {
      console.error("Login error:", error);
      return { error: "An unexpected error occurred during login" };
    }
  });

export const verifyOtpAction = action
  .schema(otpSchema.extend({ phone: z.string() }))
  .action(async ({ parsedInput }) => {
    const { token, phone } = parsedInput;
    const supabase = await createClient();

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Create user in public.users table
        const { error: insertError } = await supabase.from("users").upsert({
          user_id: data.user.id,
          email: data.user.user_metadata?.email,
          phone: data.user.phone,
          first_name: data.user.user_metadata?.first_name,
          last_name: data.user.user_metadata?.last_name,
          full_name: data.user.user_metadata?.full_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error("Error creating user:", insertError);
        }

        return {
          success: true,
          message: "Phone number verified successfully!",
        };
      }

      return { error: "Verification failed" };
    } catch (error) {
      console.error("OTP verification error:", error);
      return { error: "An unexpected error occurred during verification" };
    }
  });

export const forgotPasswordAction = action
  .schema(forgotPasswordSchema)
  .action(async ({ parsedInput }) => {
    const { emailOrPhone } = parsedInput;
    const supabase = await createClient();

    try {
      const isEmail = emailOrPhone.includes("@");

      if (isEmail) {
        const { error } = await supabase.auth.resetPasswordForEmail(
          emailOrPhone,
          {
            redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`,
          }
        );

        if (error) {
          return { error: error.message };
        }

        return {
          success: true,
          message: "Password reset link sent to your email!",
        };
      } else {
        // For phone numbers, we'll send an OTP
        if (!isValidPhoneNumber(emailOrPhone)) {
          return { error: "Invalid phone number format" };
        }

        const phoneNumber = parsePhoneNumber(emailOrPhone);
        const formattedPhone = phoneNumber?.format("E.164");

        if (!formattedPhone) {
          return { error: "Invalid phone number format" };
        }

        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });

        if (error) {
          return { error: error.message };
        }

        return {
          success: true,
          message: "OTP sent to your phone number!",
          phone: formattedPhone,
          isPhoneReset: true,
        };
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      return { error: "An unexpected error occurred" };
    }
  });

export const resetPasswordAction = action
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput }) => {
    const { password } = parsedInput;
    const supabase = await createClient();

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { success: true, message: "Password updated successfully!" };
    } catch (error) {
      console.error("Reset password error:", error);
      return { error: "An unexpected error occurred" };
    }
  });

export const sendEmailVerificationAction = action
  .schema(emailVerificationSchema)
  .action(async ({ parsedInput }) => {
    const { email } = parsedInput;
    const supabase = await createClient();

    try {
      const { error } = await supabase.auth.updateUser({
        email,
      });

      if (error) {
        return { error: error.message };
      }

      return {
        success: true,
        message: "Verification email sent! Please check your inbox.",
      };
    } catch (error) {
      console.error("Email verification error:", error);
      return { error: "An unexpected error occurred" };
    }
  });

export const signOutAction = action.action(async () => {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    return { success: true, message: "Signed out successfully!" };
  } catch (error) {
    console.error("Sign out error:", error);
    return { error: "An unexpected error occurred" };
  }
});
