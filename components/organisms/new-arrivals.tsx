
import { getNewArrivals } from "@/lib/common/supabase-queries";
import { createSsrClient } from "@/lib/supabase/server";
import NewArrivalsClient from "../molecules/new-arrivals-client";

export default async function NewArrivals() {
  const supabase = await createSsrClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const products = await getNewArrivals(4, user?.user_metadata.user_id);

  return <NewArrivalsClient products={products} />;
}
