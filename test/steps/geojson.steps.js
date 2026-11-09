import * as globals from '../fixtures/globals.js';
import { dependencyFile } from '../fixtures/dependencies.js';


import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { prepare3DChecks } from './3d.steps.js';

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

Then('the minimal GeoJSON example renders the Colosseum at different heights', { timeout: 60000 }, async function () {
  const errors = [];
  this.page.on('pageerror', error => errors.push(error.message));
  await this.context.route('**/libs/leaflet-lens.js', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: `${await response.text()}
      L.Control.Lens.addInitHook(function () { globalThis.testLensControl = this; });` });
  });
  const imageryRequests = [], remoteRequests = [];
  this.page.on('request', request => {
    if (request.url().endsWith('colosseum.pmtiles')) imageryRequests.push(request.url());
    if (/arcgisonline\.com|archeositarproject\.it|geoportale\.regione\.lazio\.it|elevation-tiles-prod/.test(request.url())) {
      remoteRequests.push(request.url());
    }
  });
  await this.page.goto(`${this.baseUrl}/examples/leaflet-city-mapper-geojson.html`, { waitUntil: 'domcontentloaded' });
  await this.page.waitForFunction(() => {
    return Object.values(map._layers).some(layer => globals.sceneByLayer.get(layer)._geojson &&
      [...globals.sceneByLayer.get(layer)._areas.values()].some(area => area.done && area.buildings === 5));
  });
  assert.equal(await this.page.locator('#help').count(), 0);
  assert.equal(await this.page.getByRole('button', { name: 'Flip map', exact: true }).count(), 0);
  assert.equal(await this.page.evaluate(() => map.getPitch()), 65);
  await this.page.waitForFunction(() => Object.values(map._layers).some(layer =>
    layer.options.asset === 'orthophoto' &&
    [...globals.sceneByLayer.get(layer)._rasterTiles.values()].some(tile => tile.done)));
  assert.ok(imageryRequests.length > 0, 'Initial view uses local orthophotography');
  assert.deepEqual(remoteRequests, [], 'The map must not call remote imagery providers');
  await this.page.waitForFunction(() => {
    const terrain = globals.cameraByMap.get(map)._terrain3D;
    return terrain && globals.sceneByLayer.get(terrain)._terrainReady;
  });
  await prepare3DChecks(this.page);
  const geometry = await this.page.evaluate(() => {
    const layer = Object.values(map._layers).find(layer => globals.sceneByLayer.get(layer)._geojson);
    const features = layer.options.data.features;
    const mesh = globals.sceneByLayer.get(layer)._areas.get('geojson').mesh;
    const positions = mesh.geometry.attributes.position.data;
    const terrain = globals.cameraByMap.get(map)._terrain3D;
    const roofs = mesh.extras.featureFaces.map((face, index) => {
      let highest = -Infinity;
      for (let i = face.vertexStart; i < face.vertexEnd; i++) {
        highest = Math.max(highest, positions[i * 3 + 1]);
      }
      const ground = Math.max(...features[index].geometry.coordinates.flat().map(([lng, lat]) =>
        nativeChecks.getElevation(terrain, new L.LatLng(lat, lng)))) - globals.sceneByLayer.get(layer).root.position[1];
      return Math.round((highest - ground) * 1000) / 1000;
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
    return Object.values(map._layers).some(layer => globals.sceneByLayer.get(layer)._type === 'cog' &&
      [...globals.sceneByLayer.get(layer)._rasterTiles.values()].some(tile => tile.done));
  });
  assert.equal(await this.page.locator('canvas.leaflet-3d').count(), 1);
  assert.ok(await this.page.locator('.leaflet-control-attribution').textContent().then(text =>
    text.includes('SITAR') && text.includes('Regione Lazio') && text.includes('2002/03') && text.includes('CC BY 4.0')));
  await this.page.evaluate(() => {
    // Isolate raster clipping from the model's pointer highlight.
    Object.values(map._layers).find(layer => globals.sceneByLayer.get(layer)._geojson).remove();
  });
  await this.page.waitForFunction(() => {
    const rasters = Object.values(map._layers).filter(layer => globals.sceneByLayer.get(layer)._type === 'cog');
    const terrain = globals.cameraByMap.get(map)._terrain3D;
    return rasters.length === 2 && rasters.every(layer =>
      globals.sceneByLayer.get(layer)._rasterTiles.size > 0 &&
      globals.sceneByLayer.get(layer)._loadingTiles === 0 &&
      [...globals.sceneByLayer.get(layer)._rasterTiles.values()].every(tile =>
        tile.done && performance.now() - tile.loadedAt >= tile.mesh.fadeDuration)) &&
      globals.sceneByLayer.get(terrain).renderer.frameMeshes.every(mesh =>
      mesh._appearance === undefined || mesh._appearance === 1);
  });
  await this.page.locator('#map').dispatchEvent('pointerleave');
  await this.page.evaluate(async () => {
    const layer = globals.cameraByMap.get(map)._terrain3D;
    globalThis.lensBaseline = await nativeChecks.pixels(layer);
  });
  const box = await this.page.locator('#map').boundingBox();
  for (const [x, y] of [[220, 220], [480, 250]]) {
    await this.page.mouse.move(box.x + x, box.y + y);
    assert.equal(await this.page.locator('.leaflet-lens').isVisible(), true);
    const changed = await this.page.evaluate(async ({ x, y }) => {
      const baseline = globalThis.lensBaseline;
      const layer = globals.cameraByMap.get(map)._terrain3D;
      const renderer = globals.sceneByLayer.get(layer).renderer;
      const cutout = Object.values(map._layers).find(layer =>
        layer.options.asset === 'orthophoto').options.cutout;
      const radius = cutout.radius;
      const pixels = await nativeChecks.pixels(layer);
      let inside = 0, outside = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const px = (i / 4 % renderer.canvas.width + 0.5) / renderer.dpr;
        const py = (renderer.canvas.height - Math.floor(i / 4 / renderer.canvas.width) - 0.5) / renderer.dpr;
        const distance = Math.hypot(px - x, py - y);
        const different = Math.abs(pixels[i] - baseline[i]) + Math.abs(pixels[i + 1] - baseline[i + 1]) +
          Math.abs(pixels[i + 2] - baseline[i + 2]) > 15;
        if (different && distance < radius - 1) inside++;
        if (different && distance > radius + 1) outside++;
      }
      return { inside, outside };
    }, { x, y });
    assert.ok(changed.inside > 1000, `Archaeology must visibly replace the orthophoto inside the lens: ${JSON.stringify(changed)}`);
    assert.equal(changed.outside, 0, `Orthophoto must remain unchanged outside the circular lens: ${JSON.stringify(changed)}`);
  }
  const toggle = this.page.getByRole('button', { name: 'Toggle lens', exact: true });
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-pressed'), 'false');
  assert.equal(await this.page.locator('.leaflet-lens').isVisible(), false);
  assert.equal(await this.page.evaluate(() => Object.values(map._layers).find(layer =>
    layer.options.asset === 'orthophoto').options.cutout.radius), 0);
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
  await this.page.locator('#map').dispatchEvent('pointermove', { clientX: 220, clientY: 220 });
  await this.page.locator('#map').dispatchEvent('pointerleave');
  assert.equal(await this.page.locator('.leaflet-lens').isVisible(), false);
  await this.page.locator('#map').focus();
  assert.equal(await this.page.locator('.leaflet-lens').isVisible(), true);
  await this.page.keyboard.press('Escape');
  assert.equal(await this.page.locator('.leaflet-lens').isVisible(), false);
  assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
  await toggle.click();
  await this.page.locator('#map').dispatchEvent('pointermove', { clientX: 220, clientY: 220 });
  assert.equal(await this.page.locator('.leaflet-lens').isVisible(), false);
  assert.equal(await this.page.evaluate(async () => {
    const layer = globals.cameraByMap.get(map)._terrain3D;
    const pixels = await nativeChecks.pixels(layer);
    return pixels.every((value, i) => value === globalThis.lensBaseline[i]);
  }), true, 'Disabling restores the complete outer raster');
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
  const requestsBeforeReadd = imageryRequests.length;
  await this.page.evaluate(() => { testLensControl.remove(); testLensControl.addTo(map); });
  await this.page.locator('#map').dispatchEvent('pointermove', { clientX: 220, clientY: 220 });
  assert.equal(await this.page.evaluate(async () => {
    const layer = globals.cameraByMap.get(map)._terrain3D;
    const pixels = await nativeChecks.pixels(layer);
    return pixels.some((value, i) => Math.abs(value - globalThis.lensBaseline[i]) > 15);
  }), true, 'Re-adding the control updates already loaded GPU meshes');
  assert.equal(imageryRequests.length, requestsBeforeReadd, 'Re-adding never reloads raster tiles');
  await this.page.setViewportSize({ width: 375, height: 667 });
  await this.page.waitForFunction(() => map.getSize().x === 375 && map.getSize().y === 667);
  await this.page.locator('#map').dispatchEvent('pointermove', { clientX: 180, clientY: 300 });
  assert.equal(await this.page.locator('.leaflet-lens').isVisible(), true);
  assert.deepEqual(remoteRequests, []);
  assert.deepEqual(errors, []);
});

