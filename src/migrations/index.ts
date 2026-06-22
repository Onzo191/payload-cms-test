import * as migration_20260622_145904_add_user_roles from './20260622_145904_add_user_roles';

export const migrations = [
  {
    up: migration_20260622_145904_add_user_roles.up,
    down: migration_20260622_145904_add_user_roles.down,
    name: '20260622_145904_add_user_roles'
  },
];
