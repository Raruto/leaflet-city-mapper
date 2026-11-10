import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { PNG } from 'pngjs';

function whiteFraction(buffer) {
  const image = PNG.sync.read(buffer);
  let white = 0;
  for (let i = 0; i < image.data.length; i += 4) {
    if (image.data[i] > 245 && image.data[i + 1] > 245 && image.data[i + 2] > 245) white++;
  }
  return white / (image.width * image.height);
}

Then('the Matterhorn example streams elevations for its satellite tiles while navigating',
  { timeout: 90000 }, async function () {
    const waitForTerrain = () => this.page.waitForFunction(() => {
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const state = globals.sceneByLayer.get(layer)._nativeGPU;
      return Object.keys(layer._tiles).length > 0 && Object.entries(layer._tiles).every(([key, tile]) =>
        tile.loaded && (tile._gpuOpacity ?? 1) === 1 && state.terrainRequests.get(key)?.tiles &&
        state.meshes.get(key)?._terrainRequest === state.terrainRequests.get(key)) &&
        [...state.meshes.values()].every(mesh => mesh._appearance === undefined || mesh._appearance === 1);
    }, null, { timeout: 45000 });
    const terrain = new PNG({ width: 512, height: 512 });
    for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
      terrain.data.set([128 + Math.floor(x / 256) + 2 * Math.floor(y / 256), 10, 128, 255], (y * 512 + x) * 4);
    }
    const ground = new PNG({ width: 256, height: 256 });
    ground.data.fill(255);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      if (x % 32 >= 8) continue;
      ground.data[(y * 256 + x) * 4] = Math.floor(y / 16) * 16;
      ground.data[(y * 256 + x) * 4 + 1] = Math.floor(x / 32) * 32;
    }
    const terrainImage = PNG.sync.write(terrain), groundImage = PNG.sync.write(ground), requests = [];
    let delayDetail = false;
    await this.page.route('https://tiles.mapterhorn.com/**', async route => {
      requests.push(route.request().url());
      if (route.request().url().endsWith('/0/0/0.webp')) return route.fulfill({ status: 503 });
      if (delayDetail && /\/14\/\d+\/\d+\.webp$/.test(route.request().url())) {
        await new Promise(resolve => setTimeout(resolve, 3500));
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
    }, null, { timeout: 45000 });
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
    await this.page.waitForFunction(() => {
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const state = globals.sceneByLayer.get(layer)._nativeGPU, z = map.getZoom();
      const point = map.project(map.getCenter(), z);
      return state.terrainRequests.get(`${Math.floor(point.x / 256)}:${Math.floor(point.y / 256)}:${z}`)?.tiles;
    }, null, { timeout: 45000 });
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
    await waitForTerrain();
    await this.page.evaluate(async () => {
      const owner = globals.renderers.get(map);
      await globals.sceneByLayer.get(owner).renderer.device.queue.onSubmittedWorkDone();
    });
    assert.ok(whiteFraction(await this.page.screenshot()) > 0.1, 'terrain disappeared after cache eviction');
    await this.page.evaluate(() => cityMapperTestOperations.mapSetPitchAndBearing(map, 60, 210));
    await waitForTerrain();
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
    delayDetail = true;
    await this.page.locator('.leaflet-control-zoom-in').click();
    await this.page.evaluate(() => testOperations.setBearing(map, 70));
    await this.page.waitForFunction(() => {
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const requests = globals.sceneByLayer.get(layer)._nativeGPU.terrainRequests;
      return map.getZoom() === 15 && [...requests.values()].some(request => request.tile.coords.z === 15 && !request.tiles);
    }, null, { timeout: 15000 });
    assert.ok(whiteFraction(await this.page.screenshot()) > 0.1, 'terrain disappeared while zoom detail loaded');
    await this.page.waitForFunction(() => {
      const marker = Object.values(map._layers).find(item => item instanceof L.Marker);
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const state = globals.sceneByLayer.get(layer)._nativeGPU, z = map.getZoom();
      const point = map.project(marker.getLatLng(), z);
      return state.terrainRequests.get(`${Math.floor(point.x / 256)}:${Math.floor(point.y / 256)}:${z}`)?.tiles;
    }, null, { timeout: 45000 });
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
    assert.ok(whiteFraction(await this.page.screenshot()) > 0.1, 'terrain disappeared after zoom');
    await this.page.evaluate(() => map.setView([46.5, 8.5], 14, { animate: false }));
    await this.page.waitForFunction(initialKeys => {
      const layer = Object.values(map._layers).find(item => item instanceof L.TileLayer);
      const state = globals.sceneByLayer.get(layer)._nativeGPU;
      return [...state.meshes.values()].some(mesh => mesh._terrainRequest &&
        !initialKeys.includes(`14/${mesh._terrainRequest.tile.coords.x}/${mesh._terrainRequest.tile.coords.y}`));
    }, initial.initialKeys, { timeout: 45000 });
    assert.ok(requests.some(url => /\/13\/\d+\/\d+\.webp$/.test(url)));
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
