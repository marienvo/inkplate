import { spawn } from 'node:child_process';

import { SURGE_DOMAIN } from '../config.js';

const distDir = 'dist/';

if (!SURGE_DOMAIN || typeof SURGE_DOMAIN !== 'string') {
  console.error('SURGE_DOMAIN is missing in config.js');
  process.exit(1);
}

const surge = spawn('surge', [distDir, SURGE_DOMAIN], {
  stdio: 'inherit',
  shell: true,
});

surge.on('close', (code) => {
  process.exit(code ?? 1);
});
