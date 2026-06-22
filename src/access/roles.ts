import type { User } from '@/payload-types'

export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  AUTHOR: 'author',
  REVIEWER: 'reviewer',
  VIEWER: 'viewer',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export function hasRole(user: User | null | undefined, ...roles: Role[]): boolean {
  if (!user) return false
  const userRoles = (user.roles ?? []) as Role[]
  return roles.some((r) => userRoles.includes(r))
}

export const canPublish = (user: User | null | undefined): boolean =>
  hasRole(user, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR)

export const canReview = (user: User | null | undefined): boolean =>
  hasRole(user, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR, ROLES.REVIEWER)

export const canManageUsers = (user: User | null | undefined): boolean =>
  hasRole(user, ROLES.SUPER_ADMIN, ROLES.ADMIN)
