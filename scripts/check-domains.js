import fs from 'node:fs';
import path from 'node:path';

const __dirname = import.meta.dirname;

// Paths to check and update
const SEARCH_DIRS = [
  path.resolve(__dirname, '../src/providers'),
  path.resolve(__dirname, '../src/scrapers'),
  path.resolve(__dirname, '../src/sources'),
  path.resolve(__dirname, '../src')
];
const DOMAINS_FILE = path.join(__dirname, 'domains.json');

// Request headers to emulate a real desktop browser
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8'
};

// Full database of all scrapers with expanded active mirror candidate lists
const PROVIDERS = {
  '3isk': { name: '3isk (قصة عشق)', keywords: ['قصة عشق', '3isk'], domains: ['https://aa.3ick.net', 'https://3isk.biz', 'https://3isk.tv', 'https://3isk.co'] },
  'aflaam': { name: 'Aflaam', keywords: ['افلام', 'aflaam'], domains: ['https://aflaam.com', 'https://aflaam.net'] },
  'aia2tv': { name: 'Aia2tv', keywords: ['aia2tv'], domains: ['https://aia2tv.com', 'https://aia2tv.net'] },
  'akwam': { name: 'Akwam', keywords: ['أكوام', 'akwam'], domains: ['https://akwam.cz', 'https://akwam.cx', 'https://akwam.to', 'https://ak.akwam.link', 'https://akwam.im'] },
  'alooytv': { name: 'Alooytv', keywords: ['الويم تيفي', 'alooytv'], domains: ['https://fitnur.com', 'https://alooytv.com'] },
  'anim3rb': { name: 'Anim3rb', keywords: ['انمي عرب', 'anim3rb'], domains: ['https://anime3rb.com', 'https://anim3rb.com'] },
  'anime-phoenix': { name: 'Anime Phoenix', keywords: ['anime phoenix'], domains: ['https://anime-phoenix.com'] },
  'anime4up': { name: 'Anime4Up', keywords: ['انمي فور اب', 'anime4up'], domains: ['https://anime4up.com', 'https://w1.anime4up.rest', 'https://anime4up.tv', 'https://anime4up.net', 'https://anime4up.org'] },
  'animerco': { name: 'Animerco', keywords: ['animerco'], domains: ['https://animerco.com', 'https://animerco.org'] },
  'animewitcher': { name: 'AnimeWitcher', keywords: ['animewitcher'], domains: ['https://www.animewitcher.com', 'https://animewitcher.com'] },
  'bristege': { name: 'Bristege', keywords: ['برستيج', 'brstej'], domains: ['https://hd1.brstej.com', 'https://brstij.cam', 'https://brstej.com', 'https://brstej.org'] },
  'cee': { name: 'Cee', keywords: ['cee'], domains: ['https://cee.co'] },
  'cimaclub': { name: 'CimaClub', keywords: ['سيما كلوب', 'cimaclub'], domains: ['https://cimaclub.watch', 'https://cimaclub.com', 'https://cimaclub.net'] },
  'cimalight': { name: 'CimaLight', keywords: ['سيما لايت', 'cimalight'], domains: ['https://cimalight.online', 'https://cimalight.com'] },
  'cima4u': { name: 'Cima4U', keywords: ['سيما فور يو', 'cima4u'], domains: ['https://cima4u.land', 'https://cima4u.tv', 'https://cima4u.vip', 'https://cima4u.cc', 'https://cima4u.net'] },
  'cimatn': { name: 'CimaTN', keywords: ['cimatn'], domains: ['https://www.cimatn.com', 'https://cimatn.com'] },
  'cinemana': { name: 'Cinemana', keywords: ['cinemana'], domains: ['https://cinemana.shabakaty.com'] },
  'dima-toon': { name: 'DimaToon', keywords: ['ديما تون', 'dimatoon'], domains: ['https://dimatoon.com'] },
  'egydead': { name: 'EgyDead', keywords: ['ايجي ديد', 'egydead'], domains: ['https://egydead.cc', 'https://egydead.ca', 'https://tv10.egydead.live', 'https://egydead.com', 'https://egydead.me'] },
  'elif': { name: 'Elif', keywords: ['elif'], domains: ['https://elif.com'] },
  'eseek': { name: 'Eseek', keywords: ['eseek'], domains: ['https://eseek.org'] },
  'faselhd': { name: 'FaselHD', keywords: ['فاصل اعلاني', 'faselhd'], domains: ['https://faselhd.co', 'https://www.fasel-hd.cam', 'https://fasel-hd.ac', 'https://faselhd.stream', 'https://fasel-hd.com'] },
  'krmzy': { name: 'Krmzy', keywords: ['krmzy'], domains: ['https://krmzy.org', 'https://krmzy.com'] },
  'lodynet': { name: 'LodyNet', keywords: ['لودي نت', 'lodynet'], domains: ['https://lodynet.to', 'https://lodynet.watch', 'https://lodynet.pro', 'https://lodynet.me', 'https://lodynet.show'] },
  'mycima': { name: 'MyCima / Wecima', keywords: ['ماي سيما', 'wecima', 'mycima'], domains: ['https://wecima.sarl', 'https://wecima.show', 'https://mycima.mx', 'https://wecima.stream', 'https://wecima.to'] },
  'replaymatch': { name: 'ReplayMatch', keywords: ['replaymatch'], domains: ['https://replaymatch.com'] },
  'shahid4u': { name: 'Shahid4u', keywords: ['شاهد فور يو', 'shahid4u'], domains: ['https://shahid4u.land', 'https://shaahid4u.net', 'https://shahid4u.com', 'https://sh4u.site', 'https://shahid4u.im', 'https://shahid4u.link'] },
  'shahidwbas': { name: 'ShahidWbas', keywords: ['shahidwbas'], domains: ['https://shahidwbas.com'] },
  'syria-live': { name: 'Syria Live', keywords: ['syria-live'], domains: ['https://syria-live.com'] },
  'topcinema': { name: 'TopCinema', keywords: ['تاوب سيما', 'topcinema'], domains: ['https://topcinema.cam', 'https://topcinema.top', 'https://topcinema.my'] },
  'tuktukcima': { name: 'TukTukCima', keywords: ['تكتك سيما', 'tuktukhd'], domains: ['https://tuktukhd.com', 'https://tuktukcima.com'] },
  'tuniflexblog': { name: 'TuniflexBlog', keywords: ['tuniflexblog'], domains: ['https://tuniflexblog.com'] },
  'tuniflix': { name: 'Tuniflix', keywords: ['tuniflix'], domains: ['https://tuniflix.com'] },
  'tvgarden': { name: 'TVGarden', keywords: ['tvgarden'], domains: ['https://tvgarden.com'] },
  'arabseed': { name: 'ArabSeed', keywords: ['عرب سيد', 'arabseed'], domains: ['https://a.arabseed.net', 'https://arabseed.show', 'https://arabseed.net', 'https://arabseed.live', 'https://arabseed.mobi'] },
  'viu': { name: 'Viu', keywords: ['viu'], domains: ['https://www.viu.com'] },
  'wecima': { name: 'Wecima', keywords: ['وي سيما', 'wecima'], domains: ['https://wecima.sarl', 'https://wecima.show', 'https://wecima.stream', 'https://wecima.to', 'https://wecima.app'] },
  'witanime': { name: 'WitAnime', keywords: ['وايت انمي', 'witanime'], domains: ['https://witanime.red', 'https://w1.witanime.cyou', 'https://witanime.xyz', 'https://witanime.com', 'https://witanime.cyou', 'https://witanime.pics', 'https://witanime.tv'] },
  'yacintv': { name: 'YacinTV', keywords: ['yacineapk'], domains: ['https://www.yacineapk.tv'] },
  'youtube': { name: 'YouTube', keywords: ['youtube'], domains: ['https://www.youtube.com'] }
};

