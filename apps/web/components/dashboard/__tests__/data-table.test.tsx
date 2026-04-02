import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../data-table';

interface TestRow {
  id: string;
  name: string;
  email: string;
}

const testColumns: ColumnDef<TestRow>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
];

const testData: TestRow[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
];

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={testColumns} data={testData} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders row data', () => {
    render(<DataTable columns={testColumns} data={testData} />);
    // getAllByText because the table may render the text in multiple elements
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
    expect(screen.getAllByText('bob@example.com').length).toBeGreaterThan(0);
  });

  it('shows empty state when data is empty', () => {
    render(<DataTable columns={testColumns} data={[]} />);
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it('shows custom empty message', () => {
    render(
      <DataTable
        columns={testColumns}
        data={[]}
        emptyMessage="No results match your search."
      />,
    );
    expect(screen.getByText('No results match your search.')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading is true', () => {
    const { container } = render(
      <DataTable columns={testColumns} data={[]} loading />,
    );
    // DataTableLoading renders Skeleton components which use divs with animate-pulse
    const skeletons = container.querySelectorAll('[class*="animate-pulse"], [data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
