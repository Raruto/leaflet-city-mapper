import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { AfterAll, Before, Then } from '@cucumber/cucumber';
import { startServer } from '../../build/server.js';
import { chromium } from 'playwright';
import { swiftShaderArgs } from '../fixtures/browser-environment.js';

const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
const pluginName = manifest.name.split('/').pop();
const main = manifest.main.replace(/^\.\//, '');
const packagePath = manifest.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const packageUrl = new RegExp(`^/${packagePath}(?:@[^/]+)?/(.+)$`);
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
  const cancelled = new Set(await page.evaluate(() => globalThis.smokeCancelledArchives));
  return failures.filter(({ type, error, id }) =>
    !(type === 'image' && error === 'net::ERR_ABORTED') &&
    !(type === 'fetch' && error === 'net::ERR_ABORTED' && id && cancelled.has(id)))
    .map(({ url, error }) => `Request: ${url} (${error})`);
}

Before({ tags: '@smoke', timeout: 30000 }, async function () {
  if (!server) {
    server = await startServer(0);
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

Then('the example {string} loads without browser errors', { timeout: 30000 }, async function (example) {
  const page = await browser.newPage();
  const errors = [];
  const failures = await trackArchiveCancellations(page);
  const localBundles = new Set();
  let googleKeyWarning = false;
  let bundleLoaded = false;
  function isBundleResponse(response) {
    return response.request().resourceType() === 'script' && response.status() >= 200 && response.status() < 300 &&
      localBundles.has(response.url());
  }
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
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    const match = url.hostname === 'unpkg.com' ? packageUrl.exec(decodeURIComponent(url.pathname)) : null;
    let file = match ? match[1] : url.origin === base ? decodeURIComponent(url.pathname).slice(1) : null;
    if (file === null) return route.continue();
    if (match && !file.startsWith('dist/') && !path.posix.basename(file).startsWith(`${pluginName}.`)) {
      return route.continue();
    }
    const bundleScript = route.request().resourceType() === 'script' && bundleName.test(path.posix.basename(file));
    if (bundleScript && !file.startsWith('dist/') && file !== main) file = main;
    if (bundleScript && file === main && !main.includes('/') && !main.endsWith('.min.js')) {
      const minified = main.replace(/\.js$/, '.min.js');
      assert.ok(minified !== main && existsSync(minified), `Missing built bundle: ${minified}`);
      file = minified;
    }
    if (bundleScript) localBundles.add(route.request().url());
    if (file === `${pluginName}.css` && existsSync(`${pluginName}.min.css`)) {
      file = `${pluginName}.min.css`;
    }
    if (match || file !== decodeURIComponent(url.pathname).slice(1)) {
      const response = await route.fetch({ url: `${base}/${file}` });
      return route.fulfill({ response, headers: { ...response.headers(), 'access-control-allow-origin': '*' } });
    }
    return route.continue();
  });
  try {
    const url = `${base}/examples/${example.split('/').map(encodeURIComponent).join('/')}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 19000 });
    await Promise.all([
      bundleLoaded ? Promise.resolve() : page.waitForResponse(isBundleResponse, { timeout: 8000 }),
      page.locator('.leaflet-container').first().waitFor({ state: 'attached', timeout: 8000 }),
    ]);
    await page.waitForTimeout(1000);
    errors.push(...await unexpectedRequestFailures(page, failures));
    assert.ok(!errors.length, errors.join('\n'));
    if (googleKeyWarning) console.log('Google Maps API-key warning ignored: API key not configured');
  } catch (error) {
    if (errors.length) throw new Error(`${error.message}\n${errors.join('\n')}`, { cause: error });
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
