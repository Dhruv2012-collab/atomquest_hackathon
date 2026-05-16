import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  // Ensure Admin
  // For demo, we skip actual hard block or use dummy verification if auth is incomplete
  // In production, you would check auth.jwt().role === 'Admin'

  // MOCK DATA INJECTION (Bypassing offline Supabase)
  const mockGoals = [
    { id: "g1", title: "Ship Feature X", thrust_area: "Innovation", uom: "Numeric", target_value: 1, weight: 50, actual_value: 1, calculated_score: 100, status: "Completed", goal_plans: { period: "Q1 2026", users: { name: "Dave Dev", email: "dave@example.com", departments: { name: "Engineering" } } } },
    { id: "g2", title: "Fix 20 Bugs", thrust_area: "Operations", uom: "Numeric", target_value: 20, weight: 50, actual_value: 10, calculated_score: 50, status: "On Track", goal_plans: { period: "Q1 2026", users: { name: "Dave Dev", email: "dave@example.com", departments: { name: "Engineering" } } } },
    { id: "g3", title: "Improve Uptime", thrust_area: "Operations", uom: "%", target_value: 99.9, weight: 60, actual_value: 99.5, calculated_score: 80, status: "On Track", goal_plans: { period: "Q1 2026", users: { name: "Eve Engineer", email: "eve@example.com", departments: { name: "Engineering" } } } },
    { id: "g4", title: "Write Tests", thrust_area: "Innovation", uom: "%", target_value: 80, weight: 40, actual_value: 85, calculated_score: 106, status: "Completed", goal_plans: { period: "Q1 2026", users: { name: "Eve Engineer", email: "eve@example.com", departments: { name: "Engineering" } } } },
    { id: "g5", title: "Close 5 Enterprise Deals", thrust_area: "Revenue", uom: "Numeric", target_value: 5, weight: 100, actual_value: 2, calculated_score: 40, status: "On Track", goal_plans: { period: "Q1 2026", users: { name: "Alice Marketing", email: "alice@example.com", departments: { name: "Sales" } } } }
  ];

  const goals = mockGoals;

  // Convert to CSV
  const header = ["Goal ID", "Employee", "Email", "Department", "Period", "Title", "Thrust Area", "UoM", "Target", "Weight", "Actual", "Score", "Status"].join(",");
  
  const rows = goals.map(g => {
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
