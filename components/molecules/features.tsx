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
import { useState, useEffect } from "react";

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
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems(prev => [...prev, index]);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('[data-index]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-800 mb-4 animate-slide-up">
            {t("title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto animate-slide-up animation-delay-200">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureKeys.map((feature, index) => {
            const Icon = feature.icon;
            const isVisible = visibleItems.includes(index);

            return (
              <div
                key={feature.key}
                data-index={index}
                className={`bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 ${isVisible
                    ? 'animate-slide-up opacity-100'
                    : 'opacity-0 translate-y-8'
                  }`}
                style={{
                  animationDelay: `${index * 150}ms`,
                  transitionDelay: `${index * 150}ms`
                }}
              >
                <div className={`flex items-center mb-4 gap-4`}>
                  <div className="bg-secondary-100 rounded-full p-3 transform transition-transform duration-300 hover:rotate-12 hover:scale-110">
                    <Icon className="h-6 w-6 text-secondary transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 text-start transition-colors duration-300 hover:text-secondary">
                    {t(`items.${feature.key}.title`)}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-start transition-colors duration-300 hover:text-gray-800">
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
