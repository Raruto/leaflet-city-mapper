import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Given, Then } from '@cucumber/cucumber';
import { fulfillTrafficRoute } from '../fixtures/traffic-data.js';
import { dependencyFile } from '../fixtures/dependencies.js';

async function assertEngineControl(page, openlayers) {
  const control = page.locator('.map-engine-control');
  const button = control.getByRole('button', { name: `Try it with ${openlayers ? 'Leaflet' : 'OpenLayers'}`, exact: true });
  assert.equal(await button.textContent(), '');
  assert.equal(await control.evaluate((element, openlayers) => {
    const corner = openlayers ? '.ol-city-bottomleft' : '.leaflet-bottom.leaflet-left';
    const rect = element.getBoundingClientRect(), mapRect = map.getContainer().getBoundingClientRect();
    return Boolean(element.closest(corner)) && rect.left - mapRect.left < 20 &&
      rect.top > mapRect.top + mapRect.height / 2;
  }, openlayers), true);
  assert.equal(await button.locator('img').getAttribute('src'), openlayers
    ? 'https://leafletjs.com/docs/images/favicon.svg' : 'https://openlayers.org/theme/img/logo-dark.svg');
  await page.waitForFunction(() => {
    const icon = document.querySelector('.map-engine-control img');
    return icon?.complete && icon.naturalWidth > 0;
  });
  const rect = await button.boundingBox();
  assert.ok(rect.width >= 30 && rect.height >= 30);
  assert.equal(await button.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
  }), true, 'Engine control must not be covered by attribution or status text');
  const overlap = await page.evaluate(async () => {
    const container = map.getContainer(), width = container.style.width;
    const settle = () => new Promise((resolve, reject) => {
      // The test clock's animation frames do not flush native ResizeObserver callbacks.
      const timer = setTimeout(() => {
        observer.disconnect();
        reject(new Error('Attribution footer did not settle'));
      }, 5000);
      const observer = new ResizeObserver(() => { clearTimeout(timer); observer.disconnect(); resolve(); });
      observer.observe(container.querySelector('.map-attribution-footer'));
    });
    const check = () => {
      const control = container.querySelector('.map-engine-control').getBoundingClientRect();
      const attribution = container.querySelector('.leaflet-control-attribution,.ol-attribution')?.getBoundingClientRect();
      if (!attribution) return false;
      const ribbon = document.querySelector('.view-on-github')?.getBoundingClientRect();
      const status = document.querySelector('#status')?.getBoundingClientRect();
      if (control.bottom + 5 > attribution.top ||
        ribbon && ribbon.bottom > attribution.top || status && status.bottom > attribution.top) {
        return { width: container.getBoundingClientRect().width, control: control.toJSON(),
          attribution: attribution.toJSON(), ribbon: ribbon?.toJSON(), status: status?.toJSON(),
          footerHeight: container.style.getPropertyValue('--map-attribution-height') };
      }
      return null;
    };
    try {
      await settle();
      const full = check();
      container.style.width = '280px';
      map.invalidateSize();
      await settle();
      return full || check();
    } finally {
      container.style.width = width;
      map.invalidateSize();
      await settle();
    }
  });
  assert.equal(Boolean(overlap), false,
    `Controls, GitHub link and status must stay above attribution, including in narrow maps: ${JSON.stringify(overlap)}`);
}

async function assertParisAttributions(page) {
  const footer = page.locator('.map-attribution-footer');
  for (const name of ['IGN', 'Etalab 2.0', 'Transit routes: IDFM', 'OpenStreetMap contributors']) {
    assert.equal(await footer.getByRole('link', { name, exact: true }).count(), 1, name);
  }
  assert.equal(await footer.getByRole('link', { name: 'Ville de Paris', exact: true }).count(), 2);
}

