import React from "react";
import { cn } from "@/lib/utils";
import { statusColors } from "@/constants/statusColors";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const colors = statusColors[status.toLowerCase()] || {
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-800 dark:text-gray-200",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium capitalize",
                colors.bg,
                colors.text,
                className,
            )}
        >
            {status}
        </span>
    );
}
