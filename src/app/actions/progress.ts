"use server"

import { createAdminClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function checkInGoal(goalId: string, actualValue: number, status: "Not Started" | "On Track" | "Completed") {
  const supabase = await createAdminClient()

  // First, fetch the goal to get Target, Weight, and UoM for calculation
  const { data: goal, error: fetchError } = await supabase
    .from("goals")
    .select("*")
    .eq("id", goalId)
    .single()

  if (fetchError || !goal) {
    return { success: false, error: fetchError?.message || "Goal not found." }
  }

  // 2. Mathematical Scoring Engine
  let calculatedScore = 0;
  const target = Number(goal.target_value);
  const weight = Number(goal.weight);

  if (goal.uom === "Numeric (Min)" || goal.uom === "% (Min)") {
    // Higher is better: (Achievement / Target) * Weight
    calculatedScore = (actualValue / target) * weight;
  } 
  else if (goal.uom === "Numeric (Max)" || goal.uom === "% (Max)") {
    // Lower is better: (Target / Achievement) * Weight
    // Defensive Check: Prevent division by zero if achievement is 0
    const safeActual = actualValue === 0 ? 0.0001 : actualValue;
    calculatedScore = (target / safeActual) * weight;
  }
  else if (goal.uom === "Zero-based") {
    calculatedScore = actualValue === 0 ? weight : 0;
  } 
  else if (goal.uom === "Timeline") {
    // Simple mock logic: if completed, get full weight
    calculatedScore = status === "Completed" ? weight : 0;
  }

  // Cap score at 150% of weight to prevent infinite/massive mathematical explosions
  if (calculatedScore > weight * 1.5) {
    calculatedScore = weight * 1.5;
  }

  // Hardcoded calendar check
  const currentMonth = new Date().getMonth() + 1; // 1-12
  // Enforce appraisal windows: Q1 (July=7), Q2 (October=10), Q3 (January=1), Q4 (March=3/April=4).
  const validAppraisalMonths = [7, 10, 1, 3, 4];
  
  if (!validAppraisalMonths.includes(currentMonth)) {
    return { 
      success: false, 
      error: "Progress Check-Ins can only be submitted during the Q1, Q2, Q3, or Q4 appraisal windows (July, Oct, Jan, Mar/Apr)." 
    }
  }

  const { error: updateError } = await supabase
    .from("goals")
    .update({
      actual_value: actualValue,
      calculated_score: calculatedScore,
      status: status
    })
    .eq("id", goalId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath("/employee/dashboard")
  return { success: true }
}
