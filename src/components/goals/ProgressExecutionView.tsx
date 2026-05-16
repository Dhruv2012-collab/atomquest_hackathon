"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check, TrendingUp } from "lucide-react";
import { checkInGoal } from "@/app/actions/progress";

export function ProgressExecutionView({ goals }: { goals: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [checkInState, setCheckInState] = useState<Record<string, { actual: number; status: string }>>({});

  const handleCheckIn = (goalId: string) => {
    const state = checkInState[goalId];
    if (!state) {
      toast.error("No changes to save.");
      return;
    }
    
    startTransition(async () => {
      const result = await checkInGoal(goalId, state.actual, state.status as any);
      if (result.success) {
        toast.success("Check-in saved successfully!");
      } else {
        toast.error("Error: " + result.error);
      }
    });
  };

  const calculateScore = (uom: string, target: number, actual: number) => {
    if (!actual && actual !== 0) return 0;
    let score = 0;
    if (uom.includes("Numeric (Min)")) {
      score = target === 0 ? 0 : (actual / target) * 100;
    } else if (uom.includes("Numeric (Max)")) {
      score = actual === 0 ? 100 : (target / actual) * 100;
    } else if (uom.includes("%")) {
      score = actual;
    } else if (uom.includes("Zero-based")) {
      score = actual === 0 ? 100 : 0;
    } else {
      score = actual >= target ? 100 : (actual / target) * 100; // fallback
    }
    return Math.min(Math.max(score, 0), 120); // Cap at 120%
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-blue-900 dark:text-blue-400">Active Check-In Pulse</h2>
          <p className="text-muted-foreground">Your plan is approved. Log your progress below.</p>
        </div>
      </div>

      {/* UoM Scoring Legend */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 shadow-sm">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          How your progress score is computed:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <div><span className="font-semibold">Min (Numeric / %):</span> Higher is better (e.g. Sales). Score = Actual ÷ Target</div>
          <div><span className="font-semibold">Max (Numeric / %):</span> Lower is better (e.g. Cost, TAT). Score = Target ÷ Actual</div>
          <div><span className="font-semibold">Timeline:</span> Date-based completion vs Deadline.</div>
          <div><span className="font-semibold">Zero-based:</span> Zero is Success (e.g. Safety Incidents). If 0 → 100%, else 0%.</div>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead className="w-[30%]">Goal Objective</TableHead>
              <TableHead>Target (UoM)</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead className="w-[40%] text-center">Update Panel & Scoring</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.map((goal) => {
              const currentActual = checkInState[goal.id]?.actual ?? goal.actual_value ?? 0;
              const currentStatus = checkInState[goal.id]?.status ?? goal.status ?? "Not Started";
              const currentScore = calculateScore(goal.uom, goal.target_value, currentActual);
              
              let scoreColor = "bg-red-500";
              if (currentScore >= 100) scoreColor = "bg-green-500";
              else if (currentScore >= 70) scoreColor = "bg-yellow-500";

              return (
                <TableRow key={goal.id}>
                  <TableCell>
                    <p className="font-semibold">{goal.title}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[250px]">{goal.description}</p>
                    {goal.is_shared && <span className="inline-block mt-1 text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Shared</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">{goal.target_value}</span>
                      <span className="text-xs text-muted-foreground">{goal.uom}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-slate-600 dark:text-slate-300">{goal.weight}%</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-md border">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Actuals</label>
                          <Input 
                            type="number" 
                            className="h-8"
                            value={currentActual}
                            onChange={(e) => setCheckInState({
                              ...checkInState, 
                              [goal.id]: { actual: Number(e.target.value), status: currentStatus }
                            })}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Status</label>
                          <Select 
                            value={currentStatus}
                            onValueChange={(val) => setCheckInState({
                              ...checkInState, 
                              [goal.id]: { actual: currentActual, status: val }
                            })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Not Started">Not Started</SelectItem>
                              <SelectItem value="On Track">On Track</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button 
                            size="sm" 
                            className="h-8"
                            disabled={isPending || (!checkInState[goal.id])}
                            onClick={() => handleCheckIn(goal.id)}
                          >
                            <Check className="w-4 h-4"/>
                          </Button>
                        </div>
                      </div>
                      
                      {/* Live Score Indicator Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium">Calculated Score</span>
                          <span className="font-bold">{currentScore.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 dark:bg-slate-700 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${scoreColor}`} 
                            style={{ width: `${Math.min(currentScore, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
