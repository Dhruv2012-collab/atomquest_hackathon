"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, TrendingUp, Check } from "lucide-react";
import { submitGoalPlan } from "@/app/actions/goals";
import { checkInGoal } from "@/app/actions/progress";
import { useTransition, useState } from "react";

import { GoalSheetSchema, type GoalSheetFormValues } from "@/lib/schemas";

// Default empty goal template
const defaultGoal = {
  id: undefined,
  is_shared: false,
  title: "",
  description: "",
  thrustArea: "",
  uom: "Numeric (Min)" as const,
  target_value: 0,
  weight: 10,
  actual_value: 0,
  status: "Not Started"
};

export function GoalWorkspaceForm({ initialGoals = [], planStatus = "Draft" }: { initialGoals?: any[], planStatus?: string }) {
  const mappedInitialGoals = initialGoals.length > 0 
    ? initialGoals.map(g => ({
        id: g.id,
        is_shared: g.is_shared,
        title: g.title,
        description: g.description || "",
        thrustArea: g.thrust_area,
        uom: g.uom,
        target_value: g.target_value,
        weight: g.weight,
        actual_value: g.actual_value,
        status: g.status
      }))
    : [defaultGoal];

  const form = useForm<GoalSheetFormValues>({
    resolver: zodResolver(GoalSheetSchema) as any,
    defaultValues: {
      goals: mappedInitialGoals,
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    name: "goals",
    control: form.control,
  });

  // Calculate current total weight to show user in real-time
  const watchGoals = form.watch("goals");
  const currentTotalWeight = watchGoals.reduce((sum, g) => sum + (Number(g.weight) || 0), 0);
  const weightColor = currentTotalWeight === 100 ? "text-green-600" : "text-red-500";

  const [isPending, startTransition] = useTransition();
  const [checkInState, setCheckInState] = useState<Record<string, {actual: number, status: string}>>({});

  const handleCheckIn = (goalId: string) => {
    const state = checkInState[goalId];
    if (!state) return;
    
    startTransition(async () => {
      const result = await checkInGoal(goalId, state.actual, state.status as any);
      if (result.success) {
        alert("Check-in saved!");
        // Usually we'd mutate or refresh data here. The server action revalidates the path.
      } else {
        alert("Error: " + result.error);
      }
    });
  };

  function onSubmit(data: GoalSheetFormValues) {
    startTransition(async () => {
      const result = await submitGoalPlan(data);
      if (result.success) {
        alert("Goals submitted successfully!");
        form.reset({ goals: [defaultGoal] });
      } else {
        alert("Error submitting goals: " + result.error);
        console.error(result.details);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Sticky Header Zone */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 pb-4 pt-2 backdrop-blur border-b">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Q1 2026 Goal Sheet</h2>
            <p className="text-muted-foreground">Define your core objectives for the upcoming quarter.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium">Total Weight</span>
              <span className={`text-xl font-bold ${weightColor}`}>
                {currentTotalWeight}% / 100%
              </span>
            </div>
            {planStatus !== "Approved" && (
              <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={currentTotalWeight !== 100 || fields.length > 8 || isPending}>
                {isPending ? "Submitting..." : "Submit for Approval"}
              </Button>
            )}
            {planStatus === "Approved" && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                Plan Approved (Check-in Mode)
              </span>
            )}
          </div>
        </div>

        {/* Form Global Errors */}
        {form.formState.errors.goals?.root && (
          <div className="p-4 rounded-md bg-destructive/10 border border-destructive text-destructive">
            <p className="font-medium text-sm">{form.formState.errors.goals.root.message}</p>
          </div>
        )}

        {/* Goal Cards Zone */}
        <div className="space-y-6">
          {fields.map((field, index) => (
            <Card key={field.id} className="relative shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Goal #{index + 1}
                    {form.watch(`goals.${index}.is_shared`) && (
                      <span className="ml-3 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                        Shared Goal
                      </span>
                    )}
                  </CardTitle>
                  {fields.length > 1 && !form.watch(`goals.${index}.is_shared`) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive -mr-2"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left Column: Core Definition */}
                  <div className="md:col-span-7 space-y-4">
                    <FormField
                      control={form.control}
                      name={`goals.${index}.title` as any}
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Increase Q1 Pipeline Generation" disabled={field.value !== undefined && form.watch(`goals.${index}.is_shared`)} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`goals.${index}.description` as any}
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            {/* Fallback to Input if Textarea component isn't ready */}
                            <Input placeholder="Brief details about how this will be achieved" disabled={form.watch(`goals.${index}.is_shared`)} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Right Column: Metrics & Targets */}
                  <div className="md:col-span-5 space-y-4 bg-muted/30 p-4 rounded-lg border">
                    <FormField
                      control={form.control}
                      name={`goals.${index}.thrustArea` as any}
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>Thrust Area</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Revenue, Operations" disabled={form.watch(`goals.${index}.is_shared`)} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`goals.${index}.uom` as any}
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormLabel>UoM Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={form.watch(`goals.${index}.is_shared`)}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select UoM" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Numeric">Numeric (Min)</SelectItem>
                                <SelectItem value="%">% (Min/Max)</SelectItem>
                                <SelectItem value="Timeline">Timeline</SelectItem>
                                <SelectItem value="Zero-based">Zero-based</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`goals.${index}.target_value` as any}
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormLabel>Target Value</FormLabel>
                            <FormControl>
                              <Input type="number" disabled={form.watch(`goals.${index}.is_shared`)} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Check-In UI for Approved Plans */}
                    {planStatus === "Approved" && field.id && (
                      <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                        <h4 className="text-sm font-bold flex items-center text-blue-900 mb-3"><TrendingUp className="w-4 h-4 mr-2" /> Progress Check-In</h4>
                        <div className="grid grid-cols-2 gap-4 items-end">
                          <div>
                            <FormLabel className="text-xs">Actual Achievement</FormLabel>
                            <Input 
                              type="number" 
                              className="mt-1"
                              placeholder="e.g. 50" 
                              value={checkInState[mappedInitialGoals[index]?.id]?.actual || mappedInitialGoals[index]?.actual_value || 0}
                              onChange={(e) => setCheckInState({
                                ...checkInState, 
                                [mappedInitialGoals[index]?.id]: { 
                                  ...checkInState[mappedInitialGoals[index]?.id], 
                                  actual: Number(e.target.value),
                                  status: checkInState[mappedInitialGoals[index]?.id]?.status || "On Track"
                                }
                              })}
                            />
                          </div>
                          <div>
                            <FormLabel className="text-xs">Status</FormLabel>
                            <Select 
                              value={checkInState[mappedInitialGoals[index]?.id]?.status || mappedInitialGoals[index]?.status || "Not Started"}
                              onValueChange={(val) => setCheckInState({
                                ...checkInState, 
                                [mappedInitialGoals[index]?.id]: { 
                                  ...checkInState[mappedInitialGoals[index]?.id], 
                                  actual: checkInState[mappedInitialGoals[index]?.id]?.actual || mappedInitialGoals[index]?.actual_value || 0,
                                  status: val
                                }
                              })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Not Started">Not Started</SelectItem>
                                <SelectItem value="On Track">On Track</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          size="sm" 
                          className="mt-4 w-full"
                          disabled={isPending}
                          onClick={() => handleCheckIn(mappedInitialGoals[index]?.id)}
                        >
                          <Check className="w-4 h-4 mr-2"/> Save Progress
                        </Button>
                      </div>
                    )}
                    
                  <FormField
                      control={form.control}
                      name={`goals.${index}.weight` as any}
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>Weightage (%)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>Min 10%</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Zone */}
        {planStatus !== "Approved" && (
          <div className="flex justify-center pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => append(defaultGoal)}
              disabled={fields.length >= 8}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Another Goal ({fields.length}/8)
            </Button>
          </div>
        )}

      </form>
    </Form>
  );
}
