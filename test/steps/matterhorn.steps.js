import assert from 'node:assert/strict';
import { Given, Then } from '@cucumber/cucumber';
import { PNG } from 'pngjs';
import { prepare3DChecks } from './3d.steps.js';

async function whiteFraction(page) {
  return page.evaluate(async () => {
    const pixels = await nativeChecks.pixels(globals.renderers.get(map));
    let white = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] > 245 && pixels[i + 1] > 245 && pixels[i + 2] > 245 && pixels[i + 3] > 0) white++;
    }
    return white / (pixels.length / 4);
  });
}

async function waitForTerrain(page) {
    await page.waitForFunction(() => {
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const state = globals.sceneByLayer.get(layer)._nativeGPU;
      return Object.keys(layer._tiles).length > 0 && Object.entries(layer._tiles).every(([key, tile]) =>
        tile.loaded && (tile._gpuOpacity ?? 1) === 1 && state.terrainRequests.get(key)?.tiles &&
        state.meshes.get(key)?._terrainRequest === state.terrainRequests.get(key)) &&
        [...state.meshes.values()].every(mesh => mesh._appearance === undefined || mesh._appearance === 1);
    });
}

async function terrainTrackClearance(zoom) {
  if (Number.isFinite(zoom)) {
    return new Promise((resolve, reject) => {
      map.once('zoomanim', () => requestAnimationFrame(() => terrainTrackClearance().then(resolve, reject)));
      map.setZoom(zoom, { animate: true });
    });
  }
  const animating = Boolean(map._animatingZoom);
  const state = globals.sceneByLayer.get(terrainTrack)._nativeGPU;
  const positions = state.meshes.get('stroke').geometry.attributes.position.data;
  const location = testWeakmaps.locationByLayer.get(state.backend);
  const origin = map.options.crs.project(location), metres = Math.cos(location.lat * Math.PI / 180);
  const root = testWeakmaps.rootByLayer.get(state.backend);
  const gridLayer = Object.values(map._layers).find(layer => layer instanceof L.TileLayer);
  const grid = globals.sceneByLayer.get(gridLayer)._nativeGPU;
  const groundRoot = testWeakmaps.rootByLayer.get(grid.backend);
  let minGap = Infinity, maxGap = -Infinity, samples = 0;
  for (let i = 0; i < positions.length; i += 9) {
    const x = (positions[i] + positions[i + 3] + positions[i + 6]) / 3;
    const y = (positions[i + 1] + positions[i + 4] + positions[i + 7]) / 3;
    const z = (positions[i + 2] + positions[i + 5] + positions[i + 8]) / 3;
    const latlng = map.options.crs.unproject(new L.Point(origin.x + x / metres, origin.y - z / metres));
    let ground = -Infinity;
    for (const mesh of grid.meshes.values()) {
      if (!mesh._terrainRequest) continue;
      const tile = mesh._terrainRequest.tile.coords, pixel = map.project(latlng, tile.z);
      const tx = pixel.x - tile.x * 256, ty = pixel.y - tile.y * 256;
      if (tx < 0 || tx > 256 || ty < 0 || ty > 256) continue;
      const col = Math.min(31, Math.floor(tx / 8)), row = Math.min(31, Math.floor(ty / 8));
      const u = tx / 8 - col, v = ty / 8 - row, values = mesh.geometry.attributes.position.data;
      const index = (row * 32 + col) * 18;
      const elevation = u + v <= 1 ?
        values[index + 1] * (1 - u - v) + values[index + 4] * v + values[index + 7] * u :
        values[index + 10] * (1 - v) + values[index + 13] * (1 - u) + values[index + 16] * (u + v - 1);
      ground = Math.max(ground, groundRoot.position[1] + elevation * groundRoot.scale[1]);
    }
    if (!Number.isFinite(ground)) continue;
    const gap = root.position[1] + y * root.scale[1] - ground;
    minGap = Math.min(minGap, gap);
    maxGap = Math.max(maxGap, gap);
    samples++;
  }
  const pixels = await nativeChecks.pixels(globals.renderers.get(map));
  let red = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i] > 200 && pixels[i + 1] < 80 && pixels[i + 2] < 80) red++;
  }
  return { minGap, maxGap, samples, red, animating,
    levels: [...new Set([...grid.meshes.values()].filter(mesh => mesh._terrainRequest)
      .map(mesh => mesh._terrainRequest.tile.coords.z))] };
}

