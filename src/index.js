/**
 * `new L.Layer({ source: { type, url, ...settings }, pane, attribution })`: layers with a `source`
 * load their specialized utilities on first use. Native map layers also join the WebGPU scene.
 */

/**
 * Router for `new L.Layer({ source: { type, url, ...settings }, pane, attribution })`.
 * It imports source utilities on demand and initializes the existing instance;
 * types receive flat options (`{ ...source, pane, attribution }`), so `layer.options.url` etc.
 *
 * Folder layout:
 * - Vector ('3d', 'geojson') and raster ('pmtiles') initialization lives here.
 * - utils/: lazy operations for rendering, archives, geometry and specialized layers:
 *   terrain (Float32 DEM), sunlight (clock and lighting), traffic and walking.
 *   Operations receive the layer explicitly, without subclasses or prototype replacement.
 * Dataset-specific code and data (routes, timetables, API loaders) belong to the application, e.g. misc/.
 *
 * When `type` is omitted, inline FeatureCollections use 'geojson'; otherwise *.pmtiles URLs use
 * 'pmtiles' and other sources use '3d'.
 */

const layerProto = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Layer.prototype));

// One chain for every pending layer: they become real layers in creation order, whatever the import timing.
let loading = Promise.resolve();
let sceneModules, sceneLoading, rasterModules;
let nativeLoading;

/**
 * The '3d' layer type: native WebGPU scene synchronized with the map camera.
 * Layers on one map share a canvas, scene and camera; each has its own root transform.
 *
 * @typedef {Object} Layer3DOptions Layer options; pane and attribution remain standard L.Layer options.
 * @property {string} [type] '3d', 'geojson', 'pmtiles', 'terrain', 'sunlight', 'traffic' or 'walk'.
 * @property {number[]} [center] Local origin [lat,lng]; defaults to the first map center.
 * @property {number} [terrainOffset=0] Vertical offset in metres when terrain is enabled.
 * @property {boolean} [terrainConform=false] Fit lower model geometry to local terrain elevation.
 * @property {'OPAQUE'|'MASK'|'BLEND'} [alphaMode] Override every glTF material's alpha mode.
 * @property {number[]} [rotation] Model Euler rotation [x,y,z] in radians, YXZ order.
 * @property {number[]} [scale] Model scale [x,y,z].
 * @property {string} [url] GLB/glTF model URL or PMTiles archive URL.
 * @property {function(Object): (ExtrusionStyle|null)} [style] Source styling; null skips a feature.
 * @property {function(PickedFeature): (Node|string)} [tooltip] Tooltip content; strings are text.
 * @property {string} [ariaLabel='3D scene'] Shared canvas accessible name.
 * @property {boolean} [nightLight=false] Point sources: emissive bulbs and local illumination.
 * @property {boolean} [nightSparkle=false] Model: sparse luminous points at night.
 *
 * @typedef {Object} ExtrusionStyle
 * @property {number} top Roof height in metres; must exceed bottom.
 * @property {number} [bottom=0] Nonnegative base height.
 * @property {number|string|Object} [color=0xd9b38c] RGB/CSS color or linear-space {h,s,l}.
 * @property {number} [trunkRadius] Point tree trunk radius in metres.
 * @property {number} [crownRadius] Point tree crown radius in metres.
 * @property {number} [crownBottom] Point tree crown base in metres.
 * @property {string} [crownShape='round'] Point tree crown shape.
 * @property {number|string|Object} [trunkColor=0x72513a] Point tree bark color.
 * @property {number} [lightRadius] Point light estimated ground reach in metres.
 * @property {number} [lightFlux] Point light luminous flux in lumens.
 *
 * @typedef {Object} PickedFeature
 * @property {string|number} id Source feature id or configured model URL.
 * @property {Object} properties GeoJSON properties or model-level glTF extras.
 * @property {Object} mesh Intersected mesh.
 * @property {number[]} point Intersection [x,y,z] in shared scene metres.
 * @property {Object} [model] Configured model root; absent for source polygons.
 * @property {number} [vertexStart] First polygon vertex in the batched mesh.
 * @property {number} [vertexEnd] Exclusive end of the polygon's vertex range.
 *
 * @typedef {Object} SourceArea
 * @property {Object} coords Archive block {z,x,y}.
 * @property {AbortController} request Cancellation prevents attaching obsolete results.
 * @property {boolean} [done] Geometry built successfully, including empty blocks.
 * @property {Object|null} [mesh] Batched GPU mesh.
 * @property {number} [buildings] Emitted feature count.
 * @property {number} [skipped] Features skipped by style.
 * @property {string} [error] Failed load/build message.
 *
 * @param {L.Layer} backend
 * @param {Layer3DOptions} [options] World origin comes from center or the first map centre.
 */

