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

  // 6. Notifications Integration
  try {
    const { data: planData } = await supabase
      .from("goal_plans")
      .select("user_id")
      .eq("id", planId)
      .single();

    if (planData && planData.user_id) {
      const { data: userData } = await supabase
        .from('users')
        .select('name, email, manager_id')
        .eq('id', planData.user_id)
        .single();
        
      if (userData && userData.manager_id) {
        const { data: managerData } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', userData.manager_id)
          .single();
          
        if (managerData) {
          const { sendTeamsNotification, sendEmailNotification } = await import('@/utils/notifications');
          const eventType = status === "Approved" ? "APPROVED" : "REJECTED";
          
          const notificationData = {
            event: eventType as any,
            employeeName: userData.name,
            employeeEmail: userData.email,
            managerName: managerData.name,
            managerEmail: managerData.email,
            planId: planId,
            deepLink: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/employee/dashboard`
          };
          
          if (process.env.TEAMS_WEBHOOK_URL) {
            sendTeamsNotification(process.env.TEAMS_WEBHOOK_URL, notificationData).catch(console.error);
          }
          if (process.env.RESEND_API_KEY) {
            // For approvals/rejections, we usually email the employee, so let's send to managerEmail or employeeEmail
            // On free resend, you can only email yourself. We'll send it to managerEmail to simulate.
            sendEmailNotification(process.env.RESEND_API_KEY, notificationData).catch(console.error);
          }
        }
      }
    }
  } catch (notifyError) {
    console.error("Failed to trigger notifications:", notifyError);
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
