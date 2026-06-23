import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'

import { WF, type WorkflowStatus } from '@/features/workflow/types'
import './index.scss'

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

export default async function WorkflowWidget() {
  const payload = await getPayload({ config: configPromise })

  const [pending, changes] = await Promise.all([
    countByStatus(payload, WF.PENDING_REVIEW),
    countByStatus(payload, WF.CHANGES_REQUESTED),
  ])

  if (pending === 0 && changes === 0) return null

  return (
    <div className="wf-widget">
      <p className="wf-widget__title">Needs your attention</p>
      <div className="wf-widget__row">
        {pending > 0 && (
          <Link className="wf-widget__badge wf-widget__badge--pending" href={filterUrl(WF.PENDING_REVIEW)}>
            <span className="wf-widget__count">{pending}</span>
            Pending review
          </Link>
        )}
        {changes > 0 && (
          <Link className="wf-widget__badge wf-widget__badge--changes" href={filterUrl(WF.CHANGES_REQUESTED)}>
            <span className="wf-widget__count">{changes}</span>
            Changes requested
          </Link>
        )}
      </div>
    </div>
  )
}
