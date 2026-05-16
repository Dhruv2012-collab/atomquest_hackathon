"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GoalSheetSchema, GoalSheetFormValues } from "@/lib/schemas";
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

import { toast } from "sonner";
import { Lock } from "lucide-react";

import { ProgressExecutionView } from "./ProgressExecutionView";

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

  if (planStatus === "Approved") {
    return <ProgressExecutionView goals={mappedInitialGoals} />;
  }

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
  const weightColor = currentTotalWeight === 100 ? "bg-green-500" : "bg-red-500 animate-pulse";
  const textWeightColor = currentTotalWeight === 100 ? "text-green-600" : "text-red-500";

  const [isPending, startTransition] = useTransition();
  const [checkInState, setCheckInState] = useState<Record<string, {actual: number, status: string}>>({});

  const handleCheckIn = (goalId: string) => {
    const state = checkInState[goalId];
    if (!state) return;
    
    startTransition(async () => {
      const result = await checkInGoal(goalId, state.actual, state.status as any);
      if (result.success) {
        toast.success("Check-in saved successfully!");
      } else {
        toast.error("Error: " + result.error);
      }
    });
  };

  function onSubmit(data: GoalSheetFormValues) {
    startTransition(async () => {
      const result = await submitGoalPlan(data);
      if (result.success) {
        toast.success("Goals submitted successfully!");
        // We'd typically redirect or update local state here
      } else {
        toast.error("Error submitting goals: " + result.error);
        console.error(result.details);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Top Contextual Metric Strip Zone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold">{fields.length} <span className="text-sm font-normal text-muted-foreground">/ 8 Max</span></p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {fields.length}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Cumulative Weight</p>
                <p className={`text-xl font-bold ${textWeightColor}`}>{currentTotalWeight}%</p>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ease-out ${weightColor}`} 
                  style={{ width: `${Math.min(currentTotalWeight, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Header Zone */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 pb-4 pt-2 backdrop-blur border-b">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Q1 2026 Goal Sheet</h2>
            <p className="text-muted-foreground">Define your core objectives for the upcoming quarter.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={currentTotalWeight !== 100 || fields.length > 8 || isPending}>
              {isPending ? "Submitting..." : "Submit Goal Sheet"}
            </Button>
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
          {fields.map((field, index) => {
            const isShared = form.watch(`goals.${index}.is_shared`);
            return (
              <Card key={field.id} className={`relative shadow-sm transition-all ${isShared ? "border-purple-200 bg-purple-50/30 shadow-purple-100" : ""}`}>
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
            );
          })}
        </div>

        {/* Action Zone */}
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

      </form>
    </Form>
  );
}
