"use server";

import { actionClient } from "@/lib/common/safe-action";
import { redirect } from "next/dist/server/api-utils";
import { cookies } from "next/headers";
import { z } from "zod";

export const toggleLanguage = actionClient.action(async () => {
  const cookieStore = await cookies();
  const currentLocale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const newLocale = currentLocale === "en" ? "ar" : "en";

  // Set the new locale in cookies
  cookieStore.set("NEXT_LOCALE", newLocale);
});
export const changeLanguage = actionClient
  .inputSchema(
    z.object({
      lang: z.string().min(2).max(2),
    })
  )
  .action(async ({ parsedInput: { lang } }) => {
    const cookieStore = await cookies();
    const currentLocale = cookieStore.get("NEXT_LOCALE")?.value || "en";

    if (lang !== currentLocale) {
      // Set the new locale in cookies
      cookieStore.set("NEXT_LOCALE", lang);
    }
  });
// export async function toggleLanguage() {
//   const cookieStore = await cookies();
//   const currentLocale = cookieStore.get("NEXT_LOCALE")?.value || "en";
//   const newLocale = currentLocale === "en" ? "ar" : "en";

//   // Set the new locale in cookies
//   cookieStore.set("NEXT_LOCALE", newLocale);
// }

// export async function changeLanguage(lang: string) {
//   const cookieStore = await cookies();
//   const currentLocale = cookieStore.get("NEXT_LOCALE")?.value || "en";

//   if (lang !== currentLocale) {
//     cookieStore.set("NEXT_LOCALE", lang);
//   }
// }
