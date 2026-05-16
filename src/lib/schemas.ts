import * as z from "zod";

export const GoalSheetSchema = z
  .object({
    goals: z
      .array(
        z.object({
          id: z.string().optional(),
          is_shared: z.boolean().optional(),
          title: z.string().min(3, "Title must be at least 3 characters"),
          description: z.string().optional(),
          thrustArea: z.string().min(2, "Thrust Area is required"),
          uom: z.enum(["Numeric (Min)", "Numeric (Max)", "% (Min)", "% (Max)", "Timeline", "Zero-based"], {
            message: "Please select a Unit of Measurement",
          } as any),
          target_value: z.preprocess((val) => Number(val), z.number().positive("Target must be a positive number")),
          weight: z.preprocess(
            (val) => Number(val),
            z.number()
              .min(10, "Each goal must be at least 10% weightage")
              .max(100, "Weight cannot exceed 100%")
          ),
          actual_value: z.number().optional(),
          status: z.string().optional()
        })
      )
      .min(1, "You must add at least one goal")
      .max(8, "You cannot exceed a maximum of 8 goals"),
  })
  .refine(
    (data) => {
      const totalWeight = data.goals.reduce((sum, g) => sum + (g.weight || 0), 0);
      return totalWeight === 100;
    },
    {
      message: "The total cumulative weightage across all goals must equal exactly 100%",
      path: ["goals"], // Attach the error to the goals array
    }
  );

export type GoalSheetFormValues = z.infer<typeof GoalSheetSchema>;
