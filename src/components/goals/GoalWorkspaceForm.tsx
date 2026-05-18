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
import { Trash2, Plus } from "lucide-react";
import { submitGoalPlan } from "@/app/actions/goals";
import { checkInGoal } from "@/app/actions/progress";
import { useTransition, useState } from "react";

import { toast } from "sonner";
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
  const textWeightColor = currentTotalWeight === 100 ? "text-[#00d0ff]" : "text-[#00d0ff]";

  const [isPending, startTransition] = useTransition();

  function onSubmit(data: GoalSheetFormValues) {
    startTransition(async () => {
      const result = await submitGoalPlan(data);
      if (result.success) {
        toast.success("Goals submitted successfully!");
      } else {
        toast.error("Error submitting goals: " + result.error);
        console.error(result.details);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Compact Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#222] pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Goal Planning Workspace</h2>
            <p className="text-sm font-medium text-slate-400 mt-1">Define measurable objectives for the current quarter.</p>
          </div>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Allocation</p>
              <p className={`text-xl font-bold ${textWeightColor}`}>{currentTotalWeight}/100%</p>
            </div>
            <Button 
              type="button" 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={currentTotalWeight !== 100 || fields.length > 8 || isPending}
              className="bg-[#333] hover:bg-[#444] text-slate-200 font-semibold px-6 disabled:opacity-40"
            >
              {isPending ? "Submitting..." : "Submit Goal Sheet"}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-6 pb-2 text-sm font-bold text-slate-400">
          <p>Total Goals: <span className="text-slate-100 ml-1">{fields.length} / 8</span></p>
          <div className="h-4 w-px bg-[#333]"></div>
          <p>Allocated Weight: <span className={`ml-1 ${textWeightColor}`}>{currentTotalWeight}%</span></p>
        </div>

        {/* Form Global Errors */}
        {form.formState.errors.goals?.root && (
          <div className="p-4 rounded-md bg-red-900/20 border border-red-900/50 text-red-500">
            <p className="font-medium text-sm">{form.formState.errors.goals.root.message}</p>
          </div>
        )}

        {/* Goal Cards Zone */}
        <div className="space-y-6">
          {fields.map((field, index) => {
            const isShared = form.watch(`goals.${index}.is_shared`);
            return (
              <div key={field.id} className={`relative rounded-xl border border-[#2a2a2a] bg-[#121212] p-6 shadow-sm transition-all`}>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#2a303a] px-3 py-1 text-xs font-bold text-[#7ca5d4]">
                    Goal #{index + 1}
                  </div>
                  {fields.length > 1 && !isShared && (
                    <button
                      type="button"
                      className="text-slate-500 hover:text-red-400 transition"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  
                  {/* Left Column */}
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name={`goals.${index}.title` as any}
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Increase Q1 Pipeline Generation" 
                              disabled={field.value !== undefined && isShared} 
                              className="bg-[#1a1a1a] border-[#2a2a2a] text-slate-100 focus-visible:ring-[#444]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`goals.${index}.description` as any}
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Description (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Brief details about how this will be achieved" 
                              disabled={isShared} 
                              className="bg-[#1a1a1a] border-[#2a2a2a] text-white focus-visible:ring-[#444] min-h-[60px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name={`goals.${index}.thrustArea` as any}
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Thrust Area</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Revenue, Operations" 
                              disabled={isShared} 
                              className="bg-[#1a1a1a] border-[#2a2a2a] text-slate-100 focus-visible:ring-[#444]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`goals.${index}.uom` as any}
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">UoM Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isShared}>
                              <FormControl>
                                <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-slate-100 focus:ring-[#444]">
                                  <SelectValue placeholder="Select UoM" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-slate-100">
                                <SelectItem value="Numeric">Numeric (Min)</SelectItem>
                                <SelectItem value="%">% (Min/Max)</SelectItem>
                                <SelectItem value="Timeline">Timeline</SelectItem>
                                <SelectItem value="Zero-based">Zero-based</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500 text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`goals.${index}.target_value` as any}
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Target Value</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                disabled={isShared} 
                                className="bg-[#1a1a1a] border-[#2a2a2a] text-slate-100 focus-visible:ring-[#444]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`goals.${index}.weight` as any}
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Weightage (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              className="bg-[#1a1a1a] border-[#2a2a2a] text-slate-100 focus-visible:ring-[#444]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription className="text-[10px] text-slate-500 italic mt-1 font-medium text-right">Min 10% required for valid goal entry</FormDescription>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Action Zone */}
        <div className="pt-2">
          <Button
            type="button"
            className="w-full border border-dashed border-[#333] bg-[#0a0a0a] hover:bg-[#111] text-slate-400 hover:text-slate-100 font-bold tracking-widest uppercase text-xs py-6"
            onClick={() => append(defaultGoal)}
            disabled={fields.length >= 8}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        </div>

      </form>
    </Form>
  );
}