Given('the comparison page {string} is open on {word}', { timeout: 30000 }, async function (example, engine) {
  this.page.setDefaultTimeout(10000);
  this.page.setDefaultNavigationTimeout(15000);
  this.comparisonErrors = [];
  this.comparisonLeafletRequests = [];
  this.comparisonExample = example;
  this.page.on('pageerror', error => this.comparisonErrors.push(error.message));
  this.page.on('request', request => {
    if (/\/leaflet@[^/]+\/dist\/.*\.(js|css)/.test(request.url())) this.comparisonLeafletRequests.push(request.url());
  });
  await this.context.route('**/api/explore/v2.1/catalog/datasets/**', fulfillTrafficRoute);
  const png = await this.page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#f0f0f0'; context.fillRect(0, 0, 256, 256);
    return canvas.toDataURL().split(',')[1];
  });
  const tile = route => route.fulfill({ contentType: 'image/png', body: Buffer.from(png, 'base64') });
  await this.context.route('https://tile.openstreetmap.org/**', tile);
  await this.context.route('https://server.arcgisonline.com/**', tile);
  await this.context.route('https://ows.terrestris.de/**', tile);
  const query = engine === 'OpenLayers' ? '&engine=openlayers' : '';
  await this.page.goto(`${this.baseUrl}/examples/${example}?canvas&compare=1${query}#scene`, { waitUntil: 'domcontentloaded' });
  await this.page.waitForFunction(openlayers => globalThis.map && Boolean(map.ol) === openlayers &&
    document.querySelector(openlayers ? '.ol-city-rotate' : 'canvas.leaflet-3d'), engine === 'OpenLayers');
  assert.deepEqual(this.comparisonErrors, []);
});

Then('its button reloads the same scene on OpenLayers', { timeout: 30000 }, async function () {
  await assertEngineControl(this.page, false);
  if (this.comparisonExample === 'leaflet-city-mapper.html') await assertParisAttributions(this.page);
  this.comparisonLeafletRequests.length = 0;
  await this.page.getByRole('button', { name: 'Try it with OpenLayers', exact: true }).click();
  await this.page.waitForFunction(() => globalThis.map?.ol && document.querySelector('.ol-city-rotate'));
  await assertEngineControl(this.page, true);
  if (this.comparisonExample === 'leaflet-city-mapper.html') await assertParisAttributions(this.page);
  const url = new URL(this.page.url());
  assert.equal(url.pathname, `/examples/${this.comparisonExample}`);
  assert.equal(url.searchParams.get('engine'), 'openlayers');
  assert.equal(url.searchParams.has('canvas'), true);
  assert.equal(url.searchParams.get('compare'), '1');
  assert.equal(url.hash, '#scene');
  assert.deepEqual(this.comparisonLeafletRequests, []);
  assert.deepEqual(this.comparisonErrors, []);
});

Then('the OpenLayers comparison scene renders its layers', { timeout: 30000 }, async function () {
  await assertEngineControl(this.page, true);
  if (this.comparisonExample === 'leaflet-city-mapper.html') await assertParisAttributions(this.page);
  assert.deepEqual(this.comparisonLeafletRequests, []);
  await this.page.waitForFunction(() => {
    const layers = Object.values(map._layers);
    const native = layers.filter(layer => globals.sceneByLayer.get(layer)?._nativeGPU);
    return document.querySelector('canvas.leaflet-3d') &&
      native.every(layer => globals.sceneByLayer.get(layer)._nativeGPU.meshes?.size > 0);
  });
  if (this.comparisonExample.includes('-geojson')) {
    await this.page.evaluate(() => testOperations.setPitch(map, 45));
    await this.page.waitForFunction(() => Object.values(map._layers).some(layer =>
      globals.sceneByLayer.get(layer)?._type === 'terrain' &&
      globals.sceneByLayer.get(layer)._terrainReady && globals.sceneByLayer.get(layer)._rasterTiles.size > 0));
    assert.equal(await this.page.evaluate(() => Object.values(map._layers).filter(layer =>
      globals.sceneByLayer.get(layer)?._type === 'raster').length), 2);
    await this.page.locator('#map').dispatchEvent('pointermove', { clientX: 200, clientY: 200 });
    assert.equal(await this.page.locator('.leaflet-lens').isVisible(), true);
    assert.equal(await this.page.evaluate(() => map.getPitch()), 45);
    await this.page.locator('#map').dispatchEvent('pointerleave');
    assert.equal(await this.page.locator('.leaflet-lens').isVisible(), false);
  }
  assert.deepEqual(this.comparisonErrors, []);
});

