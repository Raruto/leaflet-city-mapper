import assert from 'node:assert/strict';
import { Given, Then } from '@cucumber/cucumber';

Then('every local source in the city example is available', async function () {
  const url = `${this.baseUrl}/examples/leaflet-city-mapper.html`;
  const response = await this.context.request.get(url);
  assert.equal(response.status(), 200);
  const html = await response.text();
  await response.dispose();
  const sources = [...html.matchAll(/\b(?:url|bridges):\s*'([^']+)'/g)]
    .map(([, source]) => new URL(source, url));
  assert.equal(sources.length, 13);
  for (const source of sources) {
    assert.equal(source.origin, new URL(url).origin);
    const asset = await this.context.request.get(source.href, { headers: { Range: 'bytes=0-0' } });
    assert.equal(asset.status(), 206, `Missing example asset: ${source.href}`);
    await asset.dispose();
  }
});

Given('the city mapper plugin is loaded after Leaflet alone', { timeout: 30000 }, async function () {
  await this.context.unroute('**/dist/leaflet-city-mapper.js');
  this.sourceRequests = [];
  this.page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin === this.baseUrl && url.pathname.startsWith('/dist/')) this.sourceRequests.push(url.pathname);
  });
  await this.page.goto(this.baseUrl);
  await this.page.setContent('<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body></body></html>');
  const leaflet2 = process.env.LEAFLET_VERSION === '2';
  await this.page.addScriptTag({
    url: leaflet2
      ? 'https://unpkg.com/leaflet@2.0.0-alpha.1/dist/leaflet-global-src.js'
      : 'https://unpkg.com/leaflet@1.9/dist/leaflet-src.js',
  });
  if (leaflet2) await this.page.evaluate(() => { globalThis.L = globalThis.leaflet; });
  await this.page.addScriptTag({ url: `${this.baseUrl}/dist/leaflet-city-mapper.js` });
  await this.page.waitForFunction(() => typeof L.Layer.prototype.initialize === 'function');
});

Then('each source initializes from the single bundle', async function () {
  assert.deepEqual(this.sourceRequests, ['/dist/leaflet-city-mapper.js']);
  const specialized = ['terrain', 'sunlight', 'traffic', 'walk'];
  for (const [index, type] of ['pmtiles', 'geojson', ...specialized].entries()) {
    await this.page.evaluate(async type => {
      const layer = new L.Layer({ source: {
        type,
        url: 'fixture.pmtiles',
        ...(type === 'pmtiles' ? { archive: { getHeader: async () => ({ maxZoom: 19 }) } } : {}),
        ...(type === 'geojson' ? { data: { type: 'FeatureCollection', features: [] } } : {}),
      } });
      await layer.ready;
      if (type === 'geojson' && layer.setData({ type: 'FeatureCollection', features: [] }) !== layer) {
        throw new Error('setData must remain chainable');
      }
    }, type);
    assert.deepEqual(this.sourceRequests, ['/dist/leaflet-city-mapper.js']);
  }
});

Then('source layers load lazily and Leaflet subclasses keep their behavior', async function () {
  const result = await this.page.evaluate(async () => {
    const lazy = !Object.hasOwn(L.Layer, 'types') &&
      !Object.hasOwn(L.Layer, '_renderers') && !Object.hasOwn(L.Layer, '_nextId') &&
      ['_init3D', '_initRaster', '_initNativeGPU'].every(name => !(name in L.Layer.prototype));
    const archive = { getHeader: async () => ({ maxZoom: 19 }) };
    const first = new L.Layer({ source: { url: 'fixture.pmtiles', maxZoom: 24, archive } });
    const second = new L.Layer({ source: { type: 'pmtiles', url: 'second.pmtiles', archive } });
    const pending = first.ready instanceof Promise && second.ready instanceof Promise;
    const firstPrototype = Object.getPrototypeOf(first);
    await Promise.all([first.ready, second.ready]);
    const warm = new L.Layer({ source: { type: 'pmtiles', url: 'warm.pmtiles', archive } });
    await warm.ready;
    const plain = new L.Layer();
    const configured = new L.Layer({ attribution: 'Plain layer' });
    const Inherited = L.Layer.extend({});
    const inherited = new Inherited({ source: { type: 'application-specific' } });
    let initializations = 0;
    const Custom = L.Layer.extend({
      initialize(options) {
        initializations++;
        L.Util.setOptions(this, options);
      },
    });

    const custom = new Custom({ source: { type: 'application-specific' } });
    const marker = new L.Marker([55, 10]);
    return {
      lazy, pending,
      routed: first._type === 'pmtiles' && first instanceof L.Layer &&
        !(first instanceof L.TileLayer) && !(first instanceof L.GridLayer) &&
        second._type === 'pmtiles',
      samePrototype: firstPrototype === L.Layer.prototype && Object.getPrototypeOf(first) === firstPrototype &&
        first.constructor === L.Layer && warm.constructor === L.Layer,
      ownMethods: Object.hasOwn(first, 'onAdd') && Object.hasOwn(first, 'getHeader') &&
        first.getHeader !== second.getHeader && first.options !== second.options,
      settings: first.options.maxZoom,
      sourceRemoved: first.options.source === undefined,
      header: first.header.maxZoom,
      custom: custom instanceof Custom && custom.options.source.type === 'application-specific',
      initializations,
      marker: marker instanceof L.Marker && marker.getLatLng().equals([55, 10]),
      pitch: typeof L.Map.prototype.getPitch === 'function',
      warm: warm._type === 'pmtiles' && warm.header.maxZoom === 19,
      plain: plain instanceof L.Layer && !plain.ready,
      configured: configured.options.attribution === 'Plain layer',
      inherited: inherited instanceof Inherited &&
        inherited.options.source.type === 'application-specific' && !inherited.ready,
    };
  });
  assert.deepEqual(result, {
    lazy: true, pending: true, routed: true, samePrototype: true, ownMethods: true, settings: 24, sourceRemoved: true,
    header: 19, custom: true, initializations: 1, marker: true, pitch: true,
    warm: true, plain: true, configured: true, inherited: true,
  });
});

Then('an unknown source rejects readiness and subsequent sources still initialize', async function () {
  const result = await this.page.evaluate(async () => {
    const invalid = new L.Layer({ source: { type: 'unknown' } });
    const valid = new L.Layer({ source: { type: 'pmtiles', url: 'fixture.pmtiles',
      archive: { getHeader: async () => ({ maxZoom: 19 }) } } });
    let emitted;
    invalid.on('error', ({ error }) => { emitted = error; });
    const error = await invalid.ready.then(() => null, error => error);
    await valid.ready;
    return { error: error?.message, emitted: emitted === error, header: valid.header.maxZoom };
  });
  assert.deepEqual(result, { error: 'Unknown layer type: unknown', emitted: true, header: 19 });
});
