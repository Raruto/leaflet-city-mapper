function editable(target) {
  return target.closest?.('input,textarea,select,[contenteditable="true"]');
}

function dragCamera(map, element, accept, sensitivity = [0.5, 0.25]) {
  let drag, moved = false;
  const end = () => {
    if (!drag) return;
    if (element.hasPointerCapture?.(drag.id)) element.releasePointerCapture(drag.id);
    if (drag.dragging) map.dragging.enable();
    drag = null;
    element.style.cursor = 'grab';
  };
  const down = event => {
    if (drag || !accept(event) || editable(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    moved = false;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY,
      pitch: map.getPitch(), bearing: map.getBearing(), dragging: map.dragging?.enabled() };
    map.dragging?.disable();
    element.focus?.({ preventScroll: true });
    element.setPointerCapture(event.pointerId);
    element.style.cursor = 'grabbing';
  };
  const move = event => {
    if (!drag || drag.id !== event.pointerId) return;
    const x = event.clientX - drag.x, y = event.clientY - drag.y;
    if (Math.hypot(x, y) < 3 && !moved) return;
    map._stopPitchBearingAnimation();
    moved = true;
    event.preventDefault();
    map._setPitchAndBearing(drag.pitch - y * sensitivity[1], drag.bearing + x * sensitivity[0]);
  };
  const click = event => { if (moved) { event.preventDefault(); event.stopPropagation(); moved = false; } };
  element.addEventListener('pointerdown', down, true);
  element.addEventListener('pointermove', move);
  element.addEventListener('pointerup', end);
  element.addEventListener('pointercancel', end);
  element.addEventListener('lostpointercapture', end);
  element.addEventListener('click', click, true);
  window.addEventListener('blur', end);
  return () => {
    end();
    element.removeEventListener('pointerdown', down, true);
    element.removeEventListener('pointermove', move);
    element.removeEventListener('pointerup', end);
    element.removeEventListener('pointercancel', end);
    element.removeEventListener('lostpointercapture', end);
    element.removeEventListener('click', click, true);
    window.removeEventListener('blur', end);
  };
}

L.Control.Rotate = L.Control.extend({
  options: { position: 'topleft', closeOnZeroBearing: true, visualizePitch: true },
  onAdd(map) {
    const container = L.DomUtil.create('div', 'leaflet-control-rotate leaflet-bar');
    const button = L.DomUtil.create('a', 'leaflet-control-rotate-toggle', container);
    button.href = '#';
    button.setAttribute('role', 'button');
    button.title = this.options.visualizePitch ? 'Reset bearing and pitch' : 'Reset bearing to north';
    button.setAttribute('aria-label', button.title);
    button.style.cssText = 'cursor:grab;touch-action:none';
    const arrow = L.DomUtil.create('span', 'leaflet-control-rotate-arrow', button);
    arrow.setAttribute('aria-hidden', 'true');
    arrow.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;background: no-repeat center / 29px 29px';
    arrow.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 29 29%27%3E%3Cpath fill=%27%23333%27 d=%27M10.5 14 14.5 6 18.5 14Z%27/%3E%3Cpath fill=%27%23ccc%27 d=%27M10.5 16 14.5 24 18.5 16Z%27/%3E%3C/svg%3E")';
    button.onclick = event => {
      event.preventDefault();
      if (this.options.visualizePitch) map.resetNorthPitch();
      else map.resetNorth();
      if (event.detail) map.getContainer().focus({ preventScroll: true });
    };
    button.onkeydown = event => {
      const step = event.shiftKey ? 15 : 5;
      if (event.key === 'ArrowLeft') map.setBearing(map.getBearing() - step);
      else if (event.key === 'ArrowRight') map.setBearing(map.getBearing() + step);
      else if (event.key === 'ArrowUp' && this.options.visualizePitch) map.setPitch(map.getPitch() + step);
      else if (event.key === 'ArrowDown' && this.options.visualizePitch) map.setPitch(map.getPitch() - step);
      else if (event.key === 'Home' || event.key === ' ') button.click();
      else return;
      event.preventDefault();
      event.stopPropagation();
    };
    this._refresh = () => {
      const pitch = this.options.visualizePitch ? map.getPitch() : 0;
      arrow.style.transform = `scale(${1 / Math.sqrt(Math.cos(pitch * Math.PI / 180))}) rotateX(${pitch}deg) rotate(${map.getBearing()}deg)`;
      button.setAttribute('aria-description', `Bearing ${Math.round(map.getBearing())} degrees, pitch ${Math.round(map.getPitch())} degrees. Arrow keys adjust the camera; Home resets it.`);
      // Do not hide a focused control, even when the caller opts into auto-hiding.
      container.style.display = this.options.closeOnZeroBearing && !map.getBearing() && !pitch &&
        !container.contains(document.activeElement) ? 'none' : '';
    };
    map.on('rotate pitch', this._refresh);
    this._refresh();
    this._endDrag = dragCamera(map, button, event => event.button === 0,
      [0.8, this.options.visualizePitch ? 0.5 : 0]);
    button.addEventListener('focusout', this._refresh);
    L.DomEvent.on(button, 'dblclick contextmenu', L.DomEvent.stop);
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);
    return container;
  },
  onRemove(map) {
    map.off('rotate pitch', this._refresh);
    this._endDrag();
  },
});
if (L.control) L.control.rotate = options => new L.Control.Rotate(options);

