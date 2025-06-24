"use server";

import { cookies } from "next/headers";

export async function toggleLanguage() {
  const cookieStore = await cookies();
  const currentLocale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const newLocale = currentLocale === "en" ? "ar" : "en";

  // Set the new locale in cookies
  cookieStore.set("NEXT_LOCALE", newLocale);
}