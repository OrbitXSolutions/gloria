import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutPageClient from "./CheckoutPageClient";

import { createSsrClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { getUAEStates, getUserAddresses } from "@/lib/common/checkout";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const locale = await getLocale();

  const title = locale === "ar" ? "إتمام الطلب - جلوريا" : "Checkout - Gloria";
  const description =
    locale === "ar"
      ? "أكمل طلبك وأدخل تفاصيل الشحن والدفع"
      : "Complete your order and enter shipping and payment details";

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function Page({ searchParams }: PageProps) {
  const locale = await getLocale();

  // Get user and addresses
  const supabase = await createSsrClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [userAddresses, states] = await Promise.all([
    user ? getUserAddresses(user.user_metadata?.user_id) : [],
    getUAEStates(),
  ]);
  return (
    <CheckoutPageClient
      user={user}
      userAddresses={userAddresses}
      uaeStates={states}
    />
  );
}