// Check if a URL responds with a valid HTTP status
async function checkDomainHealth(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(url, {
      method: 'GET',
      headers: HEADERS,
      signal: controller.signal,
      redirect: 'follow'
    });

    clearTimeout(timeoutId);

    if (res.ok || (res.status >= 300 && res.status < 400)) {
      return { alive: true, finalUrl: res.url || url, status: res.status };
    }
  } catch (err) {
    // Domain unresolvable or timed out
  }
  return { alive: false, finalUrl: null, status: null };
}

// Scrape search engines to discover active unlisted mirrors
async function searchForActiveDomain(providerKey, keywords) {
  console.log(`  🔍 Searching web engines for [${providerKey}] fallback...`);
  const query = encodeURIComponent(`موقع ${keywords[0]} الاصلي`);
  
  const searchEndpoints = [
    `https://html.duckduckgo.com/html/?q=${query}`,
    `https://www.bing.com/search?q=${query}`
  ];

  for (const endpoint of searchEndpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(endpoint, { headers: HEADERS, signal: controller.signal });
      clearTimeout(timeoutId);

      const html = await response.text();
      const matches = html.match(/https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      const blacklist = ['duckduckgo', 'google', 'bing', 'facebook', 'twitter', 'youtube', 'github', 'wikipedia', 't.me', 'instagram'];

      const candidates = [...new Set(matches)].filter(url => 
        !blacklist.some(b => url.includes(b)) && 
        keywords.some(k => url.toLowerCase().includes(k.toLowerCase()) || url.toLowerCase().includes(providerKey.toLowerCase()))
      );

      for (const candidate of candidates) {
        const health = await checkDomainHealth(candidate);
        if (health.alive) {
          console.log(`    ✨ Discovered working mirror via search engine: ${health.finalUrl}`);
          return health.finalUrl;
        }
      }
    } catch (err) {
      // Continue to next search engine endpoint
    }
  }
  return null;
}

