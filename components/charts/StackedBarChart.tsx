"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { axisProps, CHART, ChartTooltip } from "./ChartPrimitives";

export interface BarSeries {
  key: string;
  name: string;
  color: string;
}

export function StackedBarChart({
  data,
  xKey,
  series,
  yFormat,
  tooltipFormat,
  ariaLabel,
  yTicks,
}: {
  data: object[];
  xKey: string;
  series: BarSeries[];
  yFormat?: (v: number) => string;
  tooltipFormat?: (v: number, name: string) => string;
  ariaLabel: string;
  yTicks?: number[];
}) {
  return (
    <div role="img" aria-label={ariaLabel} className="h-full min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="24%">
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} width={44} tickFormatter={yFormat} ticks={yTicks} />
          <Tooltip cursor={{ fill: "rgba(14,81,61,0.06)" }} content={<ChartTooltip format={tooltipFormat} />} />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              stackId="a"
              fill={s.color}
              radius={i === series.length - 1 ? [4, 4, 0, 0] : 0}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
