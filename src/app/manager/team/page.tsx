import { Users } from "lucide-react";

export default function ManagerTeamPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Hierarchy</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your direct reports and organizational structure.</p>
        </div>
      </div>
      
      <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
        <Users className="w-8 h-8 text-slate-300 mx-auto mb-4" />
        <h3 className="font-semibold text-slate-800 mb-2">Team Directory</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Your direct reports are automatically synced from Active Directory. To view their performance, check the Dashboard or Check-ins tab.
        </p>
      </div>
    </div>
  );
}
