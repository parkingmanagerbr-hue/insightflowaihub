/**
 * InsightFlow — Vertical App Showcase Video (1080×1920, Instagram/TikTok/Reels)
 * Each screenshot is cropped to portrait, shown for 3.5s with crossfade transitions.
 *
 * Usage: node scripts/generate-vertical-video.mjs
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SCREENSHOTS_DIR = path.join(ROOT, 'screenshots');
const OUT_DIR = path.join(ROOT, 'videos');

const FFMPEG =
  'C:/Users/m_rov/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe';

const SLIDE_DURATION = 3.5;
const TRANS_DURATION = 0.7;
const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

fs.mkdirSync(OUT_DIR, { recursive: true });

const screenshots = fs.readdirSync(SCREENSHOTS_DIR)
  .filter(f => f.endsWith('.png'))
  .sort()
  .map(f => path.join(SCREENSHOTS_DIR, f));

console.log(`📸 ${screenshots.length} screenshots → vertical (${WIDTH}×${HEIGHT})`);
console.log(`⏱  Duration: ~${Math.ceil(screenshots.length * SLIDE_DURATION)}s`);

const N = screenshots.length;
const inputs = screenshots.flatMap(s => ['-loop', '1', '-t', String(SLIDE_DURATION), '-i', s]);

// For vertical: scale screenshot (1440×900) into 1080×1920 portrait
// Strategy: scale to fill width (1080), add dark blue gradient top/bottom, no black bars
// The screenshot becomes ~1080×608, so we pad with branded color above/below
let filterLines = [];
for (let i = 0; i < N; i++) {
  // Strategy: scale to FILL 1080×1920 (may upscale), then crop top-center.
  // - Wide screenshots (1440×900): upscaled to 3072×1920, center-cropped → shows center panel
  // - Tall screenshots (landing/plans): scaled to 1080×N, top-cropped → shows hero section
  filterLines.push(
    `[${i}:v]scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,` +
    `crop=${WIDTH}:${HEIGHT}:(iw-${WIDTH})/2:0,` +
    `setsar=1,fps=${FPS}` +
    `[s${i}]`
  );
}

let prevLabel = 's0';
for (let i = 1; i < N; i++) {
  const offset = i * (SLIDE_DURATION - TRANS_DURATION);
  const outLabel = i === N - 1 ? 'out' : `x${i}`;
  filterLines.push(
    `[${prevLabel}][s${i}]xfade=transition=fade:duration=${TRANS_DURATION}:offset=${offset}[${outLabel}]`
  );
  prevLabel = outLabel;
}

const filterComplex = filterLines.join(';\n');
const OUTPUT = path.join(OUT_DIR, 'insightflow-showcase-vertical.mp4');

const args = [
  '-y',
  ...inputs,
  '-filter_complex', filterComplex,
  '-map', '[out]',
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-crf', '22',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  OUTPUT,
];

console.log('🎬 Rendering vertical showcase...');

const ffmpeg = spawn(FFMPEG, args, { stdio: ['ignore', 'pipe', 'pipe'] });
let stderr = '';
ffmpeg.stderr.on('data', d => {
  const line = d.toString();
  stderr += line;
  if (line.includes('frame=') || line.includes('Error')) {
    process.stdout.write('\r' + line.trim().substring(0, 80));
  }
});

ffmpeg.on('close', code => {
  console.log('');
  if (code === 0) {
    const size = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(1);
    console.log(`\n✅ Vertical video done!`);
    console.log(`   📁 ${OUTPUT}`);
    console.log(`   📦 ${size} MB`);
  } else {
    console.error('\n❌ Error:', stderr.split('\n').slice(-10).join('\n'));
    process.exit(1);
  }
});
