import * as migration_20261016_185911 from './20261016_185911';
import * as migration_20261117_161202_add_auth_roles_and_notes from './20261117_161202_add_auth_roles_and_notes';

export const migrations = [
  {
    up: migration_20261016_185911.up,
    down: migration_20261016_185911.down,
    name: '20261016_185911',
  },
  {
    up: migration_20261117_161202_add_auth_roles_and_notes.up,
    down: migration_20261117_161202_add_auth_roles_and_notes.down,
    name: '20261117_161202_add_auth_roles_and_notes'
  },
];
