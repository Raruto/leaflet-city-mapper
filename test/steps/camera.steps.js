import assert from 'node:assert/strict';
import { Then } from '@cucumber/cucumber';

async function createMap(page, options = {}) {
  await page.addStyleTag({ url: 'https://unpkg.com/leaflet@1.9/dist/leaflet.css' });
  await page.evaluate(async options => {
    const element = document.createElement('div');
    element.style.cssText = 'width:600px;height:400px';
    document.body.append(element);
    window.cameraMap = new L.Map(element, {
      center: [48.8583, 2.2945], zoom: 16, maxZoom: 20, minZoom: 1,
      rotate: true, zoomAnimation: false, inertia: false, ...options,
      rotateControl: { closeOnZeroBearing: false },
    });
    await cameraMap.cameraReady;
  }, options);
}

Then('pitched zoom, panning and marker focus preserve their screen anchors', { timeout: 30000 }, async function () {
  await createMap(this.page, { pitch: 60, bearing: 35 });
  const result = await this.page.evaluate(() => {
    const map = cameraMap, screen = new L.Point(420, 290);
    const anchor = map.containerPointToLatLng(screen);
    map.setZoomAround(screen, 17, { animate: false });
    const zoomError = map.latLngToContainerPoint(anchor).distanceTo(screen);
    const old = map.getCenter(), half = map.getSize().divideBy(2), offset = new L.Point(30, 40);
    map.panBy(offset, { animate: false });
    const panError = map.latLngToContainerPoint(old).distanceTo(half.subtract(offset));
    const outside = map.containerPointToLatLng(new L.Point(710, 300));
    const marker = new L.Marker(outside, { icon: new L.DivIcon({ html: 'Focus me' }) }).addTo(map);
    marker._icon.focus();
    map.panInside(marker.getLatLng(), { padding: [30, 30], animate: false });
    const focused = map.latLngToContainerPoint(marker.getLatLng());
    const focusInside = focused.x >= 28 && focused.x <= 572 && focused.y >= 28 && focused.y <= 372;
    const bounds = new L.LatLngBounds([48.84, 2.27], [48.88, 2.32]);
    let fitError = 0;
    for (const [pitch, bearing] of [[0, 45], [60, 35], [80, 270]]) {
      map._setPitchAndBearing(pitch, bearing);
      map.fitBounds(bounds, { paddingTopLeft: [40, 30], paddingBottomRight: [20, 50], animate: false });
      for (const corner of [bounds.getNorthWest(), bounds.getNorthEast(), bounds.getSouthWest(), bounds.getSouthEast()]) {
        const p = map.latLngToContainerPoint(corner);
        fitError = Math.max(fitError, 40 - p.x, p.x - 580, 30 - p.y, p.y - 350);
      }
    }
    map.setMaxBounds(bounds);
    map.setView(bounds.getNorthEast(), 17, { animate: false });
    map._setPitchAndBearing(65, 75);
    map.panInsideBounds(bounds, { animate: false });
    const visible = map.getBounds();
    const min = map.project(bounds.getNorthWest()), max = map.project(bounds.getSouthEast());
    const nw = map.project(visible.getNorthWest()), se = map.project(visible.getSouthEast());
    const boundsError = Math.max(0, min.x - nw.x, min.y - nw.y, se.x - max.x, se.y - max.y);
    map.remove();
    return { zoomError, panError, focusInside, boundsError, fitError };
  });
  assert.ok(result.zoomError < 2, `Zoom anchor drift: ${result.zoomError}px`);
  assert.ok(result.panError < 2, `Screen pan drift: ${result.panError}px`);
  assert.equal(result.focusInside, true, 'Focused marker stays in the padded viewport');
  assert.ok(result.fitError < 2, `fitBounds padding overflow: ${result.fitError}px`);
  // Leaflet ignores one-pixel bounds corrections and rounds pan offsets.
  assert.ok(result.boundsError < 2, `Maximum bounds overflow: ${result.boundsError}px`);
});