Then('a native track remains visible on the streamed terrain', { timeout: 30000 }, async function () {
    await waitForTerrain(this.page);
    await this.page.evaluate(() => {
      window.terrainTrack = new L.Polyline([[45.972, 7.645], [45.980, 7.675]],
        { color: '#ff0000', weight: 8, opacity: 1 }).addTo(map);
    });
    await this.page.waitForFunction(() => {
      const state = globals.sceneByLayer.get(terrainTrack)._nativeGPU;
      return state?.meshes?.get('stroke')?.geometry.attributes.position.data.length > 0;
    });
    await this.page.evaluate(async () => {
      const state = globals.sceneByLayer.get(terrainTrack)._nativeGPU;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await globals.sceneByLayer.get(state.backend).renderer.device.queue.onSubmittedWorkDone();
    });
    const result = await this.page.evaluate(async () => {
      const state = globals.sceneByLayer.get(terrainTrack)._nativeGPU;
      const heights = state.meshes.get('stroke').geometry.attributes.position.data.filter((_, i) => i % 3 === 1);
      const positions = state.meshes.get('stroke').geometry.attributes.position.data;
      const origin = map.options.crs.project(testWeakmaps.locationByLayer.get(state.backend));
      const metres = Math.cos(testWeakmaps.locationByLayer.get(state.backend).lat * Math.PI / 180);
      const root = testWeakmaps.rootByLayer.get(state.backend);
      let error = 0;
      for (let i = 0; i < positions.length; i += 9) {
        const x = (positions[i] + positions[i + 3] + positions[i + 6]) / 3;
        const y = (positions[i + 1] + positions[i + 4] + positions[i + 7]) / 3;
        const z = (positions[i + 2] + positions[i + 5] + positions[i + 8]) / 3;
        const location = map.options.crs.unproject(new L.Point(origin.x + x / metres, origin.y - z / metres));
        const ground = nativeCheckModules.mapElevationOf(map, location);
        error = Math.max(error, Math.abs(root.position[1] + y * root.scale[1] - ground - 1));
      }
      const pixels = await nativeChecks.pixels(globals.renderers.get(map));
      let red = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] > 200 && pixels[i + 1] < 80 && pixels[i + 2] < 80) red++;
      }
      return { min: Math.min(...heights), max: Math.max(...heights), red, error, vertices: positions.length / 3 };
    });
    assert.ok(result.min !== 0 || result.max !== 0, `track stayed on the flat plane: ${JSON.stringify(result)}`);
    assert.ok(result.red > 20, `track is hidden by the terrain: ${JSON.stringify(result)}`);
    assert.ok(result.error < 0.1, `track triangles cut through the rendered terrain: ${JSON.stringify(result)}`);
});

Then('native tracks stay on terrain when basemaps use different latitude origins', { timeout: 30000 }, async function () {
  for (const latitude of [46.25, 45.75]) {
    await this.page.evaluate(latitude => {
      if (window.terrainTrack) terrainTrack.remove();
      const previous = Object.values(map._layers).find(layer => layer instanceof L.TileLayer);
      map.setView([latitude, 7.6586], 13, { animate: false });
      previous.remove();
      new L.TileLayer(previous._url, { ...previous.options }).addTo(map);
    }, latitude);
    await waitForTerrain(this.page);
    const scale = await this.page.evaluate(() => {
      const layer = Object.values(map._layers).find(layer => layer instanceof L.TileLayer);
      const state = globals.sceneByLayer.get(layer)._nativeGPU;
      const center = map.getCenter();
      window.terrainTrack = new L.Polyline([[center.lat - 0.004, center.lng - 0.012],
        [center.lat + 0.004, center.lng + 0.012]], { color: '#ff0000', weight: 8, opacity: 1 }).addTo(map);
      return testWeakmaps.rootByLayer.get(state.backend).scale[1];
    });
    assert.ok(Math.abs(scale - 1) > 0.003, `the basemap must have a different origin: ${scale}`);
    await this.page.waitForFunction(() => globals.sceneByLayer.get(terrainTrack)._nativeGPU?.meshes?.has('stroke'));
    const result = await this.page.evaluate(terrainTrackClearance);
    assert.ok(result.samples > 0 && result.minGap > 0.8 && result.maxGap < 1.2,
      `latitude scaling changed the rendered terrain height: ${JSON.stringify({ latitude, scale, ...result })}`);
    assert.ok(result.red > 20, `the basemap hides the track: ${JSON.stringify(result)}`);
  }
});

