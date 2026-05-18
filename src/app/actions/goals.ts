"use server"

import { createClient, createAdminClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { GoalSheetSchema } from "@/lib/schemas"

export async function submitGoalPlan(payload: any) {
  const supabase = await createAdminClient()

  // 1. Zod Validation (Double Check on Server)
  const validationResult = GoalSheetSchema.safeParse(payload)
  
  if (!validationResult.success) {
    return {
      success: false,
      error: "Validation failed on server.",
      details: validationResult.error.flatten()
    }
  }

  const { goals } = validationResult.data

  // API-level date blocking for goal submission (Only allowed in May)
  const currentMonth = new Date().getMonth() + 1; // 1-12
  if (currentMonth !== 5) {
    return {
      success: false,
      error: "Goal Creation window is closed. Goal setup strictly opens on May 1st."
    }
  }

  // Get current user session
  // Since we haven't built the login UI yet, we'll temporarily fallback to our seeded employee ID for testing
  // '00000000-0000-0000-0000-000000000101' is 'Dave Dev' from our seed.sql
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id || '00000000-0000-0000-0000-000000000101'

  try {
    // 2. Remove existing plan for this period to allow re-submission
    await supabase.from("goal_plans").delete().eq("user_id", userId).eq("period", "Q1 2026").neq("status", "Approved")

    // 3. Create the Goal Plan record
    const { data: plan, error: planError } = await supabase
      .from("goal_plans")
      .insert({
        user_id: userId,
        period: "Q1 2026",
        status: "Pending_Approval"
      })
      .select("id")
      .single()

    if (planError) throw planError

    // 4. Map goals to include the new plan_id and owner
    const mappedGoals = goals.map(g => ({
      plan_id: plan.id,
      title: g.title,
      description: g.description,
      thrust_area: g.thrustArea,
      uom: g.uom,
      target_value: g.target_value,
      weight: g.weight,
      primary_owner_id: userId,
      status: "Not Started"
    }))

    // 5. Bulk insert goals
    const { error: goalsError } = await supabase
      .from("goals")
      .insert(mappedGoals)

    if (goalsError) throw goalsError

    // 6. Notifications Integration
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('name, email, manager_id')
        .eq('id', userId)
        .single();
        
      if (userData && userData.manager_id) {
        const { data: managerData } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', userData.manager_id)
          .single();
          
        if (managerData) {
          const { sendTeamsNotification, sendEmailNotification } = await import('@/utils/notifications');
          const notificationData = {
            event: "SUBMITTED" as const,
            employeeName: userData.name,
            managerName: managerData.name,
            managerEmail: managerData.email,
            planId: plan.id,
            deepLink: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/manager/approvals`
          };
          
          // Fire and forget notifications
          if (process.env.TEAMS_WEBHOOK_URL) {
            sendTeamsNotification(process.env.TEAMS_WEBHOOK_URL, notificationData).catch(console.error);
          }
          if (process.env.RESEND_API_KEY) {
            sendEmailNotification(process.env.RESEND_API_KEY, notificationData).catch(console.error);
          }
        }
      }
    } catch (notifyError) {
      console.error("Failed to trigger notifications:", notifyError);
    }

    revalidatePath("/employee/dashboard")
    
    return { success: true }
    
  } catch (err: any) {
    console.error("Database error during submission:", err)
    return { success: false, error: err.message || "An unknown database error occurred." }
  }
}
