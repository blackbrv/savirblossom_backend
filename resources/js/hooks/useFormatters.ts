export const priceFormatter = (
    value: number,
    {
        locale = "id-ID",
        currency = "IDR",
    }: { locale?: string; currency?: string } = {},
) => {
    const formatter = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 3,
        trailingZeroDisplay: "stripIfInteger",
    });

    return formatter.format(value);
};

export function formatDate(
    value: string | Date | null | undefined,
    options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
    },
): string {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-US", options);
}

export function formatDateTime(
    value: string | Date | null | undefined,
): string {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatDateInput(
    value: string | Date | null | undefined,
): string {
    if (!value) return "";
    const date = new Date(value);
    return date.toISOString().split("T")[0] ?? "";
}
