import * as globals from '../fixtures/globals.js';


import assert from 'node:assert/strict';
import { Then, When } from '@cucumber/cucumber';

Then('configured models preserve external assets and can be detached and reattached', async function () {
  const png = await this.page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 2;
    const context = canvas.getContext('2d');
    context.fillStyle = '#808080'; context.fillRect(0, 0, 2, 2);
    return canvas.toDataURL().split(',')[1];
  });
  const vertices = new Float32Array([-1, -1, 0, 1, -1, 0, 0, 1, 0]);
  const description = {
    asset: { version: '2.0' },
    buffers: [{ uri: 'vertices.bin', byteLength: 60 }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 },
      { buffer: 0, byteOffset: 36, byteLength: 24 }],
    accessors: [{ bufferView: 0, componentType: 5126, type: 'VEC3', count: 3 },
      { bufferView: 1, componentType: 5126, type: 'VEC2', count: 3 }],
    images: [{ uri: 'texture.png' }], textures: [{ source: 0 }],
    materials: [{
      pbrMetallicRoughness: { baseColorFactor: [0.6, 0.3, 0.1, 1], metallicFactor: 0.5,
        roughnessFactor: 0.4, baseColorTexture: { index: 0 }, metallicRoughnessTexture: { index: 0 } },
      emissiveTexture: { index: 0 }, emissiveFactor: [0.1, 0.2, 0.3],
      occlusionTexture: { index: 0, strength: 0.6 },
    }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0, TEXCOORD_0: 1 }, material: 0 }] }],
    nodes: [{ mesh: 0 }, { mesh: 0, translation: [3, 0, 0] }], scenes: [{ nodes: [0, 1] }],
  };
  await this.context.route('**/manual/model.gltf', route => route.fulfill({
    contentType: 'application/json', body: JSON.stringify(description),
  }));
  await this.context.route('**/manual/vertices.bin', route => route.fulfill({
    body: Buffer.concat([Buffer.from(vertices.buffer), Buffer.from(new Float32Array([0, 0, 1, 0, 0.5, 1]).buffer)]),
    contentType: 'application/octet-stream',
  }));
  await this.context.route('**/manual/texture.png', route => route.fulfill({
    contentType: 'image/png', body: Buffer.from(png, 'base64'),
  }));
  const result = await this.page.evaluate(async () => {
    const url = new URL('manual/model.gltf', document.baseURI).href;
    const layer = new L.Layer({ source: { type: 'vector', url: url } });
    let ready = false;
    const loaded = nativeChecks.ready(layer).then(() => { ready = true; });
    await new Promise(requestAnimationFrame);
    const waitsForMap = !ready && !globals.sceneByLayer.get(layer).model && !globals.sceneByLayer.get(layer).renderer;
    layer.addTo(test3d.map);
    await loaded;
    const model = globals.sceneByLayer.get(layer).model;
    const meshes = [];
    nativeChecks.graph.traverse(model, node => { if (node.geometry) meshes.push(node); });
    const mesh = meshes[0];
    const independent = meshes.length === 2 &&
      mesh.geometry.attributes.position.data !== meshes[1].geometry.attributes.position.data &&
      mesh.geometry.attributes.position.buffer !== meshes[1].geometry.attributes.position.buffer;
    const secondX = meshes[1].geometry.attributes.position.data[0];
    mesh.geometry.attributes.position.data[0] = 123;
    const retainedGeometry = meshes[1].geometry.attributes.position.data[0] === secondX;
    mesh.geometry.attributes.position.data[0] = secondX;
    const renderer = globals.sceneByLayer.get(layer).renderer;
    const style = mesh.program._layerMaterial, device = renderer.device;
    const fallback = renderer.roofFallbackTexture;
    const fallbackNeedsNoImage = fallback.image === null && fallback.uploaded === null &&
      fallback.texture.width === 1 && fallback.texture.height === 1;
    const attached = model.parent === globals.sceneByLayer.get(layer).root && !('ready' in layer);
    const maps = style.baseTexture.format === 'rgba8unorm-srgb' &&
      style.metalTexture.format === 'rgba8unorm' &&
      style.baseTexture === style.emissiveTexture && style.metalTexture === style.occlusionTexture &&
      style.baseTexture !== style.metalTexture;
    const factors = style.color.join() === '0.6,0.3,0.1' && style.metallic === 0.5 &&
      style.roughness === 0.4 && style.occlusionStrength === 0.6;
    const normals = [...mesh.geometry.attributes.normal.data].join() === '0,0,1,0,0,1,0,0,1';
    nativeChecks.graph.setParent(model, globals.sceneByLayer.get(layer).root);
    nativeChecks.render.update(layer);
    nativeChecks.render.render(globals.sceneByLayer.get(layer)._shared);
    const uploaded = style.baseTexture.uploaded === style.baseTexture.image &&
      style.metalTexture.uploaded === style.metalTexture.image;
    const program = mesh.program;
    nativeChecks.graph.setParent(model, null);
    nativeChecks.render.update(layer);
    const retained = !model.parent && mesh.program === program && program.device === device;
    nativeChecks.graph.setParent(model, globals.sceneByLayer.get(layer).root);
    nativeChecks.render.update(layer);
    const reattached = model.parent === globals.sceneByLayer.get(layer).root;
    layer.remove();
    return { waitsForMap, attached, maps, factors, normals, independent, retainedGeometry,
      fallbackNeedsNoImage, uploaded, retained, reattached };
  });
  for (const [name, value] of Object.entries(result)) {
    assert.equal(value, true, name);
  }
  delete description.meshes[0].primitives[0].attributes.TEXCOORD_0;
  await this.context.route('**/manual/no-uv.gltf', route => route.fulfill({
    contentType: 'application/json', body: JSON.stringify(description),
  }));
  const missingUV = await this.page.evaluate(async () => {
    const layer = new L.Layer({ source: { type: 'vector', url: 'manual/no-uv.gltf' } }).addTo(test3d.map);
    const error = await nativeChecks.ready(layer).then(() => null, error => error);
    const result = error?.message === 'Textured model mesh requires UV coordinates' &&
      !globals.sceneByLayer.get(layer).model && globals.sceneByLayer.get(layer).root.children.length === 0;
    layer.remove();
    return result;
  });
  assert.equal(missingUV, true, 'Missing UVs are rejected before allocating mesh resources');
});

