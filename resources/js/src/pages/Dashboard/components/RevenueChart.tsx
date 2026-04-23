import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { priceFormatter } from "@/utils/utility";

interface ChartDataPoint {
    period: string;
    revenue: number;
}

interface RevenueChartProps {
    data: ChartDataPoint[];
    isLoading: boolean;
    period: string;
    onPeriodChange: (period: string) => void;
}

const PERIODS = [
    { value: "monthly", label: "Monthly" },
    { value: "weekly", label: "Weekly" },
    { value: "daily", label: "Daily" },
];

export function RevenueChart({
    data,
    isLoading,
    period,
    onPeriodChange,
}: RevenueChartProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Revenue Overview</CardTitle>
                <Select value={period} onValueChange={onPeriodChange}>
                    <SelectTrigger className="w-35">
                        <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                        {PERIODS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                                {p.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
                        config={{
                            revenue: {
                                label: "Revenue",
                                color: "hsl(var(--chart-1))",
                            },
                        }}
                        className="h-75 w-full"
                    >
                        <AreaChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <XAxis
                                dataKey="period"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) =>
                                    value >= 1000000
                                        ? `${(value / 1000000).toFixed(1)}M`
                                        : value >= 1000
                                          ? `${(value / 1000).toFixed(0)}K`
                                          : value
                                }
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value) => [
                                            "Revenue: ",
                                            priceFormatter(Number(value)),
                                        ]}
                                    />
                                }
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="var(--chart-1)"
                                fill="var(--chart-1)"
                                fillOpacity={0.3}
                            />
                        </AreaChart>
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