Then('camera coordinates round-trip and native overlays remain aligned', { timeout: 30000 }, async function () {
  await createMap(this.page);
  const result = await this.page.evaluate(() => {
    const map = cameraMap, errors = [];
    for (const pitch of [0, 35, 75, 85]) {
      for (const bearing of [0, 35, 90, 270]) {
        map._setPitchAndBearing(pitch, bearing);
        for (const offset of [[0, 0], [20, 10], [-30, -15]]) {
          const point = map.getSize().divideBy(2).add(offset);
          const actual = map.latLngToContainerPoint(map.containerPointToLatLng(point));
          errors.push(actual.distanceTo(point));
        }
      }
    }
    map._setPitchAndBearing(45, 70);
    const destination = new L.LatLng(48.8597, 2.2924);
    map.setView(destination, map.getZoom(), { animate: false });
    const recentered = map.distance(map.getCenter(), destination) < 2;
    const marker = new L.Marker([48.8588, 2.295], {
      icon: new L.DivIcon({ html: 'Accessible marker' }),
    }).bindPopup('Popup').bindTooltip('Tooltip', { permanent: true }).addTo(map);
    marker.openPopup();
    const iconPoint = L.DomUtil.getPosition(marker._icon).add(map._getMapPanePos());
    const target = map.latLngToContainerPoint(marker.getLatLng());
    const aligned = target.distanceTo(iconPoint) < 1;
    const popup = marker.getPopup(), popupRect = popup.getElement().getBoundingClientRect(),
      mapRect = map.getContainer().getBoundingClientRect();
    const popupAligned = Math.abs(popupRect.bottom + parseFloat(getComputedStyle(popup.getElement()).marginBottom) -
      mapRect.top - popup.options.offset[1] - target.y) < 2;
    const paneTransform = map.getPane('mapPane').style.transform;
    const bounds = map.getBounds().contains(map.getCenter());
    marker.options.rotateWithView = marker.options.keepUpright = true;
    marker.options.scale = 2;
    marker.setRotation(Math.PI);
    const direction = marker._cameraIconPoint(1, 0);
    const markerRotation = direction.x > 0 && Math.abs(Math.hypot(direction.x, direction.y) - 2) < 1e-10 &&
      marker._icon.style.transform.includes('scale(2)');
    let invalid = 0;
    for (const value of [NaN, Infinity, '30']) {
      try { map.setBearing(value); } catch (error) { if (error instanceof TypeError) invalid++; }
    }
    map.setBearing(-450).setPitch(100);
    const clamped = map.getBearing() === 270 && map.getPitch() === 85;
    const scripts = [...document.scripts].every(script => !script.src.includes('leaflet-rotate'));
    map.remove();
    return { error: Math.max(...errors), aligned, popupAligned, noCSSRotation: !/rotate|matrix3d|perspective/.test(paneTransform),
      bounds, invalid, clamped, scripts, markerRotation, recentered };
  });
  // Leaflet rounds geographic layer positions to physical CSS pixels.
  assert.ok(result.error < 2, `projection error: ${result.error}`);
  assert.deepEqual({ ...result, error: 0 }, {
    error: 0, aligned: true, popupAligned: true, noCSSRotation: true,
    bounds: true, invalid: 3, clamped: true, scripts: true, markerRotation: true, recentered: true,
  });
});