// Search local code directories and update BASE_URL in source files
function updateProviderSourceFiles(providerKey, liveUrl) {
  let updatedAny = false;

  for (const targetDir of SEARCH_DIRS) {
    if (!fs.existsSync(targetDir)) continue;

    const files = fs.readdirSync(targetDir);
    const matchedFiles = files.filter(f => f.toLowerCase().includes(providerKey.toLowerCase()) && (f.endsWith('.js') || f.endsWith('.ts')));

    for (const matchedFile of matchedFiles) {
      const filePath = path.join(targetDir, matchedFile);
      let content = fs.readFileSync(filePath, 'utf8');

      // Matches BASE_URL, baseUrl, DOMAIN, HOST declarations
      const regex = /(const|let|var)\s+(BASE_URL|baseUrl|DOMAIN|HOST|SERVER_URL)\s*=\s*['"]([^'"]+)['"]/gi;
      
      if (regex.test(content)) {
        const updatedContent = content.replace(regex, `$1 $2 = '${liveUrl}'`);
        if (content !== updatedContent) {
          fs.writeFileSync(filePath, updatedContent, 'utf8');
          console.log(`  └─ ✏️ Updated file: ${path.relative(process.cwd(), filePath)} ➔ ${liveUrl}`);
          updatedAny = true;
        }
      }
    }
  }
  return updatedAny;
}

// Main execution process
async function main() {
  console.log('🚀 Starting Comprehensive Domain Health Check for ALL Scrapers...\n');
  const activeDomains = {};

  for (const [key, provider] of Object.entries(PROVIDERS)) {
    console.log(`Checking [${provider.name}]...`);
    let workingUrl = null;

    // 1. Check pre-configured domain candidate list
    for (const domain of provider.domains) {
      process.stdout.write(`  Trying ${domain} ... `);
      const health = await checkDomainHealth(domain);

      if (health.alive) {
        console.log(`✅ Alive! (${health.status})`);
        workingUrl = health.finalUrl || domain;
        break;
      } else {
        console.log(`❌ Offline`);
      }
    }

    // 2. Fall back to search engines if all hardcoded candidate domains fail
    if (!workingUrl) {
      workingUrl = await searchForActiveDomain(key, provider.keywords);
    }

    if (workingUrl) {
      activeDomains[key] = workingUrl;
      const updated = updateProviderSourceFiles(key, workingUrl);
      if (!updated) {
        console.log(`  └─ ℹ️ Saved to mapping (No matching source file modified)`);
      }
    } else {
      console.log(`🚨 No working domains found for [${provider.name}]`);
    }
    console.log('');
  }

  // Save full mapping to domains.json
  fs.writeFileSync(DOMAINS_FILE, JSON.stringify(activeDomains, null, 2), 'utf8');
  console.log(`\n💾 Execution complete! Updated provider source code files and saved current domain map to:\n   ${DOMAINS_FILE}`);
}

main().catch(console.error);