Then('native triangulation and glTF decoding preserve geometry without library requests', async function () {
  await this.context.route('**/accessors.gltf?*', route => route.fulfill({
    contentType: 'application/json', body: new URL(route.request().url()).searchParams.get('fixture'),
  }));
  const result = await this.page.evaluate(async () => {
    const layer = new L.Layer({ source: { type: 'vector' } }).addTo(test3d.map);
    await nativeChecks.ready(layer);
    const square = (x, y, size) => [{ x, y }, { x: x + size, y },
      { x: x + size, y: y + size }, { x, y: y + size }];
    const shapes = [
      [square(0, 0, 10), [square(1, 1, 2), square(6, 6, 2)], 92],
      [[{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 2 }, { x: 2, y: 2 },
        { x: 2, y: 6 }, { x: 0, y: 6 }], [], 20],
      [[{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 0 }, { x: 6, y: 0 },
        { x: 6, y: 6 }, { x: 0, y: 6 }], [], 36],
    ];
    let triangulated = true;
    for (const [contour, holes, expected] of shapes) {
      for (const reverse of [false, true]) {
        const outer = reverse ? [...contour].reverse() : contour;
        const inner = reverse ? holes.map(hole => [...hole].reverse()) : holes;
        const points = [outer, ...inner].flat();
        const triangles = nativeChecks.geometry.triangulate(outer, inner);
        const area = triangles.reduce((sum, [a, b, c]) => {
          const [p, q, r] = [points[a], points[b], points[c]];
          return sum + Math.abs((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)) / 2;
        }, 0);
        if (Math.abs(area - expected) > 1e-8) triangulated = false;
      }
    }
    let invalidRejected = false;
    try { nativeChecks.geometry.triangulate([{ x: 0, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }, { x: 2, y: 0 }]); }
    catch (error) { invalidRejected = error instanceof Error; }
    // Interleaved positions, normalized byte normals, and a sparse position override.
    const buffer = new ArrayBuffer(72);
    new Float32Array(buffer, 0, 12).set([0, 0, 0, 99, 1, 0, 0, 99, 0, 1, 0, 99]);
    new Uint8Array(buffer, 48, 9).set([0, 0, 255, 0, 0, 255, 0, 0, 255]);
    new Uint8Array(buffer, 57, 1)[0] = 1;
    new Float32Array(buffer, 60, 3).set([2, 0, 0]);
    const description = {
      buffers: [{ binary: buffer }],
      bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 48, byteStride: 16 },
        { buffer: 0, byteOffset: 48, byteLength: 9 }, { buffer: 0, byteOffset: 57, byteLength: 1 },
        { buffer: 0, byteOffset: 60, byteLength: 12 }],
      accessors: [{ bufferView: 0, componentType: 5126, type: 'VEC3', count: 3,
        sparse: { count: 1, indices: { bufferView: 2, componentType: 5121 }, values: { bufferView: 3 } } },
      { bufferView: 1, componentType: 5121, type: 'VEC3', count: 3, normalized: true }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1 } }] }],
      materials: [], nodes: [{ mesh: 0, translation: [1, 2, 3] }, { mesh: 0, translation: [4, 5, 6] }],
      scenes: [{ nodes: [0, 1] }], scene: 0,
    };
    description.asset = { version: '2.0' };
    description.buffers = [{
      byteLength: buffer.byteLength,
      uri: `data:application/octet-stream;base64,${btoa(String.fromCharCode(...new Uint8Array(buffer)))}`,
    }];
    const url = new URL('accessors.gltf', document.baseURI);
    url.searchParams.set('fixture', JSON.stringify(description));
    const configured = new L.Layer({ source: { type: 'vector', url: url.href } }).addTo(test3d.map);
    await nativeChecks.ready(configured);
    const model = globals.sceneByLayer.get(configured).model;
    const [first, second] = model.children.map(node => node.children[0]);
    const decoded = [...first.geometry.attributes.position.data].join() === '0,0,0,2,0,0,0,1,0' &&
      [...first.geometry.attributes.normal.data].join() === '0,0,1,0,0,1,0,0,1' &&
      first !== second && first.geometry !== second.geometry;
    nativeChecks.graph.updateWorldMatrix(first.parent);
    nativeChecks.graph.updateWorldMatrix(second.parent);
    const transformed = (() => {
      const point = new DOMPoint(2, 0, 0, 1).matrixTransform(new DOMMatrix(first.worldMatrix));
      return [point.x / point.w, point.y / point.w, point.z / point.w].join() === '3,2,3';
    })();
    for (const mesh of [first, second]) {
      for (const attribute of Object.values(mesh.geometry.attributes)) attribute.buffer.destroy();
      mesh.program.pipelineCache.clear();
    }
    configured.remove();
    layer.remove();
    return { triangulated, invalidRejected, decoded, transformed };
  });
  for (const [name, value] of Object.entries(result)) assert.equal(value, true, name);
});

