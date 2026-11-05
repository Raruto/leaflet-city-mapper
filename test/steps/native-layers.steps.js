import * as globals from '../fixtures/globals.js';


import assert from 'node:assert/strict';
import { Given, Then } from '@cucumber/cucumber';
import { prepare3DChecks } from './3d.steps.js';

Given('the native WebGPU gallery uses the {string} renderer preference', { timeout: 30000 }, async function (renderer) {
  await this.page.goto(this.baseUrl);
  const png = await this.page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#f0f0f0';
    context.fillRect(0, 0, 256, 256);
    return canvas.toDataURL().split(',')[1];
  });
  const tile = route => route.fulfill({ contentType: 'image/png', body: Buffer.from(png, 'base64') });
  await this.context.route('https://tile.openstreetmap.org/**', tile);
  await this.context.route('https://ows.terrestris.de/**', tile);
  this.nativeErrors = [];
  this.page.on('pageerror', error => this.nativeErrors.push(error.message));
  await this.page.goto(`${this.baseUrl}/examples/leaflet-city-mapper-native.html${renderer === 'Canvas' ? '?canvas' : ''}`);
  await this.page.evaluate(async () => {
    window.nativeErrors = [];
    map.on('layeradd', ({ layer }) => layer.on('error', ({ error }) => nativeErrors.push(error.message)));
    await Promise.all(Object.values(map._layers).filter(layer => globals.sceneByLayer.get(layer)._nativeGPU).map(layer => globals.sceneByLayer.get(layer).ready));
  });
  await prepare3DChecks(this.page);
  await this.page.waitForFunction(() => Object.values(map._layers).filter(layer => globals.sceneByLayer.get(layer)._nativeGPU)
    .every(layer => globals.sceneByLayer.get(layer)._nativeGPU.meshes?.size > 0) &&
    globals.sceneByLayer.get(nativeLayers['Marker (default icon)'])._nativeGPU.meshes?.has('shadow'));
});

Then('native map content is drawn by WebGPU while HTML UI remains native', async function () {
  const result = await this.page.evaluate(async () => {
    const layers = Object.values(map._layers).filter(layer => globals.sceneByLayer.get(layer)._nativeGPU);
    const owner = globals.renderers.get(map);
    const target = map.latLngToContainerPoint(nativeLayers.CircleMarker.getLatLng());
    const dpr = globals.sceneByLayer.get(owner).renderer.dpr;
    const pixel = [...await nativeChecks.pixels(owner, Math.round(target.x * dpr),
      globals.sceneByLayer.get(owner).renderer.canvas.height - Math.round(target.y * dpr), 1, 1)];
    const polygon = globals.sceneByLayer.get(nativeLayers['Polygon (hole)'])._nativeGPU.meshes.get('fill');
    const hole = map.latLngToContainerPoint([48.8615, 2.284]);
    const holePixel = [...await nativeChecks.pixels(owner, Math.round(hole.x * dpr),
      globals.sceneByLayer.get(owner).renderer.canvas.height - Math.round(hole.y * dpr), 1, 1)];
    const filled = map.latLngToContainerPoint([48.8605, 2.282]);
    const fillPixel = [...await nativeChecks.pixels(owner, Math.round(filled.x * dpr),
      globals.sceneByLayer.get(owner).renderer.canvas.height - Math.round(filled.y * dpr), 1, 1)];
    const marker = nativeLayers.Marker;
    const rect = marker._icon.getBoundingClientRect(), mapRect = map.getContainer().getBoundingClientRect();
    const markerPixel = [...await nativeChecks.pixels(owner, Math.round((rect.left - mapRect.left + 5) * dpr),
      globals.sceneByLayer.get(owner).renderer.canvas.height - Math.round((rect.top - mapRect.top + 5) * dpr), 1, 1)];
    const domMarker = Object.values(map._layers).find(layer =>
      layer instanceof L.Marker && layer.options.icon instanceof L.DivIcon);
    const hidden = layers.every(layer => [...globals.sceneByLayer.get(layer)._nativeGPU.hidden]
      .every(element => getComputedStyle(element).opacity === '0'));
    nativeLayers.Rectangle.openPopup();
    return {
      count: layers.length,
      shared: layers.every(layer => globals.sceneByLayer.get(globals.sceneByLayer.get(layer)._nativeGPU.backend).renderer === globals.sceneByLayer.get(owner).renderer),
      canvas: map.getContainer().querySelectorAll('canvas.leaflet-3d').length,
      hidden, pixel, holePixel, fillPixel, markerPixel,
      imageDetached: !nativeLayers.ImageOverlay.getElement().isConnected,
      directPaths: !map.getContainer().querySelector('svg.leaflet-zoom-animated') &&
        !Object.values(map._layers).some(layer => layer instanceof L.Renderer),
      detachedTiles: layers.filter(layer => layer instanceof L.GridLayer)
        .every(layer => !layer.getContainer().isConnected &&
          Object.values(layer._tiles).every(tile => !tile.el.isConnected)),
      polygon: polygon.geometry.attributes.position.count > 0,
      dom: !globals.sceneByLayer.get(domMarker)._nativeGPU && getComputedStyle(domMarker._icon).opacity !== '0',
      popup: Boolean(document.querySelector('.leaflet-popup-content')),
      accessible: marker._icon.getAttribute('role') === 'button' && marker._icon.tabIndex >= 0,
      wms: Object.keys(nativeLayers['TileLayer.WMS']._tiles).length > 0,
      shadow: globals.sceneByLayer.get(nativeLayers['Marker (default icon)'])._nativeGPU.meshes.has('shadow'),
      errors: nativeErrors,
    };
  });
  assert.ok(result.count >= 16, JSON.stringify(result));
  assert.equal(result.shared, true);
  assert.equal(result.canvas, 1);
  for (const key of ['hidden', 'imageDetached', 'directPaths', 'detachedTiles', 'polygon', 'dom', 'popup', 'accessible', 'wms', 'shadow']) {
    assert.equal(result[key], true, key);
  }
  assert.ok(result.pixel[1] > result.pixel[0] * 2 && result.pixel[3] === 255, `CircleMarker: ${result.pixel}`);
  assert.ok(result.fillPixel[0] > result.fillPixel[1], `Polygon fill: ${result.fillPixel}`);
  assert.ok(result.holePixel[0] > 200 && result.holePixel[1] > 200, `Polygon hole: ${result.holePixel}`);
  assert.ok(result.markerPixel[0] > result.markerPixel[1] * 2, `Marker: ${result.markerPixel}`);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(this.nativeErrors, []);
});

