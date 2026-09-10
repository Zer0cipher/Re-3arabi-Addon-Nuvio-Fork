import fs from 'node:fs/promises';
import path from 'node:path';

const PROVIDERS_DIR = path.resolve(import.meta.dirname, '../src/providers');

async function cleanProviders() {
  const files = await fs.readdir(PROVIDERS_DIR);
  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const filePath = path.join(PROVIDERS_DIR, file);
    let code = await fs.readFile(filePath, 'utf-8');

    if (code.includes("import { getOrUpdateDomain } from './configHelper.js';\n")) {
      code = code.replace("import { getOrUpdateDomain } from './configHelper.js';\n", '');
      await fs.writeFile(filePath, code, 'utf-8');
      console.log(`🧹 Cleaned: ${file}`);
    }
  }
  console.log('✨ Clean up complete!');
}

cleanProviders();