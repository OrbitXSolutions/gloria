import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us | Eleva",
  description:
    "Learn more about Eleva, our mission, and our commitment to providing premium fragrances for every occasion.",
  keywords: [
    "about Eleva",
    "Eleva mission",
    "premium fragrances",
    "luxury perfumes",
    "designer perfumes",
  ],
  openGraph: {
    title: "About Us | Eleva",
    description:
      "Learn more about Eleva, our mission, and our commitment to providing premium fragrances for every occasion.",
    url: "https://eleva-store.vercel.app/about",
    siteName: "Eleva",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Eleva - Premium Fragrances",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Eleva",
    description:
      "Learn more about Eleva, our mission, and our commitment to providing premium fragrances for every occasion.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">About Us</h1>
        <p className="text-xl text-gray-600">
          Discover our story and what makes Eleva your trusted destination for
          premium fragrances.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <Image
            src="/placeholder-logo.png"
            alt="Eleva Logo"
            width={500}
            height={500}
            className="rounded-lg shadow-lg"
          />
        </div>
        <div>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            At Eleva, we are dedicated to bringing you the finest fragrances
            from around the world. Our mission is to provide premium perfumes
            that elevate your everyday experiences and special occasions.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            With a commitment to quality, authenticity, and customer
            satisfaction, Eleva has become a trusted name in luxury fragrances.
            Explore our collections and discover the perfect scent for you.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Thank you for choosing Eleva. We look forward to serving you and
            helping you find your signature fragrance.
          </p>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          To inspire and empower individuals through the art of fragrance,
          creating memorable experiences and lasting impressions.
        </p>
      </div>
    </div>
  );
}