Then('native marker scratch transforms match independent DOM matrix projections', async function () {
  const result = await this.page.evaluate(async base => {
    const [{ markerQuadCorners }, { markerCameraIconPoint }, { localPosition }] = await Promise.all([
      import(`${base}/src/core/markerQuadCorners.js`),
      import(`${base}/src/core/markerCameraIconPoint.js`),
      import(`${base}/src/core/localPosition.js`),
    ]);
    let error = 0, stable = true, independent = true;
    for (const source of [nativeLayers.Marker, nativeLayers['Marker (default icon)']]) {
      const state = globals.sceneByLayer.get(source)._nativeGPU, backend = globals.sceneByLayer.get(state.backend);
      for (const key of ['icon', 'shadow']) {
        const image = source[key === 'icon' ? '_icon' : '_shadow'];
        if (!(image instanceof HTMLImageElement)) continue;
        const world = new DOMPoint(...localPosition(state, source.getLatLng()), 1)
          .matrixTransform(new DOMMatrix(backend.root.worldMatrix));
        const clip = world.matrixTransform(new DOMMatrix(backend.camera.projectionViewMatrix));
        const inverse = new DOMMatrix(backend.camera.projectionViewMatrix).inverse();
        const toLocal = new DOMMatrix(backend.root.worldMatrix).inverse();
        const options = source.options.icon.options, size = map.getSize();
        const dimensions = options[key === 'shadow' ? 'shadowSize' : 'iconSize'] || [image.naturalWidth, image.naturalHeight];
        const width = dimensions.x ?? dimensions[0], height = dimensions.y ?? dimensions[1];
        const anchor = (key === 'shadow' && options.shadowAnchor) || options.iconAnchor || [Math.floor(width / 2), Math.floor(height / 2)];
        const center = new L.Point((clip.x / clip.w + 1) * size.x / 2, (1 - clip.y / clip.w) * size.y / 2);
        const left = center.x - (anchor.x ?? anchor[0]), top = center.y - (anchor.y ?? anchor[1]);
        const expected = [[left, top], [left + width, top], [left, top + height], [left + width, top + height]].map(([x, y]) => {
          const offset = markerCameraIconPoint(source, x - center.x, y - center.y);
          const p = new DOMPoint((center.x + offset.x) / size.x * 2 - 1,
            1 - (center.y + offset.y) / size.y * 2, clip.z / clip.w, 1).matrixTransform(inverse);
          const local = new DOMPoint(p.x / p.w, p.y / p.w, p.z / p.w, 1).matrixTransform(toLocal);
          return [local.x, local.y, local.z];
        });
        const actual = markerQuadCorners(state, key, image), cache = state.markerMatrices;
        const saved = structuredClone(actual);
        markerQuadCorners(state, key, image);
        stable &&= state.markerMatrices === cache;
        independent &&= JSON.stringify(actual) === JSON.stringify(saved) && actual[0] !== actual[1];
        for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
          error = Math.max(error, Math.abs(actual[i][j] - expected[i][j]));
        }
      }
    }
    return { error, stable, independent };
  }, this.baseUrl);
  assert.ok(result.error < 1e-5, JSON.stringify(result));
  assert.equal(result.stable, true);
  assert.equal(result.independent, true);
});

