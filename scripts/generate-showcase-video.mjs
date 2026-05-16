/**
 * InsightFlow — App Showcase Video Generator
 * Creates a polished slideshow video from the 12 app screenshots using ffmpeg.
 * Each slide: 6s display + 1s crossfade transition + drawtext overlay.
 * Output: videos/insightflow-showcase.mp4 (1920x1080, H.264)
 *
 * Usage: node scripts/generate-showcase-video.mjs
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SCREENSHOTS_DIR = path.join(ROOT, 'screenshots');
const OUT_DIR = path.join(ROOT, 'videos');

// ffmpeg from WinGet install
const FFMPEG = process.env.FFMPEG_PATH ||
  'C:/Users/m_rov/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe';

const SLIDE_DURATION = 6;     // seconds each slide is visible (longer = more time to read)
const TRANS_DURATION = 1.0;   // crossfade transition duration
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

// Font path (Windows Arial)
const FONT = 'C\\:/Windows/Fonts/arial.ttf';

const PAGE_LABELS = {
  '01-landing':     'Página Inicial — InsightFlow AI',
  '02-auth':        'Autenticação Segura',
  '03-plans':       'Planos & Preços',
  '04-dashboard':   'Dashboard Principal',
  '05-ai-chat':     'Chat com IA — SQL em Linguagem Natural',
  '06-reports':     'Relatórios Inteligentes',
  '07-powerbi':     'Power BI Embarcado',
  '08-history':     'Histórico de Consultas',
  '09-executions':  'Execuções em Tempo Real',
  '10-settings':    'Configurações Avançadas',
  '11-admin':       'Painel Administrativo',
  '12-site-config': 'Configuração do Site',
};

fs.mkdirSync(OUT_DIR, { recursive: true });

const screenshots = fs.readdirSync(SCREENSHOTS_DIR)
  .filter(f => f.endsWith('.png'))
  .sort()
  .map(f => ({
    file: path.join(SCREENSHOTS_DIR, f),
    name: f.replace('.png', ''),
    label: PAGE_LABELS[f.replace('.png', '')] || f.replace('.png', ''),
  }));

console.log(`📸 Found ${screenshots.length} screenshots`);
const totalSecs = (screenshots.length - 1) * (SLIDE_DURATION - TRANS_DURATION) + SLIDE_DURATION;
console.log(`⏱  Duration: ~${Math.round(totalSecs)}s`);
console.log(`📁 Output: ${OUT_DIR}`);
console.log('');

const N = screenshots.length;

// Build inputs array — each image looped for SLIDE_DURATION
const inputs = screenshots.flatMap(s => [
  '-loop', '1',
  '-t', String(SLIDE_DURATION),
  '-i', s.file,
]);

let filterLines = [];

// Step 1: scale+pad + drawtext overlay for each slide
for (let i = 0; i < N; i++) {
  const label = screenshots[i].label.replace(/'/g, "’"); // smart quote to avoid filter escaping issues

  // Scale and pad to 1920x1080 with branded dark background
  // Then draw: gradient bar at bottom + page label + slide counter
  filterLines.push(
    // Scale preserving aspect ratio, pad with dark blue
    `[${i}:v]scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,` +
    `pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=#0a1628,` +
    `setsar=1,fps=${FPS},` +
    // Dark gradient bar at the bottom for text readability
    `drawbox=x=0:y=${HEIGHT - 90}:w=${WIDTH}:h=90:color=0a1628@0.85:t=fill,` +
    // Thin blue accent line above the bar
    `drawbox=x=0:y=${HEIGHT - 92}:w=${WIDTH}:h=3:color=3b82f6@1:t=fill,` +
    // Page label text
    `drawtext=fontfile='${FONT}':text='${label}':` +
    `fontsize=32:fontcolor=white:x=40:y=${HEIGHT - 60}:` +
    `shadowx=2:shadowy=2:shadowcolor=black@0.7,` +
    // InsightFlow branding top-left
    `drawtext=fontfile='${FONT}':text='InsightFlow AI':` +
    `fontsize=26:fontcolor=3b82f6:x=40:y=30,` +
    // Slide counter bottom-right
    `drawtext=fontfile='${FONT}':text='${i + 1} / ${N}':` +
    `fontsize=24:fontcolor=white@0.6:x=w-90:y=${HEIGHT - 58}` +
    `[s${i}]`
  );
}

// Step 2: chain xfade transitions
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
const OUTPUT = path.join(OUT_DIR, 'insightflow-showcase.mp4');

const args = [
  '-y',
  ...inputs,
  '-filter_complex', filterComplex,
  '-map', '[out]',
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-crf', '20',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  OUTPUT,
];

console.log('🎬 Rendering showcase video...');
console.log(`   ${screenshots.length} slides × ${SLIDE_DURATION}s + ${TRANS_DURATION}s transitions`);
console.log('');

const ffmpeg = spawn(FFMPEG, args, { stdio: ['ignore', 'pipe', 'pipe'] });

let stderr = '';
ffmpeg.stderr.on('data', d => {
  const line = d.toString();
  stderr += line;
  if (line.includes('frame=') || line.includes('Error') || line.includes('error')) {
    process.stdout.write('\r' + line.trim().substring(0, 100));
  }
});

ffmpeg.on('close', code => {
  console.log('');
  if (code === 0) {
    const size = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(1);
    console.log(`\n✅ Showcase video done!`);
    console.log(`   📁 ${OUTPUT}`);
    console.log(`   📦 ${size} MB`);
    console.log(`   ⏱  ~${Math.round(totalSecs)}s at ${FPS}fps`);
  } else {
    console.error('\n❌ ffmpeg failed. Last lines:');
    console.error(stderr.split('\n').slice(-15).join('\n'));
    process.exit(1);
  }
});

ffmpeg.on('error', err => {
  console.error('❌ Could not start ffmpeg:', err.message);
  process.exit(1);
});
