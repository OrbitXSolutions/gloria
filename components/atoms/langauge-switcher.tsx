"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { toggleLanguage } from "@/i18n/toggle";



export default function LanguageSwitcher() {
    const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current language from URL params or cookies
  const localeFromParams = searchParams.get("lang");
 
  const currentLang = locale;

  const toggle = () => {
    // const newLang = currentLang === "en" ? "ar" : "en";
    // const params = new URLSearchParams(searchParams.toString());
    // params.set("lang", newLang);

    // const queryString = params.toString();
    // const newUrl = `${pathname}?${queryString}`;

    // // Use replace to avoid adding to history
    // router.replace(newUrl);
    toggleLanguage();
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
    </Button>
  );
}
