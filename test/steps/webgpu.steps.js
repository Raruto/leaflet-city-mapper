import * as globals from '../fixtures/globals.js';


import assert from 'node:assert/strict';
import { Then, When } from '@cucumber/cucumber';

When('I pan the shared WebGPU renderer', { timeout: 30000 }, async function () {
  const pageErrors = [];
  const onPageError = error => pageErrors.push(error.message);
  this.page.on('pageerror', onPageError);
  try {
    await this.page.waitForFunction(() => globals.sceneByLayer.get(globals.cameraByMap.get(map)._terrain3D)?._terrainReady);
    this.webgpuPan = await this.page.evaluate(async () => {
      const modelLayer = layers._layers.find(({ layer }) => globals.sceneByLayer.get(layer).modelUrl)?.layer;
      const owner = globals.sceneByLayer.get(modelLayer)?._shared;
      if (!globals.sceneByLayer.get(owner)?.renderer?.device) throw new Error('The WebGPU model renderer is not ready');
      nativeChecks.render.render(owner);
      await globals.sceneByLayer.get(owner).renderer.device.queue.onSubmittedWorkDone();
      let probe;
      nativeChecks.graph.traverse(globals.sceneByLayer.get(modelLayer).model, mesh => {
        if (!probe && mesh.geometry && mesh.program.bindings.length && mesh._visibleInFrame) probe = mesh;
      });
      if (!probe) throw new Error('The model has no textured geometry to inspect');
      // The example uses MASK materials; explicitly exercise transparent sorting.
      const transparent = probe.program.transparent;
      let sortDepthError;
      try {
        probe.program.transparent = true;
        nativeChecks.render.render(owner);
        const sortedPoint = new DOMPoint(...probe.geometry.bounds.center, 1)
          .matrixTransform(new DOMMatrix(probe.worldMatrix))
          .matrixTransform(new DOMMatrix(globals.sceneByLayer.get(owner).camera.projectionViewMatrix));
        sortDepthError = Math.abs(probe._sortDepth - sortedPoint.z / sortedPoint.w);
      } finally {
        probe.program.transparent = transparent;
      }
      const canvas = globals.sceneByLayer.get(owner).renderer.canvas;
      const device = globals.sceneByLayer.get(owner).renderer.device;
      const renderer = globals.sceneByLayer.get(owner).renderer;
      const worldMatrix = probe.worldMatrix;
      const beforeWorldMatrix = Array.from(worldMatrix);
      const bindGroup = probe.bindGroup;
      const uniformData = renderer.uniformData;
      const uniformBuffer = renderer.uniformBuffer;
      const beforeFrame = Array.from(uniformData.subarray(0, 56));
      // The shader composes view × world: slot 0 must hold the camera, one mesh slot the probe's world matrix.
      const measure = () => {
        const camera = globals.sceneByLayer.get(owner).camera, data = renderer.uniformData;
        let world = Infinity;
        for (let slot = 1; slot < renderer.uniformSlot; slot++) {
          world = Math.min(world, Math.max(...probe.worldMatrix.map((value, i) => Math.abs(Math.fround(value) - data[slot * 64 + i]))));
        }
        return {
          view: Math.max(...camera.viewMatrix.map((value, i) => Math.abs(Math.fround(value) - data[i]))),
          projection: Math.max(...camera.projectionMatrix.map((value, i) => Math.abs(Math.fround(value) - data[16 + i]))),
          world,
        };
      };
      const firstErrors = measure();
      map.panBy([32, -20], { animate: false });
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      await renderer.device.queue.onSubmittedWorkDone();
      const secondErrors = measure();
      let meshes = 0, visibleMeshes = 0;
      nativeChecks.graph.traverse(globals.sceneByLayer.get(owner).scene, mesh => {
        if (!mesh.geometry) return;
        meshes++;
        if (mesh._visibleInFrame) visibleMeshes++;
      });
      const worldMatrixReused = worldMatrix === probe.worldMatrix &&
        beforeWorldMatrix.every((value, i) => value === worldMatrix[i]);
      const originalX = probe.position[0];
      probe.position[0] += 1;
      nativeChecks.graph.updateWorldMatrix(globals.sceneByLayer.get(owner).scene);
      const transformInvalidated = beforeWorldMatrix.some((value, i) => value !== worldMatrix[i]);
      probe.position[0] = originalX + 1000000;
      nativeChecks.render.render(owner);
      const probeCulled = !probe._visibleInFrame;
      probe.position[0] = originalX;
      nativeChecks.graph.updateWorldMatrix(globals.sceneByLayer.get(owner).scene);
      return {
        firstErrors, secondErrors, meshes, visibleMeshes, probeCulled, sortDepthError,
        canvasReused: canvas === globals.sceneByLayer.get(owner).renderer.canvas,
        deviceReused: device === globals.sceneByLayer.get(owner).renderer.device,
        worldMatrixReused, transformInvalidated,
        uniformDataReused: uniformData === renderer.uniformData,
        gpuUniformBufferReused: uniformBuffer === renderer.uniformBuffer,
        uniformValuesChanged: beforeFrame.some((value, i) => value !== uniformData[i]),
        bindGroupReused: bindGroup === probe.bindGroup,
      };
    });
  } finally {
    this.page.off('pageerror', onPageError);
  }
  this.webgpuPan.pageErrors = pageErrors;
});

