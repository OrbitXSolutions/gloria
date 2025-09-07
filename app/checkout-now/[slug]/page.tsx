import { notFound } from "next/navigation";
import { createSsrClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { getUAEStates, getUserAddresses } from "@/lib/common/checkout";
import CheckoutNowPageClient from "./CheckoutNowPageClient";
import { ProductWithUserData } from "@/lib/types/database.types";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;
    const locale = await getLocale();
    const supabase = await createSsrClient();

    // Support Arabic (slug_ar) and English (slug) slugs.
    // Try to find by either column using OR filter.
    const decodedSlug = decodeURIComponent(slug);
    const { data: product, error } = await supabase
        .from("products")
        .select("*, currency:currencies(*)")
        .or(`slug.eq.${decodedSlug},slug_ar.eq.${decodedSlug}`)
        .single();

    if (error || !product) {
        notFound();
    }

    // Get user and addresses
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const [userAddresses, states] = await Promise.all([
        user ? getUserAddresses(user.user_metadata?.user_id) : [],
        getUAEStates(),
    ]);

    const { data: userData } = user
        ? await supabase
            .from("users")
            .select("*")
            .eq("user_id", user?.user_metadata?.user_id)
            .single()
        : { data: null };

    return (
        <CheckoutNowPageClient
            product={product as ProductWithUserData}
            user={userData}
            userAddresses={userAddresses}
            uaeStates={states}
        />
    );
}