Then('the OpenLayers native scene renders icons and shadows', { timeout: 30000 }, async function () {
  await this.page.waitForFunction(() => {
    const native = Object.values(map._layers).map(layer => globals.sceneByLayer.get(layer)?._nativeGPU).filter(Boolean);
    return native.length >= 16 && native.every(renderer => renderer.meshes?.size > 0);
  });
  const counts = await this.page.evaluate(() => {
    const native = Object.values(map._layers).map(layer => globals.sceneByLayer.get(layer)?._nativeGPU).filter(Boolean);
    return { count: native.length, shadow: globals.sceneByLayer.get(nativeLayers['Marker (default icon)'])._nativeGPU.meshes.has('shadow') };
  });
  assert.ok(counts.count >= 16, JSON.stringify(counts));
  assert.equal(counts.shadow, true);
  assert.deepEqual(this.comparisonErrors, []);
});

Then('the OpenLayers native shapes retain tooltips and popups', { timeout: 30000 }, async function () {
  await this.page.waitForFunction(() => globals.sceneByLayer.get(nativeLayers.CircleMarker)?._nativeGPU?.meshes?.size > 0);
  await this.page.getByRole('checkbox', { name: 'CircleMarker', exact: true }).uncheck();
  await this.page.getByRole('checkbox', { name: 'CircleMarker', exact: true }).check();
  await this.page.waitForFunction(() => globals.sceneByLayer.get(nativeLayers.CircleMarker)._nativeGPU.meshes?.size > 0);
  const circle = await this.page.evaluate(() => {
    const pixel = map.latLngToContainerPoint(nativeLayers.CircleMarker.getLatLng());
    const rect = map.getContainer().getBoundingClientRect();
    return { x: rect.left + pixel.x, y: rect.top + pixel.y };
  });
  await this.page.mouse.move(circle.x, circle.y);
  await this.page.locator('.ol-city-tooltip').waitFor();
  assert.equal(await this.page.locator('.ol-city-tooltip').textContent(), 'CircleMarker');
  await this.page.mouse.click(circle.x, circle.y);
  assert.equal(await this.page.getByRole('dialog').isVisible(), true);
  await this.page.getByRole('button', { name: 'Close popup' }).click();
  await this.page.evaluate(() => nativeLayers.Rectangle.openPopup());
  assert.equal(await this.page.getByRole('dialog').isVisible(), true);
  await this.page.getByRole('button', { name: 'Close popup' }).click();
  assert.deepEqual(this.comparisonErrors, []);
});

Then('the OpenLayers native markers retain popups and dragging', { timeout: 30000 }, async function () {
  for (const title of ['Default icon and shadow', 'Marker']) {
    await this.page.getByRole('button', { name: title, exact: true }).last().click();
    assert.equal(await this.page.getByRole('dialog').isVisible(), true);
    await this.page.getByRole('button', { name: 'Close popup' }).click();
  }
  const marker = this.page.getByRole('button', { name: 'Drag this GPU marker' });
  const before = await this.page.evaluate(() => nativeLayers.Marker.getLatLng());
  const rect = await marker.boundingBox();
  await this.page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await this.page.mouse.down();
  await this.page.mouse.move(rect.x + rect.width / 2 + 40, rect.y + rect.height / 2 + 20, { steps: 4 });
  await this.page.mouse.up();
  assert.equal(await this.page.evaluate(value => !nativeLayers.Marker.getLatLng().equals(value), before), true);
  await marker.focus();
  await this.page.keyboard.press('Enter');
  assert.equal(await this.page.getByRole('dialog').isVisible(), true);
  await this.page.getByRole('button', { name: 'Close popup' }).click();
  assert.deepEqual(this.comparisonErrors, []);
});

