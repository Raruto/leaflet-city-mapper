import assert from 'node:assert/strict';
import { After, AfterAll, Before, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox } from 'playwright';
import { build } from 'esbuild';
import { startServer } from '../../build/server.js';

setDefaultTimeout(10000);

// Shared by the 3D scenarios when COVERAGE_3D is enabled.
const coveredFunctions = new Map();

Before({ tags: '@coverage' }, async function () {
  if (process.env.COVERAGE_3D) {
    await this.page.coverage.startJSCoverage({ resetOnNavigation: false });
  }
});

After({ tags: '@coverage' }, async function () {
  if (!process.env.COVERAGE_3D) return;
  const entries = await this.page.coverage.stopJSCoverage();
  for (const entry of entries.filter(entry => entry.url.includes('/dist/'))) {
    for (const fn of entry.functions) {
      const range = fn.ranges[0];
      if (!fn.functionName) continue;
      const key = `${entry.url}:${range.startOffset}:${range.endOffset}`;
      const previous = coveredFunctions.get(key);
      coveredFunctions.set(key, {
        name: fn.functionName,
        line: entry.source.slice(0, range.startOffset).split('\n').length,
        covered: Boolean(range.count || previous?.covered),
      });
    }
  }
});

AfterAll(function () {
  if (!process.env.COVERAGE_3D || !coveredFunctions.size) return;
  const functions = [...coveredFunctions.values()];
  const covered = functions.filter(fn => fn.covered).length;
  console.log(`Layer3D named-function coverage: ${covered}/${functions.length} (${(covered / functions.length * 100).toFixed(1)}%)`);
  console.log('Uncovered functions:', functions.filter(fn => !fn.covered).map(fn => `${fn.name}:${fn.line}`).join(', '));
});

let server;
let browser;
let baseUrl;
let pluginBundle;

BeforeAll({ timeout: 60000 }, async () => {
  const result = await build({
    entryPoints: ['test/fixtures/plugin.js'],
    bundle: true,
    format: 'iife',
    minify: true,
    write: false,
  });
  pluginBundle = result.outputFiles[0].text;
  server = await startServer(0);
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

async function getBrowser() {
  if (browser) return;
  const testBrowser = process.env.TEST_BROWSER;
  const [engine, options] = testBrowser === 'firefox'
    // Windows throttles requestAnimationFrame in windows it considers occluded.
    ? [firefox, { firefoxUserPrefs: { 'widget.windows.window_occlusion_tracking.enabled': false } }]
    : [chromium, testBrowser === 'chrome' || testBrowser === 'msedge' ? { channel: testBrowser } : {}];
  const launchOptions = engine === chromium && process.platform === 'linux' && process.env.CI
    ? {
      ...options,
      args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-angle=vulkan', '--disable-vulkan-surface'],
    }
    : options;
  browser = await engine.launch(launchOptions);
  // Headless Firefox (and some GPUs/drivers) expose no WebGPU adapter: retry with a window when one can open.
  // Without any adapter the @coverage scenarios fail instead of being skipped.
  const page = await browser.newPage();
  await page.goto(baseUrl);
  const webgpu = await page.evaluate(async () => Boolean(await navigator.gpu?.requestAdapter()));
  await page.close();
  if (webgpu) return;
  const headed = await engine.launch({ ...launchOptions, headless: false }).catch(() => null);
  if (headed) {
    await browser.close();
    browser = headed;
  }
}

AfterAll({ timeout: 30000 }, async () => {
  await browser?.close();
  await new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  });
});

// @unit scenarios run in Node only and need no browser page.
Before({ tags: 'not @unit', timeout: 60000 }, async function () {
  await getBrowser();
  this.baseUrl = baseUrl;
  this.context = await browser.newContext();
  await this.context.route(/\.html(?:\?.*)?$/, async route => {
    const response = await route.fetch();
    const version = process.env.LEAFLET_VERSION;
    let body = (await response.text())
      .replace(/https:\/\/unpkg\.com\/leaflet-city-mapper@[^/]+\/dist\/leaflet-city-mapper\.js/g,
        `${baseUrl}/dist/leaflet-city-mapper.js`)
      .replace(/\bconst (map|esri|osm|layers|markers|path|circle|polygon|rectangle) =/g, 'const $1 = window.$1 =');
    if (version === '2') {
      body = body
        .replace(
          '<script src="https://unpkg.com/leaflet@1.9/dist/leaflet-src.js"></script>',
          '<script src="https://unpkg.com/leaflet@2.0.0-alpha.1/dist/leaflet-global-src.js"></script><script>globalThis.L = globalThis.leaflet;</script>'
        )
        .replace(
          '"leaflet": "https://unpkg.com/leaflet@1.9/dist/leaflet-src.js"',
          '"leaflet": "https://unpkg.com/leaflet@2.0.0-alpha.1/dist/leaflet-global-src.js"'
        )
        .replace('https://unpkg.com/leaflet@1.9/dist/leaflet.css', 'https://unpkg.com/leaflet@2.0.0-alpha.1/dist/leaflet.css');
    }
    await route.fulfill({ response, body, headers: response.headers() });
  });
  // Deterministic PMTiles: tests answer tiles through the exposed `pmtilesTile(url, z, x, y)` binding.
  const pmtilesMock = `const initialize = L.Layer.prototype.initialize;
    if (initialize && !initialize._testArchive) {
      L.Layer.prototype.initialize = Object.assign(function (options = {}) {
        const source = options.source;
        if (source?.url && source.type !== 'pmtiles' && source.type !== 'terrain' &&
          !/\\.(glb|gltf)(?:[?#]|$)/i.test(source.url) && !source.archive) {
          const url = new URL(source.url, document.baseURI).href;
          options = { ...options, source: { ...source, archive: {
            getHeader: async () => ['buildings', 'trees', 'streetlights'].some(name => url.endsWith('/paris-' + name + '.pmtiles'))
              ? { minZoom: 16, maxZoom: 16, minLon: 2.2424, minLat: 48.8162, maxLon: 2.416, maxLat: 48.9022 }
              : { minZoom: 11, maxZoom: 19 },
            getZxy: async (z, x, y) => {
              const tile = await window.pmtilesTile?.(url, z, x, y);
              if (tile?.error) throw new Error(tile.error);
              return tile ? { data: new TextEncoder().encode(tile).buffer } : undefined;
            },
          } } };
        }
        return initialize.call(this, options);
      }, initialize, { _testArchive: true });
    }`;
  const mockPMTiles = async route => {
    await route.fulfill({ contentType: 'text/javascript', body: `${pluginBundle}\n${pmtilesMock}` });
  };
  this.pluginBundle = pluginBundle;
  // Source-level checks and the instrumented bundle must share the same private state.
  await this.context.route('**/src/state.js', route => route.fulfill({
    contentType: 'text/javascript',
    body: 'export const cityMapper = globalThis.cityMapperTestState;',
  }));
  await this.context.route('**/dist/leaflet-city-mapper.js', mockPMTiles);
  this.page = await this.context.newPage();
});

After({ tags: 'not @unit' }, async function () {
  await this.context?.close();
});

// Firefox may take several seconds to create its first WebGPU adapter.
Before({ tags: '@coverage', timeout: 30000 }, async function () {
  await this.page.goto(baseUrl);
  const supported = await this.page.evaluate(async () =>
    Boolean(navigator.gpu && await navigator.gpu.requestAdapter()));
  assert.ok(supported, 'WebGPU adapter unavailable: 3D scenarios need a GPU-backed browser');
});
