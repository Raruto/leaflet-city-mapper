import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { buildArea } from '../../src/sources/buildArea.js';
import { buildAreaFeature } from '../../src/sources/buildAreaFeature.js';
import { sourceAreaContext } from '../../src/sources/sourceAreaContext.js';
import { emptyNode } from '../../src/scene/emptyNode.js';
import { prepareFrameMeshes } from '../../src/rendering/prepareFrameMeshes.js';
import { resizeRenderer } from '../../src/rendering/resizeRenderer.js';
import { prepareFrameUniforms } from '../../src/rendering/prepareFrameUniforms.js';
import { updateRoofRaster } from '../../src/rendering/updateRoofRaster.js';
import { shadowCacheMatches } from '../../src/shadows/shadowCacheMatches.js';
import { shadowBounds } from '../../src/shadows/shadowBounds.js';
import { drawShadowMeshes } from '../../src/shadows/drawShadowMeshes.js';

Then('source stages preserve features, errors and load completion', async function () {
  const previous = { L: globalThis.L, requestAnimationFrame: globalThis.requestAnimationFrame,
    GPUBufferUsage: globalThis.GPUBufferUsage, GPUShaderStage: globalThis.GPUShaderStage };
  globalThis.L = { LatLng: class { constructor(lat, lng) { this.lat = lat; this.lng = lng; } } };
  globalThis.requestAnimationFrame = callback => setImmediate(callback);
  globalThis.GPUBufferUsage = { VERTEX: 1, COPY_DST: 2 };
  globalThis.GPUShaderStage = { VERTEX: 1, FRAGMENT: 2 };
  try {
    const errors = [];
    const backend = {
      location: { lat: 0, lng: 0 }, root: emptyNode(), _geojson: true, _inflight: 1,
      options: { style: () => ({ top: 10, bottom: 2, color: 0xff0000 }) },
      fire: (type, event) => errors.push([type, event.error.message]),
    };
    const map = { options: { crs: { project: point => ({ x: point.lng, y: point.lat }) } } };
    const area = { request: new AbortController() };
    const context = sourceAreaContext(backend, area, map);
    const feature = {
      id: 'building', properties: { name: 'Courtyard' },
      geometry: { type: 'Polygon', coordinates: [
        [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
        [[4, 4], [4, 6], [6, 6], [6, 4], [4, 4]],
      ] },
    };
    buildAreaFeature(context, feature);
    assert.equal(context.featureFaces.length, 1);
    const face = context.featureFaces[0];
    assert.equal(face.id, 'building');
    assert.equal(face.properties, feature.properties);
    assert.equal(face.vertexStart, 0);
    assert.equal(face.vertexEnd, context.positions.length / 3);
    assert.deepEqual(face.baseColor, { r: 1, g: 0, b: 0 });
    let roofArea = 0, floorArea = 0;
    for (let i = 0; i < context.positions.length; i += 9) {
      const p = context.positions.slice(i, i + 9), normal = context.normals.slice(i, i + 3);
      const area = Math.abs((p[3] - p[0]) * (p[8] - p[2]) - (p[6] - p[0]) * (p[5] - p[2])) / 2;
      if (normal[1] === 1) { roofArea += area; assert.equal(p[1], 10); }
      if (normal[1] === -1) { floorArea += area; assert.equal(p[1], 2); }
    }
    assert.equal(roofArea, 96);
    assert.equal(floorArea, 96);
    backend.options.style = () => null;
    buildAreaFeature(context, feature);
    assert.equal(context.skipped, 1);
    assert.equal(context.featureFaces.length, 1);
    area.coords = { z: 0, x: 1, y: 1 };
    map.project = point => ({ x: point.lng, y: point.lat });
    backend.options.style = () => { throw new Error('Out-of-tile features must not be styled'); };
    buildAreaFeature(context, feature);
    delete area.coords;
    backend.options.style = () => ({ top: 1, bottom: 2 });
    assert.throws(() => buildAreaFeature(context, feature), /Invalid extrusion heights/);
    assert.throws(() => buildAreaFeature(context, { geometry: { type: 'LineString' } }), /Unsupported GeoJSON geometry/);

    backend.options.nightLight = true;
    const style = { top: 8, color: 0xffffff, lightRadius: 20, lightFlux: 3000, poleRadius: 0.1 };
    backend.options.style = () => style;
    const lights = sourceAreaContext(backend, area, map);
    const point = { properties: { cod_ouvrag: 'pole' }, geometry: { type: 'Point', coordinates: [1, 2] } };
    buildAreaFeature(lights, point);
    const firstCount = lights.positions.length;
    buildAreaFeature(lights, point);
    assert.equal(lights.supports.size, 1);
    assert.equal(lights.lights.length, 2);
    assert(lights.positions.length - firstCount < firstCount, 'A shared pole must be generated only once');
    assert.equal(lights.uvs.length / 2, lights.positions.length / 3);
    assert.deepEqual(lights.lights[0], {
      position: [1, 8, -2], radius: Math.hypot(8, 20), color: [1, 1, 1], flux: 3000,
    });
    style.lightFlux = 0;
    assert.throws(() => buildAreaFeature(lights, point), /Invalid light flux/);
    assert.throws(() => buildAreaFeature(lights, feature), /Night lights require Point geometry/);

    const uploads = [];
    backend.renderer = { sunlight: { layout: {} }, device: {
      createBuffer: descriptor => ({ ...descriptor }),
      queue: { writeBuffer: (buffer, offset, data) => uploads.push(Array.from(data)) },
      createShaderModule: () => ({ getCompilationInfo: async () => ({ messages: [] }) }),
      createBindGroupLayout: () => ({}), createPipelineLayout: () => ({}),
    } };
    backend.options.nightLight = false;
    backend.options.roofTexture = true;
    backend.options.style = () => ({ top: 10, bottom: 2, color: 0xff0000 });
    backend.options.data = { type: 'FeatureCollection', features: [feature] };
    await buildArea(backend, area, map);
    assert.equal(area.done, true);
    assert.equal(area.buildings, 1);
    assert.equal(area.mesh.parent, backend.root);
    assert.equal(area.mesh.program._layerMaterial.roofTexture, true);
    assert.deepEqual(uploads, [context.positions, context.normals, context.colors]);
    assert.deepEqual(area.mesh.extras.featureFaces, context.featureFaces);
    assert.equal(backend._inflight, 0);

    backend._inflight++;
    backend.options.data = { type: 'FeatureCollection', features: [] };
    await buildArea(backend, area, map);
    assert.equal(area.done, true);
    assert.equal(area.mesh, null);
    assert.equal(backend._inflight, 0);
    assert.deepEqual(errors, []);
    backend.options.data = { type: 'invalid' };
    backend._inflight++;
    await buildArea(backend, area, map);
    assert.equal(area.error, 'Invalid GeoJSON response');
    assert.equal(backend._inflight, 0);
    assert.deepEqual(errors, [['error', 'Invalid GeoJSON response']]);
    area.request.abort();
    backend._inflight++;
    await buildArea(backend, area, map);
    assert.equal(backend._inflight, 0);
    assert.equal(errors.length, 1, 'Cancelled loads must not emit errors');
  } finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[name];
      else globalThis[name] = value;
    }
  }
});

