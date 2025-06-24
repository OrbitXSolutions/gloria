"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { getUserAvatarUrl } from "@/lib/constants/supabase-storage";
import SafeImage from "../_common/safe-image";


const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    comment:
      "Absolutely love my new perfume! The scent lasts all day and I get compliments everywhere I go.",
    product_en: "Midnight Rose",
    product_ar: "وردة منتصف الليل",
    avatar: "users/sarah-johnson.jpg",
  },
  {
    id: 2,
    name: "Michael Chen",
    rating: 5,
    comment:
      "Fast delivery and authentic products. The packaging was beautiful and perfect for gifting.",
    product_en: "Ocean Breeze",
    product_ar: "نسيم المحيط",
    avatar: "users/michael-chen.jpg",
  },
  {
    id: 3,
    name: "Emma Davis",
    rating: 4,
    comment:
      "Great selection of fragrances. Customer service was very helpful in choosing the right scent.",
    product_en: "Golden Amber",
    product_ar: "العنبر الذهبي",
    avatar: "users/emma-davis.jpg",
  },
  {
    id: 4,
    name: "David Wilson",
    rating: 5,
    comment:
      "Premium quality perfumes at competitive prices. Will definitely order again!",
    product_en: "Royal Oud",
    product_ar: "العود الملكي",
    avatar: "users/david-wilson.jpg",
  },
  {
    id: 5,
    name: "Lisa Thompson",
    rating: 5,
    comment:
      "The fragrance is exactly as described. Long-lasting and beautiful scent. Highly recommend!",
    product_en: "Vanilla Dreams",
    product_ar: "أحلام الفانيليا",
    avatar: "users/lisa-thompson.jpg",
  },
];

export default function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const t = useTranslations("reviews");
  const locale = t("locale");

  const getProductName = (review: (typeof reviews)[0]) => {
    return locale === "ar" ? review.product_ar : review.product_en;
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === 0 ? reviews.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === reviews.length - 1 ? 0 : currentIndex + 1);
  };

  const handleAvatarError = (error: string, src: string) => {
    console.warn(`Avatar failed to load for ${reviews[currentIndex].name}:`, {
      error,
      src,
    });
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-800 mb-4">
            {t("title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-3xl p-8 lg:p-12">
            <div className="text-center">
              {/* Stars */}
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < reviews[currentIndex].rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Review Text */}
              <blockquote className="text-xl lg:text-2xl text-gray-900 mb-8 leading-relaxed">
                "{reviews[currentIndex].comment}"
              </blockquote>

              {/* Customer Info */}
              <div
                className={`flex items-center justify-center space-x-4 `}
              >
                <div className="relative">
                  <SafeImage
                    src={getUserAvatarUrl(reviews[currentIndex].avatar)}
                    alt={reviews[currentIndex].name}
                    width={60}
                    height={60}
                    className="rounded-full object-cover"
                    fallbackType="avatar"
                    context={`Review avatar - ${reviews[currentIndex].name}`}
                    onImageError={handleAvatarError}
                    showLoadingState={false}
                  />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">
                    {reviews[currentIndex].name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("purchased")}:{" "}
                    {getProductName(reviews[currentIndex])}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="sm"
            className={`absolute start-4 top-1/2 transform -translate-y-1/2 rounded-full p-2`}
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`absolute end-4 top-1/2 transform -translate-y-1/2 rounded-full p-2`}
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentIndex ? "bg-secondary" : "bg-gray-300"
                }`}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
