/**
 * InsightFlow Remotion — Windows render script
 * Uses renderMedia (Chrome + Windows compositor) for H.264 output.
 *
 * Usage:
 *   node scripts/render-win.mjs          → renders horizontal + vertical
 *   node scripts/render-win.mjs main     → horizontal only  (1920×1080)
 *   node scripts/render-win.mjs vertical → vertical only    (1080×1920)
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const FFMPEG =
  process.env.FFMPEG_PATH ||
  "C:/Users/m_rov/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe";

const OUT_DIR = path.join(ROOT, "..", "videos");
fs.mkdirSync(OUT_DIR, { recursive: true });

const CHROME_OPTS = {
  browserExecutable: CHROME,
  chromiumOptions: {
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  },
};

const COMPOSITIONS = {
  main: {
    entryPoint: path.resolve(ROOT, "src/index.ts"),
    id: "main",
    outFile: path.join(OUT_DIR, "insightflow-promo.mp4"),
  },
  vertical: {
    entryPoint: path.resolve(ROOT, "src/vertical-index.ts"),
    id: "vertical",
    outFile: path.join(OUT_DIR, "insightflow-promo-vertical.mp4"),
  },
};

const targets = process.argv[2]
  ? [process.argv[2]]
  : Object.keys(COMPOSITIONS);

for (const name of targets) {
  const cfg = COMPOSITIONS[name];
  if (!cfg) {
    console.error(`Unknown: ${name}. Choose: ${Object.keys(COMPOSITIONS).join(", ")}`);
    process.exit(1);
  }

  console.log(`\n🎬 Rendering "${name}"...`);
  console.log(`   Entry: ${cfg.entryPoint}`);
  console.log(`   Output: ${cfg.outFile}`);

  // 1. Bundle
  console.log("📦 Bundling...");
  const bundled = await bundle({
    entryPoint: cfg.entryPoint,
    webpackOverride: (config) => config,
  });
  console.log("   ✅ Bundle ready");

  // 2. Select composition
  console.log("🔍 Selecting composition...");
  const composition = await selectComposition({
    serveUrl: bundled,
    id: cfg.id,
    ...CHROME_OPTS,
  });

  const { durationInFrames, fps, width, height } = composition;
  console.log(`   ${width}×${height} @ ${fps}fps — ${durationInFrames} frames (${(durationInFrames / fps).toFixed(1)}s)`);

  // 3. Render
  console.log(`🖼  Rendering ${durationInFrames} frames...`);
  let lastFrame = 0;
  const start = Date.now();

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: cfg.outFile,
    ...CHROME_OPTS,
    ffmpegExecutable: FFMPEG,
    muted: true,
    concurrency: 2,
    onProgress: ({ renderedFrames, encodedFrames, renderedDurationInMs }) => {
      if (renderedFrames - lastFrame >= 30 || renderedFrames === durationInFrames) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(0);
        const pct = Math.round((renderedFrames / durationInFrames) * 100);
        console.log(`   Frame ${renderedFrames}/${durationInFrames} (${pct}%) — ${elapsed}s elapsed`);
        lastFrame = renderedFrames;
      }
    },
  });

  const size = (fs.statSync(cfg.outFile).size / 1024 / 1024).toFixed(1);
  console.log(`\n✅ "${name}" done! → ${cfg.outFile} (${size} MB)`);
}

console.log("\n🎉 All videos rendered!");