const ShiftRotate = L.Handler.extend({
  addHooks() {
    this._wheel = event => {
      if (!event.shiftKey || editable(event.target) || event.target.closest('.leaflet-control')) return;
      event.preventDefault(); event.stopImmediatePropagation();
      this._map.setBearing(this._map.getBearing() + Math.sign(event.deltaY) * 5);
    };
    this._map.getContainer().addEventListener('wheel', this._wheel, { passive: false, capture: true });
  },
  removeHooks() { this._map.getContainer().removeEventListener('wheel', this._wheel, true); },
});
const PitchDrag = L.Handler.extend({
  addHooks() {
    this._end = dragCamera(this._map, this._map.getContainer(), event =>
      !event.target.closest('.leaflet-control,.leaflet-marker-icon,.leaflet-popup') &&
      (event.button === 2 || event.button === 0 && event.ctrlKey));
    this._context = event => { event.preventDefault(); };
    this._map.getContainer().addEventListener('contextmenu', this._context);
  },
  removeHooks() {
    this._end();
    this._map.getContainer().removeEventListener('contextmenu', this._context);
  },
});
const Compass = L.Handler.extend({
  addHooks() {
    const generation = this._generation = (this._generation || 0) + 1;
    this._orientation = event => {
      if (Number.isFinite(event.webkitCompassHeading)) this._map.setBearing(-event.webkitCompassHeading);
      else if (event.absolute && Number.isFinite(event.alpha)) this._map.setBearing(event.alpha);
    };
    const permission = window.DeviceOrientationEvent?.requestPermission;
    Promise.resolve(permission ? permission.call(window.DeviceOrientationEvent) : 'granted').then(result => {
      if (!this.enabled() || this._generation !== generation) return;
      if (!window.DeviceOrientationEvent || result !== 'granted') throw new Error('Device compass permission unavailable or denied');
      window.addEventListener('deviceorientation', this._orientation);
      window.addEventListener('deviceorientationabsolute', this._orientation);
    }).catch(error => {
      this.disable();
      this._map.fire('error', { error });
    });
  },
  removeHooks() {
    this._generation++;
    window.removeEventListener('deviceorientation', this._orientation);
    window.removeEventListener('deviceorientationabsolute', this._orientation);
  },
});

