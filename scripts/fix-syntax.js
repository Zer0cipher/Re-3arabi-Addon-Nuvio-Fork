import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const PROVIDERS_DIR = path.resolve(import.meta.dirname, '../src/providers');

const STUB_TEMPLATE = `// Auto-generated fallback stub
module.exports = {
  getStreams: async () => []
};
`;

async function checkAndFixSyntax() {
  console.log('🔍 Scanning provider files for syntax errors...\n');

  const files = await fs.readdir(PROVIDERS_DIR);
  const jsFiles = files.filter(f => f.endsWith('.js') && !f.startsWith('_'));

  let fixed = 0;
  let syntaxErrors = 0;
  let clean = 0;

  for (const file of jsFiles) {
    const filePath = path.join(PROVIDERS_DIR, file);
    const code = await fs.readFile(filePath, 'utf8');

    // 1. Auto-fix completely empty or whitespace-only files
    if (!code.trim()) {
      await fs.writeFile(filePath, STUB_TEMPLATE, 'utf8');
      console.log(`🛠️ AUTO-FIXED (Empty file stubbed): ${file}`);
      fixed++;
      continue;
    }

    // 2. Parse JavaScript syntax
    try {
      new vm.Script(code, { filename: file });
      clean++;
    } catch (err) {
      if (err instanceof SyntaxError) {
        // Auto-fix files that cut off mid-code ("Unexpected end of input")
        if (err.message.includes('Unexpected end of input')) {
          await fs.writeFile(filePath, STUB_TEMPLATE, 'utf8');
          console.log(`🛠️ AUTO-FIXED (Unfinished script stubbed): ${file}`);
          fixed++;
        } else {
          console.log(`❌ SYNTAX ERROR [${file}]: ${err.message}`);
          syntaxErrors++;
        }
      } else {
        console.log(`⚠️ UNKNOWN ERROR [${file}]: ${err.message}`);
        syntaxErrors++;
      }
    }
  }

  console.log(`\n📊 Scan Complete:`);
  console.log(`   - Clean: ${clean}`);
  console.log(`   - Auto-fixed: ${fixed}`);
  console.log(`   - Syntax Errors Remaining: ${syntaxErrors}`);
}

checkAndFixSyntax();