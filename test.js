const fs = require('fs');
const path = require('path');

// Test targets matched by category to ensure target relevance
const QUERIES = {
  anime: { tmdbId: '37854', type: 'tv', title: 'ون بيس', englishTitle: 'One Piece', season: 1, episode: 1 },
  sports: { tmdbId: '', type: 'tv', title: 'مباراة', englishTitle: 'match', season: 1, episode: 1 },
  movie: { tmdbId: '550', type: 'movie', title: 'Fight Club', englishTitle: 'Fight Club' },
  default: { tmdbId: '115036', type: 'tv', title: 'طائر الرفراف', englishTitle: 'Yali Capkini', season: 1, episode: 1 }
};

function getQueryForProvider(id) {
  const name = id.toLowerCase();
  if (name.includes('anime') || name.includes('anim') || name.includes('toon')) return QUERIES.anime;
  if (name.includes('match') || name.includes('replay') || name.includes('live')) return QUERIES.sports;
  if (name.includes('aflaam') || name.includes('film') || name.includes('cinema')) return QUERIES.movie;
  return QUERIES.default;
}

async function testAllScrapers() {
  const manifestPath = path.join(__dirname, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ manifest.json not found. Run `node build.js` first!');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const scrapers = manifest.scrapers || manifest.providers || [];

  console.log(`\n==================================================`);
  console.log(`🚀 Testing ${scrapers.length} Scrapers with Category-Aware Queries`);
  console.log(`==================================================\n`);

  const results = { passed: [], empty: [], errored: [] };

  for (let i = 0; i < scrapers.length; i++) {
    const scraperInfo = scrapers[i];
    const providerId = scraperInfo.id || scraperInfo.name;
    const filePath = path.join(__dirname, scraperInfo.filename || `providers/${providerId}.js`);

    if (!fs.existsSync(filePath)) {
      console.log(`[${i + 1}/${scrapers.length}] ❌ ${providerId.padEnd(20)} -> File missing`);
      results.errored.push({ id: providerId, reason: 'File missing' });
      continue;
    }

    try {
      delete require.cache[require.resolve(filePath)];
      const module = require(filePath);
      const scraperFn = module.getStreams || module.scrape || (typeof module === 'function' ? module : null);

      if (!scraperFn) {
        console.log(`[${i + 1}/${scrapers.length}] ❌ ${providerId.padEnd(20)} -> No exported scrape/getStreams function`);
        results.errored.push({ id: providerId, reason: 'No export function' });
        continue;
      }

      const query = getQueryForProvider(providerId);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout (10s limit)')), 10000)
      );

      const streams = await Promise.race([scraperFn(query), timeoutPromise]);

      if (Array.isArray(streams) && streams.length > 0) {
        console.log(`[${i + 1}/${scrapers.length}] ✅ ${providerId.padEnd(20)} -> Found ${streams.length} stream(s)`);
        results.passed.push({ id: providerId, count: streams.length });
      } else {
        console.log(`[${i + 1}/${scrapers.length}] ⚠️ ${providerId.padEnd(20)} -> Returned 0 streams`);
        results.empty.push({ id: providerId, reason: '0 streams' });
      }
    } catch (err) {
      console.log(`[${i + 1}/${scrapers.length}] ❌ ${providerId.padEnd(20)} -> Error: ${err.message || err}`);
      results.errored.push({ id: providerId, reason: err.message || err });
    }
  }

  console.log(`\n==================================================`);
  console.log(`📊 SUMMARY: ${results.passed.length} Passed | ${results.empty.length} Empty | ${results.errored.length} Errored`);
  console.log(`==================================================\n`);
}

testAllScrapers();