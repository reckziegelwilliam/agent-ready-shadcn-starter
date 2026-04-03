"use client";

import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { ChevronDown, ChevronUp, Check, X, Minus } from "lucide-react";
import type { CategoryScore } from "@/lib/quality-data";

interface CategoryDetailProps {
  category: CategoryScore;
}

export function CategoryDetail({ category }: CategoryDetailProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/50"
      >
        <span>
          {category.name}{" "}
          <span className="font-mono text-muted-foreground">
            ({category.passed}/{category.total})
          </span>
        </span>
        {open ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="border-t px-4 py-2">
          <ul className="grid gap-1">
            {category.items.map((item, i) => (
              <li key={i} className="flex items-center gap-2 py-1 text-sm">
                {item.status === "pass" ? (
                  <Check className="size-4 shrink-0 text-green-600 dark:text-green-400" />
                ) : item.status === "fail" ? (
                  <X className="size-4 shrink-0 text-red-500 dark:text-red-400" />
                ) : (
                  <Minus className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    item.status === "fail" && "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
