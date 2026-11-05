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
  assert.equal(sources.length, 15);
  for (const source of sources) {
    assert.equal(source.origin, new URL(url).origin);
    const asset = await this.context.request.get(source.href, { headers: { Range: 'bytes=0-0' } });
    assert.equal(asset.status(), 206, `Missing example asset: ${source.href}`);
    await asset.dispose();
  }
});

async function loadLeaflet(world) {
  await world.context.unroute('**/dist/leaflet-city-mapper.js');
  world.sourceRequests = [];
  world.page.on('request', request => {
    const url = new URL(request.url());
    if (url.origin === world.baseUrl && url.pathname.startsWith('/dist/')) world.sourceRequests.push(url.pathname);
  });
  await world.page.goto(world.baseUrl);
  await world.page.setContent('<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body></body></html>');
  const leaflet2 = process.env.LEAFLET_VERSION === '2';
  await world.page.addScriptTag({
    url: leaflet2
      ? 'https://unpkg.com/leaflet@2.0.0-alpha.1/dist/leaflet-global-src.js'
      : 'https://unpkg.com/leaflet@1.9/dist/leaflet-src.js',
  });
  if (leaflet2) await world.page.evaluate(() => { globalThis.L = globalThis.leaflet; });
}

async function loadPlugin(world, instrumented) {
  await loadLeaflet(world);
  if (instrumented) await world.context.route('**/dist/leaflet-city-mapper.js', route => route.fulfill({
    contentType: 'text/javascript', body: world.pluginBundle,
  }));
  await world.page.addScriptTag({ url: `${world.baseUrl}/dist/leaflet-city-mapper.js` });
  await world.page.waitForFunction(() => typeof CityMapper.layer === 'function');
}

Given('the city mapper plugin is loaded after Leaflet alone', { timeout: 30000 }, async function () {
  await loadPlugin(this, false);
});

Given('the instrumented city mapper plugin is loaded after Leaflet alone', { timeout: 30000 }, async function () {
  await loadPlugin(this, true);
});

Given('native Leaflet attributes are recorded before loading the plugin', { timeout: 30000 }, async function () {
  await loadLeaflet(this);
  await this.page.evaluate(() => {
    const attributes = object => {
      const keys = new Set();
      for (; object; object = Object.getPrototypeOf(object)) {
        for (const key of Reflect.ownKeys(object)) keys.add(key);
      }
      return keys;
    };
    const classes = Object.entries(L).filter(([, value]) => typeof value === 'function' && value.prototype);
    for (const [name, type] of [...classes]) {
      for (const [child, value] of Object.entries(type)) {
        if (typeof value === 'function' && value.prototype) classes.push([`${name}.${child}`, value]);
      }
    }
    const factories = {
      Map: () => new L.Map(document.body.appendChild(document.createElement('div'))),
      Layer: () => new L.Layer(),
      GridLayer: () => new L.GridLayer(),
      TileLayer: () => new L.TileLayer(''),
      'TileLayer.WMS': () => new L.TileLayer.WMS('', {}),
      Marker: () => new L.Marker([0, 0]),
      Polyline: () => new L.Polyline([[0, 0], [1, 1]]),
      Polygon: () => new L.Polygon([[0, 0], [0, 1], [1, 1]]),
      Rectangle: () => new L.Rectangle([[0, 0], [1, 1]]),
      CircleMarker: () => new L.CircleMarker([0, 0]),
      Circle: () => new L.Circle([0, 0], { radius: 1 }),
      ImageOverlay: () => new L.ImageOverlay('', [[0, 0], [1, 1]]),
      VideoOverlay: () => new L.VideoOverlay('', [[0, 0], [1, 1]]),
      SVGOverlay: () => new L.SVGOverlay(document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
        [[0, 0], [1, 1]]),
      LayerGroup: () => new L.LayerGroup(),
      FeatureGroup: () => new L.FeatureGroup(),
      Popup: () => new L.Popup(),
      Tooltip: () => new L.Tooltip(),
    };
    for (const type of ['3d', 'geojson', 'pmtiles', 'terrain', 'traffic']) {
      factories[`Layer(${type})`] = () => (globalThis.CityMapper ? CityMapper.layer : options => new L.Layer(options))({ source: {
        type,
        data: { type: 'FeatureCollection', features: [] },
        archive: { getHeader: async () => ({ maxZoom: 19 }) },
      } });
    }
    const snapshot = async () => {
      const entries = classes.map(([name, type]) => [`L.${name}.prototype`, attributes(type.prototype)]);
      for (const [name, create] of Object.entries(factories)) {
        const instance = create();
        instance.on('attribute-check', Object.prototype.valueOf);
        instance.fire('attribute-check');
        instance.off('attribute-check', Object.prototype.valueOf);
        if (globalThis.CityMapper) await CityMapper.ready(instance);
        entries.push([`L.${name} instance`, attributes(instance)]);
        if (instance instanceof L.Map) instance.remove();
      }
      return entries;
    };
    const additions = async before => {
      const baseline = new Map(before);
      return (await snapshot()).flatMap(([name, keys]) =>
        [...keys].filter(key => !baseline.get(name).has(key)).map(key => `${name}: ${String(key)}`));
    };
    globalThis.leafletAttributeCheck = { snapshot, additions };
  });
  const baselineAdditions = await this.page.evaluate(async () => {
    leafletAttributeCheck.before = await leafletAttributeCheck.snapshot();
    return leafletAttributeCheck.additions(leafletAttributeCheck.before);
  });
  assert.deepEqual(baselineAdditions, [], 'Unmodified Leaflet must pass the attribute check');
  await this.page.addScriptTag({ url: `${this.baseUrl}/dist/leaflet-city-mapper.js` });
});