Then('its button reloads the same scene on Leaflet', { timeout: 30000 }, async function () {
  await this.page.getByRole('button', { name: 'Try it with Leaflet', exact: true }).click();
  await this.page.waitForFunction(() => globalThis.map && !map.ol && document.querySelector('canvas.leaflet-3d'));
  const restored = new URL(this.page.url());
  assert.equal(restored.searchParams.has('engine'), false);
  assert.equal(restored.searchParams.has('canvas'), true);
  assert.equal(restored.searchParams.get('compare'), '1');
  assert.equal(restored.hash, '#scene');
  assert.deepEqual(this.comparisonErrors, []);
});

Given('the shared example can load OpenLayers', { timeout: 30000 }, async function () {
  this.page.setDefaultTimeout(10000);
  this.page.setDefaultNavigationTimeout(15000);
  this.openlayersErrors = [];
  this.leafletRequests = [];
  this.page.on('pageerror', error => this.openlayersErrors.push(error.message));
  this.page.on('request', request => {
    if (/\/leaflet@[^/]+\/dist\/.*\.(js|css)/.test(request.url())) this.leafletRequests.push(request.url());
  });
  await this.context.route('**/api/explore/v2.1/catalog/datasets/**', fulfillTrafficRoute);
  await this.page.goto(`${this.baseUrl}/examples/leaflet-city-mapper.html?engine=openlayers`, { waitUntil: 'domcontentloaded' });
  assert.deepEqual(this.openlayersErrors, []);
  await this.page.waitForFunction(() => globalThis.map && document.querySelector('.ol-city-rotate'));
});

Then('the shared OpenLayers bindings load standalone without extra stylesheets', { timeout: 30000 }, async function () {
  const [bindings, minifiedBindings, ...examples] = await Promise.all([
    'libs/openlayers-bindings.js', 'libs/openlayers-bindings.min.js',
    'examples/leaflet-city-mapper.html', 'examples/leaflet-city-mapper-rome.html',
    'examples/leaflet-city-mapper-native.html',
  ].map(name => readFile(new URL(`../../${name}`, import.meta.url), 'utf8')));
  for (const example of examples) assert.match(example, /<script src="https:\/\/unpkg\.com\/leaflet-city-mapper@[^/]+\/libs\/leaflet\.js"><\/script>/);
  for (const source of [bindings, minifiedBindings]) {
    const standalone = await this.page.evaluate(source => {
      const frame = document.createElement('iframe');
      frame.hidden = true;
      document.body.append(frame);
      try {
        frame.contentWindow.ol = ol;
        const script = frame.contentDocument.createElement('script');
        script.textContent = source;
        frame.contentDocument.head.append(script);
        const classes = frame.contentWindow.L;
        return {
          classes: ['Map', 'Layer', 'TileLayer', 'Marker', 'Polygon', 'Circle', 'GeoJSON', 'Control']
            .every(name => typeof classes?.[name] === 'function') && typeof classes?.Control.Layers === 'function',
          noLoader: !frame.contentWindow.installOpenLayersBindings &&
            !frame.contentDocument.querySelector('script[src], link'),
          inlineStyles: frame.contentDocument.querySelectorAll('style[data-openlayers-bindings]').length === 1,
        };
      } finally {
        frame.remove();
      }
    }, source);
    assert.deepEqual(standalone, { classes: true, noLoader: true, inlineStyles: true });
  }
  assert.equal(await this.page.locator('link[href*="openlayers-bindings"][href$=".css"]').count(), 0);
  assert.equal(await this.page.locator('style[data-openlayers-bindings]').count(), 1);
  assert.deepEqual(this.openlayersErrors, []);
});

