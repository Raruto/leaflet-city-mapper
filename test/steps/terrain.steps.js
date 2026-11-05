import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';

Then('new ground tiles blend continuously while retained tiles stay opaque', { timeout: 30000 }, async function () {
  const result = await this.page.evaluate(async () => {
    const map = test3d.map;
    map.setPitch(0); map.setBearing(0);
    const zoom = map.getZoom(), cell = map.project(map.getCenter()).divideBy(256).floor();
    map.setView(map.unproject(cell.add([0.5, 0.5]).multiplyBy(256)), zoom, { animate: false });
    const nw = map.unproject(cell.multiplyBy(256)), se = map.unproject(cell.add([1, 1]).multiplyBy(256));
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#206040'; context.fillRect(0, 0, 256, 256);
    const image = await (await fetch(canvas.toDataURL())).arrayBuffer();
    const raster = new L.Layer({ source: { type: 'pmtiles', url: 'smooth-ground.pmtiles', archive: {
      getHeader: async () => ({ minZoom: zoom, maxZoom: zoom, minLon: nw.lng, maxLat: nw.lat,
        maxLon: se.lng - 1e-7, minLat: se.lat + 1e-7 }),
      getZxy: async () => ({ data: image }),
    } } }).addTo(map);
    await raster.ready;
    const key = `${zoom}/${cell.x}/${cell.y}`;
    while (!raster._rasterTiles.get(key)?.done) await new Promise(requestAnimationFrame);
    const tile = raster._rasterTiles.get(key), mesh = tile.mesh;
    const point = map.latLngToContainerPoint(map.unproject(cell.add([0.5, 0.5]).multiplyBy(256)));
    await nativeChecks.pixels(raster, Math.floor(point.x), Math.floor(point.y), 1, 1);
    mesh.fadeStart = performance.now() - 125;
    const middle = await nativeChecks.pixels(raster, Math.floor(point.x - 5), Math.floor(point.y - 5), 10, 10);
    const alphas = middle.filter((_, i) => i % 4 === 3);
    mesh.fadeStart = performance.now() - 300;
    nativeChecks.render.render(raster._shared);
    const start = mesh.fadeStart;
    const opaque = [...await nativeChecks.pixels(raster, Math.floor(point.x), Math.floor(point.y), 1, 1)];
    const neighbor = map.unproject(cell.add([2, 1]).multiplyBy(256));
    raster.header.maxLon = neighbor.lng - 1e-7;
    const { updateRasterTiles } = await import('/src/raster/updateRasterTiles.js');
    updateRasterTiles(raster);
    while (raster.isLoading()) await new Promise(requestAnimationFrame);
    nativeChecks.render.render(raster._shared);
    const retained = raster._rasterTiles.get(key) === tile && mesh.fadeStart === start && mesh._appearance === 1;
    const after = [...await nativeChecks.pixels(raster, Math.floor(point.x), Math.floor(point.y), 1, 1)];
    const loadedNeighbor = raster._rasterTiles.get(`${zoom}/${cell.x + 1}/${cell.y}`)?.done;
    raster.remove();
    return { minimum: Math.min(...alphas), maximum: Math.max(...alphas), retained, loadedNeighbor, opaque, after };
  });
  assert.ok(result.minimum > 60 && result.maximum < 210, JSON.stringify(result));
  assert.ok(result.maximum - result.minimum < 5, JSON.stringify(result));
  assert.equal(result.retained, true);
  assert.equal(result.loadedNeighbor, true);
  assert.equal(result.opaque[3], 255);
  assert.deepEqual(result.after, result.opaque);
});

