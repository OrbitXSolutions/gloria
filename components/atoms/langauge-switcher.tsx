"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { toggleLanguage } from "@/i18n/toggle";
import { useActionState } from "react";
import { useAction } from "next-safe-action/hooks";
import { Spinner } from "../ui/spinner";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { execute, isPending } = useAction(toggleLanguage, {
    onExecute: () => {
      // remove the lang search param
      const params = new URLSearchParams(searchParams);

      params.delete("lang");
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      const newPathname =
        pathname + (params.toString() ? `?${params.toString()}` : "");

      // Redirect to the new URL without the lang param
      router.replace(newPathname, undefined);
    },
    onError: (error) => {
      console.error("Failed to toggle language:", error);
    },
  });
  const locale = useLocale();

  // Get current language from URL params or cookies
  const localeFromParams = searchParams.get("lang");

  const currentLang = locale;

  const toggle = () => {
    execute();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="hidden md:flex items-center space-x-2"
    >
      <Globe className="h-4 w-4" />
      <span>{currentLang === "en" ? "العربية" : "English"}</span>
      {isPending && <Spinner size="small" className="text-white" />}
    </Button>
  );
}
