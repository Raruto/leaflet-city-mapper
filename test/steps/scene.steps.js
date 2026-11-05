import * as globals from '../fixtures/globals.js';


import assert from 'node:assert/strict';
import { Then, When } from '@cucumber/cucumber';

Then('layer-owned objects preserve values and visibility without engine classes', async function () {
  const result = await this.page.evaluate(async () => {
    const layer = new L.Layer({ source: { type: '3d' } });
    await nativeChecks.ready(layer);
    layer.addTo(test3d.map);
    await globals.sceneByLayer.get(layer)._added.promise;
    const scene = nativeChecks.group();
    const mesh = nativeChecks.mesh(layer, {
      position: [0, 0, 0, 1, 0, 0, 0, 1, 0],
      normal: [0, 0, 1, 0, 0, 1, 0, 0, 1],
      color: [1, 0, 0, 1, 0, 0, 1, 0, 0],
    });
    mesh.worldMatrix = Array.from(new DOMMatrix().translate(0, 0, -1).toFloat64Array());
    const rect = layer._map.getContainer().getBoundingClientRect();
    globals.sceneByLayer.get(layer).camera.position.splice(0, 3, 0.25, 0.25, 2);
    globals.sceneByLayer.get(layer).camera.target.splice(0, 3, 0.25, 0.25, -1);
    globals.sceneByLayer.get(layer).camera.up.splice(0, 3, 0, 1, 0);
    globals.sceneByLayer.get(layer).camera.aspect = rect.width / rect.height;
    const center = { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
    const hit = nativeChecks.picking.raycast(layer, center, [mesh], false)[0];
    const worldCameraRay = hit?.object === mesh && hit.faceIndex === 0 &&
      hit.point.every((value, index) => Math.abs(value - [0.25, 0.25, -1][index]) < 1e-8);
    const matrix = mesh.worldMatrix;
    mesh.worldMatrix = new Array(16).fill(0);
    let singularTransform = false;
    try { nativeChecks.picking.raycast(layer, center, [mesh], false); } catch (error) {
      singularTransform = error.message === 'Singular 3D transform';
    }
    mesh.worldMatrix = matrix;
    const objects = [scene, globals.sceneByLayer.get(layer).camera, globals.sceneByLayer.get(layer).raycaster, globals.sceneByLayer.get(layer).renderer, mesh, mesh.geometry, mesh.program];
    const noEngine = !('Native' in L.Layer) && !('Native' in layer) && !('loadModel' in layer) &&
      objects.every(object => object.constructor === Object) &&
      Object.getPrototypeOf(globals.sceneByLayer.get(layer).camera.position) === Array.prototype &&
      Object.getPrototypeOf(mesh.worldMatrix) === Array.prototype &&
      objects.every(object => Object.getPrototypeOf(object) === Object.prototype &&
        Object.values(object).every(value => typeof value !== 'function')) &&
      !Object.keys(layer).some(name => /Methods|Prototype/.test(name));
    const prototype = Object.getPrototypeOf(layer);
    const noLayerHelpers = ['add', 'remove', '_setTerrainHeight', '_lampPostGeometry', '_lightGeometry']
      .every(name => !Object.hasOwn(layer, name)) &&
      prototype === L.Layer.prototype && layer.remove === L.Layer.prototype.remove;
    const independent = scene.position !== globals.sceneByLayer.get(layer).root.position &&
      scene.children !== globals.sceneByLayer.get(layer).root.children && scene.worldMatrix !== globals.sceneByLayer.get(layer).root.worldMatrix;
    const nodes = [
      { id: 1, program: { transparent: true }, _sortDepth: 0.2 },
      { id: 2, program: { transparent: false } },
      { id: 3, program: { transparent: true }, _sortDepth: 0.8 },
    ];
    const programs = [];
    for (const properties of nodes) {
      const node = nativeChecks.mesh(layer, {
        position: [0, 0, 0, 1, 0, 0, 0, 1, 0],
        normal: [0, 0, 1, 0, 0, 1, 0, 0, 1],
        color: [1, 0, 0, 1, 0, 0, 1, 0, 0],
      }, nativeChecks.gpu.createProgram(layer, { vertexColors: true }));
      node.program.transparent = properties.program.transparent;
      // The shared renderer computes depth from geometry centers, not authored node origins.
      node.position[0] = 0; node.position[1] = 0; node.position[2] = properties.id === 3 ? -100 : 0;
      programs.push(node.program);
      nativeChecks.graph.setParent(node, scene);
    }
    const hidden = nativeChecks.group(); hidden.visible = false; nativeChecks.graph.setParent(hidden, scene);
    const hiddenMesh = nativeChecks.group();
    Object.assign(hiddenMesh, { geometry: mesh.geometry, program: mesh.program, id: 4 });
    nativeChecks.graph.setParent(hiddenMesh, hidden);
    nativeChecks.graph.setParent(scene, globals.sceneByLayer.get(layer).root);
    nativeChecks.render.update(layer);
    nativeChecks.render.render(globals.sceneByLayer.get(layer)._shared);
    const meshes = [];
    nativeChecks.graph.traverse(scene, node => {
      if (programs.includes(node.program)) meshes.push(node);
      if (node !== hiddenMesh && node.geometry?.attributes) {
        for (const attribute of Object.values(node.geometry.attributes)) attribute.buffer.destroy();
        node.program.pipelineCache.clear();
      }
    });
    const sorted = nativeChecks.render.sortMeshes(meshes).map(node => programs.indexOf(node.program) + 1).join() === '2,3,1';
    for (const attribute of Object.values(mesh.geometry.attributes)) attribute.buffer.destroy();
    mesh.program.pipelineCache.clear();
    layer.remove();
    return { worldCameraRay, singularTransform, sorted, noEngine, noLayerHelpers, independent };
  });
  for (const [name, value] of Object.entries(result)) assert.equal(value, true, name);
});

Then('3D layers without a location keep their first map origin', { timeout: 60000 }, async function () {
  const result = await this.page.evaluate(async () => {
    const map = test3d.map;
    const initial = map.getCenter();
    const beforeReady = new L.Layer({ source: { type: '3d', ariaLabel: 'Automatic origin' } }).addTo(map);
    const afterReady = new L.Layer({ source: { type: '3d' } });
    await Promise.all([beforeReady, afterReady].map(nativeChecks.ready));
    const deferred = globals.sceneByLayer.get(afterReady).location == null && !globals.sceneByLayer.get(afterReady).renderer;
    afterReady.addTo(map);
    await globals.sceneByLayer.get(afterReady)._added.promise;
    const origins = globals.sceneByLayer.get(beforeReady).location.equals(initial) && globals.sceneByLayer.get(afterReady).location.equals(initial);
    const shared = globals.sceneByLayer.get(beforeReady).renderer === globals.sceneByLayer.get(afterReady).renderer &&
      Math.hypot(...globals.sceneByLayer.get(beforeReady).root.position) === 0 && Math.hypot(...globals.sceneByLayer.get(afterReady).root.position) === 0;
    beforeReady.remove();
    afterReady.remove();
    map.setView([48.86, 2.3], 17, { animate: false });
    beforeReady.addTo(map);
    afterReady.addTo(map);
    await Promise.all([globals.sceneByLayer.get(beforeReady)._added.promise, globals.sceneByLayer.get(afterReady)._added.promise]);
    const retained = globals.sceneByLayer.get(beforeReady).location.equals(initial) && globals.sceneByLayer.get(afterReady).location.equals(initial) &&
      globals.sceneByLayer.get(beforeReady).renderer === globals.sceneByLayer.get(afterReady).renderer;
    beforeReady.remove();
    afterReady.remove();
    const center = [48.858, 2.295];
    const explicit = new L.Layer({ source: { type: '3d', center } });
    await nativeChecks.ready(explicit);
    center[0] = 0;
    const explicitPreserved = globals.sceneByLayer.get(explicit).location.equals([48.858, 2.295]);
    return { deferred, origins, shared, retained, explicitPreserved };
  });
  for (const [name, value] of Object.entries(result)) assert.equal(value, true, name);
});

When('I add and remove independent 3D layers', { timeout: 60000 }, async function () {
  this.shared3d = await this.page.evaluate(async () => {
    const { map } = test3d;
    const control = new L.Control.Layers().addTo(map);
    const pending = new L.Layer({ source: { type: '3d', center: [map.getCenter().lat, map.getCenter().lng] } }).addTo(map);
    pending.remove();
    await nativeChecks.ready(pending);
    const pendingRemoved = !document.querySelector('.leaflet-3d');
    const first = new L.Layer({ source: { type: '3d', center: [48.8582601, 2.29449985] } }).addTo(map);
    control.addOverlay(first, 'First 3D layer');
    const second = new L.Layer({ source: { type: '3d', center: [48.8602, 2.298] } }).addTo(map);
    await Promise.all([first, second].map(nativeChecks.ready));
    const backend = first;
    const object = nativeChecks.group();
    nativeChecks.graph.setParent(object, globals.sceneByLayer.get(second).root);
    nativeChecks.render.update(second);
    const shared = globals.sceneByLayer.get(first)._shared === first && globals.sceneByLayer.get(second)._shared === first &&
      globals.renderers.get(map) === first &&
      globals.sceneByLayer.get(first).renderer === globals.sceneByLayer.get(second).renderer && globals.sceneByLayer.get(first).camera === globals.sceneByLayer.get(second).camera &&
      globals.sceneByLayer.get(first).scene === globals.sceneByLayer.get(second).scene && globals.sceneByLayer.get(first).root !== globals.sceneByLayer.get(second).root &&
      globals.sceneByLayer.get(first).root.parent === globals.sceneByLayer.get(second).root.parent && document.querySelectorAll('.leaflet-3d').length === 1;
    nativeChecks.render.render(globals.sceneByLayer.get(first)._shared);
    const worldPoint = new DOMPoint(10, 0, 20, 1).matrixTransform(new DOMMatrix(globals.sceneByLayer.get(second).root.worldMatrix));
    const world = [worldPoint.x / worldPoint.w, worldPoint.y / worldPoint.w, worldPoint.z / worldPoint.w];
    const screenPoint = new DOMPoint(...world, 1).matrixTransform(new DOMMatrix(globals.sceneByLayer.get(second).camera.projectionViewMatrix));
    const screen = [screenPoint.x / screenPoint.w, screenPoint.y / screenPoint.w, screenPoint.z / screenPoint.w];
    const crs = map.options.crs;
    const point = crs.project(globals.sceneByLayer.get(second).location);
    const metres = Math.cos(globals.sceneByLayer.get(second).location.lat * Math.PI / 180);
    const latlng = crs.unproject(new L.Point(point.x + 10 / metres, point.y - 20 / metres));
    const expected = map.latLngToContainerPoint(latlng);
    const size = map.getSize();
    const error = new L.Point((screen[0] + 1) * size.x / 2, (1 - screen[1]) * size.y / 2).distanceTo(expected);
    const renderer = globals.sceneByLayer.get(second).renderer;
    const canvasDefaults = renderer.canvas.parentNode === map.getPane('webgpuPane') &&
      map.getPane('webgpuPane').parentNode === map.getContainer() &&
      map.getPane('webgpuPane').style.zIndex === '1' &&
      renderer.dpr === Math.min(window.devicePixelRatio, 2);
    let disposals = 0;
    const destroy = renderer.device.destroy.bind(renderer.device);
    renderer.device.destroy = function () { disposals++; destroy(); };
    const sceneOrigin = globals.sceneByLayer.get(first).location;
    const matrix = [...globals.sceneByLayer.get(first).camera.projectionViewMatrix];
    nativeChecks.render.update(first);
    first.remove();
    await new Promise(requestAnimationFrame);
    const retained = globals.sceneByLayer.get(second).renderer === renderer && renderer.canvas.isConnected && disposals === 0 &&
      globals.sceneByLayer.get(second)._shared === second && globals.renderers.get(map) === second &&
      globals.sceneByLayer.get(second)._sceneOrigin === sceneOrigin && !globals.sceneByLayer.get(first)._frame &&
      globals.sceneByLayer.get(second).camera.projectionViewMatrix.every((value, index) => Math.abs(value - matrix[index]) < 1e-10);
    const otherMap = new L.Map('second', { center: globals.sceneByLayer.get(second).location, zoom: 17, rotate: true });
    first.addTo(otherMap);
    await globals.sceneByLayer.get(first)._added.promise;
    const movedOwner = globals.sceneByLayer.get(first)._shared === first && globals.sceneByLayer.get(first).renderer !== renderer &&
      globals.sceneByLayer.get(second)._shared === second && globals.sceneByLayer.get(second).renderer === renderer;
    testOperations.setBearing(otherMap, 70);
    testOperations.setBearing(map, 65);
    await new Promise(requestAnimationFrame);
    const independentUpdates = globals.sceneByLayer.get(first)._sceneOrigin === globals.sceneByLayer.get(first).location &&
      globals.sceneByLayer.get(second).camera.projectionViewMatrix.some((value, index) => Math.abs(value - matrix[index]) > 1e-6);
    first.remove();
    first.addTo(map);
    await globals.sceneByLayer.get(first)._added.promise;
    const rejoined = globals.sceneByLayer.get(first).renderer === renderer && globals.sceneByLayer.get(first)._shared === second &&
      globals.sceneByLayer.get(first).root.position.every(value => Math.abs(value) < 1e-8);
    const overlayRegistration = control._layers.filter(entry => entry.layer === first).length === 1 &&
      control._layers.find(entry => entry.layer === first).name === 'First 3D layer';
    const checkbox = () => [...map.getContainer().querySelectorAll('.leaflet-control-layers-overlays label')]
      .find(label => label.textContent.includes('First 3D layer')).querySelector('input');
    checkbox().click();
    const checkboxDisabled = !map.hasLayer(first);
    checkbox().click();
    await globals.sceneByLayer.get(first)._added.promise;
    const checkboxEnabled = map.hasLayer(first) && globals.sceneByLayer.get(first).renderer === renderer;
    const other = await nativeChecks.ready(new L.Layer({ source: {
      type: '3d', center: [globals.sceneByLayer.get(second).location.lat, globals.sceneByLayer.get(second).location.lng],
    } }).addTo(otherMap));
    const isolated = globals.sceneByLayer.get(other).renderer !== renderer && document.querySelectorAll('.leaflet-3d').length === 2;
    second.remove();
    const transferredAgain = globals.sceneByLayer.get(first)._shared === first && globals.sceneByLayer.get(first).renderer === renderer &&
      globals.sceneByLayer.get(first)._sceneOrigin === sceneOrigin && renderer.canvas.isConnected && disposals === 0;
    first.remove();
    await renderer.device.lost;
    const released = disposals === 1 && !renderer.canvas.isConnected && globals.sceneByLayer.get(other).renderer.canvas.isConnected;
    second.addTo(map);
    await globals.sceneByLayer.get(second)._added.promise;
    const restored = globals.sceneByLayer.get(second).renderer !== renderer && globals.sceneByLayer.get(second).root.children.includes(object);
    map.remove();
    otherMap.remove();
    return { pendingRemoved, shared, canvasDefaults, error, retained, movedOwner, independentUpdates, rejoined, isolated,
      transferredAgain, released, restored,
      overlayRegistration, checkboxDisabled, checkboxEnabled,
      cleaned: !document.querySelector('.leaflet-3d') };
  });
});

Then('3D groups retain their geographic origins and share resources only on the same map', function () {
  const { error, ...checks } = this.shared3d;
  for (const [name, value] of Object.entries(checks)) assert.equal(value, true, name);
  assert.ok(error < 1.5, `Geographic origin error: ${error}px`);
});

Then('an unavailable WebGPU adapter emits an error and shows a warning without leaving a canvas', async function () {
  const result = await this.page.evaluate(async () => {
    const descriptor = Object.getOwnPropertyDescriptor(navigator, 'gpu');
    Object.defineProperty(navigator, 'gpu', {
      configurable: true,
      value: { requestAdapter: async () => null },
    });
    try {
      const layer = new L.Layer({ source: { type: '3d' } }).addTo(test3d.map);
      let emitted;
      layer.on('error', event => { emitted = event.error; });
      const error = await nativeChecks.ready(layer).then(() => null, error => error);
      layer.remove();
      const warning = test3d.map.getContainer().querySelector('.leaflet-webgpu-warning');
      return { rejected: error instanceof Error, unavailable: error?.message === 'Unable to acquire a WebGPU adapter',
        emitted: error === emitted, removed: !test3d.map.hasLayer(layer),
        warning: warning?.getAttribute('role') === 'alert' && warning.textContent.includes('WebGPU'),
        learnMore: warning?.querySelector('a')?.href.startsWith('https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API'),
        noCanvas: !document.querySelector('.leaflet-3d') };
    } finally {
      if (descriptor) Object.defineProperty(navigator, 'gpu', descriptor);
      else delete navigator.gpu;
    }
  });

  for (const [name, value] of Object.entries(result)) assert.equal(value, true, name);
});

When('I select the {string} background in the 3D example', async function (background) {
  await this.page.evaluate(() => {
    const overlays = layers._layers.filter(entry => entry.overlay && globals.sceneByLayer.get(entry.layer)._3d &&
      !(globals.sceneByLayer.get(entry.layer)._type === 'terrain'))
      .map(entry => entry.layer);
    window.exampleSceneBefore = {
      overlays, renderer: globals.sceneByLayer.get(overlays[0]).renderer, canvas: globals.sceneByLayer.get(overlays[0]).renderer.canvas,
      model: globals.sceneByLayer.get(overlays.find(layer => globals.sceneByLayer.get(layer).model)).model,
      center: map.getCenter(), zoom: map.getZoom(), bearing: testOperations.getBearing(map), pitch: testOperations.getPitch(map),
    };
  });
  await this.page.getByRole('radio', { name: background, exact: true }).check();
});

Then('only the {string} background is active and the 3D scene is unchanged', async function (background) {
  await this.page.waitForFunction(background => {
    const entries = layers._layers.filter(entry => !entry.overlay && map.hasLayer(entry.layer));
    return entries.length === 1 && entries[0].name === background;
  }, background);
  const result = await this.page.evaluate(() => {
    const before = window.exampleSceneBefore;
    const overlays = layers._layers.filter(entry => entry.overlay && globals.sceneByLayer.get(entry.layer)._3d &&
      !(globals.sceneByLayer.get(entry.layer)._type === 'terrain'))
      .map(entry => entry.layer);
    const tower = overlays.find(layer => globals.sceneByLayer.get(layer).model);
    return {
      enabled: overlays.length === 4 && overlays.every(layer => map.hasLayer(layer)) &&
        layers._layers.find(entry => entry.name === 'Traffic').layer.getLayers().every(layer => map.hasLayer(layer)),
      shared: overlays.every(layer => globals.sceneByLayer.get(layer).renderer === before.renderer),
      canvas: document.querySelectorAll('.leaflet-3d').length === 1 &&
        before.canvas.isConnected && globals.sceneByLayer.get(tower).renderer.canvas === before.canvas,
      model: globals.sceneByLayer.get(tower).model === before.model && globals.sceneByLayer.get(tower).model.parent === globals.sceneByLayer.get(tower).root,
      camera: map.getCenter().equals(before.center) && map.getZoom() === before.zoom &&
        testOperations.getBearing(map) === before.bearing && testOperations.getPitch(map) === before.pitch,
    };
  });
  for (const [name, value] of Object.entries(result)) assert.equal(value, true, name);
});

When('I disable and restore the 3D overlays through the layer control', { timeout: 60000 }, async function () {
  const towerControl = this.page.getByRole('checkbox', { name: 'Eiffel Tower', exact: true });
  const buildingsControl = this.page.getByRole('checkbox', { name: 'Buildings', exact: true });
  const treesControl = this.page.getByRole('checkbox', { name: 'Trees', exact: true });
  const terrainControl = this.page.getByRole('checkbox', { name: 'Terrain (3D)', exact: true });
  const lightsControl = this.page.getByRole('checkbox', { name: 'Streetlights', exact: true });
  const trafficControl = this.page.getByRole('checkbox', { name: 'Traffic', exact: true });
  const background = await this.page.evaluate(() => layers._layers.find(entry =>
    !entry.overlay && map.hasLayer(entry.layer)).name);
  await this.page.getByRole('radio', { name: 'Empty', exact: true }).check();
  await trafficControl.uncheck();
  const trafficDisabled = await this.page.evaluate(() =>
    layers._layers.find(entry => entry.name === 'Traffic').layer.getLayers().every(layer => !map.hasLayer(layer)));
  await lightsControl.uncheck();
  await terrainControl.uncheck();
  await this.page.evaluate(() => {
    const tower = layers._layers.find(entry => globals.sceneByLayer.get(entry.layer).model).layer;
    // The Walk button is not managed by the overlays control under test.
    walk.remove();
    window.exampleOverlayBefore = { tower, model: globals.sceneByLayer.get(tower).model, canvas: globals.sceneByLayer.get(tower).renderer.canvas, walk };
  });
  await towerControl.uncheck();
  const towerDisabled = await this.page.evaluate(() => {
    const before = window.exampleOverlayBefore;
    const buildings = layers._layers.find(entry => globals.sceneByLayer.get(entry.layer)._3d &&
      !(globals.sceneByLayer.get(entry.layer)._type === 'terrain') && globals.sceneByLayer.get(entry.layer).url).layer;
    return !map.hasLayer(before.tower) && map.hasLayer(buildings) &&
      before.canvas.isConnected && globals.sceneByLayer.get(buildings).renderer.canvas === before.canvas &&
      !map.attributionControl.getContainer().textContent.includes('CC0 model:') &&
      !globals.sceneByLayer.get(before.tower)._tooltip;
  });
  await buildingsControl.uncheck();
  const treesRetained = await this.page.evaluate(() => {
    const tree = layers._layers.find(entry => entry.name === 'Trees').layer;
    return map.hasLayer(tree) && globals.sceneByLayer.get(tree).renderer.canvas === window.exampleOverlayBefore.canvas &&
      globals.sceneByLayer.get(tree).renderer.canvas.isConnected;
  });
  await treesControl.uncheck();
  const allDisabled = await this.page.evaluate(() =>
    !document.querySelector('.leaflet-3d') && !document.querySelector('.leaflet-3d-tooltip') &&
    !window.exampleOverlayBefore.canvas.isConnected);
  await towerControl.check();
  await this.page.waitForFunction(() => {
    const tower = window.exampleOverlayBefore.tower;
    return globals.sceneByLayer.get(tower).renderer && globals.sceneByLayer.get(tower).model.parent === globals.sceneByLayer.get(tower).root;
  });
  const towerRestored = await this.page.evaluate(() => {
    const before = window.exampleOverlayBefore;
    const tower = before.tower;
    return map.hasLayer(tower) && globals.sceneByLayer.get(tower).model === before.model &&
      globals.sceneByLayer.get(tower).renderer.canvas !== before.canvas && globals.sceneByLayer.get(tower).renderer.canvas.isConnected &&
      map.attributionControl.getContainer().textContent.includes('CC0 model:') &&
      globals.sceneByLayer.get(tower)._tooltip.hidden;
  });
  await buildingsControl.check();
  await treesControl.check();
  await terrainControl.check();
  await lightsControl.check();
  await trafficControl.check();
  await this.page.getByRole('radio', { name: background, exact: true }).check();
  await this.page.waitForFunction(() => layers._layers.filter(entry => entry.overlay && globals.sceneByLayer.get(entry.layer)._3d)
    .every(({ layer }) => globals.sceneByLayer.get(layer).root && globals.sceneByLayer.get(layer).renderer));
  const bothRestored = await this.page.evaluate(() => {
    const overlays = layers._layers.filter(entry => entry.overlay && globals.sceneByLayer.get(entry.layer)._3d &&
      !(globals.sceneByLayer.get(entry.layer)._type === 'terrain'))
      .map(entry => entry.layer);
    const traffic = layers._layers.find(entry => entry.name === 'Traffic').layer.getLayers();
    return traffic.length === 7 && traffic.every(layer => map.hasLayer(layer) &&
      globals.sceneByLayer.get(layer).renderer === globals.sceneByLayer.get(overlays[0]).renderer) &&
      overlays.every(layer => map.hasLayer(layer)) &&
      overlays.every(layer => globals.sceneByLayer.get(layer).renderer === globals.sceneByLayer.get(overlays[0]).renderer) &&
      document.querySelectorAll('.leaflet-3d').length === 1;
  });
  this.exampleOverlayChecks = { trafficDisabled, towerDisabled, treesRetained, allDisabled, towerRestored, bothRestored };
  await this.page.evaluate(async () => {
    const { walk } = window.exampleOverlayBefore;
    walk.addTo(map);
    await globals.sceneByLayer.get(walk._walk.layer)._added.promise;
  });
});

Then('the 3D canvas and model attribution follow the enabled overlays', function () {
  for (const [name, value] of Object.entries(this.exampleOverlayChecks)) assert.equal(value, true, name);
});