Then('buildings wait only for their own roof imagery and never restart their appearance', { timeout: 30000 }, async function () {
  const result = await this.page.evaluate(async () => {
    const map = test3d.map, zoom = map.getZoom(), cell = map.project(map.getCenter()).divideBy(256).floor();
    map.setPitch(0); map.setBearing(0);
    map.setView(map.unproject(cell.add([0.5, 0.5]).multiplyBy(256)), zoom, { animate: false });
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ff0000'; context.fillRect(0, 0, 256, 256);
    const image = await (await fetch(canvas.toDataURL())).arrayBuffer();
    const releases = new Map(), started = new Set();
    const nw = map.unproject(cell.subtract([1, 1]).multiplyBy(256));
    const se = map.unproject(cell.add([2, 2]).multiplyBy(256));
    const raster = new L.Layer({ source: { type: 'pmtiles', url: 'delayed-roofs.pmtiles', archive: {
      getHeader: async () => ({ minZoom: zoom, maxZoom: zoom, minLon: nw.lng, maxLat: nw.lat,
        maxLon: se.lng - 1e-7, minLat: se.lat + 1e-7 }),
      getZxy: async (z, x, y) => {
        started.add(`${x}/${y}`);
        await new Promise(resolve => releases.set(`${x}/${y}`, resolve));
        return { data: image };
      },
    } } }).addTo(map);
    await raster.ready;
    const ring = [[-30,-30],[30,-30],[30,30],[-30,30],[-30,-30]].map(offset => {
      const p = map.unproject(cell.add([0.5,0.5]).multiplyBy(256).add(offset)); return [p.lng,p.lat];
    });
    const building = new L.Layer({ source: { type:'geojson', roofTexture:true, style:()=>({top:20,color:0x00ff00}),
      data:{type:'FeatureCollection',features:[{type:'Feature',geometry:{type:'Polygon',coordinates:[ring]}}]},
    } }).addTo(map);
    await nativeChecks.ready(building);
    while (![...building._areas.values()].some(area=>area.mesh)) await new Promise(requestAnimationFrame);
    const mesh = [...building._areas.values()][0].mesh;
    nativeChecks.render.render(building._shared);
    const hidden = mesh._appearance === 0 && mesh.fadeStart === undefined;
    const rect = map.getContainer().getBoundingClientRect();
    const pointer = { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
    const hiddenHits = nativeChecks.picking.raycast(building, pointer).length;
    const key = `${cell.x}/${cell.y}`;
    while (!releases.has(key)) await new Promise(requestAnimationFrame);
    releases.get(key)(); releases.delete(key);
    while (!raster._rasterTiles.get(`${zoom}/${key}`)?.done) await new Promise(requestAnimationFrame);
    building._shared._roofRaster.updatedAt = 0;
    nativeChecks.render.render(building._shared);
    const simultaneous = mesh._roofRevealed && mesh.fadeStart !== undefined && raster.isLoading();
    mesh.fadeStart = performance.now() - 300;
    const pixel = [...await nativeChecks.pixels(building, 200, 150, 1, 1)];
    const visibleHits = nativeChecks.picking.raycast(building, pointer).length;
    const fadeStart = mesh.fadeStart;
    let remaining = started.size;
    for (const resolve of releases.values()) resolve();
    releases.clear();
    await new Promise(requestAnimationFrame);
    nativeChecks.render.render(building._shared);
    const retained = mesh.fadeStart === fadeStart && mesh._appearance === 1;
    raster.remove(); building.remove();
    for (const resolve of releases.values()) resolve();
    return {hidden, hiddenHits, visibleHits, simultaneous, pixel, retained, remaining};
  });
  assert.equal(result.hidden, true, JSON.stringify(result));
  assert.equal(result.hiddenHits, 0);
  assert.equal(result.visibleHits, 1);
  assert.equal(result.simultaneous, true, JSON.stringify(result));
  assert.ok(result.pixel[0] > 100 && result.pixel[1] < 5 && result.pixel[3] === 255, JSON.stringify(result));
  assert.equal(result.retained, true);
});

Then('coarse ground imagery precedes detail and survives delayed replacements', { timeout: 30000 }, async function () {
  const result = await this.page.evaluate(async () => {
    const map = test3d.map, zoom = map.getZoom();
    map.setPitch(80);
    const center = map.project(map.getCenter(), zoom).divideBy(256).floor();
    const nw = map.unproject(center.subtract([1, 1]).multiplyBy(256), zoom);
    const se = map.unproject(center.add([2, 2]).multiplyBy(256), zoom);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#426842'; context.fillRect(0, 0, 256, 256);
    const image = await (await fetch(canvas.toDataURL())).arrayBuffer();
    let release, active = 0, maximum = 0, fail = false;
    const pending = new Promise(resolve => { release = resolve; }), requests = [];
    const raster = new L.Layer({ source: { type: 'pmtiles', url: 'progressive.pmtiles', archive: {
      getHeader: async () => ({ minZoom: zoom - 2, maxZoom: zoom, minLon: nw.lng, maxLat: nw.lat,
        maxLon: se.lng - 1e-7, minLat: se.lat + 1e-7 }),
      getZxy: async (z, x, y) => {
        requests.push(z);
        if (fail && z === zoom && x === center.x && y === center.y) throw new Error('Expected detail failure');
        active++; maximum = Math.max(maximum, active);
        if (z === zoom) await pending;
        active--;
        return { data: image };
      },
    } } }).addTo(map);
    const errors = [];
    raster.on('error', event => errors.push(event.error.message));
    const wait = async condition => {
      const deadline = performance.now() + 10000;
      while (!condition()) {
        if (performance.now() > deadline) throw new Error('Progressive raster fixture did not settle');
        await new Promise(requestAnimationFrame);
      }
    };
    try {
      await raster.ready;
      await wait(() => {
        const parents = [...raster._rasterTiles.values()].filter(tile => tile.coords.z < zoom);
        return parents.length && parents.every(tile => tile.done);
      });
      const parents = [...raster._rasterTiles.values()].filter(tile => tile.coords.z < zoom);
      for (const tile of parents) tile.mesh.fadeStart = performance.now() - 300;
      const pixels = await nativeChecks.pixels(raster, 190, 140, 20, 20);
      const coverage = pixels.filter((_, index) => index % 4 === 3 && pixels[index] === 255).length;
      const retained = parents.every(tile => raster._rasterTiles.has(`${tile.coords.z}/${tile.coords.x}/${tile.coords.y}`));
      release();
      await wait(() => !raster.isLoading() && [...raster._wantedRasterTiles].every(key => raster._rasterTiles.get(key)?.done));
      for (const tile of raster._rasterTiles.values()) {
        tile.loadedAt = tile.mesh.fadeStart = performance.now() - 300;
      }
      raster._pruneAfter = 0;
      nativeChecks.render.render(raster._shared);
      const replaced = [...raster._rasterTiles.values()].every(tile => tile.coords.z === zoom);
      raster.remove();
      fail = true;
      raster.addTo(map);
      await wait(() => errors.length && !raster.isLoading());
      for (const tile of raster._rasterTiles.values()) {
        if (tile.done) tile.loadedAt = tile.mesh.fadeStart = performance.now() - 300;
      }
      raster._pruneAfter = 0;
      nativeChecks.render.render(raster._shared);
      const preservedOnError = [...raster._rasterTiles.values()].some(tile => tile.done && tile.coords.z < zoom);
      return { coarseFirst: requests[0] === zoom - 2, bounded: maximum <= 4, coverage, retained, replaced,
        preservedOnError, errors };
    } finally { release(); raster.remove(); }
  });
  assert.deepEqual(result, { coarseFirst: true, bounded: true, coverage: 400, retained: true, replaced: true,
    preservedOnError: true, errors: ['Expected detail failure'] });
});

Then('fading terrain detail covers retained ground without depth interference', { timeout: 30000 }, async function () {
  const result = await this.page.evaluate(async () => {
    const map = test3d.map, zoom = map.getZoom();
    map.setPitch(45); map.setBearing(30);
    const cell = map.project(map.getCenter(), zoom).divideBy(256).floor();
    map.setView(map.unproject(cell.add([0.5, 0.5]).multiplyBy(256), zoom), zoom, { animate: false });
    const nw = map.unproject(cell.subtract([1, 1]).multiplyBy(256), zoom);
    const se = map.unproject(cell.add([2, 2]).multiplyBy(256), zoom);
    const header = { minZoom: zoom - 2, maxZoom: zoom, minLon: nw.lng, maxLat: nw.lat,
      maxLon: se.lng - 1e-7, minLat: se.lat + 1e-7 };
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d');
    const images = await Promise.all(['#ff0000', '#0000ff'].map(async color => {
      context.fillStyle = color; context.fillRect(0, 0, 256, 256);
      return (await fetch(canvas.toDataURL())).arrayBuffer();
    }));
    let release;
    const pending = new Promise(resolve => { release = resolve; });
    const initialize = L.Layer.prototype.initialize;
    L.Layer.prototype.initialize = function (settings = {}) {
      let options = settings.source;
      if (!options) return initialize.call(this, settings);
      if (options.type === 'pmtiles' && options.url === 'overlap-terrain.pmtiles') options = { ...options, archive: {
        getHeader: async () => ({ ...header, minZoom: zoom - 2, maxZoom: zoom - 2, tileType: 0 }),
        getZxy: async (z, x, y) => {
          const values = new Float32Array(256 * 256);
          for (let row = 0; row < 256; row++) {
            for (let col = 0; col < 256; col++) {
              values[row * 256 + col] = 40 + 2 * Math.sin((x * 256 + col) * 0.3) *
                Math.cos((y * 256 + row) * 0.3);
            }
          }
          return { data: values.buffer };
        },
      } };
      return initialize.call(this, { ...settings, source: options });
    };
    const terrain = new L.Layer({ source: { type: 'terrain', url: 'overlap-terrain.pmtiles' } }).addTo(map);
    const raster = new L.Layer({ source: { type: 'pmtiles', url: 'overlap-imagery.pmtiles', archive: {
      getHeader: async () => header,
      getZxy: async z => {
        if (z === zoom) await pending;
        return { data: images[z === zoom ? 1 : 0] };
      },
    } } }).addTo(map);
    raster.on('tileload', ({ tile }) => {
      if (tile.coords.z === zoom) tile.loadedAt = performance.now() + 60000;
    });
    const wait = async condition => {
      const deadline = performance.now() + 10000;
      while (!condition()) {
        if (performance.now() > deadline) throw new Error('Overlapping terrain fixture did not settle');
        await new Promise(requestAnimationFrame);
      }
    };
    try {
      await Promise.all([raster.ready, terrain.ready]);
      await terrain._terrainPromise;
      await wait(() => terrain._rasterTiles.size > 0 && [...raster._rasterTiles.values()]
        .filter(tile => tile.coords.z < zoom).every(tile => tile.done));
      for (const [tile, mesh] of terrain._rasterTiles) tile.loadedAt = mesh.fadeStart = performance.now() - 300;
      release();
      await wait(() => !raster.isLoading() && terrain._rasterTiles.size === raster._rasterTiles.size);
      const object = nativeChecks.gpu.createMesh(terrain, {
        position: [-500, -10, -500, 500, -10, -500, 500, -10, 500,
          -500, -10, -500, 500, -10, 500, -500, -10, 500],
        normal: Array.from({ length: 6 }, () => [0, 1, 0]).flat(),
        color: Array.from({ length: 6 }, () => [0, 1, 0]).flat(),
      }, { unlit: true });
      const failures = [];
      map.options.zoomSnap = 0;
      for (const [pitch, bearing, pan, delta] of [[45, 30, 0, 0], [60, 75, 12, 0.25], [0, 0, -24, 0.4]]) {
        map.setPitch(pitch); map.setBearing(bearing);
        map.setZoom(zoom + delta, { animate: false });
        map.panBy([pan, 0], { animate: false });
        for (const [tile, mesh] of terrain._rasterTiles) {
          // Keep the coarse tiles until their replacements finish fading.
          tile.loadedAt = performance.now() + 60000;
          mesh.fadeStart = performance.now() - (tile.coords.z === zoom ? 125 : 300);
        }
        raster._pruneAfter = 0;
        const pixels = await nativeChecks.pixels(raster, 180, 130, 40, 40);
        const bad = pixels.filter((value, i) => i % 4 === 3 &&
          (value !== 255 || pixels[i - 1] < 60 || pixels[i - 2] !== 0 || pixels[i - 3] < 60)).length;
        failures.push({ bad, sample: [...pixels.slice(0, 4)], coarse: [...terrain._rasterTiles.keys()]
          .filter(tile => tile.coords.z < zoom).length });
      }
      object.position[1] = 20;
      const above = [...await nativeChecks.pixels(raster, 200, 150, 1, 1)];
      nativeChecks.gpu.disposeMesh(terrain, object);
      for (const tile of raster._rasterTiles.values()) tile.loadedAt = performance.now() - 300;
      raster._pruneAfter = 0;
      const { pruneRasterTiles } = await import('/src/raster/pruneRasterTiles.js');
      pruneRasterTiles(raster);
      nativeChecks.render.render(raster._shared);
      const steadyDepth = !raster.renderer.groundOverlap &&
        terrain._rasterProgram.pipelineCache.has('back:ccw:less-equal');
      return { failures, above, steadyDepth };
    } finally {
      release(); raster.remove(); terrain.remove();
      L.Layer.prototype.initialize = initialize;
    }
  });
  assert.ok(result.failures.every(frame => frame.bad === 0 && frame.coarse > 0), JSON.stringify(result));
  assert.deepEqual(result.above, [0, 255, 0, 255]);
  assert.equal(result.steadyDepth, true);
});

Then('streamed geometry dissolves progressively while remaining opaque', { timeout: 30000 }, async function () {
  await this.page.emulateMedia({ reducedMotion: 'reduce' });
  await this.page.waitForFunction(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const result = await this.page.evaluate(async () => {
    const map = test3d.map;
    map.setPitch(0); map.setBearing(0);
    const layer = new L.Layer({ source: { type: 'geojson', data: {
      type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Polygon', coordinates: [[
        [-60, -60], [60, -60], [60, 60], [-60, 60], [-60, -60],
      ].map(offset => { const p = map.containerPointToLatLng(map.getSize().divideBy(2).add(offset)); return [p.lng, p.lat]; })] } }],
    }, style: () => ({ top: 10 }) } }).addTo(map);
    await nativeChecks.ready(layer);
    while (![...layer._areas.values()].some(area => area.mesh)) await new Promise(requestAnimationFrame);
    const mesh = [...layer._areas.values()][0].mesh;
    const count = async elapsed => {
      mesh.fadeStart = performance.now() - elapsed;
      const pixels = await nativeChecks.pixels(layer, 180, 130, 40, 40);
      return pixels.filter((_, index) => index % 4 === 3 && pixels[index] === 255).length;
    };
    const early = await count(0), middle = await count(125), full = await count(300);
    layer.remove();
    return { early, middle, full, opaque: !mesh.program.transparent && mesh.program.depthWrite };
  });
  assert.ok(result.early < 200, JSON.stringify(result));
  assert.ok(result.middle > 400 && result.middle < 1400, JSON.stringify(result));
  assert.equal(result.full, 1600);
  assert.equal(result.opaque, true);
});