Then('a native track follows rendered terrain throughout a zoom transition of {int} level', { timeout: 30000 }, async function (delta) {
  await waitForTerrain(this.page);
  await this.page.evaluate(() => {
    window.terrainTrack = new L.Polyline([[45.972, 7.645], [45.980, 7.675]],
      { color: '#ff0000', weight: 8, opacity: 1 }).addTo(map);
  });
  await this.page.waitForFunction(() => globals.sceneByLayer.get(terrainTrack)._nativeGPU?.meshes?.has('stroke'));
  this.matterhornDetail.delayed = true;
  const initialZoom = await this.page.evaluate(() => map.getZoom());
  this.matterhornDetail.delayColumn = await this.page.evaluate(zoom =>
    Math.floor(map.project(map.getCenter(), zoom).x / 256), initialZoom);
  const zoom = initialZoom + delta;
  // Hold partial terrain until the frame assertions finish, independent of GPU speed.
  let release;
  this.matterhornDetail.gate = new Promise(resolve => { release = resolve; });
  try {
    const first = await this.page.evaluate(terrainTrackClearance, zoom);
    assert.ok(first.animating, 'the check must cover the active zoom animation');
    for (let i = 0; i < 6; i++) {
      await this.page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const result = await this.page.evaluate(terrainTrackClearance);
      assert.ok(result.samples > 0 && result.minGap > 0.8 && result.maxGap < 1.2,
        `track does not follow rendered terrain during zoom ${zoom}: ${JSON.stringify(result)}`);
      assert.ok(result.red > 20, `track disappeared during zoom ${zoom}: ${JSON.stringify(result)}`);
      assert.equal(result.levels.length, 1, 'overlapping terrain levels must not occlude the replacement track');
    }
    if (delta > 0) {
      await this.page.waitForFunction(zoom => {
        const layer = Object.values(map._layers).find(layer => layer instanceof L.TileLayer);
        const requests = [...globals.sceneByLayer.get(layer)._nativeGPU.terrainRequests.values()]
          .filter(request => request.tile.coords.z === zoom);
        return requests.some(request => request.tiles) && requests.some(request => !request.tiles);
      }, zoom);
      const partial = await this.page.evaluate(terrainTrackClearance);
      assert.deepEqual(partial.levels, [initialZoom], 'partial replacements must leave the outgoing terrain intact');
      assert.ok(partial.minGap > 0.8 && partial.maxGap < 1.2 && partial.red > 20,
        `track detached while only part of the incoming terrain was ready: ${JSON.stringify(partial)}`);
    }
  } finally {
    release();
    this.matterhornDetail.gate = null;
  }
  await waitForTerrain(this.page);
  const result = await this.page.evaluate(terrainTrackClearance);
  assert.ok(result.samples > 0 && result.minGap > 0.8 && result.maxGap < 1.2,
    `track does not follow replacement terrain: ${JSON.stringify(result)}`);
});

