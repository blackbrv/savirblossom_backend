import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
    message?: string;
    className?: string;
}

export function LoadingState({
    message = "Loading...",
    className,
}: LoadingStateProps) {
    return (
        <div className={className}>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>{message}</span>
            </div>
        </div>
    );
}

interface NotFoundStateProps {
    title?: string;
    description?: string;
    className?: string;
}

export function NotFoundState({
    title = "Not Found",
    description = "The requested resource was not found.",
    className,
}: NotFoundStateProps) {
    return (
        <div className={className}>
            <div className="flex flex-col items-center justify-center gap-2 text-center">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    message = "An error occurred while loading data.",
    onRetry,
    className,
}: ErrorStateProps) {
    return (
        <div className={className}>
            <div className="flex flex-col items-center justify-center gap-2 text-center text-destructive">
                <p>{message}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="text-sm underline underline-offset-4 hover:text-foreground"
                    >
                        Try again
                    </button>
                )}
            </div>
        </div>
    );
}
