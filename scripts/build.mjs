import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';

if (existsSync('dist')) rmSync('dist', { recursive: true });
mkdirSync('dist', { recursive: true });

execSync('tsc -p tsconfig.build.json', { stdio: 'inherit' });

if (existsSync('src/data')) {
  // Only copy non-source data files (JSON, txt). TypeScript sources have
  // already been compiled into dist/data/ by tsc.
  cpSync('src/data', 'dist/data', {
    recursive: true,
    filter: (src) => !/\.(ts|tsx)$/.test(src),
  });
}

console.log('built belemnite → dist/');