Then('a metre-offset track preserves its pixels with terrain depth testing', { timeout: 30000 }, async function () {
  await this.page.evaluate(() => map.setZoom(10, { animate: false }));
  await waitForTerrain(this.page);
  await this.page.evaluate(() => {
    const center = map.getCenter();
    window.terrainTrack = new L.Polyline([[center.lat - 0.06, center.lng - 0.12],
      [center.lat + 0.06, center.lng + 0.12]], { color: '#ff0000', weight: 8, opacity: 1 }).addTo(map);
  });
  await this.page.waitForFunction(() => globals.sceneByLayer.get(terrainTrack)._nativeGPU?.meshes?.has('stroke'));
  const result = await this.page.evaluate(async () => {
    const owner = globals.renderers.get(map);
    const program = globals.sceneByLayer.get(terrainTrack)._nativeGPU.meshes.get('stroke').program;
    const actual = await nativeChecks.pixels(owner), original = program.depthTest;
    let reference;
    try {
      program.depthTest = false;
      reference = await nativeChecks.pixels(owner);
    } finally {
      program.depthTest = original;
      nativeChecks.render.render(owner);
    }
    let expected = 0, retained = 0;
    for (let i = 0; i < reference.length; i += 4) {
      if (reference[i] <= 200 || reference[i + 1] >= 40 || reference[i + 2] >= 40) continue;
      expected++;
      if (actual[i] > 200 && actual[i + 1] < 40 && actual[i + 2] < 40) retained++;
    }
    const gridLayer = Object.values(map._layers).find(layer => layer instanceof L.TileLayer);
    const grid = globals.sceneByLayer.get(gridLayer)._nativeGPU;
    const raised = [];
    let occluded = 0;
    try {
      for (const mesh of grid.meshes.values()) {
        const attribute = mesh.geometry.attributes.position;
        raised.push({ mesh, attribute, data: attribute.data.slice() });
        for (let i = 1; i < attribute.data.length; i += 3) attribute.data[i] += 1000;
        attribute.needsUpdate = true;
        mesh.geometry.bounds = null;
      }
      const pixels = await nativeChecks.pixels(owner);
      for (let i = 0; i < reference.length; i += 4) {
        if (reference[i] > 200 && reference[i + 1] < 40 && reference[i + 2] < 40 &&
          pixels[i] > 200 && pixels[i + 1] < 40 && pixels[i + 2] < 40) occluded++;
      }
    } finally {
      for (const { mesh, attribute, data } of raised) {
        attribute.data.set(data);
        attribute.needsUpdate = true;
        mesh.geometry.bounds = null;
      }
      nativeChecks.render.render(owner);
    }
    return { expected, retained, coverage: retained / expected, occluded };
  });
  assert.ok(result.expected > 100, `the reference must contain a visible track: ${JSON.stringify(result)}`);
  assert.ok(result.coverage > 0.99, `terrain depth testing fragments the track: ${JSON.stringify(result)}`);
  assert.equal(result.occluded, 0, 'Terrain in front of the track must still occlude it');
});

Given(/^the Matterhorn example is open with (flat )?offline elevation and satellite tiles$/, { timeout: 30000 }, async function (flat) {
    await this.page.setViewportSize({ width: 640, height: 480 });
    const terrain = new PNG({ width: 512, height: 512 });
    for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
      terrain.data.set(flat ? [129, 244, 0, 255] :
        [128 + Math.floor(x / 256) + 2 * Math.floor(y / 256), 10, 128, 255], (y * 512 + x) * 4);
    }
    const ground = new PNG({ width: 256, height: 256 });
    ground.data.fill(255);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      if (x % 32 >= 8) continue;
      ground.data[(y * 256 + x) * 4] = Math.floor(y / 16) * 16;
      ground.data[(y * 256 + x) * 4 + 1] = Math.floor(x / 32) * 32;
    }
    const terrainImage = PNG.sync.write(terrain), groundImage = PNG.sync.write(ground), requests = [];
    this.matterhornRequests = requests;
    this.matterhornDetail = { delayed: false };
    await this.page.route('https://tiles.mapterhorn.com/**', async route => {
      requests.push(route.request().url());
      if (route.request().url().endsWith('/0/0/0.webp')) return route.fulfill({ status: 503 });
      if (this.matterhornDetail.delayed && /\/14\/\d+\/\d+\.webp$/.test(route.request().url())) {
        const column = Number(route.request().url().split('/').at(-2));
        if (this.matterhornDetail.delayColumn === undefined || column >= this.matterhornDetail.delayColumn) {
          await (this.matterhornDetail.gate || new Promise(resolve => setTimeout(resolve, 3500)));
        }
      }
      return route.fulfill({ contentType: 'image/png', body: terrainImage, headers: { 'Access-Control-Allow-Origin': '*' } });
    });
    await this.page.route('https://server.arcgisonline.com/**', route =>
      route.fulfill({ contentType: 'image/png', body: groundImage, headers: { 'Access-Control-Allow-Origin': '*' } }));
    await this.page.goto(`${this.baseUrl}/examples/leaflet-city-mapper-matterhorn.html`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForFunction(() => {
      const layer = Object.values(window.map._layers).find(item => item instanceof L.TileLayer);
      const state = layer && globals.sceneByLayer.get(layer)._nativeGPU;
      const camera = state && globals.sceneByLayer.get(state.backend).camera;
      return state?.meshes?.size > 0 && camera?.target[1] > 0 &&
        [...state.meshes.values()].some(mesh => mesh._terrainRequest);
    }, null, { timeout: 30000 });
    await prepare3DChecks(this.page);
});

