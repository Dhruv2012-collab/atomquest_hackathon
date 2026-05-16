"use server"

import { createAdminClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updatePlanStatus(planId: string, status: "Approved" | "Rework_Required") {
  const supabase = await createAdminClient()

  // Verify the manager is authorized (handled mostly by RLS, but we can log errors)
  const { error } = await supabase
    .from("goal_plans")
    .update({ status })
    .eq("id", planId)

  if (error) {
    console.error("Error updating plan status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/dashboard")
  return { success: true }
}

export async function updateGoal(goalId: string, updates: any) {
  const supabase = await createAdminClient()

  // Note: RLS ensures only the manager or admin can update this
  const { error } = await supabase
    .from("goals")
    .update(updates)
    .eq("id", goalId)

  if (error) {
    console.error("Error updating goal:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/dashboard")
  return { success: true }
}

export async function submitManagerComment(goalId: string, comment: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from("goals")
    .update({ manager_comment: comment })
    .eq("id", goalId)

  if (error) return { success: false, error: error.message }
  revalidatePath("/manager/dashboard")
  return { success: true }
}

export async function pushSharedGoal(payload: {
  title: string;
  description?: string;
  thrustArea: string;
  uom: string;
  target_value: number;
  managerId: string;
  employeeIds: string[];
}) {
  const supabase = await createAdminClient()

  try {
    for (const empId of payload.employeeIds) {
      let { data: plan } = await supabase
        .from("goal_plans")
        .select("id, status")
        .eq("user_id", empId)
        .eq("period", "Q1 2026")
        .maybeSingle()

      if (!plan) {
        const { data: newPlan, error: planErr } = await supabase
          .from("goal_plans")
          .insert({
            user_id: empId,
            period: "Q1 2026",
            status: "Rework_Required"
          })
          .select("id, status")
          .single()
        if (planErr) throw planErr
        plan = newPlan
      } else {
        await supabase
          .from("goal_plans")
          .update({ status: "Rework_Required" })
          .eq("id", plan.id)
      }

      await supabase.from("goals").insert({
        plan_id: plan.id,
        title: payload.title,
        description: payload.description,
        thrust_area: payload.thrustArea,
        uom: payload.uom,
        target_value: payload.target_value,
        weight: 10, // BRD default injected weight
        is_shared: true,
        primary_owner_id: payload.managerId,
        status: "Not Started"
      })
    }

    revalidatePath("/manager/dashboard")
    return { success: true }
  } catch (err: any) {
    console.error("Error pushing shared goal:", err)
    return { success: false, error: err.message }
  }
}

export async function adminUnlockPlan(planId: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from("goal_plans")
    .update({ status: "Rework_Required" })
    .eq("id", planId)

  if (error) return { success: false, error: error.message }
  revalidatePath("/admin/dashboard")
  return { success: true }
}
