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
  done:      { label: "Completed",  pill: "bg-slate-100 text-slate-500",   icon: CheckCircle2, iconColor: "text-slate-400", border: "border-slate-200" },
  active:    { label: "Active",     pill: "bg-emerald-100 text-emerald-700", icon: Clock,        iconColor: "text-emerald-500", border: "border-emerald-300" },
  scheduled: { label: "Scheduled",  pill: "bg-blue-100 text-blue-700",     icon: Calendar,     iconColor: "text-blue-500", border: "border-blue-200" },
  locked:    { label: "Locked",     pill: "bg-rose-100 text-rose-700",     icon: Lock,         iconColor: "text-rose-500", border: "border-rose-200" },
};

export default function AdminCyclesPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cycle Management</h1>
          <p className="text-sm text-slate-500 mt-1">Configure goal-setting and check-in windows per quarter.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          FY2026 Active
        </div>
      </div>

      {/* Timeline stepper */}
      <div className="flex items-center gap-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {QUARTERS.map((q, i) => {
          const cfg = STATUS_CFG[q.status];
          const Icon = cfg.icon;
          const isLast = i === QUARTERS.length - 1;
          return (
            <div key={q.key} className={`flex-1 flex flex-col items-center py-4 px-3 relative ${!isLast ? "border-r border-slate-200" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                q.status === "active" ? "bg-emerald-100" :
                q.status === "done" ? "bg-slate-100" :
                q.status === "locked" ? "bg-rose-100" : "bg-blue-100"
              }`}>
                <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
              </div>
              <p className="text-xs font-bold text-slate-800">{q.key}</p>
              <span className={`mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.pill}`}>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Quarter cards */}
      <div className="space-y-3">
        {QUARTERS.map(q => {
          const cfg = STATUS_CFG[q.status];
          const Icon = cfg.icon;
          return (
            <div key={q.key} className={`bg-white border ${cfg.border} rounded-xl shadow-sm overflow-hidden`}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    q.status === "active" ? "bg-emerald-50" :
                    q.status === "locked" ? "bg-rose-50" :
                    q.status === "done" ? "bg-slate-50" : "bg-blue-50"
                  }`}>
                    <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{q.label}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.pill}`}>{cfg.label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {q.status === "active" && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors">
                      <Lock className="w-3 h-3" /> Lock Quarter
                    </button>
                  )}
                  {q.status === "locked" && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <Unlock className="w-3 h-3" /> Force Open
                    </button>
                  )}
                  {q.status === "scheduled" && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <Calendar className="w-3 h-3" /> Edit Windows
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-slate-100">
                <div className="px-6 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Window Opens</p>
                  <p className="text-sm font-semibold text-slate-800">{q.goalWindow}</p>
                </div>
                <div className="px-6 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Action</p>
                  <p className="text-sm font-semibold text-slate-800">{q.checkinWindow}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Note:</span> Locking a quarter prevents all goal submissions and check-in updates for that period.
          Use <span className="font-semibold">Force Open</span> only for emergency admin overrides — all actions are logged in the Audit Trail.
        </p>
      </div>
    </div>
  );
}
