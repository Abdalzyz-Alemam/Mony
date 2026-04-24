# Security Specification - FinFlex

## Data Invariants
1. **User Identity Isolation**: A user can ONLY access documents under `/users/{auth.uid}`.
2. **Schema Integrity**: Every write must adhere to the defined entity structure in `firebase-blueprint.json`.
3. **Immutable Ownership**: `userId` (implicit in path) and `createdAt` cannot be changed after creation.
4. **Balance Consistency**: Balances and split percentages must be numeric and within logical bounds (e.g., percentages 0-100).
5. **Categorical Constraints**: Expenses must use valid accounts (`obligations`, `personal`, `investment`).

## The "Dirty Dozen" Payloads (Deny Test Cases)

1. **Identity Spoofing**: Attempt to create a user profile for a different UID.
   - Path: `/users/attacker_id`
   - Payload: `{ "balanceObligations": 1000 }`
2. **Ghost Field Injection**: Attempt to add `isAdmin: true` to a user profile.
   - Path: `/users/{userId}`
   - Payload: `{ ..., "isAdmin": true }`
3. **Negative Balance**: Attempt to set a negative amount for an expense.
   - Path: `/users/{userId}/expenses/{id}`
   - Payload: `{ "amount": -50, ... }`
4. **Invalid Account Type**: Attempt to use an account named `savings`.
   - Path: `/users/{userId}/expenses/{id}`
   - Payload: `{ "account": "savings", ... }`
5. **Future Dating**: Attempt to set `createdAt` to a future timestamp (manual override).
6. **Immutable Field Change**: Attempt to change `createdAt` on an existing expense.
7. **Cross-User Leakage**: User A attempts to list User B's expenses.
8. **Resource Exhaustion**: Attempt to send a 1MB string in the `note` field of an expense.
9. **Unauthenticated Write**: Attempt to add income without being logged in.
10. **Unverified Email Access**: Attempt to access data with an unverified email (if restricted).
11. **Orphaned Record**: Attempt to create an expense without a root user document existing (if relational sync enforced).
12. **State Jumper**: Attempt to update a "terminal" status (not applicable yet but good practice).

## Test Runner (Draft Rules Test)
See `firestore.rules.test.ts` (To be implemented).
