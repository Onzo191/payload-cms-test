import * as migration_20260622_145904_add_user_roles from './20260622_145904_add_user_roles';
import * as migration_20260622_230000_add_workflow_fields from './20260622_230000_add_workflow_fields';
import * as migration_20260623_020000_cascade_delete_versions from './20260623_020000_cascade_delete_versions';

export const migrations = [
  {
    up: migration_20260622_145904_add_user_roles.up,
    down: migration_20260622_145904_add_user_roles.down,
    name: '20260622_145904_add_user_roles',
  },
  {
    up: migration_20260622_230000_add_workflow_fields.up,
    down: migration_20260622_230000_add_workflow_fields.down,
    name: '20260622_230000_add_workflow_fields',
  },
  {
    up: migration_20260623_020000_cascade_delete_versions.up,
    down: migration_20260623_020000_cascade_delete_versions.down,
    name: '20260623_020000_cascade_delete_versions',
  },
];
