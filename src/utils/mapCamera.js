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
    return project(this, mapMethods.layerPointToContainerPoint.call(this, point));
  },
  containerPointToLayerPoint(point) {
    return mapMethods.containerPointToLayerPoint.call(this, project(this, point, true));
  },
  panBy(offset, options) {
    const half = this.getSize().divideBy(2);
    const ground = project(this, half.add(pointOf(offset)), true).subtract(half);
    return mapMethods.panBy.call(this, ground, options);
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
    const size = this.getSize(), bounds = new L.LatLngBounds();
    for (const point of [[0, 0], [size.x, 0], [0, size.y], [size.x, size.y]]) {
      const raw = mapMethods.containerPointToLayerPoint.call(this, project(this, point, true, true));
      bounds.extend(this.layerPointToLatLng(raw));
    }
    return bounds;
  },
});

L.Map.addInitHook(function () {
  this._setPitchAndBearing(this.options.pitch, this.options.bearing);
  this.on('load resize pitch', updateSky);
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
  if (this.options.rotate) {
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
  setRotation(rotation) {
    if (!Number.isFinite(rotation)) throw new TypeError('Marker rotation must be finite');
    this.options.rotation = rotation;
    this.update();
    this._nativeGPU?.refresh?.();
    return this;
  },
  _cameraIconPoint(x, y) {
    let rotation = this.options.rotation + (this.options.rotateWithView ? this._map.getBearing() * radians : 0);
    if (this.options.rotateWithView && this.options.keepUpright && Math.cos(rotation) < 0) rotation += Math.PI;
    const scale = this.options.scale;
    return new L.Point((x * Math.cos(rotation) - y * Math.sin(rotation)) * scale,
      (x * Math.sin(rotation) + y * Math.cos(rotation)) * scale);
  },
  getEvents() {
    return { ...markerMethods.getEvents.call(this), rotate: this.update, pitch: this.update, move: this.update };
  },
  _setPos(point) {
    markerMethods._setPos.call(this, displayPoint(this._map, point));
    if (this._icon) {
      const direction = this._cameraIconPoint(1, 0), anchor = this.options.icon.options.iconAnchor;
      this._icon.style.transformOrigin = anchor ? `${anchor.x ?? anchor[0]}px ${anchor.y ?? anchor[1]}px` : 'center';
      this._icon.style.transform += ` rotate(${Math.atan2(direction.y, direction.x)}rad) scale(${this.options.scale})`;
    }
  },
});

// Keep Leaflet's focusable marker and its drag events; only translate its screen position back to ground.
L.Marker.addInitHook(function () {
  this.on('add', () => {
    if (!this.dragging || this.dragging._cameraDrag) return;
    const drag = this.dragging, original = drag._onDrag;
    drag._onDrag = function (event) {
      const map = this._marker._map;
      const screen = L.DomUtil.getPosition(this._marker._icon).add(map._getMapPanePos());
      const point = map.containerPointToLayerPoint(screen);
      const icon = this._marker._icon;
      L.DomUtil.setPosition(icon, point);
      original.call(this, event);
      this._marker._setPos(point);
    };
    // The handler may already be enabled and listening with its original method.
    const enabled = drag.enabled();
    if (enabled) {
      drag._draggable.off('drag', original, drag);
      drag._draggable.on('drag', drag._onDrag, drag);
    }
    drag._cameraDrag = true;
  });
});

for (const Class of [L.Popup, L.Tooltip]) {
  const events = Class.prototype.getEvents;
  Class.include({
    getEvents() {
      return { ...events.call(this), rotate: this._updatePosition, pitch: this._updatePosition, move: this._updatePosition };
    },
  });
}
const popupPosition = L.Popup.prototype._updatePosition;
L.Popup.include({
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
    return { ...events, rotate: this._onMoveEnd, pitch: this._onMoveEnd };
  },
  _getTiledPixelBounds(center) {
    if (!this._map.getBearing() && !this._map.getPitch()) return tiledBounds.call(this, center);
    const bounds = this._map.getBounds();
    return new L.Bounds(this._map.project(bounds.getNorthWest(), this._tileZoom),
      this._map.project(bounds.getSouthEast(), this._tileZoom));
  },
});