Then('roof imagery follows raster loading, background changes and renderer ownership', { timeout: 30000 }, async function () {
  const result = await this.page.evaluate(async () => {
    const map = test3d.map, zoom = 17;
    const boundary = map.project(map.getCenter(), zoom).divideBy(256).floor().multiplyBy(256);
    map.setView(map.unproject(boundary, zoom), zoom, { animate: false });
    map.setPitch(0); map.setBearing(0);
    const owner = new L.Layer({ source: { type: '3d' } }).addTo(map);
    const layer = new L.Layer({ source: { type: '3d', roofTexture: true } }).addTo(map);
    await Promise.all([nativeChecks.ready(owner), nativeChecks.ready(layer)]);
    const ring = [[-60, -60], [60, -60], [60, 60], [-60, 60], [-60, -60]]
      .map(offset => map.unproject(boundary.add(offset), zoom)).map(p => [p.lng, p.lat]);
    const area = { coords: { z: zoom, x: boundary.x / 256 - 1, y: boundary.y / 256 - 1 }, request: new AbortController() };
    layer.options.style = () => ({ top: 20, color: 0x00ff00 });
    await nativeChecks.loadBlock(layer, area, [{ type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] } }]);
    const mesh = area.mesh;
    nativeChecks.render.render(layer._shared);
    mesh.fadeStart = performance.now() - 300;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d');
    const image = async color => {
      context.fillStyle = color; context.fillRect(0, 0, 256, 256);
      return (await fetch(canvas.toDataURL())).arrayBuffer();
    };
    const red = await image('#ff0000'), blue = await image('#0000ff');
    let release;
    const pending = new Promise(resolve => { release = resolve; });
    const archive = swapped => ({
      getHeader: async () => ({ minZoom: zoom, maxZoom: zoom }),
      getZxy: async (z, x) => {
        await pending;
        return { data: (x % 2 === 0) !== swapped ? red : blue };
      },
    });
    const first = new L.Layer({ source: { type: 'pmtiles', url: 'roof-first.pmtiles', archive: archive(false) } });
    const second = new L.Layer({ source: { type: 'pmtiles', url: 'roof-second.pmtiles', archive: archive(true) } });
    const sample = async (offset, height) => {
      nativeChecks.render.render(layer._shared);
      const crs = map.options.crs;
      const origin = crs.project(layer.location);
      const point = crs.project(map.unproject(boundary.add(offset), zoom));
      const metres = Math.cos(layer.location.lat * Math.PI / 180);
      const projected = new DOMPoint((point.x - origin.x) * metres, height, -(point.y - origin.y) * metres, 1)
        .matrixTransform(new DOMMatrix(layer.root.worldMatrix))
        .matrixTransform(new DOMMatrix(layer.camera.projectionViewMatrix));
      const { canvas } = layer.renderer;
      return [...await nativeChecks.pixels(layer,
        Math.floor((projected.x / projected.w + 1) * canvas.width / 2),
        Math.floor((projected.y / projected.w + 1) * canvas.height / 2), 1, 1)];
    };
    const roof = async () => [await sample([-30, 0], 20), await sample([30, 0], 20)];
    const loaded = async raster => {
      await raster.ready;
      const deadline = performance.now() + 5000;
      while (!raster._rasterTiles.size || [...raster._rasterTiles.values()].some(tile => !tile.done)) {
        if (performance.now() > deadline) throw new Error(`Roof imagery did not load: ${JSON.stringify({
          tiles: [...raster._rasterTiles.values()].map(({ coords, error, done }) => ({ coords, error, done })),
          renderer: Boolean(raster.renderer), shared: Boolean(raster._shared), hasLayer: map.hasLayer(raster),
          attachedMap: raster._map === map, header: raster.header, zoom: raster._tileZoom,
        })}`);
        await new Promise(requestAnimationFrame);
      }
    };
    try {
      first.addTo(map);
      const before = await roof();
      release();
      await loaded(first);
      const directCanvas = !(first instanceof L.GridLayer) && first.renderer.canvas === owner.renderer.canvas &&
        first.root.children.some(mesh => mesh.tile) && !first._container;
      const textured = await roof();
      const texture = layer._shared._roofRaster.texture.texture;
      const signature = layer._shared._roofRaster.signature;
      await roof();
      const reused = signature === layer._shared._roofRaster.signature && texture === layer._shared._roofRaster.texture.texture;
      const boundaryX = boundary.x / 256;
      const westRed = (boundaryX - 1) % 2 === 0;
      map.setPitch(55); map.setBearing(35);
      const rotated = await roof();
      const wall = await sample([0, 60], 10);
      nativeChecks.picking.setHighlight(layer, { mesh, ...mesh.extras.featureFaces[0] });
      const highlighted = await roof();
      nativeChecks.picking.setHighlight(layer, null);
      map.setPitch(0); map.setBearing(0);
      first.remove();
      const empty = await roof();
      second.addTo(map);
      await loaded(second);
      const switched = await roof();
      first.addTo(map);
      await loaded(first);
      first.setZIndex(2);
      const stacked = await roof();
      second.setZIndex(3);
      const reordered = await roof();
      first.remove();
      map.setZoom(18, { animate: false });
      await loaded(second);
      const zoomed = await roof();
      map.panBy([20, 10], { animate: false });
      await loaded(second);
      const panned = await roof();
      const transferTexture = layer._shared._roofRaster.texture.texture;
      owner.remove();
      const transferred = await roof();
      const sameTexture = layer._shared === layer && layer._roofRaster.texture.texture === transferTexture;
      second.setOpacity(0);
      const transparent = await roof();
      second.setOpacity(1);
      const restored = await roof();
      return { before, textured, westRed, rotated, wall, highlighted, empty, switched, stacked, reordered, zoomed, panned, transferred,
        transparent, restored, reused, sameTexture, directCanvas };
    } finally {
      release(); first.remove(); second.remove();
      nativeChecks.sources.releaseArea(layer, area); layer.remove(); owner.remove();
    }
  });
  const green = pixel => pixel[1] > 100 && pixel[0] < 5 && pixel[2] < 5 && pixel[3] === 255;
  assert.ok(result.before.every(pixel => pixel[1] > 100 && pixel[0] < 5 && pixel[3] === 255),
    'Previously revealed buildings retain their styled roofs while a background loads');
  for (const name of ['empty', 'transparent']) assert.ok(result[name].every(green), `${name}: ${result[name]}`);
  const imagery = (pixels, swapped) => pixels.forEach((pixel, i) => {
    const red = (i === 0 ? result.westRed : !result.westRed) !== swapped;
    assert.ok(pixel[red ? 0 : 2] > 100 && pixel[red ? 2 : 0] < 5 && pixel[1] < 5, JSON.stringify({ pixel, red }));
  });
  imagery(result.textured, false); imagery(result.rotated, false);
  imagery(result.stacked, false);
  for (const name of ['switched', 'reordered', 'zoomed', 'panned', 'transferred', 'restored']) imagery(result[name], true);
  assert.ok(green(result.wall), `Walls retain their style: ${result.wall}`);
  assert.ok(result.highlighted.every(pixel => pixel[1] > pixel[0] && pixel[2] > pixel[0]), 'Highlight overrides imagery');
  assert.equal(result.reused, true);
  assert.equal(result.sameTexture, true);
  assert.equal(result.directCanvas, true);
});

