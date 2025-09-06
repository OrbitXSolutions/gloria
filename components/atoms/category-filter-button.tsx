"use client";

import { Button } from "@/components/ui/button";
import CategoryIcon from "./category-icon";
import { Category } from "@/lib/types/products-page";

interface Props {
  category: Category;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  locale: string;
}

export default function CategoryFilterButton({
  category,
  isActive,
  onClick,
  disabled = false,
  locale,
}: Props) {
  const getCategoryName = (category: Category) => {
    return locale === "ar"
      ? category.name_ar || category.name_en
      : category.name_en;
  };

  return (
    <Button
      type="button"
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={`group flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-xl transition-all duration-300 border-2 min-w-[80px] ${isActive
          ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white border-purple-600 shadow-lg shadow-purple-200/50 scale-105"
          : "bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 border-purple-200 hover:border-purple-300 hover:shadow-md hover:scale-102"
        }`}
      disabled={disabled}
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive
          ? "bg-white/20 backdrop-blur-sm"
          : "bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 group-hover:from-purple-200 group-hover:via-pink-100 group-hover:to-purple-200"
        }`}>
        <CategoryIcon
          className={`w-6 h-6 rounded-full transition-all duration-300 ${isActive ? "text-white" : "text-purple-600 group-hover:text-purple-700"
            }`}
          name={category.slug || ""}
          image={category.image}
        />
      </div>
      <span className={`text-xs font-medium transition-all duration-300 leading-tight text-center ${isActive ? "text-white" : "text-gray-700 group-hover:text-purple-700"
        }`}>
        {getCategoryName(category)}
      </span>
    </Button>
  );
}
