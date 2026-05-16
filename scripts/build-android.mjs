/**
 * Script de build para Android via Capacitor
 * Uso: node scripts/build-android.mjs
 */
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const run = (cmd, opts = {}) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: root, ...opts, env: { ...process.env, ...opts.env } });
};

console.log("🤖 InsightFlow — Build Android\n");

// 1. Build Vite com base './' para Capacitor
console.log("📦 Building web assets para Capacitor...");
run("npx vite build", { env: { VITE_CAPACITOR: "true" } });

// 2. Sync para Android
console.log("\n📱 Sincronizando com Android...");
run("node node_modules/@capacitor/cli/bin/capacitor sync android");

console.log("\n✅ Build concluído!");
console.log("   Próximos passos:");
console.log("   → node scripts/build-android.mjs open  (para abrir no Android Studio)");
console.log("   → Android Studio: Build > Generate Signed APK");
