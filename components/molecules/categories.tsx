"use client";

import Link from "next/link";
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
import { useTranslations } from "next-intl";

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

export default function Categories() {
  const t = useTranslations("categories");

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-600 mb-4">
            {t("title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="flex justify-between gap-6 container mx-auto  lg:px-30 flex-wrap">
          {categoryIcons.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.key}
                href={category.href}
                className="group flex flex-col items-center text-center hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-secondary-100 to-secondary-100 rounded-full flex items-center justify-center mb-4 group-hover:from-secondary-200 group-hover:to-secondary-200 transition-all duration-300">
                  <Icon className="h-10 w-10 text-secondary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t(`items.${category.key}`)}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
