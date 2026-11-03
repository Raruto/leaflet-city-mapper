/**
 * `new L.Layer({ source: { type, url, ...settings }, pane, attribution })`: layers with a `source`
 * load their type module on first use. Subclasses are unchanged.
 */

/**
 * Router for `new L.Layer({ source: { type, url, ...settings }, pane, attribution })`.
 * It imports the type module on demand and turns the
 * layer into it; types receive flat options (`{ ...source, pane, attribution }`), so `layer.options.url` etc.
 *
 * Folder layout:
 * - types/: one module per `source.type`, imported on demand by this router:
 *   - 'pmtiles': raster PMTiles basemap rendered in the shared WebGPU canvas;
 *   - '3d': shared WebGPU scene with a GLB/glTF model, PMTiles GeoJSON features, or empty;
 *   - 'geojson': inline or URL-backed GeoJSON features rendered by the shared 3D scene;
 *   - 'terrain': Float32 PMTiles DEM that deforms raster tiles, buildings and the camera, plus optional bridge decks;
 *   - 'sunlight': simulation clock control, sun/moon lighting and shadows;
 *   - 'traffic': vehicles moving along GeoJSON lanes (measured flow or timetable);
 *   - 'walk': third-person pedestrian moved with the keyboard, the camera following behind.
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

// Shared registry: type modules (src/types) register here.
L.Layer.types = {};

let layer3DModules, loadedLayer3DModules;
function getLayer3DModules() {
  return layer3DModules ||= Promise.all([
    import('./utils/attach.js'),
    import('./utils/emptyNode.js'),
    import('./utils/getHeader.js'),
    import('./utils/loadModel.js'),
    import('./utils/onAdd3DLayer.js'),
    import('./utils/onRemove3DLayer.js'),
    import('./utils/onTerrainChange.js'),
    import('./utils/renderers.js'),
    import('./utils/update.js'),
    import('./utils/updateArea.js'),
  ]).then(([attach, emptyNode, getHeader, loadModel, onAdd, onRemove, onTerrainChange, renderers, update, updateArea]) =>
    loadedLayer3DModules = {
    attach, emptyNode: emptyNode.emptyNode, getHeader, loadModel,
    onAdd3DLayer: onAdd.onAdd3DLayer,
    onRemove3DLayer: onRemove.onRemove3DLayer,
    onTerrainChange: onTerrainChange.onTerrainChange,
    renderers: renderers.renderers,
    update, updateArea,
  });
}

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
 * @param {Layer3DOptions} [options] World origin comes from center or the first map centre.
 * Public state: `location` is fixed after first addition; `root` is this layer's
 * transform; `group` aliases root only for sources; `model` is the configured
 * model wrapper. `_shared` references the rendering owner (a '3d' layer);
 * `scene`, `camera` and `renderer` alias its resources while attached.
 */