Then('native rendering avoids DOM geometry reads and pan-time path rebuilds', async function () {
  const result = await this.page.evaluate(async () => {
    map.closePopup();
    const owner = globals.renderers.get(map), backend = globals.sceneByLayer.get(nativeLayers.Marker)._nativeGPU.backend;
    const paths = Object.values(map._layers).filter(layer => layer instanceof L.Path);
    const positions = paths.flatMap(layer => [...globals.sceneByLayer.get(layer)._nativeGPU.meshes.values()])
      .map(mesh => ({ mesh, buffer: mesh.geometry.attributes.position.buffer,
        data: [...mesh.geometry.attributes.position.data] }));
    let layouts = 0, uploads = 0, createdBuffers = 0;
    const elements = Object.values(map._layers).filter(layer => layer instanceof L.Marker)
      .flatMap(layer => [layer._icon, layer._shadow]).filter(Boolean);
    const descriptors = elements.map(element => Object.getOwnPropertyDescriptor(element, 'getBoundingClientRect'));
    const getStyle = window.getComputedStyle, write = globals.sceneByLayer.get(owner).renderer.device.queue.writeBuffer,
      create = globals.sceneByLayer.get(owner).renderer.device.createBuffer;
    for (const element of elements) {
      element.getBoundingClientRect = () => { layouts++; throw new Error('Marker layout read during rendering'); };
    }
    window.getComputedStyle = (...args) => { layouts++; return getStyle(...args); };
    const buffers = new Set(positions.map(entry => entry.buffer));
    globals.sceneByLayer.get(owner).renderer.device.queue.writeBuffer = function (buffer, ...args) {
      if (buffers.has(buffer)) uploads++;
      return write.call(this, buffer, ...args);
    };
    globals.sceneByLayer.get(owner).renderer.device.createBuffer = function (...args) {
      createdBuffers++;
      return create.apply(this, args);
    };
    try {
      nativeChecks.render.render(owner);
      uploads = createdBuffers = 0;
      for (let frame = 0; frame < 5; frame++) {
        map.panBy([1, 0], { animate: false });
        nativeChecks.render.render(owner);
      }
      const retained = positions.every(({ mesh, buffer, data }) =>
        mesh.geometry.attributes.position.buffer === buffer &&
        data.every((value, i) => value === mesh.geometry.attributes.position.data[i]));
      const compactCircle = globals.sceneByLayer.get(nativeLayers.CircleMarker)._nativeGPU.meshes.get('stroke').geometry.attributes.position.count < 200;
      const tiles = nativeLayers.TileLayer, tileMeshes = [...globals.sceneByLayer.get(tiles)._nativeGPU.meshes.values()];
      const tileBuffers = new Set(tileMeshes.map(mesh => mesh.geometry.attributes.position.buffer));
      let tileUploads = 0;
      globals.sceneByLayer.get(owner).renderer.device.queue.writeBuffer = function (buffer, ...args) {
        if (tileBuffers.has(buffer)) tileUploads++;
        return write.call(this, buffer, ...args);
      };
      CityMapper.setOpacity(tiles, 0.7);
      tiles.fire('tileload');
      nativeChecks.render.render(owner);
      const sharedTileProgram = new Set(tileMeshes.map(mesh => mesh.program)).size === 1;
      CityMapper.setOpacity(tiles, 1);
      return { layouts, uploads, createdBuffers, retained, compactCircle, marker: globals.sceneByLayer.get(backend).root.children.length > 0,
        sharedTileProgram, tileUploads, errors: nativeErrors };
    } finally {
      window.getComputedStyle = getStyle;
      globals.sceneByLayer.get(owner).renderer.device.queue.writeBuffer = write;
      globals.sceneByLayer.get(owner).renderer.device.createBuffer = create;
      elements.forEach((element, index) => {
        if (descriptors[index]) Object.defineProperty(element, 'getBoundingClientRect', descriptors[index]);
        else delete element.getBoundingClientRect;
      });
    }
  });
  assert.deepEqual(result, { layouts: 0, uploads: 0, createdBuffers: 0, retained: true, compactCircle: true,
    marker: true, sharedTileProgram: true, tileUploads: 0, errors: [] });
});