Then('a touch device can enable and immediately disable the lens', { timeout: 60000 }, async function () {
  const context = await this.context.browser().newContext({
    viewport: { width: 375, height: 667 },
    isMobile: this.context.browser().browserType().name() !== 'firefox', hasTouch: true,
  });
  try {
    await context.route('https://unpkg.com/leaflet@*/dist/*', route =>
      route.fulfill({ path: dependencyFile(route.request().url()) }));
    const page = await context.newPage();
    await page.goto(this.baseUrl);
    await page.setContent('<meta name="viewport" content="width=device-width, initial-scale=1"><div id="map" style="width:375px;height:600px"></div>');
    const version = process.env.LEAFLET_VERSION === '2' ? '2.0.0-alpha.1' : '1.9.4';
    const script = version === '1.9.4' ? 'leaflet-src.js' : 'leaflet-global-src.js';
    await page.addStyleTag({ url: `https://unpkg.com/leaflet@${version}/dist/leaflet.css` });
    await page.addScriptTag({ url: `https://unpkg.com/leaflet@${version}/dist/${script}` });
    await page.evaluate(() => { globalThis.L ||= globalThis.leaflet; });
    await page.addScriptTag({ url: `${this.baseUrl}/libs/leaflet-lens.js` });
    await page.evaluate(() => {
      globalThis.map = new L.Map('map', { center: [0, 0], zoom: 1 });
      globalThis.outer = new L.Layer();
      globalThis.inner = new L.Layer();
      globalThis.lens = new L.Control.Lens(outer, inner).addTo(map);
    });
    const toggle = page.getByRole('button', { name: 'Toggle lens', exact: true });
    assert.equal(await page.evaluate(() => matchMedia('(hover: none) and (pointer: coarse)').matches), true);
    assert.equal(await toggle.getAttribute('aria-pressed'), 'false');
    await page.touchscreen.tap(180, 300);
    assert.equal(await page.locator('.leaflet-lens').isVisible(), false);
    await toggle.tap();
    assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
    await page.touchscreen.tap(180, 300);
    assert.equal(await page.locator('.leaflet-lens').isVisible(), true);
    assert.equal(await page.evaluate(() => outer.options.cutout.radius), 150);
    assert.equal(await page.evaluate(() => {
      const bounds = map.getContainer().getBoundingClientRect();
      return Math.abs(outer.options.cutout.x - (180 - bounds.left)) < 1 &&
        Math.abs(outer.options.cutout.y - (300 - bounds.top)) < 1;
    }), true, 'A tap places the lens at the touched position');
    await toggle.tap();
    assert.equal(await toggle.getAttribute('aria-pressed'), 'false');
    assert.equal(await page.locator('.leaflet-lens').isVisible(), false);
    assert.equal(await page.evaluate(() => outer.options.cutout.radius), 0);
    await page.touchscreen.tap(180, 300);
    assert.equal(await page.locator('.leaflet-lens').isVisible(), false);
    assert.equal(await page.evaluate(() => new L.Control.Lens(new L.Layer(), new L.Layer(),
      { enabled: true }).options.enabled), true);
  } finally {
    await context.close();
  }
});

