"use client";

import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";

type ViewMode = "grid" | "list";

interface Props {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    disabled?: boolean;
}

export default function ViewModeToggle({
    viewMode,
    onViewModeChange,
    disabled = false,
}: Props) {
    return (
        <div className="flex flex-col items-start lg:items-end">
            <h3 className="text-sm font-medium text-gray-700 mb-3">View</h3>
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="lg"
                    onClick={() => onViewModeChange("grid")}
                    className="px-4"
                    disabled={disabled}
                >
                    <Grid className="h-5 w-5" />
                </Button>
                <Button
                    type="button"
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="lg"
                    onClick={() => onViewModeChange("list")}
                    className="px-4"
                    disabled={disabled}
                >
                    <List className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
} 