Then('a configured 3D model loads with its transforms and attribution', { timeout: 30000 }, async function () {
  const result = await this.page.evaluate(async () => {
    const map = test3d.map;
    const layer = new L.Layer({ source: { type: 'vector',
      center: [48.8582601, 2.29449985],
      url: '../examples/data/eiffel-tower.glb',
      rotation: [0, 0.8, 0],
      scale: [1.02, 1, 1.01],
      tooltip: feature => feature.model === globals.sceneByLayer.get(layer).model ? 'Eiffel Tower' : 'Unexpected model' },
      attribution: 'Test model attribution' }).addTo(map);
    await nativeChecks.ready(layer);
    const geometry = nativeChecks.bounds(globals.sceneByLayer.get(layer).model, layer);
    const centered = globals.sceneByLayer.get(layer).location.equals([48.8582601, 2.29449985]);
    const attached = globals.sceneByLayer.get(layer).model.parent === globals.sceneByLayer.get(layer).root;
    const rotation = globals.sceneByLayer.get(layer).model.rotation[1];
    const scale = [...globals.sceneByLayer.get(layer).model.scale];
    const attribution = map.attributionControl.getContainer().textContent.includes('Test model attribution');
    nativeChecks.render.render(globals.sceneByLayer.get(layer)._shared);
    let texturedMeshes = 0, transparentMeshes = 0;
    nativeChecks.graph.traverse(globals.sceneByLayer.get(layer).model, mesh => {
      if (!mesh.program) return;
      const style = mesh.program._layerMaterial;
      if (style.baseTexture) {
        if (!mesh.geometry.attributes.uv || !style.baseTexture.image.width) {
          throw new Error('Model texture or UVs are missing');
        }
        texturedMeshes++;
      }
      if (style.alphaMode === 'BLEND' && mesh.program.transparent && !mesh.program.depthWrite) transparentMeshes++;
    });
    const texturedPixels = await nativeChecks.pixels(layer);
    const textures = new Map();
    nativeChecks.graph.traverse(globals.sceneByLayer.get(layer).model, mesh => {
      const texture = mesh.program?.uniforms.baseTexture?.value;
      if (!texture || textures.has(texture)) return;
      textures.set(texture, texture.image);
      const canvas = document.createElement('canvas');
      canvas.width = texture.image.width;
      canvas.height = texture.image.height;
      canvas.getContext('2d').fillStyle = 'white';
      canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);
      texture.image = canvas;
      texture.needsUpdate = true;
    });
    const plainPixels = await nativeChecks.pixels(layer);
    for (const [texture, image] of textures) { texture.image = image; texture.needsUpdate = true; }
    nativeChecks.render.render(globals.sceneByLayer.get(layer)._shared);
    let changedPixels = 0;
    for (let i = 0; i < texturedPixels.length; i += 4) {
      if (Math.abs(texturedPixels[i] - plainPixels[i]) +
          Math.abs(texturedPixels[i + 1] - plainPixels[i + 1]) +
          Math.abs(texturedPixels[i + 2] - plainPixels[i + 2]) > 10) changedPixels++;
    }
    const realisticMaterials = texturedMeshes > 0 && transparentMeshes > 0 && changedPixels > 100;
    const programs = new Map();
    let linearTextures = true;
    nativeChecks.graph.traverse(globals.sceneByLayer.get(layer).model, mesh => {
      if (!mesh.program) return;
      programs.set(mesh, mesh.program);
      const style = { ...mesh.program._layerMaterial, alphaMode: 'BLEND', doubleSided: true };
      mesh.program = nativeChecks.gpu.createProgram(layer, style);
      if (style.baseTexture && style.baseTexture.format !== 'rgba8unorm-srgb') {
        linearTextures = false;
      }
    });
    nativeChecks.render.render(globals.sceneByLayer.get(layer)._shared);
    const list = [];
    nativeChecks.graph.traverse(globals.sceneByLayer.get(layer).model, mesh => {
      if (mesh.program?.transparent && mesh._visibleInFrame) list.push(mesh);
    });
    list.sort(nativeChecks.render.compareMeshes);
    const depths = list.map(mesh => {
      const world = new DOMPoint(...mesh.geometry.bounds.center, 1).matrixTransform(new DOMMatrix(mesh.worldMatrix));
      const point = world.matrixTransform(new DOMMatrix(globals.sceneByLayer.get(layer).camera.projectionViewMatrix));
      return point.z / point.w;
    });
    const transparentOrder = depths.length > 1 && depths.every((depth, i) =>
      !i || depths[i - 1] >= depth) && Math.max(...depths) > Math.min(...depths);
    const doubleSidedPasses = list.length > 0 && list.every(mesh =>
      mesh.program._layerMaterial.doubleSided && !mesh.program.depthWrite && mesh.program.cullMode === 'none');
    for (const [mesh, program] of programs) {
      mesh.program.pipelineCache.clear();
      mesh.program = program;
    }
    nativeChecks.render.render(globals.sceneByLayer.get(layer)._shared);
    const probe = nativeChecks.mesh(layer, {
      position: [-20, 2, -20, 20, 2, -20, 0, 2, 20, -20, 0, -20, 20, 0, -20, 0, 0, 20],
      normal: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
      color: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    }, nativeChecks.gpu.createProgram(layer, { vertexColors: true, alphaMode: 'MASK', doubleSided: true }));
    const pitch = testOperations.getPitch(map), bearing = testOperations.getBearing(map);
    globals.sceneByLayer.get(layer).model.visible = false;
    testOperations.setPitch(map, 0); testOperations.setBearing(map, 0); map.setView(globals.sceneByLayer.get(layer).location, 17, { animate: false });
    nativeChecks.graph.setParent(probe, globals.sceneByLayer.get(layer).root);
    nativeChecks.render.update(layer);
    const sample = () => nativeChecks.pixels(layer,
      Math.floor(globals.sceneByLayer.get(layer).renderer.canvas.width / 2), Math.floor(globals.sceneByLayer.get(layer).renderer.canvas.height / 2), 1, 1);
    const firstPixel = await sample();
    for (const attribute of Object.values(probe.geometry.attributes)) {
      const first = attribute.data.slice(0, 9);
      attribute.data.copyWithin(0, 9);
      attribute.data.set(first, 9);
      globals.sceneByLayer.get(layer).renderer.device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
    }
    const secondPixel = await sample();
    const depthOrderIndependent = firstPixel.every((value, index) => value === secondPixel[index]) &&
      firstPixel[0] > firstPixel[2] && firstPixel[3] === 255;
    nativeChecks.gpu.disposeMesh(layer, probe);
    globals.sceneByLayer.get(layer).model.visible = true;
    testOperations.setPitch(map, pitch); testOperations.setBearing(map, bearing);
    nativeChecks.render.render(globals.sceneByLayer.get(layer)._shared);
    const container = map.getContainer();
    const rect = container.getBoundingClientRect();
    let position;
    nativeChecks.graph.traverse(globals.sceneByLayer.get(layer).model, object => {
      if (position || !object.geometry) return;
      const vertices = object.geometry.attributes.position;
      for (let i = 0; i < Math.min(vertices.count, 90); i++) {
        const offset = i * vertices.size;
        const world = new DOMPoint(vertices.data[offset], vertices.data[offset + 1], vertices.data[offset + 2], 1)
          .matrixTransform(new DOMMatrix(object.worldMatrix));
        const point = world.matrixTransform(new DOMMatrix(globals.sceneByLayer.get(layer).camera.projectionViewMatrix));
        const x = point.x / point.w, y = point.y / point.w;
        if (Math.abs(x) >= 1 || Math.abs(y) >= 1) continue;
        const candidate = { clientX: Math.floor(rect.left + (x + 1) * rect.width / 2),
          clientY: Math.floor(rect.top + (1 - y) * rect.height / 2) };
        if (nativeChecks.picking.findFeature(layer, candidate)?.model === globals.sceneByLayer.get(layer).model) {
          position = candidate;
          break;
        }
      }
    });
    if (!position) throw new Error('No visible model mesh was picked');
    const hit = nativeChecks.picking.findFeature(layer, position);
    const material = hit.mesh.program;
    container.dispatchEvent(new MouseEvent('mousemove', position));
    const tooltip = globals.sceneByLayer.get(layer)._tooltip;
    const modelTooltip = !tooltip.hidden && tooltip.textContent === 'Eiffel Tower' &&
      container.style.cursor === 'pointer' && globals.sceneByLayer.get(layer).hoveredFeature.mesh === hit.mesh &&
      hit.mesh.program === material && !globals.sceneByLayer.get(layer).highlightedFeature;
    container.dispatchEvent(new MouseEvent('click', position));
    for (const type of ['mouseout', 'mouseleave']) {
      container.dispatchEvent(new MouseEvent(type, { relatedTarget: document.body }));
    }
    const hoverOnly = tooltip.hidden && container.style.cursor !== 'pointer' && !globals.sceneByLayer.get(layer).hoveredFeature;
    container.dispatchEvent(new MouseEvent('mousemove', position));
    layer.remove();
    const tooltipRemoved = !tooltip.isConnected && container.style.cursor !== 'pointer';
    const attributionRemoved = !map.attributionControl.getContainer().textContent.includes('Test model attribution');
    layer.addTo(map);
    await globals.sceneByLayer.get(layer)._added.promise;
    const retained = globals.sceneByLayer.get(layer).model.parent === globals.sceneByLayer.get(layer).root;
    const tooltipRecreated = globals.sceneByLayer.get(layer)._tooltip !== tooltip && globals.sceneByLayer.get(layer)._tooltip.hidden;
    nativeChecks.render.render(globals.sceneByLayer.get(layer)._shared);
    const restoredHit = nativeChecks.picking.findFeature(layer, position);
    const restoredGPU = restoredHit?.model === globals.sceneByLayer.get(layer).model &&
      restoredHit.mesh.geometry.device === globals.sceneByLayer.get(layer).renderer.device &&
      restoredHit.mesh.program.device === globals.sceneByLayer.get(layer).renderer.device;
    let restoredTextures = true;
    nativeChecks.graph.traverse(globals.sceneByLayer.get(layer).model, mesh => {
      const texture = mesh.program?.uniforms.baseTexture?.value;
      if (texture && texture.device !== globals.sceneByLayer.get(layer).renderer.device) restoredTextures = false;
    });
    layer.remove();
    return { centered, attached, rotation, scale, attribution, attributionRemoved, retained,
      modelTooltip, hoverOnly, tooltipRemoved, tooltipRecreated, restoredGPU, restoredTextures, realisticMaterials,
      depthOrderIndependent, linearTextures, transparentOrder, doubleSidedPasses,
      height: geometry.max[1] - geometry.min[1] };
  });
  assert.ok(result.height > 299 && result.height < 301);
  assert.equal(result.rotation, 0.8);
  assert.deepEqual(result.scale, [1.02, 1, 1.01]);
  for (const name of ['centered', 'attached', 'attribution', 'attributionRemoved', 'retained',
    'modelTooltip', 'hoverOnly', 'tooltipRemoved', 'tooltipRecreated', 'restoredGPU',
    'restoredTextures', 'realisticMaterials', 'depthOrderIndependent', 'linearTextures',
    'transparentOrder', 'doubleSidedPasses']) {
    assert.equal(result[name], true, name);
  }
});

