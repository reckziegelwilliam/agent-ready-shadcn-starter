import type { ComparisonExample } from "./types";

export const dashboardTableComparison: ComparisonExample = {
  slug: "dashboard-table",
  title: "Dashboard Table",
  description:
    "Data table with sorting, filtering, and pagination. AI output used client-side sorting, cleared data during reloads, and missed table accessibility attributes. The production version fixes all eight issues found in review.",
  issueCount: 8,
  files: [
    {
      filename: "data-table.tsx",
      aiGenerated: `export function DataTable<TData, TValue>({
  columns, data, loading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  if (loading) {
    return <DataTableLoading columnCount={columns.length} />;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}`,
      production: `export function DataTable<TData, TValue>({
  columns, data, loading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  return (
    <div className={cn("space-y-4", loading && "opacity-60")}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}`,
      aiAnnotations: [
        {
          lineStart: 14,
          lineEnd: 14,
          type: "fix",
          title: "Client-side sorting with getSortedRowModel()",
          description:
            "The AI used TanStack Table's built-in client-side sorting. This only sorts the current page of data, not the full server-side dataset. The spec required server-side sorting via API calls.",
        },
        {
          lineStart: 19,
          lineEnd: 21,
          type: "fix",
          title: "Data cleared during loading",
          description:
            'When loading is true, the entire table is replaced with a skeleton. This causes a jarring flash of "no data" between page changes. Stale data should be preserved at reduced opacity.',
        },
      ],
      prodAnnotations: [
        {
          lineStart: 15,
          lineEnd: 15,
          type: "fix",
          title: "manualSorting: true replaces getSortedRowModel()",
          description:
            "Server-side sorting is enabled by setting manualSorting: true and removing getSortedRowModel(). Sort changes now trigger an API re-fetch with updated sort parameters.",
        },
        {
          lineStart: 20,
          lineEnd: 20,
          type: "fix",
          title: "Stale data preserved at reduced opacity",
          description:
            "Instead of replacing the table with a skeleton, the loading state applies opacity-60 to the existing data. Users see the previous rows while new data loads, preventing layout shift.",
        },
      ],
    },
    {
      filename: "columns.tsx",
      aiGenerated: `export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting()}
      >
        Name
        <ArrowUpDown className="ml-1 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <Badge variant="outline">{status}</Badge>;
    },
  },
];`,
      production: `export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label={\`Select row for \${row.getValue("name")}\`}
      />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting()}
          aria-sort={
            sorted === "asc" ? "ascending"
            : sorted === "desc" ? "descending"
            : "none"
          }
        >
          Name
          <ArrowUpDown className="ml-1 size-3.5" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as User["status"];
      const config = statusConfig[status];
      return (
        <Badge variant="outline" className={config.className}>
          {config.label}
        </Badge>
      );
    },
  },
];`,
      aiAnnotations: [
        {
          lineStart: 15,
          lineEnd: 15,
          type: "fix",
          title: 'Generic "Select row" aria-label',
          description:
            'Every row checkbox has the same "Select row" label. Screen readers cannot distinguish which row a checkbox belongs to. The label needs the row\'s name or identifier.',
        },
        {
          lineStart: 21,
          lineEnd: 29,
          type: "fix",
          title: "No aria-sort on sortable column headers",
          description:
            "The sort button shows a visual icon but has no aria-sort attribute. Screen reader users cannot determine the current sort direction of a column.",
        },
        {
          lineStart: 37,
          lineEnd: 40,
          type: "improvement",
          title: "Status badge uses raw string cast",
          description:
            'The status value is cast to a plain string and rendered directly. No lookup for styled variants or human-readable labels. The production version uses a typed config map.',
        },
      ],
      prodAnnotations: [
        {
          lineStart: 16,
          lineEnd: 16,
          type: "fix",
          title: "Row-specific aria-label with user name",
          description:
            'Each checkbox label includes the row\'s name, e.g., "Select row for Jane Doe". Screen readers can now distinguish between rows.',
        },
        {
          lineStart: 29,
          lineEnd: 33,
          type: "fix",
          title: "aria-sort reflects current sort state",
          description:
            'The sort button includes aria-sort="ascending", "descending", or "none" based on the column\'s current sort direction. Screen readers announce the sort state.',
        },
        {
          lineStart: 48,
          lineEnd: 53,
          type: "improvement",
          title: "Typed status config with styled variants",
          description:
            "Status uses a typed config map that provides both a human-readable label and scoped CSS classes for each status value, replacing the raw string cast.",
        },
      ],
    },
  ],
};