Then('frame stages preserve visibility, fading and buffer reuse', async function () {
  const previous = globalThis.GPUTextureUsage;
  globalThis.GPUTextureUsage = { RENDER_ATTACHMENT: 1 };
  try {
    const created = [], destroyed = [];
    const backend = { renderer: {
      canvas: { style: {} }, dpr: 2,
      device: {
        createTexture: descriptor => {
          const texture = { descriptor, destroy: () => destroyed.push(texture) };
          created.push(texture);
          return texture;
        },
        queue: { onSubmittedWorkDone: () => Promise.resolve() },
      },
    } };
    const size = { x: 320, y: 240, equals(other) { return this.x === other.x && this.y === other.y; } };
    resizeRenderer(backend, size);
    resizeRenderer(backend, size);
    assert.equal(created.length, 1);
    assert.deepEqual(created[0].descriptor.size, [640, 480]);
    assert.equal(backend.renderer.canvas.style.width, '320px');
    resizeRenderer(backend, { ...size, x: 640 });
    await Promise.resolve();
    assert.equal(created.length, 2);
    assert.equal(destroyed.length, 1);

    const opaque = { id: 1, visible: true, program: { transparent: false, uniforms: {} } };
    const fading = { id: 2, visible: true, fadeDuration: 100, fadeStart: 0,
      program: { transparent: true, uniforms: {} } };
    const hidden = { id: 3, visible: false, program: { uniforms: {} } };
    const roof = { id: 4, visible: true, program: { uniforms: { roofTexture: {} } },
      geometry: { bounds: { min: [0, 0, 0], max: [1, 1, 1] } }, worldMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] };
    const parent = { id: 5, ground: true, visible: true, tile: { coords: { z: 1 } }, program: opaque.program };
    const child = { id: 6, ground: true, visible: true, tile: { coords: { z: 2 } }, program: opaque.program };
    backend._visibleMeshes = [fading, opaque, roof, child, parent];
    backend._shadowMeshes = [opaque, fading, roof, hidden];
    backend._roofRaster = { signature: 'pending' };
    backend._sceneOrigin = { lat: 0, x: 0, y: 0 };
    backend._map = { options: { crs: { scale: () => 40075016.68557849 } }, project: point => point };
    const raster = { _tileZoom: 1, header: {}, _rasterTiles: new Map() };
    const meshes = [];
    assert.equal(prepareFrameMeshes(backend, [raster], 50, meshes), true);
    assert.deepEqual(meshes, [parent, child, opaque, fading]);
    assert.equal(fading._appearance, 0.5);
    assert.equal(roof._appearance, 0);
    assert.equal(backend.renderer.groundOverlap, true);
    assert.deepEqual(backend._shadowMeshes, [opaque, fading]);
    assert.equal(backend._visibleMeshes.length, 0);
    backend._visibleMeshes.push(fading, roof);
    meshes.length = 0;
    assert.equal(prepareFrameMeshes(backend, [], 100, meshes), false);
    assert.equal(fading._appearance, 1);
    assert.equal(roof._roofRevealed, true);
  } finally {
    if (previous === undefined) delete globalThis.GPUTextureUsage;
    else globalThis.GPUTextureUsage = previous;
  }
});

