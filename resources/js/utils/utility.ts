type PriceFormatterOptions = {
    locale?: string;
    currency?: string;
};

export const priceFormatter = (
    value: number,
    { locale = "id-ID", currency = "IDR" }: PriceFormatterOptions = {},
) => {
    const formatter = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 3,
        trailingZeroDisplay: "stripIfInteger",
    });

    const finalValue = formatter.format(value);

    return finalValue;
};
