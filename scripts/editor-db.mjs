// Local-only database setup for the VS Code export (Windows/macOS/Linux).
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const cli = new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url);
const result = spawnSync(process.execPath, [
  '--import', './scripts/sites-env.mjs', fileURLToPath(cli),
  'd1', 'migrations', 'apply', 'DB', '--local',
  '--config', 'editor-db.jsonc', '--persist-to', '.wrangler/state',
], { stdio: ['ignore', 'inherit', 'inherit'], env: { ...process.env, CI: 'true' } });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