Then('roof and uniform stages preserve GPU uploads and resource reuse', async function () {
  const previous = Object.fromEntries(['L', 'DOMMatrix', 'DOMPoint', 'GPUBufferUsage', 'GPUTextureUsage']
    .map(name => [name, globalThis[name]]));
  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  globalThis.DOMMatrix = class {
    constructor(values = identity) { this.values = [...values]; }
    toFloat64Array() {
      const values = [...this.values];
      for (const [field, index] of [['m11', 0], ['m33', 10], ['m41', 12], ['m43', 14]]) {
        if (this[field] !== undefined) values[index] = this[field];
      }
      return values;
    }
  };
  globalThis.DOMPoint = class {
    constructor(x, y, z) { Object.assign(this, { x, y, z }); }
    matrixTransform() { return this; }
  };
  class Point {
    constructor(x, y) { Object.assign(this, { x, y }); }
    multiplyBy(value) { return new Point(this.x * value, this.y * value); }
    scaleBy(point) { return new Point(this.x * point.x, this.y * point.y); }
    subtract(point) { return new Point(this.x - point.x, this.y - point.y); }
  }
  globalThis.L = { Point, Util: { stamp: layer => layer.id }, Bounds: class {
    extend(point) {
      this.min = new Point(Math.min(this.min?.x ?? Infinity, point.x), Math.min(this.min?.y ?? Infinity, point.y));
      this.max = new Point(Math.max(this.max?.x ?? -Infinity, point.x), Math.max(this.max?.y ?? -Infinity, point.y));
    }
    isValid() { return Boolean(this.min && this.max); }
    getSize() { return this.max.subtract(this.min); }
  } };
  globalThis.GPUBufferUsage = { UNIFORM: 1, COPY_DST: 2 };
  globalThis.GPUTextureUsage = { TEXTURE_BINDING: 1, COPY_DST: 2, RENDER_ATTACHMENT: 4 };
  try {
    const uploads = [], copies = [], viewports = [], destroyed = [], textures = [], pipelines = [];
    const device = {
      createBuffer: descriptor => ({ ...descriptor, destroy() {} }),
      createTexture: descriptor => {
        const texture = { width: descriptor.size[0], height: descriptor.size[1],
          createView: () => ({}), destroy: () => destroyed.push(texture) };
        textures.push(texture);
        return texture;
      },
      createSampler: () => ({}), createShaderModule: () => ({}), createBindGroup: () => ({}),
      createRenderPipeline: () => {
        const pipeline = { getBindGroupLayout: () => ({}) };
        pipelines.push(pipeline);
        return pipeline;
      },
      createCommandEncoder: () => ({
        beginRenderPass: () => ({
          setPipeline() {}, setBindGroup() {}, draw() {}, end() {},
          setViewport: (...values) => viewports.push(values),
        }),
        finish: () => ({}),
      }),
      queue: {
        writeBuffer: (buffer, offset, data) => uploads.push(Array.from(data)),
        copyExternalImageToTexture: (...args) => copies.push(args), submit() {},
        onSubmittedWorkDone: () => Promise.resolve(),
      },
    };
    const image = {};
    const tile = { coords: { x: 0, y: 0, z: 0 }, done: true, request: new AbortController(), image,
      texture: { texture: { width: 256, height: 256, createView: () => ({}) }, image, uploaded: null } };
    const raster = { id: 1, _type: 'pmtiles', _rasterVersion: 1, _rasterTiles: new Map([['tile', tile]]),
      options: { opacity: 0.5, zIndex: 1 } };
    const backend = {
      renderer: { device }, camera: { viewMatrix: identity, projectionMatrix: identity },
      _sceneOrigin: { lat: 0 }, _layers: new Set([{ options: { roofTexture: true } }]),
      _map: { _layers: { raster }, getZoom: () => 0, getZoomScale: (to, from) => 2 ** (to - from),
        project: () => new Point(0, 0), options: { crs: { scale: () => 40075016.68557849 } } },
    };
    assert.deepEqual(updateRoofRaster(backend, 0), [raster]);
    assert.equal(textures.length, 1);
    assert.equal(copies.length, 1);
    assert.equal(uploads[0][0], 0.5);
    assert.deepEqual(viewports[0], [0, 0, 256, 256, 0, 1]);
    const atlas = backend._roofRaster;
    updateRoofRaster(backend, 10);
    assert.equal(backend._roofRaster, atlas);
    raster._rasterVersion++;
    raster._loadingTiles = 1;
    updateRoofRaster(backend, 25);
    assert.equal(backend._roofRaster, atlas, 'Throttle rebuilding while tiles are loading');
    updateRoofRaster(backend, 50);
    assert.notEqual(backend._roofRaster, atlas);
    assert.equal(backend._roofRaster.texture, atlas.texture);
    assert.equal(copies.length, 1, 'Retained images must not be uploaded again');
    assert.equal(pipelines.length, 1);

    prepareFrameUniforms(backend, [], [], { direction: [0, 1, 0], altitude: 20, tint: [1, 0.5, 0.25] });
    const buffer = backend.renderer.uniformBuffer, data = backend.renderer.uniformData;
    assert.deepEqual(Array.from(data.slice(0, 16)), identity);
    assert.deepEqual(Array.from(data.slice(32, 48)), backend._roofRaster.matrix);
    assert.deepEqual(Array.from(data.slice(48, 52)), [0, 1, 0, 1]);
    assert.deepEqual(Array.from(data.slice(52, 56)), [0, 1, 0, 0]);
    assert.deepEqual(Array.from(data.slice(56, 60)), [1, 0.5, 0.25, 0]);
    prepareFrameUniforms(backend, [], [], undefined);
    assert.equal(backend.renderer.uniformBuffer, buffer);
    assert.equal(backend.renderer.uniformData, data);
    assert.equal(backend.renderer.uniformSlot, 1);
    backend._layers.clear();
    assert.deepEqual(updateRoofRaster(backend, 100), []);
    assert.equal(backend._roofRaster, null);
    await Promise.resolve();
    assert.equal(destroyed.length, 1);
  } finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[name];
      else globalThis[name] = value;
    }
  }
});

