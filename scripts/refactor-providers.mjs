import fs from 'node:fs/promises';
import path from 'node:path';

const CONFIG_PATH = path.resolve(import.meta.dirname, '../scrapers.config.json');

async function getSourceProvidersDir() {
  const possiblePaths = [
    path.resolve(import.meta.dirname, '../src/providers'),
    path.resolve(import.meta.dirname, '../source/providers')
  ];

  for (const dirPath of possiblePaths) {
    try {
      await fs.access(dirPath);
      return dirPath;
    } catch {}
  }
  return null;
}

async function refactorAllProviders() {
  try {
    const PROVIDERS_DIR = await getSourceProvidersDir();
    if (!PROVIDERS_DIR) {
      console.error('❌ Could not find src/providers or source/providers directory!');
      return;
    }

    const rawConfig = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(rawConfig);
    const files = await fs.readdir(PROVIDERS_DIR);

    let modifiedCount = 0;

    for (const file of files) {
      // Ignore helper scripts like _shared.js or configHelper.js
      if (!/\.(js|mjs|ts)$/.test(file) || file.startsWith('_') || file.toLowerCase() === 'confighelper.js') continue;

      const providerId = path.basename(file, path.extname(file));
      const providerData = config.providers?.[providerId];
      const filePath = path.join(PROVIDERS_DIR, file);
      let code = await fs.readFile(filePath, 'utf-8');

      if (code.includes('getOrUpdateDomain(')) {
        console.log(`⏩ Skipped (already refactored): ${file}`);
        continue;
      }

      let modified = false;

      // Extract raw domain/host without protocol or slashes from config for fallback matching
      let targetHost = '';
      if (providerData?.baseUrl) {
        try {
          const urlObj = new URL(providerData.baseUrl);
          targetHost = urlObj.hostname;
        } catch {}
      }

      // 1. Variable Assignment Pattern (e.g. const BASE_URL = '...', let domain = 'wecima.sarl')
      const varRegex = /(export\s+)?(const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*['"`]([^'"`]+)['"`];?/g;

      let hasReplacedVar = false;
      code = code.replace(varRegex, (match, exp, kind, varName, value) => {
        // Match if value is a URL, contains target host, or looks like a TLD domain
        if (value.startsWith('http') || (targetHost && value.includes(targetHost)) || /\.[a-z]{2,}/i.test(value)) {
          hasReplacedVar = true;
          modified = true;
          const exportStr = exp ? exp : '';
          return `${exportStr}const ${varName} = await getOrUpdateDomain('${providerId}');`;
        }
        return match;
      });

      // 2. Direct inline URL usage replacement (e.g., fetch('https://wecima.sarl/search/...'))
      if (!hasReplacedVar && providerData?.baseUrl) {
        const rawBase = providerData.baseUrl.replace(/\/$/, '');

        if (code.includes(rawBase)) {
          code = code.replaceAll(`'${rawBase}`, '`${BASE_URL}')
                    .replaceAll(`"${rawBase}`, '`${BASE_URL}')
                    .replaceAll(`\`${rawBase}`, '`${BASE_URL}');

          code = code.replace(/(export\s+async\s+function\s+[a-zA-Z0-9_$]+\s*\([^)]*\)\s*\{)/g, 
            `$1\n  const BASE_URL = await getOrUpdateDomain('${providerId}');`
          );
          modified = true;
        }
      }

      if (modified) {
        if (!code.includes('configHelper.js')) {
          code = `import { getOrUpdateDomain } from './configHelper.js';\n` + code;
        }
        await fs.writeFile(filePath, code, 'utf-8');
        console.log(`✅ Refactored: ${file}`);
        modifiedCount++;
      } else {
        // Prints the first non-comment code line to help diagnose unhandled formats
        const sample = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('//')).slice(0, 2).join(' | ');
        console.log(`⚠️ Unmatched format in ${file} -> First line: [ ${sample.substring(0, 80)}... ]`);
      }
    }

    console.log(`\n🎉 Refactored ${modifiedCount} additional source file(s)!`);
  } catch (err) {
    console.error(`❌ Error during refactor:`, err.message);
  }
}

refactorAllProviders();