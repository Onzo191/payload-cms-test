import type { CollectionBeforeChangeHook } from 'payload'

import { canPublish, hasRole } from '@/features/rbac/roles'
import { TRANSITIONS, WF, type WorkflowStatus } from '@/features/workflow/types'

/**
 * Keeps the approval workflow and Payload's native publish state (`_status`) in
 * lockstep, and enforces who may do what.
 *
 * Design: publishing/unpublishing always rides on Payload's native Publish /
 * Unpublish buttons (a real, non-draft save — the only reliable way to flip
 * `_status`). The approval pipeline (draft → pending_review → approved …) is
 * driven by the sidebar stepper via ordinary draft saves. This hook is the gate
 * that ties the two together so `approvalStatus` and `_status` never drift.
 */
export const validateTransition: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
  operation,
}) => {
  const user = req.user

  const wasPublished = originalDoc?._status === 'published'
  const willPublish = data._status === 'published'

  // --- Publish (native Publish button) ------------------------------------
  // Only editors+ may publish. They may publish straight from any stage when
  // it's urgent — approval is the norm, not a hard prerequisite for publishers.
  if (willPublish && !wasPublished) {
    if (!canPublish(user)) {
      throw new Error('Only editors and above can publish content.')
    }
    data.approvalStatus = WF.PUBLISHED
    return data
  }

  // --- Unpublish (native Unpublish button) --------------------------------
  // Taking content off the site returns it to the start of the pipeline so the
  // workflow status keeps reflecting reality.
  if (wasPublished && !willPublish) {
    if (!canPublish(user)) {
      throw new Error('Only editors and above can unpublish content.')
    }
    data.approvalStatus = WF.DRAFT
    return data
  }

  // While a doc stays published, ignore stray approvalStatus edits — its status
  // is owned by the publish state, not the stepper.
  if (willPublish && wasPublished) {
    data.approvalStatus = WF.PUBLISHED
    return data
  }

  // On create (as a draft) there is no prior state to transition from.
  if (operation === 'create') return data

  // --- Approval-pipeline transitions (draft saves) ------------------------
  const from = (originalDoc?.approvalStatus ?? WF.DRAFT) as WorkflowStatus
  const to = data.approvalStatus as WorkflowStatus | undefined

  // No status change in this save — nothing to validate.
  if (!to || to === from) return data

  // The move must be a declared, legal transition.
  const transition = TRANSITIONS.find(([f, t]) => f === from && t === to)
  if (!transition) {
    throw new Error(`Invalid workflow transition: "${from}" → "${to}".`)
  }

  // ...and the user's role must be allowed to make it.
  const [, , allowedRoles] = transition
  if (!hasRole(user, ...allowedRoles)) {
    throw new Error(`Your role is not allowed to move content from "${from}" to "${to}".`)
  }

  // Stamp audit fields for the relevant transitions.
  if (to === WF.PENDING_REVIEW) {
    data.submittedBy = user?.id ?? null
  }
  if (to === WF.APPROVED || to === WF.CHANGES_REQUESTED) {
    data.reviewedBy = user?.id ?? null
    data.reviewedAt = new Date().toISOString()
  }

  return data
}