Then('shadow stages preserve cache invalidation and draw ranges', function () {
  const world = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 20, 30, 1];
  const position = { buffer: {}, data: new Float32Array([0, 0, 0, 2, 4, 6]), needsUpdate: false };
  const mesh = { worldMatrix: world, _worldMatrixVersion: 1, geometry: {
    bounds: { min: [0, 0, 0], max: [2, 4, 6] },
    attributes: { position }, drawRange: { start: 1, count: 2 },
  } };
  const sunlight = { direction: [0, 1, 0] };
  const snapshot = { world: 1, geometry: mesh.geometry, start: 1, count: 2, appearance: 1 };
  const sun = { enabled: true, cache: { direction: [...sunlight.direction], meshes: new Map([[mesh, snapshot]]) } };
  assert.equal(shadowCacheMatches(sun, [mesh], sunlight), true);
  for (const [target, key, value] of [
    [sun, 'enabled', false], [sunlight.direction, 0, 1], [mesh, '_worldMatrixVersion', 2],
    [mesh.geometry.drawRange, 'start', 0], [mesh.geometry.drawRange, 'count', 3],
    [mesh, '_appearance', 0.5], [position, 'needsUpdate', true],
  ]) {
    const previous = target[key];
    target[key] = value;
    assert.equal(shadowCacheMatches(sun, [mesh], sunlight), false, key);
    target[key] = previous;
  }
  assert.equal(shadowCacheMatches(sun, [], sunlight), false);
  assert.deepEqual(shadowBounds([mesh]), { min: [10, 0, 30], max: [12, 24, 36] });
  const cached = mesh._shadowBounds;
  shadowBounds([mesh]);
  assert.equal(mesh._shadowBounds, cached);
  mesh.worldMatrix[12] = 15;
  mesh._worldMatrixVersion++;
  assert.deepEqual(shadowBounds([mesh]), { min: [15, 0, 30], max: [17, 24, 36] });

  const calls = [], writes = [], groups = [];
  const pass = {
    setPipeline() {}, setBindGroup: (...args) => calls.push(['bind', ...args]),
    setVertexBuffer() {}, setIndexBuffer() {}, draw: (...args) => calls.push(['draw', ...args]),
    drawIndexed: (...args) => calls.push(['indexed', ...args]), end() {},
  };
  const renderer = { sunlight: { texture: { createView() {} } }, uniformSlot: 1,
    uniformData: new Float32Array(256), uniformBuffer: {}, device: {
      createBindGroup: descriptor => { const group = { descriptor }; groups.push(group); return group; },
      queue: { writeBuffer: (...args) => writes.push(args) },
    } };
  mesh._appearance = 0.5;
  position.needsUpdate = true;
  const encoder = { beginRenderPass: () => pass };
  drawShadowMeshes({ renderer }, encoder, [mesh]);
  assert.equal(renderer.uniformSlot, 2);
  assert.deepEqual(Array.from(renderer.uniformData.slice(64, 80)), world);
  assert.equal(renderer.uniformData[99], 0.5);
  assert.equal(position.needsUpdate, false);
  assert.equal(writes.length, 1);
  assert.deepEqual(calls.at(-1), ['draw', 2, 1, 1, 0]);
  mesh.geometry.attributes.index = { buffer: {}, indexFormat: 'uint32' };
  drawShadowMeshes({ renderer }, encoder, [mesh]);
  assert.equal(groups.length, 1);
  assert.deepEqual(calls.at(-1), ['indexed', 2, 1, 1, 0, 0]);
  renderer.uniformBuffer = {};
  drawShadowMeshes({ renderer }, encoder, [mesh]);
  assert.equal(groups.length, 2, 'Bind groups must follow replacement frame buffers');
});
