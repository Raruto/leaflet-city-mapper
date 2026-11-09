import * as globals from '../fixtures/globals.js';


import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { onPointerMove } from '../../src/picking/onPointerMove.js';
import { hoveredFeatureByLayer } from '../../src/weakmaps/hoveredFeatureByLayer.js';
import { highlightedFeatureByLayer } from '../../src/weakmaps/highlightedFeatureByLayer.js';
import { rootByLayer } from '../../src/weakmaps/rootByLayer.js';
import { cameraByLayer } from '../../src/weakmaps/cameraByLayer.js';
import { rendererByLayer } from '../../src/weakmaps/rendererByLayer.js';

Then('pressed buttons, map dragging and zoom animation suspend hover picking', function () {
  const events = [];
  let moving = false;
  const layer = { _map: { dragging: { moving: () => moving } }, fire: (...args) => events.push(args) };
  const feature = { mesh: { highlight: [0, 3] }, vertexStart: 0 };
  rootByLayer.set(layer, { get children() { throw new Error('Picking must not run during a gesture'); } });
  cameraByLayer.set(layer, {});
  rendererByLayer.set(layer, {});
  try {
    for (const mode of ['left', 'right', 'middle', 'drag', 'zoom']) {
      hoveredFeatureByLayer.set(layer, feature);
      highlightedFeatureByLayer.set(layer, feature);
      feature.mesh.highlight = [0, 3];
      moving = mode === 'drag';
      layer._map._animatingZoom = mode === 'zoom';
      const event = { buttons: { left: 1, right: 2, middle: 4 }[mode] || 0 };
      const before = events.length;
      onPointerMove(layer, event);
      assert.equal(hoveredFeatureByLayer.get(layer), null);
      assert.equal(highlightedFeatureByLayer.get(layer), null);
      assert.equal(feature.mesh.highlight, null);
      assert.equal(events.length, before + 1);
      assert.equal(events.at(-1)[1].feature, null);
      onPointerMove(layer, event);
      assert.equal(events.length, before + 1, 'Clear hover only once per gesture');
    }
    moving = layer._map._animatingZoom = false;
    rootByLayer.set(layer, { children: [] });
    rendererByLayer.delete(layer);
    onPointerMove(layer, { buttons: 0 });
    assert.equal(events.at(-1)[1].originalEvent.buttons, 0, 'Resume normal hover after the gesture');
  } finally {
    for (const field of [hoveredFeatureByLayer, highlightedFeatureByLayer, rootByLayer, cameraByLayer, rendererByLayer]) field.delete(layer);
  }
});

