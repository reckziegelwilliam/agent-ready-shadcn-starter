"use client";

import { TaskList } from "@/components/tasks/task-list";

export default function ItemsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <TaskList />
    </div>
  );
}
