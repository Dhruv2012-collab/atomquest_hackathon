"use client";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const data = [
  { name: "Apr 5", goals: 24, checkins: 10 },
  { name: "Apr 9", goals: 13, checkins: 20 },
  { name: "Apr 13", goals: 48, checkins: 15 },
  { name: "Apr 18", goals: 28, checkins: 12 },
  { name: "Apr 23", goals: 70, checkins: 25 },
  { name: "Apr 28", goals: 39, checkins: 30 },
  { name: "May 3", goals: 68, checkins: 40 },
  { name: "May 7", goals: 38, checkins: 20 },
  { name: "May 12", goals: 50, checkins: 35 },
  { name: "May 17", goals: 85, checkins: 45 },
  { name: "May 22", goals: 40, checkins: 20 },
  { name: "May 27", goals: 70, checkins: 30 },
  { name: "Jun 1", goals: 55, checkins: 25 },
  { name: "Jun 5", goals: 90, checkins: 50 },
  { name: "Jun 9", goals: 60, checkins: 35 },
  { name: "Jun 14", goals: 80, checkins: 40 },
  { name: "Jun 19", goals: 45, checkins: 22 },
  { name: "Jun 24", goals: 75, checkins: 40 },
  { name: "Jun 30", goals: 95, checkins: 55 },
];

export function ManagerChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#555" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#555" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: "#666", fontSize: 10 }}
          dy={10}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: "#121212", borderColor: "#333", borderRadius: "8px" }}
          itemStyle={{ color: "#eee" }}
        />
        <Area
          type="monotone"
          dataKey="checkins"
          stroke="#555"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorCheckins)"
        />
        <Area
          type="monotone"
          dataKey="goals"
          stroke="#fff"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorGoals)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
