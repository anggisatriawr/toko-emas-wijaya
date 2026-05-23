"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartData {
  date: string;
  day: string;
  penjualan: number;
  buyback: number;
}

interface DashboardChartProps {
  data: ChartData[];
}

export function DashboardChart({ data }: DashboardChartProps) {
  // Format the Rupiah currency
  const formatRupiah = (value: number) => {
    if (value === 0) return "Rp 0";
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)} Jt`;
    }
    return `Rp ${(value / 1000).toFixed(0)} Rb`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/20 p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-white font-bold mb-2 pb-2 border-b border-white/10">Tanggal {label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-emerald-400">Pemasukan: <span className="font-bold">Rp {payload[0]?.value?.toLocaleString("id-ID") || 0}</span></p>
            <p className="text-purple-400">Pengeluaran: <span className="font-bold">Rp {payload[1]?.value?.toLocaleString("id-ID") || 0}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorPenjualan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorBuyback" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c084fc" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
          <XAxis 
            dataKey="day" 
            stroke="#ffffff50" 
            tick={{ fill: "#ffffff80", fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tickFormatter={formatRupiah} 
            stroke="#ffffff50" 
            tick={{ fill: "#ffffff80", fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff30', strokeWidth: 2 }} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-white/80 font-medium ml-2 mr-4">{value === "penjualan" ? "Pemasukan Penjualan" : "Pengeluaran Buyback"}</span>}
          />
          <Area 
            type="monotone" 
            dataKey="penjualan" 
            stroke="#34d399" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPenjualan)" 
            activeDot={{ r: 6, fill: "#34d399", stroke: "#000", strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="buyback" 
            stroke="#c084fc" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorBuyback)" 
            activeDot={{ r: 6, fill: "#c084fc", stroke: "#000", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