Then('lens controls preserve clipping options and remove their handlers', async function () {
  await this.page.addScriptTag({ url: `${this.baseUrl}/libs/leaflet-lens.js` });
  const result = await this.page.evaluate(() => {
    const containers = [document.createElement('div'), document.createElement('div')];
    for (const container of containers) {
      container.style.cssText = 'width:400px;height:300px;transform:scale(.75);transform-origin:top left';
      document.body.append(container);
    }
    const maps = containers.map(container => new L.Map(container, { center: [0, 0], zoom: 1 }));
    const original = { x: 2, y: 3, radius: 8 };
    const outer = new L.Layer({ cutout: original }), inner = new L.Layer();
    const secondOuter = new L.Layer(), secondInner = new L.Layer();
    const control = new L.Control.Lens(outer, inner, { radius: 60 }).addTo(maps[0]);
    const second = new L.Control.Lens(secondOuter, secondInner, { radius: 25 }).addTo(maps[1]);
    const rings = containers.map(container => container.querySelector('.leaflet-lens'));
    const move = (container, x, y, target = container) => {
      const bounds = container.getBoundingClientRect();
      target.dispatchEvent(new PointerEvent('pointermove', {
        bubbles: true, clientX: bounds.left + x * bounds.width / container.offsetWidth,
        clientY: bounds.top + y * bounds.height / container.offsetHeight,
      }));
    };
    move(containers[0], 70, 90);
    const scaled = Math.abs(outer.options.cutout.x - 70) < 0.01 &&
      Math.abs(outer.options.cutout.y - 90) < 0.01 &&
      outer.options.cutout.radius === 60 && inner.options.cutout.outside === true &&
      inner.options.cutout.radius === 60 && rings[0].style.width === '120px' && !rings[0].hidden;
    const isolated = rings[1].hidden && secondOuter.options.cutout.radius === 0;
    const button = control.getContainer().querySelector('button');
    move(containers[0], 70, 90, button);
    const overControls = rings[0].hidden && inner.options.cutout.radius === 0;
    button.click();
    move(containers[0], 70, 90);
    const disabled = rings[0].hidden && outer.options.cutout.radius === 0 &&
      inner.options.cutout.radius === 0 && button.getAttribute('aria-pressed') === 'false';
    const chainable = control.setEnabled(true) === control;
    containers[0].dispatchEvent(new FocusEvent('focus'));
    const focused = !rings[0].hidden && outer.options.cutout.x === 200 && outer.options.cutout.y === 150;
    containers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    const escaped = rings[0].hidden && inner.options.cutout.radius === 0;
    move(containers[0], 70, 90);
    containers[0].dispatchEvent(new FocusEvent('blur'));
    const blurred = rings[0].hidden;
    move(containers[1], 40, 50);
    const independent = secondOuter.options.cutout.radius === 25 && outer.options.cutout.radius === 0;
    control.remove();
    const restored = outer.options.cutout === original && !Object.hasOwn(inner.options, 'cutout') &&
      !rings[0].isConnected && !button.isConnected;
    let redraws = 0;
    maps[0].on('move', () => redraws++);
    move(containers[0], 70, 90);
    containers[0].dispatchEvent(new FocusEvent('focus'));
    button.click();
    const detached = redraws === 0;
    control.addTo(maps[0]);
    redraws = 0;
    move(containers[0], 70, 90);
    const readded = redraws === 1 && containers[0].querySelectorAll('.leaflet-lens').length === 1 &&
      outer.options.cutout.radius === 60;
    const invalid = [];
    for (const radius of [0, -1, NaN, Infinity]) {
      try { new L.Control.Lens(outer, inner, { radius }); }
      catch (error) { invalid.push(error instanceof RangeError); }
    }
    let sameLayer = false;
    try { new L.Control.Lens(outer, outer); }
    catch (error) { sameLayer = error instanceof TypeError; }
    maps[0].remove();
    maps[1].remove();
    const cleaned = !containers.some(container => container.querySelector('.leaflet-lens,.leaflet-control-lens')) &&
      outer.options.cutout === original && !Object.hasOwn(secondInner.options, 'cutout');
    for (const container of containers) container.remove();
    return { scaled, isolated, overControls, disabled, chainable, focused, escaped, blurred,
      independent, restored, detached, readded, invalid, sameLayer, cleaned,
      control: control instanceof L.Control && second instanceof L.Control,
      externalCss: document.querySelectorAll('link[href*="lens"]').length };
  });
  assert.deepEqual(result, {
    scaled: true, isolated: true, overControls: true, disabled: true, chainable: true,
    focused: true, escaped: true, blurred: true, independent: true, restored: true,
    detached: true, readded: true, invalid: [true, true, true, true], sameLayer: true,
    cleaned: true, control: true, externalCss: 0,
  });
});