Then('WebGPU matrices match DOMMatrix and frame resources are reused', function () {
  const result = this.webgpuPan;
  assert.ok(result.visibleMeshes > 0, JSON.stringify(result));
  assert.ok(result.sortDepthError < 1e-6, JSON.stringify(result));
  assert.equal(result.probeCulled, true);
  for (const errors of [result.firstErrors, result.secondErrors]) {
    assert.ok(errors.view === 0 && errors.projection === 0 && errors.world === 0, JSON.stringify(errors));
  }
  assert.equal(result.canvasReused, true);
  assert.equal(result.deviceReused, true);
  assert.equal(result.worldMatrixReused, true);
  assert.equal(result.transformInvalidated, true);
  assert.equal(result.uniformDataReused, true);
  assert.equal(result.gpuUniformBufferReused, true);
  assert.equal(result.uniformValuesChanged, true);
  assert.equal(result.bindGroupReused, true);
  assert.deepEqual(result.pageErrors, []);
});

// Settled scene: terrain meshes exist, the roof atlas was built and no raster layer is still loading.
const waitForWebGPUScene = (page, requireRoof = true) => page.waitForFunction(requireRoof => {
  const owner = globals.renderers.get(map);
  return globals.sceneByLayer.get(owner)?.renderer?.device && (!requireRoof || globals.sceneByLayer.get(owner)._roofRaster) &&
    globals.sceneByLayer.get(globals.cameraByMap.get(map)._terrain3D)?._rasterTiles.size > 0 &&
    !Object.values(map._layers).some(layer => globals.sceneByLayer.get(layer)?.kind === 'raster'
      ? testOperations.isLoading(layer) : layer.isLoading?.());
}, requireRoof, { timeout: 30000 });

