import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { After, AfterAll, Before, BeforeAll, Status, setDefaultTimeout, setDefinitionFunctionWrapper } from '@cucumber/cucumber';
import { chromium, firefox } from 'playwright';
import { build } from 'esbuild';
import { startServer } from '../../build/server.js';
import { fulfillTrafficRoute } from '../fixtures/traffic-data.js';
import { prepareDependencies } from '../fixtures/dependencies.js';
import { createTestContext, createTestPage, fetchLocal, resetTestContext } from '../fixtures/browser-environment.js';
import { withScenarioBudget } from './scenario-budget.js';
import { focusParisLayers } from '../fixtures/focused-paris.js';

setDefaultTimeout(10000);
setDefinitionFunctionWrapper(withScenarioBudget);

// Shared by the 3D scenarios when COVERAGE_3D is enabled.
const coveredFunctions = new Map();
const scenarioTimings = [];

Before(function () {
  this.scenarioStarted = performance.now();
});

After({ wrapperOptions: { cleanup: true } }, function ({ pickle, result }) {
  scenarioTimings.push({
    name: pickle.name, status: result.status,
    seconds: (performance.now() - this.scenarioStarted) / 1000,
  });
});

AfterAll(function () {
  console.log('\nSlowest scenarios (including setup and cleanup):');
  for (const timing of scenarioTimings.sort((a, b) => b.seconds - a.seconds).slice(0, 10)) {
    console.log(`${timing.seconds.toFixed(2)}s [${timing.status}] ${timing.name}`);
  }
});

Before({ tags: '@coverage and not @unit' }, async function () {
  if (process.env.COVERAGE_3D) {
    await this.page.coverage.startJSCoverage({ resetOnNavigation: false });
  }
});

After({ tags: '@coverage and not @unit', wrapperOptions: { cleanup: true } }, async function () {
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
let webgpu;
let context;
const unexpectedRequests = [];
let baseUrl;
let pluginBundle;
const fetchNode = globalThis.fetch;

BeforeAll({ timeout: 900000 }, async () => {
  globalThis.fetch = fetchLocal;
  await prepareDependencies();
  const result = await build({
    entryPoints: ['test/fixtures/plugin.js'],
    bundle: true,
    format: 'iife',
    define: { 'import.meta': 'null' },
    minify: true,
    write: false,
    plugins: [{
      name: 'shared-test-weakmaps',
      setup(builder) {
        builder.onLoad({ filter: /[\\/]src[\\/]weakmaps[\\/][^\\/]+\.js$/ }, async ({ path }) => {
          const contents = await readFile(path, 'utf8');
          const names = [...contents.matchAll(/export const (\w+)\s*=/g)].map(match => match[1]);
          assert.ok(names.length, `No state exports in ${path}`);
          return { contents: `${contents}\nObject.assign(globalThis.testWeakmaps ??= {}, { ${names.join(', ')} });` };
        });
      },
    }],
  });
  pluginBundle = result.outputFiles[0].text;
  server = await startServer(0);
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  if (process.platform === 'linux' && process.env.CI) {
    await getBrowser();
    assert.ok(webgpu, 'WebGPU adapter unavailable during CI setup; see Chromium GPU diagnostics above');
  }
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
      channel: options.channel || 'chromium',
      // Use Chromium's bundled software adapters, not the runner's GPU drivers.
      args: ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader',
        '--use-angle=swiftshader', '--use-webgpu-adapter=swiftshader',
        '--enable-features=Vulkan', '--use-vulkan=swiftshader', '--disable-vulkan-surface'],
    }
    // Windows needs a window for WebGPU; avoid launching and closing a headless browser first.
    : {
      ...options, headless: process.platform !== 'win32',
      // The auxiliary DX12 diagnostic process can stall Chromium shutdown on Windows.
      args: process.platform === 'win32' && engine === chromium
        ? ['--disable-gpu-process-for-dx12-info-collection'] : undefined,
    };
  browser = await engine.launch(launchOptions);
  // Headless Firefox (and some GPUs/drivers) expose no WebGPU adapter: retry with a window when one can open.
  // Without any adapter the @coverage scenarios fail instead of being skipped.
  const page = await browser.newPage();
  await page.goto(baseUrl);
  webgpu = await page.evaluate(async () => {
    const adapter = await navigator.gpu?.requestAdapter();
    if (!adapter) return false;
    const device = await adapter.requestDevice();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('webgpu');
    try {
      if (!context) throw new Error('Unable to create the WebGPU test canvas');
      context.configure({ device, format: navigator.gpu.getPreferredCanvasFormat() });
      device.pushErrorScope('validation');
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({ colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: [0, 0, 0, 0], loadOp: 'clear', storeOp: 'store',
      }] });
      pass.end();
      device.queue.submit([encoder.finish()]);
      await device.queue.onSubmittedWorkDone();
      const error = await device.popErrorScope();
      if (error) throw new Error(`WebGPU test rendering failed: ${error.message}`);
      return true;
    } finally {
      context?.unconfigure();
      device.destroy();
    }
  });
  await page.close();
  if (webgpu) return;
  if (process.env.CI || launchOptions.headless === false) {
    if (engine === chromium) {
      const session = await browser.newBrowserCDPSession();
      const { gpu } = await session.send('SystemInfo.getInfo');
      console.error('Chromium GPU diagnostics:', JSON.stringify(gpu, null, 2));
      await session.detach();
    }
    return;
  }
  const headed = await engine.launch({ ...launchOptions, headless: false }).catch(() => null);
  if (headed) {
    await browser.close();
    browser = headed;
    const page = await browser.newPage();
    await page.goto(baseUrl);
    webgpu = await page.evaluate(async () => Boolean(await navigator.gpu?.requestAdapter()));
    await page.close();
  }
}

