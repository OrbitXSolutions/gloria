import { createSsrClient } from "@/lib/supabase/server";
import { getFeaturedProducts } from "@/lib/common/supabase-queries";
import ProductsClient from "../molecules/products-client";

export default async function Products() {
  const supabase = await createSsrClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const products = await getFeaturedProducts(6, user?.user_metadata?.user_id);

  return <ProductsClient products={products} />;
}
