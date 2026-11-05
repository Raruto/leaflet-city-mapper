// Leaflet-compatible classes backed by OpenLayers. Load after ol.js and before the plugin.
(() => {
  if (!window.ol) throw new Error('Unable to load OpenLayers');

  const style = document.createElement('style');
  style.dataset.openlayersBindings = '';
  style.textContent = `
.openlayers-city-mapper {
  position: relative;
  overflow: hidden;
  touch-action: none;
}
.ol-viewport {
  position: absolute !important;
  inset: 0;
}
.ol-overlaycontainer-stopevent { z-index: 1000 !important; }
.ol-city-corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: .5em;
  pointer-events: none;
}
.ol-city-topleft { top: 5em; left: .5em; }
.ol-city-topright { top: 10px; right: 10px; }
.ol-city-bottomleft { bottom: .5em; left: .5em; }
.ol-city-bottomright { bottom: 4em; right: .5em; }
.ol-attribution {
  text-align: justify;
  border-radius: 0 !important;
  left: 0;
  right: 0 !important;
  max-width: unset;
  font-family: "Helvetica Neue", Arial, Helvetica, sans-serif;
  font-size: .75rem;
  line-height: 1.5;
}
.ol-attribution a { color: #0078A8; }
.ol-attribution * { text-shadow: none !important; }
.ol-city-control {
  position: static;
  pointer-events: auto;
  font: 13px/1.5 sans-serif;
}
.ol-city-rotate {
  padding: 0;
  border: 1px solid #0003;
  border-radius: 4px;
  background: #fff;
  background-clip: padding-box;
}
.ol-city-rotate a {
  display: block;
  width: 30px;
  height: 30px;
  border-radius: 2px;
  color: #000;
  text-decoration: none;
}
.ol-city-rotate a:hover { background: #f4f4f4; }
.ol-city-rotate a:focus-visible { outline: 2px solid #2675c9; }
.ol-city-layers {
  max-height: calc(100vh - 5em);
  overflow: auto;
  border-radius: 4px;
}
.ol-city-layers section { padding: .5em; background: var(--ol-background-color); }
.ol-city-layers label { display: block; cursor: pointer; white-space: nowrap; }
.ol-city-layers input { vertical-align: middle; }
.ol-city-layers hr { border: 0; border-top: 1px solid #ccc; }
.ol-city-layers .ol-control { background: transparent; }
.ol-city-layers .sunlight-time button { width: auto; padding: 0 .4em; flex-shrink: 0; }
.openlayers-city-mapper .leaflet-pane {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.ol-zoom button { width: 30px; height: 30px; }
.openlayers-city-mapper .leaflet-marker-icon,
.openlayers-city-mapper .leaflet-marker-shadow {
  position: absolute;
  top: 0;
  left: 0;
}
.openlayers-city-mapper .leaflet-marker-icon { pointer-events: auto; cursor: pointer; }
.openlayers-city-mapper .leaflet-div-icon { background: #fff; border: 1px solid #666; }
.ol-city-popup {
  padding: 10px;
  background: white;
  border: 1px solid #888;
  border-radius: 4px;
  font: 14px sans-serif;
}
.ol-city-popup button { float: right; margin-left: 12px; }
.ol-city-tooltip {
  position: absolute;
  z-index: 1100;
  padding: 4px 8px;
  background: white;
  border: 1px solid #888;
  pointer-events: none;
}
`;
  document.head.appendChild(style);

  const L = window.L = { version: '1.9.4-openlayers', control: {} };
  let lastId = 0;
  const stamp = object => object._leaflet_id ||= ++lastId;
  const setOptions = (object, options) => object.options = { ...object.options, ...options };
  const zoomTiming = new Animation(new KeyframeEffect(null, [], {
    duration: 1, fill: 'both', easing: 'cubic-bezier(0,0,0.25,1)',
  }));

  function Class(...args) {
    this.initialize?.(...args);
    this.callInitHooks();
  }
  Class.extend = function (properties) {
    function Child(...args) {
      this.initialize?.(...args);
      this.callInitHooks();
    }
    Object.setPrototypeOf(Child, this);
    Child.prototype = Object.create(this.prototype);
    Object.assign(Child.prototype, properties, { constructor: Child });
    Child.prototype.options = { ...this.prototype.options, ...properties.options };
    Child.prototype._initHooks = [];
    return Child;
  };
  Class.include = function (properties) { Object.assign(this.prototype, properties); return this; };
  Class.mergeOptions = function (options) {
    this.prototype.options = { ...this.prototype.options, ...options };
    return this;
  };
  Class.addInitHook = function (hook, ...args) {
    if (!Object.hasOwn(this.prototype, '_initHooks')) this.prototype._initHooks = [];
    this.prototype._initHooks.push(typeof hook === 'function' ? hook : function () { this[hook](...args); });
    return this;
  };
  Class.prototype.callInitHooks = function () {
    if (this._initHooksCalled) return;
    this._initHooksCalled = true;
    const prototypes = [];
    for (let proto = Object.getPrototypeOf(this); proto; proto = Object.getPrototypeOf(proto)) prototypes.unshift(proto);
    for (const proto of prototypes) {
      if (Object.hasOwn(proto, '_initHooks')) for (const hook of proto._initHooks) hook.call(this);
    }
  };
  L.Evented = Class.extend({
    on(types, fn, context) {
      if (typeof types === 'object') {
        for (const [type, handler] of Object.entries(types)) this.on(type, handler, fn);
      } else {
        this._events ||= {};
        for (const type of types.split(/\s+/)) {
          const events = this._events[type] ||= [];
          if (!events.some(event => event.fn === fn && event.context === context)) events.push({ fn, context });
        }
      }
      return this;
    },
    off(types, fn, context) {
      if (!types) this._events = {};
      else if (typeof types === 'object') {
        for (const [type, handler] of Object.entries(types)) this.off(type, handler, fn);
      } else {
        for (const type of types.split(/\s+/)) {
          if (this._events?.[type]) this._events[type] = fn
            ? this._events[type].filter(event => event.fn !== fn || event.context !== context) : [];
        }
      }
      return this;
    },
    once(types, fn, context) {
      const handler = event => { this.off(types, handler); fn.call(context || this, event); };
      return this.on(types, handler);
    },
    fire(type, data) {
      for (const event of [...this._events?.[type] || []]) {
        event.fn.call(event.context || this, { ...data, type, target: this, sourceTarget: this });
      }
      return this;
    },
    listens(type) { return Boolean(this._events?.[type]?.length); },
  });
  L.Util = {
    stamp, setOptions,
    throttle(fn, interval, context) {
      let timer, pending;
      const run = (...args) => {
        if (timer) { pending = args; return; }
        fn.apply(context, args);
        timer = setTimeout(() => {
          timer = null;
          if (pending) { const args = pending; pending = null; run(...args); }
        }, interval);
      };
      return run;
    },
  };

  L.Point = function (x, y, round) {
    this.x = round ? Math.round(x) : x;
    this.y = round ? Math.round(y) : y;
  };
  const point = value => value instanceof L.Point ? value
    : Array.isArray(value) ? new L.Point(...value) : new L.Point(value.x, value.y);
  L.Point.prototype = {
    clone() { return new L.Point(this.x, this.y); },
    add(value) { return this.clone()._add(point(value)); },
    _add(value) { this.x += value.x; this.y += value.y; return this; },
    subtract(value) { return this.clone()._subtract(point(value)); },
    _subtract(value) { this.x -= value.x; this.y -= value.y; return this; },
    multiplyBy(value) { return new L.Point(this.x * value, this.y * value); },
    divideBy(value) { return new L.Point(this.x / value, this.y / value); },
    scaleBy(value) { return new L.Point(this.x * value.x, this.y * value.y); },
    unscaleBy(value) { return new L.Point(this.x / value.x, this.y / value.y); },
    round() { return new L.Point(Math.round(this.x), Math.round(this.y)); },
    floor() { return new L.Point(Math.floor(this.x), Math.floor(this.y)); },
    ceil() { return new L.Point(Math.ceil(this.x), Math.ceil(this.y)); },
    distanceTo(value) { value = point(value); return Math.hypot(this.x - value.x, this.y - value.y); },
    equals(value) { value = point(value); return this.x === value.x && this.y === value.y; },
    contains(value) { value = point(value); return Math.abs(value.x) <= Math.abs(this.x) && Math.abs(value.y) <= Math.abs(this.y); },
  };
  L.LatLng = function (lat, lng, alt) {
    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) throw new Error('Invalid LatLng');
    this.lat = Number(lat); this.lng = Number(lng);
    if (alt !== undefined) this.alt = alt;
  };
  const latLng = value => value instanceof L.LatLng ? value
    : Array.isArray(value) ? new L.LatLng(...value) : new L.LatLng(value.lat, value.lng);
  L.LatLng.prototype = {
    equals(value, margin = 1e-9) {
      value = latLng(value);
      return Math.max(Math.abs(this.lat - value.lat), Math.abs(this.lng - value.lng)) <= margin;
    },
    distanceTo(value) { value = latLng(value); return ol.sphere.getDistance([this.lng, this.lat], [value.lng, value.lat]); },
    wrap() { return new L.LatLng(this.lat, ((this.lng + 180) % 360 + 360) % 360 - 180, this.alt); },
  };
  L.Bounds = function (a, b) {
    if (a) for (const value of b ? [a, b] : Array.isArray(a) ? a : [a]) this.extend(value);
  };
  L.Bounds.prototype = {
    extend(value) {
      if (value instanceof L.Bounds) { this.extend(value.min); this.extend(value.max); return this; }
      value = point(value);
      if (!this.min) { this.min = value.clone(); this.max = value.clone(); }
      else {
        this.min.x = Math.min(this.min.x, value.x); this.min.y = Math.min(this.min.y, value.y);
        this.max.x = Math.max(this.max.x, value.x); this.max.y = Math.max(this.max.y, value.y);
      }
      return this;
    },
    getCenter() { return this.min.add(this.max).divideBy(2); },
    getSize() { return this.max.subtract(this.min); },
    contains(value) {
      const min = value.min || point(value), max = value.max || min;
      return min.x >= this.min.x && max.x <= this.max.x && min.y >= this.min.y && max.y <= this.max.y;
    },
    intersects(value) {
      return value.max.x >= this.min.x && value.min.x <= this.max.x && value.max.y >= this.min.y && value.min.y <= this.max.y;
    },
  };
  L.LatLngBounds = function (a, b) {
    if (a) for (const value of b ? [a, b] : a) this.extend(value);
  };
  L.LatLngBounds.prototype = {
    extend(value) {
      if (value instanceof L.LatLngBounds) { this.extend(value._southWest); this.extend(value._northEast); return this; }
      value = latLng(value);
      if (!this._southWest) {
        this._southWest = new L.LatLng(value.lat, value.lng);
        this._northEast = new L.LatLng(value.lat, value.lng);
      } else {
        this._southWest.lat = Math.min(this._southWest.lat, value.lat);
        this._southWest.lng = Math.min(this._southWest.lng, value.lng);
        this._northEast.lat = Math.max(this._northEast.lat, value.lat);
        this._northEast.lng = Math.max(this._northEast.lng, value.lng);
      }
      return this;
    },
    getSouthWest() { return this._southWest; },
    getNorthEast() { return this._northEast; },
    getNorthWest() { return new L.LatLng(this.getNorth(), this.getWest()); },
    getSouthEast() { return new L.LatLng(this.getSouth(), this.getEast()); },
    getNorth() { return this._northEast.lat; },
    getSouth() { return this._southWest.lat; },
    getEast() { return this._northEast.lng; },
    getWest() { return this._southWest.lng; },
    getCenter() { return new L.LatLng((this.getNorth() + this.getSouth()) / 2, (this.getEast() + this.getWest()) / 2); },
    contains(value) {
      value = latLng(value);
      return value.lat >= this.getSouth() && value.lat <= this.getNorth() && value.lng >= this.getWest() && value.lng <= this.getEast();
    },
    isValid() { return Boolean(this._southWest && this._northEast); },
  };

  const radius = 6378137, circumference = 2 * Math.PI * radius;
  const crs = {
    scale: zoom => 256 * 2 ** zoom,
    zoom: scale => Math.log2(scale / 256),
    project(value) { value = latLng(value); return point(ol.proj.fromLonLat([value.lng, Math.max(-85.0511287798, Math.min(85.0511287798, value.lat))])); },
    unproject(value) { const [lng, lat] = ol.proj.toLonLat([value.x, value.y]); return new L.LatLng(lat, lng); },
    transformation: {
      transform(value, scale) { return new L.Point((value.x / circumference + 0.5) * scale, (0.5 - value.y / circumference) * scale); },
      untransform(value, scale) { return new L.Point((value.x / scale - 0.5) * circumference, (0.5 - value.y / scale) * circumference); },
    },
  };

  L.DomUtil = {
    create(tag, className = '', parent) {
      const element = document.createElement(tag);
      element.className = className; parent?.append(element); return element;
    },
    setPosition(element, value) { element._leaflet_pos = point(value); element.style.transform = `translate(${value.x}px,${value.y}px)`; },
    getPosition(element) { return element._leaflet_pos || new L.Point(0, 0); },
  };
  const domListeners = new WeakMap();
  function domEvent(add, element, types, fn, context) {
    if (typeof types === 'object') {
      for (const [type, handler] of Object.entries(types)) domEvent(add, element, type, handler, fn);
      return L.DomEvent;
    }
    let listeners = domListeners.get(element);
    if (!listeners) domListeners.set(element, listeners = []);
    for (const type of types.split(/\s+/)) {
      const existing = listeners.find(item => item.type === type && item.fn === fn && item.context === context);
      if (add && !existing) {
        const handler = context ? fn.bind(context) : fn;
        listeners.push({ type, fn, context, handler });
        element.addEventListener(type, handler, { passive: false });
      } else if (!add && existing) {
        element.removeEventListener(type, existing.handler);
        listeners.splice(listeners.indexOf(existing), 1);
      }
    }
    return L.DomEvent;
  }
  const stopPropagation = event => event.stopPropagation();
  L.DomEvent = {
    on: (...args) => domEvent(true, ...args),
    off: (...args) => domEvent(false, ...args),
    stop(event) { event.preventDefault(); event.stopPropagation(); },
    disableClickPropagation(element) {
      element.classList.add('leaflet-control');
      L.DomEvent.on(element, 'click dblclick pointerdown mousedown touchstart contextmenu', stopPropagation);
      return this;
    },
    disableScrollPropagation(element) { return this.on(element, 'wheel', stopPropagation); },
  };
  L.Handler = Class.extend({
    initialize(map) { this._map = map; },
    enable() { if (!this._enabled) { this._enabled = true; this.addHooks?.(); } return this; },
    disable() { if (this._enabled) { this._enabled = false; this.removeHooks?.(); } return this; },
    enabled() { return Boolean(this._enabled); },
    moving() { return Boolean(this._moving); },
  });
  L.Layer = L.Evented.extend({
    initialize(options) { setOptions(this, options); },
    addTo(map) { map.addLayer(this); return this; },
    remove() { return this.removeFrom(this._map || this._mapToAdd); },
    removeFrom(map) { map?.removeLayer(this); return this; },
    getAttribution() { return this.options.attribution; },
    getPane(name) { return this._map.getPane(name || this.options.pane); },
    _layerAdd({ target: map }) {
      if (!map.hasLayer(this)) return;
      this._map = map;
      if (this.getEvents) { this._mapEvents = this.getEvents(); map.on(this._mapEvents, this); }
      this.onAdd?.(map);
      this.fire('add'); map.fire('layeradd', { layer: this });
    },
  });
  L.LayerGroup = L.Layer.extend({
    initialize(layers = [], options) {
      setOptions(this, options); this._layers = {};
      for (const layer of layers) this.addLayer(layer);
    },
    addLayer(layer) { this._layers[stamp(layer)] = layer; this._map?.addLayer(layer); return this; },
    removeLayer(layer) { delete this._layers[stamp(layer)]; this._map?.removeLayer(layer); return this; },
    hasLayer(layer) { return stamp(layer) in this._layers; },
    eachLayer(fn, context) { for (const layer of Object.values(this._layers)) fn.call(context || this, layer); return this; },
    onAdd(map) { this.eachLayer(map.addLayer, map); },
    onRemove(map) { this.eachLayer(map.removeLayer, map); },
  });
  // Declare the hierarchy before the plugin installs its instanceof checks and hooks.
  for (const [name, parent] of [
    ['GridLayer', L.Layer], ['Marker', L.Layer], ['Path', L.Layer],
    ['Polyline', null], ['Polygon', null], ['CircleMarker', null], ['Circle', null],
    ['ImageOverlay', L.Layer], ['VideoOverlay', null], ['SVGOverlay', null],
    ['Popup', L.Layer], ['Tooltip', L.Layer], ['DivIcon', Class],
  ]) {
    const base = parent || ({ Polyline: L.Path, Polygon: L.Polyline, CircleMarker: L.Path,
      Circle: L.CircleMarker, VideoOverlay: L.ImageOverlay, SVGOverlay: L.ImageOverlay })[name];
    L[name] = base.extend({
      initialize() { throw new Error(`L.${name} is not supported by the OpenLayers bindings; use L.Layer with a source`); },
      getEvents() { return {}; },
    });
  }

  L.Map = L.Evented.extend({
    options: { crs, minZoom: 0, maxZoom: 24, zoomSnap: 1, touchZoom: true,
      scrollWheelZoom: true, keyboard: true, doubleClickZoom: true,
      wheelDebounceTime: 40, wheelPxPerZoomLevel: 60 },
    initialize(target, options) {
      setOptions(this, options);
      this._container = typeof target === 'string' ? document.getElementById(target) : target;
      if (!this._container) throw new Error('Map container not found');
      stamp(this._container);
      this._container.classList.add('openlayers-city-mapper');
      this._layers = {}; this._panes = {}; this._handlers = []; this._controls = new Set();
      const center = crs.project(this.options.center || [0, 0]);
      this.ol = new ol.Map({
        target: this._container, controls: [new ol.control.Zoom(), new ol.control.Attribution({collapsible: false })],
        interactions: [],
        view: new ol.View({ center: [center.x, center.y], zoom: this.options.zoom || 0,
          minZoom: this.getMinZoom(), maxZoom: this.getMaxZoom() }),
      });
      for (const control of this.ol.getControls().getArray()) {
        control.element.classList.add('leaflet-control');
        for (const button of control.element.querySelectorAll('button[title]')) button.setAttribute('aria-label', button.title);
        if (control instanceof ol.control.Zoom) {
          for (const [selector, delta] of [['.ol-zoom-in', 1], ['.ol-zoom-out', -1]]) {
            control.element.querySelector(selector).addEventListener('click', event => {
              L.DomEvent.stop(event);
              event.stopImmediatePropagation();
              this._zoomBy(delta * (event.shiftKey ? 3 : 1));
            }, true);
          }
        }
      }
      this._loaded = true;
      this._zoomAnimated = false;
      this.dragging = new L.Handler(this).enable();
      this.touchZoom = new L.Handler(this);
      if (this.options.touchZoom) this.touchZoom.enable();
      this._handlers.push(this.dragging, this.touchZoom);
      for (const name of ['scrollWheelZoom', 'keyboard', 'doubleClickZoom']) this.addHandler(name, L.Handler);
      if (!this._container.hasAttribute('tabindex')) this._container.tabIndex = 0;
      const view = this.ol.getView();
      this._viewZoom = view.getZoom();
      view.on(['change:center', 'change:resolution'], () => {
        if (this._settingView) return;
        const zoomChanged = view.getZoom() !== this._viewZoom;
        if (!this._viewMoving) { this._viewMoving = true; this.fire('movestart'); }
        if (zoomChanged && !this._viewZooming) { this._viewZooming = true; this.fire('zoomstart'); }
        this.fire('move');
        if (zoomChanged) this.fire('zoom');
        this._viewZoom = view.getZoom();
        if (!view.getAnimating() && !view.getInteracting()) this._endViewChange();
      });
      this.ol.on('moveend', () => this._endViewChange());
      // OpenLayers interactions need the pitched ground coordinate, not the flat viewport.
      this.ol.getCoordinateFromPixel = pixel => {
        const coordinate = crs.project(this.containerPointToLatLng(point(pixel)));
        return [coordinate.x, coordinate.y];
      };
      this._wheelDelta = 0;
      this.ol.addInteraction(new ol.interaction.Interaction({
        handleEvent: event => {
          const original = event.originalEvent;
          if (original.target.closest('.ol-control')) return true;
          if (event.type === 'dblclick' && this.doubleClickZoom.enabled()) {
            this._zoomBy(original.shiftKey ? -1 : 1, point(event.pixel));
          } else if (event.type === 'wheel' && this.scrollWheelZoom.enabled() && !original.shiftKey) {
            const ratio = window.devicePixelRatio || 1;
            const factor = /Linux/.test(navigator.platform) && /Chrome/.test(navigator.userAgent) ? ratio
              : /Mac/.test(navigator.platform) ? 3 * ratio : 2 * ratio;
            this._wheelDelta -= original.deltaY * (original.deltaMode === 1 ? 20
              : original.deltaMode === 2 ? 60 : 1 / factor);
            this._wheelPixel = point(event.pixel);
            this._wheelStart ??= performance.now();
            clearTimeout(this._wheelTimer);
            this._wheelTimer = setTimeout(() => {
              const magnitude = 4 * Math.log2(2 / (1 + Math.exp(-Math.abs(this._wheelDelta /
                (this.options.wheelPxPerZoomLevel * 4)))));
              const snap = this.options.zoomSnap;
              const delta = Math.sign(this._wheelDelta) * (snap ? Math.ceil(magnitude / snap) * snap : magnitude);
              this._wheelDelta = 0;
              this._wheelStart = null;
              if (this._loaded && this.scrollWheelZoom.enabled()) this._zoomBy(delta,
                this.options.scrollWheelZoom === 'center' ? undefined : this._wheelPixel);
            }, Math.max(0, this.options.wheelDebounceTime - (performance.now() - this._wheelStart)));
          } else return true;
          original.preventDefault();
          return false;
        },
      }));
      this._controlCorners = {};
      for (const position of ['topleft', 'topright', 'bottomleft', 'bottomright']) {
        this._controlCorners[position] = L.DomUtil.create('div',
          `ol-city-corner ol-city-${position}`, this.ol.getOverlayContainerStopEvent());
      }
      const attributionSource = new ol.source.Vector();
      this.ol.addLayer(new ol.layer.Vector({ source: attributionSource }));
      const updateAttribution = () => {
        const values = new Set(['<a href="https://openlayers.org/">OpenLayers</a>']);
        this.eachLayer(layer => { if (layer.getAttribution?.()) values.add(layer.getAttribution()); });
        attributionSource.setAttributions([...values]);
      };
      this.on('layeradd layerremove', updateAttribution);
      updateAttribution();
      let anchor, pointerId;
      const pixel = event => {
        const rect = this._container.getBoundingClientRect();
        return new L.Point(event.clientX - rect.left, event.clientY - rect.top);
      };
      this._onPointer = event => {
        if (event.type === 'pointerdown') {
          if (!this.dragging.enabled() || event.button !== 0 || !event.isPrimary || event.target.closest('.ol-control')) return;
          anchor = this.containerPointToLatLng(pixel(event)); pointerId = event.pointerId;
          this._moved = this.dragging._moving = false;
          this._container.focus({ preventScroll: true });
          this._container.setPointerCapture(pointerId);
        } else if (event.pointerId === pointerId && event.type === 'pointermove' && this.dragging.enabled()) {
          const delta = this.project(anchor).subtract(this.project(this.containerPointToLatLng(pixel(event))));
          if (Math.hypot(delta.x, delta.y) > 1) this._moved = this.dragging._moving = true;
          this.setView(this.unproject(this.project(this.getCenter()).add(delta)), this.getZoom());
        } else if (event.pointerId === pointerId && event.type !== 'pointermove') {
          if (this._container.hasPointerCapture(pointerId)) this._container.releasePointerCapture(pointerId);
          anchor = null; pointerId = null;
          this.dragging._moving = false;
        }
      };
      this._onKey = event => {
        if (!this.keyboard.enabled() || event.target !== this._container || event.altKey || event.ctrlKey || event.metaKey) return;
        const offsets = { ArrowLeft: [-80, 0], ArrowRight: [80, 0], ArrowUp: [0, -80], ArrowDown: [0, 80] };
        if (offsets[event.key]) this.panBy(offsets[event.key]);
        else if (['+', '=', '-', '_'].includes(event.key)) this._zoomBy(
          (['-', '_'].includes(event.key) ? -1 : 1) * (event.shiftKey ? 3 : 1));
        else return;
        event.preventDefault();
      };
      L.DomEvent.on(this._container, 'pointerdown pointermove pointerup pointercancel', this._onPointer);
      L.DomEvent.on(this._container, 'keydown', this._onKey);
      this.ol.on('change:size', () => this.fire('resize', { newSize: this.getSize() }));
      this.ol.updateSize();
    },
    getContainer() { return this._container; },
    getSize() { return point(this.ol.getSize() || [this._container.clientWidth, this._container.clientHeight]); },
    getCenter() { return crs.unproject(point(this.ol.getView().getCenter())); },
    getZoom() { return this.ol.getView().getZoom(); },
    getMinZoom() { return this.options.minZoom; },
    getMaxZoom() { return this.options.maxZoom; },
    getZoomScale(to, from = this.getZoom()) { return 2 ** (to - from); },
    getScaleZoom(scale, from = this.getZoom()) { return from + Math.log2(scale); },
    _limitZoom(zoom) { return Math.max(this.getMinZoom(), Math.min(this.getMaxZoom(), zoom)); },
    project(value, zoom = this.getZoom()) { return crs.transformation.transform(crs.project(value), crs.scale(zoom)); },
    unproject(value, zoom = this.getZoom()) { return crs.unproject(crs.transformation.untransform(point(value), crs.scale(zoom))); },
    getPixelOrigin() { return this.project(this.getCenter()).subtract(this.getSize().divideBy(2)); },
    _getMapPanePos() { return new L.Point(0, 0); },
    latLngToLayerPoint(value) { return this.project(value).subtract(this.getPixelOrigin()); },
    layerPointToLatLng(value) { return this.unproject(point(value).add(this.getPixelOrigin())); },
    layerPointToContainerPoint(value) { return point(value).clone(); },
    containerPointToLayerPoint(value) { return point(value).clone(); },
    latLngToContainerPoint(value) { return this.layerPointToContainerPoint(this.latLngToLayerPoint(value)); },
    containerPointToLatLng(value) { return this.layerPointToLatLng(this.containerPointToLayerPoint(value)); },
    getBounds() { return new L.LatLngBounds(this.containerPointToLatLng([0, 0]), this.containerPointToLatLng(this.getSize())); },
    _endViewChange() {
      if (!this._viewMoving) return;
      const zooming = this._viewZooming;
      this._viewMoving = this._viewZooming = false;
      if (zooming) this.fire('zoomend');
      this.fire('moveend');
    },
    _zoomBy(delta, pixel) {
      if (!delta || this.ol.getView().getAnimating()) return this;
      const zoom = this._limitZoom(this.getZoom() + delta);
      return pixel ? this.setZoomAround(pixel, zoom, { animate: true })
        : this.setZoom(zoom, { animate: true });
    },
    setView(center, zoom = this.getZoom(), options = {}) {
      center = latLng(center); zoom = this._limitZoom(zoom);
      if ((options.animate === true || options.zoom?.animate === true) && zoom !== this.getZoom()) {
        const scale = this.getZoomScale(zoom), projected = crs.project(center);
        // Leaflet animates CSS scale, not resolution; convert the same native CSS easing.
        this.ol.getView().animate({
          center: [projected.x, projected.y], zoom, duration: 250,
          easing: time => {
            zoomTiming.currentTime = time;
            const progress = zoomTiming.effect.getComputedTiming().progress;
            return (1 - 1 / (1 + (scale - 1) * progress)) / (1 - 1 / scale);
          },
        });
        return this;
      }
      this.ol.getView().cancelAnimations();
      this._endViewChange();
      const zoomChanged = zoom !== this.getZoom(), moved = !center.equals(this.getCenter());
      if (!zoomChanged && !moved) return this;
      this.fire('movestart');
      if (zoomChanged) this.fire('zoomstart');
      this._settingView = true;
      const projected = crs.project(center);
      this.ol.getView().setCenter([projected.x, projected.y]);
      this.ol.getView().setZoom(zoom);
      this._viewZoom = this.getZoom();
      this._settingView = false;
      if (zoomChanged) this.fire('zoom');
      this.fire('move').fire('viewreset');
      if (zoomChanged) this.fire('zoomend');
      return this.fire('moveend');
    },
    setZoom(zoom, options) { return this.setView(this.getCenter(), zoom, options); },
    panTo(center) { return this.setView(center); },
    panBy(offset) { return this.panTo(this.unproject(this.project(this.getCenter()).add(point(offset)))); },
    setZoomAround(value, zoom, options) {
      const anchor = value instanceof L.Point ? value : this.latLngToContainerPoint(value);
      const half = this.getSize().divideBy(2), scale = this.getZoomScale(zoom);
      return this.setView(this.unproject(this.project(this.getCenter()).add(anchor.subtract(half).multiplyBy(1 - 1 / scale))), zoom, options);
    },
    getBoundsZoom(bounds, inside, padding = [0, 0]) {
      const size = this.project(bounds.getSouthEast()).subtract(this.project(bounds.getNorthWest()));
      const available = this.getSize().subtract(point(padding));
      const scale = Math[inside ? 'max' : 'min'](available.x / size.x, available.y / size.y);
      return this._limitZoom(this.getScaleZoom(scale));
    },
    _getBoundsCenterZoom(bounds, options = {}) { return { center: bounds.getCenter(), zoom: this.getBoundsZoom(bounds, false, options.padding) }; },
    fitBounds(bounds, options) { const view = this._getBoundsCenterZoom(bounds, options); return this.setView(view.center, view.zoom); },
    _limitCenter(center) { return center; },
    _limitOffset(offset) { return offset; },
    _tryAnimatedPan() { return false; },
    panInside(value) { if (!this.getBounds().contains(value)) this.panTo(value); return this; },
    whenReady(fn, context) { if (this._loaded) fn.call(context || this, { target: this }); else this.once('load', fn, context); return this; },
    addLayer(layer) {
      const id = stamp(layer);
      if (this._layers[id]) return this;
      this._layers[id] = layer; layer._mapToAdd = this;
      layer.beforeAdd?.(this);
      this.whenReady(layer._layerAdd, layer);
      return this;
    },
    removeLayer(layer) {
      if (!this.hasLayer(layer)) return this;
      layer.onRemove?.(this);
      if (layer._mapEvents) this.off(layer._mapEvents, layer);
      delete this._layers[stamp(layer)];
      this.fire('layerremove', { layer }); layer.fire('remove');
      layer._map = layer._mapToAdd = null;
      return this;
    },
    hasLayer(layer) { return Boolean(this._layers[stamp(layer)]); },
    eachLayer(fn, context) { for (const layer of Object.values(this._layers)) fn.call(context || this, layer); return this; },
    createPane(name, parent = this._container) { return this._panes[name] = L.DomUtil.create('div', `leaflet-pane leaflet-${name}`, parent); },
    getPane(name = 'overlayPane') { return this._panes[name]; },
    addHandler(name, Handler) { this[name] = new Handler(this); this._handlers.push(this[name]); if (this.options[name]) this[name].enable(); return this; },
    invalidateSize() { this.ol.updateSize(); return this; },
    _draggableMoved() { return Boolean(this._moved); },
    remove() {
      clearTimeout(this._wheelTimer);
      this.ol.getView().cancelAnimations();
      this.fire('unload');
      for (const control of [...this._controls]) control.remove();
      this.eachLayer(this.removeLayer, this);
      for (const handler of this._handlers) handler.disable();
      L.DomEvent.off(this._container, 'pointerdown pointermove pointerup pointercancel', this._onPointer);
      L.DomEvent.off(this._container, 'keydown', this._onKey);
      this.ol.setTarget(undefined); this.ol.dispose();
      for (const corner of Object.values(this._controlCorners)) corner.remove();
      for (const pane of Object.values(this._panes)) pane.remove();
      this._loaded = false;
      delete this._container._leaflet_id;
      return this.off();
    },
  });

  L.Control = Class.extend({
    options: { position: 'topright' },
    initialize(options) { setOptions(this, options); },
    getPosition() { return this.options.position; },
    getContainer() { return this._container; },
    addTo(map) {
      this.remove(); this._map = map;
      this._container = this.onAdd(map);
      if (L.Control.Rotate && this instanceof L.Control.Rotate) {
        this._container.classList.add('ol-city-rotate');
      }
      this._container.classList.add('leaflet-control', 'ol-control', 'ol-city-control');
      this._olControl = new ol.control.Control({
        element: this._container, target: map._controlCorners[this.getPosition()],
      });
      map.ol.addControl(this._olControl);
      map._controls.add(this);
      return this;
    },
    remove() {
      if (!this._map) return this;
      const map = this._map;
      this.onRemove?.(map); this._container?.remove();
      map.ol.removeControl(this._olControl);
      map._controls.delete(this); this._map = null;
      return this;
    },
  });
  L.Control.Layers = L.Control.extend({
    options: { collapsed: true },
    initialize(base = {}, overlays = {}, options) {
      setOptions(this, options); this._layers = [];
      for (const [name, layer] of Object.entries(base)) this._layers.push({ name, layer, overlay: false });
      for (const [name, layer] of Object.entries(overlays)) this._layers.push({ name, layer, overlay: true });
    },
    onAdd(map) {
      const container = L.DomUtil.create('div', 'ol-city-layers');
      L.DomEvent.disableClickPropagation(container); L.DomEvent.disableScrollPropagation(container);
      const list = L.DomUtil.create('section', '', container);
      list.setAttribute('aria-label', 'Map layers');
      const base = L.DomUtil.create('div', '', list);
      L.DomUtil.create('hr', '', list);
      const overlays = L.DomUtil.create('div', '', list);
      this._inputs = [];
      for (const entry of this._layers) {
        const label = L.DomUtil.create('label', '', entry.overlay ? overlays : base);
        const input = L.DomUtil.create('input', 'leaflet-control-layers-selector', label);
        input.type = entry.overlay ? 'checkbox' : 'radio';
        input.name = `base-${stamp(this)}`; input.layerId = stamp(entry.layer);
        input.checked = map.hasLayer(entry.layer);
        label.append(document.createTextNode(` ${entry.name}`));
        this._inputs.push(input);
        input.onchange = () => {
          const checked = input.checked;
          if (!entry.overlay) for (const other of this._layers) {
            if (!other.overlay && other !== entry) map.removeLayer(other.layer);
          }
          if (checked) map.addLayer(entry.layer); else map.removeLayer(entry.layer);
        };
      }
      map.on('layeradd layerremove', this._update, this);
      return container;
    },
    _update() { for (const input of this._inputs) input.checked = Boolean(this._map._layers[input.layerId]); },
    onRemove(map) { map.off('layeradd layerremove', this._update, this); },
  });

  // Native layer contracts consumed by the plugin's WebGPU renderer.
  const bounds = value => value instanceof L.LatLngBounds ? value : new L.LatLngBounds(value);
  const coordinates = values => values.map(value => Array.isArray(value) && typeof value[0] !== 'number'
    ? coordinates(value) : latLng(value));
  const image = (url, options, className) => {
    const element = document.createElement('img');
    element.className = className;
    if (options.crossOrigin) element.crossOrigin = options.crossOrigin === true ? '' : options.crossOrigin;
    element.src = url;
    element.draggable = false;
    return element;
  };

  L.Layer.include({
    bindPopup(content) {
      this._popupContent = content;
      this.off('click', this.openPopup, this).on('click', this.openPopup, this);
      this.once('remove', this.closePopup, this);
      if (this instanceof L.LayerGroup) this.eachLayer(layer => layer.bindPopup(content));
      return this;
    },
    openPopup(event) {
      if (!this._map) return this;
      this.closePopup();
      const location = event?.latlng || this.getLatLng?.() || this.getBounds?.().getCenter();
      if (!location) throw new Error('Popup requires a location');
      const element = L.DomUtil.create('div', 'ol-city-popup leaflet-popup');
      element.setAttribute('role', 'dialog');
      const close = L.DomUtil.create('button', '', element);
      close.type = 'button'; close.textContent = '\u00d7'; close.setAttribute('aria-label', 'Close popup');
      close.onclick = () => this.closePopup();
      const content = L.DomUtil.create('div', '', element);
      const value = typeof this._popupContent === 'function' ? this._popupContent(this) : this._popupContent;
      if (value instanceof Node) content.append(value); else content.innerHTML = value;
      L.DomEvent.disableClickPropagation(element);
      this._popupOverlay = new ol.Overlay({ element, positioning: 'bottom-center', offset: [0, -12] });
      this._map.ol.addOverlay(this._popupOverlay);
      this._popupLocation = latLng(location);
      this._map.on('move zoom rotate pitch', this._positionPopup, this);
      this._positionPopup();
      return this;
    },
    _positionPopup() {
      const screen = this._map.latLngToContainerPoint(this._popupLocation);
      this._popupOverlay.setPosition(this._map.ol.getCoordinateFromPixelInternal([screen.x, screen.y]));
    },
    closePopup() {
      if (this._popupOverlay) {
        this._map?.off('move zoom rotate pitch', this._positionPopup, this);
        this._map?.ol.removeOverlay(this._popupOverlay);
        this._popupOverlay = null;
      }
      return this;
    },
    bindTooltip(content) {
      this._tooltipContent = content;
      this.on('mouseover', this._showTooltip, this).on('mouseout remove', this._hideTooltip, this);
      if (this instanceof L.LayerGroup) this.eachLayer(layer => layer.bindTooltip(content));
      return this;
    },
    _showTooltip(event) {
      this._hideTooltip();
      if (!this._map || !event.latlng) return;
      const element = this._tooltipElement = L.DomUtil.create('div', 'ol-city-tooltip leaflet-tooltip', this._map.getContainer());
      element.setAttribute('role', 'tooltip');
      const value = typeof this._tooltipContent === 'function' ? this._tooltipContent(this) : this._tooltipContent;
      if (value instanceof Node) element.append(value); else element.innerHTML = value;
      const pixel = this._map.latLngToContainerPoint(event.latlng);
      element.style.left = `${pixel.x + 12}px`; element.style.top = `${pixel.y + 12}px`;
    },
    _hideTooltip() { this._tooltipElement?.remove(); this._tooltipElement = null; },
  });
  L.LayerGroup.include({
    getLayers() { return Object.values(this._layers); },
    getBounds() {
      const result = new L.LatLngBounds();
      this.eachLayer(layer => result.extend(layer.getBounds?.() || layer.getLatLng()));
      return result;
    },
  });
  L.FeatureGroup = L.LayerGroup.extend({});

  L.Path.include({
    options: { pane: 'overlayPane', interactive: true, stroke: true, color: '#3388ff',
      weight: 3, opacity: 1, lineCap: 'round', lineJoin: 'round', fill: false, fillOpacity: 0.2 },
    initialize(options) { L.Util.setOptions(this, options); },
    setStyle(options) { L.Util.setOptions(this, options); return this.redraw(); },
    redraw() { return this; },
    bringToFront() { return this; },
    bringToBack() { return this; },
  });
  L.Polyline.include({
    initialize(values, options) { L.Util.setOptions(this, options); this.setLatLngs(values); },
    getLatLngs() { return this._latlngs; },
    setLatLngs(values) { this._latlngs = coordinates(values); return this.redraw(); },
    addLatLng(value) { this._latlngs.push(latLng(value)); return this.redraw(); },
    getBounds() {
      const result = new L.LatLngBounds();
      const visit = values => { for (const value of values) Array.isArray(value) ? visit(value) : result.extend(value); };
      visit(this._latlngs);
      return result;
    },
    _project() {
      this._rings = [];
      const visit = values => {
        if (!values.length) return;
        if (Array.isArray(values[0])) values.forEach(visit);
        else this._rings.push(values.map(value => this._map.latLngToLayerPoint(value)));
      };
      visit(this._latlngs);
    },
    closestLayerPoint(value) {
      this._project();
      const paths = this._rings.map(ring => ring.map(value => [value.x, value.y]));
      const closest = new ol.geom.MultiLineString(paths).getClosestPoint([value.x, value.y]);
      return point(closest);
    },
  });
  L.Polyline.mergeOptions(L.Path.prototype.options);
  L.Polygon.include({ initialize: L.Polyline.prototype.initialize });
  L.Polygon.mergeOptions(L.Path.prototype.options);
  L.Polygon.mergeOptions({ fill: true });
  L.Rectangle = L.Polygon.extend({
    initialize(value, options) { L.Util.setOptions(this, options); this.setBounds(value); },
    setBounds(value) {
      value = bounds(value);
      return this.setLatLngs([value.getSouthWest(), value.getNorthWest(), value.getNorthEast(), value.getSouthEast()]);
    },
  });
  L.CircleMarker.include({
    options: { ...L.Path.prototype.options, fill: true, radius: 10 },
    initialize(value, options) { L.Util.setOptions(this, options); this._latlng = latLng(value); },
    getLatLng() { return this._latlng; },
    setLatLng(value) { this._latlng = latLng(value); this.fire('move', { latlng: this._latlng }); return this.redraw(); },
    getRadius() { return this.options.radius; },
    setRadius(radius) { this.options.radius = radius; return this.redraw(); },
  });
  L.Circle.include({
    initialize: L.CircleMarker.prototype.initialize,
    _project() {
      this._point = this._map.latLngToLayerPoint(this._latlng);
      this._radius = this._radiusY = this.getRadius() * this._map.options.crs.scale(this._map.getZoom()) /
        (2 * Math.PI * 6378137 * Math.cos(this._latlng.lat * Math.PI / 180));
    },
    getBounds() {
      const north = this.getRadius() / 6378137 * 180 / Math.PI;
      const east = north / Math.cos(this._latlng.lat * Math.PI / 180);
      return new L.LatLngBounds([this._latlng.lat - north, this._latlng.lng - east],
        [this._latlng.lat + north, this._latlng.lng + east]);
    },
  });
  L.Circle.mergeOptions(L.CircleMarker.prototype.options);
  L.GeoJSON = L.FeatureGroup.extend({
    initialize(data, options) {
      L.LayerGroup.prototype.initialize.call(this, [], options);
      if (data) this.addData(data);
    },
    addData(data) {
      const features = new ol.format.GeoJSON().readFeatures(data);
      const convert = (geometry, feature) => {
        const values = geometry.getCoordinates();
        const locations = value => typeof value[0] === 'number' ? [value[1], value[0]] : value.map(locations);
        switch (geometry.getType()) {
          case 'Point': return this.options.pointToLayer
            ? this.options.pointToLayer(feature, latLng(locations(values))) : new L.Marker(locations(values));
          case 'MultiPoint': return new L.FeatureGroup(values.map(value => convert(new ol.geom.Point(value), feature)));
          case 'LineString': case 'MultiLineString': return new L.Polyline(locations(values), this.options);
          case 'Polygon': case 'MultiPolygon': return new L.Polygon(locations(values), this.options);
          default: throw new Error(`Unsupported GeoJSON geometry: ${geometry.getType()}`);
        }
      };
      for (const feature of features) {
        const layer = convert(feature.getGeometry(), new ol.format.GeoJSON().writeFeatureObject(feature));
        this.addLayer(layer);
      }
      return this;
    },
  });

  L.GridLayer.include({
    options: { pane: 'tilePane', tileSize: 256, opacity: 1, minZoom: 0, maxZoom: 24, updateInterval: 200 },
    initialize(options) { L.Util.setOptions(this, options); this._tiles = {}; },
    getTileSize() { return typeof this.options.tileSize === 'number'
      ? new L.Point(this.options.tileSize, this.options.tileSize) : point(this.options.tileSize); },
    getEvents() { return { moveend: this._onMoveEnd, zoomend: this._onMoveEnd, resize: this._onMoveEnd }; },
    _initContainer() { this._container = L.DomUtil.create('div', '', this.getPane()); },
    onAdd() { this._initContainer(); this._onMoveEnd(); },
    onRemove() {
      for (const tile of Object.values(this._tiles)) this.fire('tileunload', { tile: tile.el, coords: tile.coords });
      this._tiles = {}; this._container?.remove();
    },
    _getTiledPixelBounds() {
      return new L.Bounds(this._map.project(this._map.getBounds().getNorthWest(), this._tileZoom),
        this._map.project(this._map.getBounds().getSouthEast(), this._tileZoom));
    },
    _onMoveEnd() {
      if (!this._map) return;
      this._tileZoom = Math.max(this.options.minZoom, Math.min(this.options.maxZoom, Math.round(this._map.getZoom())));
      const size = this.getTileSize(), extent = this._getTiledPixelBounds(this._map.getCenter());
      const min = extent.min.unscaleBy(size).floor(), max = extent.max.unscaleBy(size).floor();
      const retained = new Set(), limit = 2 ** this._tileZoom;
      for (let x = min.x; x <= max.x; x++) for (let y = min.y; y <= max.y; y++) {
        if (y < 0 || y >= limit) continue;
        const key = `${this._tileZoom}:${x}:${y}`;
        retained.add(key);
        if (this._tiles[key]) continue;
        const coords = new L.Point(x, y); coords.z = this._tileZoom;
        const tile = this._tiles[key] = { coords, current: true, loaded: 0 };
        const done = (error, element) => {
          if (this._tiles[key] !== tile) return;
          tile.el = element;
          if (error) { this.fire('tileerror', { error, tile: element, coords }); return; }
          tile.loaded = Date.now();
          this.fire('tileload', { tile: element, coords });
          this.fire('load');
        };
        tile.el = this.createTile(coords, done);
        if (this.createTile.length < 2) done(null, tile.el);
      }
      for (const [key, tile] of Object.entries(this._tiles)) {
        if (retained.has(key)) continue;
        delete this._tiles[key];
        this.fire('tileunload', { tile: tile.el, coords: tile.coords });
      }
    },
    _tileCoordsToNwSe(coords) {
      const size = this.getTileSize(), nw = new L.Point(coords.x * size.x, coords.y * size.y);
      return [this._map.unproject(nw, coords.z), this._map.unproject(nw.add(size), coords.z)];
    },
    setOpacity(opacity) { this.options.opacity = opacity; return this; },
    setZIndex(zIndex) { this.options.zIndex = zIndex; return this; },
    redraw() { if (this._map) { this.onRemove(); this._onMoveEnd(); } return this; },
  });
  L.TileLayer = L.GridLayer.extend({
    initialize(url, options) {
      L.GridLayer.prototype.initialize.call(this, options); this.setUrl(url);
    },
    setUrl(url) { this._url = url; this._source = new ol.source.XYZ({ url, crossOrigin: 'anonymous' }); return this.redraw(); },
    createTile(coords, done) {
      const url = this._source.getTileUrlFunction()([coords.z, coords.x, coords.y], 1, ol.proj.get('EPSG:3857'));
      const tile = image(url, this.options, '');
      tile.onload = () => done(null, tile);
      tile.onerror = () => done(new Error(`Unable to load tile: ${url}`), tile);
      return tile;
    },
  });
  L.TileLayer.WMS = L.TileLayer.extend({
    setUrl(url) {
      this._url = url;
      this._source = new ol.source.TileWMS({ url, crossOrigin: 'anonymous', params: {
        LAYERS: this.options.layers, FORMAT: this.options.format || 'image/png',
        TRANSPARENT: this.options.transparent || false,
      } });
      return this.redraw();
    },
  });
  L.ImageOverlay.include({
    options: { pane: 'overlayPane', opacity: 1, interactive: false },
    initialize(url, value, options) { L.Util.setOptions(this, options); this._url = url; this._bounds = bounds(value); },
    _initImage() {
      this._image = image(this._url, this.options, '');
      this._image.onload = () => this.fire('load');
      this._image.onerror = () => this.fire('error', { error: new Error(`Unable to load image: ${this._url}`) });
    },
    getBounds() { return this._bounds; },
    setBounds(value) { this._bounds = bounds(value); return this; },
    setUrl(url) { this._url = url; if (this._image) this._image.src = url; return this; },
    setOpacity(opacity) { this.options.opacity = opacity; return this; },
    setZIndex(zIndex) { this.options.zIndex = zIndex; return this; },
  });

  L.Icon = L.Evented.extend({
    initialize(options) { L.Util.setOptions(this, options); },
    createIcon() { return this._create('icon'); },
    createShadow() { return this.options.shadowUrl ? this._create('shadow') : null; },
    _create(kind) {
      const element = image(this.options[`${kind}Url`], this.options, `leaflet-marker-${kind}`);
      const size = this.options[`${kind}Size`], anchor = this.options[`${kind}Anchor`] || this.options.iconAnchor;
      if (size) { element.style.width = `${size[0]}px`; element.style.height = `${size[1]}px`; }
      if (anchor) { element.style.marginLeft = `${-anchor[0]}px`; element.style.marginTop = `${-anchor[1]}px`; }
      return element;
    },
  });
  L.Icon.Default = L.Icon.extend({
    options: {
      iconUrl: 'https://unpkg.com/leaflet@1.9/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41], shadowAnchor: [12, 41],
    },
  });
  L.DivIcon = L.Icon.extend({
    createIcon() {
      const element = L.DomUtil.create('div', `leaflet-marker-icon ${this.options.className || ''}`);
      if (this.options.html instanceof Node) element.append(this.options.html); else element.innerHTML = this.options.html || '';
      const size = this.options.iconSize || [12, 12], anchor = this.options.iconAnchor || size.map(value => value / 2);
      element.style.cssText = `width:${size[0]}px;height:${size[1]}px;margin-left:${-anchor[0]}px;margin-top:${-anchor[1]}px`;
      return element;
    },
    createShadow() { return null; },
  });
  L.Marker.include({
    options: { pane: 'markerPane', icon: new L.Icon.Default(), opacity: 1, interactive: true, zIndexOffset: 0 },
    initialize(value, options) { L.Util.setOptions(this, options); this._latlng = latLng(value); },
    getLatLng() { return this._latlng; },
    setLatLng(value) { this._latlng = latLng(value); this.update(); return this.fire('move', { latlng: this._latlng }); },
    setIcon(icon) { this.options.icon = icon; if (this._map) { this.onRemove(); this.onAdd(); } return this; },
    getEvents() { return { zoom: this.update, viewreset: this.update }; },
    onAdd() {
      this._icon = this.options.icon.createIcon(); this._shadow = this.options.icon.createShadow();
      this._icon.tabIndex = 0; this._icon.setAttribute('role', 'button');
      this._icon.setAttribute('aria-label', this.options.title || 'Marker');
      this._icon.title = this.options.title || '';
      for (const element of [this._shadow, this._icon]) if (element) this.getPane().append(element);
      this._initInteraction(); this.update();
    },
    onRemove() { this.dragging?.disable(); this._icon?.remove(); this._shadow?.remove(); },
    update() { if (this._map && this._icon) this._setPos(this._map.latLngToLayerPoint(this._latlng)); return this; },
    _setPos(value) {
      for (const element of [this._icon, this._shadow]) if (element) L.DomUtil.setPosition(element, value);
      this._zIndex = value.y + this.options.zIndexOffset; this._updateZIndex(0);
    },
    _updateZIndex(offset) { if (this._icon) this._icon.style.zIndex = this._zIndex + offset; },
    setOpacity(opacity) { this.options.opacity = opacity; return this; },
    setZIndexOffset(value) { this.options.zIndexOffset = value; return this.update(); },
    _initInteraction() {
      this._icon._cityLayer = this;
      const drag = this.dragging = new L.Handler(this._map);
      const icon = this._icon;
      L.DomEvent.on(icon, 'pointerdown', event => {
        this._map._moved = false;
        event.stopPropagation();
      });
      L.DomEvent.on(icon, 'keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        L.DomEvent.stop(event);
        this.fire('click', { latlng: this._latlng, originalEvent: event });
      });
      drag._marker = this;
      drag._draggable = new L.Evented();
      drag._onDrag = function () {
        const marker = this._marker;
        marker._latlng = marker._map.layerPointToLatLng(L.DomUtil.getPosition(marker._icon));
        marker.fire('move', { latlng: marker._latlng }).fire('drag', { latlng: marker._latlng });
      };
      drag._adjustPan = function () {};
      drag._draggable.on('drag', drag._onDrag, drag);
      let pointer, anchor, origin, moved;
      const handle = event => {
        if (!drag.enabled()) return;
        if (event.type === 'pointerdown') {
          if (event.button !== 0) return;
          event.preventDefault(); event.stopPropagation();
          pointer = event.pointerId; anchor = [event.clientX, event.clientY];
          origin = this._map.latLngToContainerPoint(this._latlng); moved = false;
          icon.setPointerCapture(pointer);
          this.fire('dragstart');
        } else if (event.pointerId === pointer && event.type === 'pointermove') {
          const value = new L.Point(origin.x + event.clientX - anchor[0], origin.y + event.clientY - anchor[1]);
          L.DomUtil.setPosition(icon, value);
          drag._draggable._newPos = value;
          drag._draggable.fire('drag', { originalEvent: event });
          moved = true;
        } else if (event.pointerId === pointer) {
          if (icon.hasPointerCapture(pointer)) icon.releasePointerCapture(pointer);
          pointer = null; this.fire('dragend'); this._map._moved = moved;
        }
      };
      drag.addHooks = () => L.DomEvent.on(icon, 'pointerdown pointermove pointerup pointercancel', handle);
      drag.removeHooks = () => L.DomEvent.off(icon, 'pointerdown pointermove pointerup pointercancel', handle);
      if (this.options.draggable) drag.enable();
    },
  });

  L.Map.include({
    _fireDOMEvent(event, type = event.type, targets) {
      const rect = this.getContainer().getBoundingClientRect();
      const pixel = new L.Point(event.clientX - rect.left, event.clientY - rect.top);
      const location = this.containerPointToLatLng(pixel);
      const layer = event.target.closest?.('.leaflet-marker-icon')?._cityLayer;
      if (type === 'click' && this._draggableMoved(layer)) return;
      for (const target of targets || (layer ? [layer] : [this])) {
        target.fire(type, { originalEvent: event, latlng: location, containerPoint: pixel,
          layerPoint: this.containerPointToLayerPoint(pixel) });
      }
    },
  });
  L.Map.addInitHook(function () {
    for (const [name, order] of [['tilePane', 200], ['overlayPane', 400], ['markerPane', 600]]) {
      this.createPane(name).style.zIndex = order;
    }
    const handler = event => this._fireDOMEvent(event);
    L.DomEvent.on(this.getContainer(), 'click mousemove mouseout mouseover', handler);
    this.once('unload', () => L.DomEvent.off(this.getContainer(), 'click mousemove mouseout mouseover', handler));
  });
})();
