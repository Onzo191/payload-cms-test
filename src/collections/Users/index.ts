import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { adminOnly, anyAuthenticated } from '../../access/byRole'
import { canManageUsers, ROLES } from '../../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: adminOnly,
    delete: adminOnly,
    read: anyAuthenticated,
    update: ({ req: { user }, id }) => {
      if (!user) return false
      // Admins and above can update anyone; users can update themselves
      if (canManageUsers(user)) return true
      return { id: { equals: user.id } }
    },
  },
  admin: {
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: [ROLES.AUTHOR],
      options: [
        { label: 'Super Admin', value: ROLES.SUPER_ADMIN },
        { label: 'Admin', value: ROLES.ADMIN },
        { label: 'Editor', value: ROLES.EDITOR },
        { label: 'Author', value: ROLES.AUTHOR },
        { label: 'Reviewer', value: ROLES.REVIEWER },
        { label: 'Viewer', value: ROLES.VIEWER },
      ],
      access: {
        // Only admins and above can change roles
        update: ({ req: { user } }) => canManageUsers(user),
      },
      admin: {
        position: 'sidebar',
        description: 'Roles control what this user can do in the admin panel.',
      },
    },
  ],
  timestamps: true,
}
