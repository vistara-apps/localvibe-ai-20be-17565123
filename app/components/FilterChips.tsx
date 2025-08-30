
"use client";

import { VibeFilter } from "../types";
import { clsx } from "clsx";

interface FilterChipsProps {
  filters: VibeFilter[];
  onFilterToggle: (filterId: string) => void;
  variant?: "selectable";
}

export function FilterChips({ filters, onFilterToggle, variant = "selectable" }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterToggle(filter.id)}
          className={clsx(
            "px-3 py-2 rounded-md text-sm font-medium transition-all duration-150",
            "flex items-center gap-2",
            filter.active 
              ? "bg-accent text-white shadow-lg" 
              : "bg-surface text-textSecondary hover:bg-surface/80 hover:text-textPrimary"
          )}
        >
          <span>{filter.emoji}</span>
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  );
}
