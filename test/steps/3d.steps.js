import * as globals from '../fixtures/globals.js';


import assert from 'node:assert/strict';
import { Given } from '@cucumber/cucumber';

export async function prepare3DChecks(page) {
  await page.evaluate(async () => {
    const [createMesh, createProgram, destroyTexture, disposeMesh,
      findFeature, raycast, onClick, onPointerLeave, setHighlight, showFeature,
      renderModule, update, sortMeshes, pump, releaseArea, emptyNode, setParent, traverse,
      updateWorldMatrix, updateCamera, parseColor, triangulate, lampPostGeometry, lightGeometry, getElevation] = await Promise.all([
      import('/src/rendering/createMesh.js'),
      import('/src/rendering/createProgram.js'),
      import('/src/rendering/destroyTexture.js'),
      import('/src/rendering/disposeMesh.js'),
      import('/src/picking/findFeature.js'),
      import('/src/picking/raycast.js'),
      import('/src/picking/onClick.js'),
      import('/src/picking/onPointerLeave.js'),
      import('/src/picking/setHighlight.js'),
      import('/src/picking/showFeature.js'),
      import('/src/rendering/render.js'),
      import('/src/scene/update.js'),
      import('/src/rendering/sortMeshes.js'),
      import('/src/sources/pump.js'),
      import('/src/sources/releaseArea.js'),
      import('/src/scene/emptyNode.js'),
      import('/src/scene/setParent.js'),
      import('/src/scene/traverse.js'),
      import('/src/scene/updateWorldMatrix.js'),
      import('/src/scene/updateCamera.js'),
      import('/src/utils/parseColor.js'),
      import('/src/triangulation/triangulate.js'),
      import('/src/geometry/lampPostGeometry.js'),
      import('/src/geometry/lightGeometry.js'),
      import('/src/terrain/getElevation.js'),
    ]);
    const graph = {
      emptyNode: emptyNode.emptyNode,
      setParent: setParent.setParent,
      traverse: traverse.traverse,
      updateWorldMatrix: updateWorldMatrix.updateWorldMatrix,
      updateCamera: updateCamera.updateCamera,
    };
    const gpu = {
      createMesh: createMesh.createMesh,
      createProgram: createProgram.createProgram,
      destroyTexture: destroyTexture.destroyTexture,
      disposeMesh: disposeMesh.disposeMesh,
    };
    const picking = {
      findFeature: findFeature.findFeature,
      raycast: raycast.raycast,
      onClick: onClick.onClick,
      onPointerLeave: onPointerLeave.onPointerLeave,
      setHighlight: setHighlight.setHighlight,
      showFeature: showFeature.showFeature,
    };
    const render = {
      render: renderModule.render,
      update: update.update,
      sortMeshes: sortMeshes.sortMeshes,
    };
    const sources = { pump: pump.pump, releaseArea: releaseArea.releaseArea };
    window.nativeChecks = {
      gpu, picking, render, sources,
      graph,
      getElevation: getElevation.getElevation,
      geometry: {
        parseColor: parseColor.parseColor,
        triangulate: triangulate.triangulate,
        lampPostGeometry: lampPostGeometry.lampPostGeometry,
        lightGeometry: lightGeometry.lightGeometry,
      },
      group() {
        return graph.emptyNode();
      },
      mesh(layer, attributes, program) {
        const mesh = gpu.createMesh(layer, attributes, program?._layerMaterial);
        graph.setParent(mesh, null);
        render.update(layer);
        if (program) {
          mesh.program.pipelineCache.clear();
          mesh.program = program;
        }
        return mesh;
      },
      async pixels(layer, x = 0, y = 0, width = globals.sceneByLayer.get(layer).renderer.canvas.width, height = globals.sceneByLayer.get(layer).renderer.canvas.height) {
        const { device, context, format, canvas } = globals.sceneByLayer.get(layer).renderer;
        context.configure({
          device, format, alphaMode: 'premultiplied',
          usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        });
        render.render(globals.sceneByLayer.get(layer)._shared);
        const bytesPerRow = Math.ceil(width * 4 / 256) * 256;
        const buffer = device.createBuffer({
          size: bytesPerRow * height, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });
        const encoder = device.createCommandEncoder();
        encoder.copyTextureToBuffer(
          { texture: context.getCurrentTexture(), origin: [x, canvas.height - y - height] },
          { buffer, bytesPerRow }, [width, height],
        );
        device.queue.submit([encoder.finish()]);
        await buffer.mapAsync(GPUMapMode.READ);
        const mapped = new Uint8Array(buffer.getMappedRange()), pixels = new Uint8Array(width * height * 4);
        for (let row = 0; row < height; row++) {
          for (let column = 0; column < width; column++) {
            const source = row * bytesPerRow + column * 4;
            const target = ((height - row - 1) * width + column) * 4;
            pixels.set(format.startsWith('bgra')
              ? [mapped[source + 2], mapped[source + 1], mapped[source], mapped[source + 3]]
              : mapped.subarray(source, source + 4), target);
          }
        }
        buffer.unmap();
        buffer.destroy();
        return pixels;
      },
      async terrainHeights(terrain, vertices) {
        const { elevationWGSL } = await import('/src/globals/elevationWGSL.js');
        const { device } = globals.sceneByLayer.get(terrain).renderer;
        const module = device.createShaderModule({ code: `
          @group(0) @binding(0) var dem: texture_2d<f32>;
          @group(0) @binding(1) var<storage, read> terrains: array<vec4<f32>>;
          @group(0) @binding(2) var<storage, read> uvs: array<vec2<f32>>;
          @group(0) @binding(3) var<storage, read_write> heights: array<f32>;
          ${elevationWGSL}
          @compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3<u32>) {
            if (id.x >= arrayLength(&heights)) { return; }
            let t = terrains[id.x];
            heights[id.x] = elevation(t.xy + uvs[id.x] * t.z, t.w) - t.w;
          }
        ` });
        const layout = device.createBindGroupLayout({ entries: [
          { binding: 0, visibility: GPUShaderStage.COMPUTE, texture: { sampleType: 'unfilterable-float' } },
          { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
          { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
          { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        ] });
        const pipeline = device.createComputePipeline({
          layout: device.createPipelineLayout({ bindGroupLayouts: [layout] }),
          compute: { module, entryPoint: 'main' },
        });
        const storage = data => {
          const buffer = device.createBuffer({ size: data.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
          device.queue.writeBuffer(buffer, 0, data);
          return buffer;
        };
        const terrains = storage(new Float32Array(vertices.flatMap(({ mesh }) => mesh.terrain)));
        const uvs = storage(new Float32Array(vertices.flatMap(({ u, v }) => [u, v])));
        const heights = device.createBuffer({ size: vertices.length * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
        const readback = device.createBuffer({ size: vertices.length * 4, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginComputePass();
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, device.createBindGroup({ layout, entries: [
          { binding: 0, resource: globals.sceneByLayer.get(terrain)._dem.texture.createView() },
          { binding: 1, resource: { buffer: terrains } },
          { binding: 2, resource: { buffer: uvs } },
          { binding: 3, resource: { buffer: heights } },
        ] }));
        pass.dispatchWorkgroups(Math.ceil(vertices.length / 64));
        pass.end();
        encoder.copyBufferToBuffer(heights, 0, readback, 0, vertices.length * 4);
        device.queue.submit([encoder.finish()]);
        await readback.mapAsync(GPUMapMode.READ);
        const result = new Float32Array(readback.getMappedRange()).slice();
        for (const buffer of [terrains, uvs, heights, readback]) buffer.destroy();
        return result;
      },
      ready(layer) {
        return testOperations.ready(layer);
      },
      async loadBlock(layer, area, features) {
        while (globals.sceneByLayer.get(layer)._inflight) await new Promise(requestAnimationFrame);
        const geojson = globals.sceneByLayer.get(layer)._geojson, data = layer.options.data, url = layer.options.url;
        globals.sceneByLayer.get(layer)._geojson = true;
        layer.options.data = { type: 'FeatureCollection', features };
        delete layer.options.url;
        globals.sceneByLayer.get(layer)._areas.set('fixture', area);
        try {
          sources.pump(layer);
          while (globals.sceneByLayer.get(layer)._inflight) await new Promise(requestAnimationFrame);
          return area;
        } finally {
          globals.sceneByLayer.get(layer)._geojson = geojson;
          if (data === undefined) delete layer.options.data;
          else layer.options.data = data;
          if (url === undefined) delete layer.options.url;
          else layer.options.url = url;
          globals.sceneByLayer.get(layer)._areas.delete('fixture');
        }
      },
      bounds(root, backend) {
        graph.updateWorldMatrix(root, true);
        const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
        graph.traverse(root, mesh => {
          if (!mesh.geometry) return;
          const position = mesh.geometry.attributes.position;
          for (let i = 0; i < position.count; i++) {
            const offset = i * position.size;
            const transformed = new DOMPoint(position.data[offset], position.data[offset + 1], position.data[offset + 2], 1)
              .matrixTransform(new DOMMatrix(mesh.worldMatrix));
            const point = [transformed.x / transformed.w, transformed.y / transformed.w, transformed.z / transformed.w];
            for (let j = 0; j < 3; j++) { min[j] = Math.min(min[j], point[j]); max[j] = Math.max(max[j], point[j]); }
          }

        });
        return { min, max };
      },
      intersections(mesh, origin, direction, backend) {
        const camera = globals.sceneByLayer.get(backend).camera, ray = structuredClone(globals.sceneByLayer.get(backend).raycaster);
        globals.sceneByLayer.get(backend).camera = {
          ...structuredClone(camera), position: [...origin],
          target: origin.map((v, i) => v + direction[i]), up: [0, 0, 1],
        };
        try {
          const rect = backend._map.getContainer().getBoundingClientRect();
          return picking.raycast(backend, {
            clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2,
          }, [mesh], false).map(hit => hit.point);
        } finally {
          globals.sceneByLayer.get(backend).camera = camera;
          globals.sceneByLayer.get(backend).raycaster = ray;
        }
      },
    };
  });
}

Given('a leaflet map', { timeout: 30000 }, async function () {
  await this.page.route('**/test/leaflet-city-mapper.html', route => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9/dist/leaflet.css">
      <div id="first" style="width:400px;height:300px"></div>
      <div id="second" style="width:400px;height:300px"></div>
      <script src="https://unpkg.com/leaflet@${process.env.LEAFLET_VERSION === '2' ? '2.0.0-alpha.1/dist/leaflet-global-src.js' : '1.9/dist/leaflet-src.js'}"></script>
      <script>globalThis.L = globalThis.leaflet || globalThis.L;</script>
      <script src="../dist/leaflet-city-mapper.js"></script>
      <script>
        Promise.all([
          testOperations.ready(new L.Layer({ source: { type: 'terrain' } })),
          testOperations.ready(new L.Layer({ source: { type: 'pmtiles', url: 'fixture.pmtiles',
            archive: { getHeader: async () => ({ maxZoom: 19 }) } } })),
        ]).then(() => window.test3d = { map: new L.Map('first', {
          center: [48.8582601, 2.29449985], zoom: 17, rotate: true, pitch: 45, bearing: 30
        }) });
      </script>`,
  }));
  await this.page.goto(`${this.baseUrl}/test/leaflet-city-mapper.html`);
  await prepare3DChecks(this.page);
  await this.page.waitForFunction(() => window.test3d);
  assert.equal(await this.page.evaluate(() => [...document.scripts].every(script => !script.type)), true);
  assert.equal(await this.page.evaluate(() => L.Layer.SceneRenderer), undefined);
});

const openEiffelExample = async function () {
  await this.page.setViewportSize({ width: 800, height: 600 });
  await this.page.goto(`${this.baseUrl}/examples/leaflet-city-mapper.html`, { waitUntil: 'domcontentloaded' });
  await prepare3DChecks(this.page);
  await this.page.waitForFunction(() => window.map && typeof testOperations.getPitch === 'function');
  await this.page.waitForFunction(() => layers._layers.some(entry => entry.name === 'Shadows'));
  await this.page.evaluate(() => Promise.all(layers._layers.map(({ layer }) => globals.sceneByLayer.get(layer).ready)));
  // Test-only shortcuts; the example keeps its layers inside the layers control.
  await this.page.evaluate(() => {
    const named = name => layers._layers.find(entry => entry.name === name).layer;
    Object.assign(window, {
      sunlightOverlay: named('Shadows'),
      cruiseBoats: named('Traffic').getLayers()[0],
      streetlights: named('Streetlights'),
    });
  });
  await this.page.waitForFunction(() => globals.sceneByLayer.get(sunlightOverlay).control);
  await this.page.waitForFunction(() => layers._layers.every(({ layer }) =>
    !(globals.sceneByLayer.get(layer)._3d) || (globals.sceneByLayer.get(layer).root && (!globals.sceneByLayer.get(layer).modelUrl || globals.sceneByLayer.get(layer).model) &&
      (!globals.sceneByLayer.get(layer).url || globals.sceneByLayer.get(layer).header))));
  await this.page.evaluate(() => Promise.all(layers._layers
    .filter(({ layer }) => !(globals.sceneByLayer.get(layer)._3d)).map(({ layer }) => globals.sceneByLayer.get(layer).ready)));
  const layout = await this.page.evaluate(() => {
    const rect = map.getContainer().getBoundingClientRect();
    return {
      width: rect.width, height: rect.height,
      viewportWidth: window.innerWidth, viewportHeight: window.innerHeight,
      preferCanvas: map.options.preferCanvas,
      classicScriptsOnly: [...document.scripts].every(script => !script.type),
      globalLibraries: typeof L.Layer === 'function' && !('CityMapper' in globalThis) &&
        !('_init3D' in L.Layer.prototype) && !('_initRaster' in L.Layer.prototype),
      vectorLayers: Object.values(map._layers).filter(layer => layer instanceof L.Path).length,
      backgrounds: [...document.querySelectorAll('.leaflet-control-layers-base label')].map(label => label.textContent.trim()),
      activeBackgrounds: layers._layers.filter(entry => !entry.overlay && map.hasLayer(entry.layer)).map(entry => entry.name),
      orthophotoUrl: globals.sceneByLayer.get(layers._layers.find(entry => entry.name === 'Orthophoto IGN').layer).url
    };
  });
  assert.equal(layout.width, layout.viewportWidth);
  assert.equal(layout.height, layout.viewportHeight);
  assert.equal(layout.preferCanvas, true);
  assert.equal(layout.classicScriptsOnly, true);
  assert.equal(layout.globalLibraries, true);
  assert.equal(layout.vectorLayers, 0);
  assert.deepEqual(layout.backgrounds, ['Empty', 'Plan IGN', 'Orthophoto IGN']);
  assert.deepEqual(layout.activeBackgrounds, ['Orthophoto IGN']);
  assert.match(layout.orthophotoUrl, /\/examples\/data\/paris-orthophotos\.pmtiles$/);
};

Given('the Eiffel Tower example page is open', { timeout: 60000 }, openEiffelExample);

// Real offline archives: terrain and orthophoto tiles exercise the GPU upload paths.
Given('the Eiffel Tower example page is open with its offline archives', { timeout: 60000 }, async function () {
  await this.context.route('**/dist/leaflet-city-mapper.js', route =>
    route.fulfill({ contentType: 'text/javascript', body: this.pluginBundle }));
  await openEiffelExample.call(this);
});
