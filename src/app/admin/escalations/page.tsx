import { createAdminClient } from "@/utils/supabase/server";
import { AlertTriangle, Clock, ShieldAlert, CheckCircle2, PlayCircle } from "lucide-react";
import { runEscalationEngine } from "@/app/actions/escalations";

export default async function EscalationsPage() {
  const supabase = await createAdminClient();

  // Fetch escalation logs joined with users
  const { data: logs } = await supabase
    .from("escalation_logs")
    .select(`
      id,
      reason,
      target_role,
      escalation_level,
      status,
      created_at,
      users:user_id (name, email)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Escalation Center</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor automated compliance alerts and routing</p>
        </div>
        
        {/* Run Engine Button */}
        <form action={async () => {
          "use server";
          await runEscalationEngine();
        }}>
          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold text-[13px] shadow-sm flex items-center gap-2 transition-colors border border-indigo-500/50"
          >
            <PlayCircle className="w-4 h-4" />
            Run Escalation Engine
          </button>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-[#151515] border border-red-900/50 rounded-xl p-6 shadow-sm relative hover:border-red-900 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#2a0505] text-red-500 rounded-lg border border-red-900/50">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-300 text-[13px] uppercase tracking-wider">Critical (HR Level)</h3>
          </div>
          <p className="text-3xl font-bold text-slate-100 mt-2">
            {logs?.filter((l: any) => l.escalation_level === 3 && l.status === 'Open').length || 0}
          </p>
        </div>
        <div className="bg-[#151515] border border-amber-900/50 rounded-xl p-6 shadow-sm relative hover:border-amber-900 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#2a1a00] text-amber-500 rounded-lg border border-amber-900/50">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-300 text-[13px] uppercase tracking-wider">Manager Pending</h3>
          </div>
          <p className="text-3xl font-bold text-slate-100 mt-2">
            {logs?.filter((l: any) => l.escalation_level === 2 && l.status === 'Open').length || 0}
          </p>
        </div>
        <div className="bg-[#151515] border border-blue-900/50 rounded-xl p-6 shadow-sm relative hover:border-blue-900 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#001a2a] text-blue-500 rounded-lg border border-blue-900/50">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-300 text-[13px] uppercase tracking-wider">Employee Overdue</h3>
          </div>
          <p className="text-3xl font-bold text-slate-100 mt-2">
            {logs?.filter((l: any) => l.escalation_level === 1 && l.status === 'Open').length || 0}
          </p>
        </div>
      </div>

      {/* Escalation Log Table */}
      <div className="bg-[#151515] border border-[#222] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#222] bg-[#0f0f0f]">
          <h2 className="text-[14px] font-semibold text-slate-200">Active Escalation Log</h2>
        </div>
        
        {(!logs || logs.length === 0) ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#062010] rounded-full flex items-center justify-center mb-4 border border-emerald-900/50">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="font-bold text-slate-200">No active escalations</p>
            <p className="text-[13px] mt-1 text-slate-500">All employees and managers are within compliance SLAs.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f0f0f] border-b border-[#222]">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
                      log.escalation_level === 3 ? 'bg-[#2a0505] text-red-500 border-red-900/50' :
                      log.escalation_level === 2 ? 'bg-[#2a1a00] text-amber-500 border-amber-900/50' :
                      'bg-[#001a2a] text-blue-500 border-blue-900/50'
                    }`}>
                      Level {log.escalation_level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[13px] text-slate-200">{(log.users as any)?.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{log.target_role}</div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-400">
                    {log.reason}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
                      log.status === 'Open' ? 'bg-[#2a0505] text-red-500 border-red-900/50' : 'bg-[#062010] text-emerald-500 border-emerald-900/50'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'Open' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[12px] text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
