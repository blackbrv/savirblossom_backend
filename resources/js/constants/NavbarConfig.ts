interface GeneralNavigationListProps {
    title: string;
    value?: string;
}

interface NavigationListProps extends GeneralNavigationListProps {
    submenu?: GeneralNavigationListProps[];
}

export const NavigationList: NavigationListProps[] = [
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
        title: "Customer",
        value: "/dashboard/customers",
    },
    {
        title: "Feedback",
        value: "/dashboard/feedback",
        submenu: [
            {
                title: "Feedback Responses",
                value: "/dashboard/feedback",
            },
            {
                title: "Feedback Questions",
                value: "/dashboard/feedback/questions",
            },
        ],
    },
    {
        title: "Orders",
        value: "/dashboard/orders",
    },
    {
        title: "Discount",
        value: "/dashboard/discount",
    },
];
