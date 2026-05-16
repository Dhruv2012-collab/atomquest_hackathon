"use client";

import { useState, useTransition } from "react";
import { adminUnlockPlan } from "@/app/actions/manager";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Unlock } from "lucide-react";

export default function AdminPlanManagementClient({ initialPlans }: { initialPlans: any[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [isPending, startTransition] = useTransition();

  const handleUnlock = (planId: string) => {
    startTransition(async () => {
      const res = await adminUnlockPlan(planId);
      if (res.success) {
        setPlans(plans.map(p => p.id === planId ? { ...p, status: "Rework_Required" } : p));
        alert("Plan successfully unlocked! Status reverted to Rework Required.");
      } else {
        alert("Failed to unlock plan: " + res.error);
      }
    });
  };

  return (
    <Card className="mt-8 border-t-4 border-t-purple-500 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Plan Management & Governance</CardTitle>
        <CardDescription>Oversee organizational goal sheets and perform administrative lock overrides.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Admin Override</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan: any) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.users?.name || "Unknown"}</TableCell>
                  <TableCell>{plan.users?.email || "N/A"}</TableCell>
                  <TableCell>{plan.period}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-semibold
                      ${plan.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                        plan.status === 'Rework_Required' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {plan.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {plan.status === 'Approved' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        onClick={() => handleUnlock(plan.id)}
                        disabled={isPending}
                      >
                        <Unlock className="w-3 h-3 mr-1" />
                        Unlock Plan
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Unlocked</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
