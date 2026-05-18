"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type React from "react";

const badgeVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-sm border border-transparent font-medium outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-64 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: { size: "default", variant: "default" },
    variants: {
      size: { default: "h-5.5 min-w-5.5 px-[calc(--spacing(1)-1px)] text-sm sm:h-4.5 sm:min-w-4.5 sm:text-xs" },
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border-input bg-background text-foreground dark:bg-input/32",
      },
    },
  },
);

export interface BadgeProps extends useRender.ComponentProps<"span"> {
  variant?: VariantProps<typeof badgeVariants>["variant"];
  size?: VariantProps<typeof badgeVariants>["size"];
}

export function Badge({ className, variant, size, render, ...props }: BadgeProps): React.ReactElement {
  return useRender({ defaultTagName: "span", props: mergeProps<"span">({ className: cn(badgeVariants({ className, size, variant })), "data-slot": "badge" } as any, props), render });
}