Then('Matterhorn elevation samples, camera height and viewport coverage match the DEM', { timeout: 30000 }, async function () {
    const requests = this.matterhornRequests;
    const initial = await this.page.evaluate(async () => {
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const state = globals.sceneByLayer.get(layer)._nativeGPU;
      const terrainLayer = Object.values(map._layers).find(item => typeof item.options?.getTile === 'function');
      const samples = [];
      for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
        samples.push((await terrainLayer.options.getTile(14, 2 + x, 2 + y))[0]);
      }
      const failure = await terrainLayer.options.getTile(1, 0, 0).then(() => null, error => error.message);
      const mesh = [...state.meshes.values()].find(item => item._terrainRequest);
      const heights = mesh.geometry.attributes.position.data.filter((_, i) => i % 3 === 1);
      const camera = globals.sceneByLayer.get(state.backend).camera;
      return { samples, failure, native: layer instanceof L.TileLayer, separate: !!terrainLayer && terrainLayer !== layer,
        variation: Math.max(...heights) - Math.min(...heights), target: camera.target[1], depthWrite: mesh.program.depthWrite,
        initialKeys: [...testWeakmaps.streamTerrainByMap.get(map).terrainCache.keys()] };
    });
    assert.deepEqual(initial.samples, [10.5, 266.5, 522.5, 778.5]);
    assert.match(initial.failure, /HTTP 503/);
    assert.equal(initial.native, true);
    assert.equal(initial.separate, true);
    assert.ok(initial.variation > 0, `terrain mesh is flat: ${initial.variation}`);
    assert.equal(initial.depthWrite, true, 'terrain must write depth to avoid hiding nearer peaks');
    assert.ok(initial.target >= 10, `camera did not follow terrain: ${initial.target}`);
    assert.equal(requests.filter(url => url.endsWith('/13/1/1.webp')).length, 1);
    const coverage = await this.page.evaluate(() => {
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const state = globals.sceneByLayer.get(layer)._nativeGPU;
      const stream = testWeakmaps.streamTerrainByMap.get(map);
      const owner = testWeakmaps.renderers.get(map), origin = testWeakmaps.sceneOriginByLayer.get(owner);
      const inverse = new DOMMatrix(globals.sceneByLayer.get(state.backend).camera.projectionViewMatrix).inverse();
      const projectedOrigin = map.options.crs.project(origin), metres = Math.cos(origin.lat * Math.PI / 180);
      const bounds = layer._getTiledPixelBounds(map.getCenter());
      const misses = [];
      const ranges = [...stream.terrainCache].filter(([key, entry]) =>
        key.startsWith(`${layer._tileZoom}/`) && entry.range).map(([, entry]) => entry.range);
      for (const height of [Math.min(...ranges.map(range => range[0])), Math.max(...ranges.map(range => range[1]))]) {
        for (const x of [-1, 1]) for (const y of [-1, 1]) {
          const a = new DOMPoint(x, y, 0, 1).matrixTransform(inverse);
          const b = new DOMPoint(x, y, 1, 1).matrixTransform(inverse);
          const ax = a.x / a.w, ay = a.y / a.w, az = a.z / a.w;
          const bx = b.x / b.w, by = b.y / b.w, bz = b.z / b.w;
          const t = (height - ay) / (by - ay);
          const latlng = map.options.crs.unproject(new L.Point(projectedOrigin.x + (ax + t * (bx - ax)) / metres,
            projectedOrigin.y - (az + t * (bz - az)) / metres));
          const pixel = map.project(latlng, layer._tileZoom);
          misses.push(Math.max(bounds.min.x - pixel.x, pixel.x - bounds.max.x,
            bounds.min.y - pixel.y, pixel.y - bounds.max.y, 0));
        }
      }
      return Math.max(...misses);
    });
    assert.ok(coverage < 2, `terrain tile bounds miss viewport rays by ${coverage}px`);
});

