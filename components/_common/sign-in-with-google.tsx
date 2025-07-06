"use client";
import { ROUTES } from "@/lib/constants/routes";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { use, useEffect, useLayoutEffect } from "react";

export async function handleSignInWithGoogle(response: any) {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: response.credential,
  });

  if (!user?.phone) {
    // Redirect to set phone page if phone is not set
    window.location.href = ROUTES.SET_PHONE;
  } else {
    if (!user?.phone_confirmed_at) {
      // Redirect to OTP page if phone is not confirmed
      window.location.href = ROUTES.OTP;
    } else {
      window.location.href = ROUTES.HOME;
      // Redirect to home page if phone is confirmed
    }
  }
}
export default function SignInWithGoogle() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    if (typeof window != "undefined")
      (window as any).handleSignInWithGoogle = handleSignInWithGoogle;

    return () => {
      if (typeof window != "undefined") {
        (window as any).handleSignInWithGoogle = null;
      }
    };
  }, [handleSignInWithGoogle]);

  useEffect(() => {
    if (typeof window != "undefined") {
      // rerender the google sign-in button
      const googleSignInButton = document.querySelector(".g_id_signin");
      if (googleSignInButton) {
        googleSignInButton.innerHTML = "";
        (window as any).google?.accounts?.id?.renderButton(googleSignInButton, {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: "continue_with",
          locale: "ar",
          logo_alignment: "left",
        });
      }
    }
  }, [pathname]);
  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" async />
      <div
        id="g_id_onload"
        data-client_id="532246658153-n1bjsvv38p35ka63rvhtj1e2qbdt91vh.apps.googleusercontent.com"
        data-context="use"
        data-ux_mode="popup"
        data-callback="handleSignInWithGoogle"
        data-auto_prompt="false"
      ></div>

      <div
        className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="continue_with"
        data-size="large"
        data-locale="ar"
        data-logo_alignment="left"
      ></div>
    </>
  );
}
