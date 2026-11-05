import * as globals from '../fixtures/globals.js';


import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';

Then('a GeoJSON source from {string} renders and supports replacement and re-adding', async function (input) {
  await this.context.route('**/buildings.geojson', route => route.fulfill({
    json: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature', id: 'office', properties: { height: 25 },
        geometry: { type: 'Polygon', coordinates: [[
          [12.4895, 41.8898], [12.4899, 41.8898], [12.4899, 41.8902],
          [12.4895, 41.8902], [12.4895, 41.8898],
        ]] },
      }],
    },
  }));
  const result = await this.page.evaluate(async input => {
    const container = document.body.appendChild(document.createElement('div'));
    container.style.cssText = 'height:500px;width:600px';
    const map = new L.Map(container, { center: [41.89, 12.49], zoom: 18, rotate: true, pitch: 45 });
    const data = await (await fetch('/buildings.geojson')).json();
    const errors = [];
    const layer = new L.Layer({ source: {
      ...(input === 'inline' ? { data } : { type: 'geojson', url: '/buildings.geojson' }),
      style: feature => ({ top: feature.properties.height }),
      tooltip: feature => feature.id,
    } });
    layer.on('error', ({ error }) => errors.push(error.message));
    const completed = () => new Promise(resolve => {
      const progress = event => {
        if (event.pending) return;
        layer.off('progress', progress);
        resolve({ loaded: event.loaded, errors: event.errors });
      };
      layer.on('progress', progress);
    });
    let done = completed();
    layer.addTo(map);
    const first = await done;
    const type = globals.sceneByLayer.get(layer)._type;
    let area = globals.sceneByLayer.get(layer)._areas.get('geojson');
    const mesh = area.mesh;
    const face = mesh.extras.featureFaces[0];
    const identity = face.id === 'office' && face.properties.height === 25;
    const geometry = mesh.geometry.attributes.position.count > 0;
    map.panTo([41.9, 12.5], { animate: false });
    testOperations.setBearing(map, 90);
    testOperations.setPitch(map, 60);
    const retained = globals.sceneByLayer.get(layer)._areas.get('geojson') === area;
    const previousArea = area;
    const terrainUpdate = new Promise(resolve => {
      const progress = () => {
        const refreshed = globals.sceneByLayer.get(layer)._areas.get('geojson');
        if (refreshed !== previousArea && refreshed?.mesh) {
          layer.off('progress', progress);
          resolve(previousArea.request.signal.aborted);
        }
      };
      layer.on('progress', progress);
    });
    map.fire('terrainchange');
    const terrainUpdated = await terrainUpdate;
    area = globals.sceneByLayer.get(layer)._areas.get('geojson');
    done = completed();
    testOperations.setData(layer, { type: 'FeatureCollection', features: [] });
    const empty = await done;
    const released = area.request.signal.aborted && !globals.sceneByLayer.get(layer).root.children.includes(mesh);
    done = completed();
    testOperations.setData(layer, data);
    const replaced = await done;
    layer.remove();
    const removed = globals.sceneByLayer.get(layer)._areas.size === 0;
    done = completed();
    layer.addTo(map);
    const readded = await done;
    const tooltip = Boolean(globals.sceneByLayer.get(layer)._tooltip);
    layer.remove();
    map.remove();
    return { first, empty, replaced, readded, type, identity, geometry, retained, terrainUpdated, released, removed, tooltip, errors };
  }, input);
  const progress = loaded => ({ loaded, errors: [] });
  assert.deepEqual(result, {
    first: progress(1), empty: progress(0), replaced: progress(1), readded: progress(1),
    type: 'geojson',
    identity: true, geometry: true, retained: true, terrainUpdated: true, released: true, removed: true, tooltip: true, errors: [],
  });
});

