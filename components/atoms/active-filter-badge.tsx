"use client";

import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Props {
    label: string;
    onRemove: () => void;
}

export default function ActiveFilterBadge({ label, onRemove }: Props) {
    return (
        <Badge variant="secondary" className="flex items-center gap-1">
            {label}
            <X className="h-3 w-3 cursor-pointer" onClick={onRemove} />
        </Badge>
    );
} 