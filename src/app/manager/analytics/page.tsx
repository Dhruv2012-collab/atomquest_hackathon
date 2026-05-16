"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { TrendingUp, Users, Target, CheckCircle2 } from "lucide-react";

// Mock Data
const teamPerformance = [
  { name: "John Doe", score: 95 },
  { name: "Alice Smith", score: 88 },
  { name: "Bob Johnson", score: 102 }, // Overachieving
  { name: "Eva Green", score: 76 },
];

const teamSkillRadar = [
  { subject: 'Financial Targets', A: 120, fullMark: 150 },
  { subject: 'Product Delivery', A: 98, fullMark: 150 },
  { subject: 'Customer Success', A: 86, fullMark: 150 },
  { subject: 'Process Impr.', A: 99, fullMark: 150 },
  { subject: 'Innovation', A: 85, fullMark: 150 },
];

export default function ManagerAnalyticsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Performance trends and KPI distribution for your direct reports.</p>
        </div>
      </div>

      {/* KPI Summary Tiles */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Team Avg Score", value: "90%", sub: "On Track", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Active Goals", value: "32", sub: "Across 4 reports", icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Check-in Rate", value: "100%", sub: "All updated", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Direct Reports", value: "4", sub: "Full utilization", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</h3>
                </div>
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Individual Scores */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Individual Performance Scores</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerformance} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 120]} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} name="Avg Score %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Strengths Radar */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Team Aggregate Focus Areas</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={teamSkillRadar}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Team Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