Then('GeoJSON reports invalid sources and cancels obsolete downloads', async function () {
  await this.context.route('**/missing.geojson', route => route.fulfill({ status: 404 }));
  await this.context.route('**/broken.geojson', route => route.fulfill({ body: 'not json' }));
  const result = await this.page.evaluate(async () => {
    const container = document.body.appendChild(document.createElement('div'));
    container.style.cssText = 'height:500px;width:600px';
    const map = new L.Map(container, { center: [41.89, 12.49], zoom: 18, rotate: true });
    const failures = [];
    for (const source of [
      {}, { data: null }, { data: {}, url: '/buildings.geojson' },
      { url: '/missing.geojson' }, { url: '/broken.geojson' },
      { data: { type: 'FeatureCollection', features: [] }, style: null },
    ]) {
      const layer = new L.Layer({ source: { type: 'geojson', style: () => ({ top: 10 }), ...source } });
      const failed = new Promise(resolve => layer.once('error', ({ error }) => resolve(error.message)));
      layer.addTo(map);
      failures.push(await failed);
      if (globals.sceneByLayer.get(layer).root.children.length) throw new Error('Invalid source attached a mesh');
      layer.remove();
    }
    const fetchSource = globalThis.fetch;
    let aborted = false;
    let started;
    const loading = new Promise(resolve => { started = resolve; });
    globalThis.fetch = (url, { signal }) => new Promise((resolve, reject) => {
      started();
      signal.addEventListener('abort', () => {
        aborted = true;
        reject(signal.reason);
      }, { once: true });
    });
    const layer = new L.Layer({ source: {
      type: 'geojson', url: '/slow.geojson', style: () => ({ top: 10 }),
    } });
    const errors = [];
    layer.on('error', ({ error }) => errors.push(error.message));
    layer.addTo(map);
    await loading;
    const completed = new Promise(resolve => layer.on('progress', event => {
      if (!event.pending) resolve(event.loaded);
    }));
    testOperations.setData(layer, { type: 'FeatureCollection', features: [] });
    const loaded = await completed;
    globalThis.fetch = fetchSource;
    layer.remove();
    map.remove();
    return { failures, aborted, errors, loaded };
  });
  assert.deepEqual(result.failures.slice(0, 4), [
    'GeoJSON source requires either data or url', 'Invalid GeoJSON response',
    'GeoJSON source requires either data or url', 'Unable to load GeoJSON: HTTP 404',
  ]);
  assert.ok(result.failures[4].length > 0, 'Invalid JSON emits an error');
  assert.equal(result.failures[5], 'style must be a function');
  assert.equal(result.aborted, true);
  assert.equal(result.loaded, 0);
  assert.deepEqual(result.errors, []);
});

Then('the minimal GeoJSON example renders the Colosseum at different heights', { timeout: 30000 }, async function () {
  const errors = [];
  this.page.on('pageerror', error => errors.push(error.message));
  await this.context.route('https://tile.openstreetmap.org/**', route => route.fulfill({
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0u8AAAAASUVORK5CYII=', 'base64'),
  }));
  await this.page.goto(`${this.baseUrl}/examples/leaflet-city-mapper-geojson.html`, { waitUntil: 'domcontentloaded' });
  await this.page.waitForFunction(() => {
    return Object.values(map._layers).some(layer => globals.sceneByLayer.get(layer)._geojson &&
      [...globals.sceneByLayer.get(layer)._areas.values()].some(area => area.done && area.buildings === 5));
  });
  assert.match(await this.page.locator('#status').textContent(), /^Colosseum: 5 parts;/);
  const geometry = await this.page.evaluate(() => {
    const layer = Object.values(map._layers).find(layer => globals.sceneByLayer.get(layer)._geojson);
    const features = layer.options.data.features;
    const mesh = globals.sceneByLayer.get(layer)._areas.get('geojson').mesh;
    const positions = mesh.geometry.attributes.position.data;
    const roofs = mesh.extras.featureFaces.map(face => {
      let highest = -Infinity;
      for (let i = face.vertexStart; i < face.vertexEnd; i++) {
        highest = Math.max(highest, positions[i * 3 + 1]);
      }
      return highest;
    });
    const rings = features.map(feature => feature.geometry.coordinates);
    const centerError = map.project(map.getCenter()).subtract(map.project([41.89021, 12.49223]));
    const rotation = -25 * Math.PI / 180;
    let arenaOpen = true;
    for (let i = 0; i < positions.length; i += 9) {
      if (positions[i + 1] <= 0 || positions[i + 1] !== positions[i + 4] ||
        positions[i + 1] !== positions[i + 7]) continue;
      const east = (positions[i] + positions[i + 3] + positions[i + 6]) / 3;
      const north = -(positions[i + 2] + positions[i + 5] + positions[i + 8]) / 3;
      const x = east * Math.cos(rotation) + north * Math.sin(rotation);
      const y = -east * Math.sin(rotation) + north * Math.cos(rotation);
      if ((x / 43) ** 2 + (y / 27) ** 2 < 0.98) arenaOpen = false;
    }
    return {
      heights: features.map(feature => feature.properties.height),
      roofs,
      holes: rings.slice(0, 3).map(coordinates => coordinates.length),
      closed: rings.every(coordinates => coordinates.every(ring =>
        ring[0][0] === ring.at(-1)[0] && ring[0][1] === ring.at(-1)[1])),
      arenaOpen,
      centered: Math.abs(centerError.x) <= 0.5 && Math.abs(centerError.y) <= 0.5,
    };
  });
  assert.deepEqual(geometry, {
    heights: [8, 16, 28, 48, 30], roofs: [8, 16, 28, 48, 30],
    holes: [2, 2, 2], closed: true, arenaOpen: true, centered: true,
  });
  await this.page.waitForFunction(() => {
    const layers = Object.values(map._layers);
    return layers.some(layer => layer instanceof L.TileLayer &&
      layer._url === 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' && !testOperations.isLoading(layer) &&
      Object.values(layer._tiles).some(tile => tile.loaded));
  });
  assert.equal(await this.page.locator('canvas.leaflet-3d').count(), 1);
  assert.ok(await this.page.locator('.leaflet-control-attribution').textContent().then(text => text.includes('OpenStreetMap')));
  assert.deepEqual(errors, []);
});
