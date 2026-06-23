'use client'
import React from 'react'
import { useField, useAuth } from '@payloadcms/ui'

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

  const current = (value ?? WF.DRAFT) as WorkflowStatus
  const currentIndex = pipelineIndex(current)
  const isChanges = current === WF.CHANGES_REQUESTED

  const userRoles = ((user as Record<string, unknown>)?.roles ?? []) as Role[]

  const validTransitions = readOnly
    ? []
    : TRANSITIONS.filter(
        ([from, , allowedRoles]) =>
          from === current && allowedRoles.some((r) => userRoles.includes(r)),
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

      {validTransitions.length > 0 && (
        <div className="approval__actions">
          {validTransitions.map(([, to]) => (
            <button
              key={to}
              type="button"
              className={`approval__btn approval__btn--${variantFor(to)}`}
              onClick={() => setValue(to)}
            >
              {TRANSITION_LABEL[`${current}→${to}`] ?? STATUS_LABEL[to]}
            </button>
          ))}
          <p className="approval__hint">Choose an action, then Save to apply it.</p>
        </div>
      )}

      {validTransitions.length === 0 && !readOnly && (
        <p className="approval__hint">No actions available to your role at this stage.</p>
      )}
    </div>
  )
}
