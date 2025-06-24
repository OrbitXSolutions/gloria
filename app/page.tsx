import Banner from "@/components/molecules/banner";
import Categories from "@/components/molecules/categories";
import Contact from "@/components/molecules/contact";
import Features from "@/components/molecules/features";
import Hero from "@/components/molecules/hero";
import Promo from "@/components/molecules/promo";
import Reviews from "@/components/molecules/reviews";
import NewArrivals from "@/components/organisms/new-arrivals";
import Products from "@/components/organisms/products";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
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