Then('dragging keeps GPU traffic animated without hover picking or lane requests', { timeout: 60000 }, async function () {
  let requests = 0;
  await this.context.route('**/drag-lanes.geojson', route => {
    requests++;
    return route.fulfill({ json: { type: 'FeatureCollection', features: [{
      type: 'Feature', properties: { flow: 1200, elevation: 0 },
      geometry: { type: 'LineString', coordinates: [[2.29, 48.85826], [2.3, 48.85826]] },
    }] } });
  });
  await this.page.evaluate(async () => {
    window.dragTraffic = new L.Layer({ source: { type: 'traffic', url: 'drag-lanes.geojson', speed: 8 } }).addTo(test3d.map);
    await globals.sceneByLayer.get(dragTraffic).ready;
    window.dragHovers = 0;
    dragTraffic.on('featurehover', () => dragHovers++);
    window.readDragVehicle = async () => {
      const state = globals.trafficByLayer.get(dragTraffic), { device } = state.gpu;
      const buffer = device.createBuffer({ size: 12, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
      const encoder = device.createCommandEncoder();
      encoder.copyBufferToBuffer(state.mesh.geometry.attributes.position.buffer, 0, buffer, 0, 12);
      device.queue.submit([encoder.finish()]);
      await buffer.mapAsync(GPUMapMode.READ);
      const values = [...new Float32Array(buffer.getMappedRange())];
      buffer.unmap(); buffer.destroy();
      return values;
    };
  });
  await this.page.waitForFunction(() => globals.trafficByLayer.get(dragTraffic)?.mesh);
  const container = this.page.locator('#first'), rect = await container.boundingBox();
  await this.page.mouse.move(rect.x + 180, rect.y + 150);
  const before = await this.page.evaluate(() => readDragVehicle());
  await this.page.mouse.down();
  try {
    await this.page.mouse.move(rect.x + 200, rect.y + 170, { steps: 5 });
    const start = await this.page.evaluate(() => {
      window.dragFrames = 0;
      const owner = globals.sceneByLayer.get(dragTraffic)._shared;
      const context = globals.sceneByLayer.get(owner).renderer.context;
      const original = context.getCurrentTexture;
      window.restoreDragContext = () => { context.getCurrentTexture = original; };
      context.getCurrentTexture = function () { dragFrames++; return original.call(this); };
      return { hovers: dragHovers, center: test3d.map.getCenter() };
    });
    for (let i = 0; i < 20; i++) {
      await this.page.mouse.move(rect.x + 200 + i * 2, rect.y + 170);
      await this.page.waitForTimeout(25);
    }
    const result = await this.page.evaluate(async () => ({
      after: await readDragVehicle(), hovers: dragHovers, frames: dragFrames,
      center: test3d.map.getCenter(), moving: test3d.map.dragging.moving(),
      stale: globals.trafficByLayer.get(dragTraffic).stale,
    }));
    assert.equal(result.moving, true);
    assert.equal(result.hovers, start.hovers, 'Do not raycast while dragging');
    assert.equal(result.stale, true, 'Do not reconstruct GPU traffic vertices on the CPU');
    assert.ok(result.frames >= 2, 'Render vehicles while the mouse is still held');
    assert.ok(result.after.some((value, i) => Math.abs(value - before[i]) > 0.05), 'GPU vertices must move before mouseup');
    assert.notDeepEqual(result.center, start.center);
    assert.equal(requests, 1, 'Panning must not reload traffic lanes');
  } finally {
    await this.page.evaluate(() => window.restoreDragContext?.());
    await this.page.mouse.up();
  }
  await this.page.waitForTimeout(300);
  const hovers = await this.page.evaluate(() => dragHovers);
  await this.page.mouse.move(rect.x + 245, rect.y + 175);
  assert.ok(await this.page.evaluate(() => dragHovers) > hovers, 'Resume hover after mouseup');
  await this.page.evaluate(() => dragTraffic.remove());
});

Then('DOM tooltip content stays inside the map without interpreting text as HTML', async function () {
  const result = await this.page.evaluate(async () => {
    const map = test3d.map, container = map.getContainer();
    container.style.cursor = 'crosshair';
    const node = document.createElement('div');
    node.textContent = '<img src=x onerror=alert(1)>';
    const layer = new L.Layer({ source: { type: 'vector', tooltip: () => node } }).addTo(map);
    await nativeChecks.ready(layer);
    const rect = container.getBoundingClientRect();
    const feature = { id: 'dom', model: {}, properties: {} };
    const position = {
      clientX: rect.right - 2, clientY: rect.bottom - 2,
    };
    globals.sceneByLayer.get(layer).hoveredFeature = feature;
    nativeChecks.picking.showFeature(layer, feature, position);
    const tooltip = globals.sceneByLayer.get(layer)._tooltip;
    const bounds = tooltip.getBoundingClientRect();
    const contained = bounds.left >= rect.left && bounds.right <= rect.right &&
      bounds.top >= rect.top && bounds.bottom <= rect.bottom;
    const literal = tooltip.firstChild === node && !tooltip.querySelector('img') &&
      tooltip.textContent === '<img src=x onerror=alert(1)>';
    const shown = !tooltip.hidden && container.style.cursor === 'pointer';
    globals.sceneByLayer.get(layer).hoveredFeature = null;
    nativeChecks.picking.showFeature(layer, null);
    const restored = tooltip.hidden && container.style.cursor === 'crosshair' && !globals.sceneByLayer.get(layer).hoveredFeature;
    layer.remove();
    const cleaned = !tooltip.isConnected && container.style.cursor === 'crosshair';
    container.style.cursor = '';
    return { contained, literal, shown, restored, cleaned };
  });
  for (const [name, value] of Object.entries(result)) assert.equal(value, true, name);
});

Then('3D click reports the picked object without changing the map view', { timeout: 60000 }, async function () {
  const result = await this.page.evaluate(async () => {
    const map = test3d.map;
    map.options.zoomAnimation = false;
    map.options.maxZoom = 24;
    const origin = new L.Layer({ source: { type: 'vector' } }).addTo(map);
    const far = new L.Layer({ source: { type: 'vector', center: [48.85835, 2.29465], tooltip: () => 'Far' } }).addTo(map);
    const near = new L.Layer({ source: { type: 'vector', center: [48.85835, 2.29465], tooltip: () => 'Near' } }).addTo(map);
    await Promise.all([origin, far, near].map(nativeChecks.ready));
    for (const [layer, height] of [[far, 0], [near, 20]]) {
      globals.sceneByLayer.get(layer).model = nativeChecks.group();
      globals.sceneByLayer.get(layer).model.id = height ? 'near' : 'far';
      const mesh = nativeChecks.mesh(layer, {
        position: [-60, height, -60, 0, height, 60, 60, height, -60],
        normal: [0, 1, 0, 0, 1, 0, 0, 1, 0],
        color: [1, 0, 0, 1, 0, 0, 1, 0, 0],
      });
      nativeChecks.graph.setParent(mesh, globals.sceneByLayer.get(layer).model);
      nativeChecks.graph.setParent(globals.sceneByLayer.get(layer).model, globals.sceneByLayer.get(layer).root);
      nativeChecks.render.update(layer);
    }
    origin.remove();
    const container = map.getContainer();
    const position = () => {
      nativeChecks.render.render(globals.sceneByLayer.get(near)._shared);
      const world = new DOMPoint(0, 20, 0, 1).matrixTransform(new DOMMatrix(globals.sceneByLayer.get(near).root.worldMatrix));
      const point = world.matrixTransform(new DOMMatrix(globals.sceneByLayer.get(near).camera.projectionViewMatrix));
      const x = point.x / point.w, y = point.y / point.w;
      const rect = container.getBoundingClientRect();
      return { clientX: rect.left + (x + 1) * rect.width / 2,
        clientY: rect.top + (1 - y) * rect.height / 2 };
    };
    let nearClicks = 0, farClicks = 0;
    near.on('featureclick', ({ feature }) => { if (feature) nearClicks++; });
    far.on('featureclick', ({ feature }) => { if (feature) farClicks++; });
    const click = position();
    const event = new MouseEvent('click', click);
    const firstZoom = map.getZoom();
    const firstCenter = map.getCenter();
    let movements = 0;
    const onMove = () => movements++;
    map.on('movestart zoomstart', onMove);
    container.dispatchEvent(event);
    await new Promise(requestAnimationFrame);
    const unchanged = map.getZoom() === firstZoom && map.getCenter().equals(firstCenter) && movements === 0;
    const diagnostic = { zoom: map.getZoom(), center: map.getCenter(), nearClicks, farClicks };
    const sharedPicking = nearClicks === 1 && farClicks === 1;
    container.dispatchEvent(new MouseEvent('click', position()));
    const repeatedClickStable = map.getZoom() === firstZoom && map.getCenter().equals(firstCenter) && movements === 0;
    const tooltipShown = !globals.sceneByLayer.get(near)._tooltip.hidden && globals.sceneByLayer.get(near)._tooltip.textContent === 'Near';
    const center = map.getCenter();
    container.dispatchEvent(new MouseEvent('click', { clientX: -1000, clientY: -1000 }));
    const emptyUnchanged = map.getZoom() === firstZoom && map.getCenter().equals(center);
    let zoomStable = true;
    diagnostic.poses = [];
    const pickedMesh = globals.sceneByLayer.get(near).model.children[0];
    for (const [pitch, bearing] of [[0, 0], [45, 90], [75, 270], [85, 180]]) {
      testOperations.setPitch(map, pitch);
      testOperations.setBearing(map, bearing);
      map.setView(globals.sceneByLayer.get(near).location, 22, { animate: false });
      const zoom = map.getZoom(), center = map.getCenter();
      movements = 0;
      nativeChecks.picking.onClick(near, new MouseEvent('click', position()));
      diagnostic.poses.push({ pitch, bearing, zoom, center });
      zoomStable &&= testOperations.getPitch(map) === pitch && Math.abs(testOperations.getBearing(map) - bearing) < 1e-8;
      nativeChecks.picking.onClick(near, new MouseEvent('click', position()));
      zoomStable &&= map.getZoom() === zoom &&
        map.getCenter().equals(center) && movements === 0;
    }
    map.off('movestart zoomstart', onMove);
    near.remove();
    far.remove();
    origin.remove();
    return { checks: { unchanged, sharedPicking, repeatedClickStable, emptyUnchanged,
      tooltipShown, zoomStable }, diagnostic };
  });
  for (const [name, value] of Object.entries(result.checks)) assert.equal(value, true, `${name}: ${JSON.stringify(result.diagnostic)}`);
});

Then('a 3D layer creates and cleans up its own hover tooltip', { timeout: 60000 }, async function () {
  const result = await this.page.evaluate(async () => {
    const map = test3d.map;
    const layer = new L.Layer({ source: { type: 'vector',
      url: 'paris-buildings.pmtiles',
      style: () => ({ top: 10 }),
      tooltip: feature => `Height: ${feature.properties.height} m` } }).addTo(map);
    await nativeChecks.ready(layer);
    const container = map.getContainer();
    container.style.cursor = 'crosshair';
    const tooltip = container.querySelector('.leaflet-3d-tooltip');
    const created = tooltip.parentElement === container && tooltip.hidden &&
      tooltip.getAttribute('role') === 'tooltip' && tooltip.getAttribute('aria-live') === 'polite';
    const rect = container.getBoundingClientRect();
    const position = { clientX: rect.left + 20, clientY: rect.top + 20 };
    const mesh = nativeChecks.mesh(layer, {
      position: [0, 0, 0, 1, 0, 0, 0, 1, 0],
      normal: [0, 0, 1, 0, 0, 1, 0, 0, 1],
      color: [1, 0, 0, 1, 0, 0, 1, 0, 0],
    });
    const feature = { id: 'test', properties: { height: 10 }, mesh,
      vertexStart: 0, vertexEnd: 3 };
    globals.sceneByLayer.get(layer).hoveredFeature = feature;
    nativeChecks.picking.setHighlight(layer, feature);
    nativeChecks.picking.showFeature(layer, feature, position);
    const displayed = !tooltip.hidden && tooltip.textContent === 'Height: 10 m' &&
      tooltip.style.left === '32px' && tooltip.style.top === '32px' &&
      container.style.cursor === 'pointer' && globals.sceneByLayer.get(layer).highlightedFeature === feature;
    let clicked;
    layer.on('featureclick', event => { clicked = event; });
    nativeChecks.picking.showFeature(layer, feature, position);
    layer.fire('featureclick', { feature, originalEvent: new MouseEvent('click', position) });
    const clickNotPinned = !tooltip.hidden && clicked.feature === feature && !('selected' in clicked);
    globals.sceneByLayer.get(layer).hoveredFeature = null;
    nativeChecks.picking.setHighlight(layer, null);
    nativeChecks.picking.showFeature(layer, null);
    const hidden = tooltip.hidden && container.style.cursor === 'crosshair' && !globals.sceneByLayer.get(layer).highlightedFeature;
    globals.sceneByLayer.get(layer).hoveredFeature = feature;
    nativeChecks.picking.setHighlight(layer, feature);
    nativeChecks.picking.showFeature(layer, feature, position);
    nativeChecks.picking.onPointerLeave(layer);
    const leaveCleared = tooltip.hidden && container.style.cursor === 'crosshair' && !globals.sceneByLayer.get(layer).highlightedFeature;
    const other = new L.Layer({ source: { type: 'vector',
      center: [map.getCenter().lat, map.getCenter().lng],
      url: 'paris-buildings.pmtiles', style: () => ({ top: 10 }),
      tooltip: () => 'Other feature' } }).addTo(map);
    await nativeChecks.ready(other);
    nativeChecks.picking.showFeature(layer, feature, position);
    nativeChecks.picking.showFeature(other, feature, position);
    layer.remove();
    const sharedCursor = container.style.cursor === 'pointer' && !globals.sceneByLayer.get(other)._tooltip.hidden;
    other.remove();
    const removed = !tooltip.isConnected && !container.querySelector('.leaflet-3d-tooltip') &&
      container.style.cursor === 'crosshair';
    layer.addTo(map);
    const restored = container.querySelector('.leaflet-3d-tooltip');
    const recreated = restored !== tooltip && restored.hidden;
    nativeChecks.picking.showFeature(layer, feature, position);
    layer.remove();
    const restoredCursor = container.style.cursor === 'crosshair';
    for (const attribute of Object.values(mesh.geometry.attributes)) attribute.buffer.destroy();
    mesh.program.pipelineCache.clear();
    container.style.cursor = '';
    return { created, displayed, clickNotPinned, hidden, leaveCleared, sharedCursor, removed, recreated, restoredCursor };
  });
  for (const [name, value] of Object.entries(result)) assert.equal(value, true, name);
});
