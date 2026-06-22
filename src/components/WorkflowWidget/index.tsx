import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'

import { WF } from '@/workflow/types'

export default async function WorkflowWidget() {
  const payload = await getPayload({ config: configPromise })

  const [postsPending, pagesPending, postsChanges, pagesChanges] = await Promise.all([
    payload.count({ collection: 'posts', where: { approvalStatus: { equals: WF.PENDING_REVIEW } } }),
    payload.count({ collection: 'pages', where: { approvalStatus: { equals: WF.PENDING_REVIEW } } }),
    payload.count({ collection: 'posts', where: { approvalStatus: { equals: WF.CHANGES_REQUESTED } } }),
    payload.count({ collection: 'pages', where: { approvalStatus: { equals: WF.CHANGES_REQUESTED } } }),
  ])

  const pending = postsPending.totalDocs + pagesPending.totalDocs
  const changes = postsChanges.totalDocs + pagesChanges.totalDocs

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
        <Link
          href="/admin/collections/posts?where[approvalStatus][equals]=pending_review"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'calc(var(--base) * 0.5)',
            background: 'var(--theme-warning-100)',
            color: 'var(--theme-warning-800)',
            border: '1px solid var(--theme-warning-150)',
            borderRadius: '4px',
            padding: 'calc(var(--base) * 0.5) calc(var(--base) * 0.75)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <span
            style={{
              background: 'var(--theme-warning-600)',
              color: 'var(--theme-elevation-0)',
              borderRadius: '999px',
              minWidth: '1.4em',
              height: '1.4em',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              padding: '0 0.3em',
            }}
          >
            {pending}
          </span>
          Pending Review
        </Link>
      )}

      {changes > 0 && (
        <Link
          href="/admin/collections/posts?where[approvalStatus][equals]=changes_requested"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'calc(var(--base) * 0.5)',
            background: 'var(--theme-error-100)',
            color: 'var(--theme-error-800)',
            border: '1px solid var(--theme-error-150)',
            borderRadius: '4px',
            padding: 'calc(var(--base) * 0.5) calc(var(--base) * 0.75)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <span
            style={{
              background: 'var(--theme-error-600)',
              color: 'var(--theme-elevation-0)',
              borderRadius: '999px',
              minWidth: '1.4em',
              height: '1.4em',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              padding: '0 0.3em',
            }}
          >
            {changes}
          </span>
          Changes Requested
        </Link>
      )}
    </div>
  )
}
