import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { AfterAll, Before, Then } from '@cucumber/cucumber';
import { startServer } from '../../build/server.js';
import { chromium } from 'playwright';
import { swiftShaderArgs } from '../fixtures/browser-environment.js';

const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
const pluginName = manifest.name.split('/').pop();
const packagePath = manifest.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const packageCdn = new RegExp(`https://(?:unpkg\\.com/|cdn\\.jsdelivr\\.net/(?:npm/|gh/Raruto/))${packagePath}(?:@[^/\\s"\x27<>]+)?/`);
const bundleName = new RegExp(`^${pluginName}(?:-src|\\.min)?\\.js$`);
let server;
let browser;
let base;

async function trackArchiveCancellations(page) {
  await page.addInitScript(() => {
    const fetch = globalThis.fetch;
    let nextId = 0;
    globalThis.smokeCancelledArchives = [];
    globalThis.fetch = function (input, options) {
      const url = new URL(input instanceof Request ? input.url : input, location.href);
      const signal = options?.signal || (input instanceof Request && input.signal);
      if (url.origin !== location.origin || !url.pathname.endsWith('.pmtiles') || !signal) {
        return fetch.call(this, input, options);
      }
      const id = String(++nextId);
      const headers = new Headers(options?.headers || (input instanceof Request && input.headers) || undefined);
      headers.set('x-smoke-request-id', id);
      if (signal.aborted) globalThis.smokeCancelledArchives.push(id);
      else signal.addEventListener('abort', () => globalThis.smokeCancelledArchives.push(id), { once: true });
      return fetch.call(this, input, { ...options, headers });
    };
  });
  const failures = [];
  page.on('requestfailed', request => failures.push({
    url: request.url(), type: request.resourceType(), error: request.failure().errorText,
    id: request.headers()['x-smoke-request-id'],
  }));
  return failures;
}

async function unexpectedRequestFailures(page, failures) {
  const cancelled = new Set(await page.evaluate(() => globalThis.smokeCancelledArchives || []));
  return failures.filter(({ type, error, id }) =>
    !(type === 'image' && error === 'net::ERR_ABORTED') &&
    !(type === 'fetch' && error === 'net::ERR_ABORTED' && id && cancelled.has(id)))
    .map(({ url, error }) => `Request: ${url} (${error})`);
}

Before({ tags: '@smoke', timeout: 30000 }, async function () {
  if (!server) {
    server = await startServer(0, { watch: true });
    base = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({
      args: process.platform === 'linux' && process.env.CI ? swiftShaderArgs
        : ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
    });
  }
});

AfterAll({ timeout: process.platform === 'win32' ? 90000 : 30000 }, async function () {
  try {
    if (browser) await browser.close();
  } finally {
    if (server) await new Promise((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); server.closeAllConnections(); });
  }
});

Then('all HTML examples are listed', function () {
  const examples = [];
  function collect(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) collect(file);
      else if (entry.isFile() && entry.name.endsWith('.html')) {
        examples.push(path.relative('examples', file).split(path.sep).join('/'));
      }
    }
  }
  collect('examples');
  const feature = readFileSync('test/features/smoke.feature', 'utf8');
  const listed = [...feature.matchAll(/^\s*\|\s*([^|]+\.html)\s*\|\s*$/gm)].map(match => match[1].trim());
  assert.ok(examples.length, 'No HTML examples found');
  assert.deepEqual(listed.sort(), examples.sort(), 'Update the examples table');
});