Then('camera orientation is accessible without dragging', { timeout: 30000 }, async function () {
  await createMap(this.page, { touchRotate: true, touchPitch: true });
  const button = this.page.getByRole('button', { name: 'Reset bearing and pitch', exact: true });
  await button.focus();
  await this.page.keyboard.press('ArrowRight');
  await this.page.keyboard.press('ArrowUp');
  assert.deepEqual(await this.page.evaluate(() => [cameraMap.getBearing(), cameraMap.getPitch()]), [5, 5]);
  await this.page.keyboard.press('Shift+ArrowRight');
  await this.page.keyboard.press('Shift+ArrowRight');
  await this.page.keyboard.press('ArrowRight');
  await this.page.keyboard.press('ArrowRight');
  await this.page.keyboard.press('Shift+ArrowUp');
  await this.page.keyboard.press('Shift+ArrowUp');
  await this.page.keyboard.press('ArrowUp');
  assert.deepEqual(await this.page.evaluate(() => [cameraMap.getBearing(), cameraMap.getPitch()]), [45, 40]);
  await this.page.emulateMedia({ reducedMotion: 'reduce' });
  await button.press('Enter');
  assert.deepEqual(await this.page.evaluate(() => [cameraMap.getBearing(), cameraMap.getPitch()]), [0, 0]);
  const input = await this.page.evaluate(() => {
    const input = document.createElement('input');
    input.type = 'text'; input.setAttribute('aria-label', 'Map search');
    cameraMap.getContainer().append(input);
    input.focus();
    return cameraMap.getBearing();
  });
  await this.page.keyboard.press('ArrowRight');
  assert.equal(await this.page.evaluate(() => cameraMap.getBearing()), input);
  const icon = await this.page.evaluate(() => {
    const control = cameraMap.rotateControl.getContainer(), arrow = control.querySelector('.leaflet-control-rotate-arrow');
    return { compact: control.getBoundingClientRect().width <= 40, svg: arrow.style.backgroundImage.includes('svg'),
      noPanel: !control.querySelector('details,input'), transforms: arrow.style.transform.includes('rotateX') };
  });
  assert.deepEqual(icon, { compact: true, svg: true, noPanel: true, transforms: true });
});

Then('camera mouse and touch gestures preserve Leaflet zoom and panning', { timeout: 30000 }, async function () {
  const mapBox = await this.page.evaluate(() => {
    document.querySelector('input[aria-label="Map search"]').remove();
    const r = cameraMap.getContainer().getBoundingClientRect();
    return { x: r.left + 300, y: r.top + 200 };
  });
  await this.page.mouse.move(mapBox.x, mapBox.y);
  await this.page.keyboard.down('Shift');
  await this.page.mouse.wheel(0, 100);
  await this.page.keyboard.up('Shift');
  assert.equal(await this.page.evaluate(() => cameraMap.getBearing()), 5);
  await this.page.mouse.down({ button: 'right' });
  await this.page.mouse.move(mapBox.x + 60, mapBox.y - 40, { steps: 4 });
  await this.page.mouse.up({ button: 'right' });
  const result = await this.page.evaluate(() => {
    const map = cameraMap, before = { bearing: map.getBearing(), pitch: map.getPitch(), zoom: map.getZoom() };
    const element = map.getContainer(), r = element.getBoundingClientRect();
    const send = (type, points) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'touches', { value: points.map(([x, y]) =>
        ({ clientX: r.left + x, clientY: r.top + y })) });
      element.dispatchEvent(event);
    };
    send('touchstart', [[250, 200], [350, 200]]);
    send('touchmove', [[200, 150], [400, 100]]);
    send('touchstart', [[200, 150], [400, 100], [450, 200]]);
    send('touchend', []);
    const touched = map.getBearing() !== before.bearing && map.getPitch() > before.pitch &&
      map.getZoom() > before.zoom;
    const restored = map.dragging.enabled() && map.options.zoomSnap === 1;
    map.touchRotate.disable(); map.touchPitch.disable();
    const zoomRestored = map.touchZoom.enabled();
    const start = map.getCenter();
    map.panBy([30, 0], { animate: false });
    const panned = !map.getCenter().equals(start);
    map.remove();
    return { mouse: Math.abs(before.bearing - 53) < 0.01 && before.pitch === 20, touched, restored, zoomRestored, panned };
  });
  assert.deepEqual(result, { mouse: true, touched: true, restored: true, zoomRestored: true, panned: true });
});

