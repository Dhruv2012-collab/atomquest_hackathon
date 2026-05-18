"use client";

import { useState } from "react";
import { 
  Cloud, RefreshCw, CheckCircle2, Shield, 
  Users, Network, ScrollText, AlertCircle, 
  ArrowRight, Settings
} from "lucide-react";

const AUDIT_LOGS = [
  { id: 1, time: "2 mins ago", action: "User Synced", details: "Updated profile for Sarah Manager (sarah@company.com)", status: "success" },
  { id: 2, time: "15 mins ago", action: "Role Mapped", details: "Assigned 'Manager' role to sarah@company.com via 'sg-atomquest-managers' group", status: "success" },
  { id: 3, time: "1 hr ago", action: "Hierarchy Update", details: "Linked Dave (dave@company.com) reporting to Sarah Manager", status: "success" },
  { id: 4, time: "2 hrs ago", action: "Sync Failed", details: "Failed to resolve 'manager' attribute for new user john@company.com", status: "warning" },
  { id: 5, time: "5 hrs ago", action: "Full Sync Completed", details: "Processed 142 users, 12 managers, 3 admins", status: "success" },
];

const ROLE_MAPPINGS = [
  { entraGroup: "sg-atomquest-admins", aqRole: "System Admin", users: 3 },
  { entraGroup: "sg-atomquest-managers", aqRole: "Manager", users: 12 },
  { entraGroup: "sg-atomquest-employees", aqRole: "Employee", users: 127 },
];