Then('the Colosseum lighting JSON illuminates the facade and main roads only at night', { timeout: 60000 }, async function () {
  const errors = [];
  this.page.on('pageerror', error => errors.push(error.message));
  await this.page.goto(`${this.baseUrl}/examples/leaflet-city-mapper-geojson.html`, { waitUntil: 'domcontentloaded' });
  await prepare3DChecks(this.page);
  await this.page.locator('#map').dispatchEvent('pointerleave');
  await this.page.waitForFunction(() => {
    const layers = Object.values(map._layers);
    const lights = layers.find(layer => layer.options.nightLight);
    const terrain = globals.cameraByMap.get(map)._terrain3D;
    return lights && globals.sceneByLayer.get(lights)._areas.get('geojson')?.done &&
      globals.sceneByLayer.get(terrain)?._terrainReady &&
      layers.filter(layer => globals.sceneByLayer.get(layer)._type === 'cog').length === 2 &&
      layers.filter(layer => globals.sceneByLayer.get(layer)._type === 'cog').every(layer =>
        globals.sceneByLayer.get(layer)._rasterTiles.size > 0 &&
        globals.sceneByLayer.get(layer)._loadingTiles === 0 &&
        [...globals.sceneByLayer.get(layer)._rasterTiles.values()].every(tile =>
          tile.done && performance.now() - tile.loadedAt >= tile.mesh.fadeDuration)) &&
      globals.sceneByLayer.get(lights).renderer.frameMeshes.every(mesh =>
        mesh._appearance === undefined || mesh._appearance === 1);
  });
  const data = await (await this.context.request.get(`${this.baseUrl}/examples/data/colosseum-lights.json`)).json();
  assert.equal(data.type, 'FeatureCollection');
  assert.equal(data.features.length, 40);
  assert.equal(new Set(data.features.map(feature => feature.id)).size, 40);
  assert.equal(data.features.filter(feature => !feature.properties.road).length, 16);
  assert.match(data.description, /not a surveyed inventory/);
  assert.equal(data.source, undefined);
  for (const road of ['Via dei Fori Imperiali', 'Via Labicana', 'Via di San Gregorio']) {
    const lamps = data.features.filter(feature => feature.properties.road === road);
    assert.equal(lamps.length, 8, road);
    assert.ok(lamps.every(feature => feature.properties.height === 8 &&
      feature.properties.flux < 90000 && feature.properties.radius < 45), road);
  }
  for (const feature of data.features) {
    assert.equal(feature.geometry.type, 'Point');
    assert.equal(feature.properties.osm_id, undefined);
    assert.equal(feature.properties.osm_tags, undefined);
    assert.ok(feature.geometry.coordinates[0] > 12.486 && feature.geometry.coordinates[0] < 12.500);
    assert.ok(feature.geometry.coordinates[1] > 41.885 && feature.geometry.coordinates[1] < 41.894);
    assert.ok(feature.properties.height > 0 && feature.properties.radius > 0 && feature.properties.flux > 0);
  }
  const result = await this.page.evaluate(async () => {
    const lights = Object.values(map._layers).find(layer => layer.options.nightLight);
    const state = globals.sceneByLayer.get(lights);
    const owner = globals.renderers.get(map);
    const select = minute => {
      document.querySelector('input[type=date]').value = '2026-06-21';
      const slider = document.querySelector('input[type=range]');
      slider.value = String(minute);
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const brighter = (lit, dark) => {
      let count = 0;
      for (let i = 0; i < lit.length; i += 4) {
        if (lit[i] + lit[i + 1] + lit[i + 2] > dark[i] + dark[i + 1] + dark[i + 2] + 15) count++;
      }
      return count;
    };
    select(0);
    const night = await nativeChecks.pixels(owner);
    const count = state.renderer.sunlight.lightCount;
    const meshLights = state.root.children.flatMap(mesh => mesh.extras.lights || []);
    state.root.visible = false;
    const dark = await nativeChecks.pixels(owner);
    const removed = state.renderer.sunlight.lightCount;
    state.root.visible = true;
    select(720);
    const day = await nativeChecks.pixels(owner);
    state.root.visible = false;
    const dayWithout = await nativeChecks.pixels(owner);
    state.root.visible = true;
    return { count, removed, nightPixels: brighter(night, dark),
      dayPixels: brighter(day, dayWithout), generatedLights: meshLights.length,
      warm: meshLights.every(light => light.color[0] > light.color[1] && light.color[1] > light.color[2]) };
  });
  assert.equal(result.count, data.features.length);
  assert.equal(result.generatedLights, data.features.length);
  assert.equal(result.removed, 0);
  assert.equal(result.warm, true);
  assert.ok(result.nightPixels > 100, `Night lights must visibly illuminate the scene: ${JSON.stringify(result)}`);
  assert.equal(result.dayPixels, 0, 'Artificial lights must not alter daylight rendering');
  assert.equal(await this.page.evaluate(() => {
    const lights = Object.values(map._layers).find(layer => layer.options.nightLight);
    map.removeLayer(lights);
    const removed = !map.hasLayer(lights);
    lights.addTo(map);
    return removed;
  }), true);
  await this.page.waitForFunction(() => Object.values(map._layers).some(layer =>
    layer.options.nightLight && globals.sceneByLayer.get(layer)._areas.get('geojson')?.done));
  assert.deepEqual(errors, []);
});
