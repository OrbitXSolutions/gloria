import { notFound } from "next/navigation";
import { createSsrClient } from "@/lib/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";
import { getUAEStates, getUserAddresses } from "@/lib/common/checkout";
import CheckoutNowPageClient from "./CheckoutNowPageClient";
import { ProductWithUserData } from "@/lib/types/database.types";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function Page({ params }: Props) {
    const { slug } = await params;
    const locale = await getLocale();
    const supabase = await createSsrClient();

    // Fetch product by slug
    const { data: product, error } = await supabase
        .from("products")
        .select("*, currency:currencies(*)")
        .eq("slug", slug)
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

    const { data: userData } = user ? await supabase.from("users").select("*").eq("user_id", user?.user_metadata?.user_id).single() : { data: null };

    return (
        <CheckoutNowPageClient
            product={product as ProductWithUserData}
            user={userData}
            userAddresses={userAddresses}
            uaeStates={states}
        />
    );
} 