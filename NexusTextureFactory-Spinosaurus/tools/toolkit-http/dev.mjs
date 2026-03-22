import { spawn } from 'node:child_process';
import process from 'node:process';

const children = [];

function start(cmd, args) {
  const child = spawn(cmd, args, { cwd: process.cwd(), stdio: 'inherit' });
  children.push(child);
  return child;
}

function cleanup() {
  children.forEach((child) => {
    if (!child || child.killed) return;
    child.kill('SIGTERM');
  });
}

process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

start('npx', ['serve', '-l', '3014', '.']);
start('node', ['tools/toolkit-http/server.mjs']);
