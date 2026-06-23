// Shared presentation metadata for workflow statuses, used by the field control,
// the list cell and the dashboard widget. Logic (legal moves, roles) lives in
// '@/features/workflow/types'; this file is purely about how a status looks/reads.

import { WF, type WorkflowStatus } from '@/features/workflow/types'

export const STATUS_LABEL: Record<WorkflowStatus, string> = {
  [WF.DRAFT]: 'Draft',
  [WF.PENDING_REVIEW]: 'Pending review',
  [WF.CHANGES_REQUESTED]: 'Changes requested',
  [WF.APPROVED]: 'Approved',
  [WF.PUBLISHED]: 'Published',
  [WF.ARCHIVED]: 'Archived',
}

/** Modifier class from statusPill.scss (`.wf-pill--*`). */
export const STATUS_PILL_CLASS: Record<WorkflowStatus, string> = {
  [WF.DRAFT]: 'wf-pill--draft',
  [WF.PENDING_REVIEW]: 'wf-pill--pending',
  [WF.CHANGES_REQUESTED]: 'wf-pill--changes',
  [WF.APPROVED]: 'wf-pill--approved',
  [WF.PUBLISHED]: 'wf-pill--published',
  [WF.ARCHIVED]: 'wf-pill--archived',
}

/** The happy-path pipeline shown in the stepper. */
export const PIPELINE: WorkflowStatus[] = [
  WF.DRAFT,
  WF.PENDING_REVIEW,
  WF.APPROVED,
  WF.PUBLISHED,
]

/** One plain line describing each pipeline stage. */
export const STAGE_SUB: Record<WorkflowStatus, string> = {
  [WF.DRAFT]: 'Written by the author',
  [WF.PENDING_REVIEW]: 'Waiting on a reviewer',
  [WF.CHANGES_REQUESTED]: 'Sent back to the author',
  [WF.APPROVED]: 'Cleared to publish',
  [WF.PUBLISHED]: 'Live on the site',
  [WF.ARCHIVED]: 'Retired from the site',
}

/** Where a status sits on the pipeline. Off-path states map to their stage. */
export function pipelineIndex(status: WorkflowStatus): number {
  switch (status) {
    case WF.DRAFT:
      return 0
    case WF.PENDING_REVIEW:
    case WF.CHANGES_REQUESTED:
      return 1
    case WF.APPROVED:
      return 2
    case WF.PUBLISHED:
    case WF.ARCHIVED:
      return 3
    default:
      return 0
  }
}

/** Short, action-oriented label for a transition (from → to). */
export const TRANSITION_LABEL: Record<string, string> = {
  [`${WF.DRAFT}→${WF.PENDING_REVIEW}`]: 'Submit for review',
  [`${WF.PENDING_REVIEW}→${WF.APPROVED}`]: 'Approve',
  [`${WF.PENDING_REVIEW}→${WF.CHANGES_REQUESTED}`]: 'Request changes',
  [`${WF.CHANGES_REQUESTED}→${WF.PENDING_REVIEW}`]: 'Resubmit',
  [`${WF.CHANGES_REQUESTED}→${WF.APPROVED}`]: 'Approve anyway',
  [`${WF.APPROVED}→${WF.PUBLISHED}`]: 'Publish',
  [`${WF.APPROVED}→${WF.PENDING_REVIEW}`]: 'Return to review',
  [`${WF.PUBLISHED}→${WF.ARCHIVED}`]: 'Archive',
  [`${WF.ARCHIVED}→${WF.DRAFT}`]: 'Restore to draft',
}
