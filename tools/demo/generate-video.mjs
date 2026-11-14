import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import process from 'node:process';

const require = createRequire(import.meta.url);
const projectRoot = resolve(import.meta.dirname, '../..');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;
const angularCli = resolve(projectRoot, 'node_modules/@angular/cli/bin/ng.js');
const argoCli = resolve(projectRoot, 'node_modules/@argo-video/cli/bin/argo.js');
const localUrl = 'http://127.0.0.1:4210/login';

const childEnvironment = {
  ...process.env,
  PATH: `${dirname(ffmpegPath)};${dirname(ffprobePath)};${process.env.PATH ?? ''}`,
  ARGO_USE_GPU: '0',
  DO_NOT_TRACK: '1',
  HF_HUB_DISABLE_TELEMETRY: '1',
};

function run(command, args, options = {}) {
  return spawn(command, args, {
    cwd: projectRoot,
    env: childEnvironment,
    stdio: 'inherit',
    windowsHide: true,
    ...options,
  });
}

async function waitForApplication(timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(localUrl);
      if (response.ok) return;
    } catch {
      // The local Angular process is still starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 750));
  }
  throw new Error('A aplicação local não iniciou dentro do tempo esperado.');
}

function waitForExit(child, label) {
  return new Promise((resolveExit, rejectExit) => {
    child.once('error', rejectExit);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolveExit();
        return;
      }
      rejectExit(new Error(`${label} terminou com código ${code ?? 'nulo'} e sinal ${signal ?? 'nenhum'}.`));
    });
  });
}

const server = run(process.execPath, [
  angularCli,
  'serve',
  '--configuration',
  'demo',
  '--host',
  '127.0.0.1',
  '--port',
  '4210',
]);

try {
  await waitForApplication();
  const renderer = run(process.execPath, [
    argoCli,
    'pipeline',
    'musica-da-gloria',
    '--config',
    'tools/demo/argo.config.mjs',
  ]);
  await waitForExit(renderer, 'A renderização');
  console.log('\nVídeo criado em artifacts/demo-video/musica-da-gloria.mp4');
} finally {
  server.kill('SIGTERM');
}
