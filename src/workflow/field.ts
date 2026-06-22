import type { Field } from 'payload'

import { WF } from './types'

export function approvalStatusField(): Field {
  return {
    name: 'approvalStatus',
    type: 'select',
    defaultValue: WF.DRAFT,
    options: [
      { label: 'Draft', value: WF.DRAFT },
      { label: 'Pending Review', value: WF.PENDING_REVIEW },
      { label: 'Changes Requested', value: WF.CHANGES_REQUESTED },
      { label: 'Approved', value: WF.APPROVED },
      { label: 'Published', value: WF.PUBLISHED },
      { label: 'Archived', value: WF.ARCHIVED },
    ],
    admin: {
      position: 'sidebar',
      components: {
        Field: '@/workflow/components/ApprovalStatusField#ApprovalStatusField',
      },
    },
  }
}

export function workflowFields(): Field[] {
  return [approvalStatusField(), ...workflowAuditFields()]
}

export function workflowAuditFields(): Field[] {
  return [
    {
      name: 'reviewNote',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Reviewer notes visible to the author after review.',
        condition: (data) =>
          data?.approvalStatus === WF.CHANGES_REQUESTED || data?.approvalStatus === WF.APPROVED,
      },
    },
    {
      name: 'submittedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Who submitted this for review.',
        condition: (data) => Boolean(data?.submittedBy),
      },
      // Set automatically by the validateTransition hook — not editable by users
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Who last reviewed this content.',
        condition: (data) => Boolean(data?.reviewedBy),
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) => Boolean(data?.reviewedAt),
        date: { pickerAppearance: 'dayAndTime' },
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },
  ]
}
