import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';

Then('DOM tooltip content stays inside the map without interpreting text as HTML', async function () {
  const result = await this.page.evaluate(async () => {
    const map = test3d.map, container = map.getContainer();
    container.style.cursor = 'crosshair';
    const node = document.createElement('div');
    node.textContent = '<img src=x onerror=alert(1)>';
    const layer = new L.Layer({ source: { type: '3d', tooltip: () => node } }).addTo(map);
    await nativeChecks.ready(layer);
    const rect = container.getBoundingClientRect();
    const feature = { id: 'dom', model: {}, properties: {} };
    const position = {
      clientX: rect.right - 2, clientY: rect.bottom - 2,
    };
    layer.hoveredFeature = feature;
    nativeChecks.picking.showFeature(layer, feature, position);
    const tooltip = layer._tooltip;
    const bounds = tooltip.getBoundingClientRect();
    const contained = bounds.left >= rect.left && bounds.right <= rect.right &&
      bounds.top >= rect.top && bounds.bottom <= rect.bottom;
    const literal = tooltip.firstChild === node && !tooltip.querySelector('img') &&
      tooltip.textContent === '<img src=x onerror=alert(1)>';
    const shown = !tooltip.hidden && container.style.cursor === 'pointer';
    layer.hoveredFeature = null;
    nativeChecks.picking.showFeature(layer, null);
    const restored = tooltip.hidden && container.style.cursor === 'crosshair' && !layer.hoveredFeature;
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
    const origin = new L.Layer({ source: { type: '3d' } }).addTo(map);
    const far = new L.Layer({ source: { type: '3d', center: [48.85835, 2.29465], tooltip: () => 'Far' } }).addTo(map);
    const near = new L.Layer({ source: { type: '3d', center: [48.85835, 2.29465], tooltip: () => 'Near' } }).addTo(map);
    await Promise.all([origin, far, near].map(nativeChecks.ready));
    for (const [layer, height] of [[far, 0], [near, 20]]) {
      layer.model = nativeChecks.group();
      layer.model.id = height ? 'near' : 'far';
      const mesh = nativeChecks.mesh(layer, {
        position: [-60, height, -60, 0, height, 60, 60, height, -60],
        normal: [0, 1, 0, 0, 1, 0, 0, 1, 0],
        color: [1, 0, 0, 1, 0, 0, 1, 0, 0],
      });
      nativeChecks.graph.setParent(mesh, layer.model);
      nativeChecks.graph.setParent(layer.model, layer.root);
      nativeChecks.render.update(layer);
    }
    origin.remove();
    const container = map.getContainer();
    const position = () => {
      nativeChecks.render.render(near._shared);
      const world = new DOMPoint(0, 20, 0, 1).matrixTransform(new DOMMatrix(near.root.worldMatrix));
      const point = world.matrixTransform(new DOMMatrix(near.camera.projectionViewMatrix));
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
    const tooltipShown = !near._tooltip.hidden && near._tooltip.textContent === 'Near';
    const center = map.getCenter();
    container.dispatchEvent(new MouseEvent('click', { clientX: -1000, clientY: -1000 }));
    const emptyUnchanged = map.getZoom() === firstZoom && map.getCenter().equals(center);
    let zoomStable = true;
    diagnostic.poses = [];
    const pickedMesh = near.model.children[0];
    for (const [pitch, bearing] of [[0, 0], [45, 90], [75, 270], [85, 180]]) {
      map.setPitch(pitch);
      map.setBearing(bearing);
      map.setView(near.location, 22, { animate: false });
      const zoom = map.getZoom(), center = map.getCenter();
      movements = 0;
      nativeChecks.picking.onClick(near, new MouseEvent('click', position()));
      diagnostic.poses.push({ pitch, bearing, zoom, center });
      zoomStable &&= map.getPitch() === pitch && Math.abs(map.getBearing() - bearing) < 1e-8;
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
    const layer = new L.Layer({ source: { type: '3d',
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
    layer.hoveredFeature = feature;
    nativeChecks.picking.setHighlight(layer, feature);
    nativeChecks.picking.showFeature(layer, feature, position);
    const displayed = !tooltip.hidden && tooltip.textContent === 'Height: 10 m' &&
      tooltip.style.left === '32px' && tooltip.style.top === '32px' &&
      container.style.cursor === 'pointer' && layer.highlightedFeature === feature;
    let clicked;
    layer.on('featureclick', event => { clicked = event; });
    nativeChecks.picking.showFeature(layer, feature, position);
    layer.fire('featureclick', { feature, originalEvent: new MouseEvent('click', position) });
    const clickNotPinned = !tooltip.hidden && clicked.feature === feature && !('selected' in clicked);
    layer.hoveredFeature = null;
    nativeChecks.picking.setHighlight(layer, null);
    nativeChecks.picking.showFeature(layer, null);
    const hidden = tooltip.hidden && container.style.cursor === 'crosshair' && !layer.highlightedFeature;
    layer.hoveredFeature = feature;
    nativeChecks.picking.setHighlight(layer, feature);
    nativeChecks.picking.showFeature(layer, feature, position);
    nativeChecks.picking.onPointerLeave(layer);
    const leaveCleared = tooltip.hidden && container.style.cursor === 'crosshair' && !layer.highlightedFeature;
    const other = new L.Layer({ source: { type: '3d',
      center: [map.getCenter().lat, map.getCenter().lng],
      url: 'paris-buildings.pmtiles', style: () => ({ top: 10 }),
      tooltip: () => 'Other feature' } }).addTo(map);
    await nativeChecks.ready(other);
    nativeChecks.picking.showFeature(layer, feature, position);
    nativeChecks.picking.showFeature(other, feature, position);
    layer.remove();
    const sharedCursor = container.style.cursor === 'pointer' && !other._tooltip.hidden;
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
