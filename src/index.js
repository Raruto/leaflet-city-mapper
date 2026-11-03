/**
 * `new L.Layer({ source: { type, url, ...settings }, pane, attribution })`: layers with a `source`
 * load their specialized type module on first use. Subclasses are unchanged.
 */

/**
 * Router for `new L.Layer({ source: { type, url, ...settings }, pane, attribution })`.
 * It imports the type module on demand and turns the
 * layer into it; types receive flat options (`{ ...source, pane, attribution }`), so `layer.options.url` etc.
 *
 * Folder layout:
 * - types/: specialized modules for non-base `source.type`s, imported on demand:
 *   - 'pmtiles': raster PMTiles basemap rendered in the shared WebGPU canvas;
 *   - 'geojson': inline or URL-backed GeoJSON features rendered by the shared 3D scene;
 *   - 'terrain': Float32 PMTiles DEM that deforms raster tiles, buildings and the camera, plus optional bridge decks;
 *   - 'sunlight': simulation clock control, sun/moon lighting and shadows;
 *   - 'traffic': vehicles moving along GeoJSON lanes (measured flow or timetable);
 *   - 'walk': third-person pedestrian moved with the keyboard, the camera following behind.
 * - The base '3d' type and its Leaflet lifecycle are defined below.
 * - scene/: named operations for GPU resources, model/archive loading, lighting, sources, picking
 *   and rendering. They receive the layer explicitly; the 3D Leaflet lifecycle is defined here.
 * - utils/: computations and scene-data helpers, independent of Leaflet layers and GPU devices.
 *   Geometry, decoders, lighting grids, terrain sampling, traffic and collisions can be tested in Node;
 *   scene transforms/picking use browser DOMMatrix/DOMPoint, and CSS colors use a canvas.
 * Dataset-specific code and data (routes, timetables, API loaders) belong to the application, e.g. misc/.
 *
 * When `type` is omitted it is inferred from `source.url`: *.pmtiles -> 'pmtiles', anything else -> '3d'.
 */

const layerProto = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Layer.prototype));
const scriptUrl = ((document.currentScript && document.currentScript.src) ||
  (import.meta && import.meta.url) || document.baseURI).split('/').slice(0, -1).join('/') + '/';

// Stand-in while the type module loads: remembers the map, renders nothing.
const Pending = L.Layer.extend({
  onAdd() {},
  onRemove() {},
});

// One chain for every pending layer: they become real layers in creation order, whatever the import timing.
let loading = Promise.resolve();

// The base type is registered below; specialized modules extend this registry.
L.Layer.types = {};

/**
 * The '3d' layer type: native WebGPU scene synchronized with the map camera.
 * Layers on one map share a canvas, scene and camera; each has its own root transform.
 *
 * @typedef {Object} Layer3DOptions Layer options; pane and attribution remain standard L.Layer options.
 * @property {string} [type] 'pmtiles', '3d' or 'terrain'; see L.Layer.types.
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

/**
 * @param {Layer3DOptions} [options] pane and attribution remain standard L.Layer options.
 */
L.Layer.types['3d'] = L.Layer.extend({
  statics: { _renderers: new WeakMap() },
  options: { ariaLabel: '3D scene' },
  initialize(options = {}) {
    L.Util.setOptions(this, options);
    // ponytail: models are recognised by extension; extensionless model URLs need a .glb/.gltf suffix or query.
    const isModel = !this._geojson && /\.(glb|gltf)(?:[?#]|$)/i.test(this.options.url);
    this.modelUrl = isModel ? this.options.url : null;
    this.url = this.options.url && !isModel && !this._geojson ? new URL(this.options.url, document.baseURI).href : null;
    this._directories = new Map();
    if (this.options.center) {
      this.location = new L.LatLng(this.options.center[0], this.options.center[1]);
    }
    /** @type {Map<string, SourceArea>} Keys are archive x/y, not screen tiles. */
    this._areas = new Map();
    this._inflight = 0;
    this._added = Promise.withResolvers();
    queueMicrotask(async () => {
      try {
        this.root = (await import('./utils/emptyNode.js')).emptyNode();
        this.raycaster = { origin: [0, 0, 0], direction: [0, 0, 0] };
        if (this.url || this._geojson) {
          this.group = this.root;
          if (this.url) this.header = await (await import('./utils/getHeader.js')).getHeader(this);
        }
        if (this._map) {
          await (await import('./utils/attach.js')).attach(this, this._map);
          this._added.resolve();
        }
        if (this.modelUrl) await (await import('./utils/loadModel.js')).loadModel(this);
        if (this._shared) await (await import('./utils/update.js')).update(this);
        this.fire('ready');
      } catch (error) {
        this.fire('error', { error });
      }
    });
  },
  onAdd(map) {
    if (this._map !== map) {
      return;
    }
    import('./utils/onAdd3DLayer.js').then(({ onAdd3DLayer }) => { onAdd3DLayer(this, map); });
  },
  onRemove(map) {
    import('./utils/onRemove3DLayer.js').then(({ onRemove3DLayer }) => onRemove3DLayer(this, map));
  },
});
L.Layer.types['3d']._nextId = 0;

// Core L.Layer has no initialize and init hooks get no arguments: keep the options for the hook.
L.Layer.include({
  getEvents() {
    if (!this._areas) return {};
    const events = {};
    if (this.url) {
      const updateArea = () => import('./utils/updateArea.js').then(({ updateArea }) => updateArea(this));
      Object.assign(events, {
        moveend: updateArea,
        zoomend: updateArea,
        rotate: updateArea,
        pitch: updateArea,
        resize: updateArea,
      });
    }
    if (this._geojson || this.url) {
      events.terrainchange = () => import('./utils/onTerrainChange.js').then(({ onTerrainChange }) => onTerrainChange(this));
    }
    return events;
  },
  initialize(options = {}) {
    if (Object.getPrototypeOf(this) !== L.Layer.prototype || !options.source) {
      if (layerProto.initialize) return layerProto.initialize.apply(this, arguments);
      L.Util.setOptions(this, options);
      return;
    }
    const {
      source: {
        type = /\.pmtiles(?:[?#]|$)/i.test(options.source.url) ? 'pmtiles' : '3d',
        ...source
      },
      ...core
    } = options;
    const settings = { ...source, ...core };
    // A stand-in created by the entry point before this module loaded may already be on a map.
    const map = this._map;
    map?.removeLayer(this);
    delete this.onAdd;
    delete this.onRemove;
    if (L.Layer.types[type]) {
      Object.setPrototypeOf(this, L.Layer.types[type].prototype);
      this.options = Object.create(L.Layer.types[type].prototype.options);
      L.Layer.types[type].prototype.initialize.call(this, settings);
      map?.addLayer(this);
      return;
    }
    Object.setPrototypeOf(this, Pending.prototype);
    L.Util.setOptions(this, core);
    map?.addLayer(this);
    // ponytail: type methods (setOpacity, add, ...) exist only once `ready` resolves.
    loading = loading.catch(() => {}).then(() => import(new URL(`./types/${type}.js`, scriptUrl).href));
    const pending = this.ready = loading.then(() => {
      const map = this._map;
      map?.removeLayer(this);
      Object.setPrototypeOf(this, L.Layer.types[type].prototype);
      this.options = Object.create(L.Layer.types[type].prototype.options);
      L.Layer.types[type].prototype.initialize.call(this, settings);
      map?.addLayer(this);
      return this.ready === pending ? this : this.ready;
    });
  },
});