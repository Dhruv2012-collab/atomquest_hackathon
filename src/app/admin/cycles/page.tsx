import { Lock, Unlock, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";

type Quarter = {
  key: string;
  label: string;
  goalWindow: string;
  checkinWindow: string;
  status: "done" | "active" | "scheduled" | "locked";
};

const QUARTERS: Quarter[] = [
  { key: "Phase 1", label: "Goal Setting", goalWindow: "1st May", checkinWindow: "Goal Creation, Submission & Approval", status: "active" },
  { key: "Q1", label: "Q1 Check-in", goalWindow: "July", checkinWindow: "Progress Update — Planned vs. Actual", status: "scheduled" },
  { key: "Q2", label: "Q2 Check-in", goalWindow: "October", checkinWindow: "Progress Update — Planned vs. Actual", status: "scheduled" },
  { key: "Q3", label: "Q3 Check-in", goalWindow: "January", checkinWindow: "Progress Update — Planned vs. Actual", status: "scheduled" },
  { key: "Q4", label: "Q4 / Annual", goalWindow: "March / April", checkinWindow: "Final Achievement Capture", status: "scheduled" },
];

const STATUS_CFG = {
  done:      { label: "Completed",  pill: "bg-[#111] text-slate-400 border border-[#222]",   icon: CheckCircle2, iconColor: "text-slate-500", border: "border-[#222]" },
  active:    { label: "Active",     pill: "bg-[#062010] text-emerald-500 border border-emerald-900/50", icon: Clock,        iconColor: "text-emerald-500", border: "border-emerald-900/50" },
  scheduled: { label: "Scheduled",  pill: "bg-[#001a2a] text-blue-400 border border-blue-900/50",     icon: Calendar,     iconColor: "text-blue-500", border: "border-[#222]" },
  locked:    { label: "Locked",     pill: "bg-[#2a0505] text-red-500 border border-red-900/50",     icon: Lock,         iconColor: "text-red-500", border: "border-red-900/50" },
};

export default function AdminCyclesPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Cycle Management</h1>
          <p className="text-[13px] text-slate-400 mt-1">Configure goal-setting and check-in windows per quarter.</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 bg-[#062010] border border-emerald-900/50 px-3 py-1.5 rounded-full uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          FY2026 Active
        </div>
      </div>

      {/* Timeline stepper */}
      <div className="flex items-center gap-0 bg-[#151515] border border-[#222] rounded-xl overflow-hidden shadow-sm">
        {QUARTERS.map((q, i) => {
          const cfg = STATUS_CFG[q.status];
          const Icon = cfg.icon;
          const isLast = i === QUARTERS.length - 1;
          return (
            <div key={q.key} className={`flex-1 flex flex-col items-center py-5 px-3 relative ${!isLast ? "border-r border-[#222]" : ""}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                q.status === "active" ? "bg-[#062010] border border-emerald-900/50" :
                q.status === "done" ? "bg-[#222] border border-[#333]" :
                q.status === "locked" ? "bg-[#2a0505] border border-red-900/50" : "bg-[#001a2a] border border-blue-900/50"
              }`}>
                <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
              </div>
              <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">{q.key}</p>
              <span className={`mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.pill}`}>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Quarter cards */}
      <div className="space-y-4">
        {QUARTERS.map(q => {
          const cfg = STATUS_CFG[q.status];
          const Icon = cfg.icon;
          return (
            <div key={q.key} className={`bg-[#151515] border ${cfg.border} rounded-xl shadow-sm overflow-hidden transition-colors hover:border-[#333]`}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] bg-[#0f0f0f]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    q.status === "active" ? "bg-[#062010] border border-emerald-900/50" :
                    q.status === "locked" ? "bg-[#2a0505] border border-red-900/50" :
                    q.status === "done" ? "bg-[#222] border border-[#333]" : "bg-[#001a2a] border border-blue-900/50"
                  }`}>
                    <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">{q.label}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${cfg.pill}`}>{cfg.label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {q.status === "active" && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-red-500 border border-red-900/50 bg-[#2a0505] rounded-lg hover:bg-red-900/40 transition-colors uppercase tracking-wider">
                      <Lock className="w-3 h-3" /> Lock Quarter
                    </button>
                  )}
                  {q.status === "locked" && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-blue-400 border border-blue-900/50 bg-[#001a2a] rounded-lg hover:bg-blue-900/40 transition-colors uppercase tracking-wider">
                      <Unlock className="w-3 h-3" /> Force Open
                    </button>
                  )}
                  {q.status === "scheduled" && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-slate-300 border border-[#333] bg-[#121212] rounded-lg hover:bg-[#222] transition-colors uppercase tracking-wider">
                      <Calendar className="w-3 h-3" /> Edit Windows
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-[#222]">
                <div className="px-6 py-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Window Opens</p>
                  <p className="text-[13px] font-semibold text-slate-200">{q.goalWindow}</p>
                </div>
                <div className="px-6 py-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Action</p>
                  <p className="text-[13px] font-semibold text-slate-200">{q.checkinWindow}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 p-4 bg-[#2a1a00] border border-amber-900/50 rounded-xl">
        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-[13px] text-amber-500/90 leading-relaxed">
          <span className="font-semibold text-amber-500">Note:</span> Locking a quarter prevents all goal submissions and check-in updates for that period.
          Use <span className="font-semibold text-amber-500">Force Open</span> only for emergency admin overrides — all actions are logged in the Audit Trail.
        </p>
      </div>
    </div>
  );
}