When('I load a configured 3D model with {string}', async function (failure) {
  let body, status = 200;
  if (failure === 'HTTP error') { status = 404; body = 'Not found'; }
  else if (failure === 'unsupported glTF') {
    body = JSON.stringify({ asset: { version: '2.0' }, animations: [{}] });
  } else {
    body = Buffer.alloc(24);
    body.writeUInt32LE(0x46546c67, 0);
    body.writeUInt32LE(2, 4);
    body.writeUInt32LE(24, 8);
    body.writeUInt32LE(32, 12);
    body.writeUInt32LE(0x4e4f534a, 16);
  }
  await this.context.route('**/test/invalid-model.glb', route => route.fulfill({
    status, body, contentType: 'application/octet-stream',
  }));
  this.invalid3d = await this.page.evaluate(async () => {
    const layer = new L.Layer({ source: { type: 'vector', url: 'invalid-model.glb' } }).addTo(test3d.map);
    let emitted;
    layer.on('error', event => { emitted = event.error; });
    const error = await nativeChecks.ready(layer).then(() => null, error => error);
    const result = { rejected: error instanceof Error, sameError: error === emitted,
      message: error?.message, noGeometry: !globals.sceneByLayer.get(layer).model && globals.sceneByLayer.get(layer).root.children.length === 0 };
    layer.remove();
    return { ...result, removed: !test3d.map.hasLayer(layer),
      noCanvas: !document.querySelector('.leaflet-3d') };
  });
});

