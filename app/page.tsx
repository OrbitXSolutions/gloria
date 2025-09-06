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
    // Don't try to log via API during build time - just console log
    // API logging will work in runtime/client-side
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