export function cameraControls(map) {
  map.addHandler('shiftKeyRotate', ShiftRotate);
  map.addHandler('pitchDrag', PitchDrag);
  map.addHandler('compassBearing', Compass);
  // Two optional touch modes share one pinch/pan recognizer with Leaflet's zoom setting.
  const TouchMode = L.Handler.extend({
    addHooks() { map.fire('cameratouchchange'); },
    removeHooks() { map.fire('cameratouchchange'); },
  });
  map.addHandler('touchRotate', TouchMode);
  map.addHandler('touchPitch', TouchMode);
  const container = map.getContainer();
  let touch, nativeZoom;
  const start = event => {
    if (event.touches.length !== 2 || event.target.closest('.leaflet-control')) return;
    if (!map.touchRotate.enabled() && !map.touchPitch.enabled()) return;
    const [a, b] = event.touches;
    if (Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY) < 1) return;
    map._stopPitchBearingAnimation();
    const middle = new L.Point((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2)
      .subtract(new L.Point(container.getBoundingClientRect().left, container.getBoundingClientRect().top));
    touch = { angle: Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX),
      distance: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY), middle,
      anchor: map.containerPointToLatLng(middle), zoom: map.getZoom(),
      bearing: map.getBearing(), pitch: map.getPitch(), zooming: map.touchZoom?.enabled(),
      dragging: map.dragging?.enabled() };
    map.dragging?.disable();
    event.preventDefault(); event.stopImmediatePropagation();
  };
  const move = event => {
    if (!touch || event.touches.length !== 2) return;
    const [a, b] = event.touches;
    const angle = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX);
    const middle = new L.Point((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2)
      .subtract(new L.Point(container.getBoundingClientRect().left, container.getBoundingClientRect().top));
    const delta = Math.atan2(Math.sin(angle - touch.angle), Math.cos(angle - touch.angle)) * 180 / Math.PI;
    map._setPitchAndBearing(map.touchPitch.enabled() ? touch.pitch - (middle.y - touch.middle.y) * 0.25 : touch.pitch,
      map.touchRotate.enabled() ? touch.bearing + delta : touch.bearing);
    const zoom = touch.zooming ? Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(),
      touch.zoom + Math.log2(Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY) / touch.distance))) : touch.zoom;
    map.setView(map.getCenter(), zoom, { animate: false });
    const projected = map.project(touch.anchor).subtract(map.project(map.containerPointToLatLng(middle)));
    map.setView(map.unproject(map.project(map.getCenter()).add(projected)), map.getZoom(), { animate: false });
    event.preventDefault(); event.stopImmediatePropagation();
  };
  const end = () => {
    if (!touch) return;
    if (touch.dragging) map.dragging.enable();
    const snap = touch.snap;
    map.options.zoomSnap = snap;
    if (touch.zooming && snap) map.setZoom(Math.round(map.getZoom() / snap) * snap, { animate: false });
    touch = null;
  };
  const change = () => {
    const active = map.touchRotate.enabled() || map.touchPitch.enabled();
    if (active && nativeZoom === undefined) {
      nativeZoom = map.touchZoom?.enabled();
      map.touchZoom?.disable();
    } else if (!active && nativeZoom !== undefined) {
      end();
      if (nativeZoom) map.touchZoom.enable();
      nativeZoom = undefined;
    }
  };
  // Preserve the zoom-enabled setting before handing pinch recognition over.
  change();
  const startTouch = event => {
    if (touch) return;
    start(event);
    if (touch) {
      if (nativeZoom !== undefined) touch.zooming = nativeZoom;
      touch.snap = map.options.zoomSnap;
      map.options.zoomSnap = 0;
    }
  };
  container.addEventListener('touchstart', startTouch, { capture: true, passive: false });
  container.addEventListener('touchmove', move, { capture: true, passive: false });
  container.addEventListener('touchend', end, true);
  container.addEventListener('touchcancel', end, true);
  window.addEventListener('blur', end);
  map.on('cameratouchchange', change);
  if (map.options.rotateControl) {
    map.rotateControl = new L.Control.Rotate(typeof map.options.rotateControl === 'object' ? map.options.rotateControl : {});
    map.rotateControl.addTo(map);
  }
  map.once('unload', () => {
    end();
    container.removeEventListener('touchstart', startTouch, true);
    container.removeEventListener('touchmove', move, true);
    container.removeEventListener('touchend', end, true);
    container.removeEventListener('touchcancel', end, true);
    window.removeEventListener('blur', end);
    map.off('cameratouchchange', change);
    map.rotateControl?.remove();
  });
}
