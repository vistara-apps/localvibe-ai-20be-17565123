
"use client";

import { ReactNode } from "react";
import { clsx } from "clsx";

interface AppShellProps {
  children: ReactNode;
  variant?: "default" | "glass";
  className?: string;
}

export function AppShell({ children, variant = "default", className }: AppShellProps) {
  return (
    <div className={clsx(
      "min-h-screen max-w-4xl mx-auto px-4",
      variant === "glass" ? "glass" : "bg-bg",
      className
    )}>
      {children}
    </div>
  );
}