Then('terrain enabled {string} raster loading preserves imagery, elevations and removal', { timeout: 30000 }, async function (order) {
  const result = await this.page.evaluate(async order => {
    const map = test3d.map;
    const zoom = 14, center = map.project(map.getCenter(), zoom);
    const coords = center.divideBy(256).floor();
    const nw = map.unproject(coords.subtract([1, 1]).multiplyBy(256), zoom);
    const se = map.unproject(coords.add([2, 2]).multiplyBy(256), zoom);
    const header = {
      minZoom: zoom, maxZoom: zoom, tileType: 0,
      minLon: nw.lng, maxLat: nw.lat, maxLon: se.lng - 1e-7, minLat: se.lat + 1e-7,
    };
    const height = point => 40 + (point.x - center.x) * 0.04 + (point.y - center.y) * 0.02;
    const corners = [[-10, -10], [10, -10], [10, 10], [-10, 10], [-10, -10]]
      .map(offset => map.unproject(center.add(offset), zoom)).map(p => [p.lng, p.lat]);
    const feature = { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [corners] } };
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#0000ff'; ctx.fillRect(0, 128, 256, 128);
    const image = await (await fetch(canvas.toDataURL())).arrayBuffer();
    const initialize = L.Layer.prototype.initialize;
    let release;
    let pending = new Promise(resolve => { release = resolve; });
    L.Layer.prototype.initialize = function (settings = {}) {
      let options = settings.source;
      if (!options) return initialize.call(this, settings);
      if (options.type === 'pmtiles' && options.url.endsWith('fixture-terrain.pmtiles')) options = { ...options, archive: {
        getHeader: async () => header,
        getZxy: async (z, x, y, signal) => {
          await pending;
          signal.throwIfAborted();
          const values = new Float32Array(256 * 256);
          for (let row = 0; row < 256; row++) {
            for (let column = 0; column < 256; column++) {
              values[row * 256 + column] = height(new L.Point(x * 256 + column + 0.5, y * 256 + row + 0.5));
            }
          }
          return { data: values.buffer };
        },
      } };
      return initialize.call(this, { ...settings, source: options });
    };
    const wait = async condition => {
      const deadline = performance.now() + 12000;
      while (!condition()) {
        if (performance.now() > deadline) throw new Error(`Terrain fixture did not settle: ${JSON.stringify({
          meshes: terrain._rasterTiles.size, tiles: raster._rasterTiles.size,
          loaded: [...raster._rasterTiles.values()].filter(tile => tile.done).length,
          inflight: buildings._inflight, errors,
        })}`);
        await new Promise(requestAnimationFrame);
      }
    };
    const terrain = new L.Layer({ source: { type: 'terrain', url: 'fixture-terrain.pmtiles' } });
    const raster = new L.Layer({ source: { type: 'pmtiles', url: 'fixture-raster.pmtiles',
      archive: { getHeader: async () => ({ ...header, tileType: 2 }), getZxy: async () => ({ data: image }) } } });
    const buildings = new L.Layer({ source: { type: '3d', url: 'fixture-buildings.pmtiles', roofTexture: true,
      style: () => ({ top: 15 }), archive: {
        getHeader: async () => header,
        getZxy: async () => ({ data: new TextEncoder().encode(JSON.stringify({
          type: 'FeatureCollection', features: [feature],
        })) }),
      } } }).addTo(map);
    const modelLocation = map.unproject(center.add([20, 20]), zoom);
    const model = new L.Layer({ source: { type: '3d', center: [modelLocation.lat, modelLocation.lng] } }).addTo(map);
    const errors = [];
    terrain.on('error', ({ error }) => errors.push(error.message));
    raster.on('tileerror', ({ error }) => errors.push(error.message));
    buildings.on('error', ({ error }) => errors.push(error.message));
    try {
      await Promise.all([nativeChecks.ready(buildings), nativeChecks.ready(model)]);
      if (order === 'before') terrain.addTo(map);
      raster.addTo(map);
      await raster.ready;
      await wait(() => raster._rasterTiles.size > 0 && [...raster._rasterTiles.values()].every(tile => tile.done));
      if (order === 'after') terrain.addTo(map);
      const initiallyFlat = [...raster._rasterTiles.values()].every(tile =>
        tile.image && tile.mesh.parent === raster.root && tile.mesh.visible);
      terrain._terrainTiles.set(`${coords.x}/${coords.y}`, new Float32Array(256 * 256).fill(250));
      nativeChecks.render.render(buildings._shared);
      const partialElevation = nativeChecks.getElevation(terrain, map.getCenter());
      const partialCameraY = buildings.camera.target[1];
      terrain._terrainTiles.delete(`${coords.x}/${coords.y}`);
      release();
      await terrain._terrainPromise;
      const settled = () => terrain._rasterTiles.size === raster._rasterTiles.size &&
        buildings._inflight === 0 && [...buildings._areas.values()].every(area => area.done);
      await wait(settled);
      let elevationError = 0, deformation = 0, buildingError = 0, uvError = 0;
      for (const [tile, mesh] of terrain._rasterTiles) {
        if (mesh.texture !== tile.texture || mesh.fadeStart !== tile.loadedAt || tile.mesh.visible) {
          throw new Error('DEM adaptation must reuse the imagery texture and appearance without a duplicate flat tile');
        }
        const tileCoords = tile.coords;
        const positions = mesh.geometry.attributes.position.data;
        const uv = mesh.geometry.attributes.uv.data;
        const heights = await nativeChecks.terrainHeights(terrain,
          Array.from({ length: mesh.geometry.attributes.position.count }, (_, i) =>
            ({ mesh, u: uv[i * 2], v: uv[i * 2 + 1] })));
        for (let row = 0; row <= 64; row++) {
          for (let column = 0; column <= 64; column++) {
            const i = row * 65 + column;
            const expected = height(new L.Point((tileCoords.x + column / 64) * 256, (tileCoords.y + row / 64) * 256));
            elevationError = Math.max(elevationError, Math.abs(heights[i] + terrain.root.position[1] - expected));
            uvError = Math.max(uvError, Math.abs(uv[i * 2 + 1] - row / 64));
            if (positions[i * 3 + 1] !== 0) throw new Error('Terrain unit grids must stay flat on the CPU');
          }
        }
        deformation = Math.max(deformation, Math.abs(heights[0] - heights.at(-1)));
      }
      for (const area of buildings._areas.values()) {
        if (!area.mesh) continue;
        const positions = area.mesh.geometry.attributes.position.data;
        const crsOrigin = map.options.crs.project(buildings.location);
        const metres = Math.cos(buildings.location.lat * Math.PI / 180);
        for (let i = 0; i < positions.length; i += 3) {
          const latlng = map.options.crs.unproject(new L.Point(
            crsOrigin.x + positions[i] / metres, crsOrigin.y - positions[i + 2] / metres));
          const ground = height(map.project(latlng, zoom));
          const aboveGround = positions[i + 1] + buildings.root.position[1] - ground;
          buildingError = Math.max(buildingError, Math.min(Math.abs(aboveGround), Math.abs(aboveGround - 15)));
        }
      }
      const modelError = Math.abs(model.root.position[1] - height(map.project(model.location, zoom)));
      map.setPitch(0); map.setBearing(0);
      nativeChecks.render.render(buildings._shared);
      const roofMesh = [...buildings._areas.values()].find(area => area.mesh).mesh;
      const roofPositions = roofMesh.geometry.attributes.position.data;
      const roofCenter = [0, 1, 2].map(axis =>
        (roofPositions[axis] + roofPositions[3 + axis] + roofPositions[6 + axis]) / 3);
      const roofWorld = new DOMPoint(...roofCenter, 1).matrixTransform(new DOMMatrix(roofMesh.worldMatrix));
      const roofProjected = roofWorld.matrixTransform(new DOMMatrix(buildings.camera.projectionViewMatrix));
      const { canvas: output } = buildings.renderer;
      const roofPixel = await nativeChecks.pixels(buildings,
        Math.floor((roofProjected.x / roofProjected.w + 1) * output.width / 2),
        Math.floor((roofProjected.y / roofProjected.w + 1) * output.height / 2), 1, 1);
      const roofOrigin = map.project(buildings._shared._sceneOrigin, zoom);
      const pixelsPerMetre = map.options.crs.scale(zoom) /
        (40075016.68557849 * Math.cos(buildings._shared._sceneOrigin.lat * Math.PI / 180));
      const roofRow = (roofOrigin.y + roofWorld.z * pixelsPerMetre) % 256;
      const roofImagePixel = [...ctx.getImageData(128, Math.floor(roofRow), 1, 1).data];
      map.setView(map.unproject(coords.add([0.5, 0.5]).multiplyBy(256), zoom), zoom, { animate: false });
      map.setPitch(0); map.setBearing(0);
      await wait(settled);
      nativeChecks.render.render(buildings._shared);
      const tile = [...raster._rasterTiles.values()].find(t => t.coords.x === coords.x && t.coords.y === coords.y);
      const mesh = terrain._rasterTiles.get(tile);
      const pixels = [];
      const heights = await nativeChecks.terrainHeights(terrain,
        [16, 48].map(row => ({ mesh, u: 0.5, v: row / 64 })));
      for (const [sample, row] of [16, 48].entries()) {
        const i = (row * 65 + 32) * 3;
        const position = mesh.geometry.attributes.position.data;
        const projected = new DOMPoint(position[i], heights[sample], position[i + 2], 1)
          .matrixTransform(new DOMMatrix(mesh.worldMatrix))
          .matrixTransform(new DOMMatrix(buildings.camera.projectionViewMatrix));
        const pixel = await nativeChecks.pixels(buildings,
          Math.floor((projected.x / projected.w + 1) / 2 * output.width),
          Math.floor((projected.y / projected.w + 1) / 2 * output.height), 1, 1);
        pixels.push([...pixel]);
      }
      let cameraError = 0, projectionError = 0;
      for (const pitch of [0, 45, 83, 85]) {
        map.setPitch(pitch);
        map.setBearing(pitch * 2);
        map.panBy([12, 8], { animate: false });
        nativeChecks.render.render(buildings._shared);
        const camera = buildings.camera;
        const distance = Math.hypot(...camera.position.map((v, i) => v - camera.target[i]));
        cameraError = Math.max(cameraError, Math.abs(
          camera.position[1] - camera.target[1] - Math.cos(pitch * Math.PI / 180) * distance));
        const projected = new DOMPoint(...camera.target, 1).matrixTransform(new DOMMatrix(camera.projectionViewMatrix));
        projectionError = Math.max(projectionError, Math.abs(projected.x / projected.w), Math.abs(projected.y / projected.w));
      }
      await wait(settled);
      nativeChecks.render.render(buildings._shared);
      await buildings.renderer.device.queue.onSubmittedWorkDone();
      const hidden = terrain._rasterTiles.size === raster._rasterTiles.size;
      terrain.remove();
      const restored = !map._terrain3D && terrain._rasterTiles.size === 0 &&
        [...raster._rasterTiles.values()].every(tile => tile.mesh.parent === raster.root) && model.root.position[1] === 0;
      // Remove while elevation requests are pending; their callbacks must not hide restored tiles.
      pending = new Promise(resolve => { release = resolve; });
      terrain.addTo(map);
      const cancelledLoad = terrain._terrainPromise;
      terrain.remove();
      release();
      await cancelledLoad;
      await new Promise(requestAnimationFrame);
      const cancelled = terrain._rasterTiles.size === 0 &&
        [...raster._rasterTiles.values()].every(tile => tile.mesh.parent === raster.root);
      terrain.addTo(map);
      await terrain._terrainPromise;
      await wait(settled);
      return { initiallyFlat, hidden, restored, cancelled, reattached: terrain._rasterTiles.size > 0,
        elevationError, deformation, buildingError, modelError, uvError, cameraError, projectionError,
        partialElevation, partialCameraY, pixels,
        roofPixel: [...roofPixel], roofImagePixel, errors };
    } finally {
      release();
      raster.remove(); terrain.remove(); buildings.remove(); model.remove();
      L.Layer.prototype.initialize = initialize;
    }
  }, order);
  for (const name of ['initiallyFlat', 'hidden', 'restored', 'cancelled', 'reattached']) assert.equal(result[name], true, name);
  assert.equal(result.partialElevation, null, 'Do not expose elevations from partially loaded DEM tiles');
  assert.equal(result.partialCameraY, 0, 'Keep the camera aligned while DEM tiles are loading');
  assert.ok(result.deformation > 10, 'Raster vertices must have measurable elevation differences');
  assert.deepEqual(result.pixels, [[255, 0, 0, 255], [0, 0, 255, 255]], 'Rendered imagery must retain north/south orientation');
  const roofChannel = result.roofImagePixel[0] > result.roofImagePixel[2] ? 0 : 2;
  assert.ok(result.roofPixel[roofChannel] > 100 && result.roofPixel[2 - roofChannel] < 5 &&
    result.roofPixel[1] < 5, `Terrain-relative roof samples its map image: ${result.roofPixel}`);
  for (const name of ['elevationError', 'buildingError', 'modelError', 'uvError', 'cameraError', 'projectionError']) {
    assert.ok(result[name] < 0.001, `${name}: ${result[name]}`);
  }
  assert.deepEqual(result.errors, []);
});

