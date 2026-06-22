import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'

import { WF, type WorkflowStatus } from '@/features/workflow/types'

// Collections that participate in the approval workflow.
const WORKFLOW_COLLECTIONS = ['posts', 'pages'] as const

/** Admin list URL pre-filtered by approvalStatus (links to posts; pages share the column). */
const filterUrl = (status: WorkflowStatus): string =>
  `/admin/collections/posts?where[approvalStatus][equals]=${status}`

/** Count docs in a given workflow status across all workflow-enabled collections. */
async function countByStatus(
  payload: Awaited<ReturnType<typeof getPayload>>,
  status: WorkflowStatus,
): Promise<number> {
  const counts = await Promise.all(
    WORKFLOW_COLLECTIONS.map((collection) =>
      payload.count({ collection, where: { approvalStatus: { equals: status } } }),
    ),
  )
  return counts.reduce((sum, c) => sum + c.totalDocs, 0)
}

const badgeStyle = (tone: 'warning' | 'error'): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 'calc(var(--base) * 0.5)',
  background: `var(--theme-${tone}-100)`,
  color: `var(--theme-${tone}-800)`,
  border: `1px solid var(--theme-${tone}-150)`,
  borderRadius: '4px',
  padding: 'calc(var(--base) * 0.5) calc(var(--base) * 0.75)',
  fontSize: '0.875rem',
  fontWeight: 600,
  textDecoration: 'none',
})

const countStyle = (tone: 'warning' | 'error'): React.CSSProperties => ({
  background: `var(--theme-${tone}-600)`,
  color: 'var(--theme-elevation-0)',
  borderRadius: '999px',
  minWidth: '1.4em',
  height: '1.4em',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  padding: '0 0.3em',
})

export default async function WorkflowWidget() {
  const payload = await getPayload({ config: configPromise })

  const [pending, changes] = await Promise.all([
    countByStatus(payload, WF.PENDING_REVIEW),
    countByStatus(payload, WF.CHANGES_REQUESTED),
  ])

  if (pending === 0 && changes === 0) return null

  return (
    <div
      style={{
        display: 'flex',
        gap: 'calc(var(--base) * 0.75)',
        flexWrap: 'wrap',
        marginBottom: 'calc(var(--base) * 1.5)',
      }}
    >
      {pending > 0 && (
        <Link href={filterUrl(WF.PENDING_REVIEW)} style={badgeStyle('warning')}>
          <span style={countStyle('warning')}>{pending}</span>
          Pending Review
        </Link>
      )}

      {changes > 0 && (
        <Link href={filterUrl(WF.CHANGES_REQUESTED)} style={badgeStyle('error')}>
          <span style={countStyle('error')}>{changes}</span>
          Changes Requested
        </Link>
      )}
    </div>
  )
}
