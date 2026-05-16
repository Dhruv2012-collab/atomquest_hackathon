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
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    label: "Submitted",
    labelStyle: "bg-blue-100 text-blue-700",
  },
  approve: {
    icon: CheckCircle2,
    dot: "bg-emerald-500",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    label: "Approved",
    labelStyle: "bg-emerald-100 text-emerald-700",
  },
  rework: {
    icon: AlertCircle,
    dot: "bg-amber-500",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    label: "Rework",
    labelStyle: "bg-amber-100 text-amber-700",
  },
  unlock: {
    icon: Lock,
    dot: "bg-rose-500",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    label: "Unlocked",
    labelStyle: "bg-rose-100 text-rose-700",
  },
  edit: {
    icon: Edit2,
    dot: "bg-purple-500",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    label: "Edited",
    labelStyle: "bg-purple-100 text-purple-700",
  },
  push: {
    icon: PlusCircle,
    dot: "bg-indigo-500",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    label: "KPI Pushed",
    labelStyle: "bg-indigo-100 text-indigo-700",
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
          <h1 className="text-2xl font-bold text-slate-900">Audit Trail</h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete change history — who changed what, when.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/export-audit"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
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
            className="px-3 py-1.5 text-xs font-medium rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {f}
          </button>
        ))}
      </div>

      {/* Timeline feed */}
      {events.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <ScrollText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No audit events recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {events.map((event, idx) => {
              const cfg = EVENT_STYLE[event.type] || EVENT_STYLE.submit;
              const Icon = cfg.icon;

              return (
                <div key={event.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  {/* Timeline dot + icon */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.iconBg}`}>
                      <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                    </div>
                    {idx < events.length - 1 && (
                      <div className="w-px flex-1 bg-slate-100 min-h-[16px]" />
                    )}
                  </div>

                  {/* Event body */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Actor */}
                        <div className="flex items-center gap-1.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 ${cfg.dot}`}>
                            {event.actor.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{event.actor}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                            {event.actorRole}
                          </span>
                        </div>

                        {/* Action verb */}
                        <span className="text-sm text-slate-600">{event.action}</span>

                        {/* Type badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.labelStyle}`}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Timestamp */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-medium text-slate-500">
                          {formatRelativeTime(event.timestamp)}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {formatFullDate(event.timestamp)}
                        </p>
                      </div>
                    </div>

                    {/* Subject + detail */}
                    <p className="text-xs font-medium text-slate-700 mt-1.5">
                      {event.subject}
                    </p>
                    {event.detail && (
                      <p className="text-xs text-slate-500 mt-0.5">{event.detail}</p>
                    )}
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
