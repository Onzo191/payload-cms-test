'use client'
import React, { useCallback, useState } from 'react'
import { useField, useAuth, useForm, useConfig, useDocumentInfo } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'

import { TRANSITIONS, WF, type WorkflowStatus } from '@/features/workflow/types'
import type { Role } from '@/features/rbac/roles'
import {
  PIPELINE,
  STAGE_SUB,
  STATUS_LABEL,
  STATUS_PILL_CLASS,
  TRANSITION_LABEL,
  pipelineIndex,
} from './statusMeta'
import './ApprovalStatusField.scss'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

function variantFor(to: WorkflowStatus): ButtonVariant {
  if (to === WF.PUBLISHED || to === WF.APPROVED) return 'primary'
  if (to === WF.CHANGES_REQUESTED) return 'danger'
  return 'secondary'
}

export const ApprovalStatusField: React.FC<{
  path?: string
  readOnly?: boolean
  [key: string]: unknown
}> = ({ path = 'approvalStatus', readOnly }) => {
  const { value, setValue } = useField<WorkflowStatus>({ path })
  const { user } = useAuth()
  const { submit } = useForm()
  const { config } = useConfig()
  const { id, collectionSlug } = useDocumentInfo()
  const [busy, setBusy] = useState(false)

  const current = (value ?? WF.DRAFT) as WorkflowStatus
  const currentIndex = pipelineIndex(current)
  const isChanges = current === WF.CHANGES_REQUESTED
  const isPublished = current === WF.PUBLISHED

  const userRoles = ((user as Record<string, unknown>)?.roles ?? []) as Role[]
  const canPublish = userRoles.some((r) => r === 'super-admin' || r === 'admin' || r === 'editor')

  const validTransitions = readOnly
    ? []
    : TRANSITIONS.filter(
        ([from, , allowedRoles]) =>
          from === current && allowedRoles.some((r) => userRoles.includes(r)),
      )

  // Drive Payload's native publish state from the sidebar so the whole workflow
  // lives in one place. This mirrors the default PublishButton: a real (non-draft)
  // save with a `_status` override — the only reliable way to flip publish state.
  const setStatus = useCallback(
    async (status: 'published' | 'draft') => {
      if (busy) return
      const api = config.routes.api
      const params = status === 'draft' ? '?depth=0&draft=true' : '?depth=0'
      const action = formatAdminURL({
        apiRoute: api,
        path: `/${collectionSlug}${id ? `/${id}` : ''}${params}`,
      })
      setBusy(true)
      try {
        await submit({
          action,
          method: id ? 'PATCH' : 'POST',
          overrides: { _status: status },
          // Unpublishing shouldn't be blocked by required-field validation.
          skipValidation: status === 'draft',
        })
      } finally {
        setBusy(false)
      }
    },
    [busy, config.routes.api, collectionSlug, id, submit],
  )

  return (
    <div className="approval">
      <span className="approval__label">Approval</span>

      <span className={`wf-pill ${STATUS_PILL_CLASS[current]}`}>
        <span className="wf-pill__dot" />
        {STATUS_LABEL[current]}
      </span>

      <div className="approval__stepper" role="list">
        {PIPELINE.map((stage, i) => {
          const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming'
          const isCurrent = state === 'current'
          const alert = isCurrent && isChanges
          const name = isCurrent ? STATUS_LABEL[current] : STATUS_LABEL[stage]
          const sub = isCurrent ? STAGE_SUB[current] : STAGE_SUB[stage]

          return (
            <div
              key={stage}
              role="listitem"
              className={`approval__step approval__step--${state}${alert ? ' approval__step--alert' : ''}`}
            >
              <div className="approval__rail">
                <span className="approval__node" />
                {i < PIPELINE.length - 1 && <span className="approval__line" />}
              </div>
              <div>
                <div className="approval__name">{name}</div>
                <div className="approval__sub">{sub}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="approval__actions">
        {/* Approval-pipeline moves (applied on the next save). */}
        {validTransitions.map(([, to]) => (
          <button
            key={to}
            type="button"
            disabled={busy}
            className={`approval__btn approval__btn--${variantFor(to)}`}
            onClick={() => setValue(to)}
          >
            {TRANSITION_LABEL[`${current}→${to}`] ?? STATUS_LABEL[to]}
          </button>
        ))}
        {validTransitions.length > 0 && (
          <p className="approval__hint">Choose an action, then Save to apply it.</p>
        )}

        {/* Publish / Unpublish — go live without leaving the workflow. */}
        {canPublish && !readOnly && (
          <>
            {(validTransitions.length > 0 || isPublished) && (
              <span className="approval__divider" />
            )}

            {!isPublished && (
              <>
                <button
                  type="button"
                  disabled={busy}
                  className="approval__btn approval__btn--publish"
                  onClick={() => void setStatus('published')}
                >
                  {busy ? 'Publishing…' : '🚀 Publish now'}
                </button>
                {current !== WF.APPROVED && (
                  <p className="approval__hint">
                    Skips the remaining review steps — use when it’s urgent.
                  </p>
                )}
              </>
            )}

            {isPublished && (
              <>
                <button
                  type="button"
                  disabled={busy}
                  className="approval__btn approval__btn--secondary"
                  onClick={() => void setStatus('draft')}
                >
                  {busy ? 'Unpublishing…' : 'Unpublish'}
                </button>
                <p className="approval__hint">Live on the site. Unpublishing returns it to draft.</p>
              </>
            )}
          </>
        )}

        {validTransitions.length === 0 && !canPublish && !readOnly && !isPublished && (
          <p className="approval__hint">No actions available to your role at this stage.</p>
        )}
      </div>
    </div>
  )
}
