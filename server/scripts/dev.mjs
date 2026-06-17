import { spawn } from 'child_process';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function killPort() {
  try {
    execSync(`powershell -ExecutionPolicy Bypass -File "${path.join(__dirname, 'kill-port.ps1')}"`, {
      stdio: 'inherit',
      cwd: root,
    });
  } catch {
    // ignore
  }
}

killPort();

const child = spawn(process.execPath, ['--watch', 'src/index.js'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));