"use client";

import { useMemo } from "react";
import {
  Label as PieLabel,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { CalculatorOutput } from "@/lib/calculator";
import { formatCurrency } from "@/lib/format";

type Props = {
  chartData: { label: string; value: number; color: string }[];
  quote: CalculatorOutput;
};

export function DetailedBreakdown({ chartData, quote }: Props) {
  const pieConfig = useMemo(() => {
    return chartData.reduce((acc, item, index) => {
      acc[`slice${index}`] = { label: item.label, color: item.color };
      return acc;
    }, {} as ChartConfig);
  }, [chartData]);

  const pieData = chartData.map((item, index) => ({
    name: item.label,
    value: Number(item.value.toFixed(2)),
    fill: `var(--color-slice${index})`,
  }));

  return (
    <Card className="h-full">
      <CardHeader className="items-center pb-2 text-center">
        <CardTitle>Ripartizione del costo</CardTitle>
        <CardDescription>
          Paga netta, contributi, accantonamenti e fee Baze.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center pb-0">
        <ChartContainer
          config={pieConfig}
          className="mx-auto aspect-square w-full max-w-sm"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius="55%"
                strokeWidth={6}
              >
                <PieLabel
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {formatCurrency(quote.costoTotaleDatore)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-sm"
                          >
                            Costo mensile
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-1 text-center text-sm text-muted-foreground"></CardFooter>
    </Card>
  );
}
