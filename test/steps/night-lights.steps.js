import * as globals from '../fixtures/globals.js';


import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';
import { expandLayerControl } from '../fixtures/expandLayerControl.js';

// The lamp style lives in the example page, as the Streetlights layer style.
const lamp = (page, properties = {}) =>
  page.evaluate(properties => streetlights.options.style({ properties }), properties);

Then('a lamp {int} m high with {int} lm at {int} K is {int} m high, lights {float} m scaled by the flux and is warm white',
  async function (height, flux, kelvin, top, radius) {
    const style = await lamp(this.page, { support_hauteur: `${height}.0`, lampe_flux: `${flux}.0`, lampe_temperature_couleur: `${kelvin}.0` });
    assert.equal(style.top, top);
    assert.ok(Math.abs(style.lightRadius - radius * Math.sqrt(flux / 10000)) < 1e-10);
    assert.equal(style.color.r, 1);
    assert.equal(style.color.b, 135 / 255);
  });

Then('a lamp without valid records uses the default {int} m height', async function (top) {
  const defaults = await lamp(this.page);
  assert.equal(defaults.top, top);
  assert.deepEqual(await lamp(this.page, { support_hauteur: 'None', lampe_flux: '-10', lampe_temperature_couleur: '' }), defaults);
});

Then('sodium lamps are warmer than the default and 6500 K lamps are bluish', async function () {
  const defaults = await lamp(this.page), sodium = await lamp(this.page, { lampe_famille: 'Lampe sodium haute pression' });
  assert.ok(sodium.color.b < defaults.color.b);
  const white = await lamp(this.page, { lampe_temperature_couleur: '6500' });
  assert.ok(white.color.b > white.color.r);
});

Then('the light radius stays between {int} and {int} m', async function (low, high) {
  assert.equal((await lamp(this.page, { support_hauteur: 40, lampe_flux: 500000 })).lightRadius, high);
  assert.equal((await lamp(this.page, { support_hauteur: 1, lampe_flux: 10 })).lightRadius, low);
});

Then(/^lamps on "(.+)" have (?:a ([\d.]+) m|no) pole$/, async function (supports, radius) {
  for (const lib_ouvrag of supports.split(', ')) {
    assert.equal((await lamp(this.page, { lib_ouvrag })).poleRadius, Number(radius ?? 0), lib_ouvrag);
  }
});

Then('underground lamps are excluded:', async function (table) {
  for (const { property, value, shown } of table.hashes()) {
    assert.equal(Boolean(await lamp(this.page, { [property]: value })), shown === 'yes', `${property}: ${value}`);
  }
});

