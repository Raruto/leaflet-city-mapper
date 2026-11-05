import { pluginState } from '../../src/core/pluginState.js';
import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';

Then('shadow maps are reused until geometry, appearance or sunlight changes', { timeout: 30000 }, async function () {
  const result = await this.page.evaluate(async () => {
    const map = test3d.map, layer = CityMapper.layer({ source: { type: '3d' } }).addTo(map);
    await nativeChecks.ready(layer);
    const mesh = nativeChecks.gpu.createMesh(layer, { position: [-20,0,-20,20,0,-20,0,20,20],
      normal: [0,1,0,0,1,0,0,1,0], color: [1,0,0,1,0,0,1,0,0] });
    const begin = GPUCommandEncoder.prototype.beginRenderPass;
    let passes = 0;
    GPUCommandEncoder.prototype.beginRenderPass = function (descriptor) {
      if (!descriptor.colorAttachments.length) passes++;
      return begin.call(this, descriptor);
    };
    pluginState(map)._sunlight = { altitude: 45, direction: [0.2,0.8,0.4] };
    const render = () => { const before = passes; nativeChecks.render.render(pluginState(layer)._shared); return passes - before; };
    try {
      const first = render();
      pluginState(map)._cameraBearing = 25;
      const pan = render();
      mesh.position[0] += 1;
      const moved = render();
      mesh.geometry.attributes.position.data[1] += 1;
      mesh.geometry.attributes.position.needsUpdate = true;
      const geometry = render();
      const stable = render();
      mesh._appearance = 0.5;
      const fading = render();
      pluginState(map)._sunlight.direction[0] += 0.1;
      const sun = render();
      nativeChecks.graph.setParent(mesh, null);
      render();
      const disabled = !pluginState(layer).renderer.sunlight.enabled;
      nativeChecks.graph.setParent(mesh, pluginState(layer).root);
      const restored = render();
      return {first,pan,moved,geometry,stable,fading,sun,disabled,restored};
    } finally {
      GPUCommandEncoder.prototype.beginRenderPass = begin;
      delete pluginState(map)._sunlight;
      nativeChecks.gpu.disposeMesh(layer, mesh);
      layer.remove();
    }
  });
  assert.deepEqual(result, {first:1,pan:0,moved:1,geometry:1,stable:0,fading:1,sun:1,disabled:true,restored:1});
});

