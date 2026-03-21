import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "provenance";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-label transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "bg-primary/10 text-primary": variant === "default",
          "bg-surface-container-high text-on-surface": variant === "secondary",
          "text-on-surface border border-outline-variant": variant === "outline",
          "bg-gradient-to-r from-[#e6f4f1] to-[#f0f9f6] text-primary border border-primary/20": variant === "provenance",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
