export function createMockSupabaseClient() {
  const getMockData = (tableName: string) => {
    if (tableName === "users") {
      return [
        { id: "00000000-0000-0000-0000-000000000101", name: "Dave Dev", email: "dave@company.com", role: "Employee", manager_id: "00000000-0000-0000-0000-000000000102" },
        { id: "00000000-0000-0000-0000-000000000102", name: "Sarah Manager", email: "sarah.manager@company.com", role: "Manager" },
        { id: "00000000-0000-0000-0000-000000000103", name: "Admin User", email: "admin@company.com", role: "Admin" }
      ];
    }
    if (tableName === "goal_plans") {
      return [
        {
          id: "mock-plan-1",
          user_id: "00000000-0000-0000-0000-000000000101",
          period: "Q1 2026",
          status: "Approved",
          manager_comment: "Outstanding execution focus. Keep scaling core automation.",
          created_at: new Date().toISOString(),
          users: { name: "Dave Dev", email: "dave@company.com", department: "Engineering" },
          goals: [
            {
              id: "g1",
              plan_id: "mock-plan-1",
              title: "Scale Core Infrastructure",
              description: "Deploy Next.js server components with maximum resilience and zero downtime.",
              thrust_area: "Infrastructure",
              uom: "Numeric (Min)",
              target_value: 100,
              actual_value: 85,
              weight: 30,
              status: "On Track"
            },
            {
              id: "g2",
              plan_id: "mock-plan-1",
              title: "Achieve 99.9% Uptime",
              description: "Improve uptime across the core platform components.",
              thrust_area: "Operations",
              uom: "% (Min)",
              target_value: 99.9,
              actual_value: 99.5,
              weight: 30,
              status: "On Track"
            },
            {
              id: "g3",
              plan_id: "mock-plan-1",
              title: "Deliver Hackathon MVP",
              description: "Develop the dashboard system for employee, manager, and admin portals.",
              thrust_area: "Product",
              uom: "Zero-based",
              target_value: 0,
              actual_value: 0,
              weight: 40,
              status: "Completed"
            }
          ]
        }
      ];
    }
    if (tableName === "goals") {
      return [
        {
          id: "g1",
          plan_id: "mock-plan-1",
          title: "Scale Core Infrastructure",
          description: "Deploy Next.js server components with maximum resilience and zero downtime.",
          thrust_area: "Infrastructure",
          uom: "Numeric (Min)",
          target_value: 100,
          actual_value: 85,
          weight: 30,
          status: "On Track"
        },
        {
          id: "g2",
          plan_id: "mock-plan-1",
          title: "Achieve 99.9% Uptime",
          description: "Improve uptime across the core platform components.",
          thrust_area: "Operations",
          uom: "% (Min)",
          target_value: 99.9,
          actual_value: 99.5,
          weight: 30,
          status: "On Track"
        },
        {
          id: "g3",
          plan_id: "mock-plan-1",
          title: "Deliver Hackathon MVP",
          description: "Develop the dashboard system for employee, manager, and admin portals.",
          thrust_area: "Product",
          uom: "Zero-based",
          target_value: 0,
          actual_value: 0,
          weight: 40,
          status: "Completed"
        }
      ];
    }
    return [];
  };

  class MockQueryBuilder {
    private tableName: string;

    constructor(tableName: string) {
      this.tableName = tableName;
    }

    select(columns?: string) {
      return this;
    }

    eq(column: string, value: any) {
      return this;
    }

    neq(column: string, value: any) {
      return this;
    }

    order(column: string, options?: any) {
      return this;
    }

    single() {
      const data = getMockData(this.tableName);
      return Promise.resolve({ data: Array.isArray(data) ? data[0] : data, error: null });
    }

    then(resolve: any) {
      const data = getMockData(this.tableName);
      resolve({ data, error: null });
      return this;
    }
  }

  class MockMutationBuilder {
    private tableName: string;

    constructor(tableName: string) {
      this.tableName = tableName;
    }

    eq(column: string, value: any) {
      return this;
    }

    neq(column: string, value: any) {
      return this;
    }

    select(columns?: string) {
      return this;
    }

    single() {
      return Promise.resolve({ data: { id: "mock-id-123" }, error: null });
    }

    then(resolve: any) {
      resolve({ data: [{ id: "mock-id-123" }], error: null });
      return this;
    }
  }

  return {
    from: (table: string) => {
      return {
        select: (columns?: string) => new MockQueryBuilder(table),
        update: (values: any) => new MockMutationBuilder(table),
        insert: (values: any) => new MockMutationBuilder(table),
        delete: () => new MockMutationBuilder(table)
      };
    },
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: "00000000-0000-0000-0000-000000000101" } }, error: null }),
      getSession: () => Promise.resolve({ data: { session: { user: { id: "00000000-0000-0000-0000-000000000101" } } }, error: null }),
      signOut: () => Promise.resolve({ error: null })
    }
  };
}
