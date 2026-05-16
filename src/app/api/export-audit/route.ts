import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // MOCK DATA INJECTION for Audit Export
  const mockEvents = [
    { id: "e1", timestamp: "2026-05-01T10:00:00Z", actor: "Dave Dev", role: "Employee", action: "submitted goal sheet", subject: "Q1 2026 Goal Plan", detail: "2 goals · Total weight locked at 100%" },
    { id: "e2", timestamp: "2026-05-02T14:30:00Z", actor: "Manager", role: "Manager", action: "approved goal plan", subject: "Eve Engineer's Q1 2026 Plan", detail: "Plan moved to active check-in phase" },
    { id: "e3", timestamp: "2026-05-04T09:15:00Z", actor: "Manager", role: "Manager", action: "returned plan for rework", subject: "Bob Smith's Q1 2026 Plan", detail: "Employee must revise and resubmit" },
    { id: "e4", timestamp: "2026-05-05T11:00:00Z", actor: "Alice Admin", role: "Admin", action: "unlocked cycle", subject: "Q1 2026 Window", detail: "Force-opened for late submissions" }
  ];

  // Convert to CSV
  const header = ["Event ID", "Timestamp", "Actor", "Role", "Action", "Subject", "Details"].join(",");
  
  const rows = mockEvents.map(e => {
    return [
      e.id,
      `"${e.timestamp}"`,
      `"${e.actor}"`,
      `"${e.role}"`,
      `"${e.action}"`,
      `"${e.subject}"`,
      `"${e.detail}"`
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="atomquest_audit_trail_export.csv"',
    },
  });
}