// GPU-process shutdown on Windows can take about a minute even after all pages close.
AfterAll({ timeout: process.platform === 'win32' ? 90000 : 30000 }, async () => {
  try {
    await context?.close();
    await browser?.close();
  } finally {
    globalThis.fetch = fetchNode;
    if (server) {
      await new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
        server.closeAllConnections();
      });
    }
  }
});

// @unit scenarios run in Node only and need no browser page.
Before({ tags: 'not @unit', timeout: 30000 }, async function () {
  await getBrowser();
  this.baseUrl = baseUrl;
  if (context) await resetTestContext(context, unexpectedRequests);
  else context = await createTestContext(browser, unexpectedRequests);
  this.unexpectedRequests = unexpectedRequests;
  this.context = context;
  await this.context.route('**/api/explore/v2.1/catalog/datasets/**', fulfillTrafficRoute);
  await this.context.route('**/libs/leaflet.js', async route => {
    if (new URL(route.request().url()).origin !== baseUrl) return route.fallback();
    const response = await route.fetch();
    let body = (await response.text())
      .replace(/https:\/\/unpkg\.com\/leaflet-city-mapper(?:@[^/\s"'<>]+)?\//g, `${baseUrl}/`);
    if (process.env.LEAFLET_VERSION === '2') {
      body = body
        .replace('https://unpkg.com/leaflet@1.9/dist/leaflet-src.js',
          'https://unpkg.com/leaflet@2.0.0-beta.3/dist/leaflet-global.js')
        .replace('https://unpkg.com/leaflet@1.9/dist/leaflet.css',
          'https://unpkg.com/leaflet@2.0.0-beta.3/dist/leaflet.css');
    }
    await route.fulfill({ response, body });
  });
  await this.context.route(/\.html(?:\?.*)?$/, async route => {
    if (new URL(route.request().url()).origin !== baseUrl) return route.fallback();
    const response = await route.fetch();
    const version = process.env.LEAFLET_VERSION;
    let body = (await response.text())
      .replace(/https:\/\/unpkg\.com\/leaflet-city-mapper(?:@[^/\s"'<>]+)?\//g, `${baseUrl}/`)
      .replace(/\bconst (map|esri|osm|layers|markers|path|circle|polygon|rectangle) =/g, 'const $1 = window.$1 =')
      .replace('const layers = window.layers = {', 'const layers = window.nativeLayers = window.layers = {');
    if (this.focusedParisLayers && new URL(route.request().url()).pathname === '/examples/leaflet-city-mapper.html') {
      body = focusParisLayers(body, this.focusedParisLayers);
    }
    if (this.focusedRomeGeometry && new URL(route.request().url()).pathname === '/examples/leaflet-city-mapper-rome.html') {
      body = body.replace("url: 'data/colosseum-lights.json',",
        "data: { type: 'FeatureCollection', features: [] },")
        .replace('new L.Control.Time().layer.addTo(map);', '');
    }
    if (version === '2') {
      body = body
        .replace(
          '<script src="https://unpkg.com/leaflet@1.9/dist/leaflet-src.js"></script>',
          '<script src="https://unpkg.com/leaflet@2.0.0-beta.3/dist/leaflet-global.js"></script>'
        )
        .replace(
          '"leaflet": "https://unpkg.com/leaflet@1.9/dist/leaflet-src.js"',
          '"leaflet": "https://unpkg.com/leaflet@2.0.0-beta.3/dist/leaflet-global.js"'
        )
        .replace('https://unpkg.com/leaflet@1.9/dist/leaflet.css', 'https://unpkg.com/leaflet@2.0.0-beta.3/dist/leaflet.css');
    }
    await route.fulfill({ response, body, headers: response.headers() });
  });
  // Deterministic PMTiles: tests answer tiles through the exposed `pmtilesTile(url, z, x, y)` binding.
  const pmtilesMock = `{
      const Layer = L.Layer, initialize = Layer.prototype.initialize;
      const withArchive = function (options = {}) {
        const source = options.source;
        if (source?.url && source.type !== 'raster' && source.type !== 'terrain' &&
          !/\\.(glb|gltf|tif|tiff)(?:[?#]|$)/i.test(source.url) && !source.archive) {
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
        return options;
      };
      if (L.version.startsWith('2.')) {
        L.Layer = new Proxy(Layer, {
          construct(target, args, newTarget) {
            return Reflect.construct(target, [withArchive(args[0]), ...args.slice(1)], newTarget);
          },
        });
        L.Layer.prototype.constructor = L.Layer;
      } else {
        L.Layer.prototype.initialize = function (options) {
          return initialize.call(this, withArchive(options));
        };
      }
    }`;
  const mockPMTiles = async route => {
    await route.fulfill({ contentType: 'text/javascript', body: `${pluginBundle}\n${pmtilesMock}` });
  };
  this.pluginBundle = pluginBundle;
  // Source-level checks and the instrumented bundle share each global's identity.
  await this.context.route(/\/src\/(?:globals|weakmaps)\/[^/]+\.js$/, async route => {
    if (new URL(route.request().url()).origin !== baseUrl) return route.fallback();
    const pathname = new URL(route.request().url()).pathname;
    const parts = pathname.split('/');
    const name = parts.pop().slice(0, -3);
    const namespace = parts.pop() === 'weakmaps' ? 'testWeakmaps' : 'globals';
    await route.fulfill({
      contentType: 'text/javascript',
      // Top-level await would let workers receive messages before their listeners exist.
      body: `import { ${name} as original } from ${JSON.stringify(`${pathname}?unbundled`)};
        export const ${name} = globalThis.globals
        ? globalThis.${namespace}.${name}
        : original;`,
    });
  });
  await this.context.route('**/dist/leaflet-city-mapper.js', mockPMTiles);
  this.page = await createTestPage(this.context);
  this.browserErrors = [];
  this.page.on('pageerror', error => this.browserErrors.push(error.stack || error.message));
  this.page.on('console', message => {
    if (message.type() === 'error') {
      const { url, lineNumber } = message.location();
      this.browserErrors.push(`${message.text()}${url ? ` (${url}:${lineNumber + 1})` : ''}`);
    }
  });
});

After({ tags: 'not @unit', wrapperOptions: { cleanup: true } }, async function ({ pickle, result }) {
  if (result?.status === Status.FAILED && this.browserErrors?.length) {
    console.error(`Browser errors [${pickle.name}]:`, this.browserErrors.join('\n'));
  }
  if (this.context) {
    for (const page of this.context.pages()) await page.close();
  }
  assert.deepEqual(this.unexpectedRequests, [], 'External requests must have local fixtures');
});

Before({ tags: '@coverage and not @unit', timeout: 30000 }, async function () {
  assert.ok(webgpu, 'WebGPU adapter unavailable: 3D scenarios need a GPU-backed browser');
  await this.page.goto(baseUrl);
});
