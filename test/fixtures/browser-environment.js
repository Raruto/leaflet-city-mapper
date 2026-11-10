import { dependencyFile } from './dependencies.js';

export const testTime = '2026-06-21T12:00:00.000Z';
const localHosts = ['127.0.0.1', 'localhost', '[::1]'];
const fetchNode = globalThis.fetch;

export async function fetchLocal(input, options) {
  const url = new URL(input instanceof Request ? input.url : input);
  if (/^https?:$/.test(url.protocol) && !localHosts.includes(url.hostname)) {
    throw new Error(`External Node request must have a local fixture: ${url.href}`);
  }
  return fetchNode(input, options);
}

export async function createTestContext(browser, unexpectedRequests, options = {}) {
  const context = await browser.newContext({
    ...options, timezoneId: 'UTC', locale: 'en-US', serviceWorkers: 'block',
  });
  await resetTestContext(context, unexpectedRequests);
  return context;
}

export async function resetTestContext(context, unexpectedRequests) {
  for (const page of context.pages()) await page.close();
  await context.unrouteAll({ behavior: 'wait' });
  await context.clearCookies();
  await context.clearPermissions();
  unexpectedRequests.length = 0;
  // Keep local byte-range requests out of the Node routing callback.
  await context.route(/^https?:\/\/(?!(?:127\.0\.0\.1|localhost|\[::1\])(?::\d+)?(?:\/|$))/i, async route => {
    const url = new URL(route.request().url());
    const path = dependencyFile(url.href);
    if (path) return route.fulfill({ path });
    if ([
      'https://raruto.github.io/img/view-on-github.png',
      'https://leafletjs.com/docs/images/favicon.svg',
      'https://openlayers.org/theme/img/logo-dark.svg',
    ].includes(url.href)) {
      return route.fulfill({ contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>' });
    }
    unexpectedRequests.push(url.href);
    await route.abort('blockedbyclient');
  });
}

export async function createTestPage(context) {
  const page = await context.newPage();
  await page.clock.install({ time: new Date(testTime) });
  return page;
}