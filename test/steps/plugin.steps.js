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
  assert.equal(sources.length, 10);
  for (const source of sources) {
    assert.equal(source.origin, new URL(url).origin);
    const asset = await this.context.request.get(source.href, { headers: { Range: 'bytes=0-0' } });
    assert.equal(asset.status(), 206, `Missing example asset: ${source.href}`);
    await asset.dispose();
  }
});

Given('the city mapper plugin is loaded after leaflet-rotate', async function () {
  await this.page.goto(this.baseUrl);
  await this.page.setContent('<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body></body></html>');
  const leaflet2 = process.env.LEAFLET_VERSION === '2';
  await this.page.addScriptTag({
    url: leaflet2
      ? 'https://unpkg.com/leaflet@2.0.0-alpha.1/dist/leaflet-global-src.js'
      : 'https://unpkg.com/leaflet@1.9/dist/leaflet-src.js',
  });
  if (leaflet2) await this.page.evaluate(() => { globalThis.L = globalThis.leaflet; });
  await this.page.addScriptTag({ url: 'https://unpkg.com/leaflet-rotate@0.5.3/dist/leaflet-rotate-src.js' });
  await this.page.addScriptTag({ url: `${this.baseUrl}/dist/leaflet-city-mapper.js` });
  await this.page.waitForFunction(() => L.Layer.types);
});

Then('source layers load lazily and Leaflet subclasses keep their behavior', async function () {
  const result = await this.page.evaluate(async () => {
    const lazy = Object.keys(L.Layer.types).length === 0;
    const archive = { getHeader: async () => ({ maxZoom: 19 }) };
    const first = new L.Layer({ source: { url: 'fixture.pmtiles', maxZoom: 24, archive } });
    const second = new L.Layer({ source: { type: 'pmtiles', url: 'second.pmtiles', archive } });
    const pending = first.ready instanceof Promise && second.ready instanceof Promise;
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
      routed: first instanceof L.Layer.types.pmtiles && first instanceof L.Layer &&
        !(first instanceof L.TileLayer) && !(first instanceof L.GridLayer) &&
        second instanceof L.Layer.types.pmtiles,
      settings: first.options.maxZoom,
      sourceRemoved: first.options.source === undefined,
      header: first.header.maxZoom,
      custom: custom instanceof Custom && custom.options.source.type === 'application-specific',
      initializations,
      marker: marker instanceof L.Marker && marker.getLatLng().equals([55, 10]),
      pitch: typeof L.Map.prototype.getPitch === 'function',
      warm: warm instanceof L.Layer.types.pmtiles && warm.header.maxZoom === 19,
      plain: plain instanceof L.Layer && !plain.ready,
      configured: configured.options.attribution === 'Plain layer',
      inherited: inherited instanceof Inherited &&
        inherited.options.source.type === 'application-specific' && !inherited.ready,
    };
  });
  assert.deepEqual(result, {
    lazy: true, pending: true, routed: true, settings: 24, sourceRemoved: true,
    header: 19, custom: true, initializations: 1, marker: true, pitch: true,
    warm: true, plain: true, configured: true, inherited: true,
  });
});