When('I measure WebGPU {string}', { timeout: 30000 }, async function (check) {
  assert.ok(['frame scheduling', 'panning uniforms', 'shader highlights', 'animated zoom'].includes(check), check);
  const pageErrors = [];
  const onPageError = error => pageErrors.push(error.message);
  this.page.on('pageerror', onPageError);
  try {
    await waitForWebGPUScene(this.page);
    if (check === 'shader highlights') {
      await this.page.waitForFunction(() => [...globals.sceneByLayer.get(globals.renderers.get(map))._layers]
        .some(layer => globals.sceneByLayer.get(layer).group?.children.some(mesh => mesh.extras?.featureFaces?.length)));
    }
    this.webgpuPacing = await this.page.evaluate(async check => {
      const owner = globals.renderers.get(map);
      const { device } = globals.sceneByLayer.get(owner).renderer;
      const frame = () => new Promise(requestAnimationFrame);
      const gpuErrors = [];
      const onGpuError = event => gpuErrors.push(event.error.message);
      device.addEventListener('uncapturederror', onGpuError);
      let renders = 0, uniformWrites = 0, otherWrites = 0, buffers = new Set();
      const writeBuffer = device.queue.writeBuffer;
      device.queue.writeBuffer = function (buffer) {
        if (buffer === globals.sceneByLayer.get(owner).renderer.uniformBuffer) { uniformWrites++; renders++; }
        else if (buffers.has(buffer)) otherWrites++;
        return writeBuffer.apply(this, arguments);
      };
      try {
        await frame();
        // Same-tick map events: one render before the next frame, after Leaflet's synchronous handlers.
        renders = 0;
        map.fire('move');
        map.fire('rotate');
        map.fire('pitch');
        map.fire('move');
        const synchronousRenders = renders;
        await Promise.resolve();
        const sameTickRenders = renders;

        // Content updates from every shared layer coalesce into the owner's next animation frame.
        await frame();
        renders = 0;
        for (let i = 0; i < 5; i++) nativeChecks.render.update(owner);
        for (const layer of globals.sceneByLayer.get(owner)._layers) nativeChecks.render.update(layer);
        const deferredRenders = renders;
        await frame();
        const frameRenders = renders;
        if (check === 'frame scheduling') {
          return { synchronousRenders, sameTickRenders, deferredRenders, frameRenders, gpuErrors };
        }

        // Continuous panning: every frame renders immediately (no GPU completion gate) and uploads uniforms once.
        if (check === 'panning uniforms') {
          await frame();
          renders = 0;
          uniformWrites = 0;
          const panRenders = [], panDurations = [];
          for (let i = 0; i < 20; i++) {
            const before = renders;
            const started = performance.now();
            map.panBy([6, -3], { animate: false });
            panDurations.push(performance.now() - started);
            await Promise.resolve();
            panRenders.push(renders - before);
            await frame();
          }
          const panTotals = { renders, uniformWrites };
          const sortedPanDurations = [...panDurations].sort((a, b) => a - b);
          const gpuDrainStarted = performance.now();
          await device.queue.onSubmittedWorkDone();
          const performanceMetrics = {
            panRenderCpuMs: {
              p50: sortedPanDurations[Math.floor(sortedPanDurations.length * 0.5)],
              p95: sortedPanDurations[Math.ceil(sortedPanDurations.length * 0.95) - 1],
              max: sortedPanDurations.at(-1),
            },
            gpuDrainMs: performance.now() - gpuDrainStarted,
            samples: panDurations.length,
          };

          let drawn = 0, totalMeshes = 0, sharedBindings = 0, ownBuffers = 0;
          nativeChecks.graph.traverse(globals.sceneByLayer.get(owner).scene, mesh => {
            if (!mesh.geometry) return;
            totalMeshes++;
            if (mesh.uniformBuffer) ownBuffers++;
            if (!mesh.visible || !mesh._visibleInFrame || mesh._appearance === 0) return;
            drawn++;
            if (mesh.boundBuffer === globals.sceneByLayer.get(owner).renderer.uniformBuffer) sharedBindings++;
          });
          const uniformSlots = globals.sceneByLayer.get(owner).renderer.uniformSlot;
          const uniformCapacity = globals.sceneByLayer.get(owner).renderer.uniformBuffer.size / 256;
          performanceMetrics.sceneMeshes = {
            drawn, total: totalMeshes, shadowCasters: globals.sceneByLayer.get(owner)._shadowMeshes?.length || 0,
          };
          return { panRenders, panTotals, performanceMetrics,
            drawn, sharedBindings, ownBuffers, uniformSlots, uniformCapacity, gpuErrors };
        }

        // Hover highlight is a shader vertex range: no vertex color re-upload.
        if (check === 'shader highlights') {
          const buildings = [...globals.sceneByLayer.get(owner)._layers].find(layer => globals.sceneByLayer.get(layer).group?.children.some(mesh => mesh.extras?.featureFaces?.length));
          const target = globals.sceneByLayer.get(buildings).group.children.find(mesh => mesh.extras?.featureFaces?.length);
          const feature = target.extras.featureFaces[0];
          await frame();
          otherWrites = 0;
          buffers = new Set(Object.values(target.geometry.attributes).map(attribute => attribute.buffer));
          nativeChecks.picking.setHighlight(buildings, { mesh: target, ...feature });
          await frame();
          const highlight = { range: target.highlight, expected: [feature.vertexStart, feature.vertexEnd] };
          nativeChecks.picking.setHighlight(buildings, null);
          await frame();
          highlight.cleared = target.highlight;
          highlight.writes = otherWrites;
          return { highlight, gpuErrors };
        }

        // During zoom animations map events wait for the frame that also advances the CSS transitions.
        await frame();
        const zoomEnd = new Promise(resolve => map.once('zoomend', resolve));
        const zoomAnim = new Promise(resolve => map.once('zoomanim', resolve));
        map.setZoom(map.getZoom() - 1);
        await zoomAnim;
        const animating = map._animatingZoom;
        renders = 0;
        map.fire('move');
        await Promise.resolve();
        const zoomTickRenders = renders;
        await frame();
        const zoomFrameRenders = renders;
        await zoomEnd;
        await frame();
        await device.queue.onSubmittedWorkDone();
        return {
          animating, zoomTickRenders, zoomFrameRenders, gpuErrors,
        };
      } finally {
        delete device.queue.writeBuffer;
        device.removeEventListener('uncapturederror', onGpuError);
      }
    }, check);
  } finally {
    this.page.off('pageerror', onPageError);
  }
  this.webgpuPacing.pageErrors = pageErrors;
});

