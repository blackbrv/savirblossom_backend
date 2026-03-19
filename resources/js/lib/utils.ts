import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function truncateNumber(num: number, maxDigits: number = 4): string {
    if (num < 10000) return String(num);
    return String(num).slice(0, maxDigits) + "...";
}