Then('the plugin adds no methods or properties to native Leaflet instances', async function () {
  const additions = await this.page.evaluate(() =>
    leafletAttributeCheck.additions(leafletAttributeCheck.before));
  assert.deepEqual(additions, [], `Plugin-added Leaflet attributes:\n${additions.join('\n')}`);
});

Then('each source initializes from the single bundle', async function () {
  assert.deepEqual(this.sourceRequests, ['/dist/leaflet-city-mapper.js']);
  const specialized = ['terrain', 'traffic'];
  for (const [index, type] of ['pmtiles', 'geojson', ...specialized].entries()) {
    await this.page.evaluate(async type => {
      const layer = CityMapper.layer({ source: {
        type,
        url: 'fixture.pmtiles',
        ...(type === 'pmtiles' ? { archive: { getHeader: async () => ({ maxZoom: 19 }) } } : {}),
        ...(type === 'geojson' ? { data: { type: 'FeatureCollection', features: [] } } : {}),
      } });
      await CityMapper.ready(layer);
      if (type === 'geojson' && CityMapper.setData(layer, { type: 'FeatureCollection', features: [] }) !== layer) {
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
    const first = CityMapper.layer({ source: { url: 'fixture.pmtiles', maxZoom: 24, archive } });
    const second = CityMapper.layer({ source: { type: 'pmtiles', url: 'second.pmtiles', archive } });
    const pending = CityMapper.ready(first) instanceof Promise && CityMapper.ready(second) instanceof Promise;
    const firstPrototype = Object.getPrototypeOf(first);
    await Promise.all([CityMapper.ready(first), CityMapper.ready(second)]);
    const warm = CityMapper.layer({ source: { type: 'pmtiles', url: 'warm.pmtiles', archive } });
    await CityMapper.ready(warm);
    const plain = new L.Layer();
    const configured = CityMapper.layer({ attribution: 'Plain layer' });
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
      routed: first instanceof L.Layer && !(first instanceof L.TileLayer) && !(first instanceof L.GridLayer) &&
        (await CityMapper.getHeader(second)).maxZoom === 19,
      samePrototype: firstPrototype === L.Layer.prototype && Object.getPrototypeOf(first) === firstPrototype &&
        first.constructor === L.Layer && warm.constructor === L.Layer,
      externalMethods: !('onAdd' in first) && !('getHeader' in first) && !('ready' in first) &&
        first.options !== second.options,
      settings: first.options.maxZoom,
      sourceRemoved: first.options.source === undefined,
      header: (await CityMapper.getHeader(first)).maxZoom,
      custom: custom instanceof Custom && custom.options.source.type === 'application-specific',
      initializations,
      marker: marker instanceof L.Marker && marker.getLatLng().equals([55, 10]),
      pitch: typeof CityMapper.getPitch === 'function' && !('getPitch' in L.Map.prototype),
      warm: (await CityMapper.getHeader(warm)).maxZoom === 19,
      plain: plain instanceof L.Layer && !plain.ready,
      configured: configured.options.attribution === 'Plain layer',
      inherited: inherited instanceof Inherited && !inherited.ready,
    };
  });
  assert.deepEqual(result, {
    lazy: true, pending: true, routed: true, samePrototype: true, externalMethods: true, settings: 24, sourceRemoved: true,
    header: 19, custom: true, initializations: 1, marker: true, pitch: true,
    warm: true, plain: true, configured: true, inherited: true,
  });
});

Then('an unknown source rejects readiness and subsequent sources still initialize', async function () {
  const result = await this.page.evaluate(async () => {
    const invalid = CityMapper.layer({ source: { type: 'unknown' } });
    const valid = CityMapper.layer({ source: { type: 'pmtiles', url: 'fixture.pmtiles',
      archive: { getHeader: async () => ({ maxZoom: 19 }) } } });
    let emitted;
    invalid.on('error', ({ error }) => { emitted = error; });
    const error = await CityMapper.ready(invalid).then(() => null, error => error);
    await CityMapper.ready(valid);
    return { error: error?.message, emitted: emitted === error, header: (await CityMapper.getHeader(valid)).maxZoom };
  });
  assert.deepEqual(result, { error: 'Unknown layer type: unknown', emitted: true, header: 19 });
});
