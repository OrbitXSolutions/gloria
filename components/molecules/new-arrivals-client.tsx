"use client";

import { Button } from "@/components/ui/button";
import { ProductWithUserData } from "@/lib/types/database.types";
import { useTranslations } from "next-intl";
import ProductCard from "./product-card";

interface Props {
  products: ProductWithUserData[];
}

export default function NewArrivalsClient({
  products,
}: Props) {
  const t = useTranslations('newArrivals');

  return (
    <section className="py-16 bg-gray-50">
      <div className=" px-4  container mx-auto max-w-[1300px]">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-800 mb-4">
            {t("title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{t("description")}</p>
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showNewBadge={true}
                />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
                className="border-secondary text-secondary hover:bg-purple-50"
              >
                {t("viewAll")}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t("noProducts")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
