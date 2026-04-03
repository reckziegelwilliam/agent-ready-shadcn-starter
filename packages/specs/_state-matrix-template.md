# State Matrix: [Feature Name]

> Every feature must handle more than the happy path. This matrix documents every state a user can encounter, whether it is implemented, and how.

## Screens

### [Screen Name]

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Idle** | Initial load, no interaction | Clean default UI | Default render | |
| **Loading** | Async operation in flight | Spinner/skeleton, inputs disabled | | |
| **Empty** | No data to display | Empty state illustration + CTA | | |
| **Success** | Operation completed | Success feedback (toast, redirect, message) | | |
| **Error (validation)** | Invalid input | Inline field errors, red borders | | |
| **Error (server)** | API returns 4xx/5xx | Error banner or toast with message | | |
| **Error (network)** | No connectivity / timeout | Offline notice, retry button | | |
| **Permission denied** | 403 or unauthorized | Access denied message, redirect or contact link | | |
| **Partial data** | Some fields loaded, others pending | Skeleton for pending, real data for loaded | | |
| **Stale data** | Background refresh failed | Show last-known data with stale indicator | | |

## Notes

- Status column uses: `Done`, `Partial`, `Not implemented`, `N/A`
- Every `Not implemented` state is a known gap and should become a backlog item
- AI agents consistently miss: error (network), permission denied, partial data, and stale data states
- Use this matrix during review to verify the agent covered all states
