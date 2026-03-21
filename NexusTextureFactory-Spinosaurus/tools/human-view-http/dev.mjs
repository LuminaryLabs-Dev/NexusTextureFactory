import { execa } from 'execa';
import kill from 'tree-kill';
import process from 'node:process';

const children = [];

function cleanup() {
  for (const child of children) {
    if (!child.pid) continue;
    kill(child.pid);
  }
}

process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

const staticServer = execa('npx', ['serve', '-l', '3014', '.'], { cwd: process.cwd(), stdio: 'inherit' });
children.push(staticServer);
const companion = execa('node', ['tools/human-view-http/server.mjs'], { cwd: process.cwd(), stdio: 'inherit' });
children.push(companion);

await Promise.race(children.map((child) => child.catch((error) => { throw error; })));
