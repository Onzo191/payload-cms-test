import type { Access } from 'payload'
import { hasRole, ROLES } from './roles'

/** super-admin, admin, editor */
export const adminOrEditor: Access = ({ req: { user } }) =>
  hasRole(user, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR)

/** super-admin, admin, editor, author — anyone who can create content */
export const anyCreator: Access = ({ req: { user } }) =>
  hasRole(user, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR, ROLES.AUTHOR)

/**
 * Editors and above can edit any document.
 * Authors can only edit documents where they are listed as an author.
 * Everyone else is denied.
 */
export const ownOrEditor: Access = ({ req: { user } }) => {
  if (!user) return false
  if (hasRole(user, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR)) return true
  // Payload where-constraint: only docs where `authors` contains this user's id
  return { authors: { equals: user.id } }
}

/** super-admin, admin only */
export const adminOnly: Access = ({ req: { user } }) =>
  hasRole(user, ROLES.SUPER_ADMIN, ROLES.ADMIN)

/** Any authenticated user (any role) */
export const anyAuthenticated: Access = ({ req: { user } }) => Boolean(user)
