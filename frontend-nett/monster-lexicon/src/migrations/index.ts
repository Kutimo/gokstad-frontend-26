import * as migration_20261016_185911 from './20261016_185911';
import * as migration_20261022_184843 from './20261022_184843';

export const migrations = [
  {
    up: migration_20261016_185911.up,
    down: migration_20261016_185911.down,
    name: '20261016_185911',
  },
  {
    up: migration_20261022_184843.up,
    down: migration_20261022_184843.down,
    name: '20261022_184843'
  },
];
