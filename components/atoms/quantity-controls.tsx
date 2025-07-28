"use client";

import { Button } from "@/components/ui/button";

interface Props {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
}

export default function QuantityControls({
    quantity,
    onIncrease,
    onDecrease
}: Props) {
    return (
        <div className="flex items-center bg-secondary-50 rounded-lg p-2 gap-3">
            <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 border-secondary-200 hover:bg-secondary-100"
                onClick={onDecrease}
            >
                <span className="text-secondary-600 font-bold">-</span>
            </Button>
            <span className="text-sm font-semibold text-secondary-700 min-w-[2rem] text-center">
                {quantity}
            </span>
            <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 border-secondary-200 hover:bg-secondary-100"
                onClick={onIncrease}
            >
                <span className="text-secondary-600 font-bold">+</span>
            </Button>
        </div>
    );
} 