Then('WebGPU {string} preserves its rendering invariants', function (check) {
  assert.ok(['frame scheduling', 'panning uniforms', 'shader highlights', 'animated zoom'].includes(check), check);
  const result = this.webgpuPacing;
  const details = JSON.stringify(result);
  if (check === 'frame scheduling') {
    assert.equal(result.synchronousRenders, 0, details);
    assert.equal(result.sameTickRenders, 1, details);
    assert.equal(result.deferredRenders, 0, details);
    assert.equal(result.frameRenders, 1, details);
  } else if (check === 'panning uniforms') {
    console.log(`PERF Paris WebGPU pan: ${JSON.stringify(result.performanceMetrics)}`);
    this.attach(JSON.stringify(result.performanceMetrics, null, 2), 'application/json');
    assert.deepEqual(result.panRenders, Array(20).fill(1), details);
    assert.equal(result.panTotals.uniformWrites, result.panTotals.renders, details);
    assert.equal(result.performanceMetrics.samples, 20, details);
    assert.ok(result.performanceMetrics.panRenderCpuMs.p50 < 100, details);
    assert.ok(result.drawn > 1, details);
    assert.equal(result.sharedBindings, result.drawn, details);
    assert.equal(result.ownBuffers, 0, details);
    assert.ok(result.uniformSlots > result.drawn && result.uniformSlots <= result.uniformCapacity, details);
  } else if (check === 'shader highlights') {
    assert.deepEqual(result.highlight.range, result.highlight.expected, details);
    assert.equal(result.highlight.cleared, null, details);
    assert.equal(result.highlight.writes, 0, details);
  } else {
    assert.equal(result.animating, true, details);
    assert.equal(result.zoomTickRenders, 0, details);
    assert.equal(result.zoomFrameRenders, 1, details);
  }
  assert.deepEqual(result.gpuErrors, [], details);
  assert.deepEqual(result.pageErrors, [], details);
});