Then('development pages rewrite CDN URLs without changing files', { timeout: 30000 }, async function () {
  const origin = typeof base === 'string' ? base : this.baseUrl;
  const feature = readFileSync('test/features/smoke.feature', 'utf8');
  const examples = [...feature.matchAll(/^\s*\|\s*([^|]+\.html)\s*\|\s*$/gm)].map(match => match[1].trim());
  assert.ok(examples.length, 'No examples to check');
  const packageSpecifier = new RegExp('(["\x27`])' + packagePath + '(?:@[^/\\s"\x27<>]+)?/');
  for (const example of examples) {
    const file = path.join('examples', example);
    const original = readFileSync(file, 'utf8');
    const response = await fetch(`${origin}/examples/${example}`);
    assert.equal(response.status, 200, example);
    const html = await response.text();
    assert.doesNotMatch(html, packageCdn, example);
    assert.doesNotMatch(html, packageSpecifier, example);
    const external = original.match(/https?:\/\/[^\s"'<>`]+/g) || [];
    for (const url of external) {
      if (!packageCdn.test(url)) assert.ok(html.includes(url), `Changed external URL: ${url}`);
    }
    const assets = new Set([...html.matchAll(/["'`](\/[^"'`\s<>]+\.(?:js|css)(?:\?[^"'`\s<>]*)?)["'`]/g)].map(match => match[1]));
    assert.ok(assets.size, `No local assets in ${example}`);
    for (const asset of assets) {
      const result = await fetch(origin + asset);
      assert.equal(result.status, 200, `${example}: ${asset}`);
      const filename = path.resolve('.' + decodeURIComponent(new URL(origin + asset).pathname));
      assert.deepEqual(Buffer.from(await result.arrayBuffer()), readFileSync(filename), asset);
    }
    assert.equal(readFileSync(file, 'utf8'), original);
  }
});

Then('the example {string} loads without browser errors', { timeout: 30000 }, async function (example) {
  const page = await browser.newPage();
  const errors = [];
  const failures = await trackArchiveCancellations(page);
  let googleKeyWarning = false;
  let bundleLoaded = false;
  function isBundleResponse(response) {
    const url = new URL(response.url());
    return response.request().resourceType() === 'script' && response.status() >= 200 && response.status() < 300 &&
      url.origin === base && bundleName.test(path.posix.basename(url.pathname));
  }
  page.on('request', request => {
    if (packageCdn.test(request.url())) errors.push(`Unexpected plugin CDN request: ${request.url()}`);
  });
  page.on('pageerror', error => errors.push(`JavaScript: ${error.stack || error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') {
      if (message.text().includes('Google Maps JavaScript API error: ApiProjectMapError') ||
        message.text().startsWith('You are using this API without a key. See https://developers.google.com/maps/documentation/javascript/error-messages')) {
        googleKeyWarning = true;
      }
      else errors.push(`Console: ${message.text()}`);
    }
  });
  page.on('response', response => {
    if (isBundleResponse(response)) bundleLoaded = true;
    if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  try {
    const url = `${base}/examples/${example.split('/').map(encodeURIComponent).join('/')}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 19000 });
    await Promise.all([
      bundleLoaded ? Promise.resolve() : page.waitForResponse(isBundleResponse, { timeout: 8000 }),
      page.locator('.leaflet-container').first().waitFor({ state: 'attached', timeout: 8000 }),
    ]);
    await page.waitForTimeout(1000);
    const allErrors = [...errors, ...await unexpectedRequestFailures(page, failures)];
    assert.ok(!allErrors.length, allErrors.join('\n'));
    if (googleKeyWarning) console.log('Google Maps API-key warning ignored: API key not configured');
  } catch (error) {
    const allErrors = [...errors, ...await unexpectedRequestFailures(page, failures)];
    if (allErrors.length) throw new Error(`${error.message}\n${allErrors.join('\n')}`, { cause: error });
    throw error;
  } finally {
    page.removeAllListeners();
    await page.close();
  }
});

Then('smoke tests distinguish cancelled archive requests from network failures', async function () {
  const page = await browser.newPage();
  const failures = await trackArchiveCancellations(page);
  let release, started;
  const routed = new Promise(resolve => { started = resolve; });
  try {
    await page.route('**/cancelled.pmtiles', async route => {
      await new Promise(resolve => { release = resolve; started(); });
      await route.abort('failed');
    });
    await page.route('**/broken.pmtiles', route => route.abort('failed'));
    await page.goto(base);
    await page.evaluate(() => {
      globalThis.smokeController = new AbortController();
      fetch('/cancelled.pmtiles', { signal: smokeController.signal }).catch(() => {});
    });
    await routed;
    const cancelled = page.waitForEvent('requestfailed', request => request.url().endsWith('/cancelled.pmtiles'));
    await page.evaluate(() => smokeController.abort());
    release();
    await cancelled;
    const broken = page.waitForEvent('requestfailed', request => request.url().endsWith('/broken.pmtiles'));
    await page.evaluate(() => fetch('/broken.pmtiles', { signal: new AbortController().signal }).catch(() => {}));
    await broken;
    const errors = await unexpectedRequestFailures(page, failures);
    assert.equal(failures.length, 2);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /broken\.pmtiles/);
  } finally {
    await page.close();
  }
});