Then('3D initialization emits {string} as an error', function (message) {
  assert.equal(this.invalid3d.rejected, true);
  assert.equal(this.invalid3d.sameError, true);
  assert.equal(this.invalid3d.message, message);
  assert.equal(this.invalid3d.removed, true);
  assert.equal(this.invalid3d.noCanvas, true);
});

Then('the failed model has no attached geometry', function () {
  assert.equal(this.invalid3d.noGeometry, true);
});

When('I hover and click the Eiffel Tower in the 3D example', { timeout: 30000 }, async function () {
  await this.page.waitForFunction(() => {
    const tower = layers._layers.find(entry => globals.sceneByLayer.get(entry.layer).model)?.layer;
    if (!tower || !globals.sceneByLayer.get(tower).renderer) return false;
    let visible = false;
    nativeChecks.graph.traverse(globals.sceneByLayer.get(tower).model, mesh => {
      if (mesh.geometry && mesh.visible && mesh._appearance > 0) visible = true;
    });
    return visible;
  });
  const target = await this.page.evaluate(() => {
    const tower = layers._layers.find(entry => globals.sceneByLayer.get(entry.layer).model).layer;
    nativeChecks.render.render(globals.sceneByLayer.get(tower)._shared);
    const rect = map.getContainer().getBoundingClientRect();
    let target;
    nativeChecks.graph.traverse(globals.sceneByLayer.get(tower).model, mesh => {
      if (target || !mesh.geometry) return;
      const { position, index } = mesh.geometry.attributes;
      const count = index?.count || position.count;
      for (let i = 0; i < count; i += 3) {
        const point = [0, 0, 0];
        for (let j = 0; j < 3; j++) {
          const offset = (index ? index.data[i + j] : i + j) * position.size;
          for (let axis = 0; axis < 3; axis++) point[axis] += position.data[offset + axis];
        }
        const world = new DOMPoint(...point.map(v => v / 3), 1).matrixTransform(new DOMMatrix(mesh.worldMatrix));
        const projected = world.matrixTransform(new DOMMatrix(globals.sceneByLayer.get(tower).camera.projectionViewMatrix));
        const x = projected.x / projected.w, y = projected.y / projected.w;
        if (Math.abs(x) > 0.7 || Math.abs(y) > 0.7) continue;
        const candidate = {
          x: Math.round(rect.left + (x + 1) * rect.width / 2),
          y: Math.round(rect.top + (1 - y) * rect.height / 2),
        };
        const event = { clientX: candidate.x, clientY: candidate.y };
        const hit = nativeChecks.picking.findFeature(tower, event);
        if (hit?.model !== globals.sceneByLayer.get(tower).model ||
            nativeChecks.picking.raycast(tower, event, globals.sceneByLayer.get(tower).scene.children, true)[0]?.object !== hit.mesh) continue;
        const crs = map.options.crs;
        const origin = crs.project(globals.sceneByLayer.get(globals.sceneByLayer.get(tower)._shared)._sceneOrigin);
        const metres = Math.cos(globals.sceneByLayer.get(globals.sceneByLayer.get(tower)._shared)._sceneOrigin.lat * Math.PI / 180);
        target = { ...candidate, center: crs.unproject(new L.Point(
          origin.x + hit.point[0] / metres, origin.y - hit.point[2] / metres)),
        zoom: map.getZoom(), bearing: testOperations.getBearing(map), pitch: testOperations.getPitch(map) };
        break;
      }
    });
    if (!target) throw new Error('No visible tower triangle available for a mouse click');
    return target;
  });
  await this.page.mouse.move(target.x, target.y);
  await this.page.waitForFunction(() => {
    const tower = layers._layers.find(entry => globals.sceneByLayer.get(entry.layer).model).layer;
    return globals.sceneByLayer.get(tower)._tooltip && !globals.sceneByLayer.get(tower)._tooltip.hidden &&
      globals.sceneByLayer.get(tower).hoveredFeature?.model === globals.sceneByLayer.get(tower).model;
  });
  this.exampleTowerHover = await this.page.evaluate(() => {
    const tower = layers._layers.find(entry => globals.sceneByLayer.get(entry.layer).model).layer;
    return { text: globals.sceneByLayer.get(tower)._tooltip.textContent, role: globals.sceneByLayer.get(tower)._tooltip.getAttribute('role'),
      cursor: map.getContainer().style.cursor };
  });
  const beforeClick = await this.page.evaluate(() => {
    window.exampleClickMovements = 0;
    map.on('movestart zoomstart', () => window.exampleClickMovements++);
    return map.getCenter();
  });
  await this.page.mouse.click(target.x, target.y);
  await this.page.evaluate(() => new Promise(requestAnimationFrame));
  this.exampleTowerZoom = await this.page.evaluate(() => {
    const tower = layers._layers.find(entry => globals.sceneByLayer.get(entry.layer).model).layer;
    return { zoom: map.getZoom(), center: map.getCenter(), movements: window.exampleClickMovements,
      clicked: globals.sceneByLayer.get(tower).hoveredFeature?.model === globals.sceneByLayer.get(tower).model,
      bearing: testOperations.getBearing(map), pitch: testOperations.getPitch(map),
      canvases: document.querySelectorAll('.leaflet-3d').length };
  });
  this.exampleTowerCenter = beforeClick;
  this.exampleTowerTarget = target;
  await this.page.mouse.move(810, 610);
  await this.page.waitForFunction(() => {
    const tower = layers._layers.find(entry => globals.sceneByLayer.get(entry.layer).model).layer;
    return globals.sceneByLayer.get(tower)._tooltip.hidden && !globals.sceneByLayer.get(tower).hoveredFeature &&
      map.getContainer().style.cursor !== 'pointer';
  });
});

