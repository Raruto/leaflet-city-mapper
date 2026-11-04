import assert from 'node:assert/strict';
import { gzipSync, gunzipSync } from 'node:zlib';
import { Then } from '@cucumber/cucumber';

Then('the native PMTiles methods handle directories, compression and failures', async function () {
  await this.context.unroute('**/dist/types/*.js');
  // Fresh, unmocked modules: a query string bypasses the module cache.
  await this.page.evaluate(async base => {
    await import(`${base}/dist/types/pmtiles.js?native`);
  }, this.baseUrl);
  const exposesReaderClass = await this.page.evaluate(() => 'PMTiles' in L);
  assert.equal(exposesReaderClass, false, 'PMTiles methods belong to their consuming layers');
  const directory = entries => {
    const bytes = [];
    const write = value => {
      do {
        const byte = value % 128;
        value = Math.floor(value / 128);
        bytes.push(byte | (value ? 128 : 0));
      } while (value);
    };
    write(entries.length);
    let previous = 0;
    for (const entry of entries) { write(entry.id - previous); previous = entry.id; }
    for (const entry of entries) write(entry.run);
    for (const entry of entries) write(entry.length);
    entries.forEach((entry, i) => write(i && entry.offset === entries[i - 1].offset + entries[i - 1].length
      ? 0 : entry.offset + 1));
    return gzipSync(Buffer.from(bytes));
  };
  const first = gzipSync('first'), second = gzipSync('second');
  const leaf = directory([{ id: 1, run: 2, length: first.length, offset: 0 },
    { id: 4, run: 1, length: second.length, offset: first.length }]);
  const root = directory([{ id: 1, run: 0, length: leaf.length, offset: 0 }]);
  const header = Buffer.alloc(127);
  header.write('PMTiles'); header[7] = 3;
  const u64 = (offset, value) => header.writeBigUInt64LE(BigInt(value), offset);
  u64(8, 127); u64(16, root.length);
  u64(40, 127 + root.length); u64(48, leaf.length);
  u64(56, 127 + root.length + leaf.length); u64(64, first.length + second.length);
  header[97] = header[98] = 2; header[99] = 1; header[100] = header[101] = 1;
  const archive = Buffer.concat([header, root, leaf, first, second]);
  const plainRoot = gunzipSync(directory([{ id: 1, run: 2, length: 5, offset: 0 },
    { id: 4, run: 1, length: 6, offset: 5 }]));
  const plainHeader = Buffer.from(header);
  plainHeader[97] = plainHeader[98] = 1;
  plainHeader.writeBigUInt64LE(BigInt(plainRoot.length), 16);
  plainHeader.writeBigUInt64LE(BigInt(127 + plainRoot.length), 56);
  plainHeader.writeBigUInt64LE(11n, 64);
  const plainArchive = Buffer.concat([plainHeader, plainRoot, Buffer.from('firstsecond')]);
  const requests = [];
  await this.page.route('**/fixture.pmtiles*', async route => {
    const request = route.request();
    const [start, end] = request.headers().range.match(/\d+/g).map(Number);
    requests.push({ start, end, query: new URL(request.url()).search });
    let bytes = archive;
    const url = new URL(request.url());
    if (url.searchParams.has('plain')) bytes = plainArchive;
    if (url.searchParams.has('version')) {
      bytes = Buffer.from(archive); bytes[7] = 2;
    }
    if (url.searchParams.has('compression')) {
      bytes = Buffer.from(archive); bytes[97] = 3;
    }
    if (url.searchParams.has('http')) return route.fulfill({ status: 503, body: '' });
    if (url.searchParams.has('directory') && start === 127) {
      const bad = Buffer.from([0x80]);
      return route.fulfill({ status: 206,
        headers: { 'Content-Range': `bytes ${start}-${end}/${archive.length}`, ETag: '"original"' },
        body: Buffer.concat([bad, Buffer.alloc(end - start)]) });
    }
    const full = url.searchParams.has('full');
    const truncated = url.searchParams.has('truncated');
    await route.fulfill({
      status: full ? 200 : 206,
      headers: { 'Content-Range': `bytes ${start}-${end}/${bytes.length}`,
        ETag: url.searchParams.has('changed') && start > 0 ? '"new"' : '"original"' },
      body: full ? bytes : bytes.subarray(start, truncated ? end : end + 1),
    });
  });
  const result = await this.page.evaluate(async () => {
    const archive = new L.Layer({ source: { type: 'pmtiles', url: 'fixture.pmtiles' } });
    await archive.ready;
    const header = archive.header;
    const read = async (x, y) => {
      const tile = await archive.getZxy(1, x, y);
      return tile && new TextDecoder().decode(tile.data);
    };
    const tiles = await Promise.all([read(0, 0), read(0, 1), read(1, 1), read(1, 0)]);
    const abort = new AbortController(); abort.abort();
    const cancelled = await archive.getZxy(1, 0, 0, abort.signal).then(() => false, error => error.name === 'AbortError');
    const errors = [];
    for (const query of ['version', 'compression', 'http', 'truncated', 'changed']) {
      const reader = new L.Layer({ source: { type: 'pmtiles', url: `fixture.pmtiles?${query}` } });
      errors.push(await reader.ready.then(() => reader.getZxy(1, 0, 0))
        .then(() => '', error => error.message));
    }
    const invalid = await archive.getZxy(1, 2, 0).then(() => false, error => error.message === 'Invalid PMTiles tile coordinates');
    const full = new L.Layer({ source: { type: 'pmtiles', url: 'fixture.pmtiles?full' } });
    await full.ready;
    const fullTile = await full.getZxy(1, 1, 0);
    const plain = new L.Layer({ source: { type: 'pmtiles', url: 'fixture.pmtiles?plain' } });
    await plain.ready;
    const plainTile = await plain.getZxy(1, 1, 0);
    const badDirectory = new L.Layer({ source: { type: 'pmtiles', url: 'fixture.pmtiles?directory' } });
    const directoryError = await badDirectory.ready.then(() => badDirectory.getZxy(1, 0, 0))
      .then(() => false, error => error instanceof Error);
    return { tiles, cancelled, invalid, zoom: [header.minZoom, header.maxZoom], errors,
      full: new TextDecoder().decode(fullTile.data), plain: new TextDecoder().decode(plainTile.data),
      badDirectory: directoryError };
  });
  assert.deepEqual(result.tiles, ['first', 'first', undefined, 'second']);
  assert.deepEqual(result.zoom, [1, 1]);
  assert.equal(result.cancelled, true);
  assert.equal(result.invalid, true);
  assert.equal(result.full, 'second');
  assert.equal(result.plain, 'second');
  assert.equal(result.badDirectory, true);
  assert.deepEqual(result.errors, ['Expected a PMTiles v3 archive', 'Unsupported PMTiles compression: 3',
    'Unable to read PMTiles: HTTP 503', 'Truncated PMTiles range', 'PMTiles archive changed; recreate the layer']);
  for (const query of ['', '?changed', '?full', '?plain', '?directory']) {
    assert.equal(requests.filter(request => request.start === 127 && request.query === query).length, 1,
      `One cached root request for reader ${query || 'default'}`);
  }
  const real = await this.page.evaluate(async () => {
    const { getZxy } = await import('/dist/utils/getZxy.js');
    const buildings = new L.Layer({ source: { type: 'pmtiles', url: '../examples/data/paris-buildings.pmtiles' } });
    await buildings.ready;
    const header = buildings.header;
    const point = test3d.map.project(new L.LatLng(48.85826, 2.2945), header.minZoom).divideBy(256).floor();
    const tile = await getZxy(buildings, header.minZoom, point.x, point.y);
    const collection = JSON.parse(new TextDecoder().decode(tile.data));
    const raster = new L.Layer({ source: { type: 'pmtiles', url: '../examples/data/paris-orthophotos.pmtiles' } });
    await raster.ready;
    const rasterHeader = raster.header;
    const rasterPoint = test3d.map.project(new L.LatLng(48.85826, 2.2945), rasterHeader.maxZoom).divideBy(256).floor();
    const image = await raster.getZxy(rasterHeader.maxZoom, rasterPoint.x, rasterPoint.y);
    const bitmap = await createImageBitmap(new Blob([image.data]));
    return { type: collection.type, count: collection.features.length, width: bitmap.width };
  });
  assert.equal(real.type, 'FeatureCollection');
  assert.ok(real.count > 0);
  assert.equal(real.width, 256);
});