export default function EntraSyncPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastSync, setLastSync] = useState("Just now");

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync("Just now");
    }, 2500);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Cloud className="w-7 h-7 text-blue-500" />
            Microsoft Entra ID Sync
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage single sign-on, automated user provisioning, and role mapping.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-[#121212] border border-[#333] text-slate-300 rounded-lg text-[13px] font-medium hover:bg-[#222] transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Connection Settings
          </button>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-semibold hover:bg-blue-700 disabled:bg-blue-600/50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing Directory..." : "Force Sync Now"}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#151515] p-5 rounded-xl border border-[#222] shadow-sm relative hover:border-[#333] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-medium text-slate-400">Connection Status</h3>
            <div className="w-8 h-8 rounded-lg bg-[#062010] border border-emerald-900/50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-slate-100 tracking-tight">Connected</p>
          <p className="text-[11px] text-slate-500 mt-1">atomquest.onmicrosoft.com</p>
        </div>
        <div className="bg-[#151515] p-5 rounded-xl border border-[#222] shadow-sm relative hover:border-[#333] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-medium text-slate-400">Total Users Synced</h3>
            <div className="w-8 h-8 rounded-lg bg-[#001a2a] border border-blue-900/50 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-slate-100 tracking-tight">142</p>
          <p className="text-[11px] text-slate-500 mt-1">Across 3 Active Groups</p>
        </div>
        <div className="bg-[#151515] p-5 rounded-xl border border-[#222] shadow-sm relative hover:border-[#333] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-medium text-slate-400">Hierarchy Depth</h3>
            <div className="w-8 h-8 rounded-lg bg-[#1a0b2e] border border-purple-900/50 flex items-center justify-center">
              <Network className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-slate-100 tracking-tight">4 Levels</p>
          <p className="text-[11px] text-slate-500 mt-1">Mapped from 'manager' attr</p>
        </div>
        <div className="bg-[#151515] p-5 rounded-xl border border-[#222] shadow-sm relative hover:border-[#333] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-medium text-slate-400">Last Successful Sync</h3>
            <div className="w-8 h-8 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-slate-300" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-slate-100 tracking-tight">{lastSync}</p>
          <p className="text-[11px] text-slate-500 mt-1">Delta sync interval: 30m</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#151515] border border-[#222] rounded-xl overflow-hidden shadow-sm">
        <div className="flex border-b border-[#222] bg-[#0f0f0f]">
          {[
            { id: "overview", label: "Mapping Config", icon: Shield },
            { id: "audit", label: "Provisioning Audit Logs", icon: ScrollText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-[13px] font-medium transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? "border-blue-500 text-blue-400 bg-[#151515]" 
                  : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-[#111]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Role Mapping */}
              <div>
                <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  Azure AD Group to Role Mapping
                </h3>
                <div className="border border-[#222] rounded-lg overflow-hidden bg-[#0f0f0f]">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-[#0f0f0f] text-slate-500 font-medium border-b border-[#222]">
                      <tr>
                        <th className="px-4 py-3 uppercase tracking-wider text-[10px] font-bold">Entra ID Group</th>
                        <th className="px-4 py-3 uppercase tracking-wider text-[10px] font-bold">Portal Role</th>
                        <th className="px-4 py-3 uppercase tracking-wider text-[10px] font-bold text-right">Active Users</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222] bg-[#151515]">
                      {ROLE_MAPPINGS.map((map, i) => (
                        <tr key={i} className="hover:bg-[#1a1a1a]">
                          <td className="px-4 py-3 font-mono text-xs text-slate-300">
                            {map.entraGroup}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#222] text-slate-300 font-medium text-[11px] border border-[#333]">
                              {map.aqRole}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-slate-300">
                            {map.users}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hierarchy Mapping */}
              <div>
                <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <Network className="w-5 h-5 text-indigo-400" />
                  Organization Hierarchy Sync
                </h3>
                <div className="p-5 border border-[#222] rounded-lg bg-[#111] space-y-5">
                  <p className="text-[13px] text-slate-400">
                    The portal automatically reconstructs the company's reporting structure based on the <code className="bg-[#222] px-1.5 py-0.5 rounded border border-[#333] text-[11px] text-slate-300">manager</code> attribute in Azure Active Directory.
                  </p>
                  
                  <div className="flex items-center justify-between p-4 bg-[#151515] border border-[#222] rounded-lg">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Azure AD Attribute</p>
                      <p className="font-mono text-[12px] bg-[#001a2a] text-blue-400 px-3 py-1.5 rounded-md border border-blue-900/50">
                        user.manager.id
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-600" />
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">AtomQuest Field</p>
                      <p className="font-mono text-[12px] bg-[#1a0b2e] text-purple-400 px-3 py-1.5 rounded-md border border-purple-900/50">
                        users.manager_id
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-[#2a1a00] border border-amber-900/50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-medium text-amber-500">Orphaned User Handling</p>
                      <p className="text-[12px] text-amber-500/70 mt-1">Users without a valid manager attribute are flagged for manual review in the HR dashboard and temporarily assigned to 'System Admin'.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <ScrollText className="w-5 h-5 text-indigo-400" />
                  Recent Sync Activity
                </h3>
                <button className="text-[13px] text-blue-400 hover:text-blue-300 font-medium">Export Full Log CSV</button>
              </div>
              <div className="border border-[#222] rounded-lg overflow-hidden bg-[#0f0f0f]">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#0f0f0f] text-slate-500 font-medium border-b border-[#222]">
                    <tr>
                      <th className="px-4 py-3 uppercase tracking-wider text-[10px] font-bold">Time</th>
                      <th className="px-4 py-3 uppercase tracking-wider text-[10px] font-bold">Action</th>
                      <th className="px-4 py-3 uppercase tracking-wider text-[10px] font-bold">Details</th>
                      <th className="px-4 py-3 uppercase tracking-wider text-[10px] font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222] bg-[#151515]">
                    {AUDIT_LOGS.map((log) => (
                      <tr key={log.id} className="hover:bg-[#1a1a1a]">
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{log.time}</td>
                        <td className="px-4 py-3 font-medium text-slate-200 whitespace-nowrap">{log.action}</td>
                        <td className="px-4 py-3 text-slate-400">{log.details}</td>
                        <td className="px-4 py-3">
                          {log.status === "success" ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#062010] text-emerald-500 text-[11px] font-semibold border border-emerald-900/50">
                              <CheckCircle2 className="w-3 h-3" />
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2a0505] text-red-500 text-[11px] font-semibold border border-red-900/50">
                              <AlertCircle className="w-3 h-3" />
                              Warning
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
