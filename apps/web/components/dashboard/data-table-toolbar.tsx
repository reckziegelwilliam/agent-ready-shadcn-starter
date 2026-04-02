"use client";

import { useEffect, useState } from "react";
import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const [inputValue, setInputValue] = useState(
    (table.getState().globalFilter as string) ?? ""
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      table.setGlobalFilter(inputValue);
    }, 300);
    return () => clearTimeout(timeout);
  }, [inputValue, table]);

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const isFiltered = inputValue.length > 0;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Input
            placeholder="Search users..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pr-8"
          />
          {isFiltered && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="absolute top-1/2 right-1.5 -translate-y-1/2"
              onClick={() => {
                setInputValue("");
                table.setGlobalFilter("");
              }}
              aria-label="Clear filter"
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      </div>
      {selectedCount > 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedCount} row{selectedCount !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}
