'use client'
import React from 'react'
import { Pill } from '@payloadcms/ui'

import { WF, type WorkflowStatus } from '@/features/workflow/types'

type PillStyleType = 'always-white' | 'dark' | 'error' | 'light' | 'light-gray' | 'success' | 'warning' | 'white'

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
  [WF.CHANGES_REQUESTED]: 'Changes Req.',
  [WF.APPROVED]:          'Approved',
  [WF.PUBLISHED]:         'Published',
  [WF.ARCHIVED]:          'Archived',
}

type CellProps = {
  cellData?: WorkflowStatus
}

export const ApprovalStatusCell: React.FC<CellProps> = ({ cellData }) => {
  const status = cellData ?? WF.DRAFT
  return (
    <Pill pillStyle={STATUS_PILL[status] ?? 'light-gray'} size="small" rounded>
      {STATUS_LABEL[status]}
    </Pill>
  )
}
