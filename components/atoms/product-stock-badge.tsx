"use client";

import { useTranslations } from "next-intl";

interface Props {
    quantity: number | null;
    isOutOfStock: boolean;
}

export default function ProductStockBadge({ quantity, isOutOfStock }: Props) {
    const t = useTranslations("products");

    if (isOutOfStock) {
        return (
            <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                {t("outOfStock")}
            </div>
        );
    }

    // if (quantity && quantity <= 5) {
    //     return (
    //         <span className="text-sm text-gray-500">
    //             {quantity} {t("inStock")}
    //         </span>
    //     );
    // }

    return null;
} 