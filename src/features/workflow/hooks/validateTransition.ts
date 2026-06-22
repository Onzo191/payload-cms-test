import type { CollectionBeforeChangeHook } from 'payload'

import { canPublish, hasRole } from '@/features/rbac/roles'
import { TRANSITIONS, WF, type WorkflowStatus } from '@/features/workflow/types'

export const validateTransition: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
  operation,
}) => {
  const user = req.user

  // Block non-editors from publishing directly via API
  if (data._status === 'published' && originalDoc?._status !== 'published') {
    if (!canPublish(user)) {
      throw new Error('Only editors can publish content.')
    }
  }

  // When editor publishes, auto-sync approvalStatus to 'published'
  if (data._status === 'published' && canPublish(user)) {
    data.approvalStatus = WF.PUBLISHED
    return data
  }

  // On create, approvalStatus defaults to 'draft' — no transition to validate
  if (operation === 'create') return data

  const from = (originalDoc?.approvalStatus ?? WF.DRAFT) as WorkflowStatus
  const to = data.approvalStatus as WorkflowStatus | undefined

  // No change
  if (!to || to === from) return data

  // Validate that this is a legal transition
  const transition = TRANSITIONS.find(([f, t]) => f === from && t === to)
  if (!transition) {
    throw new Error(`Invalid workflow transition: "${from}" → "${to}"`)
  }

  // Validate the user's role is allowed to make this transition
  const [, , allowedRoles] = transition
  if (!hasRole(user, ...allowedRoles)) {
    throw new Error(`Your role does not allow moving content from "${from}" to "${to}"`)
  }

  // Stamp audit fields based on which transition is happening
  if (to === WF.PENDING_REVIEW) {
    data.submittedBy = user?.id ?? null
  }

  if (to === WF.APPROVED || to === WF.CHANGES_REQUESTED) {
    data.reviewedBy = user?.id ?? null
    data.reviewedAt = new Date().toISOString()
  }

  return data
}