Then('streetlights and the Eiffel Tower emit light only during simulated night', { timeout: 120000 }, async function () {
  const errors = [];
  this.page.on('pageerror', error => errors.push(error.message));
  this.page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const loaded = () => this.page.waitForFunction(() => {
    const layer = window.streetlights;
    if (!globals.sceneByLayer.get(layer)?._areas) return false;
    const failed = [...globals.sceneByLayer.get(layer)._areas.values()].find(area => area.error);
    if (failed) throw new Error(failed.error);
    return globals.sceneByLayer.get(layer)._inflight === 0 && [...globals.sceneByLayer.get(layer)._areas.values()].some(area => area.buildings > 0);
  }, null, { timeout: 60000 });
  await loaded();
  await this.page.waitForFunction(() => {
    const owner = globals.renderers.get(map);
    return globals.sceneByLayer.get(owner)?._roofRaster && globals.sceneByLayer.get(globals.cameraByMap.get(map)._terrain3D)?._rasterTiles.size > 0 &&
      !Object.values(map._layers).some(layer => globals.sceneByLayer.get(layer)?.kind === 'raster'
        ? testOperations.isLoading(layer) : layer.isLoading?.()) &&
      [...globals.sceneByLayer.get(owner)._layers].every(layer => !globals.sceneByLayer.get(layer)._3d || !globals.sceneByLayer.get(layer).url || (globals.sceneByLayer.get(layer)._inflight === 0 &&
        [...globals.sceneByLayer.get(layer)._areas.values()].every(area => area.done || area.error)));
  }, null, { timeout: 60000 }).catch(async error => {
    const state = await this.page.evaluate(() => ({
      roof: Boolean(globals.sceneByLayer.get(globals.renderers.get(map))?._roofRaster),
      terrainTiles: globals.sceneByLayer.get(globals.cameraByMap.get(map)._terrain3D)?._rasterTiles?.size,
      layers: Object.values(map._layers).map(layer => {
        const state = globals.sceneByLayer.get(layer);
        return { type: state.kind, url: state.url, loading: state._loadingTiles,
          nativeLoading: layer.isLoading?.(), inflight: state._inflight,
          tiles: state._rasterTiles?.size,
          areas: state._areas && [...state._areas.values()].map(area => ({
            started: area.started, done: area.done, error: area.error,
          })) };
      }),
    }));
    error.message += `\nScene state: ${JSON.stringify(state)}\nPage errors: ${JSON.stringify(errors)}`;
    throw error;
  });
  const result = await this.page.evaluate(async () => {
    const { style: lampStyle, tooltip: lampTooltip } = streetlights.options;
    const layer = streetlights, owner = globals.renderers.get(map);
    const { device, context, canvas, format } = globals.sceneByLayer.get(owner).renderer;
    const gpuErrors = [];
    device.addEventListener('uncapturederror', event => gpuErrors.push(event.error.message));
    const features = globals.sceneByLayer.get(layer).root.children.flatMap(mesh => mesh.extras.featureFaces);
    const actualStyle = lampStyle(features[0]);
    const surfaceOnly = features.every(feature => lampStyle(feature) !== null);
    const poles = [];
    nativeChecks.geometry.lampPostGeometry({ x: 10, y: 20, ground: 3 }, { top: 8, poleRadius: 0.12 },
      (a, ah, b, bh, c, ch) => poles.push([a, ah], [b, bh], [c, ch]));
    const poleBounds = [Math.min(...poles.map(([p, h]) => p.ground + h)),
      Math.max(...poles.map(([p, h]) => p.ground + h))];
    const supportIds = new Set();
    let expectedPoles = 0;
    for (const feature of features) {
      if (!lampStyle(feature).poleRadius) continue;
      const key = feature.properties.cod_ouvrag || feature.id;
      if (!supportIds.has(key)) { supportIds.add(key); expectedPoles++; }
    }
    const poleVertices = globals.sceneByLayer.get(layer).root.children.reduce((sum, mesh) =>
      sum + mesh.geometry.attributes.uv.data.reduce((count, value, i) => count + Number(i % 2 === 0 && value === 3), 0), 0);
    const tooltip = lampTooltip({ properties: { foyer: '<img src=x onerror=alert(1)>', support_hauteur: '7',
      lampe_flux: 'None', lampe_temperature_couleur: '2700', lib_regime: 'HORAIRE EP' } });
    const geometry = [];
    nativeChecks.geometry.lightGeometry({ x: 10, y: 20, ground: 3 }, { top: 8, lightRadius: 12, color: 0xffcc88 },
      (a, ah, b, bh, c, ch) => geometry.push([a, ah], [b, bh], [c, ch]));
    const emitterHeight = geometry.every(([point, height]) => Math.abs(point.ground + height - 11) <= 0.651);
    const date = globals.sceneByLayer.get(sunlightOverlay).control.getContainer().querySelector('input[type=date]');
    const slider = globals.sceneByLayer.get(sunlightOverlay).control.getContainer().querySelector('input[type=range]');
    const select = minute => {
      date.value = '2026-06-21'; slider.value = String(minute);
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      nativeChecks.render.render(owner);
    };
    context.configure({ device, format, alphaMode: 'premultiplied',
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });
    const capture = async () => {
      nativeChecks.render.render(owner);
      const bytesPerRow = Math.ceil(canvas.width * 4 / 256) * 256;
      const buffer = device.createBuffer({ size: bytesPerRow * canvas.height,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
      const encoder = device.createCommandEncoder();
      encoder.copyTextureToBuffer({ texture: context.getCurrentTexture() }, { buffer, bytesPerRow },
        [canvas.width, canvas.height]);
      device.queue.submit([encoder.finish()]);
      await buffer.mapAsync(GPUMapMode.READ);
      const pixels = new Uint8Array(buffer.getMappedRange()).slice();
      buffer.unmap(); buffer.destroy();
      return pixels;
    };
    const brighter = (a, b) => {
      let count = 0;
      for (let i = 0; i < a.length; i += 4) {
        if (a[i] + a[i + 1] + a[i + 2] > b[i] + b[i + 1] + b[i + 2] + 15) count++;
      }
      return count;
    };
    select(0);
    const nightStrength = globals.sceneByLayer.get(owner).renderer.uniformData[55];
    const lit = await capture();
    globals.sceneByLayer.get(layer).root.visible = false;
    const unlit = await capture();
    globals.sceneByLayer.get(layer).root.visible = true;
    const lampPixels = brighter(lit, unlit);
    const tower = layers._layers.find(entry => entry.name === 'Eiffel Tower').layer;
    const programs = new Set();
    nativeChecks.graph.traverse(globals.sceneByLayer.get(tower).root, mesh => { if (mesh.program) programs.add(mesh.program); });
    for (const program of programs) program.nightSparkle = false;
    const darkTower = await capture();
    globals.sceneByLayer.get(tower).root.visible = false;
    const withoutTower = await capture();
    globals.sceneByLayer.get(tower).root.visible = true;
    let towerSurfacePixels = 0;
    for (let i = 0; i < darkTower.length; i += 4) {
      if (Math.abs(darkTower[i] - withoutTower[i]) + Math.abs(darkTower[i + 1] - withoutTower[i + 1]) +
        Math.abs(darkTower[i + 2] - withoutTower[i + 2]) > 3) towerSurfacePixels++;
    }
    for (const program of programs) program.nightSparkle = true;
    const towerPixels = brighter(lit, darkTower);
    // Hide terrain and the luminous sprite triangles: only nearby 3D surfaces can brighten.
    const terrain = [...globals.sceneByLayer.get(owner)._layers].find(layer => globals.sceneByLayer.get(layer)._type === 'terrain');
    globals.sceneByLayer.get(terrain).root.visible = false;
    const ranges = globals.sceneByLayer.get(layer).root.children.map(mesh => [mesh, mesh.geometry.drawRange.count]);
    for (const [mesh] of ranges) mesh.geometry.drawRange.count = 0;
    const objectsLit = await capture();
    globals.sceneByLayer.get(layer).root.visible = false;
    const objectsUnlit = await capture();
    globals.sceneByLayer.get(layer).root.visible = true;
    globals.sceneByLayer.get(terrain).root.visible = true;
    for (const [mesh, count] of ranges) mesh.geometry.drawRange.count = count;
    const objectPixels = brighter(objectsLit, objectsUnlit);
    select(720);
    const dayStrength = globals.sceneByLayer.get(owner).renderer.uniformData[55];
    const dayLit = await capture();
    globals.sceneByLayer.get(layer).root.visible = false;
    const dayWithoutLamps = await capture();
    globals.sceneByLayer.get(layer).root.visible = true;
    const dayLampPixels = brighter(dayLit, dayWithoutLamps) + brighter(dayWithoutLamps, dayLit);
    select(0);
    map.removeLayer(sunlightOverlay);
    nativeChecks.render.render(owner);
    const disabledStrength = globals.sceneByLayer.get(owner).renderer.uniformData[55];
    map.addLayer(sunlightOverlay);
    nativeChecks.render.render(owner);
    window.oldLightMeshes = [...globals.sceneByLayer.get(layer).root.children];
    return {
      count: features.length, ids: features.every(f => f.id === f.properties.foyer),
      surfaceOnly, poleBounds, poleVertices, expectedPoles,
      geometry: geometry.length, emitterHeight,
      validBuffers: globals.sceneByLayer.get(layer).root.children.every(mesh =>
        Object.values(mesh.geometry.attributes).every(attribute => [...attribute.data].every(Number.isFinite))),
      style: actualStyle, safeTooltip: !tooltip.querySelector('img') && tooltip.textContent.includes('<img'),
      explicitEstimates: tooltip.textContent.includes('6000 lm (assumed)') && tooltip.textContent.includes('not measured lux'),
      nightStrength, dayStrength, disabledStrength, lampPixels, dayLampPixels, towerPixels, towerSurfacePixels, objectPixels,
      shared: globals.sceneByLayer.get(layer).renderer === globals.sceneByLayer.get(tower).renderer, gpuErrors,
    };
  });
  assert.ok(result.count > 100, JSON.stringify(result));
  assert.equal(result.ids, true);
  assert.equal(result.geometry, 18);
  assert.equal(result.surfaceOnly, true);
  assert.deepEqual(result.poleBounds, [3, 11.15]);
  assert.ok(result.expectedPoles > 100);
  assert.equal(result.poleVertices, result.expectedPoles * 144);
  for (const key of ['emitterHeight', 'validBuffers', 'safeTooltip', 'explicitEstimates', 'shared']) {
    assert.equal(result[key], true, key);
  }
  assert.equal(result.nightStrength, 1);
  assert.equal(result.dayStrength, 0);
  assert.equal(result.disabledStrength, 0);
  assert.deepEqual(errors, [], JSON.stringify(result));
  assert.deepEqual(result.gpuErrors, []);
  assert.ok(result.lampPixels > 100, `Actual lamp light pixels: ${JSON.stringify(result)}`);
  assert.ok(result.towerPixels > 20, `Actual tower point-light pixels: ${result.towerPixels}`);
  assert.ok(result.towerPixels < result.towerSurfacePixels * 0.35, `Tower must not glow uniformly: ${JSON.stringify(result)}`);
  assert.ok(result.objectPixels > 50, `Lamp illumination on 3D objects, excluding terrain and sprites: ${result.objectPixels}`);
  assert.ok(result.dayLampPixels > 50, `Solid poles must remain visible in daylight: ${JSON.stringify(result)}`);
  assert.deepEqual(result.gpuErrors, []);
  const control = this.page.getByRole('checkbox', { name: 'Streetlights', exact: true });
  await expandLayerControl(this.page);
  await control.uncheck();
  assert.equal(await this.page.evaluate(() => !streetlights._map && globals.sceneByLayer.get(streetlights)._areas.size === 0), true);
  await control.check();
  await loaded();
  assert.equal(await this.page.evaluate(() =>
    globals.sceneByLayer.get(streetlights).root.children.every(mesh => !window.oldLightMeshes.includes(mesh))), true);
  assert.deepEqual(errors, []);
});
