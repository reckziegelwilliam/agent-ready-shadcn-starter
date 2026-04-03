export type Grade = "A" | "B" | "C" | "D";

export interface StateMatrix {
  loading: boolean;
  empty: boolean;
  error: boolean;
  success: boolean;
  validationFailure: boolean;
  serverFailure: boolean;
  networkError: boolean;
  permissionDenied: boolean;
}

export interface CategoryItem {
  label: string;
  status: "pass" | "fail" | "na";
}

export interface CategoryScore {
  name: string;
  passed: number;
  total: number;
  items: CategoryItem[];
}

export interface ExampleQuality {
  slug: string;
  title: string;
  route: string;
  grade: Grade;
  testCount: number;
  reproducible: boolean;
  stateMatrix: StateMatrix;
  categories: CategoryScore[];
}

export const qualityData: ExampleQuality[] = [
  {
    slug: "auth-flow",
    title: "Auth Flow",
    route: "/login, /signup, /forgot-password",
    grade: "A",
    testCount: 12,
    reproducible: true,
    stateMatrix: {
      loading: true,
      empty: false,
      error: true,
      success: true,
      validationFailure: true,
      serverFailure: true,
      networkError: false,
      permissionDenied: false,
    },
    categories: [
      {
        name: "Accessibility",
        passed: 8,
        total: 10,
        items: [
          { label: "aria-describedby on error fields", status: "pass" },
          { label: "Error state reset on navigation", status: "pass" },
          { label: "Icon buttons have aria-label", status: "pass" },
          { label: "Focus moves to first error on submit", status: "pass" },
          { label: "Password toggle accessible", status: "pass" },
          { label: "Form landmark role", status: "pass" },
          { label: "Color contrast in error states", status: "pass" },
          { label: "Loading state announced to AT", status: "pass" },
          { label: "Skip-to-content link", status: "fail" },
          { label: "High contrast mode support", status: "fail" },
        ],
      },
      {
        name: "Type Safety",
        passed: 9,
        total: 10,
        items: [
          { label: "Zod schema with zodResolver", status: "pass" },
          { label: "Inferred form types via z.infer", status: "pass" },
          { label: "Typed dispatch and selector hooks", status: "pass" },
          { label: "Async thunk properly typed", status: "pass" },
          { label: "rejectWithValue typed", status: "pass" },
          { label: "No implicit any", status: "pass" },
          { label: "Strict null checks", status: "pass" },
          { label: "Component props typed", status: "pass" },
          { label: "API response types", status: "pass" },
          { label: "Discriminated union for auth status", status: "fail" },
        ],
      },
      {
        name: "State Coverage",
        passed: 5,
        total: 8,
        items: [
          { label: "Loading state", status: "pass" },
          { label: "Success state", status: "pass" },
          { label: "Validation error state", status: "pass" },
          { label: "Server error state", status: "pass" },
          { label: "Empty/initial state", status: "pass" },
          { label: "Network error state", status: "fail" },
          { label: "Rate limiting state", status: "fail" },
          { label: "Resend/retry flow", status: "fail" },
        ],
      },
      {
        name: "Consistency",
        passed: 9,
        total: 10,
        items: [
          { label: "Follows project directory structure", status: "pass" },
          { label: "Uses shared UI components", status: "pass" },
          { label: "Consistent naming conventions", status: "pass" },
          { label: "Follows Redux slice pattern", status: "pass" },
          { label: "Uses project form pattern", status: "pass" },
          { label: "Error handling matches project style", status: "pass" },
          { label: "Uses cn() for conditional classes", status: "pass" },
          { label: "Semantic token usage", status: "pass" },
          { label: "Follows file export pattern", status: "pass" },
          { label: "Uses project toast pattern", status: "fail" },
        ],
      },
    ],
  },
  {
    slug: "dashboard-table",
    title: "Dashboard Table",
    route: "/dashboard",
    grade: "A",
    testCount: 5,
    reproducible: true,
    stateMatrix: {
      loading: true,
      empty: true,
      error: false,
      success: true,
      validationFailure: false,
      serverFailure: false,
      networkError: false,
      permissionDenied: false,
    },
    categories: [
      {
        name: "Accessibility",
        passed: 7,
        total: 10,
        items: [
          { label: "aria-sort on sortable columns", status: "pass" },
          { label: "Row-specific checkbox labels", status: "pass" },
          { label: "Empty state announced to AT", status: "pass" },
          { label: "Semantic table elements", status: "pass" },
          { label: "Keyboard navigation", status: "pass" },
          { label: "Focus management on page change", status: "pass" },
          { label: "Sort direction announced", status: "pass" },
          { label: "Bulk action confirmation dialog", status: "fail" },
          { label: "Filter change announced to AT", status: "fail" },
          { label: "Pagination state announced", status: "fail" },
        ],
      },
      {
        name: "Type Safety",
        passed: 8,
        total: 10,
        items: [
          { label: "Column definitions typed", status: "pass" },
          { label: "Generic DataTable component", status: "pass" },
          { label: "Typed Redux slice", status: "pass" },
          { label: "Query parameter types", status: "pass" },
          { label: "Mock data typed", status: "pass" },
          { label: "Cell renderer types", status: "pass" },
          { label: "Row selection typed", status: "pass" },
          { label: "Pagination state typed", status: "pass" },
          { label: "Role badge variant cast-free", status: "fail" },
          { label: "Status config cast-free", status: "fail" },
        ],
      },
      {
        name: "State Coverage",
        passed: 5,
        total: 10,
        items: [
          { label: "Loading state", status: "pass" },
          { label: "Empty (no data) state", status: "pass" },
          { label: "Empty (no filter results) state", status: "pass" },
          { label: "Success with data", status: "pass" },
          { label: "Pagination state", status: "pass" },
          { label: "Server error state", status: "fail" },
          { label: "Network error state", status: "fail" },
          { label: "Stale data during refetch", status: "fail" },
          { label: "Bulk action in progress", status: "fail" },
          { label: "Permission denied state", status: "fail" },
        ],
      },
      {
        name: "Consistency",
        passed: 9,
        total: 10,
        items: [
          { label: "Follows project directory structure", status: "pass" },
          { label: "Uses shared UI components", status: "pass" },
          { label: "Consistent naming conventions", status: "pass" },
          { label: "Follows Redux slice pattern", status: "pass" },
          { label: "Uses TanStack Table pattern", status: "pass" },
          { label: "Error handling matches project style", status: "pass" },
          { label: "Uses cn() for conditional classes", status: "pass" },
          { label: "Semantic token usage", status: "pass" },
          { label: "Follows file export pattern", status: "pass" },
          { label: "Uses project loading pattern", status: "fail" },
        ],
      },
    ],
  },
];
