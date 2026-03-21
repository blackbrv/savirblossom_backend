import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState, NotFoundState } from "./LoadingState";

interface DetailPageProps<T> {
    data?: T;
    isLoading?: boolean;
    isError?: boolean;
    onRetry?: () => void;
    backPath: string;
    children: React.ReactNode;
}

export function DetailPage<T>({
    data,
    isLoading,
    isError,
    onRetry,
    backPath,
    children,
}: DetailPageProps<T>) {
    const navigate = useNavigate();

    if (isLoading) {
        return <LoadingState className="h-64" />;
    }

    if (isError || !data) {
        return (
            <NotFoundState
                className="h-64"
                description={
                    isError
                        ? "An error occurred while loading the data."
                        : "The requested resource was not found."
                }
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(backPath)}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-2xl font-bold tracking-tight">Details</h2>
            </div>
            {children}
        </div>
    );
}
