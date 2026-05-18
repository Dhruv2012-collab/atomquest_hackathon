"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const teamSkillRadar = [
  { subject: 'Financial Targets', A: 120, fullMark: 150 },
  { subject: 'Product Delivery', A: 98, fullMark: 150 },
  { subject: 'Customer Success', A: 86, fullMark: 150 },
  { subject: 'Process Impr.', A: 99, fullMark: 150 },
  { subject: 'Innovation', A: 85, fullMark: 150 },
];

export function AnalyticsCharts({ teamPerformance }: { teamPerformance: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Individual Scores */}
      <div className="bg-[#151515] border border-[#222] rounded-xl p-6 shadow-sm">
        <h3 className="text-[13px] font-bold text-slate-200 mb-6 uppercase tracking-wider">Individual Performance Scores</h3>
        <div className="h-[300px]">
          {teamPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerformance} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={[0, 120]} tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  cursor={{ fill: "#1a1a1a" }} 
                  contentStyle={{ backgroundColor: "#121212", borderColor: "#333", borderRadius: "8px", fontSize: "12px", color: "#eee" }}
                  itemStyle={{ color: "#10b981" }}
                />
                <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} name="Avg Score %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-500">
              No performance data available. Approve goal plans first.
            </div>
          )}
        </div>
      </div>

      {/* Team Strengths Radar */}
      <div className="bg-[#151515] border border-[#222] rounded-xl p-6 shadow-sm">
        <h3 className="text-[13px] font-bold text-slate-200 mb-2 uppercase tracking-wider">Team Aggregate Focus Areas</h3>
        <div className="h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={teamSkillRadar}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
              <Radar name="Team Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#121212", borderColor: "#333", borderRadius: "8px", fontSize: "12px", color: "#eee" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
