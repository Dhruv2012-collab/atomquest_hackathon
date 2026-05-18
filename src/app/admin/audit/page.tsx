import { createClient } from "@/utils/supabase/server";
import { ScrollText, Lock, CheckCircle2, AlertCircle, FileText, Edit2, PlusCircle, Download } from "lucide-react";

// Map plan status transitions to human-readable audit events
function inferAuditEvents(plans: any[]): AuditEvent[] {
  const events: AuditEvent[] = [];

  for (const plan of plans) {
    const empName = plan.users?.name || "Unknown Employee";
    const period = plan.period || "Q1 2026";

    if (plan.status === "Pending_Approval") {
      events.push({
        id: `${plan.id}-submit`,
        actor: empName,
        actorRole: "Employee",
        action: "submitted goal sheet",
        subject: `${period} Goal Plan`,
        detail: `${plan.goals?.length || 0} goals · Total weight locked at 100%`,
        type: "submit",
        timestamp: plan.updated_at || plan.created_at,
      });
    }

    if (plan.status === "Approved") {
      events.push({
        id: `${plan.id}-approved`,
        actor: "Manager",
        actorRole: "Manager",
        action: "approved goal plan",
        subject: `${empName}'s ${period} Plan`,
        detail: `Plan moved to active check-in phase`,
        type: "approve",
        timestamp: plan.updated_at,
      });
    }

    if (plan.status === "Rework_Required") {
      events.push({
        id: `${plan.id}-rework`,
        actor: "Manager",
        actorRole: "Manager",
        action: "returned plan for rework",
        subject: `${empName}'s ${period} Plan`,
        detail: `Employee must revise and resubmit`,
        type: "rework",
        timestamp: plan.updated_at,
      });
    }
  }

  // Sort newest first
  return events.sort((a, b) =>
    new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
  );
}

type AuditEvent = {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  subject: string;
  detail?: string;
  type: "submit" | "approve" | "rework" | "unlock" | "edit" | "push";
  timestamp: string;
};

const EVENT_STYLE = {
  submit: {
    icon: FileText,
    dot: "bg-blue-500",
    iconBg: "bg-[#001a2a] border border-blue-900/50",
    iconColor: "text-blue-500",
    label: "Submitted",
    labelStyle: "bg-[#001a2a] text-blue-400 border border-blue-900/50",
  },
  approve: {
    icon: CheckCircle2,
    dot: "bg-emerald-500",
    iconBg: "bg-[#062010] border border-emerald-900/50",
    iconColor: "text-emerald-500",
    label: "Approved",
    labelStyle: "bg-[#062010] text-emerald-500 border border-emerald-900/50",
  },
  rework: {
    icon: AlertCircle,
    dot: "bg-amber-500",
    iconBg: "bg-[#2a1a00] border border-amber-900/50",
    iconColor: "text-amber-500",
    label: "Rework",
    labelStyle: "bg-[#2a1a00] text-amber-500 border border-amber-900/50",
  },
  unlock: {
    icon: Lock,
    dot: "bg-red-500",
    iconBg: "bg-[#2a0505] border border-red-900/50",
    iconColor: "text-red-500",
    label: "Unlocked",
    labelStyle: "bg-[#2a0505] text-red-500 border border-red-900/50",
  },
  edit: {
    icon: Edit2,
    dot: "bg-purple-500",
    iconBg: "bg-[#1a0b2e] border border-purple-900/50",
    iconColor: "text-purple-400",
    label: "Edited",
    labelStyle: "bg-[#1a0b2e] text-purple-400 border border-purple-900/50",
  },
  push: {
    icon: PlusCircle,
    dot: "bg-indigo-500",
    iconBg: "bg-[#0a0a2a] border border-indigo-900/50",
    iconColor: "text-indigo-400",
    label: "KPI Pushed",
    labelStyle: "bg-[#0a0a2a] text-indigo-400 border border-indigo-900/50",
  },
};

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 2) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatFullDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function AuditLogPage() {
  const supabase = await createClient();

  const mockPlansForAudit = [
    { id: "p1", status: "Submitted", period: "Q1 2026", created_at: "2026-05-01", updated_at: "2026-05-01", users: { name: "Dave Dev", email: "dave@example.com" }, goals: [{}, {}] },
    { id: "p2", status: "Approved", period: "Q1 2026", created_at: "2026-05-02", updated_at: "2026-05-03", users: { name: "Eve Engineer", email: "eve@example.com" }, goals: [{}] },
    { id: "p3", status: "Rework_Required", period: "Q1 2026", created_at: "2026-05-04", updated_at: "2026-05-05", users: { name: "Bob Smith", email: "bob@example.com" }, goals: [{}] }
  ];

  const events = inferAuditEvents(mockPlansForAudit as any[]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Audit Trail</h1>
          <p className="text-[13px] text-slate-400 mt-1">
            Complete change history — who changed what, when.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/export-audit"
            className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-slate-300 bg-[#121212] border border-[#333] px-4 py-2 rounded-lg hover:bg-[#222] transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
          <div className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-slate-400 bg-[#151515] border border-[#222] px-4 py-2 rounded-lg">
            <ScrollText className="w-4 h-4" />
            {events.length} events
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["All", "Submitted", "Approved", "Rework", "Unlocked"] as const).map((f) => (
          <button
            key={f}
            className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full border transition-colors ${
              f === "All" ? "bg-[#333] text-slate-200 border-[#444]" : "bg-[#111] text-slate-500 border-[#222] hover:bg-[#1a1a1a] hover:text-slate-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Timeline feed */}
      {events.length === 0 ? (
        <div className="bg-[#151515] border border-dashed border-[#333] rounded-xl p-12 text-center">
          <ScrollText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-[13px] text-slate-500">No audit events recorded yet.</p>
        </div>
      ) : (
        <div className="bg-[#151515] border border-[#222] rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-[#222]">
            {events.map((event, idx) => {
              const cfg = EVENT_STYLE[event.type] || EVENT_STYLE.submit;
              const Icon = cfg.icon;

              return (
                <div key={event.id} className="flex items-start gap-4 px-6 py-5 hover:bg-[#1a1a1a] transition-colors group">
                  {/* Timeline dot + icon */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0 pt-0.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.iconBg}`}>
                      <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                    </div>
                    {idx < events.length - 1 && (
                      <div className="w-px flex-1 bg-[#222] min-h-[24px] group-hover:bg-[#333] transition-colors" />
                    )}
                  </div>

                  {/* Event body */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Actor */}
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 ${cfg.dot}`}>
                            {event.actor.charAt(0)}
                          </div>
                          <span className="text-[14px] font-bold text-slate-200">{event.actor}</span>
                          <span className="text-[10px] text-slate-500 bg-[#111] px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-[#222]">
                            {event.actorRole}
                          </span>
                        </div>

                        {/* Action verb */}
                        <span className="text-[13px] text-slate-400 mx-1">{event.action}</span>

                        {/* Type badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.labelStyle} uppercase tracking-wider`}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Timestamp */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-[12px] font-bold text-slate-400">
                          {formatRelativeTime(event.timestamp)}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-0.5 font-medium">
                          {formatFullDate(event.timestamp)}
                        </p>
                      </div>
                    </div>

                    {/* Subject + detail */}
                    <div className="mt-2.5 bg-[#0f0f0f] border border-[#222] rounded-lg p-3 inline-block min-w-[60%]">
                      <p className="text-[13px] font-bold text-slate-300">
                        {event.subject}
                      </p>
                      {event.detail && (
                        <p className="text-[12px] text-slate-500 mt-1">{event.detail}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
