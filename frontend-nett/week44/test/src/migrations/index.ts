import * as migration_20261016_185911 from './20261016_185911';
import * as migration_20261029_142857_blocks_and_globals from './20261029_142857_blocks_and_globals';

export const migrations = [
  {
    up: migration_20261016_185911.up,
    down: migration_20261016_185911.down,
    name: '20261016_185911',
  },
  {
    up: migration_20261029_142857_blocks_and_globals.up,
    down: migration_20261029_142857_blocks_and_globals.down,
    name: '20261029_142857_blocks_and_globals'
  },
];