Then('the tower information is shown without moving the map or pinning the tooltip', function () {
  const hover = this.exampleTowerHover;
  for (const text of ['Eiffel Tower', '330 m', '300 m structure', '1889', 'Gustave Eiffel', 'Champ de Mars']) {
    assert.ok(hover.text.includes(text), text);
  }
  assert.equal(hover.role, 'tooltip');
  assert.equal(hover.cursor, 'pointer');
  const zoom = this.exampleTowerZoom, target = this.exampleTowerTarget;
  assert.equal(zoom.zoom, target.zoom, 'Clicking does not change the zoom');
  assert.deepEqual(zoom.center, this.exampleTowerCenter, 'Clicking does not move the map');
  assert.equal(zoom.movements, 0);
  assert.equal(zoom.clicked, true);
  assert.equal(zoom.bearing, target.bearing);
  assert.equal(zoom.pitch, target.pitch);
  assert.equal(zoom.canvases, 1);
});

When('I inspect the Eiffel Tower 3D model for {string}', { timeout: 30000 }, async function (check) {
  assert.ok(['geographic camera', 'animated zoom', 'rendering lifecycle'].includes(check), check);
  await this.page.evaluate(() => map.setZoom(15, { animate: false }));
  await this.page.waitForFunction(() =>
    Object.values(map._layers).some(layer => globals.sceneByLayer.get(layer).model && globals.sceneByLayer.get(layer).renderer),
  null, { timeout: 30000 });
  await this.page.waitForFunction(() => globals.sceneByLayer.get(globals.cameraByMap.get(map)._terrain3D)?._terrainReady);
  await this.page.waitForFunction(() => map.getZoom() === 15 && Math.abs(testOperations.getPitch(map) - 45) < 0.01);
  this.eiffel = await this.page.evaluate(async check => {
    let tower, eiffel;
    map.eachLayer(layer => {
      if (globals.sceneByLayer.get(layer).renderer && !globals.sceneByLayer.get(layer).model) tower = layer;
      if (globals.sceneByLayer.get(layer).model) eiffel = layer;
    });
    if (check === 'geographic camera') {
      const backend = tower;
      const bounds = nativeChecks.bounds(globals.sceneByLayer.get(eiffel).model, backend);
      const height = bounds.max[1] - bounds.min[1];
      const topClips = [bounds.min[0], bounds.max[0]].flatMap(x =>
        [bounds.min[2], bounds.max[2]].map(z => {
          const clip = new DOMPoint(x, bounds.max[1], z, 1)
            .matrixTransform(new DOMMatrix(globals.sceneByLayer.get(tower).camera.projectionViewMatrix));
          return clip.y / clip.w;
        }));
      const baseClips = [bounds.min[0], bounds.max[0]].flatMap(x =>
        [bounds.min[2], bounds.max[2]].map(z => {
          const clip = new DOMPoint(x, bounds.min[1], z, 1)
            .matrixTransform(new DOMMatrix(globals.sceneByLayer.get(tower).camera.projectionViewMatrix));
          return clip.y / clip.w;
        }));
      const topClipY = Math.max(...topClips);
      const baseClipY = Math.min(...baseClips);
      let meshes = 0;
      nativeChecks.graph.traverse(globals.sceneByLayer.get(eiffel).model, object => { if (object.geometry) meshes++; });
      const errors = [];
      // Outer ground corners: OSM nodes 33388343, 33388336, 33388327 and 33388350.
      const feet = [
        { local: [60.118438720703125, 0, -60.605037689208984], latlng: [48.8590453, 2.2944834] },
        { local: [60.11847686767578, 0, 60.60499954223633], latlng: [48.8582718, 2.2956897] },
        { local: [-60.118438720703125, 0, 60.605037689208984], latlng: [48.8574753, 2.2945144] },
        { local: [-60.11847686767578, 0, -60.60499954223633], latlng: [48.8582480, 2.2933119] }
      ];
      const [northwest, northeast, southeast, southwest] = feet.map(({ latlng }) => latlng);
      nativeChecks.graph.updateWorldMatrix(globals.sceneByLayer.get(globals.sceneByLayer.get(backend)._shared).scene);
      const terrain = globals.cameraByMap.get(map)._terrain3D, crs = map.options.crs;
      const sceneOrigin = crs.project(globals.sceneByLayer.get(globals.sceneByLayer.get(backend)._shared)._sceneOrigin);
      const metres = Math.cos(globals.sceneByLayer.get(globals.sceneByLayer.get(backend)._shared)._sceneOrigin.lat * Math.PI / 180);
      const pixelScale = crs.scale(globals.sceneByLayer.get(terrain)._terrainZoom);
      const terrainConformanceErrors = [];
      nativeChecks.graph.traverse(globals.sceneByLayer.get(eiffel).model, object => {
        const geometry = object.geometry, positions = geometry?.attributes.position.data;
        const base = geometry?._terrainBasePositions, world = object.worldMatrix;
        if (!base) return;
        for (let i = 0; i < positions.length; i += 3) {
          const baseY = world[1] * base[i] + world[5] * base[i + 1] + world[9] * base[i + 2] + world[13];
          if (Math.abs(baseY - globals.sceneByLayer.get(eiffel).root.position[1]) > 0.05) continue;
          const x = world[0] * positions[i] + world[4] * positions[i + 1] + world[8] * positions[i + 2] + world[12];
          const y = world[1] * positions[i] + world[5] * positions[i + 1] + world[9] * positions[i + 2] + world[13];
          const z = world[2] * positions[i] + world[6] * positions[i + 1] + world[10] * positions[i + 2] + world[14];
          const point = crs.transformation.transform(
            new L.Point(sceneOrigin.x + x / metres, sceneOrigin.y - z / metres), pixelScale);
          const elevation = nativeChecks.getElevation(terrain, point);
          if (Number.isFinite(elevation)) terrainConformanceErrors.push(Math.abs(y - elevation));
        }
      });
      const terrainConformanceError = Math.max(...terrainConformanceErrors);
      const footprintErrors = [];
      let maskDepthWrite = eiffel.options.alphaMode === 'MASK' && eiffel.options.terrainConform;
      for (const [zoom, pitch, bearing] of [[17, 0, 0], [17, 45, 30], [18, 60, 135], [16, 80, 270]]) {
        map.setView(globals.sceneByLayer.get(tower).location, zoom, { animate: false });
        testOperations.setPitch(map, pitch);
        testOperations.setBearing(map, bearing);
        map.panBy([35, -20], { animate: false });
        await new Promise(requestAnimationFrame);
        const scale = map.options.crs.scale(zoom) /
          (40075016.68557849 * Math.cos(globals.sceneByLayer.get(tower).location.lat * Math.PI / 180));
        const origin = map.project(globals.sceneByLayer.get(tower).location).subtract(map.getPixelOrigin());
        const size = map.getSize();
        const ground = nativeChecks.getElevation(globals.cameraByMap.get(map)._terrain3D, map.getCenter()) ?? 0;
        for (const [x, z] of [[-40, -40], [0, 0], [40, 40]]) {
          const expected = map.layerPointToContainerPoint(origin.add([x * scale, z * scale]));
          const clip = new DOMPoint(x, ground, z, 1).matrixTransform(new DOMMatrix(globals.sceneByLayer.get(tower).camera.projectionViewMatrix));
          const ndcX = clip.x / clip.w, ndcY = clip.y / clip.w;
          const actual = new L.Point((ndcX + 1) * size.x / 2, (1 - ndcY) * size.y / 2);
          errors.push(actual.distanceTo(expected));
        }
        for (const foot of feet) {
          const transformed = new DOMPoint(...foot.local, 1).matrixTransform(new DOMMatrix(globals.sceneByLayer.get(eiffel).model.worldMatrix));
          const world = [transformed.x / transformed.w, transformed.y / transformed.w, transformed.z / transformed.w];
          const geographic = map.unproject(map.project(globals.sceneByLayer.get(tower).location).add([world[0] * scale, world[2] * scale]), zoom);
          footprintErrors.push(geographic.distanceTo(new L.LatLng(...foot.latlng)));
        }
      }
      nativeChecks.graph.traverse(globals.sceneByLayer.get(eiffel).model, object => {
        if (object.program && (object.program._layerMaterial.alphaMode !== 'MASK' || !object.program.depthWrite)) {
          maskDepthWrite = false;
        }
      });

      return { height, meshes, errors, footprintErrors, topClipY, baseClipY, terrainConformanceError,
        terrainConformanceSamples: terrainConformanceErrors.length, maskDepthWrite,
        latitude: globals.sceneByLayer.get(eiffel).location.lat, longitude: globals.sceneByLayer.get(eiffel).location.lng };
    }

    if (check === 'animated zoom') {
      const zoomErrors = [];
      let animatedFrames = 0;
      let hiddenFrames = 0;
      const shared = globals.sceneByLayer.get(tower)._shared;
      const queue = globals.sceneByLayer.get(shared).renderer.device.queue;
      const writeBuffer = queue.writeBuffer;
      const observeZoom = () => {
        animatedFrames++;
        if (globals.sceneByLayer.get(shared).renderer.canvas.hidden) hiddenFrames++;
        const size = map.getSize();
        const zoom = map.getZoom();
        const scale = map.options.crs.scale(zoom) /
          (40075016.68557849 * Math.cos(globals.sceneByLayer.get(tower).location.lat * Math.PI / 180));
        const origin = map.project(globals.sceneByLayer.get(tower).location, zoom).subtract(map.getPixelOrigin());
        const ground = nativeChecks.getElevation(globals.cameraByMap.get(map)._terrain3D, map.getCenter()) ?? 0;
        for (const [x, z] of [[0, 0], [-40, -40], [40, 40]]) {
          const expected = map.layerPointToContainerPoint(origin.add([x * scale, z * scale]));
          const clip = new DOMPoint(x, ground, z, 1).matrixTransform(new DOMMatrix(globals.sceneByLayer.get(tower).camera.projectionViewMatrix));
          const ndcX = clip.x / clip.w, ndcY = clip.y / clip.w;
          const actual = new L.Point((ndcX + 1) * size.x / 2, (1 - ndcY) * size.y / 2);
          zoomErrors.push(actual.distanceTo(expected));
        }
      };
      queue.writeBuffer = function (buffer, ...args) {
        const result = writeBuffer.call(this, buffer, ...args);
        if (buffer === globals.sceneByLayer.get(shared).renderer.uniformBuffer && map._animatingZoom) observeZoom();
        return result;
      };
      map.setView(globals.sceneByLayer.get(tower).location, 16, { animate: false });
      testOperations.setPitch(map, 45);
      testOperations.setBearing(map, 30);
      map.panBy([70, -35], { animate: false });
      for (const zoom of [17, 16]) {
        await new Promise(requestAnimationFrame);
        await new Promise(resolve => {
          map.once('zoomend', resolve);
          map.setZoomAround(new L.Point(320, 220), zoom, { animate: true });
        });
      }
      delete queue.writeBuffer;
      return { zoomErrors, animatedFrames, hiddenFrames };
    }

    map.setView(globals.sceneByLayer.get(tower).location, 17, { animate: false });
    testOperations.setPitch(map, 60);
    testOperations.setBearing(map, 30);
    await new Promise(requestAnimationFrame);
    const renderer = globals.sceneByLayer.get(tower).renderer;
    const pixels = await nativeChecks.pixels(tower);
    let visiblePixels = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i]) visiblePixels++;
    }
    const clickThrough = getComputedStyle(renderer.canvas).pointerEvents === 'none';
    const baseLayer = Object.values(map._layers).find(layer =>
      globals.sceneByLayer.get(layer)._type === 'raster' && layer._map);
    map.removeLayer(tower);
    const sharedCanvasRemains = document.querySelector('.leaflet-3d') === globals.sceneByLayer.get(eiffel).renderer.canvas;
    map.removeLayer(eiffel);
    const other3d = [];
    map.eachLayer(layer => { if (globals.sceneByLayer.get(layer)._3d) other3d.push(layer); });
    other3d.forEach(layer => layer.remove());
    baseLayer.remove();
    const removed = !document.querySelector('.leaflet-3d');
    tower.addTo(map);
    eiffel.addTo(map);
    other3d.forEach(layer => layer.addTo(map));
    baseLayer.addTo(map);
    await Promise.all([tower, eiffel, ...other3d, baseLayer].map(layer => globals.sceneByLayer.get(layer)._added.promise));
    return {
      visiblePixels, clickThrough, removed, sharedCanvasRemains,
      restored: globals.sceneByLayer.get(tower).renderer.width === map.getSize().x && globals.sceneByLayer.get(tower).renderer.height === map.getSize().y,
    };
  }, check);
});

