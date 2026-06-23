// Hides Payload's native Publish/Unpublish control. Publishing is handled by the
// approval workflow stepper in the sidebar (see ApprovalStatusField) so there is a
// single, consistent place to take content live. Registered per collection via
// `admin.components.edit.PublishButton`.
export const HidePublishButton = () => null