Then('native popups and tooltips remain above the GPU canvas', async function () {
  const result = await this.page.evaluate(async () => {
    const layer = nativeLayers.Rectangle;
    CityMapper.setBearing(map, 30); CityMapper.setPitch(map, 35);
    const owner = globals.renderers.get(map);
    nativeChecks.render.render(owner);
    const crs = map.options.crs, latlng = nativeLayers.CircleMarker.getLatLng(),
      origin = crs.project(globals.sceneByLayer.get(owner)._sceneOrigin), point = crs.project(latlng),
      metres = Math.cos(globals.sceneByLayer.get(owner)._sceneOrigin.lat * Math.PI / 180);
    const clip = new DOMPoint((point.x - origin.x) * metres, 0, -(point.y - origin.y) * metres, 1)
      .matrixTransform(new DOMMatrix(globals.sceneByLayer.get(owner).camera.projectionViewMatrix));
    const projected = new L.Point((clip.x / clip.w + 1) * map.getSize().x / 2,
      (1 - clip.y / clip.w) * map.getSize().y / 2);
    const cameraAligned = projected.distanceTo(map.latLngToContainerPoint(latlng)) < 1;
    layer.openPopup();
    await new Promise(requestAnimationFrame);
    const popup = layer.getPopup().getElement();
    const rect = popup.querySelector('.leaflet-popup-content').getBoundingClientRect();
    const visible = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
      .some(element => popup.contains(element));
    const canvas = globals.sceneByLayer.get(globals.renderers.get(map)).renderer.canvas;
    const pane = map.getPane('webgpuPane'), mapPane = map.getPane('mapPane');
    const below = Number(getComputedStyle(pane).zIndex) < Number(getComputedStyle(mapPane).zIndex);
    map.closePopup();
    layer.openTooltip();
    await new Promise(requestAnimationFrame);
    const tooltip = layer.getTooltip().getElement(), tip = tooltip.getBoundingClientRect();
    const previous = tooltip.style.pointerEvents;
    tooltip.style.pointerEvents = 'auto';
    const tipVisible = document.elementsFromPoint(tip.left + tip.width / 2, tip.top + tip.height / 2)
      .some(element => tooltip.contains(element));
    tooltip.style.pointerEvents = previous;
    layer.closeTooltip();
    CityMapper.setPitch(map, 80);
    await new Promise(requestAnimationFrame);
    const sky = globals.cameraByMap.get(map)._pitchSky, bounds = map.getContainer().getBoundingClientRect();
    const skyVisible = sky && getComputedStyle(sky).display !== 'none' && sky.clientHeight > 0;
    const aboveSky = skyVisible && Number(getComputedStyle(pane).zIndex) > Number(getComputedStyle(sky).zIndex);
    const canvasPointer = canvas.style.pointerEvents, skyPointer = sky?.style.pointerEvents;
    canvas.style.pointerEvents = 'auto';
    if (sky) sky.style.pointerEvents = 'auto';
    const unclipped = document.elementFromPoint(bounds.left + bounds.width / 2,
      bounds.top + sky.clientHeight / 2) === canvas;
    canvas.style.pointerEvents = canvasPointer;
    sky.style.pointerEvents = skyPointer;
    CityMapper.setBearing(map, 0); CityMapper.setPitch(map, 0);
    return { visible, tipVisible, below, aboveSky, unclipped, cameraAligned,
      untransformed: canvas.parentNode.parentNode === map.getContainer() };
  });
  assert.deepEqual(result, { visible: true, tipVisible: true, below: true, aboveSky: true, unclipped: true,
    cameraAligned: true, untransformed: true });
});

