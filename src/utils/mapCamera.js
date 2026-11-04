const mapMethods = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Map.prototype));
const radians = Math.PI / 180;
const pointOf = point => Array.isArray(point) ? new L.Point(point[0], point[1]) : new L.Point(point.x, point.y);

L.Map.mergeOptions({
  rotate: true, bearing: 0, pitch: 0, pitchMaxDistance: 3,
  rotateControl: true, shiftKeyRotate: true, pitchDrag: true,
  touchRotate: false, touchPitch: false, compassBearing: false,
});

function angles(map) {
  const bearing = map.getBearing() * radians, pitch = map.getPitch() * radians;
  return [Math.cos(bearing), Math.sin(bearing), Math.cos(pitch), Math.sin(pitch)];
}

// Ground coordinates only: the GPU camera handles elevated geometry, never CSS transforms.
function project(map, point, inverse = false, limit = false) {
  const half = map.getSize().divideBy(2), distance = map.getSize().y * 1.5;
  if (!distance) return pointOf(point);
  const [cos, sin, tilt, rise] = angles(map);
  const p = pointOf(point).subtract(half);
  if (inverse) {
    const far = map.getSize().y * map.options.pitchMaxDistance;
    const denominator = tilt * distance + rise * p.y;
    let v = denominator > 0 ? p.y * distance / denominator : -far;
    if (limit) v = Math.max(-far, Math.min(far, v));
    const u = p.x * (distance - rise * v) / distance;
    return new L.Point(cos * u + sin * v, -sin * u + cos * v).add(half);
  }
  const u = cos * p.x - sin * p.y, v = sin * p.x + cos * p.y;
  const scale = distance / (distance - rise * v);
  return new L.Point(u * scale, tilt * v * scale).add(half);
}

function displayPoint(map, point) {
  return map.layerPointToContainerPoint(point).subtract(map._getMapPanePos());
}

function animationPoint(map, point, inverse = false) {
  const view = map._cameraView;
  if (!view) return point;
  const half = map.getSize().divideBy(2), scale = map.getZoomScale(view.zoom);
  const shift = map.project(map.getCenter(), view.zoom).subtract(map.project(view.center, view.zoom));
  return inverse ? point.subtract(half).subtract(shift).divideBy(scale).add(half) :
    point.subtract(half).multiplyBy(scale).add(shift).add(half);
}

function groundBounds(map, padding = [0, 0]) {
  const min = pointOf(padding).divideBy(2), max = map.getSize().subtract(min);
  return new L.Bounds([[min.x, min.y], [max.x, min.y], [min.x, max.y], [max.x, max.y]]
    .map(point => project(map, point, true, true)));
}

