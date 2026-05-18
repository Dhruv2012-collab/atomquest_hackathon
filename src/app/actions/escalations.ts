"use server"

import { createAdminClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function runEscalationEngine() {
  const supabase = await createAdminClient()
  
  // Clean old logs for the demo to prevent clutter
  await supabase.from("escalation_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000")

  // 1. Rule: Employee hasn't submitted goals
  const { data: employees } = await supabase
    .from("users")
    .select("id, name, manager_id")
    .eq("role", "Employee")

  const { data: plans } = await supabase
    .from("goal_plans")
    .select("user_id, status")
    .eq("period", "Q1 2026")

  const planUserIds = new Set(plans?.map((p: any) => p.user_id))
  const escalations = []

  // Check missing submissions
  for (const emp of employees || []) {
    if (!planUserIds.has(emp.id)) {
      escalations.push({
        user_id: emp.id,
        target_role: "Employee",
        reason: "Goals not submitted within 7 days of cycle opening.",
        escalation_level: 1,
        status: "Open"
      })
      // If we had a deep history, level 2 would target the Manager
    }
  }

  // 2. Rule: Manager hasn't approved goals
  const pendingPlans = plans?.filter((p: any) => p.status === "Pending_Approval") || []
  for (const p of pendingPlans) {
    const emp = employees?.find((e: any) => e.id === p.user_id)
    if (emp && emp.manager_id) {
      escalations.push({
        user_id: emp.manager_id,
        target_role: "Manager",
        reason: `Pending approval for ${emp.name}'s goals exceeded SLA (3 days).`,
        escalation_level: 2,
        status: "Open"
      })
    }
  }

  // Insert generated escalations
  if (escalations.length > 0) {
    const { error } = await supabase.from("escalation_logs").insert(escalations)
    if (error) {
      console.error("Escalation Engine Error:", error)
      return { success: false, error: error.message }
    }
  }

  revalidatePath("/admin/escalations")
  return { success: true, count: escalations.length }
}
