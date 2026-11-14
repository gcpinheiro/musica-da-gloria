import { defineConfig } from '@argo-video/cli';
import { piperEngine } from './piper-engine.mjs';

export default defineConfig({
  baseURL: 'http://127.0.0.1:4210',
  demosDir: 'tools/demo/demos',
  outputDir: 'artifacts/demo-video',
  blocksDir: 'tools/demo/blocks',
  tts: {
    engine: piperEngine(),
    defaultVoice: 'pt_BR-faber-medium-f32-v1',
    defaultSpeed: 1.03,
  },
  video: {
    width: 1920,
    height: 1080,
    fps: 30,
    browser: 'chromium',
    deviceScaleFactor: 1,
    cursorHighlight: {
      mode: 'click',
      color: '#C5A35A',
      radius: 22,
      clickRipple: true,
      opacity: 0.9,
    },
    sceneThumbnails: true,
    captureMode: 'webm',
  },
  export: {
    preset: 'medium',
    crf: 18,
    encoder: 'cpu',
    sharpen: { strength: 0.35 },
    frame: {
      padding: 34,
      borderRadius: 18,
      shadow: 0.45,
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #173C67 0%, #315F8D 58%, #C5A35A 100%)',
      },
    },
    audio: { loudnorm: true },
  },
  overlays: {
    autoBackground: true,
    defaultPlacement: 'top-right',
  },
});