Then('Matterhorn terrain survives cache eviction', { timeout: 30000 }, async function () {
    await this.page.waitForFunction(() => {
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const state = globals.sceneByLayer.get(layer)._nativeGPU, z = map.getZoom();
      const point = map.project(map.getCenter(), z);
      return state.terrainRequests.get(`${Math.floor(point.x / 256)}:${Math.floor(point.y / 256)}:${z}`)?.tiles;
    }, null, { timeout: 30000 });
    const evicted = await this.page.evaluate(async () => {
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const state = globals.sceneByLayer.get(layer)._nativeGPU, stream = testWeakmaps.streamTerrainByMap.get(map);
      const z = map.getZoom(), point = map.project(map.getCenter(), z);
      const x = Math.floor(point.x / 256), y = Math.floor(point.y / 256);
      const request = state.terrainRequests.get(`${x}:${y}:${z}`);
      const expected = request.tiles.get(`${x}/${y}`)[Math.floor(point.y % 256) * 256 + Math.floor(point.x % 256)];
      const entry = stream.terrainCache.values().next().value;
      for (let i = 0; i < 257; i++) {
        stream.terrainCache.set(`0/eviction/${i}`, entry);
        while (stream.terrainCache.size > 256) stream.terrainCache.delete(stream.terrainCache.keys().next().value);
      }
      map.fire('move');
      await new Promise(resolve => setTimeout(resolve, 100));
      return { expected, cached: stream.terrainCache.has(`${z}/${x}/${y}`),
        target: globals.sceneByLayer.get(state.backend).camera.target[1] };
    });
    assert.equal(evicted.cached, false, 'center elevation should be evicted from the bounded cache');
    assert.ok(Math.abs(evicted.target - evicted.expected) < 1,
      `camera lost visible terrain elevation after eviction: ${JSON.stringify(evicted)}`);
    await waitForTerrain(this.page);
    await this.page.evaluate(async () => {
      const owner = globals.renderers.get(map);
      await globals.sceneByLayer.get(owner).renderer.device.queue.onSubmittedWorkDone();
    });
    assert.ok(await whiteFraction(this.page) > 0.1, 'terrain disappeared after cache eviction');
});

Then('Matterhorn depth ordering is independent of tile draw order', { timeout: 30000 }, async function () {
    await this.page.evaluate(() => cityMapperTestOperations.mapSetPitchAndBearing(map, 60, 210));
    await waitForTerrain(this.page);
    await this.page.evaluate(async () => {
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const state = globals.sceneByLayer.get(layer)._nativeGPU;
      for (const mesh of state.meshes.values()) mesh.renderOrder = mesh.id;
      map.fire('pitch');
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await globals.sceneByLayer.get(state.backend).renderer.device.queue.onSubmittedWorkDone();
    });
    const forward = PNG.sync.read(await this.page.screenshot());
    await this.page.evaluate(async () => {
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const state = globals.sceneByLayer.get(layer)._nativeGPU;
      for (const mesh of state.meshes.values()) mesh.renderOrder = -mesh.id;
      map.fire('pitch');
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await globals.sceneByLayer.get(state.backend).renderer.device.queue.onSubmittedWorkDone();
    });
    const reverse = PNG.sync.read(await this.page.screenshot());
    let changed = 0;
    for (let i = 0; i < forward.data.length; i += 4) {
      if (Math.abs(forward.data[i] - reverse.data[i]) +
        Math.abs(forward.data[i + 1] - reverse.data[i + 1]) +
        Math.abs(forward.data[i + 2] - reverse.data[i + 2]) > 30) changed++;
    }
    assert.ok(changed < forward.width * forward.height * 0.002,
      `terrain appearance changed with tile draw order: ${changed} pixels`);
});