Then('the compass retains its drag sensitivity and bearing-only option', { timeout: 30000 }, async function () {
  await createMap(this.page);
  const control = this.page.getByRole('button', { name: 'Reset bearing and pitch', exact: true });
  const rect = await control.boundingBox();
  await this.page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await this.page.mouse.down();
  await this.page.mouse.move(rect.x + rect.width / 2 + 50, rect.y + rect.height / 2 + 10, { steps: 4 });
  await this.page.mouse.up();
  assert.equal(await this.page.evaluate(() => cameraMap.getBearing()), 40);
  // Upward movement tilts; start far enough down that the pointer remains inside the viewport.
  await this.page.evaluate(() => cameraMap.setPitch(30));
  const rect2 = await control.boundingBox();
  await this.page.mouse.move(rect2.x + rect2.width / 2, rect2.y + rect2.height / 2);
  await this.page.mouse.down();
  await this.page.mouse.move(rect2.x + rect2.width / 2, rect2.y + rect2.height / 2 + 20, { steps: 4 });
  await this.page.mouse.up();
  assert.deepEqual(await this.page.evaluate(() => [cameraMap.getBearing(), cameraMap.getPitch()]), [40, 20]);
  const settings = await this.page.evaluate(() => {
    const map = cameraMap;
    map.rotateControl.remove();
    map._setPitchAndBearing(30, 40);
    map.rotateControl = new L.Control.Rotate({ visualizePitch: false }).addTo(map);
    map.setBearing(0);
    const hiddenAtNorth = map.rotateControl.getContainer().style.display === 'none';
    map.setBearing(20);
    const visible = map.rotateControl.getContainer().style.display !== 'none';
    const arrow = map.rotateControl.getContainer().querySelector('.leaflet-control-rotate-arrow');
    return { hiddenAtNorth, visible, flat: arrow.style.transform.includes('rotateX(0deg)') };
  });
  assert.deepEqual(settings, { hiddenAtNorth: true, visible: true, flat: true });
  await this.page.emulateMedia({ reducedMotion: 'reduce' });
  await this.page.getByRole('button', { name: 'Reset bearing to north', exact: true }).click();
  assert.deepEqual(await this.page.evaluate(() => [cameraMap.getBearing(), cameraMap.getPitch()]), [0, 30]);
  await this.page.evaluate(() => cameraMap.remove());
});

Then('compass permissions, landscape headings and camera cleanup are preserved', { timeout: 30000 }, async function () {
  await createMap(this.page, { trackContainerMutation: true, touchRotate: true, touchPitch: true });
  const result = await this.page.evaluate(async () => {
    const map = cameraMap, element = map.getContainer(), deviceEvent = window.DeviceOrientationEvent;
    const orientation = Object.getOwnPropertyDescriptor(screen.orientation, 'angle');
    let relative, webkit, denied;
    try {
      Object.defineProperty(screen.orientation, 'angle', { configurable: true, value: 90 });
      window.DeviceOrientationEvent = { requestPermission: async () => 'granted' };
      map.compassBearing.enable();
      await new Promise(resolve => setTimeout(resolve, 0));
      const send = values => {
        const event = new Event('deviceorientation');
        for (const [key, value] of Object.entries(values)) Object.defineProperty(event, key, { value });
        window.dispatchEvent(event);
      };
      send({ alpha: 120, absolute: false });
      relative = map.getBearing();
      send({ webkitCompassHeading: 15, absolute: false });
      webkit = map.getBearing();
      map.compassBearing.disable();
      window.DeviceOrientationEvent.requestPermission = async () => 'denied';
      const error = new Promise(resolve => map.once('error', event => resolve(event.error.message)));
      map.compassBearing.enable();
      denied = (await error).includes('denied') && !map.compassBearing.enabled();
    } finally {
      window.DeviceOrientationEvent = deviceEvent;
      if (orientation) Object.defineProperty(screen.orientation, 'angle', orientation);
      else delete screen.orientation.angle;
    }
    element.style.width = '660px';
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    const resized = map.getSize().x === 660;
    const rect = element.getBoundingClientRect(), event = new Event('touchstart', { cancelable: true });
    Object.defineProperty(event, 'touches', { value: [
      { clientX: rect.left + 250, clientY: rect.top + 200 },
      { clientX: rect.left + 350, clientY: rect.top + 200 },
    ] });
    element.dispatchEvent(event);
    map.remove();
    const cleaned = !map.dragging.enabled() && !map.touchZoom.enabled() && map.options.zoomSnap === 1;
    return { relative, webkit, denied, resized, cleaned };
  });
  assert.deepEqual(result, { relative: 30, webkit: 255, denied: true, resized: true, cleaned: true });
});
