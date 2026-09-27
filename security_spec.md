# Security Specification for AgentOS

## 1. Data Invariants & Zero-Trust ABAC
1. **Tenant Isolation Invariant**: All user data, agent configurations, instructions, memories, tasks, reports, knowledge, and approvals reside strictly within `/users/{userId}/...` subtrees.
2. **Access Control**: A user can read, list, create, update, or delete ONLY documents where `request.auth.uid == userId`. Cross-tenant reading or writing is mathematically impossible.
3. **No Unauthenticated Access**: Unauthenticated access (`request.auth == null`) is denied globally via default catch-all deny rule.
4. **Strict ID Guarding**: All document IDs must satisfy `isValidId(id)` (`id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
5. **No Client Role Escalation**: Client cannot elevate permissions or access another user's tenant under any circumstances.
6. **Immutable Fields**: `userId` in all payloads must match `request.auth.uid` on write and cannot be changed on update.

## 2. The "Dirty Dozen" Threat Payloads (All MUST return PERMISSION_DENIED)
1. **Cross-Tenant Task Read**: User `alice` attempts `get /users/bob/tasks/task_1`.
2. **Cross-Tenant Task Create**: User `alice` attempts `set /users/bob/tasks/task_1` with `{ userId: 'bob' }`.
3. **Spoofed User ID Write**: User `alice` writes to `/users/alice/tasks/task_1` with `{ userId: 'bob' }`.
4. **Path ID Poisoning**: User `alice` creates `/users/alice/tasks/../../root` or a 2KB junk string ID.
5. **Unauthenticated Read**: Anonymous/unauthenticated user attempts to list `/users/alice/tasks`.
6. **Cross-Tenant Knowledge Extraction**: User `alice` queries `/users/bob/knowledge`.
7. **Cross-Tenant Instructions Tampering**: User `alice` updates `/users/bob/instructions/inst_1`.
8. **Shadow Field Injection**: User `alice` writes `{ isSuperAdmin: true, ...taskData }` to a task.
9. **Cross-Tenant Approval Manipulation**: User `alice` updates `/users/bob/approvals/app_1` to approve a payment.
10. **Report Tampering**: User `alice` modifies or deletes `/users/bob/reports/rep_1`.
11. **PII Blanket Scrape**: Unauthenticated or unauthorized user performs collectionGroup list on `tasks` or `profile`.
12. **Zombie Update**: User `alice` tries to mutate an immutable field like `createdAt` or `taskId` on a completed task report.
