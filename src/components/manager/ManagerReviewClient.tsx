"use client";

import { useState, useTransition } from "react";
import { updatePlanStatus, updateGoal, submitManagerComment, pushSharedGoal } from "@/app/actions/manager";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Edit2, Save, X, PlusCircle, MessageSquare } from "lucide-react";

export default function ManagerReviewClient({ initialPlans }: { initialPlans: any[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [activeTab, setActiveTab] = useState<"reviews" | "checkins">("reviews");
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [comments, setComments] = useState<{ [goalId: string]: string }>({});
  
  // Push KPI Dialog State
  const [openPush, setOpenPush] = useState(false);
  const [pushForm, setPushForm] = useState({
    title: "",
    description: "",
    thrustArea: "",
    uom: "Numeric (Min)",
    target_value: 0,
    employeeIds: [] as string[]
  });

  const [isPending, startTransition] = useTransition();

  // Hardcoded Manager ID for Sarah Lead
  const managerId = '00000000-0000-0000-0000-000000000011';

  // Extract unique direct reports from plans
  const directReportsMap = new Map();
  plans.forEach(p => {
    if (p.users && p.user_id) {
      directReportsMap.set(p.user_id, { id: p.user_id, name: p.users.name, email: p.users.email });
    }
  });
  const directReports = Array.from(directReportsMap.values());

  const pendingPlans = plans.filter(p => p.status === 'Pending_Approval' || p.status === 'Rework_Required' || p.status === 'Draft');
  const approvedPlans = plans.filter(p => p.status === 'Approved');

  const handleStatusChange = (planId: string, status: "Approved" | "Rework_Required") => {
    startTransition(async () => {
      const res = await updatePlanStatus(planId, status);
      if (res.success) {
        setPlans(plans.map(p => p.id === planId ? { ...p, status } : p));
      } else {
        alert("Failed to update status: " + res.error);
      }
    });
  };

  const startEditing = (goal: any) => {
    setEditingGoalId(goal.id);
    setEditForm({
      title: goal.title,
      target_value: goal.target_value,
      weight: goal.weight
    });
  };

  const saveEdit = (goalId: string, planId: string) => {
    startTransition(async () => {
      const res = await updateGoal(goalId, editForm);
      if (res.success) {
        setPlans(plans.map(p => {
          if (p.id === planId) {
            return {
              ...p,
              goals: p.goals.map((g: any) => g.id === goalId ? { ...g, ...editForm } : g)
            };
          }
          return p;
        }));
        setEditingGoalId(null);
      } else {
        alert("Failed to save goal: " + res.error);
      }
    });
  };

  const handleSaveComment = (goalId: string, planId: string) => {
    const comment = comments[goalId] ?? "";
    startTransition(async () => {
      const res = await submitManagerComment(goalId, comment);
      if (res.success) {
        setPlans(plans.map(p => {
          if (p.id === planId) {
            return {
              ...p,
              goals: p.goals.map((g: any) => g.id === goalId ? { ...g, manager_comment: comment } : g)
            };
          }
          return p;
        }));
        alert("Comment saved successfully!");
      } else {
        alert("Failed to save comment: " + res.error);
      }
    });
  };

  const handlePushKPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushForm.title || !pushForm.thrustArea || pushForm.target_value <= 0 || pushForm.employeeIds.length === 0) {
      alert("Please fill in all required fields and select at least one employee.");
      return;
    }

    startTransition(async () => {
      const res = await pushSharedGoal({
        ...pushForm,
        managerId
      });
      if (res.success) {
        alert("Departmental KPI pushed successfully! Employee plans have been set to Rework Required for weight rebalancing.");
        setOpenPush(false);
        // Reset form
        setPushForm({
          title: "",
          description: "",
          thrustArea: "",
          uom: "Numeric (Min)",
          target_value: 0,
          employeeIds: []
        });
        // Force reload to reflect new plans/goals
        window.location.reload();
      } else {
        alert("Failed to push KPI: " + res.error);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-lg border">
        <div className="flex gap-2">
          <Button 
            variant={activeTab === "reviews" ? "default" : "outline"} 
            onClick={() => setActiveTab("reviews")}
          >
            Goal Plan Reviews ({pendingPlans.length})
          </Button>
          <Button 
            variant={activeTab === "checkins" ? "default" : "outline"} 
            onClick={() => setActiveTab("checkins")}
          >
            Active Check-ins ({approvedPlans.length})
          </Button>
        </div>

        {/* Push Departmental KPI Dialog */}
        <Dialog open={openPush} onOpenChange={setOpenPush}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Push Departmental KPI
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Push Departmental KPI (Shared Goal)</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePushKPI} className="space-y-4 my-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Goal Title</label>
                <Input 
                  placeholder="e.g. Q1 Team Revenue Target" 
                  value={pushForm.title}
                  onChange={(e) => setPushForm({...pushForm, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input 
                  placeholder="Brief details..." 
                  value={pushForm.description}
                  onChange={(e) => setPushForm({...pushForm, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Thrust Area</label>
                  <Input 
                    placeholder="e.g. Financial" 
                    value={pushForm.thrustArea}
                    onChange={(e) => setPushForm({...pushForm, thrustArea: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">UoM Type</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={pushForm.uom}
                    onChange={(e) => setPushForm({...pushForm, uom: e.target.value})}
                  >
                    <option value="Numeric (Min)">Numeric (Min)</option>
                    <option value="Numeric (Max)">Numeric (Max)</option>
                    <option value="% (Min)">% (Min)</option>
                    <option value="% (Max)">% (Max)</option>
                    <option value="Timeline">Timeline</option>
                    <option value="Zero-based">Zero-based</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Value</label>
                <Input 
                  type="number" 
                  value={pushForm.target_value || ""}
                  onChange={(e) => setPushForm({...pushForm, target_value: Number(e.target.value)})}
                  required
                />
                <p className="text-xs text-muted-foreground">Note: Injected default weight is set to 10% per BRD rules.</p>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <label className="text-sm font-medium">Select Direct Reports</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border p-3 rounded-md max-h-40 overflow-y-auto">
                  {directReports.map((emp: any) => (
                    <label key={emp.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={pushForm.employeeIds.includes(emp.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPushForm({...pushForm, employeeIds: [...pushForm.employeeIds, emp.id]});
                          } else {
                            setPushForm({...pushForm, employeeIds: pushForm.employeeIds.filter(id => id !== emp.id)});
                          }
                        }}
                      />
                      <span>{emp.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {isPending ? "Pushing KPI..." : "Push KPI to Selected Employees"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tab Content: Goal Plan Reviews */}
      {activeTab === "reviews" && (
        pendingPlans.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              No Pending Goal Plans require your review at this time.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {pendingPlans.map(plan => (
              <Card key={plan.id} className="shadow-sm border-t-4 border-t-blue-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl">{plan.users?.name}'s Goal Plan</CardTitle>
                    <CardDescription>{plan.users?.email} • {plan.period}</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800`}>
                      {plan.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border my-4 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Goal Title</TableHead>
                          <TableHead>Thrust Area</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {plan.goals.map((goal: any) => (
                          <TableRow key={goal.id}>
                            <TableCell className="font-medium">
                              {editingGoalId === goal.id ? (
                                <Input 
                                  value={editForm.title} 
                                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                />
                              ) : (
                                goal.title
                              )}
                            </TableCell>
                            <TableCell>{goal.thrust_area} ({goal.uom})</TableCell>
                            <TableCell>
                              {editingGoalId === goal.id ? (
                                <Input 
                                  type="number"
                                  value={editForm.target_value} 
                                  onChange={(e) => setEditForm({...editForm, target_value: e.target.value})}
                                  className="w-24"
                                />
                              ) : (
                                goal.target_value
                              )}
                            </TableCell>
                            <TableCell>
                              {editingGoalId === goal.id ? (
                                <Input 
                                  type="number"
                                  value={editForm.weight} 
                                  onChange={(e) => setEditForm({...editForm, weight: e.target.value})}
                                  className="w-20"
                                />
                              ) : (
                                `${goal.weight}%`
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {editingGoalId === goal.id ? (
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => saveEdit(goal.id, plan.id)} disabled={isPending}>
                                    <Save className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => setEditingGoalId(null)}>
                                    <X className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              ) : (
                                <Button variant="ghost" size="icon" onClick={() => startEditing(goal)}>
                                  <Edit2 className="h-4 w-4 text-blue-600" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Manager Actions */}
                  <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleStatusChange(plan.id, "Rework_Required")}
                      disabled={isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Request Rework
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleStatusChange(plan.id, "Approved")}
                      disabled={isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Tab Content: Active Check-ins */}
      {activeTab === "checkins" && (
        approvedPlans.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              No Approved Goal Plans available for check-in review yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {approvedPlans.map(plan => (
              <Card key={plan.id} className="shadow-sm border-t-4 border-t-green-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl">{plan.users?.name}'s Active Goals</CardTitle>
                    <CardDescription>{plan.users?.email} • {plan.period}</CardDescription>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    {plan.status}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border my-4 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Goal Title</TableHead>
                          <TableHead>UoM</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Actual</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-1/3">Manager Check-in Comment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {plan.goals.map((goal: any) => (
                          <TableRow key={goal.id}>
                            <TableCell className="font-medium">{goal.title}</TableCell>
                            <TableCell>{goal.uom}</TableCell>
                            <TableCell>{goal.target_value}</TableCell>
                            <TableCell className="font-bold text-blue-600">{goal.actual_value ?? 0}</TableCell>
                            <TableCell>{goal.calculated_score ?? 0}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-semibold
                                ${goal.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                  goal.status === 'On Track' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-gray-100 text-gray-800'}`}>
                                {goal.status || 'Not Started'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-2 my-1">
                                <textarea 
                                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                  placeholder="Add structured discussion notes..."
                                  value={comments[goal.id] !== undefined ? comments[goal.id] : (goal.manager_comment || "")}
                                  onChange={(e) => setComments({...comments, [goal.id]: e.target.value})}
                                />
                                <Button 
                                  size="sm" 
                                  className="self-end bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 h-7"
                                  onClick={() => handleSaveComment(goal.id, plan.id)}
                                  disabled={isPending}
                                >
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  Save Comment
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
