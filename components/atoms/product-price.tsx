"use client";

import { formatProductPrice } from "@/lib/common/cart";
import { useLocale } from "next-intl";

interface Props {
    price: number | null;
    oldPrice?: number | null;
    currency: any;
}

export default function ProductPrice({ price, oldPrice, currency }: Props) {
    const locale = useLocale();

    return (
        <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
                {formatProductPrice(price, currency, locale)}
            </span>
            {oldPrice && oldPrice > (price || 0) && (
                <span className="text-sm text-gray-500 line-through">
                    {formatProductPrice(oldPrice, currency, locale)}
                </span>
            )}
        </div>
    );
} 