Then('OpenLayers drives the source layers and camera without Leaflet JavaScript', { timeout: 30000 }, async function () {
  const result = await this.page.evaluate(async () => {
    const wait = (promise, layer) => {
      let timer;
      return Promise.race([promise, new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(new Error(`Layer did not become ready: ${layer.options.url || globals.sceneByLayer.get(layer)?._type}`)), 10000);
      })]).finally(() => clearTimeout(timer));
    };
    await Promise.all(Object.values(map._layers).map(layer => wait(globals.sceneByLayer.get(layer)?.ready, layer)));
    const sources = Object.values(map._layers).filter(layer => globals.sceneByLayer.get(layer)?._3d);
    await Promise.all(sources.map(layer => wait(globals.sceneByLayer.get(layer)._added.promise, layer)));
    const view = map.ol.getView(), projected = map.options.crs.project(map.getCenter());
    const initial = map.getCenter(), zoom = map.getZoom();
    const bounds = map.getBounds();
    const roundtrip = new L.Point(250, 320);
    const pixel = map.latLngToContainerPoint(map.containerPointToLatLng(roundtrip));
    const origin = map.project([0, 0], 0);
    let moves = 0;
    const onMove = () => moves++;
    map.on('move', onMove);
    map.setView([48.859, 2.296], zoom + 1);
    const synchronized = map.ol.getView().getZoom() === zoom + 1 && map.getCenter().equals([48.859, 2.296]);
    view.setCenter(ol.proj.fromLonLat([2.295, 48.858]));
    const externalView = map.getCenter().equals([48.858, 2.295]) && moves >= 2;
    map.off('move', onMove);
    map.setView(initial, zoom);
    return {
      openlayers: map.ol instanceof ol.Map,
      center: Math.hypot(projected.x - ol.proj.fromLonLat([initial.lng, initial.lat])[0],
        projected.y - ol.proj.fromLonLat([initial.lng, initial.lat])[1]) < 1e-6,
      origin: origin.distanceTo([128, 128]) < 1e-8,
      roundtrip: pixel.distanceTo(roundtrip) < 1e-5,
      bounds: bounds.isValid() && bounds.contains(initial),
      angles: map.getPitch() === 45 && map.getBearing() === 30,
      synchronized, externalView,
      rendered: sources.length >= 5 && sources.every(layer => Boolean(globals.sceneByLayer.get(layer).renderer)),
      shared: new Set(sources.map(layer => globals.sceneByLayer.get(layer).renderer)).size === 1,
      canvas: document.querySelectorAll('canvas.leaflet-3d').length === 1,
      nativeControls: [ol.control.Zoom, ol.control.Attribution].every(Type =>
        map.ol.getControls().getArray().some(control => control instanceof Type)),
      customControls: [...map._controls].every(control => control._olControl instanceof ol.control.Control),
      noLeafletCSS: [...document.styleSheets].every(sheet => !sheet.href?.includes('leaflet.css')),
    };
  });
  for (const [name, value] of Object.entries(result)) assert.equal(value, true, name);
  assert.deepEqual(this.openlayersErrors, []);
  assert.deepEqual(this.leafletRequests, []);
});

