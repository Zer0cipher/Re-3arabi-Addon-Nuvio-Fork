import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const PROVIDERS_DIR = path.resolve(import.meta.dirname, '../src/providers');

const TEST_PAYLOAD = {
  tmdbId: '550', // Fight Club
  type: 'movie',
  title: 'Fight Club'
};

async function testAll() {
  console.log('🚀 Running test suite against all providers...\n');
  
  const files = await fs.readdir(PROVIDERS_DIR);
  const providerFiles = files.filter(f => 
    f.endsWith('.js') && 
    !f.startsWith('_') && 
    !f.toLowerCase().includes('confighelper')
  );

  const results = [];

  for (const file of providerFiles) {
    const filePath = path.join(PROVIDERS_DIR, file);
    const providerName = path.basename(file, '.js');
    const startTime = Date.now();

    try {
      const provider = require(filePath);
      const getStreams = provider.getStreams || (typeof provider === 'function' ? provider : null);

      if (typeof getStreams !== 'function') {
        results.push({ Provider: providerName, Status: '❌ INVALID EXPORT', Streams: 0, Time: '0ms' });
        continue;
      }

      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout 10s')), 10000)
      );

      const streams = await Promise.race([
        getStreams(TEST_PAYLOAD),
        timeout
      ]);

      const duration = `${Date.now() - startTime}ms`;
      const streamCount = Array.isArray(streams) ? streams.length : 0;

      results.push({
        Provider: providerName,
        Status: streamCount > 0 ? '✅ WORKING' : '⚠️ NO RESULTS',
        Streams: streamCount,
        Time: duration
      });
    } catch (err) {
      results.push({
        Provider: providerName,
        Status: `❌ ERROR: ${err.message}`,
        Streams: 0,
        Time: `${Date.now() - startTime}ms`
      });
    }
  }

  console.table(results);
  console.log('\n✨ Test run finished!');
}

testAll();