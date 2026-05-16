import { createClient } from "@/utils/supabase/server";
import ManagerReviewClient from "@/components/manager/ManagerReviewClient";
import { ClipboardList, CheckCircle2, Clock } from "lucide-react";

export default async function ManagerApprovalsPage() {
  const supabase = await createClient();

  // MOCK DATA INJECTION
  const mockPlans = [
    {
      id: "p1", period: "Q1 2026", status: "Pending_Approval", user_id: "u1", created_at: "2026-05-01", updated_at: "2026-05-15",
      users: { name: "Dave Dev", email: "dave@example.com" },
      goals: [
        { id: "g1", title: "Ship Feature X", description: "Launch the new reporting engine", thrust_area: "Innovation", uom: "Numeric", target_value: 1, weight: 50, is_shared: false, actual_value: 0, calculated_score: 0, status: "Not_Started", manager_comment: null, created_at: "2026-05-01", updated_at: "2026-05-01" },
        { id: "g2", title: "Fix 20 Bugs", description: "Reduce backlog", thrust_area: "Operations", uom: "Numeric", target_value: 20, weight: 50, is_shared: false, actual_value: 0, calculated_score: 0, status: "Not_Started", manager_comment: null, created_at: "2026-05-01", updated_at: "2026-05-15" } // edited
      ]
    },
    {
      id: "p2", period: "Q1 2026", status: "Approved", user_id: "u2", created_at: "2026-05-02", updated_at: "2026-05-03",
      users: { name: "Eve Engineer", email: "eve@example.com" },
      goals: [
        { id: "g3", title: "Improve Uptime", description: "Achieve 99.9% uptime", thrust_area: "Operations", uom: "%", target_value: 99.9, weight: 60, is_shared: true, actual_value: 99.5, calculated_score: 80, status: "On_Track", manager_comment: "Good progress", created_at: "2026-05-02", updated_at: "2026-05-02" },
        { id: "g4", title: "Write Tests", description: "Increase coverage", thrust_area: "Innovation", uom: "%", target_value: 80, weight: 40, is_shared: false, actual_value: 85, calculated_score: 106, status: "Completed", manager_comment: null, created_at: "2026-05-02", updated_at: "2026-05-02" }
      ]
    }
  ];

  const allPlans = mockPlans as any[];
  const pending = allPlans.filter((p) => p.status === "Pending_Approval").length;
  const approved = allPlans.filter((p) => p.status === "Approved").length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Goal Plan Approvals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, edit, and approve your team's goal sheets for Q1 FY2026.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            {pending} pending
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            {approved} approved
          </div>
        </div>
      </div>

      {allPlans.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No goal plans to review</p>
          <p className="text-xs text-slate-400 mt-1">Plans will appear here once employees submit their goal sheets.</p>
        </div>
      ) : (
        <ManagerReviewClient initialPlans={allPlans} />
      )}
    </div>
  );
}