Then('OpenLayers animates wheel and button zoom without restarting each frame', { timeout: 30000 }, async function () {
  await this.page.clock.pauseAt(await this.page.evaluate(() => Date.now() + 1000));
  const initial = await this.page.evaluate(() => ({ center: map.getCenter(), zoom: map.getZoom() }));
  try {
    for (const kind of ['wheel', 'button', 'out']) {
      await this.page.evaluate(kind => {
        const pixel = new L.Point(350, 300);
        const state = window.zoomMeasurement = {
          samples: [], starts: 0, ends: 0, before: map.getZoom(), started: performance.now(),
          pixel, anchor: map.containerPointToLatLng(pixel),
        };
        state.listener = event => {
          if (event.type === 'zoomstart') state.starts++;
          else if (event.type === 'zoomend') state.ends++;
          else state.samples.push({ zoom: map.getZoom(), time: performance.now() - state.started });
        };
        map.on('zoomstart zoom zoomend', state.listener);
        if (kind !== 'wheel') document.querySelector(kind === 'out' ? '.ol-zoom-out' : '.ol-zoom-in').click();
        else {
          const rect = map.getContainer().getBoundingClientRect();
          map.ol.getViewport().dispatchEvent(new WheelEvent('wheel', {
            bubbles: true, cancelable: true, deltaY: -60,
            clientX: rect.left + pixel.x, clientY: rect.top + pixel.y,
          }));
        }
      }, kind);
      // Advance actual animation frames deterministically, even in an occluded Windows browser.
      await this.page.clock.runFor(600);
      const result = await this.page.evaluate(kind => {
        const state = window.zoomMeasurement;
        map.off('zoomstart zoom zoomend', state.listener);
        delete window.zoomMeasurement;
        const timing = new Animation(new KeyframeEffect(null, [], {
          duration: 250, fill: 'both', easing: 'cubic-bezier(0,0,0.25,1)',
        }));
        const scale = 2 ** (map.getZoom() - state.before);
        const curveError = Math.max(...state.samples.map(sample => {
          timing.currentTime = Math.max(0, sample.time - (kind === 'wheel' ? 40 : 0));
          const progress = timing.effect.getComputedTiming().progress;
          return Math.abs(2 ** (sample.zoom - state.before) - (1 + (scale - 1) * progress));
        }));
        return {
          starts: state.starts, ends: state.ends, delta: map.getZoom() - state.before, curveError,
          intermediate: new Set(state.samples.filter(value =>
            value.zoom > Math.min(state.before, map.getZoom()) && value.zoom < Math.max(state.before, map.getZoom()))
            .map(value => value.zoom)).size,
          anchored: map.latLngToContainerPoint(state.anchor).distanceTo(state.pixel) < 0.1,
        };
      }, kind);
      assert.equal(result.starts, 1, `${kind}: one zoomstart`);
      assert.equal(result.ends, 1, `${kind}: one zoomend`);
      assert.equal(result.delta, kind === 'out' ? -1 : 1, `${kind}: one snapped level`);
      assert.ok(result.intermediate >= 2, `${kind}: fractional intermediate zooms`);
      assert.ok(result.curveError < 0.002, `${kind}: Leaflet CSS scale curve (${result.curveError})`);
      if (kind === 'wheel') assert.equal(result.anchored, true, `${kind}: pitched anchor`);
    }
  } finally {
    await this.page.evaluate(initial => map.setView(initial.center, initial.zoom), initial);
    await this.page.clock.resume();
  }
  assert.deepEqual(this.openlayersErrors, []);
});

