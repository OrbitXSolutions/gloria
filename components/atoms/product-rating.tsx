"use client";

import { Star } from "lucide-react";

interface Props {
    averageRating: number;
    ratesCount: number;
}

export default function ProductRating({ averageRating, ratesCount }: Props) {
    if (averageRating <= 0) {
        return null;
    }

    return (
        <div className="flex items-center mb-3">
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(averageRating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                    />
                ))}
            </div>
            <span className="text-sm text-gray-500 ms-2">({ratesCount})</span>
        </div>
    );
} 