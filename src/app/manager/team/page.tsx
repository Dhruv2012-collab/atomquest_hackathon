import { createClient } from "@/utils/supabase/server";
import { Users, Mail, Building, LayoutList } from "lucide-react";

export default async function ManagerTeamPage() {
  const supabase = await createClient();

  const { data: usersData } = await supabase
    .from("users")
    .select("*")
    .order("name");

  const team = usersData || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Team Hierarchy</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your direct reports and organizational structure.</p>
        </div>
      </div>
      
      {team.length === 0 ? (
        <div className="bg-[#151515] border border-dashed border-[#333] rounded-xl p-12 text-center">
          <Users className="w-8 h-8 text-slate-600 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-200 mb-2">Team Directory</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Your direct reports are automatically synced from Active Directory. To view their performance, check the Dashboard or Check-ins tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((member: any) => (
            <div key={member.id} className="bg-[#151515] border border-[#222] rounded-xl p-5 hover:border-[#333] transition-colors flex items-start gap-4 shadow-sm group">
              <div className="w-12 h-12 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-slate-300 font-bold flex-shrink-0 group-hover:bg-[#2a2a2a] transition-colors">
                {member.name?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-slate-200 truncate">{member.name}</p>
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="flex items-center gap-2 text-[12px] text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-slate-400">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{member.department || "Organization Member"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
