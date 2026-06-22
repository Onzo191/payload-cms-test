import type { Access } from 'payload'

import { canPublish, canReview, hasRole, ROLES } from '@/access/roles'

/** Authors and above can submit content for review */
export const canSubmitAccess: Access = ({ req: { user } }) =>
  hasRole(user, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR, ROLES.AUTHOR)

/** Reviewers and above can approve or request changes */
export const canApproveAccess: Access = ({ req: { user } }) => canReview(user)

/** Editors and above can publish */
export const canPublishAccess: Access = ({ req: { user } }) => canPublish(user)
