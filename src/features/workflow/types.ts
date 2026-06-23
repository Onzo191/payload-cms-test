import type { Role } from '@/features/rbac/roles'

export const WF = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  CHANGES_REQUESTED: 'changes_requested',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

export type WorkflowStatus = (typeof WF)[keyof typeof WF]

// [from, to, allowedRoles[]]
//
// These are the *approval-pipeline* moves, applied via ordinary (draft) saves
// from the sidebar stepper. Publishing and unpublishing are intentionally NOT
// here — they ride on Payload's native Publish / Unpublish buttons and are
// gated in `validateTransition` (only editors+, who may also publish urgently
// straight from any stage). `WF.PUBLISHED` / `WF.ARCHIVED` therefore have no
// stepper transitions; they are reached/left through the publish state.
export const TRANSITIONS: [WorkflowStatus, WorkflowStatus, Role[]][] = [
  [WF.DRAFT,             WF.PENDING_REVIEW,    ['super-admin', 'admin', 'editor', 'author']],
  [WF.PENDING_REVIEW,    WF.APPROVED,           ['super-admin', 'admin', 'editor', 'reviewer']],
  [WF.PENDING_REVIEW,    WF.CHANGES_REQUESTED,  ['super-admin', 'admin', 'editor', 'reviewer']],
  [WF.CHANGES_REQUESTED, WF.PENDING_REVIEW,     ['super-admin', 'admin', 'editor', 'author']],
  // Editor/reviewer can directly approve without requiring author to resubmit
  [WF.CHANGES_REQUESTED, WF.APPROVED,           ['super-admin', 'admin', 'editor', 'reviewer']],
  [WF.APPROVED,          WF.PENDING_REVIEW,     ['super-admin', 'admin', 'editor']],
]