function fitCameraBounds(map, bounds, options = {}) {
  bounds = bounds.getBounds ? bounds.getBounds() : bounds instanceof L.LatLngBounds ? bounds : new L.LatLngBounds(bounds);
  const zoom = map.getZoom() ?? 0, half = map.getSize().divideBy(2), distance = map.getSize().y * 1.5;
  const min = pointOf(options.paddingTopLeft || options.padding || [0, 0]).subtract(half);
  const max = half.subtract(pointOf(options.paddingBottomRight || options.padding || [0, 0]));
  const [cos, sin, tilt, rise] = angles(map);
  const far = map.getSize().y * map.options.pitchMaxDistance;
  const vertical = y => tilt * distance + rise * y > 0
    ? Math.max(-far, Math.min(far, y * distance / (tilt * distance + rise * y))) : -far;
  const top = vertical(min.y), bottom = vertical(max.y);
  const origin = map.project(bounds.getNorthWest(), zoom).add(map.project(bounds.getSouthEast(), zoom)).divideBy(2);
  const points = [bounds.getNorthWest(), bounds.getNorthEast(), bounds.getSouthWest(), bounds.getSouthEast()]
    .map(latlng => {
      const p = map.project(latlng, zoom).subtract(origin);
      return new L.Point(cos * p.x - sin * p.y, sin * p.x + cos * p.y);
    });
  const low = Math.min(...points.map(p => p.y)), high = Math.max(...points.map(p => p.y));
  const leftSlope = min.x * rise / distance, rightSlope = max.x * rise / distance;
  const slope = rightSlope - leftSlope;
  const left = Math.min(...points.map(p => p.x + leftSlope * p.y));
  const right = Math.max(...points.map(p => p.x + rightSlope * p.y));
  // Perspective viewport edges are straight lines on the ground: fit all four corners, not their screen midpoint.
  const scale = Math.min((bottom - top) / (high - low),
    (max.x - min.x - slope * top) / (right - left - slope * low));
  let target = map.getScaleZoom(scale, zoom);
  const snap = map.options.zoomSnap;
  if (snap) target = Math.floor(Math.round(target / (snap / 100)) / 100) * snap;
  target = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), options.maxZoom ?? Infinity, target));
  if (!Number.isFinite(target)) return { center: bounds.getCenter(), zoom: target };
  const actual = map.getZoomScale(target, zoom);
  const vMin = high * actual - bottom, vMax = low * actual - top;
  const v = Math.max(vMin, slope ? (actual * (right - left) - max.x + min.x) / slope : vMin);
  const centerY = (Math.min(vMax, v) + vMax) / 2;
  const centerX = (actual * (left + right) - min.x - max.x - (leftSlope + rightSlope) * centerY) / 2;
  const center = origin.add(new L.Point(cos * centerX + sin * centerY, -sin * centerX + cos * centerY).divideBy(actual));
  return { center: map.unproject(center, zoom), zoom: target };
}

function updateSky() {
  const height = this.getSize().y, pitch = this.getPitch() * radians;
  const far = height * this.options.pitchMaxDistance, distance = height * 1.5;
  const top = height / 2 - far * Math.cos(pitch) * distance / (distance + Math.sin(pitch) * far);
  if (top > 0 && !this._pitchSky) {
    this._pitchSky = L.DomUtil.create('div', 'leaflet-pitch-sky', this.getContainer());
    this._pitchSky.setAttribute('aria-hidden', 'true');
    this._pitchSky.style.cssText = 'position:absolute;inset:0 0 auto;height:0;z-index:0;pointer-events:none;background:var(--leaflet-sky-background,linear-gradient(#9ec5e8,#dfe9f0))';
  }
  if (this._pitchSky) {
    this._pitchSky.style.height = `${Math.max(0, Math.ceil(top))}px`;
    this._pitchSky.style.display = top > 0 ? '' : 'none';
  }
}

