"use client";

import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { axisProps, CHART, ChartTooltip } from "./ChartPrimitives";

export interface TrendSeries {
  key: string;
  name: string;
  color: string;
  area?: boolean;
  dashed?: boolean;
}

interface TrendChartProps {
  data: object[];
  xKey: string;
  series: TrendSeries[];
  yFormat?: (v: number) => string;
  tooltipFormat?: (v: number, name: string) => string;
  yDomain?: [number | "auto" | "dataMin", number | "auto" | "dataMax"];
  highlightLast?: boolean;
  ariaLabel: string;
  xInterval?: number | "preserveStartEnd";
  yTicks?: number[];
  asLine?: boolean;
}

export function TrendChart({
  data,
  xKey,
  series,
  yFormat,
  tooltipFormat,
  yDomain,
  highlightLast,
  ariaLabel,
  xInterval = "preserveStartEnd",
  yTicks,
  asLine,
}: TrendChartProps) {
  const last = data[data.length - 1] as Record<string, string | number> | undefined;
  const gradientId = (k: string) => `grad-${k}`;
  const common = {
    data,
    margin: { top: 10, right: 12, left: 0, bottom: 0 },
  };
  const grid = <CartesianGrid stroke={CHART.grid} strokeDasharray="3 4" vertical={false} />;
  const xAxis = <XAxis dataKey={xKey} {...axisProps} interval={xInterval} minTickGap={24} />;
  const yAxis = <YAxis {...axisProps} width={46} tickFormatter={yFormat} domain={yDomain} ticks={yTicks} />;
  const tooltip = (
    <Tooltip
      cursor={{ stroke: CHART.axis, strokeDasharray: "3 3" }}
      content={<ChartTooltip format={tooltipFormat} />}
    />
  );

  return (
    <div role="img" aria-label={ariaLabel} className="h-full min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        {asLine ? (
          <LineChart {...common}>
            {grid}
            {xAxis}
            {yAxis}
            {tooltip}
            {series.map((s) => (
              <Line
                key={s.key}
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.dashed ? "4 4" : undefined}
                dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        ) : (
          <AreaChart {...common}>
            <defs>
              {series
                .filter((s) => s.area)
                .map((s) => (
                  <linearGradient key={s.key} id={gradientId(s.key)} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
            </defs>
            {grid}
            {xAxis}
            {yAxis}
            {tooltip}
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={s.area ? 2.25 : 1.75}
                strokeDasharray={s.dashed ? "4 4" : undefined}
                fill={s.area ? `url(#${gradientId(s.key)})` : "transparent"}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            ))}
            {highlightLast && last && (
              <ReferenceDot x={String(last[xKey])} y={Number(last[series[0].key])} r={4} fill={series[0].color} stroke="#fff" strokeWidth={2} />
            )}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
