import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const cache = new URL('../../node_modules/.cache/browser-test-dependencies/', import.meta.url);
const files = new Map();
for (const version of ['1.9.4', '2.0.0-beta.3']) {
  const leaflet2 = version.startsWith('2.');
  for (const file of [leaflet2 ? 'leaflet-global.js' : 'leaflet-src.js', 'leaflet.css',
    ...(!leaflet2 ? ['images/marker-icon.png', 'images/marker-icon-2x.png', 'images/marker-shadow.png',
      'images/layers.png', 'images/layers-2x.png'] : [])]) {
    files.set(`https://unpkg.com/leaflet@${version}/dist/${file}`, new URL(`leaflet-${version}/${file}`, cache));
  }
}
for (const file of ['dist/ol.js', 'ol.css']) {
  files.set(`https://cdn.jsdelivr.net/npm/ol@10.6.1/${file}`, new URL(`ol-10.6.1/${file}`, cache));
}

export function dependencyFile(url) {
  const file = files.get(url.replace('leaflet@1.9/', 'leaflet@1.9.4/'));
  return file && fileURLToPath(file);
}

export async function prepareDependencies() {
  for (const [url, file] of files) {
    try {
      if ((await readFile(file)).length) continue;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    console.log(`Downloading test dependency: ${url}`);
    const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error(`Test dependency ${url}: HTTP ${response.status}`);
    const body = Buffer.from(await response.arrayBuffer());
    if (!body.length) throw new Error(`Test dependency ${url}: empty response`);
    await mkdir(new URL('.', file), { recursive: true });
    await writeFile(file, body);
  }
}
