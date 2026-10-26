// Starts the editable VS Code copy with its own local guestbook database.
import { spawnSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const setup = spawnSync(process.execPath, ['scripts/editor-db.mjs'], { stdio: 'inherit' });
if (setup.error) throw setup.error;
if (setup.status !== 0) process.exit(setup.status ?? 1);
const cli = fileURLToPath(new URL('../node_modules/vinext/dist/cli.js', import.meta.url));
const child = spawn(process.execPath, [cli, 'dev', '--port', '5173', ...process.argv.slice(2)], { stdio: 'inherit' });
child.on('error', error => { console.error(error.message); process.exit(1); });
child.on('exit', code => process.exit(code ?? 0));