L.Layer.initialize3DLayer = function (backend, options = {}) {
  L.Util.setOptions(backend, options);
  // ponytail: models are recognised by extension; extensionless model URLs need a .glb/.gltf suffix or query.
  const isModel = !backend._geojson && /\.(glb|gltf)(?:[?#]|$)/i.test(backend.options.url);
  backend.modelUrl = isModel ? backend.options.url : null;
  backend.url = backend.options.url && !isModel && !backend._geojson
    ? new URL(backend.options.url, document.baseURI).href : null;
  backend._directories = new Map();
  if (backend.options.center) {
    backend.location = new L.LatLng(backend.options.center[0], backend.options.center[1]);
  }
  /** @type {Map<string, SourceArea>} Keys are archive x/y, not screen tiles. */
  backend._areas = new Map();
  backend._inflight = 0;
  backend._added = Promise.withResolvers();
  queueMicrotask(async () => {
    try {
      const { attach, emptyNode, getHeader, loadModel, update } = await getLayer3DModules();
      backend.root = emptyNode();
      backend.raycaster = { origin: [0, 0, 0], direction: [0, 0, 0] };
      if (backend.url || backend._geojson) {
        backend.group = backend.root;
        if (backend.url) backend.header = await getHeader.getHeader(backend);
      }
      if (backend._map) {
        await attach.attach(backend, backend._map);
        backend._added.resolve();
      }
      if (backend.modelUrl) await loadModel.loadModel(backend);
      if (backend._shared) update.update(backend);
      backend.fire('ready');
    } catch (error) {
      backend.fire('error', { error });
    }
  });
};

L.Layer.types['3d'] = L.Layer.extend({
  statics: { _renderers: new WeakMap() },
  options: { ariaLabel: '3D scene' },
  initialize(options = {}) { return L.Layer.initialize3DLayer(this, options); },
  onAdd(map) {
    if (loadedLayer3DModules) return loadedLayer3DModules.onAdd3DLayer(this, map);
    getLayer3DModules().then(({ onAdd3DLayer }) => {
      if (this._map === map) onAdd3DLayer(this, map);
    }, error => this.fire('error', { error }));
  },
  onRemove(map) {
    if (loadedLayer3DModules) return loadedLayer3DModules.onRemove3DLayer(this, map);
    getLayer3DModules().then(({ onRemove3DLayer }) => onRemove3DLayer(this, map),
      error => this.fire('error', { error }));
  },
  getEvents() {
    if (!this.url) return {};
    const updateArea = () => {
      if (loadedLayer3DModules) return loadedLayer3DModules.updateArea.updateArea(this);
      return getLayer3DModules().then(({ updateArea }) => updateArea.updateArea(this),
        error => this.fire('error', { error }));
    };
    const terrainChange = () => {
      if (loadedLayer3DModules) return loadedLayer3DModules.onTerrainChange(this);
      return getLayer3DModules().then(({ onTerrainChange }) => onTerrainChange(this),
        error => this.fire('error', { error }));
    };
    return {
      moveend: updateArea,
      zoomend: updateArea,
      rotate: updateArea,
      pitch: updateArea,
      resize: updateArea,
      terrainchange: terrainChange,
    };
  },
});
L.Layer.types['3d']._nextId = 0;

// Core L.Layer has no initialize and init hooks get no arguments: keep the options for the hook.
L.Layer.include({
  initialize(options = {}) {
    if (Object.getPrototypeOf(this) !== L.Layer.prototype || !options.source) {
      if (layerProto.initialize) return layerProto.initialize.apply(this, arguments);
      L.Util.setOptions(this, options);
      return;
    }
    const layer = this;
    const {
      source: {
        type = /\.pmtiles(?:[?#]|$)/i.test(options.source.url) ? 'pmtiles' : '3d',
        ...source
      },
      ...core
    } = options;
    const settings = { ...source, ...core };
    // A stand-in created by the entry point before this module loaded may already be on a map.
    const map = layer._map;
    map?.removeLayer(layer);
    delete layer.onAdd;
    delete layer.onRemove;
    if (L.Layer.types[type]) {
      Object.setPrototypeOf(layer, L.Layer.types[type].prototype);
      layer.options = Object.create(L.Layer.types[type].prototype.options);
      L.Layer.types[type].prototype.initialize.call(layer, settings);
      map?.addLayer(layer);
      return;
    }
    Object.setPrototypeOf(layer, Pending.prototype);
    L.Util.setOptions(layer, core);
    map?.addLayer(layer);
    // ponytail: type methods (setOpacity, add, ...) exist only once `ready` resolves.
    loading = loading.catch(() => {}).then(() => import(new URL(`./types/${type}.js`, scriptUrl).href));
    const pending = layer.ready = loading.then(() => {
      const map = layer._map;
      map?.removeLayer(layer);
      Object.setPrototypeOf(layer, L.Layer.types[type].prototype);
      layer.options = Object.create(L.Layer.types[type].prototype.options);
      L.Layer.types[type].prototype.initialize.call(layer, settings);
      map?.addLayer(layer);
      return layer.ready === pending ? layer : layer.ready;
    });
  },
});