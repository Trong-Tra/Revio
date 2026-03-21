import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full font-label font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-gradient-to-br from-primary to-primary-container text-white shadow-ambient hover:shadow-ambient-hover hover:scale-[1.02]":
              variant === "default",
            "bg-surface-container-high text-on-surface hover:bg-surface-container":
              variant === "secondary",
            "border border-outline-variant bg-transparent hover:bg-surface-container-low text-on-surface":
              variant === "outline",
            "hover:bg-surface-container-low text-on-surface": variant === "ghost",
            "h-10 px-6 py-2 text-sm": size === "default",
            "h-8 rounded-full px-4 text-xs": size === "sm",
            "h-12 rounded-full px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
