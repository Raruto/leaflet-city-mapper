import assert from 'node:assert/strict';
import { After, AfterAll, Before, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox } from 'playwright';
import { startServer } from '../../build/server.js';

setDefaultTimeout(10000);

let server;
let browser;
let baseUrl;

BeforeAll({ timeout: 60000 }, async () => {
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
  browser = await engine.launch(options);
  // Headless Firefox (and some GPUs/drivers) expose no WebGPU adapter: retry with a window when one can open.
  // Without any adapter the @3d-layer scenarios fail instead of being skipped.
  const page = await browser.newPage();
  await page.goto(baseUrl);
  const webgpu = await page.evaluate(async () => Boolean(await navigator.gpu?.requestAdapter()));
  await page.close();
  if (webgpu) return;
  const headed = await engine.launch({ ...options, headless: false }).catch(() => null);
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
  await this.context.route(/.html$/, async route => {
    const response = await route.fetch();
    const version = process.env.LEAFLET_VERSION;
    let body = (await response.text())
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
  const pmtilesMock = `for (const prototype of [L.Layer.types?.pmtiles?.prototype, L.Layer.types?.['3d']?.prototype].filter(Boolean)) {
      prototype.getHeader = async function () {
        return ['buildings', 'trees', 'streetlights'].some(name => this.url.endsWith('/paris-' + name + '.pmtiles'))
          ? { minZoom: 16, maxZoom: 16, minLon: 2.2424, minLat: 48.8162, maxLon: 2.416, maxLat: 48.9022 }
          : { minZoom: 11, maxZoom: 19 };
      };
      prototype.getZxy = async function (z, x, y) {
        const tile = await window.pmtilesTile?.(this.url, z, x, y);
        if (tile?.error) throw new Error(tile.error);
        return tile ? { data: new TextEncoder().encode(tile).buffer } : undefined;
      };
    }`;
  const mockPMTiles = async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: `${await response.text()}\n${pmtilesMock}` });
  };
  await this.context.route('**/dist/3d/types/*.js', mockPMTiles);
  this.page = await this.context.newPage();
});

After({ tags: 'not @unit' }, async function () {
  await this.context.close();
});

// Firefox may take several seconds to create its first WebGPU adapter.
Before({ tags: '@3d-layer', timeout: 30000 }, async function () {
  await this.page.goto(baseUrl);
  const supported = await this.page.evaluate(async () =>
    Boolean(navigator.gpu && await navigator.gpu.requestAdapter()));
  assert.ok(supported, 'WebGPU adapter unavailable: 3D scenarios need a GPU-backed browser');
});
