import * as globals from '../fixtures/globals.js';
import assert from 'node:assert/strict';
import { Given, Then } from '@cucumber/cucumber';

Then('maps and markers expose only the approved plugin methods', async function () {
  const result = await this.page.evaluate(() => {
    const map = new L.Map(document.body.appendChild(document.createElement('div')), {
      rotate: false, pitch: 35, bearing: 70,
    });
    const marker = new L.Marker([0, 0]);
    const chainable = marker.setRotation(Math.PI / 2) === marker;
    let invalid;
    try { marker.setRotation(NaN); } catch (error) { invalid = error.message; }
    const result = {
      pitch: map.getPitch(), bearing: map.getBearing(), rotation: marker.options.rotation,
      chainable, invalid,
      privateLayer: !('ready' in L.Layer) && !('setData' in L.Layer) &&
        !('ready' in L.Layer.prototype) && !('setData' in L.Layer.prototype),
      privateMap: !('resetNorthPitch' in map) && !('setPitch' in map) && !('setBearing' in map),
      noGlobal: !('CityMapper' in globalThis),
    };
    map.remove();
    return result;
  });
  assert.deepEqual(result, {
    pitch: 35, bearing: 70, rotation: Math.PI / 2, chainable: true,
    invalid: 'Marker rotation must be finite',
    privateLayer: true, privateMap: true, noGlobal: true,
  });
});

Then('native instance data is isolated in explicit feature associations', async function () {
  const result = await this.page.evaluate(async () => {
    const layers = [];
    for (const type of ['3d', 'geojson', 'pmtiles', 'terrain', 'traffic']) {
      const layer = new L.Layer({ source: {
        type, data: { type: 'FeatureCollection', features: [] },
        archive: { getHeader: async () => ({ maxZoom: 19 }) },
      } });
      await testOperations.ready(layer);
      layers.push(layer);
    }
    const maps = [new L.Map(document.body.appendChild(document.createElement('div')), { rotate: false }),
      new L.Map(document.body.appendChild(document.createElement('div')), { rotate: false })];
    testOperations.setPitch(maps[0], 35);
    const records = layers.map(layer => globals.sceneByLayer.get(layer));
    const camera = maps.map(map => globals.cameraByMap.get(map));
    const functions = records.concat(camera).flatMap(record =>
      Object.entries(record).filter(([, value]) => typeof value === 'function').map(([key]) => key));
    const independent = new Set(records).size === layers.length && camera[0] !== camera[1] &&
      testOperations.getPitch(maps[0]) === 35 && testOperations.getPitch(maps[1]) === 0;
    for (const map of maps) map.remove();
    return { functions, independent, leafletBinding: globals.L === L &&
      (await import('/src/globals/L.js')).L === L, genericAccessor: 'pluginState' in globalThis ||
      'instanceStates' in globals };
  });
  assert.deepEqual(result, { functions: [], independent: true, leafletBinding: true, genericAccessor: false });
});

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
  await world.page.evaluate(() => {
    globalThis.waitLayer = layer => new Promise((resolve, reject) => {
      layer.once('ready', () => resolve(layer));
      layer.once('error', ({ error }) => reject(error));
    });
  });
}

async function loadPlugin(world, instrumented) {
  await loadLeaflet(world);
  if (instrumented) await world.context.route('**/dist/leaflet-city-mapper.js', route => route.fulfill({
    contentType: 'text/javascript', body: world.pluginBundle,
  }));
  await world.page.addScriptTag({ url: `${world.baseUrl}/dist/leaflet-city-mapper.js` });
  await world.page.waitForFunction(() => typeof L.Map.prototype.getPitch === 'function');
  assert.equal(await world.page.evaluate(() => 'CityMapper' in globalThis), false);
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
      factories[`Layer(${type})`] = () => new L.Layer({ source: {
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
        if (name.startsWith('Layer(') && typeof L.Map.prototype.getPitch === 'function') await waitLayer(instance);
        entries.push([`L.${name} instance`, attributes(instance)]);
        if (instance instanceof L.Map) instance.remove();
      }
      return entries;
    };
    const additions = async before => {
      const baseline = new Map(before);
      return (await snapshot()).flatMap(([name, keys]) =>
        [...keys].filter(key => {
          if (baseline.get(name).has(key)) return false;
          const type = name.slice(2).split(/[ .(]/)[0];
          const prototype = L[type]?.prototype;
          const layer = prototype === L.Layer.prototype || prototype instanceof L.Layer;
          const map = prototype === L.Map.prototype || prototype instanceof L.Map;
          const marker = prototype === L.Marker.prototype || prototype instanceof L.Marker;
          return !(key === 'initialize' && layer ||
            ['getPitch', 'getBearing'].includes(key) && map ||
            key === 'setRotation' && marker);
        }).map(key => `${name}: ${String(key)}`));
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
      const layer = new L.Layer({ source: {
        type,
        url: 'fixture.pmtiles',
        ...(type === 'pmtiles' ? { archive: { getHeader: async () => ({ maxZoom: 19 }) } } : {}),
        ...(type === 'geojson' ? { data: { type: 'FeatureCollection', features: [] } } : {}),
      } });
      await waitLayer(layer);
      if ('ready' in layer || 'setData' in layer || 'ready' in L.Layer || 'setData' in L.Layer) {
        throw new Error('Readiness and source data must not expose additional Layer APIs');
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
    const firstReady = waitLayer(first), secondReady = waitLayer(second);
    const pending = firstReady instanceof Promise && secondReady instanceof Promise;
    const firstPrototype = Object.getPrototypeOf(first);
    await Promise.all([firstReady, secondReady]);
    const warm = new L.Layer({ source: { type: 'pmtiles', url: 'warm.pmtiles', archive } });
    await waitLayer(warm);
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
      routed: first instanceof L.Layer && !(first instanceof L.TileLayer) && !(first instanceof L.GridLayer) &&
        second.options.maxNativeZoom === 19,
      samePrototype: firstPrototype === L.Layer.prototype && Object.getPrototypeOf(first) === firstPrototype &&
        first.constructor === L.Layer && warm.constructor === L.Layer,
      externalMethods: !('onAdd' in first) && !('getHeader' in first) && !('ready' in first) &&
        first.options !== second.options,
      settings: first.options.maxZoom,
      sourceRemoved: first.options.source === undefined,
      header: first.options.maxNativeZoom,
      custom: custom instanceof Custom && custom.options.source.type === 'application-specific',
      initializations,
      marker: marker instanceof L.Marker && marker.getLatLng().equals([55, 10]),
      pitch: typeof L.Map.prototype.getPitch === 'function',
      warm: warm.options.maxNativeZoom === 19,
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
    const invalid = new L.Layer({ source: { type: 'unknown' } });
    const valid = new L.Layer({ source: { type: 'pmtiles', url: 'fixture.pmtiles',
      archive: { getHeader: async () => ({ maxZoom: 19 }) } } });
    let emitted;
    invalid.on('error', ({ error }) => { emitted = error; });
    const validReady = waitLayer(valid);
    const error = await waitLayer(invalid).then(() => null, error => error);
    await validReady;
    return { error: error?.message, emitted: emitted === error, header: valid.options.maxNativeZoom };
  });
  assert.deepEqual(result, { error: 'Unknown layer type: unknown', emitted: true, header: 19 });
});