L.Layer._renderers = new WeakMap();
L.Layer._nextId = 0;

L.Layer.include({
  _layerAdd(event) {
    const native = !this._3d && (
      this instanceof L.GridLayer ||
      this instanceof L.Polyline ||
      this instanceof L.CircleMarker ||
      this instanceof L.Marker && !(this.options.icon instanceof L.DivIcon) ||
      this instanceof L.ImageOverlay && !(this instanceof L.VideoOverlay) && !(this instanceof L.SVGOverlay)
    );
    if (native) {
      if (this instanceof L.GridLayer || this instanceof L.ImageOverlay) {
        this.options.crossOrigin ||= true;
      }
      if (this instanceof L.Marker) this.options.icon.options.crossOrigin ||= true;
    }
    layerProto._layerAdd.call(this, event);
    if (!native || !event.target.hasLayer(this)) return;
    if (!document.getElementById('leaflet-webgpu-targets')) {
      const style = document.createElement('style');
      style.id = 'leaflet-webgpu-targets';
      style.textContent = '.leaflet-webgpu-target{opacity:0!important}';
      document.head.append(style);
    }
    const state = this._nativeGPU = { source: this, map: event.target, hidden: new Set() };
    state.hide = () => {
      const htmlIcon = this instanceof L.Marker && this.options.icon instanceof L.DivIcon;
      for (const element of [htmlIcon ? null : this._icon, htmlIcon ? null : this._shadow]) {
        if (!element || state.hidden.has(element)) continue;
        element.classList.add('leaflet-webgpu-target');
        state.hidden.add(element);
      }
    };
    state.hide();
    this.once('remove', () => {
      if (this._nativeGPU === state) this._nativeGPU = null;
      state.dispose?.();
      for (const element of state.hidden) {
        element.classList.remove('leaflet-webgpu-target');
      }
    });

    nativeLoading ||= import('./utils/nativeLayer.js');
    this.ready = nativeLoading.then(({ nativeLayer }) => {
      if (this._nativeGPU !== state) return this;
      return nativeLayer(state);
    });
    this.ready.catch(error => this.fire('error', { error }));
  },
  _init3D(options = {}) {
    const layer = this;
    const ready = sceneLoading ||= Promise.all([
      import('./utils/onAdd3DLayer.js'),
      import('./utils/onRemove3DLayer.js'),
      import('./utils/updateArea.js'),
      import('./utils/onTerrainChange.js'),
    ]).then(([add, remove, update, terrain]) => sceneModules = { ...add, ...remove, ...update, ...terrain });
    layer._3d = true;
    L.Util.setOptions(layer, { ariaLabel: '3D scene', ...options });
    layer.onAdd = map => {
      if (sceneModules) return sceneModules.onAdd3DLayer(layer, map);
      ready.then(({ onAdd3DLayer }) => {
        if (layer._map === map) onAdd3DLayer(layer, map);
      }).catch(error => layer.fire('error', { error }));
    };
    layer.onRemove = map => {
      if (sceneModules) return sceneModules.onRemove3DLayer(layer, map);
      ready.then(({ onRemove3DLayer }) => onRemove3DLayer(layer, map))
        .catch(error => layer.fire('error', { error }));
    };
    layer.getEvents = () => {
      const events = {};
      if (layer.url) {
        events.moveend = events.zoomend = events.rotate = events.pitch = events.resize = () =>
          sceneModules ? sceneModules.updateArea(layer) : ready.then(({ updateArea }) => updateArea(layer));
      }
      if (layer._geojson || layer.url) {
        events.terrainchange = () => sceneModules
          ? sceneModules.onTerrainChange(layer)
          : ready.then(({ onTerrainChange }) => onTerrainChange(layer));
      }
      return events;
    };
    // ponytail: models are recognised by extension; extensionless model URLs need a .glb/.gltf suffix or query.
    const isModel = !layer._geojson && /\.(glb|gltf)(?:[?#]|$)/i.test(layer.options.url);
    layer.modelUrl = isModel ? layer.options.url : null;
    layer.url = layer.options.url && !isModel && !layer._geojson ? new URL(layer.options.url, document.baseURI).href : null;
    layer._directories = new Map();
    if (layer.options.center) {
      layer.location = new L.LatLng(layer.options.center[0], layer.options.center[1]);
    }
    /** @type {Map<string, SourceArea>} Keys are archive x/y, not screen tiles. */
    layer._areas = new Map();
    layer._inflight = 0;
    layer._added = Promise.withResolvers();
    queueMicrotask(async () => {
      try {
        await ready;
        layer.root = (await import('./utils/emptyNode.js')).emptyNode();
        layer.raycaster = { origin: [0, 0, 0], direction: [0, 0, 0] };
        if (layer.url || layer._geojson) {
          layer.group = layer.root;
          if (layer.url) layer.header = await (await import('./utils/getHeader.js')).getHeader(layer);
        }
        if (layer._map) {
          await (await import('./utils/attach.js')).attach(layer, layer._map);
          layer._added.resolve();
        }
        if (layer.modelUrl) await (await import('./utils/loadModel.js')).loadModel(layer);
        if (layer._shared) (await import('./utils/update.js')).update(layer);
        layer.fire('ready');
      } catch (error) {
        layer.fire('error', { error });
      }
    });
  },
  _initRaster(options) {
    const layer = this;
    const [{ read }, { getHeader }, { getZxy }, { onPMTileAdd }, { onPMTileRemove },
      { getRasterTileSize, updateRasterTiles }, { setPMTileOpacity }, { setPMTileZIndex }, { emptyNode }] = rasterModules;
    layer._read = (offset, length, signal) => read(layer, offset, length, signal);
    layer.getHeader = () => getHeader(layer);
    layer.getZxy = (z, x, y, signal) => getZxy(layer, z, x, y, signal);
    layer.getTileSize = () => getRasterTileSize();
    layer.isLoading = () => layer._loadingTiles > 0;
    layer.setOpacity = opacity => setPMTileOpacity(layer, opacity);
    layer.setZIndex = zIndex => setPMTileZIndex(layer, zIndex);
    layer.onAdd = map => onPMTileAdd(layer, map);
    layer.onRemove = map => onPMTileRemove(layer, map);
    const update = () => updateRasterTiles(layer);
    layer.getEvents = () => ({
      moveend: update,
      zoomend: update,
      rotate: update,
      pitch: update,
      resize: update,
    });
    options = { ariaLabel: 'PMTiles raster', maxZoom: 18, opacity: 1, zIndex: 0, ...options };
    L.Util.setOptions(layer, options);
    layer.root = emptyNode();
    layer._areas = new Map();
    layer._rasterTiles = new Map();
    layer._loadingTiles = 0;
    layer._added = Promise.withResolvers();
    layer.url = new URL(options.url, document.baseURI).href;
    layer._directories = new Map();
    layer.ready = Promise.resolve(layer.options.archive || layer).then(async archive => {
      const header = await archive.getHeader();
      layer.options.archive = archive;
      layer.header = header;
      if (layer.options.maxNativeZoom === undefined) {
        layer.options.maxNativeZoom = header.maxZoom;
      }
      layer.options.maxZoom = Math.max(layer.options.minZoom || 0, layer.options.maxZoom);
      layer.fire('ready');
      return layer;
    }).catch(error => {
      layer.fire('error', { error });
      throw error;
    });
  },
  initialize(options = {}) {
    if (Object.getPrototypeOf(this) !== L.Layer.prototype || !options.source) {
      if (layerProto.initialize) return layerProto.initialize.apply(this, arguments);
      L.Util.setOptions(this, options);
      return;
    }
    const {
      source: {
        type = options.source.data?.type === 'FeatureCollection'
          ? 'geojson'
          : /\.pmtiles(?:[?#]|$)/i.test(options.source.url) ? 'pmtiles' : '3d',
        ...source
      },
      ...core
    } = options;
    const settings = { ...source, ...core };
    L.Util.setOptions(this, core);
    this._type = type;
    if (type === '3d') {
      this._init3D(settings);
      return;
    }
    if (type === 'pmtiles' && rasterModules) {
      this._initRaster(settings);
      return;
    }
    this.onAdd = () => {};
    this.onRemove = () => {};
    // ponytail: type methods (setOpacity, add, ...) exist only once `ready` resolves.
    loading = loading.catch(() => {}).then(async () => {
      switch (type) {
        case 'geojson': {
          const { setGeoJSONData } = await import('./utils/setGeoJSONData.js');
          return (layer, options) => {
            layer._geojson = true;
            layer.setData = data => setGeoJSONData(layer, data);
            layer._init3D(options);
          };
        }
        case 'pmtiles': {
          rasterModules = await Promise.all([
            import('./utils/read.js'),
            import('./utils/getHeader.js'),
            import('./utils/getZxy.js'),
            import('./utils/onPMTileAdd.js'),
            import('./utils/onPMTileRemove.js'),
            import('./utils/rasterTiles.js'),
            import('./utils/setPMTileOpacity.js'),
            import('./utils/setPMTileZIndex.js'),
            import('./utils/emptyNode.js'),
          ]);
          return (layer, options) => layer._initRaster(options);
        }
        case 'terrain':
          return (await import('./utils/initTerrain.js')).initTerrain;
        case 'sunlight':
          return (await import('./utils/initSunlight.js')).initSunlight;
        case 'traffic':
          return (await import('./utils/initTraffic.js')).initTraffic;
        case 'walk':
          return (await import('./utils/initWalk.js')).initWalk;
        default:
          throw new Error(`Unknown layer type: ${type}`);
      }
    });
    const ready = this.ready = loading.then(initialize => {
      const map = this._map;
      map?.removeLayer(this);
      delete this.onAdd;
      delete this.onRemove;
      initialize(this, settings);
      map?.addLayer(this);
      return this.ready === ready ? this : this.ready;
    });
    ready.catch(error => this.fire('error', { error }));
  },
});

L.Layer.addInitHook(function () {
  if (this instanceof L.Polyline || this instanceof L.CircleMarker) {
    const refresh = () => this._nativeGPU?.refresh?.();
    this.beforeAdd = this.onAdd = this.onRemove = this._updateBounds = () => {};
    this.getEvents = () => ({});
    // Leaflet mutators call this renderer contract, but no SVG/Canvas renderer is created.
    this._renderer = {
      options: { tolerance: 0 },
      _updatePath: refresh,
      _updateStyle: refresh,
      _bringToFront: () => this._nativeGPU?.reorder?.(true),
      _bringToBack: () => this._nativeGPU?.reorder?.(false),
    };
    if (this instanceof L.Circle) {
      const getBounds = this.getBounds;
      this.getBounds = function () {
        this._project();
        return getBounds.call(this);
      };
    }
  } else if (this instanceof L.GridLayer) {
    const initialize = this._initContainer;
    this._initContainer = function () {
      initialize.call(this);
      this._container.remove();
    };
  } else if (this instanceof L.ImageOverlay && !(this instanceof L.VideoOverlay) && !(this instanceof L.SVGOverlay)) {
    this.onAdd = function () {
      if (!this._image) this._initImage();
      if (this._image.complete && this._image.naturalWidth) queueMicrotask(() => this.fire('load'));
    };
    this.onRemove = () => {};
    this.getEvents = () => ({});
    this._reset = () => this._nativeGPU?.refresh?.();
  }
});