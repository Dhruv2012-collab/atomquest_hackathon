import { Target, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function EmployeeGoalsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Goals</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage your personal objectives.</p>
        </div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
        <Target className="w-8 h-8 text-blue-500 mx-auto mb-4" />
        <h3 className="font-semibold text-slate-800 mb-2">Goal Management is on the Dashboard</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          For Q1 FY2026, all goal creation, submission, and review tracking is centralized on your main workspace dashboard.
        </p>
        <Link
          href="/employee/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
