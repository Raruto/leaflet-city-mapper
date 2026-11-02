import assert from 'node:assert/strict';
import { Given, Then } from '@cucumber/cucumber';

Given('the city mapper plugin is loaded after leaflet-rotate', async function () {
  await this.page.goto(`${this.baseUrl}/test/fixtures/plugin.html`);
  await this.page.waitForFunction(() => L.Layer.types);
});

Then('source layers load lazily and Leaflet subclasses keep their behavior', async function () {
  const result = await this.page.evaluate(async () => {
    const lazy = Object.keys(L.Layer.types).length === 0;
    const first = new L.Layer({ source: { url: 'fixture.pmtiles', maxZoom: 24 } });
    const second = new L.Layer({ source: { type: 'pmtiles', url: 'second.pmtiles' } });
    const pending = first.ready instanceof Promise && second.ready instanceof Promise;
    await Promise.all([first.ready, second.ready]);
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
      routed: first instanceof L.TileLayer && second instanceof L.Layer.types.pmtiles,
      settings: first.options.maxZoom,
      sourceRemoved: first.options.source === undefined,
      header: first.header.maxZoom,
      custom: custom instanceof Custom && custom.options.source.type === 'application-specific',
      initializations,
      marker: marker instanceof L.Marker && marker.getLatLng().equals([55, 10]),
      pitch: typeof L.Map.prototype.getPitch === 'function',
    };
  });
  assert.deepEqual(result, {
    lazy: true, pending: true, routed: true, settings: 24, sourceRemoved: true,
    header: 19, custom: true, initializations: 1, marker: true, pitch: true,
  });
});