L.Map.include({
  getBearing() { return this._cameraBearing ?? 0; },
  getPitch() { return this._cameraPitch ?? 0; },
  _stopPitchBearingAnimation() {
    cancelAnimationFrame(this._cameraFrame);
    this._cameraFrame = null;
    return this;
  },
  _setPitchAndBearing(pitch, bearing) {
    if (!Number.isFinite(pitch) || !Number.isFinite(bearing)) throw new TypeError('Camera angles must be finite numbers');
    const previousPitch = this.getPitch(), previousBearing = this.getBearing();
    this._cameraPitch = Math.max(0, Math.min(85, pitch));
    this._cameraBearing = ((bearing % 360) + 360) % 360;
    if (this._loaded) {
      updateSky.call(this);
      if (previousBearing !== this.getBearing()) this.fire('rotate', { bearing: this.getBearing() });
      if (previousPitch !== this.getPitch()) this.fire('pitch', { pitch: this.getPitch() });
    }
    return this;
  },
  _animateCamera(pitch, bearing, options = {}) {
    cancelAnimationFrame(this._cameraFrame);
    if (!Number.isFinite(pitch) || !Number.isFinite(bearing)) throw new TypeError('Camera angles must be finite numbers');
    if (!options.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return this._setPitchAndBearing(pitch, bearing);
    }
    const duration = options.duration ?? 0.3;
    if (!Number.isFinite(duration) || duration < 0) throw new TypeError('Camera duration must be nonnegative');
    const start = performance.now(), fromPitch = this.getPitch(), fromBearing = this.getBearing();
    const delta = ((bearing - fromBearing) % 360 + 540) % 360 - 180;
    const frame = now => {
      const progress = duration ? Math.min(1, (now - start) / (duration * 1000)) : 1;
      const eased = 1 - (1 - progress) ** 3;
      this._setPitchAndBearing(fromPitch + (Math.max(0, Math.min(85, pitch)) - fromPitch) * eased,
        fromBearing + delta * eased);
      if (progress < 1) this._cameraFrame = requestAnimationFrame(frame);
    };
    this._cameraFrame = requestAnimationFrame(frame);
    return this;
  },
  setBearing(bearing, options) { return this._animateCamera(this.getPitch(), bearing, options); },
  setPitch(pitch, options) { return this._animateCamera(pitch, this.getBearing(), options); },
  resetNorth(options = { animate: true }) { return this.setBearing(0, options); },
  resetNorthPitch(options = { animate: true }) { return this._animateCamera(0, 0, options); },
  layerPointToContainerPoint(point) {
    return project(this, animationPoint(this, mapMethods.layerPointToContainerPoint.call(this, point)));
  },
  containerPointToLayerPoint(point) {
    return mapMethods.containerPointToLayerPoint.call(this, animationPoint(this, project(this, point, true), true));
  },
  _getCenterLayerPoint() {
    return mapMethods.containerPointToLayerPoint.call(this, this.getSize().divideBy(2));
  },
  _updateCameraOverlays() {
    for (const layer of Object.values(this._layers)) {
      if (layer instanceof L.Marker) layer.update();
      else if (layer instanceof L.Popup || layer instanceof L.Tooltip) layer._updatePosition();
    }
  },
  panBy(offset, options) {
    const half = this.getSize().divideBy(2);
    const ground = half.subtract(project(this, half.subtract(pointOf(offset)), true));
    return mapMethods.panBy.call(this, ground, options);
  },
  setZoomAround(latlng, zoom, options) {
    if (!this.getPitch() && !this.getBearing()) return mapMethods.setZoomAround.call(this, latlng, zoom, options);
    zoom = this._limitZoom(zoom);
    const scale = this.getZoomScale(zoom), half = this.getSize().divideBy(2);
    const screen = latlng instanceof L.Point ? latlng : this.latLngToContainerPoint(latlng);
    const center = this.containerPointToLayerPoint(half), anchor = this.containerPointToLayerPoint(screen);
    const next = center.add(anchor.subtract(center).multiplyBy(1 - 1 / scale));
    return this.setView(this.layerPointToLatLng(next), zoom, { zoom: options });
  },
  panInside(latlng, options = {}) {
    if (!this.getPitch() && !this.getBearing()) return mapMethods.panInside.call(this, latlng, options);
    const min = pointOf(options.paddingTopLeft || options.padding || [0, 0]);
    const max = this.getSize().subtract(pointOf(options.paddingBottomRight || options.padding || [0, 0]));
    const screen = this.latLngToContainerPoint(latlng);
    const safe = new L.Point(Math.max(min.x, Math.min(max.x, screen.x)),
      Math.max(min.y, Math.min(max.y, screen.y)));
    if (safe.equals(screen)) return this;
    const delta = this.latLngToLayerPoint(latlng).subtract(this.containerPointToLayerPoint(safe));
    return this.panTo(this.unproject(this.project(this.getCenter()).add(delta)), options);
  },
  _limitCenter(center, zoom, bounds) {
    if (!bounds || !this._loaded || !this.getPitch() && !this.getBearing()) {
      return mapMethods._limitCenter.call(this, center, zoom, bounds);
    }
    const half = this.getSize().divideBy(2), footprint = groundBounds(this), point = this.project(center, zoom);
    const view = new L.Bounds(point.add(footprint.min.subtract(half)), point.add(footprint.max.subtract(half)));
    const offset = this._getBoundsOffset(view, bounds, zoom);
    return Math.abs(offset.x) <= 1 && Math.abs(offset.y) <= 1 ? center : this.unproject(point.add(offset), zoom);
  },
  _limitOffset(offset, bounds) {
    if (!bounds || !this.getPitch() && !this.getBearing()) return mapMethods._limitOffset.call(this, offset, bounds);
    const half = this.getSize().divideBy(2), ground = half.subtract(project(this, half.subtract(offset), true));
    const center = this.project(this.getCenter());
    const limited = this.project(this._limitCenter(this.unproject(center.add(ground)), this.getZoom(), bounds));
    return half.subtract(project(this, half.subtract(limited.subtract(center))));
  },
  _getBoundsCenterZoom(bounds, options) {
    return this.getPitch() || this.getBearing() ? fitCameraBounds(this, bounds, options) :
      mapMethods._getBoundsCenterZoom.call(this, bounds, options);
  },
  getBoundsZoom(bounds, inside, padding) {
    if (!this.getPitch() && !this.getBearing()) return mapMethods.getBoundsZoom.call(this, bounds, inside, padding);
    if (!inside) return fitCameraBounds(this, bounds, { padding: pointOf(padding || [0, 0]).divideBy(2) }).zoom;
    bounds = bounds instanceof L.LatLngBounds ? bounds : new L.LatLngBounds(bounds);
    const footprint = groundBounds(this, padding).getSize(), size = this.project(bounds.getSouthEast()).subtract(this.project(bounds.getNorthWest()));
    const zoom = this.getScaleZoom(Math.max(footprint.x / size.x, footprint.y / size.y));
    const snap = this.options.zoomSnap;
    return Math.max(this.getMinZoom(), Math.min(this.getMaxZoom(), snap ? Math.ceil(zoom / snap) * snap : zoom));
  },
  _tryAnimatedPan(center, options) {
    // Leaflet's geographic recentering already supplies ground pixels, not screen pixels.
    const offset = this._getCenterOffset(center)._trunc();
    if (options?.animate !== true && !this.getSize().contains(offset)) return false;
    mapMethods.panBy.call(this, offset, options);
    return true;
  },
  getBounds() {
    if (!this.getPitch() && !this.getBearing()) return mapMethods.getBounds.call(this);
    const footprint = groundBounds(this), bounds = new L.LatLngBounds();
    for (const point of [footprint.min, footprint.max]) {
      const raw = mapMethods.containerPointToLayerPoint.call(this, animationPoint(this, point, true));
      bounds.extend(this.layerPointToLatLng(raw));
    }
    return bounds;
  },
});

