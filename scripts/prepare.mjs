import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

// Netlify/CI installs don't need git hooks.
if (process.env.CI) {
  process.exit(0);
}

// During some workflows (e.g. lockfile-only installs), node_modules might not exist.
// Don't fail the install in that case.
const huskyBin = path.join(process.cwd(), 'node_modules', 'husky', 'bin.js');
if (!existsSync(huskyBin)) {
  process.exit(0);
}

const result = spawnSync(process.execPath, [huskyBin], { stdio: 'inherit' });
process.exit(result.status ?? 0);
