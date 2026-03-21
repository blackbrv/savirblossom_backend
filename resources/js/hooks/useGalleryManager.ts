import { useState, useCallback } from "react";

export interface GalleryItem {
    id?: number;
    image: string;
    caption?: string;
}

interface UseGalleryManagerOptions {
    initialData?: GalleryItem[];
}

interface UseGalleryManagerReturn {
    items: GalleryItem[];
    setItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
    addItem: (item: GalleryItem) => void;
    updateItem: (index: number, item: GalleryItem) => void;
    removeItem: (index: number) => void;
    clearItems: () => void;
    openAddDialog: boolean;
    setOpenAddDialog: React.Dispatch<React.SetStateAction<boolean>>;
    openEditDialog: boolean;
    setOpenEditDialog: React.Dispatch<React.SetStateAction<boolean>>;
    editingIndex: number | null;
    setEditingIndex: React.Dispatch<React.SetStateAction<number | null>>;
    handleOpenAddDialog: () => void;
    handleOpenEditDialog: (index: number) => void;
    handleSaveImage: (item: GalleryItem) => void;
    handleDeleteImage: (index: number) => void;
    dialogItem: GalleryItem;
    setDialogItem: React.Dispatch<React.SetStateAction<GalleryItem>>;
}

export function useGalleryManager({
    initialData = [],
}: UseGalleryManagerOptions = {}): UseGalleryManagerReturn {
    const [items, setItems] = useState<GalleryItem[]>(initialData);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [dialogItem, setDialogItem] = useState<GalleryItem>({ image: "" });

    const addItem = useCallback((item: GalleryItem) => {
        setItems((prev) => [...prev, item]);
    }, []);

    const updateItem = useCallback((index: number, item: GalleryItem) => {
        setItems((prev) => {
            const newItems = [...prev];
            newItems[index] = item;
            return newItems;
        });
    }, []);

    const removeItem = useCallback((index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const clearItems = useCallback(() => {
        setItems([]);
    }, []);

    const handleOpenAddDialog = useCallback(() => {
        setDialogItem({ image: "" });
        setOpenAddDialog(true);
    }, []);

    const handleOpenEditDialog = useCallback(
        (index: number) => {
            setEditingIndex(index);
            const item = items[index];
            if (item) {
                setDialogItem(item);
            }
            setOpenEditDialog(true);
        },
        [items],
    );

    const handleSaveImage = useCallback(
        (item: GalleryItem) => {
            if (editingIndex !== null) {
                updateItem(editingIndex, item);
                setEditingIndex(null);
            } else {
                addItem(item);
            }
            setOpenAddDialog(false);
            setOpenEditDialog(false);
            setDialogItem({ image: "" });
        },
        [editingIndex, updateItem, addItem],
    );

    const handleDeleteImage = useCallback(
        (index: number) => {
            removeItem(index);
        },
        [removeItem],
    );

    return {
        items,
        setItems,
        addItem,
        updateItem,
        removeItem,
        clearItems,
        openAddDialog,
        setOpenAddDialog,
        openEditDialog,
        setOpenEditDialog,
        editingIndex,
        setEditingIndex,
        handleOpenAddDialog,
        handleOpenEditDialog,
        handleSaveImage,
        handleDeleteImage,
        dialogItem,
        setDialogItem,
    };
}
