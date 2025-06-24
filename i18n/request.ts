import { CookiesKeys } from "@/lib/constants/cookies-keys";
import { IntlErrorCode } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
//   const { cookies, headers } = await import("next/headers");
  const cookieStore = await cookies();
  const locale = cookieStore.get(CookiesKeys.NEXT_LOCALE)?.value || "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    getMessageFallback: ({ namespace, key, error }) => {
      const path = [namespace, key].filter((part) => part != null).join(".");

      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        return path + " is not yet translated";
      } else {
        return "Dear developer, please fix this message: " + path;
      }
    },
  };
});