Then('native layer changes, interactions and removal preserve Leaflet behavior', { timeout: 30000 }, async function () {
  const result = await this.page.evaluate(async () => {
    map.closePopup();
    const path = nativeLayers.Rectangle, marker = nativeLayers.Marker;
    const backend = globals.sceneByLayer.get(path)._nativeGPU.backend;
    const first = globals.sceneByLayer.get(path)._nativeGPU.meshes.get('fill');
    const previous = [...first.geometry.attributes.position.data];
    path.setBounds([[48.858, 2.300], [48.861, 2.306]]).setStyle({ fillColor: '#0080ff', fillOpacity: 0.8 });
    CityMapper.setOpacity(marker.setLatLng([48.860, 2.2945]), 0.5);
    nativeLayers.CircleMarker.setRadius(25);
    const circle = nativeLayers.Circle;
    const before = circle.getBounds();
    map.setView([48.8585, 2.2948], 16, { animate: false });
    CityMapper.setBearing(map, 30); CityMapper.setPitch(map, 35);
    const circleBounds = before.equals(circle.getBounds(), 0.00001);
    await new Promise(requestAnimationFrame);
    nativeChecks.render.render(globals.sceneByLayer.get(backend)._shared);
    const changed = globals.sceneByLayer.get(path)._nativeGPU.meshes.get('fill');
    const updated = previous.some((value, index) => value !== changed.geometry.attributes.position.data[index]);
    const style = changed.program.uniforms.baseColor.value;
    const markerOpacity = globals.sceneByLayer.get(marker)._nativeGPU.meshes.get('icon').program.uniforms.opacity.value;
    const single = document.querySelectorAll('canvas.leaflet-3d').length === 1;
    path.remove();
    const removed = !globals.sceneByLayer.get(path)._nativeGPU && globals.sceneByLayer.get(backend).root.children.length === 0;
    path.addTo(map);
    await globals.sceneByLayer.get(path).ready;
    const readded = globals.sceneByLayer.get(path)._nativeGPU.meshes.size > 0 && globals.sceneByLayer.get(path)._nativeGPU.backend !== backend;
    const group = nativeLayers.FeatureGroup, child = group.getLayers()[0];
    group.remove();
    const groupRemoved = !globals.sceneByLayer.get(child)._nativeGPU;
    group.addTo(map);
    await globals.sceneByLayer.get(child).ready;
    const grouped = Boolean(globals.sceneByLayer.get(child)._nativeGPU.meshes.size);
    const pending = new L.CircleMarker(map.getCenter()).addTo(map);
    pending.remove();
    await globals.sceneByLayer.get(pending).ready;
    const cancelled = !globals.sceneByLayer.get(pending)._nativeGPU;
    const overlay = nativeLayers.ImageOverlay;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 32;
    const context = canvas.getContext('2d');
    context.fillStyle = '#2020ff'; context.fillRect(0, 0, 32, 32);
    const url = canvas.toDataURL(), loaded = new Promise(resolve => overlay.once('load', resolve));
    CityMapper.setOpacity(overlay.setUrl(url), 0.4);
    await loaded;
    nativeChecks.render.render(globals.sceneByLayer.get(globals.sceneByLayer.get(overlay)._nativeGPU.backend)._shared);
    const imageChanged = globals.sceneByLayer.get(overlay)._nativeGPU.meshes.get('image').program.uniforms.baseTexture.value.url === url &&
      globals.sceneByLayer.get(overlay)._nativeGPU.meshes.get('image').program.uniforms.opacity.value === 0.4;
    return { updated, style, markerOpacity, single, removed, readded, groupRemoved, grouped, cancelled, imageChanged, circleBounds,
      errors: nativeErrors };
  });
  for (const key of ['updated', 'single', 'removed', 'readded', 'groupRemoved', 'grouped', 'cancelled', 'imageChanged', 'circleBounds']) {
    assert.equal(result[key], true, key);
  }
  assert.deepEqual(result.style, [0, 128 / 255, 1]);
  assert.equal(result.markerOpacity, 0.5);
  assert.deepEqual(result.errors, []);
  await this.page.evaluate(() => { CityMapper.setPitch(map, 0); CityMapper.setBearing(map, 0); });
  const point = await this.page.evaluate(() => {
    const p = map.latLngToContainerPoint(nativeLayers.CircleMarker.getLatLng());
    const rect = map.getContainer().getBoundingClientRect();
    return { x: rect.left + p.x, y: rect.top + p.y };
  });
  await this.page.mouse.click(point.x, point.y);
  await this.page.waitForFunction(() => document.querySelector('.leaflet-popup-content')?.textContent === 'CircleMarker');
  await this.page.evaluate(() => map.closePopup());
  await this.page.mouse.move(10, 10);
  await this.page.mouse.move(point.x, point.y);
  await this.page.waitForFunction(() => document.querySelector('.leaflet-tooltip')?.textContent === 'CircleMarker');
  const groupedPoint = await this.page.evaluate(() => {
    const group = nativeLayers.FeatureGroup, child = group.getLayers()[0];
    child.setLatLng([48.859, 2.295]);
    window.groupClicks = 0;
    group.on('click', () => groupClicks++);
    nativeChecks.render.render(globals.sceneByLayer.get(globals.sceneByLayer.get(child)._nativeGPU.backend)._shared);
    const p = map.latLngToContainerPoint(child.getLatLng()), rect = map.getContainer().getBoundingClientRect();
    return { x: rect.left + p.x, y: rect.top + p.y };
  });
  await this.page.mouse.click(groupedPoint.x, groupedPoint.y);
  await this.page.waitForFunction(() => window.groupClicks === 1 &&
    document.querySelector('.leaflet-popup-content')?.textContent === 'FeatureGroup');
  await this.page.evaluate(() => map.closePopup());
  const markerStart = await this.page.evaluate(() => {
    const marker = nativeLayers.Marker;
    const rect = marker._icon.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, lat: marker.getLatLng().lat };
  });
  await this.page.mouse.move(markerStart.x, markerStart.y);
  await this.page.mouse.down();
  await this.page.mouse.move(markerStart.x + 45, markerStart.y + 30, { steps: 8 });
  await this.page.mouse.up();
  const dragged = await this.page.evaluate(start => {
    const marker = nativeLayers.Marker;
    nativeChecks.render.render(globals.sceneByLayer.get(globals.sceneByLayer.get(marker)._nativeGPU.backend)._shared);
    return Math.abs(marker.getLatLng().lat - start) > 1e-6 && globals.sceneByLayer.get(marker)._nativeGPU.meshes.has('icon');
  }, markerStart.lat);
  assert.equal(dragged, true);
  const teardown = await this.page.evaluate(() => {
    map.remove();
    return { disposed: !globals.renderers.has(map) && document.querySelectorAll('canvas.leaflet-3d').length === 0,
      errors: nativeErrors };
  });
  assert.deepEqual(teardown, { disposed: true, errors: [] });
  assert.deepEqual(this.nativeErrors, []);
});

