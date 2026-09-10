import fs from 'node:fs/promises';
import path from 'node:path';

const CONFIG_PATH = path.resolve('scrapers.config.json');
const PROVIDERS_DIR = path.resolve('providers');
const TIMEOUT_MS = 6000;

const COMMON_TLDS = ['.sarl', '.live', '.cam', '.site', '.net', '.co', '.org', '.top', '.tv', '.com', '.me', '.run', '.vip', '.pro', '.info'];
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

async function checkUrlHealth(url, keywords = []) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      redirect: 'follow',
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!res.ok) return { ok: false, finalUrl: null };

    const finalUrl = res.url;
    if (finalUrl.includes('expireddomains') || finalUrl.includes('dan.com') || finalUrl.includes('sedo.com')) {
      return { ok: false, finalUrl: null };
    }

    const html = (await res.text()).toLowerCase();
    const matchesKeyword = keywords.length === 0 || keywords.some(kw => html.includes(kw.toLowerCase()));

    return { ok: matchesKeyword, finalUrl };
  } catch {
    clearTimeout(timer);
    return { ok: false, finalUrl: null };
  }
}

function generateCandidateDomains(baseUrl) {
  const candidates = new Set();
  try {
    const parsed = new URL(baseUrl);
    const domainParts = parsed.hostname.replace(/^www\./, '').split('.');
    const rawName = domainParts[0];

    for (const tld of COMMON_TLDS) {
      candidates.add(`${parsed.protocol}//${rawName}${tld}`);
      candidates.add(`${parsed.protocol}//www.${rawName}${tld}`);
    }

    for (let i = 1; i <= 10; i++) {
      candidates.add(`${parsed.protocol}//tv${i}.${rawName}.live`);
      candidates.add(`${parsed.protocol}//w${i}.${rawName}.tv`);
      candidates.add(`${parsed.protocol}//w${i}.${rawName}.com`);
    }
  } catch {}
  return Array.from(candidates);
}

async function updateProviderSourceFile(providerId, newUrl) {
  try {
    const files = await fs.readdir(PROVIDERS_DIR);
    const targetFile = files.find(f => f.toLowerCase() === `${providerId.toLowerCase()}.js` || f.toLowerCase() === `${providerId.toLowerCase()}.ts`);

    if (!targetFile) return false;

    const filePath = path.join(PROVIDERS_DIR, targetFile);
    let code = await fs.readFile(filePath, 'utf-8');

    const urlRegex = /(const|let|var)\s+(BASE_URL|baseUrl|domain|URL)\s*=\s*['"`][^'"`]+['"`]/g;

    if (urlRegex.test(code)) {
      const match = code.match(/(const|let|var)\s+(BASE_URL|baseUrl|domain|URL)/);
      const varType = match[1];
      const varName = match[2];

      code = code.replace(urlRegex, `${varType} ${varName} = '${newUrl.replace(/\/$/, '')}'`);
      await fs.writeFile(filePath, code, 'utf-8');
      console.log(`   └─ 📝 Source code updated: providers/${targetFile}`);
      return true;
    }
  } catch (err) {
    console.error(`   └─ ⚠️ Failed to update source file for [${providerId}]:`, err.message);
  }
  return false;
}

async function resolveAllProviders() {
  console.log("=================================================");
  console.log(" 🚀 PRE-BUILD PROVIDER DOMAIN HEALTH CHECK      ");
  console.log("=================================================\n");

  const rawData = await fs.readFile(CONFIG_PATH, 'utf-8');
  const config = JSON.parse(rawData);
  let updatedCount = 0;

  for (const [providerId, providerData] of Object.entries(config.providers)) {
    process.stdout.write(`🔍 Testing [${providerId}] (${providerData.baseUrl}) ... `);

    // 1. Test current configured domain
    const primaryCheck = await checkUrlHealth(providerData.baseUrl, providerData.keywords);
    if (primaryCheck.ok) {
      const cleanUrl = primaryCheck.finalUrl.replace(/\/$/, '');
      if (cleanUrl !== providerData.baseUrl.replace(/\/$/, '')) {
        console.log(`🔄 Redirected to ${cleanUrl}`);
        providerData.baseUrl = cleanUrl;
        updatedCount++;
        await updateProviderSourceFile(providerId, cleanUrl);
      } else {
        console.log(`✅ Operational`);
      }
      continue;
    }

    console.log(`❌ Offline.`);
    console.log(`   ├─ Probing configured fallbacks and TLD variants...`);

    let workingUrl = null;

    // 2. Test configured fallbacks
    for (const fallback of providerData.fallbacks || []) {
      const fallbackCheck = await checkUrlHealth(fallback, providerData.keywords);
      if (fallbackCheck.ok) {
        workingUrl = fallbackCheck.finalUrl.replace(/\/$/, '');
        break;
      }
    }

    // 3. Probe domain variations
    if (!workingUrl) {
      const candidates = generateCandidateDomains(providerData.baseUrl);
      for (const candidate of candidates) {
        const candidateCheck = await checkUrlHealth(candidate, providerData.keywords);
        if (candidateCheck.ok) {
          workingUrl = candidateCheck.finalUrl.replace(/\/$/, '');
          break;
        }
      }
    }

    // 4. Update configuration and source file if working domain was found
    if (workingUrl) {
      console.log(`   ├─ ✅ DISCOVERED ACTIVE MIRROR: ${workingUrl}`);
      if (!providerData.fallbacks.includes(providerData.baseUrl)) {
        providerData.fallbacks.push(providerData.baseUrl);
      }
      providerData.baseUrl = workingUrl;
      updatedCount++;

      await updateProviderSourceFile(providerId, workingUrl);
    } else {
      console.log(`   └─ ⚠️ No active mirror found for [${providerId}]. Retaining existing entry.`);
    }
  }

  if (updatedCount > 0) {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
    console.log(`\n✨ Successfully updated ${updatedCount} provider URL(s) in scrapers.config.json`);
  } else {
    console.log(`\n✅ All providers are online and using current domains.`);
  }
}

resolveAllProviders().catch(err => {
  console.error("Fatal error running provider resolution:", err);
  process.exit(1);
});