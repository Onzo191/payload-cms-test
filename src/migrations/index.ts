import * as migration_20260622_145904_add_user_roles from './20260622_145904_add_user_roles';
import * as migration_20260622_230000_add_workflow_fields from './20260622_230000_add_workflow_fields';

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
];
