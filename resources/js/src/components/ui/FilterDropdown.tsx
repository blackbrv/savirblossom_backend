import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type FilterDropdownProps = {
    label: string;
    value?: string;
    isActive?: boolean;
    children: React.ReactNode;
    className?: string;
};

export default function FilterDropdown({
    label,
    value,
    isActive = false,
    children,
    className,
}: FilterDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <Popover onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                    {isActive && (
                        <span className="w-2 h-2 rounded-full bg-foreground" />
                    )}
                    <span>
                        {label}
                        {value && (
                            <span className="text-muted-foreground">
                                : {value}
                            </span>
                        )}
                    </span>
                    {isOpen ? (
                        <ChevronUp className="size-4" />
                    ) : (
                        <ChevronDown className="size-4" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                sideOffset={4}
                className={cn("w-auto p-2", className)}
            >
                <div className="flex flex-col gap-2">{children}</div>
            </PopoverContent>
        </Popover>
    );
}
