const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'providers');
const outDir = path.join(__dirname, 'providers');

// Determine where the source files are located
let searchDir = fs.existsSync(srcDir) && fs.readdirSync(srcDir).some(f => f.endsWith('.js') && f !== '_shared.js') 
  ? srcDir 
  : outDir;

if (!fs.existsSync(searchDir)) {
  console.error("❌ Error: No provider directories found.");
  process.exit(1);
}

const entryFiles = fs.readdirSync(searchDir)
  .filter(file => file.endsWith('.js') && file !== '_shared.js');

console.log(`Found ${entryFiles.length} scrapers in ${searchDir}`);

if (entryFiles.length === 0) {
  console.error("❌ Error: No .js scraper files found!");
  process.exit(1);
}

// 1. Bundle code if files are in src/providers
if (searchDir === srcDir) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const entryPoints = entryFiles.map(file => path.join(srcDir, file));

  esbuild.buildSync({
    entryPoints,
    bundle: true,
    minify: false,
    format: 'cjs',
    target: 'es2020',
    platform: 'neutral',
    outdir: outDir,
  });
  console.log(`✅ Bundled ${entryFiles.length} files into /providers/`);
}

// 2. Generate Nuvio manifest format
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