Then('HTML grid tiles report an error instead of silently disappearing', async function () {
  const message = await this.page.evaluate(async () => {
    const layer = new L.GridLayer();
    const error = new Promise(resolve => layer.once('error', event => resolve(event.error.message)));
    layer.addTo(map);
    globals.sceneByLayer.get(layer).ready.catch(error => layer.fire('error', { error }));
    try {
      return await error;
    } finally {
      layer.remove();
    }
  });

  assert.equal(message, 'WebGPU native raster layers require image or canvas tiles');
});

Then('native pointer events respect bubbling and propagation cancellation', async function () {
  const point = await this.page.evaluate(() => {
    const layer = nativeLayers.CircleMarker;
    layer.unbindPopup().unbindTooltip();
    map.setView(layer.getLatLng(), 15, { animate: false });
    nativeChecks.render.render(globals.renderers.get(map));
    const p = map.latLngToContainerPoint(layer.getLatLng()), rect = map.getContainer().getBoundingClientRect();
    window.eventCounts = { map: 0, layer: 0, down: 0, up: 0 };
    map.on('click', () => eventCounts.map++);
    layer.on('click', () => eventCounts.layer++);
    layer.on(L.version.startsWith('2') ? 'pointerdown' : 'mousedown', () => eventCounts.down++);
    layer.on(L.version.startsWith('2') ? 'pointerup' : 'mouseup', () => eventCounts.up++);
    layer.options[L.version.startsWith('2') ? 'bubblingPointerEvents' : 'bubblingMouseEvents'] = false;
    return { x: rect.left + p.x, y: rect.top + p.y };
  });
  await this.page.mouse.click(point.x, point.y);
  assert.deepEqual(await this.page.evaluate(() => eventCounts), { map: 0, layer: 1, down: 1, up: 1 });
  await this.page.evaluate(() => {
    nativeLayers.CircleMarker.options[L.version.startsWith('2') ? 'bubblingPointerEvents' : 'bubblingMouseEvents'] = true;
  });
  await this.page.mouse.click(point.x, point.y);
  assert.deepEqual(await this.page.evaluate(() => eventCounts), { map: 1, layer: 2, down: 2, up: 2 });
  await this.page.evaluate(() => nativeLayers.CircleMarker.on('click', event => L.DomEvent.stopPropagation(event)));
  await this.page.mouse.click(point.x, point.y);
  assert.deepEqual(await this.page.evaluate(() => eventCounts), { map: 1, layer: 3, down: 3, up: 3 });
});