When('I rebuild the WebGPU roof atlas', { timeout: 30000 }, async function () {
  const pageErrors = [];
  const onPageError = error => pageErrors.push(error.message);
  this.page.on('pageerror', onPageError);
  try {
    await waitForWebGPUScene(this.page);
    this.webgpuAtlas = await this.page.evaluate(async () => {
      const owner = globals.renderers.get(map);
      const terrain = globals.cameraByMap.get(map)._terrain3D;
      const { device } = globals.sceneByLayer.get(owner).renderer;
      const gpuErrors = [];
      const onGpuError = event => gpuErrors.push(event.error.message);
      device.addEventListener('uncapturederror', onGpuError);
      const uploads = [];
      const copyExternal = device.queue.copyExternalImageToTexture;
      device.queue.copyExternalImageToTexture = function (source, destination, size) {
        uploads.push({ type: source.source.constructor.name, width: size[0] ?? size.width, height: size[1] ?? size.height });
        return copyExternal.apply(this, arguments);
      };
      // Readable atlas: the renderer only needs sampling and render-attachment usage.
      const createTexture = device.createTexture;
      device.createTexture = function (descriptor) {
        return createTexture.call(this, { ...descriptor, usage: descriptor.usage | GPUTextureUsage.COPY_SRC });
      };
      try {
        nativeChecks.gpu.destroyTexture(owner, globals.sceneByLayer.get(owner)._roofRaster.texture.texture);
        globals.sceneByLayer.get(owner)._roofRaster = null;
        nativeChecks.render.render(owner);
      } finally {
        delete device.createTexture;
        delete device.queue.copyExternalImageToTexture;
      }
      const atlas = globals.sceneByLayer.get(owner)._roofRaster.texture;
      const tiles = Object.values(map._layers)
        .filter(layer => globals.sceneByLayer.get(layer)._type === 'raster' && globals.sceneByLayer.get(layer)._rasterTiles && layer.options.opacity > 0)
        .flatMap(layer => [...globals.sceneByLayer.get(layer)._rasterTiles.values()]
          .filter(tile => tile.done && !tile.request.signal.aborted && tile.image)
          .map(tile => ({ tile, layer })));
      const zoom = Math.max(...tiles.map(({ tile }) => tile.coords.z));
      const bounds = new L.Bounds();
      for (const { tile: { coords }, layer } of tiles) {
        const size = testOperations.getTileSize(layer).multiplyBy(map.getZoomScale(zoom, coords.z));
        bounds.extend(new L.Point(coords.x, coords.y).scaleBy(size));
        bounds.extend(new L.Point(coords.x + 1, coords.y + 1).scaleBy(size));
      }
      const size = bounds.getSize();
      const scaleX = atlas.width / size.x, scaleY = atlas.height / size.y;

      // Compare quadrant means: catches flips, offsets and missing tiles at any atlas scale.
      const quadrants = (pixels, width, height, stride, inset) => {
        const sums = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
        for (let y = inset; y < height - inset; y++) {
          for (let x = inset; x < width - inset; x++) {
            const sum = sums[(y < height / 2 ? 0 : 2) + (x < width / 2 ? 0 : 1)];
            const i = y * stride + x * 4;
            sum[0] += pixels[i]; sum[1] += pixels[i + 1]; sum[2] += pixels[i + 2]; sum[3]++;
          }
        }
        return sums.map(([r, g, b, n]) => [r / n, g / n, b / n]);
      };
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      let best;
      for (const item of tiles.filter(item => item.tile.coords.z === zoom && item.layer.options.opacity === 1)) {
        const { tile } = item;
        canvas.width = tile.image.width;
        canvas.height = tile.image.height;
        context.drawImage(tile.image, 0, 0);
        const expected = quadrants(context.getImageData(0, 0, canvas.width, canvas.height).data,
          canvas.width, canvas.height, canvas.width * 4, 4);
        const contrast = Math.max(...expected.flatMap(a => expected.map(b => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]))));
        if (!best || contrast > best.contrast) best = { tile: item, expected, contrast };
      }
      const tileSize = testOperations.getTileSize(best.tile.layer);
      const offset = new L.Point(best.tile.tile.coords.x, best.tile.tile.coords.y).scaleBy(tileSize).subtract(bounds.min);
      const x = Math.ceil(offset.x * scaleX), y = Math.ceil(offset.y * scaleY);
      const width = Math.floor((offset.x + tileSize.x) * scaleX) - x;
      const height = Math.floor((offset.y + tileSize.y) * scaleY) - y;
      const bytesPerRow = Math.ceil(width * 4 / 256) * 256;
      const buffer = device.createBuffer({ size: bytesPerRow * height, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
      const encoder = device.createCommandEncoder();
      encoder.copyTextureToBuffer({ texture: atlas.texture, origin: [x, y] }, { buffer, bytesPerRow }, [width, height]);
      device.queue.submit([encoder.finish()]);
      await buffer.mapAsync(GPUMapMode.READ);
      const pixels = new Uint8Array(buffer.getMappedRange()).slice();
      buffer.destroy();
      const actual = quadrants(pixels, width, height, bytesPerRow, 2);
      let alpha = 255;
      for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) alpha = Math.min(alpha, pixels[row * bytesPerRow + column * 4 + 3]);
      }
      await device.queue.onSubmittedWorkDone();
      device.removeEventListener('uncapturederror', onGpuError);
      const terrainTiles = tiles.filter(({ tile }) => globals.sceneByLayer.get(terrain)._rasterTiles.has(tile));
      return {
        image: atlas.image,
        atlasSize: [atlas.width, atlas.height],
        uploads,
        tiles: tiles.length,
        terrainTiles: terrainTiles.length,
        duplicatedTerrainTiles: terrainTiles.filter(({ tile }) => globals.sceneByLayer.get(terrain)._rasterTiles.get(tile).texture !== tile.texture).length,
        roofTiles: tiles.length,
        contrast: best.contrast,
        colorError: Math.max(...actual.flatMap((quadrant, i) => quadrant.map((value, c) => Math.abs(value - best.expected[i][c])))),
        alpha,
        gpuErrors,
      };
    });
  } finally {
    this.page.off('pageerror', onPageError);
  }
  this.webgpuAtlas.pageErrors = pageErrors;
});