L.Map.addInitHook(function () {
  if (!document.getElementById('leaflet-camera-zoom-style')) {
    const style = document.createElement('style');
    style.id = 'leaflet-camera-zoom-style';
    style.textContent = ['.leaflet-marker-icon', '.leaflet-marker-shadow', '.leaflet-popup', '.leaflet-tooltip']
      .map(selector => `.leaflet-camera-zoom ${selector}`).join(',') + '{transition:none!important}';
    document.head.append(style);
  }
  this._setPitchAndBearing(this.options.pitch, this.options.bearing);
  this.on('load resize pitch', updateSky);
  this.on('rotate pitch', () => {
    if (this.options.maxBounds) this._panInsideMaxBounds();
  });
  this.once('unload', () => {
    cancelAnimationFrame(this._cameraFrame);
    this._pitchSky?.remove();
  });
  this.whenReady(() => {
    const draggable = this.dragging?._draggable;
    if (!draggable) return;
    const pan = () => {
      if (!this.getPitch() && !this.getBearing()) return;
      const half = this.getSize().divideBy(2), delta = draggable._newPos.subtract(draggable._startPos);
      const ground = half.subtract(project(this, half.subtract(delta), true));
      draggable._newPos = draggable._startPos.add(ground);
    };
    draggable.on('predrag', pan);
    this.once('unload', () => draggable.off('predrag', pan));
  });
  if (this.options.rotate || this.options.trackContainerMutation) {
    this.cameraReady = import('./cameraControls.js').then(({ cameraControls }) => {
      if (!this._container?._leaflet_id) return;
      cameraControls(this);
    });
    this.cameraReady.catch(error => this.fire('error', { error }));
  }
});

