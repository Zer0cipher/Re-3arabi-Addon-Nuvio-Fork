const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'providers');
const outDir = path.join(__dirname, 'providers');

let searchDir = fs.existsSync(srcDir) && fs.readdirSync(srcDir).some(f => f.endsWith('.js') && f !== '_shared.js') 
  ? srcDir 
  : outDir;

if (!fs.existsSync(searchDir)) {
  console.error("❌ Error: No provider directories found.");
  process.exit(1);
}

const entryFiles = fs.readdirSync(searchDir)
  .filter(file => file.endsWith('.js') && file !== '_shared.js');

if (searchDir === srcDir) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const entryPoints = entryFiles.map(file => path.join(srcDir, file));

  // Transpile async/await into Promise generator logic for Hermes
  esbuild.buildSync({
    entryPoints,
    bundle: true,
    minify: false,
    format: 'cjs',
    target: 'es2015',
    supported: {
      'async-await': false // Replaces async/await keywords with standard Promises
    },
    platform: 'neutral',
    outdir: outDir,
  });
  console.log(`✅ Transpiled and bundled ${entryFiles.length} scrapers for Hermes compatibility.`);
}

const scrapersList = entryFiles.map(file => {
  const providerId = path.basename(file, '.js');
  return {
    id: providerId,
    name: providerId.charAt(0).toUpperCase() + providerId.slice(1),
    description: `${providerId} streaming scraper`,
    version: "1.0.0",
    author: "Zer0cipher",
    filename: `providers/${file}`,
    supportedTypes: ["movie", "tv"],
    enabled: true
  };
});

const manifestData = {
  id: "re-3arabi-nuvio-repo",
  name: "Re-3arabi Repo",
  version: "1.0.0",
  description: "Arabic Streaming Providers for Nuvio",
  scrapers: scrapersList,
  providers: scrapersList
};

fs.writeFileSync('manifest.json', JSON.stringify(manifestData, null, 2));
console.log(`✅ Generated manifest.json with ${scrapersList.length} scrapers!`);