Then('PMTiles layers own archive initialization and native zoom selection', { timeout: 30000 }, async function () {
    const result = await this.page.evaluate(async () => {
      const map = test3d.map;
      let resolveHeader;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const blob = await new Promise(resolve => canvas.toBlob(resolve));
      const image = await blob.arrayBuffer();
      const archive = {
        getHeader: () => new Promise(resolve => { resolveHeader = resolve; }),
        getZxy: async () => ({ data: image }),
      };
      const layer = new L.Layer({ source: { type: 'pmtiles', url: 'test.pmtiles', archive } }).addTo(map);
      const delayed = layer._rasterTiles.size === 0;
      // The first routed layer may still be loading its router.
      while (!resolveHeader) await new Promise(resolve => setTimeout(resolve));
      resolveHeader({ minZoom: 0, maxZoom: 12 });
      await layer.ready;
      const nativeZoom = layer.options.maxNativeZoom;
      const deadline = performance.now() + 5000;
      while (!layer._rasterTiles.size || [...layer._rasterTiles.values()].some(tile => !tile.done)) {
        if (performance.now() > deadline) throw new Error('PMTiles canvas tiles did not load');
        await new Promise(requestAnimationFrame);
      }
      const tileZoom = layer._tileZoom;
      const initialized = layer.renderer.canvas.isConnected &&
        [...layer._rasterTiles.values()].every(tile => tile.mesh.parent === layer.root);
      const waitForZoom = async zoom => {
        const deadline = performance.now() + 5000;
        while (layer._tileZoom !== zoom ||
          ![...layer._rasterTiles.values()].some(tile => tile.coords.z === zoom) ||
          [...layer._rasterTiles.values()].some(tile => tile.coords.z === zoom && !tile.done && !tile.error)) {
          if (performance.now() > deadline) throw new Error(`PMTiles zoom ${zoom} tiles did not settle`);
          await new Promise(requestAnimationFrame);
        }
      };
      map.setZoom(8, { animate: false });
      await waitForZoom(8);
      const outgoing = [...layer._rasterTiles.keys()];
      const pendingTiles = [];
      layer.options.archive.getZxy = z => z === 9
        ? new Promise(resolve => pendingTiles.push(resolve))
        : Promise.resolve({ data: image });
      map.setZoom(9, { animate: false });
      const pendingDeadline = performance.now() + 5000;
      while (!pendingTiles.length) {
        if (performance.now() > pendingDeadline) throw new Error('PMTiles zoom did not request new tiles');
        await new Promise(requestAnimationFrame);
      }
      const retained = outgoing.every(key => layer._rasterTiles.has(key));
      for (const resolve of pendingTiles) resolve({ data: image });
      await waitForZoom(9);
      const oldTilesRemoved = ![...layer._rasterTiles.keys()].some(key => key.startsWith('8/'));
      layer.remove();
      const override = await new L.Layer({ source: { type: 'pmtiles', url: 'test.pmtiles',
        archive: { getHeader: async () => ({ minZoom: 0, maxZoom: 12 }) }, maxNativeZoom: 10 } }).ready;
      const failed = new L.Layer({ source: { type: 'pmtiles', url: 'test.pmtiles',
        archive: { getHeader: async () => { throw new Error('Missing archive'); } } } });
      let emitted;
      failed.on('error', event => { emitted = event.error; });
      const error = await failed.ready.then(() => null, error => error);
      const missing = new L.Layer({ source: { type: 'pmtiles', url: 'test.pmtiles',
        archive: { getHeader: async () => ({ minZoom: 0, maxZoom: 12 }), getZxy: async () => undefined } } }).addTo(map);
      let tileError;
      missing.on('tileerror', event => { tileError = event; });
      const missingDeadline = performance.now() + 5000;
      while (!tileError) {
        if (performance.now() > missingDeadline) throw new Error('Expected the missing PMTiles tile error');
        await new Promise(requestAnimationFrame);
      }
      missing.remove();
      let started;
      const requestStarted = new Promise(resolve => { started = resolve; });
      const cancelled = new L.Layer({ source: { type: 'pmtiles', url: 'test.pmtiles',
        archive: {
          getHeader: async () => ({ minZoom: 0, maxZoom: 12 }),
          getZxy: (_, __, ___, signal) => new Promise((resolve, reject) => {
            started(signal);
            signal.addEventListener('abort', () => reject(signal.reason), { once: true });
          }),
        } } }).addTo(map);
      const signal = await requestStarted;
      cancelled.remove();
      await new Promise(resolve => setTimeout(resolve, 0));
      return { delayed, nativeZoom, tileZoom, initialized, override: override.options.maxNativeZoom,
        retained, oldTilesRemoved,
        failed: error?.message === 'Missing archive' && emitted === error,
        noFallback: failed.options.maxNativeZoom === undefined,
        tileBase: Object.getPrototypeOf(layer) === L.Layer.prototype &&
          layer._type === 'pmtiles' && !(layer instanceof L.TileLayer) &&
          !(layer instanceof L.GridLayer),
        directCanvas: !('_container' in layer) && !('createTile' in layer),
        missingRaster: tileError.error.message ===
          `Tile ${tileError.coords.z}/${tileError.coords.x}/${tileError.coords.y} is not in the offline archive` &&
          tileError.tile.error === tileError.error.message,
        cancelled: signal.aborted && cancelled._rasterTiles.size === 0 };
    });
    assert.deepEqual(result, {
      delayed: true, nativeZoom: 12, tileZoom: result.tileZoom, initialized: true, override: 10,
      retained: true, oldTilesRemoved: true,
      failed: true, noFallback: true,
      tileBase: true, directCanvas: true, missingRaster: true, cancelled: true,
    });
    assert.ok(result.tileZoom >= 0 && result.tileZoom <= 12, `Tile zoom: ${result.tileZoom}`);
});