const markerMethods = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Marker.prototype));
L.Marker.mergeOptions({ rotation: 0, rotateWithView: false, keepUpright: false, scale: 1 });
L.Marker.include({
  setIcon(icon) {
    if (!(icon instanceof L.DivIcon)) icon.options.crossOrigin ||= true;
    const result = markerMethods.setIcon.call(this, icon);
    if (this._map && !(icon instanceof L.DivIcon)) this._initNativeGPU(this._map);
    return result;
  },
  setRotation(rotation) {
    if (!Number.isFinite(rotation)) throw new TypeError('Marker rotation must be finite');
    this.options.rotation = rotation;
    this.update();
    this._nativeGPU?.refresh?.();
    return this;
  },
  _cameraIconPoint(x, y) {
    let rotation = this.options.rotation + (this.options.rotateWithView ? this._map.getBearing() * radians : 0);
    if (this.options.keepUpright && Math.cos(rotation) < 0) rotation += Math.PI;
    const scale = this.options.scale;
    return new L.Point((x * Math.cos(rotation) - y * Math.sin(rotation)) * scale,
      (x * Math.sin(rotation) + y * Math.cos(rotation)) * scale);
  },
  getEvents() {
    return { ...markerMethods.getEvents.call(this), rotate: this.update, pitch: this.update, move: this.update };
  },
  _setPos(point) {
    markerMethods._setPos.call(this, displayPoint(this._map, point));
    for (const [element, key] of [[this._icon, 'iconAnchor'], [this._shadow, 'shadowAnchor']]) {
      if (!element) continue;
      const direction = this._cameraIconPoint(1, 0), options = this.options.icon.options;
      const anchor = options[key] || options.iconAnchor;
      element.style.transformOrigin = anchor ? `${anchor.x ?? anchor[0]}px ${anchor.y ?? anchor[1]}px` : 'center';
      element.style.transform += ` rotate(${Math.atan2(direction.y, direction.x)}rad) scale(${this.options.scale})`;
    }
  },
  _updateZIndex(offset) {
    markerMethods._updateZIndex.call(this, offset);
    const changed = this._cameraZIndexOffset !== offset;
    this._cameraZIndexOffset = offset;
    if (changed) this._nativeGPU?.refresh?.();
  },
  _initInteraction() {
    const result = markerMethods._initInteraction.call(this);
    cameraMarkerDrag.call(this);
    return result;
  },
});

// Keep Leaflet's focusable marker and its drag events; only translate its screen position back to ground.
function cameraMarkerDrag() {
    if (!this.dragging || this.dragging._cameraDrag) return;
    const drag = this.dragging, original = drag._onDrag, adjustPan = drag._adjustPan;
    drag._onDrag = function (event) {
      const map = this._marker._map;
      const screen = L.DomUtil.getPosition(this._marker._icon).add(map._getMapPanePos());
      const point = map.containerPointToLayerPoint(screen);
      const icon = this._marker._icon;
      L.DomUtil.setPosition(icon, point);
      original.call(this, event);
      this._marker._setPos(point);
    };
    drag._adjustPan = function (event) {
      const marker = this._marker, map = marker._map;
      if (!map.getPitch() && !map.getBearing()) return adjustPan.call(this, event);
      const screen = L.DomUtil.getPosition(marker._icon).add(map._getMapPanePos());
      const size = map.getSize(), padding = pointOf(marker.options.autoPanPadding);
      const speed = marker.options.autoPanSpeed;
      const movement = new L.Point(
        (Math.max(0, screen.x - size.x + padding.x) - Math.max(0, padding.x - screen.x)) / Math.max(1, padding.x) * speed,
        (Math.max(0, screen.y - size.y + padding.y) - Math.max(0, padding.y - screen.y)) / Math.max(1, padding.y) * speed);
      if (!movement.x && !movement.y) return;
      const pane = map._getMapPanePos();
      map.panBy(movement, { animate: false });
      const shift = pane.subtract(map._getMapPanePos());
      this._draggable._newPos._add(shift);
      this._draggable._startPos._add(shift);
      L.DomUtil.setPosition(marker._icon, this._draggable._newPos);
      this._onDrag(event);
      this._panRequest = requestAnimationFrame(() => this._adjustPan(event));
    };
    // The handler may already be enabled and listening with its original method.
    const enabled = drag.enabled();
    if (enabled) {
      drag._draggable.off('drag', original, drag);
      drag._draggable.on('drag', drag._onDrag, drag);
    }
    drag._cameraDrag = true;
}

