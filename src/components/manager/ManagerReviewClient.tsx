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
  Draft:            { pill: "bg-[#1c1c1c] text-slate-400 border-[#2a2a2a]", label: "Draft" },
  Pending_Approval: { pill: "bg-[#2a1a00] text-amber-500 border-amber-900", label: "Pending Review" },
  Approved:         { pill: "bg-[#062010] text-emerald-500 border-emerald-900", label: "Approved" },
  Rework_Required:  { pill: "bg-transparent text-[#ff6b6b] border-[#ff6b6b]/30", label: "Rework Required" },
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
      <div className="flex items-center justify-between bg-[#151515] border border-[#222] rounded-xl px-4 py-3">
        <div className="flex gap-2">
          {[
            { key: "reviews", label: `Pending Review (${pendingPlans.length})` },
            { key: "checkins", label: `Active Check-ins (${approvedPlans.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors border ${
                activeTab === t.key 
                  ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" 
                  : "bg-transparent text-slate-400 border-transparent hover:border-[#333] hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setOpenPush(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 text-sm font-semibold rounded-full hover:bg-purple-600/30 transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Push Dept KPI
        </button>
      </div>

      {/* ── TAB: REVIEWS ── */}
      {activeTab === "reviews" && (
        pendingPlans.length === 0 ? (
          <div className="bg-[#121212] border border-dashed border-[#333] rounded-xl p-10 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-900 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No pending plans. All caught up!</p>
          </div>
        ) : (
          <div className="bg-[#151515] border border-[#222] rounded-xl overflow-hidden shadow-sm">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#0f0f0f] border-b border-[#222] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
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
                <div key={plan.id} className="border-b border-[#222] last:border-0">
                  {/* Summary row */}
                  <div
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#1a1a1a] cursor-pointer transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : plan.id)}
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-slate-300 font-bold text-xs flex-shrink-0">
                        {plan.users?.name?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{plan.users?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{plan.users?.email}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-slate-400">{plan.period}</div>
                    <div className="col-span-1 text-center text-sm font-medium text-slate-300">{plan.goals?.length || 0}</div>
                    <div className="col-span-2">
                      <span className={`inline-flex border text-[11px] font-medium px-2.5 py-0.5 rounded-full ${cfg.pill}`}>{cfg.label}</span>
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <span className="text-xs font-medium text-slate-500">{isExpanded ? "Collapse" : "Review"}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                  </div>

                  {/* Expanded: Split Panel */}
                  {isExpanded && (
                    <div className="border-t border-[#222] bg-[#0a0a0a] flex flex-col lg:flex-row">
                      {/* LEFT: Goals list */}
                      <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-[#222]">
                        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" /> Goal Sheet Details
                        </h3>
                        <div className="space-y-3">
                          {(plan.goals || []).map((goal: any) => (
                            <div key={goal.id} className="bg-[#121212] border border-[#333] rounded-lg p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 border border-blue-900/50 bg-[#001a2a] px-1.5 py-0.5 rounded">
                                      {goal.thrust_area}
                                    </span>
                                    {goal.is_shared && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-400 border border-purple-900/50 bg-[#1a0b2e] px-1.5 py-0.5 rounded">
                                        <LinkIcon className="w-2.5 h-2.5" /> Shared
                                      </span>
                                    )}
                                    {goal.created_at && goal.updated_at && new Date(goal.updated_at).getTime() > new Date(goal.created_at).getTime() + 5000 && (
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-900/50 bg-[#2a1a00] px-1.5 py-0.5 rounded">
                                        ✎ Edited
                                      </span>
                                    )}
                                  </div>

                                  {editingGoalId === goal.id ? (
                                    <div className="space-y-3 mt-2">
                                      <Input
                                        value={editForm.title}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        className="h-9 text-sm bg-[#1a1a1a] border-[#333] text-white"
                                        placeholder="Goal title"
                                      />
                                      <div className="flex gap-2">
                                        <Input
                                          type="number"
                                          value={editForm.target_value}
                                          onChange={e => setEditForm({ ...editForm, target_value: e.target.value })}
                                          className="h-9 text-sm w-28 bg-[#1a1a1a] border-[#333] text-white"
                                          placeholder="Target"
                                        />
                                        <Input
                                          type="number"
                                          value={editForm.weight}
                                          onChange={e => setEditForm({ ...editForm, weight: e.target.value })}
                                          className="h-9 text-sm w-24 bg-[#1a1a1a] border-[#333] text-white"
                                          placeholder="Weight %"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-[13px] font-medium text-slate-200">{goal.title}</p>
                                      <p className="text-[12px] text-slate-500 mt-1">
                                        Target: <span className="font-medium text-slate-300">{goal.target_value}</span>
                                        {" · "}{goal.uom}
                                        {" · "}<span className="font-medium text-slate-300">{goal.weight}%</span> weight
                                      </p>
                                    </>
                                  )}
                                </div>

                                {/* Edit controls */}
                                {!goal.is_shared && (
                                  editingGoalId === goal.id ? (
                                    <div className="flex gap-2 flex-shrink-0">
                                      <button onClick={() => saveEdit(goal.id, plan.id)} disabled={isPending}
                                        className="p-2 rounded-lg bg-[#062010] hover:bg-[#0a3018] border border-emerald-900/50 text-emerald-500 transition-colors">
                                        <Save className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => setEditingGoalId(null)}
                                        className="p-2 rounded-lg bg-[#2a0000] hover:bg-[#3a0000] border border-red-900/50 text-red-500 transition-colors">
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => { setEditingGoalId(goal.id); setEditForm({ title: goal.title, target_value: goal.target_value, weight: goal.weight }); }}
                                      className="p-2 rounded-lg hover:bg-[#222] border border-transparent hover:border-[#333] text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Weight summary */}
                        <div className="mt-4 flex items-center justify-between text-[12px] font-medium text-slate-400 bg-[#121212] border border-[#222] rounded-lg px-4 py-3">
                          <span>{plan.goals?.length || 0} goals</span>
                          <span>
                            Total weight:{" "}
                            <span className={`font-bold ml-1 ${
                              (plan.goals || []).reduce((s: number, g: any) => s + Number(g.weight), 0) === 100
                                ? "text-emerald-500" : "text-red-500"
                            }`}>
                              {(plan.goals || []).reduce((s: number, g: any) => s + Number(g.weight), 0)}%
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* RIGHT: Manager Controls */}
                      <div className="w-full lg:w-[320px] p-6 flex flex-col gap-4">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-slate-400" /> Manager Decision
                        </h3>

                        <div className="space-y-2">
                          <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Review Notes</label>
                          <textarea
                            rows={4}
                            placeholder="Add review notes or rework instructions…"
                            className="w-full text-[13px] px-3 py-2 border border-[#333] rounded-lg bg-[#121212] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 resize-none transition-all"
                            value={comments[plan.id] ?? ""}
                            onChange={e => setComments({ ...comments, [plan.id]: e.target.value })}
                          />
                        </div>

                        <div className="bg-[#121212] border border-[#222] rounded-lg p-4 text-[12px] text-slate-400 space-y-2">
                          <p className="flex justify-between"><span>Submitted by</span> <span className="font-semibold text-slate-200">{plan.users?.name}</span></p>
                          <p className="flex justify-between"><span>Period</span> <span className="font-medium text-slate-200">{plan.period}</span></p>
                          <p className="flex justify-between"><span>Current status</span> <span className="font-medium text-slate-200">{STATUS_STYLE[plan.status]?.label}</span></p>
                        </div>

                        <div className="flex flex-col gap-3 mt-auto pt-4">
                          <button
                            onClick={() => handleStatus(plan.id, "Approved")}
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve Plan
                          </button>
                          <button
                            onClick={() => handleStatus(plan.id, "Rework_Required")}
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a0f0f] hover:bg-[#2a0f0f] border border-red-900/50 text-red-500 text-sm font-semibold rounded-lg transition-colors"
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
          <div className="bg-[#121212] border border-dashed border-[#333] rounded-xl p-10 text-center">
            <Clock className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No approved plans in check-in yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {approvedPlans.map(plan => (
              <div key={plan.id} className="bg-[#151515] border border-[#222] border-t-2 border-t-emerald-600 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] bg-[#0f0f0f]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1c1c1c] border border-[#333] flex items-center justify-center text-slate-300 font-bold text-[13px]">
                      {plan.users?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-200">{plan.users?.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{plan.period}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border bg-[#062010] text-emerald-500 border-emerald-900/50">Approved Active</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#111]">
                      <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-[#222]">
                        <th className="px-6 py-3">Goal Title & UoM</th>
                        <th className="px-4 py-3 text-center">Target</th>
                        <th className="px-4 py-3 text-center">Actual</th>
                        <th className="px-4 py-3 text-center">Score</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 w-64">Manager Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                      {(plan.goals || []).map((goal: any) => {
                        const score = Number(goal.calculated_score || 0).toFixed(1);
                        return (
                          <tr key={goal.id} className="hover:bg-[#1a1a1a] transition-colors">
                            <td className="px-6 py-3">
                              <p className="font-medium text-slate-200 text-[13px]">{goal.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{goal.thrust_area} · {goal.uom}</p>
                            </td>
                            <td className="px-4 py-3 text-center font-medium text-slate-400 text-[13px]">{goal.target_value}</td>
                            <td className="px-4 py-3 text-center font-bold text-emerald-400 text-[13px]">{goal.actual_value ?? 0}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center justify-center text-[11px] font-bold px-2 py-0.5 rounded border ${
                                Number(score) >= 100 ? "bg-[#062010] text-emerald-500 border-emerald-900/50" :
                                Number(score) >= 70  ? "bg-[#2a1a00] text-amber-500 border-amber-900/50" :
                                                       "bg-[#2a0000] text-red-500 border-red-900/50"
                              }`}>{score}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center justify-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                goal.status === "Completed"  ? "bg-[#062010] text-emerald-500 border-emerald-900/50" :
                                goal.status === "On Track"   ? "bg-[#001a2a] text-blue-500 border-blue-900/50" :
                                                               "bg-[#1c1c1c] text-slate-400 border-[#333]"
                              }`}>{goal.status || "Not Started"}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-2">
                                <textarea
                                  rows={2}
                                  className="w-full text-[12px] px-2.5 py-1.5 border border-[#333] rounded bg-[#121212] text-slate-300 focus:outline-none focus:border-emerald-500/50 resize-none transition-colors"
                                  placeholder="Add structured note…"
                                  value={comments[goal.id] !== undefined ? comments[goal.id] : (goal.manager_comment || "")}
                                  onChange={e => setComments({ ...comments, [goal.id]: e.target.value })}
                                />
                                <button
                                  onClick={() => saveComment(goal.id, plan.id)}
                                  disabled={isPending}
                                  className="self-end flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-600/30 transition-colors"
                                >
                                  <MessageSquare className="w-3 h-3" /> Save
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
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#151515] border border-[#333] rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-100">Push Departmental KPI</h2>
              <button onClick={() => setOpenPush(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePushKPI} className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-slate-400 mb-1.5 block">Goal Title *</label>
                <Input value={pushForm.title} onChange={e => setPushForm({ ...pushForm, title: e.target.value })} placeholder="e.g. Q1 Team Revenue Target" className="bg-[#111] border-[#333] text-slate-200" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-slate-400 mb-1.5 block">Thrust Area *</label>
                  <Input value={pushForm.thrustArea} onChange={e => setPushForm({ ...pushForm, thrustArea: e.target.value })} placeholder="e.g. Financial" className="bg-[#111] border-[#333] text-slate-200" required />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-400 mb-1.5 block">UoM</label>
                  <select
                    value={pushForm.uom}
                    onChange={e => setPushForm({ ...pushForm, uom: e.target.value })}
                    className="w-full h-9 px-3 text-sm border border-[#333] rounded-md bg-[#111] text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  >
                    {["Numeric (Min)", "Numeric (Max)", "% (Min)", "% (Max)", "Timeline", "Zero-based"].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-400 mb-1.5 block">Target Value *</label>
                <Input type="number" value={pushForm.target_value || ""} onChange={e => setPushForm({ ...pushForm, target_value: Number(e.target.value) })} className="bg-[#111] border-[#333] text-slate-200" required />
                <p className="text-[10px] text-slate-500 mt-1.5">Injected weight: 10% per BRD. Recipients can rebalance.</p>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-slate-400 mb-2 block">Select Recipients *</label>
                <div className="border border-[#333] rounded-lg p-3 space-y-2 max-h-36 overflow-y-auto bg-[#0a0a0a]">
                  {directReports.map((emp: any) => (
                    <label key={emp.id} className="flex items-center gap-3 text-sm cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={pushForm.employeeIds.includes(emp.id)}
                        onChange={e => setPushForm({
                          ...pushForm,
                          employeeIds: e.target.checked
                            ? [...pushForm.employeeIds, emp.id]
                            : pushForm.employeeIds.filter(id => id !== emp.id)
                        })}
                        className="rounded border-[#444] bg-[#222] text-purple-600 focus:ring-purple-500/50"
                      />
                      <span className="font-medium text-slate-300 group-hover:text-slate-100 transition-colors">{emp.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-[#2a1a00] border border-amber-900/50 rounded-lg px-3 py-2.5 text-[11px] text-amber-500">
                ⚠ Selected employees' plans will be set to <strong>Rework Required</strong> to allow weight rebalancing.
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpenPush(false)}
                  className="flex-1 py-2.5 border border-[#333] text-slate-400 text-sm font-medium rounded-lg hover:bg-[#222] hover:text-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
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
