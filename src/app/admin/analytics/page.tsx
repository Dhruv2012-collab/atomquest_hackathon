"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Users, Target, Activity } from "lucide-react";

// Mock Data
const completionByManager = [
  { name: "Sarah Connor (Eng)", rate: 88, target: 100 },
  { name: "Dave Dev (Product)", rate: 92, target: 100 },
  { name: "Bob Smith (Sales)", rate: 76, target: 100 },
  { name: "Alice Jones (Marketing)", rate: 85, target: 100 },
];

const thrustAreaDist = [
  { name: "Revenue", value: 35 },
  { name: "Operations", value: 25 },
  { name: "Innovation", value: 20 },
  { name: "People", value: 20 },
];

const quarterTrends = [
  { name: "Q1", completion: 78, engagement: 82 },
  { name: "Q2", completion: 82, engagement: 85 },
  { name: "Q3", completion: 85, engagement: 88 },
  { name: "Q4", completion: 89, engagement: 91 },
];

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];

export default function AdminAnalyticsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Organization Analytics</h1>
          <p className="text-[13px] text-slate-400 mt-1">Enterprise-wide performance trends and completion metrics.</p>
        </div>
      </div>

      {/* KPI Summary Tiles */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Org Completion Rate", value: "85%", sub: "+3% from last quarter", icon: Activity, color: "text-emerald-500", bg: "bg-[#062010] border border-emerald-900/50" },
          { label: "Active Goals", value: "1,248", sub: "Across 4 departments", icon: Target, color: "text-blue-500", bg: "bg-[#001a2a] border border-blue-900/50" },
          { label: "Adoption Rate", value: "98%", sub: "Employees with active plans", icon: Users, color: "text-purple-400", bg: "bg-[#1a0b2e] border border-purple-900/50" },
          { label: "Top Performer", value: "Product Team", sub: "92% completion avg", icon: TrendingUp, color: "text-amber-500", bg: "bg-[#2a1a00] border border-amber-900/50" },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-[#151515] border border-[#222] rounded-xl p-5 shadow-sm hover:border-[#333] transition-colors relative h-[140px] flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-semibold text-slate-100 tracking-tight">{kpi.value}</h3>
                <p className="text-[11px] text-slate-500 mt-1">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Completion by Manager */}
        <div className="bg-[#151515] border border-[#222] rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 mb-6">Completion Rates by Manager</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionByManager} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#222" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: '#333' }} tickLine={false} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: '#333' }} tickLine={false} />
                <Tooltip cursor={{ fill: "#1a1a1a" }} contentStyle={{ backgroundColor: "#1f1f1f", borderColor: "#333", color: "#f1f5f9", borderRadius: "8px" }} itemStyle={{ color: "#f1f5f9" }} />
                <Bar dataKey="rate" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} name="Completion %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goal Distribution */}
        <div className="bg-[#151515] border border-[#222] rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Goal Distribution by Thrust Area</h3>
          <div className="h-64 flex items-center">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={thrustAreaDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {thrustAreaDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1f1f1f", borderColor: "#333", color: "#f1f5f9", borderRadius: "8px" }} itemStyle={{ color: "#f1f5f9" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {thrustAreaDist.map((area, i) => (
                <div key={area.name} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-[13px] font-medium text-slate-300">{area.name}</span>
                  <span className="text-[12px] font-bold text-slate-500 ml-auto">{area.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quarter over Quarter Trends */}
        <div className="col-span-2 bg-[#151515] border border-[#222] rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 mb-6">Quarter-on-Quarter Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quarterTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: '#333' }} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: '#333' }} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#1f1f1f", borderColor: "#333", color: "#f1f5f9", borderRadius: "8px" }} itemStyle={{ color: "#f1f5f9" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: '#94a3b8' }} />
                <Line type="monotone" dataKey="completion" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "#151515" }} name="Avg Completion %" />
                <Line type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "#151515" }} name="System Engagement %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
