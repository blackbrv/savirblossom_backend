import React from "react";
import { Button } from "@/components/ui/button";
import DeleteConfirmationDialog from "@/src/components/ui/DeleteConfirmationDialog";
import { Eye, Pencil, Trash } from "lucide-react";

interface ActionsCellProps {
    id: number;
    name: string;
    previewHref?: string;
    editHref: string;
    onDelete: () => void;
    isDeleting?: boolean;
}

export function ActionsCell({
    id,
    name,
    previewHref,
    editHref,
    onDelete,
    isDeleting,
}: ActionsCellProps) {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    return (
        <>
            <DeleteConfirmationDialog
                title={`Delete ${name}`}
                description={`Are you sure you want to delete "${name}"? This action cannot be undone.`}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onConfirm={() => {
                    onDelete();
                    setIsDialogOpen(false);
                }}
                isLoading={isDeleting}
            />
            <div className="flex gap-8 items-center">
                {previewHref && (
                    <Button
                        asChild
                        variant={"link"}
                        size={"icon"}
                        className="gap-1"
                    >
                        <a href={previewHref}>
                            <Eye className="text-primary" />
                            Preview
                        </a>
                    </Button>
                )}
                <Button
                    asChild
                    variant={"link"}
                    size={"icon"}
                    className="gap-1"
                >
                    <a href={editHref}>
                        <Pencil className="text-primary" />
                        Edit
                    </a>
                </Button>
                <Button
                    variant={"link"}
                    size={"icon"}
                    className="gap-1"
                    onClick={(e) => {
                        e.preventDefault();
                        setIsDialogOpen(true);
                    }}
                >
                    <Trash className="text-primary" />
                    Delete
                </Button>
            </div>
        </>
    );
}
