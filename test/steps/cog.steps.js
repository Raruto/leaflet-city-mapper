import assert from 'node:assert/strict';
import { deflateSync, gzipSync } from 'node:zlib';
import { stat, readdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { Then } from '@cucumber/cucumber';
import { openCog } from '../../src/cog/openCog.js';
import { readCog } from '../../src/cog/readCog.js';
import { decodeCogTile } from '../../src/cog/decodeCogTile.js';
import { prepare3DChecks } from './3d.steps.js';

Then('the Node COG builder verifies PNG decoding, TIFF output and cloud layout offline', { timeout: 30000 }, async function () {
  const result = await promisify(execFile)(process.execPath,
    [fileURLToPath(new URL('../../build/pmtiles.js', import.meta.url)), '--self-test'], { timeout: 25000 });
  assert.match(result.stdout, /RGB\/Float32 TIFF round-trips/);
  assert.match(result.stdout, /size limit: OK/);
  assert.equal(result.stderr, '');
  assert.match(result.stdout, /Combined PMTiles directory/);
});

function elevationFixture({ predictor = 1, bigtiff = false, shift = 0, cycle = false } = {}) {
  const resolution = 40075016.68557849 / (256 * 2 ** 14), x = 8760, y = 6088;
  const heights = new Float32Array(256 * 256);
  for (let i = 0; i < heights.length; i++) heights[i] = 15 + i / 1024;
  const compressed = deflateSync(heights);
  const tags = [
    [256, 4, [256]], [257, 4, [256]], [258, 3, [32]], [259, 3, [8]], [262, 3, [1]],
    [277, 3, [1]], [284, 3, [1]], [317, 3, [predictor]], [322, 4, [256]], [323, 4, [256]],
    [324, 4, [0]], [325, 4, [compressed.length]], [339, 3, [3]],
    [33550, 12, [resolution, resolution, 0]],
    [33922, 12, [0, 0, 0, -20037508.342789244 + (x * 256 + shift) * resolution,
      20037508.342789244 - y * 256 * resolution, 0]],
    [34735, 3, [1, 1, 0, 3, 1024, 0, 1, 1, 1025, 0, 1, 1, 3072, 0, 1, 3857]],
  ];
  let end = 8 + 2 + tags.length * 12 + 4;
  for (const [, type, values] of tags) if (values.length * (type === 12 ? 8 : type === 4 ? 4 : 2) > 4) {
    end += values.length * (type === 12 ? 8 : type === 4 ? 4 : 2);
  }
  tags.find(([tag]) => tag === 324)[2][0] = end;
  const data = new Uint8Array(end + compressed.length), view = new DataView(data.buffer);
  view.setUint16(0, 0x4949);
  view.setUint16(2, bigtiff ? 43 : 42, true); view.setUint32(4, 8, true);
  view.setUint16(8, tags.length, true);
  let external = 8 + 2 + tags.length * 12 + 4;
  tags.forEach(([tag, type, values], i) => {
    const entry = 10 + i * 12, size = type === 12 ? 8 : type === 4 ? 4 : 2;
    view.setUint16(entry, tag, true); view.setUint16(entry + 2, type, true); view.setUint32(entry + 4, values.length, true);
    const start = values.length * size <= 4 ? entry + 8 : external;
    if (values.length * size > 4) { view.setUint32(entry + 8, start, true); external += values.length * size; }
    values.forEach((value, j) => {
      if (type === 12) view.setFloat64(start + j * size, value, true);
      else if (type === 4) view.setUint32(start + j * size, value, true);
      else view.setUint16(start + j * size, value, true);
    });
  });
  view.setUint32(10 + tags.length * 12, cycle ? 8 : 0, true);
  data.set(compressed, end);
  return { data, heights, x, y };
}

function bundledFixture(fixture, entry = { offset: 0, length: fixture.data.length }) {
  const metadata = gzipSync(JSON.stringify({ format: 'cog-assets-v1', cog_assets: { elevation: entry } }));
  const header = Buffer.alloc(127);
  header.write('PMTiles'); header[7] = 3; header[97] = 2; header[98] = 1;
  header.writeBigUInt64LE(127n, 24);
  header.writeBigUInt64LE(BigInt(metadata.length), 32);
  header.writeBigUInt64LE(BigInt(127 + metadata.length), 56);
  header.writeBigUInt64LE(BigInt(fixture.data.length), 64);
  return { ...fixture, data: Buffer.concat([header, metadata, fixture.data]) };
}

Then('COG ranges and TIFF profile validation preserve elevation samples', async function () {
  const fetch = globalThis.fetch, requests = [];
  let fixture = elevationFixture(), full = false, invalidRange = false;
  globalThis.fetch = async (url, options) => {
    const [, start, end] = /^bytes=(\d+)-(\d+)$/.exec(options.headers.Range).map(Number);
    requests.push([start, end]);
    return new Response(full ? fixture.data : fixture.data.slice(start, end + 1), {
      status: full ? 200 : 206,
      headers: full ? {} : { 'Content-Range': `bytes ${invalidRange ? 1 : start}-${end}/${fixture.data.length}` },
    });
  };
  try {
    for (full of [false, true]) {
      const archive = await openCog('https://example.test/terrain.tif'), header = await archive.getHeader();
      assert.equal(header.tileType, 0); assert.equal(header.minZoom, 14); assert.equal(header.maxZoom, 14);
      const result = await archive.getZxy(14, fixture.x, fixture.y);
      assert.deepEqual(new Float32Array(result.data), fixture.heights);
      assert.equal(await archive.getZxy(14, fixture.x + 1, fixture.y), undefined);
      await assert.rejects(archive.getZxy(14, -1, 0), /coordinates/);
      const controller = new AbortController(); controller.abort();
      await assert.rejects(archive.getZxy(14, fixture.x, fixture.y, controller.signal), { name: 'AbortError' });
    }
    full = false;
    for (full of [false, true]) {
      fixture = bundledFixture(elevationFixture());
      const archive = await openCog('https://example.test/combined.pmtiles', 'elevation');
      assert.equal((await archive.getHeader()).maxZoom, 14);
      assert.deepEqual(new Float32Array((await archive.getZxy(14, fixture.x, fixture.y)).data), fixture.heights);
      await assert.rejects(openCog('https://example.test/combined.pmtiles', 'missing'), /missing PMTiles COG asset/);
    }
    full = false;
    for (const entry of [{ offset: -1, length: 10 }, { offset: 0, length: 99999999 }, { offset: 0.5, length: 10 }]) {
      fixture = bundledFixture(elevationFixture(), entry);
      await assert.rejects(openCog('https://example.test/combined.pmtiles', 'elevation'), /Invalid or missing/);
    }
    assert.ok(requests.some(([start]) => start > 100), 'Tile bytes are fetched separately from the directory');
    for (const [options, message] of [
      [{ bigtiff: true }, /BigTIFF/], [{ predictor: 2 }, /Unsupported COG profile/],
      [{ shift: 0.5 }, /align/], [{ cycle: true }, /Cyclic/],
    ]) {
      fixture = elevationFixture(options);
      await assert.rejects(openCog('https://example.test/invalid.tif'), message);
    }
    fixture = elevationFixture();
    invalidRange = true;
    await assert.rejects(openCog('https://example.test/range.tif'), /range response/);
    invalidRange = false;
    await assert.rejects(readCog({ url: 'https://example.test/test.tif' }, -1, 4), /byte range/);
    await assert.rejects(decodeCogTile(deflateSync(new Uint8Array(100)), 10, 8), /Oversized/);
    await assert.rejects(decodeCogTile(deflateSync(new Uint8Array(10)), 100, 8), /Truncated/);
    fixture = elevationFixture();
    fixture.data = fixture.data.slice(0, -2);
    const archive = await openCog('https://example.test/truncated.tif').catch(error => {
      assert.match(error.message, /offsets or lengths/); return null;
    });
    assert.equal(archive, null);
  } finally { globalThis.fetch = fetch; }
});

Then('COG workers preserve ranges, cache ownership, missing tiles and errors', { timeout: 30000 }, async function () {
  const fixture = elevationFixture(), invalid = elevationFixture({ predictor: 2 });
  const requests = [];
  await this.context.route('**/worker-*.tif', route => {
    const data = route.request().url().includes('invalid') ? invalid.data : fixture.data;
    const [, start, end] = /^bytes=(\d+)-(\d+)$/.exec(route.request().headers().range).map(Number);
    requests.push({ url: route.request().url(), start, end });
    return route.fulfill({ status: 206, body: Buffer.from(data.slice(start, end + 1)),
      headers: { 'Content-Range': `bytes ${start}-${end}/${data.length}` } });
  });
  await this.page.goto(this.baseUrl);
  const result = await this.page.evaluate(async ({ x, y }) => {
    const { openCogInWorker } = await import('/src/workers/openCogInWorker.js');
    const { buildAreaInWorker } = await import('/src/workers/buildAreaInWorker.js');
    const { geometryWorkersByMap } = await import('/src/weakmaps/geometryWorkersByMap.js');
    const { workerMapByLayer } = await import('/src/weakmaps/workerMapByLayer.js');
    let close;
    const map = { once(type, handler) { close = handler; } };
    const layer = { options: {} };
    workerMapByLayer.set(layer, map);
    try {
      const archive = await openCogInWorker(layer, { url: '/worker-elevation.tif',
        workerUrl: '/dist/leaflet-city-mapper-worker.js' });
      const header = await archive.getHeader();
      const tile = await archive.getZxy(14, x, y);
      const missing = await archive.getZxy(14, x + 1, y);
      const geometry = { backend: { options: { workerUrl: '/dist/leaflet-city-mapper-worker.js' } },
        map, jobs: [], featureFaces: [] };
      await buildAreaInWorker(geometry, new AbortController().signal);
      await openCogInWorker(layer, { url: '/worker-secondary.tif',
        workerUrl: '/dist/leaflet-city-mapper-worker.js' });
      const repeated = await archive.getZxy(14, x, y);
      const pool = geometryWorkersByMap.get(map);
      const reused = pool.entries.size === 1 && pool.idle.length === 1;
      const controller = new AbortController();
      controller.abort();
      let aborted = false, failure = '';
      try { await archive.getZxy(14, x, y, controller.signal); }
      catch (error) { aborted = error.name === 'AbortError'; }
      try { await openCogInWorker(layer, { url: '/worker-invalid.tif' }); }
      catch (error) { failure = error.message; }
      const heights = new Float32Array(tile.data), again = new Float32Array(repeated.data);
      return { header, heights: [...heights], same: heights.every((v, i) => v === again[i]),
        missing: missing === undefined, empty: geometry.positions.length, reused, aborted, failure };
    } finally { close(); }
  }, { x: fixture.x, y: fixture.y });
  assert.equal(result.header.tileType, 0);
  assert.equal(result.header.minZoom, 14);
  assert.deepEqual(result.heights, [...fixture.heights]);
  assert.equal(result.same, true);
  assert.equal(result.missing, true);
  assert.equal(result.empty, 0);
  assert.equal(result.reused, true);
  assert.equal(result.aborted, true);
  assert.match(result.failure, /Unsupported COG profile/);
  assert.equal(requests.filter(request => request.url.includes('elevation') && request.start === 0).length, 1,
    'The pooled worker retains the TIFF directory across geometry tasks and interleaved COG sources');
});

Then('the offline Colosseum imagery archives share the exact centered square extent', { timeout: 30000 }, async function () {
  const info = await stat(new URL('../../examples/data/colosseum.pmtiles', import.meta.url));
  assert.ok(info.size > 0 && info.size <= 25000000, `colosseum.pmtiles: ${info.size} bytes`);
  assert.equal((await readdir(new URL('../../examples/data/', import.meta.url))).some(name =>
    /^colosseum-.*\.tiff?$/.test(name)), false, 'Legacy TIFFs must not remain in the demo directory');
  const imagery = await openCog(`${this.baseUrl}/examples/data/colosseum.pmtiles`, 'archaeology');
  const header = await imagery.getHeader();
  const orthophoto = await openCog(`${this.baseUrl}/examples/data/colosseum.pmtiles`, 'orthophoto');
  assert.deepEqual(await orthophoto.getHeader(), header, 'Both imagery COGs cover the same centered square and zooms');
  const half = 20037508.342789244, resolution = half * 2 / (256 * 2 ** 17);
  const west = header.minLon / 180 * half, east = header.maxLon / 180 * half;
  const north = Math.asinh(Math.tan(header.maxLat * Math.PI / 180)) / Math.PI * half;
  const south = Math.asinh(Math.tan(header.minLat * Math.PI / 180)) / Math.PI * half;
  assert.ok(Math.abs((west + east) / 2 - 12.49223 / 180 * half) < 1e-6, 'Exact Colosseum longitude');
  assert.ok(Math.abs((north + south) / 2 -
    Math.asinh(Math.tan(41.89021 * Math.PI / 180)) / Math.PI * half) < 1e-6, 'Exact Colosseum latitude');
  assert.ok(Math.abs(east - west - (north - south)) < 1e-6, 'Square projected extent');
  assert.ok(Math.abs(east - west + resolution - 2048 * resolution) < 1e-6, '2048-pixel square');
});

Then('local archaeological COGs load by range and displace the ground', { timeout: 30000 }, async function () {
  await this.context.route('**/dist/leaflet-city-mapper.js', route =>
    route.fulfill({ contentType: 'text/javascript', body: this.pluginBundle }));
  await this.page.setViewportSize({ width: 480, height: 320 });
  const requests = [], remote = [], errors = [];
  this.page.on('request', request => {
    if (/colosseum\.pmtiles$/.test(request.url())) requests.push(request.headers().range);
    if (/arcgisonline\.com|archeositarproject\.it|geoportale\.regione\.lazio\.it|elevation-tiles-prod/.test(request.url())) remote.push(request.url());
  });
  this.page.on('pageerror', error => errors.push(error.message));
  await this.page.goto(`${this.baseUrl}/examples/leaflet-city-mapper-rome.html`, { waitUntil: 'domcontentloaded' });
  await this.page.evaluate(() => {
    Object.values(map._layers).find(layer => globals.sceneByLayer.get(layer).kind === 'time').remove();
  });
  await this.page.waitForFunction(() => Object.values(map._layers).some(layer =>
    globals.sceneByLayer.get(layer)._geojson &&
    [...globals.sceneByLayer.get(layer)._areas.values()].some(area => area.done && area.buildings === 5)));
  await this.page.evaluate(() => testOperations.setPitch(map, 45));
  await this.page.waitForFunction(() => {
    const terrain = globals.cameraByMap.get(map)._terrain3D;
    return terrain && globals.sceneByLayer.get(terrain)._terrainReady &&
      globals.sceneByLayer.get(terrain)._rasterTiles.size > 0;
  });
  await this.page.evaluate(() => testOperations.setPitch(map, 120));
  assert.equal(await this.page.evaluate(() => Boolean(globals.cameraByMap.get(map)._terrain3D)), true);
  await this.page.evaluate(() => testOperations.setPitch(map, 45));
  await this.page.waitForFunction(() => {
    const terrain = globals.cameraByMap.get(map)._terrain3D;
    return terrain && globals.sceneByLayer.get(terrain)._terrainReady &&
      globals.sceneByLayer.get(terrain)._rasterTiles.size > 0;
  });
  await prepare3DChecks(this.page);
  const result = await this.page.evaluate(async () => {
    const terrain = globals.cameraByMap.get(map)._terrain3D, state = globals.sceneByLayer.get(terrain);
    const samples = [...state._terrainTiles.values()];
    const heights = samples.flatMap(tile => [Math.min(...tile), Math.max(...tile)]);
    const mesh = [...state._rasterTiles.values()][0];
    const gpuHeight = (await nativeChecks.terrainHeights(terrain, [{ mesh, u: 0.5, v: 0.5 }]))[0];
    const coords = mesh.tile.coords;
    const location = map.unproject(new L.Point((coords.x + 0.5) * 256, (coords.y + 0.5) * 256), coords.z);
    const expectedHeight = nativeChecks.getElevation(terrain, location);
    const pixels = await nativeChecks.pixels(terrain);
    return {
      low: Math.min(...heights), high: Math.max(...heights), elevation: nativeChecks.getElevation(terrain, map.getCenter()),
      subdivisions: mesh.geometry.attributes.position.count, terrainShader: Boolean(mesh.program._layerMaterial.terrain),
      sidednessCorrect: mesh.program.cullMode === (terrain.options.doubleSided ? 'none' : 'back'),
      visible: pixels.some((value, i) => i % 4 === 3 && value > 0),
      heightError: Math.abs(gpuHeight + state._terrainOriginElevation - expectedHeight),
    };
  });
  assert.ok(result.high - result.low > 5, JSON.stringify(result));
  assert.ok(Number.isFinite(result.elevation) && result.elevation > -100 && result.elevation < 500);
  assert.ok(result.subdivisions > 4); assert.equal(result.terrainShader, true);
  assert.equal(result.sidednessCorrect, true); assert.equal(result.visible, true);
  assert.ok(result.heightError < 0.1, `GPU displacement must match DEM elevation: ${JSON.stringify(result)}`);
  assert.ok(requests.length > 2 && requests.every(range => /^bytes=\d+-\d+$/.test(range)));
  assert.deepEqual(remote, []); assert.deepEqual(errors, []);
});

Then('shifted COG imagery is retiled without moving its footprint', async function () {
  const blockBytes = 256 * 256 * 3, data = new Uint8Array(8 + blockBytes * 4);
  const colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0]];
  for (let block = 0; block < 4; block++) {
    for (let pixel = 0; pixel < 256 * 256; pixel++) data.set(colors[block], 8 + block * blockBytes + pixel * 3);
  }
  await this.context.route('**/shifted.tif', route => {
    const [, start, end] = /^bytes=(\d+)-(\d+)$/.exec(route.request().headers().range).map(Number);
    return route.fulfill({ status: 206, body: Buffer.from(data.slice(start, end + 1)),
      headers: { 'Content-Range': `bytes ${start}-${end}/${data.length}` } });
  });
  await this.page.goto(this.baseUrl);
  const result = await this.page.evaluate(async ({ blockBytes, size }) => {
    const { getCogTile } = await import('/src/cog/getCogTile.js');
    const source = { url: `${location.origin}/shifted.tif`, size, levels: new Map([[2, {
      x: 0.5009765625, y: 0.5009765625, columns: 2, rows: 2, samples: 3, compression: 1,
      offsets: [8, 8 + blockBytes, 8 + blockBytes * 2, 8 + blockBytes * 3],
      lengths: Array(4).fill(blockBytes),
    }]]) };
    const canvas = new OffscreenCanvas(256, 256), context = canvas.getContext('2d');
    const middle = await getCogTile(source, 2, 1, 1);
    context.drawImage(middle.image, 0, 0); middle.image.close();
    const quadrants = [[64, 64], [192, 64], [64, 192], [192, 192]].map(([x, y]) =>
      [...context.getImageData(x, y, 1, 1).data]);
    context.clearRect(0, 0, 256, 256);
    const edge = await getCogTile(source, 2, 0, 0);
    context.drawImage(edge.image, 0, 0); edge.image.close();
    return { quadrants, outside: [...context.getImageData(64, 64, 1, 1).data],
      inside: [...context.getImageData(192, 192, 1, 1).data] };
  }, { blockBytes, size: data.length });
  assert.deepEqual(result, { quadrants: colors.map(color => [...color, 255]),
    outside: [0, 0, 0, 0], inside: [255, 0, 0, 255] });
});
