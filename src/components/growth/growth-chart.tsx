"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { GrowthSnapshot } from "@/types/database";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface GrowthChartProps {
  data: GrowthSnapshot[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  const chartData = data.map((s) => ({
    date: format(new Date(s.snapshot_date), "M/d", { locale: ko }),
    성장지수: s.growth_index,
    수업횟수: s.total_sessions,
  }));

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
        <defs>
          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2D5A3D" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2D5A3D" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="성장지수"
          stroke="#2D5A3D"
          strokeWidth={2}
          fill="url(#growthGradient)"
          dot={{ r: 3, fill: "#2D5A3D" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
