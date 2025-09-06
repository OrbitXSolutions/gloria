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
    <section ref={sectionRef} className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div
          className={`text-center mb-12 transform transition-all duration-1000 ${isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
            }`}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-600 mb-4">
            {t("title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{t("description")}</p>
        </div>

        <div className="flex justify-between max-md:max-w-[320px] gap-6 container mx-auto  lg:px-30 flex-wrap">
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
                className={`group flex flex-col  items-center text-center hover:transform hover:scale-105 transition-all duration-300 ${isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                  }`}
                style={{
                  transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
                }}
              >
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4 group-hover:from-secondary-200 group-hover:to-secondary-200 transition-all duration-300 group-hover:shadow-lg">
                  <CategoryIcon
                    className="h-16 w-16 text-primary rounded-full transform group-hover:rotate-3 transition-transform duration-300"
                    name={category.slug}
                    image={category.image}
                  />
                </div>
                <h3 className="text-sm self-start text-center font-bold text-primary-600 w-[60px]">
                  <div className="text-center">
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