Then('sky and terrain change from day to night and celestial bodies follow the camera', { timeout: 90000 }, async function () {
  await this.page.waitForFunction(() => pluginState(sunlightOverlay).control && pluginState(map)._sunlight);
  const result = await this.page.evaluate(async () => {
    const owner = cityMapperTestState.renderers.get(map), { device } = pluginState(owner).renderer;
    const input = pluginState(sunlightOverlay).control.getContainer().querySelector('input[type=range]');
    const date = pluginState(sunlightOverlay).control.getContainer().querySelector('input[type=date]');
    date.value = '2026-06-21';
    const select = minute => {
      input.value = String(minute);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      nativeChecks.render.render(owner);
    };
    pluginState(owner).renderer.context.configure({ device, format: pluginState(owner).renderer.format, alphaMode: 'premultiplied',
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });
    const brightness = async () => {
      const { canvas, context } = pluginState(owner).renderer;
      const bytesPerRow = Math.ceil(canvas.width * 4 / 256) * 256;
      const buffer = device.createBuffer({ size: bytesPerRow * canvas.height,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
      const encoder = device.createCommandEncoder();
      encoder.copyTextureToBuffer({ texture: context.getCurrentTexture() }, { buffer, bytesPerRow },
        [canvas.width, canvas.height]);
      device.queue.submit([encoder.finish()]);
      await buffer.mapAsync(GPUMapMode.READ);
      const pixels = new Uint8Array(buffer.getMappedRange());
      let sum = 0, count = 0;
      for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
        const i = y * bytesPerRow + x * 4;
        if (pixels[i + 3] > 250) { sum += pixels[i] + pixels[i + 1] + pixels[i + 2]; count++; }
      }
      buffer.unmap(); buffer.destroy();
      return { average: sum / count, count };
    };
    select(720);
    const day = await brightness();
    const daySky = map.getContainer().style.getPropertyValue('--leaflet-sky-background');
    select(0);
    const night = await brightness();
    const nightSky = map.getContainer().style.getPropertyValue('--leaflet-sky-background');
    const nightTint = Array.from(pluginState(owner).renderer.uniformData.slice(56, 59));
    CityMapper.setPitch(map, 85);
    const skyApplied = getComputedStyle(pluginState(map)._pitchSky).backgroundImage === nightSky;
    select(300);
    CityMapper.setBearing(map, -pluginState(map)._sunlight.azimuth);
    const sun = pluginState(map)._pitchSky.querySelector('.sunlight-sun');
    const sunVisible = !sun.hidden;
    const sunPosition = [sun.style.left, sun.style.top];
    select(315);
    const sunMoved = sun.style.left !== sunPosition[0] || sun.style.top !== sunPosition[1];
    CityMapper.setBearing(map, CityMapper.getBearing(map) + 180);
    const sunBehind = sun.hidden;
    // Find a low lunar altitude, then face it; the moon is not always opposite the sun.
    let moonMinute;
    for (let minute = 0; minute < 1440; minute += 15) {
      select(minute);
      if (pluginState(map)._sunlight.moon.altitude > 1 && pluginState(map)._sunlight.moon.altitude < 10) { moonMinute = minute; break; }
    }
    if (moonMinute === undefined) throw new Error('No lunar rise/set found on the test date');
    CityMapper.setBearing(map, -pluginState(map)._sunlight.moon.azimuth);
    const moon = pluginState(map)._pitchSky.querySelector('.sunlight-moon');
    const moonVisible = !moon.hidden;
    const moonPosition = [moon.style.left, moon.style.top];
    select((moonMinute + 15) % 1440);
    const moonMoved = moon.style.left !== moonPosition[0] || moon.style.top !== moonPosition[1];
    CityMapper.setPitch(map, 0);
    const hiddenAtZeroPitch = sun.hidden && moon.hidden;
    map.removeLayer(sunlightOverlay);
    nativeChecks.render.render(owner);
    const restored = Array.from(pluginState(owner).renderer.uniformData.slice(56, 59));
    const skyRestored = !map.getContainer().style.getPropertyValue('--leaflet-sky-background');
    return { day, night, daySky, nightSky, nightTint, sunVisible, sunMoved, sunBehind,
      moonVisible, moonMoved, hiddenAtZeroPitch, restored, skyRestored, skyApplied,
      removed: !map.getContainer().querySelector('.sunlight-sun, .sunlight-moon') };
  });
  assert.ok(result.day.count > 10000);
  assert.ok(result.night.average < result.day.average * 0.6, JSON.stringify(result));
  assert.notEqual(result.daySky, result.nightSky);
  assert.ok(result.nightTint[2] > result.nightTint[0]);
  for (const key of ['skyApplied', 'sunVisible', 'sunMoved', 'sunBehind', 'moonVisible', 'moonMoved', 'hiddenAtZeroPitch', 'skyRestored', 'removed']) {
    assert.equal(result[key], true, `${key}: ${JSON.stringify(result)}`);
  }
  assert.deepEqual(result.restored, [1, 1, 1]);
});

Then('the solar control starts at current time and its slider controls the sunlight', { timeout: 60000 }, async function () {
  await this.page.waitForFunction(() => pluginState(sunlightOverlay).control && pluginState(map)._sunlight);
  const initial = await this.page.evaluate(() => ({
    current: Math.abs(pluginState(sunlightOverlay).control.time.getTime() - Date.now()) < 65000 && pluginState(sunlightOverlay).control.live,
    date: pluginState(sunlightOverlay).control.getContainer().querySelector('input[type=date]').value,
    minute: Number(pluginState(sunlightOverlay).control.getContainer().querySelector('input[type=range]').value),
    time: pluginState(sunlightOverlay).control.time.toISOString(),
    inLayers: layers.getContainer().contains(pluginState(sunlightOverlay).control.getContainer()),
    overlays: layers._layers.filter(e => e.overlay).map(e => e.name),
    control: pluginState(sunlightOverlay).control instanceof L.Control.Time,
    nestedStyle: !pluginState(sunlightOverlay).control.getContainer().classList.contains('leaflet-control'),
  }));
  assert.equal(initial.current, true);
  assert.equal(initial.date, initial.time.slice(0, 10));
  assert.equal(initial.minute, Number(initial.time.slice(11, 13)) * 60 + Number(initial.time.slice(14, 16)));
  assert.equal(initial.inLayers, true);
  assert.equal(pluginState(initial).control, true);
  assert.equal(initial.nestedStyle, true);
  assert.deepEqual(initial.overlays, ['Terrain (3D)', 'Buildings', 'Trees', 'Eiffel Tower',
    'Streetlights', 'Traffic', 'Shadows']);
  await this.page.getByLabel('Solar date (UTC)').fill('2026-06-21');
  const slider = this.page.getByRole('slider', { name: 'Time of day (UTC)' });
  await slider.focus();
  await slider.press('Home');
  await slider.press('ArrowRight');
  const selected = await this.page.evaluate(() => ({
    time: pluginState(sunlightOverlay).control.time.toISOString(), live: pluginState(sunlightOverlay).control.live,
    output: pluginState(sunlightOverlay).control.getContainer().querySelector('output').textContent,
    altitude: pluginState(map)._sunlight.altitude,
  }));
  assert.equal(selected.time, '2026-06-21T00:01:00.000Z');
  assert.equal(selected.live, false);
  assert.match(selected.output, /00:01 UTC/);
  assert.ok(selected.altitude < 0);
  await this.page.getByRole('button', { name: 'Now', exact: true }).click();
  assert.equal(await this.page.evaluate(() =>
    pluginState(sunlightOverlay).control.live && Math.abs(pluginState(sunlightOverlay).control.time.getTime() - Date.now()) < 5000), true);
  await this.page.getByLabel('Shadows', { exact: true }).uncheck();
  assert.equal(await this.page.evaluate(() => pluginState(map)._sunlight === undefined), true);
  await this.page.getByLabel('Shadows', { exact: true }).check();
  assert.equal(await this.page.evaluate(() => !!pluginState(map)._sunlight), true);
  await this.page.getByLabel('Solar date (UTC)').fill('');
  assert.match(await this.page.locator('.sunlight-status').textContent(), /Error/);
  assert.equal(await this.page.evaluate(() => pluginState(map)._sunlight === undefined), true);
  await this.page.getByRole('button', { name: 'Now', exact: true }).click();
  assert.equal(await this.page.evaluate(() => !!pluginState(map)._sunlight && pluginState(sunlightOverlay).control.live), true);
  await this.page.evaluate(() => map.removeLayer(sunlightOverlay));
  assert.equal(await this.page.evaluate(() => !pluginState(map)._sunlight && !document.querySelector('.sunlight-control')), true);
});

Then('solar lighting and depth shadows follow the time slider', { timeout: 90000 }, async function () {
  await this.page.waitForFunction(() => pluginState(sunlightOverlay).control);
  const gpuErrors = [];
  this.page.on('console', message => { if (message.type() === 'error') gpuErrors.push(message.text()); });
  await this.page.getByLabel('Solar date (UTC)').fill('2026-06-21');
  await this.page.getByRole('slider', { name: 'Time of day (UTC)' }).evaluate(input => {
    input.value = '720'; input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await this.page.waitForFunction(() => {
    const renderer = pluginState(cityMapperTestState.renderers.get(map)).renderer;
    return pluginState(map)._sunlight?.altitude > 60 && renderer.sunlight.size > 1 && renderer.sunlight.pipeline;
  });
  const result = await this.page.evaluate(async () => {
    const owner = cityMapperTestState.renderers.get(map), renderer = pluginState(owner).renderer;
    nativeChecks.render.render(owner);
    await renderer.device.queue.onSubmittedWorkDone();
    const { device, sunlight } = renderer;
    const depth = device.createBuffer({ size: sunlight.size ** 2 * 4,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
    const encoder = device.createCommandEncoder();
    encoder.copyTextureToBuffer({ texture: sunlight.texture, aspect: 'depth-only' },
      { buffer: depth, bytesPerRow: sunlight.size * 4 }, [sunlight.size, sunlight.size]);
    device.queue.submit([encoder.finish()]);
    await depth.mapAsync(GPUMapMode.READ);
    const depths = new Float32Array(depth.getMappedRange());
    const covered = depths.reduce((sum, value) => sum + Number(value > 0 && value < 1), 0);
    depth.unmap(); depth.destroy();
    renderer.context.configure({ device, format: renderer.format, alphaMode: 'premultiplied',
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });
    const capture = async disabled => {
      const altitude = pluginState(map)._sunlight.altitude;
      if (disabled) pluginState(map)._sunlight.altitude = 2;
      nativeChecks.render.render(owner);
      const width = renderer.canvas.width, height = renderer.canvas.height;
      const bytesPerRow = Math.ceil(width * 4 / 256) * 256;
      const buffer = device.createBuffer({ size: bytesPerRow * height, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
      const encoder = device.createCommandEncoder();
      encoder.copyTextureToBuffer({ texture: renderer.context.getCurrentTexture() },
        { buffer, bytesPerRow }, [width, height]);
      device.queue.submit([encoder.finish()]);
      await buffer.mapAsync(GPUMapMode.READ);
      const pixels = new Uint8Array(buffer.getMappedRange()).slice();
      buffer.unmap(); buffer.destroy();
      pluginState(map)._sunlight.altitude = altitude;
      return pixels;
    };
    let darker = 0;
    const shadowed = await capture(false), unshadowed = await capture(true);
    for (let i = 0; i < shadowed.length; i += 4) {
      if (shadowed[i] + shadowed[i + 1] + shadowed[i + 2] + 10 <
        unshadowed[i] + unshadowed[i + 1] + unshadowed[i + 2]) darker++;
    }
    return {
      altitude: pluginState(map)._sunlight.altitude, size: sunlight.size, dayLight: renderer.uniformData[51],
      covered, darker,
    };
  });
  assert.ok(result.altitude > 64 && result.altitude < 65);
  assert.equal(result.size, 2048);
  assert.equal(result.dayLight, 1);
  assert.ok(result.covered > 100, `Depth map coverage: ${result.covered}`);
  assert.ok(result.darker > 20, `Pixels receiving actual shadows: ${result.darker}`);
  await this.page.getByRole('slider', { name: 'Time of day (UTC)' }).evaluate(input => {
    input.value = '0'; input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await this.page.waitForFunction(() => pluginState(map)._sunlight.altitude < 0);
  assert.equal(await this.page.evaluate(() => {
    const owner = cityMapperTestState.renderers.get(map);
    nativeChecks.render.render(owner);
    return pluginState(owner).renderer.uniformData[51];
  }), 0);
  assert.deepEqual(gpuErrors, []);
});
