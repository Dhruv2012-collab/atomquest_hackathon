"use client";

import { useState, useTransition } from "react";
import { adminUnlockPlan } from "@/app/actions/manager";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Unlock } from "lucide-react";
import { toast } from "sonner";

export default function AdminPlanManagementClient({ initialPlans }: { initialPlans: any[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [isPending, startTransition] = useTransition();

  const handleUnlock = (planId: string) => {
    startTransition(async () => {
      const res = await adminUnlockPlan(planId);
      if (res.success) {
        setPlans(plans.map(p => p.id === planId ? { ...p, status: "Rework_Required" } : p));
        toast.success("Plan successfully unlocked! Status reverted to Rework Required.");
      } else {
        toast.error("Failed to unlock plan: " + res.error);
      }
    });
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-[#0f0f0f] border-b border-[#222]">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3">Employee</TableHead>
            <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3">Email</TableHead>
            <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3">Period</TableHead>
            <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3">Status</TableHead>
            <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3 text-right">Admin Override</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan: any) => (
            <TableRow key={plan.id} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors">
              <TableCell className="font-medium text-[13px] text-slate-200">{plan.users?.name || "Unknown"}</TableCell>
              <TableCell className="text-[13px] text-slate-400">{plan.users?.email || "N/A"}</TableCell>
              <TableCell className="text-[13px] text-slate-400">{plan.period}</TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border
                  ${plan.status === 'Approved' ? 'bg-[#062010] text-emerald-500 border-emerald-900/50' : 
                    plan.status === 'Rework_Required' ? 'bg-[#2a0505] text-red-500 border-red-900/50' : 
                    'bg-[#2a1a00] text-amber-500 border-amber-900/50'}`}>
                  {plan.status === 'Pending_Approval' ? 'Pending Review' : plan.status.replace("_", " ")}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {plan.status === 'Approved' ? (
                  <button 
                    onClick={() => handleUnlock(plan.id)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a0b2e] text-purple-400 text-[11px] font-bold rounded hover:bg-[#2a114e] border border-purple-900/50 transition-colors disabled:opacity-50"
                  >
                    <Unlock className="w-3 h-3" />
                    Unlock Plan
                  </button>
                ) : (
                  <span className="text-[11px] font-medium text-slate-600 bg-[#111] px-2 py-1 border border-[#222] rounded">Unlocked</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
