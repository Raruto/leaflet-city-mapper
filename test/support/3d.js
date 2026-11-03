import assert from 'node:assert/strict';
import { After, AfterAll, Before, Given } from '@cucumber/cucumber';

// Shared by the 3D scenarios: coverage hooks, page checks and the example pages.
const coveredFunctions = new Map();

Before({ tags: '@3d-layer' }, async function () {
  if (process.env.COVERAGE_3D) {
    await this.page.coverage.startJSCoverage({ resetOnNavigation: false });
  }
});

After({ tags: '@3d-layer' }, async function () {
  if (!process.env.COVERAGE_3D) return;
  const entries = await this.page.coverage.stopJSCoverage();
  for (const entry of entries.filter(entry => entry.url.includes('/dist/'))) {
    for (const fn of entry.functions) {
      const range = fn.ranges[0];
      if (!fn.functionName) continue;
      const key = `${entry.url}:${range.startOffset}:${range.endOffset}`;
      const previous = coveredFunctions.get(key);
      coveredFunctions.set(key, {
        name: fn.functionName,
        line: entry.source.slice(0, range.startOffset).split('\n').length,
        covered: Boolean(range.count || previous?.covered),
      });
    }
  }
});

AfterAll(function () {
  if (!process.env.COVERAGE_3D || !coveredFunctions.size) return;
  const functions = [...coveredFunctions.values()];
  const covered = functions.filter(fn => fn.covered).length;
  console.log(`Layer3D named-function coverage: ${covered}/${functions.length} (${(covered / functions.length * 100).toFixed(1)}%)`);
  console.log('Uncovered functions:', functions.filter(fn => !fn.covered).map(fn => `${fn.name}:${fn.line}`).join(', '));
});

