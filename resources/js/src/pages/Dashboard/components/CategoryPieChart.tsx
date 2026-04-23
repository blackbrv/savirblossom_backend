import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { CategorySales } from "@/services/Dashboard/DashboardApi";

const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
];

interface CategoryPieChartProps {
    data: CategorySales[];
    isLoading: boolean;
    onCategoryClick: (category: CategorySales) => void;
}

interface CategoryPieChartProps {
    data: CategorySales[];
    isLoading: boolean;
    onCategoryClick: (category: CategorySales) => void;
}

export function CategoryPieChart({
    data,
    isLoading,
    onCategoryClick,
}: CategoryPieChartProps) {
    const CustomTooltip = ({
        active,
        payload,
    }: {
        active?: boolean;
        payload?: Array<{ payload: CategorySales }>;
    }) => {
        if (active && payload && payload.length > 0) {
            const categoryData = payload[0]?.payload;
            if (!categoryData) return null;

            const topProductsList = categoryData.top_products
                .slice(0, 5)
                .map((p) => `${p.name}: ${p.quantity}`)
                .join(", ");

            return (
                <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <p className="font-semibold">
                        {categoryData.category_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Total: {categoryData.total_quantity.toLocaleString()}{" "}
                        sold
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 border-t pt-1">
                        Top 5: {topProductsList}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Click on a category to see top selling products
                </p>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-75 flex items-center justify-center">
                        <span className="text-muted-foreground">
                            Loading chart...
                        </span>
                    </div>
                ) : data && data.length > 0 ? (
                    <ChartContainer
                        config={Object.fromEntries(
                            data.map((item, i) => [
                                item.category_name,
                                {
                                    label: item.category_name,
                                    color: CHART_COLORS[
                                        i % CHART_COLORS.length
                                    ],
                                },
                            ]),
                        )}
                        className="h-75 w-full"
                    >
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="total_quantity"
                                nameKey="category_name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={50}
                                paddingAngle={2}
                                onClick={(_, index) => {
                                    const item = data[index];
                                    if (item) onCategoryClick(item);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            CHART_COLORS[
                                                index % CHART_COLORS.length
                                            ]
                                        }
                                    />
                                ))}
                            </Pie>
                            <ChartTooltip content={<CustomTooltip />} />
                            <Legend
                                formatter={(value) => (
                                    <span className="text-sm">{value}</span>
                                )}
                            />
                        </PieChart>
                    </ChartContainer>
                ) : (
                    <div className="h-75 flex items-center justify-center">
                        <span className="text-muted-foreground">
                            No data available
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
