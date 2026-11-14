import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ffmpegPath = require('ffmpeg-static');
const modelName = 'pt_BR-faber-medium';
const modelPath = resolve(`tools/demo/voices/${modelName}.onnx`);
const configPath = resolve(`tools/demo/voices/${modelName}.onnx.json`);

function runCommand(command, args, label) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    let errorOutput = '';
    child.stderr.on('data', (chunk) => {
      errorOutput += chunk.toString();
    });
    child.once('error', rejectRun);
    child.once('exit', (code) => {
      if (code === 0) {
        resolveRun();
        return;
      }
      rejectRun(new Error(`${label} terminou com código ${code}: ${errorOutput.trim()}`));
    });
  });
}

export function piperEngine() {
  return {
    describe() {
      return {
        engine: 'piper-local',
        model: modelName,
        language: 'pt-BR',
        audioFormat: 'pcm-f32le-24000-v1',
      };
    },
    async generate(text, options = {}) {
      if (!text?.trim()) throw new Error('O texto da narração não pode estar vazio.');
      const workDirectory = await mkdtemp(join(tmpdir(), 'musica-da-gloria-tts-'));
      const inputPath = join(workDirectory, 'narration.txt');
      const piperOutputPath = join(workDirectory, 'narration-piper.wav');
      const normalizedOutputPath = join(workDirectory, 'narration.wav');
      const speed = Math.min(1.35, Math.max(0.75, options.speed ?? 1));

      try {
        await writeFile(inputPath, text.trim(), 'utf8');
        await runCommand('python', [
          '-m',
          'piper',
          '--model',
          modelPath,
          '--config',
          configPath,
          '--input-file',
          inputPath,
          '--output-file',
          piperOutputPath,
          '--length-scale',
          String(1 / speed),
          '--sentence-silence',
          '0.22',
        ], 'Piper');
        await runCommand(ffmpegPath, [
          '-y',
          '-hide_banner',
          '-loglevel',
          'error',
          '-i',
          piperOutputPath,
          '-ac',
          '1',
          '-ar',
          '24000',
          '-af',
          'volume=0.8,alimiter=limit=0.95:level=false',
          '-c:a',
          'pcm_f32le',
          normalizedOutputPath,
        ], 'A normalização do áudio');
        return await readFile(normalizedOutputPath);
      } finally {
        await rm(workDirectory, { recursive: true, force: true });
      }
    },
  };
}
