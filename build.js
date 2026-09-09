const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'providers');
const outDir = path.join(__dirname, 'providers');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Gather all source files
const entryFiles = fs.readdirSync(srcDir)
  .filter(file => file.endsWith('.js') && file !== '_shared.js');

const entryPoints = entryFiles.map(file => path.join(srcDir, file));

// 2. Bundle provider files into /providers/
esbuild.build({
  entryPoints,
  bundle: true,
  minify: false,
  format: 'cjs',
  target: 'es2020',
  platform: 'neutral',
  outdir: outDir,
}).then(() => {
  console.log(`Successfully bundled ${entryPoints.length} scrapers into /providers/`);

  // 3. Generate Nuvio-compliant manifest.json
  const providerEntries = entryFiles.map(file => {
    const providerId = path.basename(file, '.js');
    return {
      id: providerId,
      name: providerId.charAt(0).toUpperCase() + providerId.slice(1),
      description: `${providerId} streaming scraper`,
      version: "1.0.0",
      filename: `providers/${file}`,
      supportedTypes: ["movie", "tv"],
      enabled: true
    };
  });

  const manifestData = {
    id: "re-3arabi-nuvio-plugin",
    name: "Re-3arabi Providers",
    version: "1.0.0",
    description: "Arabic Streaming Providers for Nuvio",
    author: "Zer0cipher",
    providers: providerEntries,
    scrapers: providerEntries // Included for backwards compatibility with older Nuvio builds
  };

  fs.writeFileSync('manifest.json', JSON.stringify(manifestData, null, 2));
  console.log(`Generated manifest.json containing ${providerEntries.length} providers.`);
}).catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});