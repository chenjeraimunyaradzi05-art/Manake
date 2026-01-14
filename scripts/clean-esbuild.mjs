import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const isNetlify = process.env.NETLIFY === 'true' || process.env.NETLIFY === '1';

// This cleanup is meant for Netlify's dependency cache behavior.
// Running it during local installs can race with workspace installs and remove
// `esbuild` after it was installed, breaking Vite.
if (!isNetlify) {
  process.exit(0);
}

function rm(targetPath) {
  try {
    fs.rmSync(targetPath, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

const projectRoot = process.cwd();
const nodeModules = path.join(projectRoot, 'node_modules');

// Netlify caches dependencies between builds. If `node_modules/esbuild` is reused
// across builds, it can end up with a mismatched binary inside the package
// directory, causing `node install.js` to fail. Clearing just esbuild is enough.
rm(path.join(nodeModules, 'esbuild'));

// Some tooling caches esbuild artifacts here.
rm(path.join(nodeModules, '.cache', 'esbuild'));

// Netlify also caches esbuild binaries in the user's home directory.
rm(path.join(os.homedir(), '.cache', 'esbuild'));
