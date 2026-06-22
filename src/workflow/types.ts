import type { Role } from '@/access/roles'

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
export const TRANSITIONS: [WorkflowStatus, WorkflowStatus, Role[]][] = [
  [WF.DRAFT,             WF.PENDING_REVIEW,    ['super-admin', 'admin', 'editor', 'author']],
  [WF.PENDING_REVIEW,    WF.APPROVED,           ['super-admin', 'admin', 'editor', 'reviewer']],
  [WF.PENDING_REVIEW,    WF.CHANGES_REQUESTED,  ['super-admin', 'admin', 'editor', 'reviewer']],
  [WF.CHANGES_REQUESTED, WF.PENDING_REVIEW,     ['super-admin', 'admin', 'editor', 'author']],
  // Editor/reviewer can directly approve without requiring author to resubmit
  [WF.CHANGES_REQUESTED, WF.APPROVED,           ['super-admin', 'admin', 'editor', 'reviewer']],
  [WF.APPROVED,          WF.PUBLISHED,          ['super-admin', 'admin', 'editor']],
  [WF.APPROVED,          WF.PENDING_REVIEW,     ['super-admin', 'admin', 'editor']],
  [WF.PUBLISHED,         WF.ARCHIVED,           ['super-admin', 'admin', 'editor']],
  [WF.ARCHIVED,          WF.DRAFT,              ['super-admin', 'admin', 'editor']],
]
