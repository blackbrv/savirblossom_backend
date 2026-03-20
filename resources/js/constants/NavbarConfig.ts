export const NavigationList = [
    { title: "Home", value: "/dashboard" },
    {
        title: "Bouquet",
        value: "/bouquet",
        submenu: [
            {
                title: "Bouquets",
                value: "/dashboard/bouquet",
            },
            {
                title: "Categories",
                value: "/dashboard/categories",
            },
        ],
    },
    {
        title: "Customers",
        value: "/dashboard/customers",
    },
    {
        title: "Order",
        value: "/dashboard/ordedr",
    },
];
