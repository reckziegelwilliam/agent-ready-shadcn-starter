"use client";

import { useCallback, useEffect, useState } from "react";

import { mockUsers } from "@/lib/mock-data/users";
import { columns } from "@/components/dashboard/columns";
import { DataTable } from "@/components/dashboard/data-table";
import { DataTableError } from "@/components/dashboard/data-table-error";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      // Simulate a 10% chance of server error to demonstrate error UI
      if (Math.random() < 0.1) {
        setError("Server returned 500: Internal Server Error. Please try again later.");
        setLoading(false);
        return;
      }
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const cleanup = loadData();
    return cleanup;
  }, [loadData]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage your team members and their account permissions.
        </p>
      </div>
      {error ? (
        <DataTableError message={error} onRetry={loadData} />
      ) : (
        <DataTable
          columns={columns}
          data={mockUsers}
          loading={loading}
          emptyMessage="No users found."
          emptyActionLabel="Add first user"
          onEmptyAction={() => {}}
        />
      )}
    </div>
  );
}
