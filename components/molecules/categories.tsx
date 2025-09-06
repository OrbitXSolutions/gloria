"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Crown,
  Users,
  Gem,
  Leaf,
  Star,
  TreePine,
  Flower,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Database } from "@/lib/types/database.types";
import CategoryIcon from "../atoms/category-icon";

const categoryIcons = [
  { key: "women", icon: Sparkles, href: "/women" },
  { key: "men", icon: Crown, href: "/men" },
  { key: "unisex", icon: Users, href: "/unisex" },
  { key: "luxury", icon: Gem, href: "/luxury" },
  { key: "fresh", icon: Leaf, href: "/fresh" },
  { key: "oriental", icon: Star, href: "/oriental" },
  //   { key: "woody", icon: TreePine, href: "/woody" },
  //   { key: "floral", icon: Flower, href: "/floral" },
];
type category = Database["public"]["Tables"]["categories"]["Row"];
export default function Categories({
  categories = [],
}: {
  categories?: category[];
}) {
  const t = useTranslations("categories");
  const locale = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="container mx-auto px-4">
        <div
          className={`text-center mb-16 transform transition-all duration-1000 ${isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
            }`}
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: "#6e5475" }}>
            {t("title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">{t("description")}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 max-w-7xl mx-auto justify-items-center">
          {categories?.map((category, index) => {
            return (
              <Link
                key={category.slug}
                href={{
                  pathname: "/products",
                  query: {
                    category: locale == "en" ? category.slug : category.slug_ar,
                  },
                }}
                className={`group flex flex-col items-center text-center hover:transform hover:scale-110 transition-all duration-300 w-full max-w-[120px] ${isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
                  }`}
                style={{
                  transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
                }}
              >
                <div className="relative w-20 h-20 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:from-purple-200 group-hover:via-pink-100 group-hover:to-purple-200 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-200/50 border border-purple-100/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-2xl"></div>
                  <CategoryIcon
                    className="h-12 w-12 text-purple-600 relative z-10 transform group-hover:rotate-6 transition-transform duration-300"
                    name={category.slug}
                    image={category.image}
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-purple-700 transition-colors duration-300 leading-tight">
                  <div className="text-center break-words">
                    {locale == "en" ? category.name_en : category.name_ar}
                  </div>
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