Then('OpenLayers wheel steps match Leaflet', { timeout: 30000 }, async function () {
  await this.page.clock.pauseAt(await this.page.evaluate(() => Date.now() + 1000));
  const leaflet = await readFile(dependencyFile('https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.js'), 'utf8');
  await this.page.evaluate(source => {
    const frame = window.zoomReference = document.createElement('iframe');
    frame.style.cssText = 'position:absolute;left:-10000px;width:800px;height:600px';
    document.body.append(frame);
    const script = frame.contentDocument.createElement('script');
    script.textContent = source;
    frame.contentDocument.head.append(script);
    const element = frame.contentDocument.createElement('div');
    element.style.cssText = 'width:800px;height:600px';
    frame.contentDocument.body.append(element);
    frame.referenceMap = new frame.contentWindow.L.Map(element, { center: [48.858, 2.295], zoom: 17,
      minZoom: 14, maxZoom: 24, zoomAnimation: false });
  }, leaflet);
  const initial = await this.page.evaluate(() => ({ center: map.getCenter(), zoom: map.getZoom() }));
  try {
    for (const [deltaY, deltaMode, count] of [[-120, 0, 1], [-1, 0, 1], [120, 0, 1], [-3, 1, 1], [-1, 2, 1], [-120, 0, 3]]) {
      await this.page.evaluate(({ deltaY, deltaMode, count }) => {
        for (const target of [zoomReference.referenceMap, map]) {
          target.setView([48.858, 2.295], 17, { animate: false });
          const container = target.ol ? target.ol.getViewport() : target.getContainer();
          const rect = container.getBoundingClientRect();
          for (let i = 0; i < count; i++) container.dispatchEvent(new WheelEvent('wheel', {
            bubbles: true, cancelable: true, deltaY, deltaMode,
            clientX: rect.left + 300, clientY: rect.top + 300,
          }));
        }
      }, { deltaY, deltaMode, count });
      await this.page.clock.runFor(350);
      const zooms = await this.page.evaluate(() => [map.getZoom(), zoomReference.referenceMap.getZoom()]);
      assert.equal(zooms[0], zooms[1], `wheel ${deltaY}, mode ${deltaMode}, count ${count}`);
    }
  } finally {
    await this.page.evaluate(() => {
      zoomReference.referenceMap.remove();
      zoomReference.remove();
      delete window.zoomReference;
    });
    await this.page.evaluate(initial => map.setView(initial.center, initial.zoom), initial);
    await this.page.clock.resume();
  }
});

Then('the OpenLayers compass preserves the plugin appearance and gestures', { timeout: 30000 }, async function () {
  const button = this.page.getByRole('button', { name: 'Reset bearing and pitch', exact: true });
  const appearance = await button.evaluate(element => ({
    width: element.clientWidth, height: element.clientHeight,
    icon: getComputedStyle(element.firstElementChild).backgroundImage,
    transform: element.firstElementChild.style.transform,
    original: element === element._rotateControl._button,
  }));
  assert.equal(appearance.width, 30);
  assert.equal(appearance.height, 30);
  assert.match(appearance.icon, /svg/);
  assert.match(appearance.transform, /rotateX\(45deg\)/);
  assert.equal(appearance.original, true);
  const before = await this.page.evaluate(() => ({
    bearing: map.getBearing(), pitch: map.getPitch(), center: map.getCenter(),
  }));
  const box = await button.boundingBox();
  await this.page.mouse.move(box.x + 15, box.y + 15);
  await this.page.mouse.down();
  await this.page.mouse.move(box.x + 55, box.y - 5, { steps: 4 });
  await this.page.mouse.up();
  const dragged = await this.page.evaluate(() => ({
    bearing: map.getBearing(), pitch: map.getPitch(), center: map.getCenter(), enabled: map.dragging.enabled(),
  }));
  assert.ok(Math.abs(dragged.bearing - before.bearing - 32) < 0.01, JSON.stringify({ before, dragged }));
  assert.ok(Math.abs(dragged.pitch - before.pitch - 10) < 0.01, JSON.stringify({ before, dragged }));
  assert.equal(dragged.enabled, true);
  assert.deepEqual(dragged.center, before.center);
  await button.focus();
  await this.page.keyboard.press('ArrowRight');
  await this.page.keyboard.press('ArrowUp');
  assert.ok(await this.page.evaluate(({ bearing, pitch }) =>
    Math.abs(map.getBearing() - bearing - 5) < 1e-6 && Math.abs(map.getPitch() - pitch - 5) < 1e-6, dragged));
  await this.page.keyboard.press('Home');
  await this.page.waitForFunction(() => map.getPitch() < 1e-8 && Math.min(map.getBearing(), 360 - map.getBearing()) < 1e-8);
  await this.page.evaluate(({ bearing, pitch }) => {
    cityMapperTestOperations.mapSetPitchAndBearing(map, pitch, bearing);
  }, before);
  assert.deepEqual(this.openlayersErrors, []);
});

