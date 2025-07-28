"use client";

import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface Props {
    icon: LucideIcon;
    label: string;
    isActive: boolean;
    onClick: () => void;
    disabled?: boolean;
}

export default function SortButton({
    icon: Icon,
    label,
    isActive,
    onClick,
    disabled = false,
}: Props) {
    return (
        <Button
            type="button"
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={onClick}
            className="flex items-center gap-2"
            disabled={disabled}
        >
            <Icon className="h-4 w-4" />
            {label}
        </Button>
    );
} 