import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { field, feature, tile } from '../fixtures/vector-tile.js';
import { prepare3DChecks } from './3d.steps.js';
import { build } from 'esbuild';

Then('the vector tiles example preserves geometry and label sizes through zoom and rotation',
  { timeout: 90000 }, async function () {
    const errors = [], downloads = [], libraryRequests = [];
    this.page.on('request', request => {
      if (/\/(?:libs\/vector-tile(?:-layer|-style|-worker)?\.js$|src\/(?:mvt|vector-style|vector-tiles)\/)/.test(
        new URL(request.url()).pathname)) {
        libraryRequests.push(request.url());
      }
    });
    const worker = await build({ entryPoints: ['src/workers/geometryWorker.js'], bundle: true,
      format: 'esm', write: false });
    // Worker globals must not be rewritten to the window-only test registry.
    await this.context.route('**/dist/leaflet-city-mapper-worker.js', route => route.fulfill({
      contentType: 'text/javascript', body: worker.outputFiles[0].text,
    }));
    this.page.on('pageerror', error => errors.push(error.message));
    await this.context.route('https://tiles.openfreemap.org/planet', route => route.fulfill({
      body: JSON.stringify({ tiles: ['https://tiles.openfreemap.org/test/{z}/{x}/{y}.pbf'], maxzoom: 14,
        attribution: 'OpenFreeMap test' }),
    }));
    await this.context.route('https://tiles.openfreemap.org/test/**', route => route.fulfill({
      contentType: 'application/vnd.mapbox-vector-tile',
      body: Buffer.concat([
        tile([feature(3, [9, 512, 512, 26, 3072, 0, 0, 3072, 3071, 0, 15])], [], [], 'building'),
        tile([feature(2, [9, 0, 4096, 10, 8192, 0])], [], [], 'transportation'),
        tile([feature(1, [9, 4096, 4096], [0, 0])], ['name'],
          [field(1, 2, [...new TextEncoder().encode('OpenFreeMap')])], 'place'),
      ]),
    }));
    await this.context.route('https://opentopomap.org/vector/otm_layers.json', route => route.fulfill({
      body: JSON.stringify([
        { id: 'buildings', type: 'fill', source: 'opentopomap-vector', 'source-layer': 'buildings',
          paint: { 'fill-color': '#888' } },
        { id: 'roads', type: 'line', source: 'opentopomap-vector', 'source-layer': 'streets',
          paint: { 'line-color': '#fff', 'line-width': 3 } },
        { id: 'place', type: 'symbol', source: 'opentopomap-vector', 'source-layer': 'place_labels',
          layout: { 'text-field': '{name}', 'text-size': 12 } },
      ]),
    }));
    const building = tile([feature(3, [
      9, 512, 512, 26, 3072, 0, 0, 3072, 3071, 0, 15,
      9, 0, 3071, 26, 512, 1024, 512, 1023, 1023, 0, 15,
    ])], [], [], 'buildings');
    const road = tile(Array.from({ length: 1000 }, (_, index) =>
      feature(2, [9, 0, 2 * (256 + index * 3), 10, 8192, 0])), [], [], 'streets');
    const label = tile([feature(1, [9, 4096, 4096], [0, 0])], ['name'],
      [field(1, 2, [...new TextEncoder().encode('Paris <test>')])], 'place_labels');
    const body = Buffer.concat([building, road, label]);
    await this.context.route('https://opentopomap.org/otm/**', route => {
      downloads.push(route.request().url());
      return route.fulfill({ contentType: 'application/vnd.mapbox-vector-tile', body });
    });
    await this.page.goto(`${this.baseUrl}/examples/leaflet-city-mapper-vector-tiles.html`, {
      waitUntil: 'domcontentloaded',
    });
    await this.page.waitForFunction(() => {
      const source = Object.values(map._layers).find(layer => layer.tiles);
      return source && !source.inflight && source.labelsReady && source.labels.size &&
        [...source.tiles.values()].every(tile => tile.group);
    });
    await prepare3DChecks(this.page);
    const contract = await this.page.evaluate(() => {
      const layer = Object.values(map._layers).find(layer => layer.tiles);
      return Object.getPrototypeOf(layer) === L.Layer.prototype && !('vectorTileLayer' in L);
    });
    assert.equal(contract, true, 'MVT keeps the new L.Layer({source: {type: vector}}) contract');
    const result = await this.page.evaluate(async () => {
      const source = Object.values(map._layers).find(layer => layer.tiles);
      const group = [...source.tiles.values()].find(tile => tile.coords.x === 8296 && tile.coords.y === 5636).group;
      const children = group.getLayers();
      const sourceTile = [...source.tiles.values()].find(tile => tile.coords.x === 8296 && tile.coords.y === 5636);
      const marker = [...source.labels.values()].find(layer =>
        layer.getLatLng().equals(sourceTile.labelCandidates[0].latlng));
      const polygon = children.find(layer => layer instanceof L.Polygon);
      const line = children.find(layer => layer instanceof L.Polyline && !(layer instanceof L.Polygon));
      const failure = [];
      map.on('layeradd', ({ layer }) => layer.on('error', ({ error }) => failure.push(error.message)));
      await Promise.all([...children, marker].map(layer => globals.sceneByLayer.get(layer).ready));
      const retainedCoordinates = polygon.getLatLngs();
      const owner = globals.renderers.get(map);
      const markerState = globals.sceneByLayer.get(marker)._nativeGPU;
      const polygonState = globals.sceneByLayer.get(polygon)._nativeGPU;
      const lineState = globals.sceneByLayer.get(line)._nativeGPU;
      const snapshots = [];
      const originalStroke = lineState.meshes.get('stroke').geometry.attributes.position.data.slice();
      const originalBuffer = lineState.meshes.get('stroke').geometry.attributes.position.buffer;
      const [{ markerQuadCorners }] = await Promise.all([import('/src/geometry/markerQuadCorners.js')]);
      for (const [zoom, bearing, pitch] of [[15, 20, 45], [17, 75, 60], [19, 180, 0], [14, 20, 45]]) {
        const started = performance.now();
        map.setZoom(zoom, { animate: false });
        testOperations.setBearing(map, bearing);
        testOperations.setPitch(map, pitch);
        nativeChecks.render.render(owner);
        const backend = globals.sceneByLayer.get(markerState.backend);
        const matrix = new DOMMatrix(backend.camera.projectionViewMatrix)
          .multiply(new DOMMatrix(backend.root.worldMatrix));
        const points = markerQuadCorners(markerState, 'icon', marker._icon).map(point => {
          const clip = new DOMPoint(...point, 1).matrixTransform(matrix), size = map.getSize();
          return [(clip.x / clip.w + 1) * size.x / 2, (1 - clip.y / clip.w) * size.y / 2];
        });
        snapshots.push({
          width: points[1][0] - points[0][0],
          height: points[2][1] - points[0][1],
          horizontal: Math.abs(points[1][1] - points[0][1]),
          retained: polygon.getLatLngs() === retainedCoordinates,
          strokeVertices: lineState.meshes.get('stroke').geometry.attributes.position.count,
          retainedStroke: originalStroke.every((value, index) =>
            value === lineState.meshes.get('stroke').geometry.attributes.position.data[index]),
          scale: lineState.meshes.get('stroke').program.uniforms.strokeScale.value,
          expectedScale: 2 ** (lineState.strokeZoom -
            (globals.cameraByMap.get(map)._cameraView?.zoom ?? map.getZoom())),
          retainedBuffer: lineState.meshes.get('stroke').geometry.attributes.position.buffer === originalBuffer,
          elapsed: performance.now() - started,
        });
      }
      const vectorMeshes = [...polygonState.meshes.values(), ...lineState.meshes.values()];
      const directGPU = vectorMeshes.every(mesh => mesh.geometry.attributes.position.count > 0 &&
        mesh.geometry.attributes.position.buffer && !mesh.program.uniforms.baseTexture);
      const labelGPU = markerState.meshes.has('icon') && marker.options.rotateWithView === false;
      const svg = decodeURIComponent(marker.options.icon.options.iconUrl.split(',')[1]);
      const canvasCount = map.getContainer().querySelectorAll('canvas.leaflet-3d').length;
      line.setLatLngs(line.getLatLngs()[0]).setStyle({ weight: 6, color: { r: 1, g: 0, b: 0 } });
      nativeChecks.render.render(owner);
      const mutationApplied = lineState.meshes.get('stroke').geometry.attributes.position.count === 6;
      line.setStyle({ weight: 0 });
      nativeChecks.render.render(owner);
      const zeroWeight = !lineState.meshes.has('stroke');
      line.setStyle({ weight: 3 });
      nativeChecks.render.render(owner);
      const restoredStroke = lineState.meshes.get('stroke').geometry.attributes.position.count === 6;
      source.remove();
      const removed = !map.hasLayer(marker) && !map.hasLayer(polygon) && source.tiles.size === 0;
      source.addTo(map);
      return { directGPU, labelGPU, snapshots, iconSize: marker.options.icon.options.iconSize,
        escaped: svg.includes('&lt;test&gt;'), canvasCount, removed, failure,
        mutationApplied, zeroWeight, restoredStroke,
        rasterGrids: Object.values(map._layers).filter(layer => layer instanceof L.GridLayer).length };
    });
    assert.equal(result.directGPU, true);
    assert.equal(result.labelGPU, true);
    assert.equal(result.canvasCount, 1);
    assert.equal(result.rasterGrids, 0);
    assert.equal(result.escaped, true);
    assert.equal(result.removed, true);
    assert.equal(result.mutationApplied, true, 'A style update must not discard a pending geometry mutation');
    assert.equal(result.zeroWeight, true);
    assert.equal(result.restoredStroke, true);
    for (const snapshot of result.snapshots) {
      assert.ok(Math.abs(snapshot.width - result.iconSize[0]) < 1e-4, JSON.stringify(snapshot));
      assert.ok(Math.abs(snapshot.height - result.iconSize[1]) < 1e-4, JSON.stringify(snapshot));
      assert.ok(snapshot.horizontal < 1e-4, JSON.stringify(snapshot));
      assert.equal(snapshot.retained, true);
      assert.ok(snapshot.strokeVertices > 0);
      assert.equal(snapshot.retainedStroke, true, 'GPU zoom does not rewrite solid stroke vertices');
      assert.equal(snapshot.retainedBuffer, true, 'GPU zoom reuses uploaded solid stroke buffers');
      assert.ok(Math.abs(snapshot.scale - snapshot.expectedScale) < 1e-7, JSON.stringify(snapshot));
      assert.ok(snapshot.elapsed < 150, `Dense-tile view update exceeds 150 ms: ${JSON.stringify(snapshot)}`);
    }
    assert.ok(downloads.length > 0);
    assert.ok(downloads.every(url => /\/14\//.test(url)), 'Overzoom never requests unsupported tiles');
    assert.deepEqual(result.failure, []);
    await this.page.evaluate(() => {
      globalThis.originalVectorTiles = Object.values(map._layers).find(layer => layer.tiles);
      originalVectorTiles.remove();
      new L.Layer({ source: {
        type: 'vector', tileJSON: 'https://tiles.openfreemap.org/planet', sourceId: 'openmaptiles',
        style: [
          { id: 'buildings', type: 'fill', source: 'openmaptiles', 'source-layer': 'building',
            paint: { 'fill-color': '#d4cbc3' } },
          { id: 'roads', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation',
            paint: { 'line-color': '#fff', 'line-width': 3 } },
          { id: 'places', type: 'symbol', source: 'openmaptiles', 'source-layer': 'place',
            layout: { 'text-field': '{name}', 'text-size': 14 } },
        ],
      } }).addTo(map);
    });
    await this.page.waitForFunction(() => {
      const source = Object.values(map._layers).find(layer => layer.tiles);
      return source && source.options.attribution === 'OpenFreeMap test' && !source.inflight &&
        source.labelsReady && source.labels.size &&
        [...source.tiles.values()].every(tile => tile.group);
    });
    const switched = await this.page.evaluate(() => {
      const source = Object.values(map._layers).find(layer => layer.tiles);
      return {
        sources: Object.values(map._layers).filter(layer => layer.tiles).length,
        polygon: [...source.tiles.values()].some(tile =>
          tile.group.getLayers().some(layer => layer instanceof L.Polygon)),
        label: [...source.labels.values()].some(marker => marker.options.title === 'OpenFreeMap'),
        canvas: map.getContainer().querySelectorAll('canvas.leaflet-3d').length,
        isolated: [...source.tiles.values()].every(tile => tile.group.getLayers().every(layer =>
          layer.options.pane.startsWith(`mvt-${L.Util.stamp(source)}-`))),
      };
    });
    assert.deepEqual(switched, { sources: 1, polygon: true, label: true, canvas: 1, isolated: true });
    await this.page.evaluate(() => {
      Object.values(map._layers).find(layer => layer.tiles).remove();
      originalVectorTiles.addTo(map);
    });
    await this.page.waitForFunction(() => {
      const source = Object.values(map._layers).find(layer => layer.tiles);
      return source?.options.attribution.includes('OpenTopoMap') && !source.inflight &&
        source.labelsReady && [...source.tiles.values()].every(tile => tile.group);
    }).catch(async error => {
      const state = await this.page.evaluate(() => Object.values(map._layers).filter(layer => layer.tiles).map(layer => ({
        attribution: layer.options.attribution, inflight: layer.inflight, labelsReady: layer.labelsReady,
        labels: layer.labels.size, tiles: [...layer.tiles.values()].map(tile => ({
          key: tile.key, needed: tile.needed, started: tile.started, loaded: Boolean(tile.group),
        })),
      })));
      error.message += `\nVector sources: ${JSON.stringify(state)}\nPage errors: ${JSON.stringify(errors)}`;
      throw error;
    });
    const decoder = await this.page.evaluate(bytes =>
      L.Util.decodeVectorTile(new Uint8Array(bytes)).map(layer => layer.name), [...body]);
    assert.deepEqual(decoder, ['buildings', 'streets', 'place_labels']);
    assert.deepEqual(libraryRequests, [], 'MVT support is bundled without runtime library or source imports');
    assert.deepEqual(errors, []);
  });