Then('the Eiffel Tower model preserves {string}', function (check) {
  const result = this.eiffel;
  if (check === 'geographic camera') {
    assert.ok(result.height > 299 && result.height < 301, JSON.stringify(result));
    assert.ok(result.topClipY < 0.9, `Eiffel Tower top is too close to the viewport edge: ${result.topClipY}`);
    assert.ok(result.baseClipY > -0.9, `Eiffel Tower base is too close to the viewport edge: ${result.baseClipY}`);
    assert.ok(result.terrainConformanceSamples > 0, 'No Eiffel Tower ground vertices were conformed');
    assert.ok(result.terrainConformanceError < 0.1,
      `Eiffel Tower ground vertices are not attached to terrain: ${result.terrainConformanceError}`);
    assert.equal(result.maskDepthWrite, true, 'Eiffel Tower alpha mask must write depth for correct occlusion');
    assert.ok(result.meshes > 1, JSON.stringify(result));
    assert.ok(Math.max(...result.errors) < 1.5, `Logical coordinate rounding errors: ${result.errors}`);
    assert.ok(Math.max(...result.footprintErrors) < 0.5, `Footprint errors in metres: ${result.footprintErrors}`);
    assert.equal(result.latitude, 48.8582601);
    assert.equal(result.longitude, 2.29449985);
  } else if (check === 'animated zoom') {
    assert.ok(result.animatedFrames >= 4, `Too few animated zoom frames: ${result.animatedFrames}`);
    assert.equal(result.hiddenFrames, 0);
    assert.ok(Math.max(...result.zoomErrors) < 0.1, `Animated tile alignment errors: ${result.zoomErrors}`);
  } else {
    assert.ok(result.visiblePixels > 1000, JSON.stringify(result));
    assert.equal(result.clickThrough, true);
    assert.equal(result.removed, true);
    assert.equal(result.sharedCanvasRemains, true);
    assert.equal(result.restored, true);
  }
});