Then('raster zoom transitions stay paused between WebGPU frames and resume on removal', async function () {
  const result = await this.page.evaluate(async () => {
    const map = test3d.map;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const tiles = new L.TileLayer(canvas.toDataURL());
    const first = new L.Layer({ source: { type: '3d' } }).addTo(map), second = new L.Layer({ source: { type: '3d' } }).addTo(map);
    await Promise.all([first, second].map(nativeChecks.ready));
    tiles.addTo(map);
    await tiles.ready;
    let samples = 0, frozen = true, transferred = false, resumed = false;
    const { device } = first.renderer;
    const submit = device.queue.submit;
    device.queue.submit = function (...args) {
      if (!map._animatingZoom || !first._zoomTransitions?.size) return submit.apply(this, args);
      const animation = first._zoomTransitions.keys().next().value;
      const time = animation.currentTime;
      const before = getComputedStyle(animation.effect.target).transform;
      const deadline = performance.now() + 40;
      while (performance.now() < deadline) { /* Simulate a slow WebGPU frame. */ }
      frozen &&= animation.currentTime === time && animation.playState === 'paused' &&
        getComputedStyle(animation.effect.target).transform === before;
      samples++;
      return submit.apply(this, args);
    };
    await new Promise(resolve => {
      map.once('zoomend', resolve);
      map.setZoomAround(map.getSize().divideBy(2), 18, { animate: true });
    });
    const cleaned = !first._zoomTransitions;
    delete device.queue.submit;
    await new Promise(resolve => setTimeout(resolve, 300));
    const moved = new Promise(resolve => map.once('zoomend', resolve));
    map.setZoomAround(map.getSize().divideBy(2), 17, { animate: true });
    const deadline = performance.now() + 2000;
    while (!first._zoomTransitions?.size) {
      if (performance.now() > deadline) throw new Error('Expected an active synchronized raster zoom transition');
      await new Promise(requestAnimationFrame);
    }
    const transitions = first._zoomTransitions;
    first.remove();
    transferred = second._zoomTransitions === transitions;
    second.remove();
    const retained = cityMapperTestState.renderers.get(map)?._zoomTransitions === transitions;
    tiles.remove();
    resumed = [...transitions.keys()].every(animation => animation.playState !== 'paused');
    await moved;
    return { samples, frozen, cleaned, transferred, retained, resumed };
  });
  assert.ok(result.samples > 0, 'Exercise actual CSS zoom transitions');
  for (const name of ['frozen', 'cleaned', 'transferred', 'retained', 'resumed']) assert.equal(result[name], true, name);
});
