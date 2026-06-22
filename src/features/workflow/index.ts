// Content approval workflow — single entrypoint for config helpers, hooks and types.
// The admin UI components (Widget, field components) are referenced by Payload via
// their string paths and are intentionally NOT re-exported here.
export * from './types'
export { approvalStatusField, workflowAuditFields, workflowFields } from './field'
export { validateTransition } from './hooks/validateTransition'
