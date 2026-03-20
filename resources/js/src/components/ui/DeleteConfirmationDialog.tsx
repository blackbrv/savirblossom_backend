import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";

interface DeleteConfirmationDialogProps {
    open?: boolean;
    onOpenChange?: (value: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    isLoading?: boolean;
}

export default function DeleteConfirmationDialog({
    open = false,
    onOpenChange,
    title,
    description,
    onConfirm,
    isLoading = false,
}: DeleteConfirmationDialogProps) {
    const [internalDialogOpen, setInternalDialogOpen] =
        React.useState<boolean>(false);

    const isDialogOpen =
        open !== undefined && onOpenChange !== undefined
            ? open
            : internalDialogOpen;
    const setIsDialogOpen =
        open !== undefined && onOpenChange !== undefined
            ? onOpenChange
            : setInternalDialogOpen;

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Deleting..." : "Sure"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