Then('the roof atlas matches its raster tiles without uploading a canvas', function () {
  const result = this.webgpuAtlas;
  const details = JSON.stringify(result);
  assert.equal(result.image, null, details);
  assert.ok(result.atlasSize.every(size => size >= 1 && size <= 4096), details);
  assert.ok(result.uploads.every(upload => upload.type !== 'HTMLCanvasElement' && upload.width <= 512 && upload.height <= 512), details);
  assert.ok(result.terrainTiles > 0, details);
  assert.equal(result.duplicatedTerrainTiles, 0, details);
  assert.ok(result.uploads.length <= result.roofTiles, details);
  assert.ok(result.contrast > 10, details);
  assert.ok(result.colorError < 6, details);
  assert.equal(result.alpha, 255, details);
  assert.deepEqual(result.gpuErrors, [], details);
  assert.deepEqual(result.pageErrors, [], details);
});

When('I inspect the WebGPU terrain tiles', { timeout: 30000 }, async function () {
  const pageErrors = [];
  const onPageError = error => pageErrors.push(error.message);
  this.page.on('pageerror', onPageError);
  try {
    await waitForWebGPUScene(this.page, false);
    this.webgpuTerrain = await this.page.evaluate(async () => {
      const owner = globals.renderers.get(map);
      const terrain = globals.cameraByMap.get(map)._terrain3D;
      const { device } = globals.sceneByLayer.get(owner).renderer;
      const crs = map.options.crs;
      const coordsByTile = new Map();
      for (const layer of Object.values(map._layers)) {
        for (const tile of globals.sceneByLayer.get(layer)._rasterTiles?.values() || []) coordsByTile.set(tile, tile.coords);
      }
      const renderUploads = [];
      const copyExternal = device.queue.copyExternalImageToTexture;
      device.queue.copyExternalImageToTexture = function (source) {
        renderUploads.push(source.source);
        return copyExternal.apply(this, arguments);
      };
      try {
        nativeChecks.render.render(owner);
      } finally {
        delete device.queue.copyExternalImageToTexture;
      }
      const origin = crs.project(globals.sceneByLayer.get(terrain).location);
      const metres = Math.cos(globals.sceneByLayer.get(terrain).location.lat * Math.PI / 180);
      const base = globals.sceneByLayer.get(terrain)._terrainOriginElevation;
      const { terrainElevation } = await import('../src/terrain/terrainElevation.js');
      // Run the shader's own elevation code on every grid vertex, as the vertex stage does.
      const vertices = [];
      let wrongVertexCount = 0, notUploaded = 0, wrongSize = 0, missingCoords = 0, raisedGrid = 0;
      const grids = new Set(), divisionLevels = new Set();
      for (const [tile, mesh] of globals.sceneByLayer.get(terrain)._rasterTiles) {
        const coords = coordsByTile.get(tile);
        if (!coords) { missingCoords++; continue; }
        if (mesh.texture.uploaded !== tile.image) notUploaded++;
        if (mesh.texture.texture.width !== tile.image.width || mesh.texture.texture.height !== tile.image.height) wrongSize++;
        const divisions = Math.max(1, Math.min(64, 256 / 2 ** (coords.z - globals.sceneByLayer.get(terrain)._terrainZoom)));
        const { position, uv } = mesh.geometry.attributes;
        grids.add(mesh.geometry.attributes);
        divisionLevels.add(divisions);
        if (position.count !== (divisions + 1) ** 2) { wrongVertexCount++; continue; }
        for (let i = 0; i < position.count; i++) {
          if (position.data[i * 3 + 1] !== 0) raisedGrid++;
          vertices.push({ mesh, coords, divisions, u: uv.data[i * 2], v: uv.data[i * 2 + 1] });
        }
      }
      const gpuHeights = await nativeChecks.terrainHeights(terrain, vertices);
      // Reference: geographic round trip per vertex, as the grid was built before the linear shortcut.
      let maxError = 0, relief = 0;
      for (const [i, { mesh, coords, divisions, u, v }] of vertices.entries()) {
        const latlng = map.unproject([(coords.x + u) * 256, (coords.y + v) * 256], coords.z);
        const point = crs.project(latlng);
        const elevation = (terrainElevation(map.project(latlng, globals.sceneByLayer.get(terrain)._terrainZoom), globals.sceneByLayer.get(terrain)._terrainTiles) ?? base) - base;
        maxError = Math.max(maxError,
          Math.abs(mesh.position[0] + mesh.scale[0] * u - (point.x - origin.x) * metres),
          Math.abs(gpuHeights[i] - elevation),
          Math.abs(mesh.position[2] + mesh.scale[2] * v + (point.y - origin.y) * metres));
        relief = Math.max(relief, Math.abs(elevation));
      }
      await device.queue.onSubmittedWorkDone();
      return {
        meshes: globals.sceneByLayer.get(terrain)._rasterTiles.size, vertices: vertices.length, maxError, relief,
        missingCoords, wrongVertexCount, notUploaded, wrongSize, raisedGrid,
        grids: grids.size, divisionLevels: divisionLevels.size,
        terrainUploadsDuringRender: renderUploads.filter(source =>
          [...globals.sceneByLayer.get(terrain)._rasterTiles.keys()].some(tile => tile.image === source)).length,
      };
    });
  } finally {
    this.page.off('pageerror', onPageError);
  }
  this.webgpuTerrain.pageErrors = pageErrors;
});

Then('terrain tiles are uploaded before rendering and match the projected DEM grid', function () {
  const result = this.webgpuTerrain;
  const details = JSON.stringify(result);
  assert.ok(result.meshes > 0 && result.vertices > 0, details);
  assert.ok(result.relief > 1, details);
  assert.equal(result.missingCoords, 0, details);
  assert.equal(result.wrongVertexCount, 0, details);
  assert.equal(result.notUploaded, 0, details);
  assert.equal(result.wrongSize, 0, details);
  assert.equal(result.terrainUploadsDuringRender, 0, details);
  // Elevation lives in the vertex shader: tiles share one flat grid per subdivision level.
  assert.equal(result.raisedGrid, 0, details);
  assert.equal(result.grids, result.divisionLevels, details);
  // Float32 GPU elevation and DEM pixel coordinates: about 1 mm.
  assert.ok(result.maxError < 0.01, details);
  assert.deepEqual(result.pageErrors, [], details);
});
