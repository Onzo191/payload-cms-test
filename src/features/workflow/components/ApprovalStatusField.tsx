'use client'
import React from 'react'
import { useField, useAuth, Button, Pill } from '@payloadcms/ui'

import { TRANSITIONS, WF, type WorkflowStatus } from '@/features/workflow/types'
import type { Role } from '@/features/rbac/roles'

type PillStyleType = 'always-white' | 'dark' | 'error' | 'light' | 'light-gray' | 'success' | 'warning' | 'white'
type ButtonStyleType = 'dashed' | 'error' | 'none' | 'pill' | 'primary' | 'secondary' | 'subtle' | 'transparent'

const STATUS_PILL: Record<WorkflowStatus, PillStyleType> = {
  [WF.DRAFT]:             'light-gray',
  [WF.PENDING_REVIEW]:    'warning',
  [WF.CHANGES_REQUESTED]: 'error',
  [WF.APPROVED]:          'success',
  [WF.PUBLISHED]:         'dark',
  [WF.ARCHIVED]:          'light',
}

const STATUS_LABEL: Record<WorkflowStatus, string> = {
  [WF.DRAFT]:             'Draft',
  [WF.PENDING_REVIEW]:    'Pending Review',
  [WF.CHANGES_REQUESTED]: 'Changes Requested',
  [WF.APPROVED]:          'Approved',
  [WF.PUBLISHED]:         'Published',
  [WF.ARCHIVED]:          'Archived',
}

const TRANSITION_LABEL: Partial<Record<string, string>> = {
  [`${WF.DRAFT}→${WF.PENDING_REVIEW}`]:             'Submit for Review',
  [`${WF.PENDING_REVIEW}→${WF.APPROVED}`]:          'Approve',
  [`${WF.PENDING_REVIEW}→${WF.CHANGES_REQUESTED}`]: 'Request Changes',
  [`${WF.CHANGES_REQUESTED}→${WF.PENDING_REVIEW}`]: 'Resubmit',
  [`${WF.CHANGES_REQUESTED}→${WF.APPROVED}`]:       'Approve Directly',
  [`${WF.APPROVED}→${WF.PUBLISHED}`]:               'Publish',
  [`${WF.APPROVED}→${WF.PENDING_REVIEW}`]:          'Return to Review',
  [`${WF.PUBLISHED}→${WF.ARCHIVED}`]:               'Archive',
  [`${WF.ARCHIVED}→${WF.DRAFT}`]:                   'Reset to Draft',
}

function buttonStyle(to: WorkflowStatus): ButtonStyleType {
  if (to === WF.PUBLISHED) return 'primary'
  if (to === WF.CHANGES_REQUESTED) return 'error'
  return 'secondary'
}

export const ApprovalStatusField: React.FC<{ path?: string; readOnly?: boolean; [key: string]: unknown }> = ({
  path = 'approvalStatus',
  readOnly,
}) => {
  const { value, setValue } = useField<WorkflowStatus>({ path })
  const { user } = useAuth()

  const currentStatus = (value ?? WF.DRAFT) as WorkflowStatus
  const userRoles = ((user as Record<string, unknown>)?.roles ?? []) as Role[]

  const validTransitions = readOnly
    ? []
    : TRANSITIONS.filter(
        ([from, , allowedRoles]) =>
          from === currentStatus && allowedRoles.some((r) => userRoles.includes(r)),
      )

  return (
    <div style={{ marginBottom: 'var(--base)' }}>
      <label className="field-label">Approval Status</label>
      <div style={{ marginTop: 'calc(var(--base) * 0.25)', marginBottom: validTransitions.length > 0 ? 'calc(var(--base) * 0.5)' : 0 }}>
        <Pill pillStyle={STATUS_PILL[currentStatus] ?? 'light-gray'} size="small" rounded>
          {STATUS_LABEL[currentStatus]}
        </Pill>
      </div>

      {validTransitions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--base) * 0.3)' }}>
          {validTransitions.map(([, to]) => {
            const key = `${currentStatus}→${to}`
            return (
              <Button
                key={to}
                buttonStyle={buttonStyle(to)}
                size="small"
                type="button"
                onClick={() => setValue(to)}
              >
                {TRANSITION_LABEL[key] ?? STATUS_LABEL[to]}
              </Button>
            )
          })}
          <p style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-500)', margin: 0 }}>
            Click an action then Save to apply.
          </p>
        </div>
      )}

      {validTransitions.length === 0 && !readOnly && (
        <p style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-500)', margin: 0 }}>
          No transitions available at this stage.
        </p>
      )}
    </div>
  )
}
