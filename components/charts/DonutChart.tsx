"use client";

import type { ReactNode } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip } from "./ChartPrimitives";

export interface DonutDatum {
  name: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  center,
  ariaLabel,
  tooltipFormat,
}: {
  data: DonutDatum[];
  center?: ReactNode;
  ariaLabel: string;
  tooltipFormat?: (v: number, name: string) => string;
}) {
  return (
    <div role="img" aria-label={ariaLabel} className="relative h-full min-h-[190px] w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <PieChart>
          <Tooltip content={<ChartTooltip format={tooltipFormat} />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="100%"
            paddingAngle={1.5}
            stroke="#fff"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {center && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">{center}</div>
      )}
    </div>
  );
}