export async function prepare3DChecks(page) {
  await page.evaluate(async () => {
    const [createMesh, createProgram, destroyTexture, disposeMesh,
      findFeature, raycast, onClick, onPointerLeave, setHighlight, showFeature,
      renderModule, update, sortMeshes, pump, releaseArea, emptyNode, setParent, traverse,
      updateWorldMatrix, updateCamera, parseColor, triangulate, lampPostGeometry, lightGeometry] = await Promise.all([
      import('/dist/utils/createMesh.js'),
      import('/dist/utils/createProgram.js'),
      import('/dist/utils/destroyTexture.js'),
      import('/dist/utils/disposeMesh.js'),
      import('/dist/utils/findFeature.js'),
      import('/dist/utils/raycast.js'),
      import('/dist/utils/onClick.js'),
      import('/dist/utils/onPointerLeave.js'),
      import('/dist/utils/setHighlight.js'),
      import('/dist/utils/showFeature.js'),
      import('/dist/utils/render.js'),
      import('/dist/utils/update.js'),
      import('/dist/utils/sortMeshes.js'),
      import('/dist/utils/pump.js'),
      import('/dist/utils/releaseArea.js'),
      import('/dist/utils/emptyNode.js'),
      import('/dist/utils/setParent.js'),
      import('/dist/utils/traverse.js'),
      import('/dist/utils/updateWorldMatrix.js'),
      import('/dist/utils/updateCamera.js'),
      import('/dist/utils/parseColor.js'),
      import('/dist/utils/triangulate.js'),
      import('/dist/utils/lampPostGeometry.js'),
      import('/dist/utils/lightGeometry.js'),
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
      async pixels(layer, x = 0, y = 0, width = layer.renderer.canvas.width, height = layer.renderer.canvas.height) {
        const { device, context, format, canvas } = layer.renderer;
        context.configure({
          device, format, alphaMode: 'premultiplied',
          usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        });
        render.render(layer._shared);
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
        const { device } = terrain.renderer;
        const module = device.createShaderModule({ code: `
          @group(0) @binding(0) var dem: texture_2d<f32>;
          @group(0) @binding(1) var<storage, read> terrains: array<vec4<f32>>;
          @group(0) @binding(2) var<storage, read> uvs: array<vec2<f32>>;
          @group(0) @binding(3) var<storage, read_write> heights: array<f32>;
          ${L.Layer.types.terrain.elevationWGSL}
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
          { binding: 0, resource: terrain._dem.texture.createView() },
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
        return new Promise((resolve, reject) => {
          const loaded = () => { cleanup(); resolve(layer); };
          const failed = ({ error }) => { cleanup(); reject(error); };
          const cleanup = () => {
            layer.off('ready', loaded);
            layer.off('error', failed);
          };
          layer.on('ready', loaded);
          layer.on('error', failed);
        });
      },
      async loadBlock(layer, area, features) {
        while (layer._inflight) await new Promise(requestAnimationFrame);
        const geojson = layer._geojson, data = layer.options.data, url = layer.options.url;
        layer._geojson = true;
        layer.options.data = { type: 'FeatureCollection', features };
        delete layer.options.url;
        layer._areas.set('fixture', area);
        try {
          sources.pump(layer);
          while (layer._inflight) await new Promise(requestAnimationFrame);
          return area;
        } finally {
          layer._geojson = geojson;
          if (data === undefined) delete layer.options.data;
          else layer.options.data = data;
          if (url === undefined) delete layer.options.url;
          else layer.options.url = url;
          layer._areas.delete('fixture');
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
        const camera = backend.camera, ray = structuredClone(backend.raycaster);
        backend.camera = {
          ...structuredClone(camera), position: [...origin],
          target: origin.map((v, i) => v + direction[i]), up: [0, 0, 1],
        };
        try {
          const rect = backend._map.getContainer().getBoundingClientRect();
          return picking.raycast(backend, {
            clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2,
          }, [mesh], false).map(hit => hit.point);
        } finally {
          backend.camera = camera;
          backend.raycaster = ray;
        }
      },
    };
  });
}

Given('a map with the standalone 3D module and no dependency import map', async function () {
  this.oglRequests = [];
  this.threeRequests = [];
  this.page.on('request', request => {
    if (request.url().includes('unpkg.com/three@')) this.threeRequests.push(request.url());
    if (/unpkg\.com\/(ogl|earcut)@/.test(request.url())) this.oglRequests.push(request.url());
  });
  await this.page.route('**/test/standalone-3d.html', route => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9/dist/leaflet.css">
      <div id="first" style="width:400px;height:300px"></div>
      <div id="second" style="width:400px;height:300px"></div>
      <script src="https://unpkg.com/leaflet@${process.env.LEAFLET_VERSION === '2' ? '2.0.0-alpha.1/dist/leaflet-global-src.js' : '1.9/dist/leaflet-src.js'}"></script>
      <script>globalThis.L = globalThis.leaflet || globalThis.L;</script>
      <script src="https://unpkg.com/leaflet-rotate@0.5.3/dist/leaflet-rotate-src.js"></script>
      <script src="../dist/leaflet-city-mapper.js"></script>
      <script>
        import('../dist/types/terrain.js').then(() => window.test3d = { Layer3D: L.Layer.types['3d'], map: new L.Map('first', {
          center: [48.8582601, 2.29449985], zoom: 17, rotate: true, pitch: 45, bearing: 30
        }) });
      </script>`,
  }));
  await this.page.goto(`${this.baseUrl}/test/standalone-3d.html`);
  await prepare3DChecks(this.page);
  await this.page.waitForFunction(() => window.test3d);
  assert.deepEqual(this.threeRequests, []);
  assert.deepEqual(this.oglRequests, []);
  assert.equal(await this.page.evaluate(() => [...document.scripts].every(script => !script.type)), true);
  assert.equal(await this.page.evaluate(() => L.Layer.types['3d'].SceneRenderer), undefined);
});

const openEiffelExample = async function () {
  await this.page.setViewportSize({ width: 800, height: 600 });
  await this.page.goto(`${this.baseUrl}/examples/leaflet-city-mapper.html`, { waitUntil: 'domcontentloaded' });
  await prepare3DChecks(this.page);
  await this.page.waitForFunction(() => window.map && typeof window.map.getPitch === 'function');
  await this.page.waitForFunction(() => layers._layers.some(entry => entry.name === 'Shadows'));
  await this.page.evaluate(() => Promise.all(layers._layers.map(({ layer }) => layer.ready)));
  // Test-only shortcuts; the example keeps its layers inside the layers control.
  await this.page.evaluate(() => {
    const named = name => layers._layers.find(entry => entry.name === name).layer;
    Object.assign(window, { sunlightOverlay: named('Shadows'), cruiseBoats: named('Bateaux-Mouches'), streetlights: named('Streetlights') });
  });
  await this.page.waitForFunction(() => sunlightOverlay.control);
  await this.page.waitForFunction(() => layers._layers.every(({ layer }) =>
    !(layer instanceof L.Layer.types['3d']) || (layer.root && (!layer.modelUrl || layer.model) &&
      (!layer.url || layer.header))));
  await this.page.evaluate(() => Promise.all(layers._layers
    .filter(({ layer }) => !(layer instanceof L.Layer.types['3d'])).map(({ layer }) => layer.ready)));
  const layout = await this.page.evaluate(() => {
    const rect = map.getContainer().getBoundingClientRect();
    return {
      width: rect.width, height: rect.height,
      viewportWidth: window.innerWidth, viewportHeight: window.innerHeight,
      preferCanvas: map.options.preferCanvas,
      classicScriptsOnly: [...document.scripts].every(script => !script.type),
      globalLibraries: typeof L.Layer.types['3d'] === 'function' && typeof L.Layer.types.pmtiles === 'function',
      vectorLayers: Object.values(map._layers).filter(layer => layer instanceof L.Path).length,
      backgrounds: [...document.querySelectorAll('.leaflet-control-layers-base label')].map(label => label.textContent.trim()),
      activeBackgrounds: layers._layers.filter(entry => !entry.overlay && map.hasLayer(entry.layer)).map(entry => entry.name),
      orthophotoUrl: layers._layers.find(entry => entry.name === 'Orthophoto IGN').layer.options.archive.url
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
  await this.context.unroute('**/dist/types/*.js');
  await openEiffelExample.call(this);
});
