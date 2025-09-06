import Banner from "@/components/molecules/banner";
import Categories from "@/components/molecules/categories";
import Contact from "@/components/molecules/contact";
import Features from "@/components/molecules/features";
import Hero from "@/components/molecules/hero";
import Promo from "@/components/molecules/promo";
import Reviews from "@/components/molecules/reviews";
import NewArrivals from "@/components/organisms/new-arrivals";
import Products from "@/components/organisms/products";
import { getCategories } from "@/lib/common/supabase-queries";

export default async function Home() {
  let categories = [];

  try {
    categories = await getCategories();
    categories.sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error("Failed to load categories:", error);
    // Log to our system if possible
    try {
      if (typeof fetch !== 'undefined') {
        await fetch('/api/log-client-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: 'error',
            message: `Homepage categories loading failed: ${error instanceof Error ? error.message : String(error)}`,
            context: {
              error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
              } : error,
              page: 'home',
              function: 'getCategories'
            },
            source: 'server'
          })
        });
      }
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
  }

  return (
    <>
      <Hero />
      <Categories categories={categories} />
      <NewArrivals />
      <Promo />

      <Products />
      <Banner />
      <Features />
      <Reviews />
      <Contact />
    </>
  );
}