Then('native zoom animation interpolates the GPU camera and accessible marker targets', { timeout: 30000 }, async function () {
  await this.page.evaluate(() => {
    const owner = globals.renderers.get(map), marker = nativeLayers.Marker;
    map.setView(marker.getLatLng(), 15, { animate: false });
    globalThis.cityMapperTestOperations.mapSetPitchAndBearing(map, 50, 35);
    nativeChecks.render.render(owner);
  });
  await this.page.waitForFunction(() => Object.values(nativeLayers).filter(layer => layer instanceof L.GridLayer)
    .every(layer => !CityMapper.isLoading(layer) && Object.values(layer._tiles).every(tile => !tile.current || tile.active)));
  const result = await this.page.evaluate(async () => {
    const owner = globals.renderers.get(map), marker = nativeLayers.Marker;
    const distance = () => Math.hypot(...globals.sceneByLayer.get(owner).camera.position.map((value, i) => value - globals.sceneByLayer.get(owner).camera.target[i]));
    const start = distance(), samples = [];
    map.setZoomAround(new L.Point(500, 300), 16, { animate: true });
    for (let i = 0; i < 24; i++) {
      await new Promise(requestAnimationFrame);
      const dom = L.DomUtil.getPosition(marker._icon).add(map._getMapPanePos());
      const crs = map.options.crs, location = crs.project(marker.getLatLng()), origin = crs.project(globals.sceneByLayer.get(owner)._sceneOrigin);
      const metres = Math.cos(globals.sceneByLayer.get(owner)._sceneOrigin.lat * Math.PI / 180), size = map.getSize();
      const clip = new DOMPoint((location.x - origin.x) * metres, 0, -(location.y - origin.y) * metres, 1)
        .matrixTransform(new DOMMatrix(globals.sceneByLayer.get(owner).camera.projectionViewMatrix));
      const gpu = new L.Point((clip.x / clip.w + 1) * size.x / 2, (1 - clip.y / clip.w) * size.y / 2);
      samples.push({ distance: distance(), error: dom.distanceTo(gpu) });
    }
    const intermediate = samples.filter(sample => sample.distance < start * 0.99 && sample.distance > start * 0.51);
    const cleaned = !globals.cameraByMap.get(map)._cameraView && !map.getContainer().classList.contains('leaflet-camera-zoom');
    return { intermediate: intermediate.length, error: Math.max(...samples.map(sample => sample.error)),
      finalScale: start / distance(), cleaned };
  });
  assert.ok(result.intermediate > 0, `Intermediate camera frames: ${JSON.stringify(result)}`);
  assert.ok(result.error < 2, `Animated DOM/GPU anchor drift: ${result.error}px`);
  assert.ok(Math.abs(result.finalScale - 2) < 0.001, `Final zoom scale: ${result.finalScale}`);
  assert.equal(result.cleaned, true);
});