for (const Class of [L.Popup, L.Tooltip]) {
  const events = Class.prototype.getEvents;
  Class.include({
    getEvents() {
      return { ...events.call(this), rotate: this._updatePosition, pitch: this._updatePosition, move: this._updatePosition };
    },
  });
}
const popupPosition = L.Popup.prototype._updatePosition;
const popupPan = L.Popup.prototype._adjustPan;
L.Popup.include({
  _adjustPan() {
    const map = this._map;
    if (!map.getPitch() && !map.getBearing()) return popupPan.call(this);
    if (!this.options.autoPan) return;
    if (map._panAnim) map._panAnim.stop();
    if (this._autopanning) { this._autopanning = false; return; }
    const rect = this._container.getBoundingClientRect(), container = map.getContainer().getBoundingClientRect();
    const min = pointOf(this.options.autoPanPaddingTopLeft || this.options.autoPanPadding);
    const max = map.getSize().subtract(pointOf(this.options.autoPanPaddingBottomRight || this.options.autoPanPadding));
    const left = rect.left - container.left, top = rect.top - container.top;
    const right = rect.right - container.left, bottom = rect.bottom - container.top;
    const dx = Math.min(0, left - min.x) || Math.max(0, right - max.x);
    const dy = Math.min(0, top - min.y) || Math.max(0, bottom - max.y);
    if (!dx && !dy) return;
    if (this.options.keepInView) this._autopanning = true;
    const screen = map.latLngToContainerPoint(this._latlng).subtract(new L.Point(dx, dy));
    const delta = map.latLngToLayerPoint(this._latlng).subtract(map.containerPointToLayerPoint(screen));
    map.fire('autopanstart');
    map.panTo(map.unproject(map.project(map.getCenter()).add(delta)));
  },
  _updatePosition() {
    popupPosition.call(this);
    if (!this._map) return;
    const point = this._map.latLngToLayerPoint(this._latlng), delta = displayPoint(this._map, point).subtract(point);
    if (this._zoomAnimated) {
      L.DomUtil.setPosition(this._container, L.DomUtil.getPosition(this._container).add(delta));
    } else {
      this._container.style.left = `${this._containerLeft + delta.x}px`;
      this._container.style.bottom = `${this._containerBottom - delta.y}px`;
    }
  },
});
const tooltipPosition = L.Tooltip.prototype._setPosition;
L.Tooltip.include({
  _setPosition(point) {
    tooltipPosition.call(this, point);
    const delta = displayPoint(this._map, point).subtract(point);
    L.DomUtil.setPosition(this._container, L.DomUtil.getPosition(this._container).add(delta));
  },
});

const tiledBounds = L.GridLayer.prototype._getTiledPixelBounds;
const gridEvents = L.GridLayer.prototype.getEvents;
L.GridLayer.include({
  getEvents() {
    const events = gridEvents.call(this);
    this._cameraGridUpdate ||= L.Util.throttle(this._onMoveEnd, this.options.updateInterval, this);
    return { ...events, rotate: this._cameraGridUpdate, pitch: this._cameraGridUpdate };
  },
  _getTiledPixelBounds(center) {
    if (!this._map.getBearing() && !this._map.getPitch()) return tiledBounds.call(this, center);
    const bounds = this._map.getBounds();
    return new L.Bounds(this._map.project(bounds.getNorthWest(), this._tileZoom),
      this._map.project(bounds.getSouthEast(), this._tileZoom));
  },
});
