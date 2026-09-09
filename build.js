const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'providers');
const outDir = path.join(__dirname, 'providers');

// Ensure output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Gather all provider files (excluding _shared.js)
const entryPoints = fs.readdirSync(srcDir)
  .filter(file => file.endsWith('.js') && file !== '_shared.js')
  .map(file => path.join(srcDir, file));

esbuild.build({
  entryPoints,
  bundle: true,
  minify: false,          // Keep readable for debugging
  format: 'cjs',          // CommonJS output expected by Hermes
  target: 'es2020',
  platform: 'neutral',
  outdir: outDir,
}).then(() => {
  console.log(`Successfully bundled ${entryPoints.length} providers into /providers!`);
}).catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});