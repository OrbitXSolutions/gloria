"use client";

import {
  Truck,
  RotateCcw,
  Shield,
  Headphones,
  Award,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

const featureKeys = [
  { key: "fastDelivery", icon: Truck },
  { key: "returns", icon: RotateCcw },
  { key: "authentic", icon: Shield },
  { key: "support", icon: Headphones },
  { key: "quality", icon: Award },
  { key: "giftWrap", icon: Sparkles },
];

export default function Features() {
  const t = useTranslations("features");

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-800 mb-4">
            {t("title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureKeys.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.key}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className={`flex items-center mb-4 gap-4`}>
                  <div className="bg-secondary-100 rounded-full p-3">
                    <Icon className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 text-start">
                    {t(`items.${feature.key}.title`)}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-start">
                  {t(`items.${feature.key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