Then('Matterhorn zoom keeps coarse terrain visible and aligns the marker and popup', { timeout: 30000 }, async function () {
    await this.page.evaluate(() => {
      const marker = Object.values(map._layers).find(item => item instanceof L.Marker);
      marker.getPopup().options.autoPan = false;
      marker.openPopup();
    });
    const box = await this.page.locator('#map').boundingBox();
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 60, { steps: 6 });
    await this.page.mouse.up();
    this.matterhornDetail.delayed = true;
    await this.page.locator('.leaflet-control-zoom-in').click();
    await this.page.evaluate(() => testOperations.setBearing(map, 70));
    await this.page.waitForFunction(() => {
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const requests = globals.sceneByLayer.get(layer)._nativeGPU.terrainRequests;
      return map.getZoom() === 15 && [...requests.values()].some(request => request.tile.coords.z === 15 && !request.tiles);
    }, null, { timeout: 15000 });
    assert.ok(await whiteFraction(this.page) > 0.1, 'terrain disappeared while zoom detail loaded');
    await this.page.waitForFunction(() => {
      const marker = Object.values(map._layers).find(item => item instanceof L.Marker);
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const state = globals.sceneByLayer.get(layer)._nativeGPU, z = map.getZoom();
      const point = map.project(marker.getLatLng(), z);
      return state.terrainRequests.get(`${Math.floor(point.x / 256)}:${Math.floor(point.y / 256)}:${z}`)?.tiles;
    }, null, { timeout: 30000 });
    await this.page.evaluate(() => new Promise(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const alignment = await this.page.evaluate(() => {
      const marker = Object.values(map._layers).find(item => item instanceof L.Marker);
      const state = globals.sceneByLayer.get(marker)._nativeGPU, backend = state.backend;
      const root = testWeakmaps.rootByLayer.get(backend), origin = testWeakmaps.locationByLayer.get(backend);
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const grid = globals.sceneByLayer.get(layer)._nativeGPU, z = map.getZoom();
      const pixel = map.project(marker.getLatLng(), z), x = Math.floor(pixel.x), y = Math.floor(pixel.y);
      const tx = Math.floor(x / 256), ty = Math.floor(y / 256);
      const tile = grid.terrainRequests.get(`${tx}:${ty}:${z}`).tiles.get(`${tx}/${ty}`);
      const elevation = tile[(y % 256) * 256 + x % 256];
      const from = map.options.crs.project(origin), to = map.options.crs.project(marker.getLatLng());
      const metres = Math.cos(origin.lat * Math.PI / 180);
      const point = new DOMPoint((to.x - from.x) * metres, (elevation - root.position[1]) / root.scale[1],
        -(to.y - from.y) * metres, 1)
        .matrixTransform(new DOMMatrix(root.worldMatrix))
        .matrixTransform(new DOMMatrix(globals.sceneByLayer.get(backend).camera.projectionViewMatrix));
      const expected = new L.Point((point.x / point.w + 1) * map.getSize().x / 2,
        (1 - point.y / point.w) * map.getSize().y / 2);
      const actual = L.DomUtil.getPosition(marker._icon).add(map._getMapPanePos());
      const popup = marker.getPopup(), popupRect = popup.getElement().getBoundingClientRect();
      const mapRect = map.getContainer().getBoundingClientRect();
      return { marker: expected.distanceTo(actual), popup: Math.abs(popupRect.bottom +
        parseFloat(getComputedStyle(popup.getElement()).marginBottom) - mapRect.top -
        popup.options.offset[1] - popup._getAnchor().y - expected.y),
        zoom: z, bearing: testOperations.getBearing(map) };
    });
    assert.equal(alignment.zoom, 15);
    assert.equal(alignment.bearing, 70);
    assert.ok(alignment.marker < 3, `marker drift after navigation: ${alignment.marker}px`);
    assert.ok(alignment.popup < 3, `popup drift after navigation: ${alignment.popup}px`);
    assert.ok(await whiteFraction(this.page) > 0.1, 'terrain disappeared after zoom');
});

Then('Matterhorn streams a new region and releases and restores its elevation layer', { timeout: 30000 }, async function () {
    const initialKeys = await this.page.evaluate(() => [...testWeakmaps.streamTerrainByMap.get(map).terrainCache.keys()]);
    await this.page.evaluate(() => map.setView([46.5, 8.5], 14, { animate: false }));
    await this.page.waitForFunction(initialKeys => {
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const state = globals.sceneByLayer.get(layer)._nativeGPU;
      return [...state.meshes.values()].some(mesh => mesh._terrainRequest &&
        !initialKeys.includes(`14/${mesh._terrainRequest.tile.coords.x}/${mesh._terrainRequest.tile.coords.y}`));
    }, initialKeys, { timeout: 30000 });
    assert.ok(this.matterhornRequests.some(url => /\/13\/\d+\/\d+\.webp$/.test(url)));
    await this.page.evaluate(() => {
      window.elevationLayer = Object.values(map._layers).find(item => typeof item.options?.getTile === 'function');
      elevationLayer.remove();
    });
    await this.page.waitForFunction(() => {
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const meshes = globals.sceneByLayer.get(layer)._nativeGPU.meshes;
      return meshes.size > 0 && [...meshes.values()].every(mesh => !mesh._terrainRequest && !mesh.program.depthWrite);
    }, null, { timeout: 30000 });
    await this.page.evaluate(() => elevationLayer.addTo(map));
    await this.page.waitForFunction(() => {
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      return [...globals.sceneByLayer.get(layer)._nativeGPU.meshes.values()].some(mesh => mesh._terrainRequest);
    }, null, { timeout: 30000 });
  });