Then('native icon transitions, hover stacking and closest path points remain available', async function () {
  const result = await this.page.evaluate(async () => {
    const marker = new L.Marker(map.getCenter(), {
      icon: new L.DivIcon({ html: 'HTML' }), riseOnHover: true, draggable: true, autoPan: true,
    }).addTo(map);
    window.changedIconMarker = marker;
    const icon = nativeLayers.Marker.getIcon();
    marker.setIcon(icon);
    await globals.sceneByLayer.get(marker).ready;
    await marker._icon.decode();
    const owner = globals.renderers.get(map);
    nativeChecks.render.render(owner);
    const gpu = globals.sceneByLayer.get(marker)._nativeGPU.meshes.get('icon');
    const adapted = Boolean(gpu) && marker._icon.classList.contains('leaflet-webgpu-target');
    const order = gpu.renderOrder;
    marker.fire(L.version.startsWith('2') ? 'pointerover' : 'mouseover');
    nativeChecks.render.render(owner);
    const raised = gpu.renderOrder > order;
    const retiredIcon = marker._icon;
    marker.setIcon(new L.DivIcon({ html: 'HTML again' }));
    nativeChecks.render.render(owner);
    const html = globals.sceneByLayer.get(marker)._nativeGPU.meshes.size === 0 && !marker._icon.classList.contains('leaflet-webgpu-target');
    marker.setIcon(icon);
    await marker._icon.decode();
    nativeChecks.render.render(owner);
    const restored = globals.sceneByLayer.get(marker)._nativeGPU.meshes.has('icon');
    const retired = !retiredIcon.classList.contains('leaflet-webgpu-target') &&
      globals.sceneByLayer.get(marker)._nativeGPU.hidden.size <= 2;
    const path = nativeLayers.Polyline;
    const closest = path.closestLayerPoint(map.latLngToLayerPoint(path.getLatLngs()[0]));
    const closestPoint = closest && closest.distance < 1;
    const shadowMarker = nativeLayers['Marker (default icon)'];
    shadowMarker.options.keepUpright = true;
    shadowMarker.options.scale = 2;
    CityMapper.setRotation(shadowMarker, Math.PI);
    const upright = globalThis.cityMapperTestOperations.markerCameraIconPoint(shadowMarker, 1, 0).x > 0;
    const shadowScaled = shadowMarker._shadow.style.transform.includes('scale(2)');
    const grid = nativeLayers.GridLayer;
    CityMapper.setZIndex(nativeLayers.TileLayer, 20);
    grid.bringToFront();
    const front = grid.options.zIndex > 20;
    grid.bringToBack();
    const back = grid.options.zIndex < nativeLayers.TileLayer.options.zIndex &&
      grid.options.zIndex < nativeLayers['TileLayer.WMS'].options.zIndex;
    return { adapted, raised, html, restored, retired, closestPoint, upright, shadowScaled, front, back };
  });
  assert.deepEqual(result, { adapted: true, raised: true, html: true, restored: true, retired: true,
    closestPoint: true, upright: true, shadowScaled: true, front: true, back: true });
  const drag = await this.page.evaluate(() => {
    globalThis.cityMapperTestOperations.mapSetPitchAndBearing(map, 45, 30);
    nativeChecks.render.render(globals.renderers.get(map));
    const r = changedIconMarker._icon.getBoundingClientRect(), container = map.getContainer().getBoundingClientRect();
    const point = map.latLngToContainerPoint(changedIconMarker.getLatLng());
    window.expectedDragPoint = point.add([45, 30]);
    return { x: r.left + r.width / 2, y: r.top + r.height / 2,
      edgeX: container.right - 5, edgeY: container.top + container.height / 2 };
  });
  await this.page.mouse.move(drag.x, drag.y);
  await this.page.mouse.down();
  await this.page.mouse.move(drag.x + 45, drag.y + 30, { steps: 6 });
  await this.page.mouse.up();
  const drift = await this.page.evaluate(() =>
    map.latLngToContainerPoint(changedIconMarker.getLatLng()).distanceTo(expectedDragPoint));
  assert.ok(drift < 2, `Marker drag after setIcon: ${drift}px`);
  const center = await this.page.evaluate(() => map.getCenter());
  await this.page.mouse.move(drag.x + 45, drag.y + 30);
  await this.page.mouse.down();
  await this.page.mouse.move(drag.edgeX, drag.edgeY, { steps: 8 });
  await this.page.waitForTimeout(300);
  await this.page.mouse.up();
  assert.ok(await this.page.evaluate(center => map.distance(map.getCenter(), center) > 1, center), 'Marker autoPan moves the map');
});
