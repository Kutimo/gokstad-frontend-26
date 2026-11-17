import * as migration_20261016_185911 from './20261016_185911';
import * as migration_20261029_184405 from './20261029_184405';

export const migrations = [
  {
    up: migration_20261016_185911.up,
    down: migration_20261016_185911.down,
    name: '20261016_185911',
  },
  {
    up: migration_20261029_184405.up,
    down: migration_20261029_184405.down,
    name: '20261029_184405'
  },
];
