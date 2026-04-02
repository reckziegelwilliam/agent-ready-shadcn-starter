"use client";

import { useEffect, useState } from "react";

import { mockUsers } from "@/lib/mock-data/users";
import { columns } from "@/components/dashboard/columns";
import { DataTable } from "@/components/dashboard/data-table";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage your team members and their account permissions.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={mockUsers}
        loading={loading}
        emptyMessage="No users found."
        emptyActionLabel="Add first user"
        onEmptyAction={() => {}}
      />
    </div>
  );
}
