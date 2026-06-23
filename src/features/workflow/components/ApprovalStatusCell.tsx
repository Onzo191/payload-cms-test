'use client'
import React from 'react'

import { WF, type WorkflowStatus } from '@/features/workflow/types'
import { STATUS_LABEL, STATUS_PILL_CLASS } from './statusMeta'
import './statusPill.scss'

type CellProps = {
  cellData?: WorkflowStatus
}

export const ApprovalStatusCell: React.FC<CellProps> = ({ cellData }) => {
  const status = cellData ?? WF.DRAFT
  return (
    <span className={`wf-pill ${STATUS_PILL_CLASS[status]}`}>
      <span className="wf-pill__dot" />
      {STATUS_LABEL[status]}
    </span>
  )
}
