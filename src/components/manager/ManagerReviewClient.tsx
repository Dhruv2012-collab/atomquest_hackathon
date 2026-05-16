"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { updatePlanStatus, updateGoal, submitManagerComment, pushSharedGoal } from "@/app/actions/manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle, XCircle, Edit2, Save, X,
  MessageSquare, PlusCircle, ChevronDown, ChevronUp,
  Clock, FileText, AlertCircle, Link as LinkIcon
} from "lucide-react";

const STATUS_STYLE: Record<string, { pill: string; label: string }> = {
  Draft:            { pill: "bg-slate-100 text-slate-600",   label: "Draft" },
  Pending_Approval: { pill: "bg-amber-100 text-amber-700",   label: "Pending Review" },
  Approved:         { pill: "bg-emerald-100 text-emerald-700", label: "Approved" },
  Rework_Required:  { pill: "bg-red-100 text-red-700",       label: "Rework Required" },
};

export default function ManagerReviewClient({ initialPlans }: { initialPlans: any[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [activeTab, setActiveTab] = useState<"reviews" | "checkins">("reviews");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [openPush, setOpenPush] = useState(false);
  const [pushForm, setPushForm] = useState({ title: "", thrustArea: "", uom: "Numeric (Min)", target_value: 0, employeeIds: [] as string[] });
  const [isPending, startTransition] = useTransition();

  const managerId = "00000000-0000-0000-0000-000000000011";

  const directReports = Array.from(
    new Map(plans.filter(p => p.user_id).map(p => [p.user_id, { id: p.user_id, name: p.users?.name }])).values()
  );

  const pendingPlans = plans.filter(p => ["Pending_Approval", "Rework_Required"].includes(p.status));
  const approvedPlans = plans.filter(p => p.status === "Approved");

  const handleStatus = (planId: string, status: "Approved" | "Rework_Required") => {
    startTransition(async () => {
      const res = await updatePlanStatus(planId, status);
      if (res.success) {
        setPlans(plans.map(p => p.id === planId ? { ...p, status } : p));
        toast.success(status === "Approved" ? "Plan approved!" : "Returned for rework.");
        setExpandedId(null);
      } else toast.error(res.error);
    });
  };

  const saveEdit = (goalId: string, planId: string) => {
    startTransition(async () => {
      const res = await updateGoal(goalId, editForm);
      if (res.success) {
        setPlans(plans.map(p => p.id === planId
          ? { ...p, goals: p.goals.map((g: any) => g.id === goalId ? { ...g, ...editForm } : g) }
          : p));
        setEditingGoalId(null);
        toast.success("Goal updated.");
      } else toast.error(res.error);
    });
  };

  const saveComment = (goalId: string, planId: string) => {
    const comment = comments[goalId] ?? "";
    startTransition(async () => {
      const res = await submitManagerComment(goalId, comment);
      if (res.success) {
        setPlans(plans.map(p => p.id === planId
          ? { ...p, goals: p.goals.map((g: any) => g.id === goalId ? { ...g, manager_comment: comment } : g) }
          : p));
        toast.success("Comment saved.");
      } else toast.error(res.error);
    });
  };

  const handlePushKPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushForm.title || !pushForm.thrustArea || pushForm.target_value <= 0 || pushForm.employeeIds.length === 0) {
      toast.error("Fill all fields and select at least one employee.");
      return;
    }
    startTransition(async () => {
      const res = await pushSharedGoal({ ...pushForm, description: "", managerId });
      if (res.success) {
        toast.success("Departmental KPI pushed!");
        setOpenPush(false);
        window.location.reload();
      } else toast.error(res.error);
    });
  };

  return (
    <div className="space-y-4">
      {/* Tab Bar + Push KPI */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex gap-1">
          {[
            { key: "reviews", label: `Pending Review (${pendingPlans.length})` },
            { key: "checkins", label: `Active Check-ins (${approvedPlans.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t.key ? "bg-purple-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setOpenPush(true)}
          className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Push Dept KPI
        </button>
      </div>

      {/* ── TAB: REVIEWS ── */}
      {activeTab === "reviews" && (
        pendingPlans.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
            <CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No pending plans. All caught up!</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-4">Employee</div>
              <div className="col-span-2">Period</div>
              <div className="col-span-1 text-center">Goals</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3 text-right">Action</div>
            </div>

            {pendingPlans.map(plan => {
              const cfg = STATUS_STYLE[plan.status] || STATUS_STYLE.Draft;
              const isExpanded = expandedId === plan.id;

              return (
                <div key={plan.id} className="border-b border-slate-50 last:border-0">
                  {/* Summary row */}
                  <div
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/80 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : plan.id)}
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                        {plan.users?.name?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{plan.users?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{plan.users?.email}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-slate-600">{plan.period}</div>
                    <div className="col-span-1 text-center text-sm font-medium text-slate-700">{plan.goals?.length || 0}</div>
                    <div className="col-span-2">
                      <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.pill}`}>{cfg.label}</span>
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <span className="text-xs text-slate-400">{isExpanded ? "Collapse" : "Review →"}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded: Split Panel */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row">
                      {/* LEFT: Goals list */}
                      <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" /> Goal Sheet Details
                        </h3>
                        <div className="space-y-2">
                          {(plan.goals || []).map((goal: any) => (
                            <div key={goal.id} className="bg-white border border-slate-200 rounded-lg p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                      {goal.thrust_area}
                                    </span>
                                    {goal.is_shared && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                        <LinkIcon className="w-2.5 h-2.5" /> Shared
                                      </span>
                                    )}
                                    {goal.created_at && goal.updated_at && new Date(goal.updated_at).getTime() > new Date(goal.created_at).getTime() + 5000 && (
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                        ✎ Edited
                                      </span>
                                    )}
                                  </div>

                                  {editingGoalId === goal.id ? (
                                    <div className="space-y-2">
                                      <Input
                                        value={editForm.title}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        className="h-8 text-sm"
                                        placeholder="Goal title"
                                      />
                                      <div className="flex gap-2">
                                        <Input
                                          type="number"
                                          value={editForm.target_value}
                                          onChange={e => setEditForm({ ...editForm, target_value: e.target.value })}
                                          className="h-8 text-sm w-28"
                                          placeholder="Target"
                                        />
                                        <Input
                                          type="number"
                                          value={editForm.weight}
                                          onChange={e => setEditForm({ ...editForm, weight: e.target.value })}
                                          className="h-8 text-sm w-20"
                                          placeholder="Weight %"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-sm font-medium text-slate-800">{goal.title}</p>
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        Target: <span className="font-medium">{goal.target_value}</span>
                                        {" · "}{goal.uom}
                                        {" · "}<span className="font-medium">{goal.weight}%</span> weight
                                      </p>
                                    </>
                                  )}
                                </div>

                                {/* Edit controls */}
                                {!goal.is_shared && (
                                  editingGoalId === goal.id ? (
                                    <div className="flex gap-1 flex-shrink-0">
                                      <button onClick={() => saveEdit(goal.id, plan.id)} disabled={isPending}
                                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors">
                                        <Save className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={() => setEditingGoalId(null)}
                                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => { setEditingGoalId(goal.id); setEditForm({ title: goal.title, target_value: goal.target_value, weight: goal.weight }); }}
                                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0">
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Weight summary */}
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-4 py-2.5">
                          <span>{plan.goals?.length || 0} goals</span>
                          <span>
                            Total weight:{" "}
                            <span className={`font-bold ${
                              (plan.goals || []).reduce((s: number, g: any) => s + Number(g.weight), 0) === 100
                                ? "text-emerald-600" : "text-red-600"
                            }`}>
                              {(plan.goals || []).reduce((s: number, g: any) => s + Number(g.weight), 0)}%
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* RIGHT: Manager Controls */}
                      <div className="w-full lg:w-80 p-6 flex flex-col gap-4">
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-slate-400" /> Manager Decision
                        </h3>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-slate-600">Comment / Feedback</label>
                          <textarea
                            rows={4}
                            placeholder="Add review notes or rework instructions…"
                            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            value={comments[plan.id] ?? ""}
                            onChange={e => setComments({ ...comments, [plan.id]: e.target.value })}
                          />
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500 space-y-1">
                          <p><span className="font-semibold">Submitted:</span> {plan.users?.name}</p>
                          <p><span className="font-semibold">Period:</span> {plan.period}</p>
                          <p><span className="font-semibold">Current status:</span> {STATUS_STYLE[plan.status]?.label}</p>
                        </div>

                        <div className="flex flex-col gap-2 mt-auto">
                          <button
                            onClick={() => handleStatus(plan.id, "Approved")}
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve Plan
                          </button>
                          <button
                            onClick={() => handleStatus(plan.id, "Rework_Required")}
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" /> Request Rework
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── TAB: CHECK-INS ── */}
      {activeTab === "checkins" && (
        approvedPlans.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No approved plans in check-in yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvedPlans.map(plan => (
              <div key={plan.id} className="bg-white border border-emerald-200 border-t-4 border-t-emerald-500 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                      {plan.users?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{plan.users?.name}</p>
                      <p className="text-xs text-slate-400">{plan.period}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Approved</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="text-left px-6 py-3">Goal</th>
                        <th className="text-center px-4 py-3">Target</th>
                        <th className="text-center px-4 py-3">Actual</th>
                        <th className="text-center px-4 py-3">Score</th>
                        <th className="text-center px-4 py-3">Status</th>
                        <th className="px-4 py-3 w-64">Manager Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(plan.goals || []).map((goal: any) => {
                        const score = Number(goal.calculated_score || 0).toFixed(1);
                        return (
                          <tr key={goal.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-3">
                              <p className="font-medium text-slate-800">{goal.title}</p>
                              <p className="text-xs text-slate-400">{goal.thrust_area} · {goal.uom}</p>
                            </td>
                            <td className="px-4 py-3 text-center font-medium">{goal.target_value}</td>
                            <td className="px-4 py-3 text-center font-bold text-blue-600">{goal.actual_value ?? 0}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                Number(score) >= 100 ? "bg-emerald-100 text-emerald-700" :
                                Number(score) >= 70  ? "bg-amber-100 text-amber-700" :
                                                       "bg-red-100 text-red-700"
                              }`}>{score}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                goal.status === "Completed"  ? "bg-emerald-100 text-emerald-700" :
                                goal.status === "On Track"   ? "bg-blue-100 text-blue-700" :
                                                               "bg-slate-100 text-slate-500"
                              }`}>{goal.status || "Not Started"}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1.5">
                                <textarea
                                  rows={2}
                                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none"
                                  placeholder="Add structured note…"
                                  value={comments[goal.id] !== undefined ? comments[goal.id] : (goal.manager_comment || "")}
                                  onChange={e => setComments({ ...comments, [goal.id]: e.target.value })}
                                />
                                <button
                                  onClick={() => saveComment(goal.id, plan.id)}
                                  disabled={isPending}
                                  className="self-end flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                >
                                  <MessageSquare className="w-2.5 h-2.5" /> Save
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Push KPI Modal ── */}
      {openPush && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Push Departmental KPI</h2>
              <button onClick={() => setOpenPush(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePushKPI} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Goal Title *</label>
                <Input value={pushForm.title} onChange={e => setPushForm({ ...pushForm, title: e.target.value })} placeholder="e.g. Q1 Team Revenue Target" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Thrust Area *</label>
                  <Input value={pushForm.thrustArea} onChange={e => setPushForm({ ...pushForm, thrustArea: e.target.value })} placeholder="e.g. Financial" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">UoM</label>
                  <select
                    value={pushForm.uom}
                    onChange={e => setPushForm({ ...pushForm, uom: e.target.value })}
                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {["Numeric (Min)", "Numeric (Max)", "% (Min)", "% (Max)", "Timeline", "Zero-based"].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Target Value *</label>
                <Input type="number" value={pushForm.target_value || ""} onChange={e => setPushForm({ ...pushForm, target_value: Number(e.target.value) })} required />
                <p className="text-[10px] text-slate-400 mt-1">Injected weight: 10% per BRD. Recipients can rebalance.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-2 block">Select Recipients *</label>
                <div className="border border-slate-200 rounded-lg p-3 space-y-2 max-h-36 overflow-y-auto bg-slate-50">
                  {directReports.map((emp: any) => (
                    <label key={emp.id} className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pushForm.employeeIds.includes(emp.id)}
                        onChange={e => setPushForm({
                          ...pushForm,
                          employeeIds: e.target.checked
                            ? [...pushForm.employeeIds, emp.id]
                            : pushForm.employeeIds.filter(id => id !== emp.id)
                        })}
                        className="rounded"
                      />
                      <span className="font-medium text-slate-700">{emp.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                ⚠ Selected employees' plans will be set to <strong>Rework Required</strong> to allow weight rebalancing.
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpenPush(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  {isPending ? "Pushing…" : "Push KPI →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
