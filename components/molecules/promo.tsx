"use client";

import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/constants/supabase-storage";
import { useTranslations } from "next-intl";
import SafeImage from "../_common/safe-image";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";

export default function Promo() {
  const t = useTranslations("banner");

  // Banner image path - you can store this in your database or use static paths
  const bannerImagePath = "/images/mon-promo.png";
  const bannerImageUrl = bannerImagePath;

  const handleBannerImageError = (error: string, src: string) => {
    console.warn("Banner image failed to load:", { error, src });
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="relative bg-gradient-to-r from-primary to-primary-600 rounded-3xl overflow-hidden">
          <div className="grid lg:grid-cols-2 items-center">
            {/* Content */}
            <div className="p-8 lg:p-16 text-white">
              <div className="space-y-6">
                <div className="inline-block text-primary bg-white bg-opacity-20 rounded-full px-4 py-2 text-sm font-medium">
                  {t("limitedOffer")}
                </div>
                <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                  {t("title")}
                  <span className="block">{t("subtitle")}</span>
                </h2>
                <p className="text-lg opacity-90 max-w-md">
                  {t("description")}
                </p>
                <div className={`flex flex-col sm:flex-row gap-4`}>
                  <Button
                    size="lg"
                    className="bg-white text-secondary hover:bg-gray-100"
                  >
                    {t("shopSale")}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-secondary bg-secondary/20 text-white hover:bg-secondary hover:text-white"
                  >
                    {t("viewDeals")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative p-4 mx-auto ">
              <Image
                src={bannerImageUrl}
                alt="Summer Sale Collection"
                height={400}
                width={400}
                className="bg-slate-50 h-full max-h-100 w-auto"
                sizes="(max-width: 768px) 100vw, 50vw"
             objectFit="contain"
              />
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50  bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-50  bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
        </div>
      </div>
    </section>
  );
}