Then('the OpenLayers example preserves layer control interactions', { timeout: 30000 }, async function () {
  const traffic = this.page.getByRole('checkbox', { name: 'Traffic', exact: true });
  const shadows = this.page.getByRole('checkbox', { name: 'Time', exact: true });
  const trees = this.page.getByRole('checkbox', { name: 'Trees', exact: true });
  for (const checkbox of [traffic, shadows, trees]) {
    await checkbox.uncheck();
    assert.equal(await checkbox.isChecked(), false);
    await checkbox.check();
    assert.equal(await checkbox.isChecked(), true);
  }
  await this.page.getByRole('radio', { name: 'Plan IGN', exact: true }).check();
  await this.page.getByRole('radio', { name: 'Orthophoto IGN', exact: true }).check();
  assert.deepEqual(this.openlayersErrors, []);
});

Then('the OpenLayers example preserves mouse navigation', { timeout: 30000 }, async function () {
  const beforeButton = await this.page.evaluate(() => map.getZoom());
  await this.page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await this.page.waitForFunction(zoom => map.getZoom() > zoom && !map.ol.getView().getAnimating(), beforeButton);
  assert.equal(await this.page.getByRole('link', { name: 'OpenLayers', exact: true }).isVisible(), true);
  const initial = await this.page.evaluate(() => ({ lat: map.getCenter().lat, lng: map.getCenter().lng, zoom: map.getZoom() }));
  await this.page.mouse.move(350, 350);
  await this.page.mouse.down();
  await this.page.mouse.move(400, 380, { steps: 4 });
  await this.page.mouse.up();
  assert.equal(await this.page.evaluate(value => !map.getCenter().equals(value), initial), true);
  await this.page.mouse.wheel(0, -100);
  await this.page.waitForFunction(zoom => map.getZoom() > zoom, initial.zoom);
  assert.deepEqual(this.openlayersErrors, []);
});

Then('the OpenLayers example preserves touch navigation', { timeout: 30000 }, async function () {
  const touched = await this.page.evaluate(() => {
    const before = { bearing: map.getBearing(), pitch: map.getPitch(), zoom: map.getZoom() };
    const element = map.getContainer(), rect = element.getBoundingClientRect();
    const send = (type, points) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'touches', { value: points.map(([x, y]) =>
        ({ clientX: rect.left + x, clientY: rect.top + y })) });
      element.dispatchEvent(event);
    };
    send('touchstart', [[250, 200], [350, 200]]);
    send('touchmove', [[200, 150], [400, 100]]);
    send('touchend', []);
    return map.getBearing() !== before.bearing && map.getPitch() > before.pitch &&
      map.getZoom() > before.zoom && map.dragging.enabled() && map.options.zoomSnap === 1;
  });
  assert.equal(touched, true);
  await this.page.getByRole('button', { name: 'Reset bearing and pitch' }).click();
  await this.page.waitForFunction(() => map.getPitch() < 1e-8 &&
    Math.min(map.getBearing(), 360 - map.getBearing()) < 1e-8);
  assert.deepEqual(this.openlayersErrors, []);
});

Then('the OpenLayers example enters and exits walk mode', { timeout: 30000 }, async function () {
  const walk = this.page.getByRole('button', { name: /walk/i });
  await walk.click();
  assert.equal(await walk.getAttribute('aria-pressed'), 'true');
  await this.page.keyboard.press('Escape');
  assert.equal(await walk.getAttribute('aria-pressed'), 'false');
  assert.deepEqual(this.openlayersErrors, []);
});

Then('the OpenLayers example removes its renderer and map target', { timeout: 30000 }, async function () {
  await this.page.waitForFunction(() => document.querySelector('canvas.leaflet-3d'));
  const cleanup = await this.page.evaluate(() => {
    map.remove();
    return !map._loaded && !document.querySelector('.leaflet-3d') && map.ol.getTarget() == null;
  });
  assert.equal(cleanup, true);
  assert.deepEqual(this.openlayersErrors, []);
});
