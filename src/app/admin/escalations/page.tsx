import { createClient } from "@/utils/supabase/server";
import { Shield, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function AdminEscalationsPage() {
  const supabase = await createClient();

  // MOCK DATA INJECTION
  const mockEscalations = [
    { id: "e1", status: "Rework_Required", period: "Q1 2026", updated_at: "2026-05-10T12:00:00Z", users: { name: "Charlie Sales", email: "charlie@example.com" } },
    { id: "e2", status: "Rework_Required", period: "Q1 2026", updated_at: "2026-05-12T09:30:00Z", users: { name: "Diana Ops", email: "diana@example.com" } }
  ];
  
  const escalations = mockEscalations as any[];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Escalations</h1>
          <p className="text-sm text-slate-500 mt-1">Track plans that have been returned for rework and require follow-up.</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg font-semibold">
          <Shield className="w-4 h-4" />
          {escalations.length} Action Items
        </div>
      </div>
      
      {escalations.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <Shield className="w-8 h-8 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-800 mb-1">No Escalations</h3>
          <p className="text-sm text-slate-500">All plans are progressing normally.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {escalations.map((plan: any) => (
              <div key={plan.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{plan.users?.name}</p>
                    <p className="text-xs text-slate-500">Plan returned for rework • Last updated: {new Date(plan.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Link
                  href={`/admin/dashboard`}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
                >
                  View Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
