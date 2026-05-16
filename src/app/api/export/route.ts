import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  // Ensure Admin
  // For demo, we skip actual hard block or use dummy verification if auth is incomplete
  // In production, you would check auth.jwt().role === 'Admin'

  const { data: goals, error } = await supabase
    .from("goals")
    .select(`
      id, title, thrust_area, uom, target_value, weight, actual_value, calculated_score, status,
      goal_plans ( period, user_id, users ( name, email, departments ( name ) ) )
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Convert to CSV
  const header = ["Goal ID", "Employee", "Email", "Department", "Period", "Title", "Thrust Area", "UoM", "Target", "Weight", "Actual", "Score", "Status"].join(",");
  
  const rows = (goals as any[]).map(g => {
    const plan = g.goal_plans;
    const user = plan?.users;
    return [
      g.id,
      `"${user?.name || ''}"`,
      `"${user?.email || ''}"`,
      `"${user?.departments?.name || ''}"`,
      `"${plan?.period || ''}"`,
      `"${g.title.replace(/"/g, '""')}"`,
      `"${g.thrust_area}"`,
      g.uom,
      g.target_value,
      g.weight,
      g.actual_value,
      g.calculated_score,
      g.status
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="atomquest_goals_export.csv"',
    },
  });
}
