/**
 * `new L.Layer({ source: { type, url, ...settings }, pane, attribution })`: layers with a `source`
 * load their specialized type module on first use. Subclasses are unchanged.
 */

/**
 * Router for `new L.Layer({ source: { type, url, ...settings }, pane, attribution })`.
 * It imports the type module on demand and initializes the existing instance;
 * types receive flat options (`{ ...source, pane, attribution }`), so `layer.options.url` etc.
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
 * When `type` is omitted, inline FeatureCollections use 'geojson'; otherwise *.pmtiles URLs use
 * 'pmtiles' and other sources use '3d'.
 */

const layerProto = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Layer.prototype));
const scriptUrl = ((document.currentScript && document.currentScript.src) ||
  (import.meta && import.meta.url) || document.baseURI).split('/').slice(0, -1).join('/') + '/';

// One chain for every pending layer: they become real layers in creation order, whatever the import timing.
let loading = Promise.resolve();
let sceneModules, sceneLoading;

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

L.Layer.types = {};
L.Layer.types['3d'] = function (layer, options = {}) {
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
};
L.Layer.types['3d']._renderers = new WeakMap();
L.Layer.types['3d']._nextId = 0;

L.Layer.include({
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
    // A stand-in created by the entry point before this module loaded may already be on a map.
    const map = this._map;
    map?.removeLayer(this);
    L.Util.setOptions(this, core);
    if (L.Layer.types[type]) {
      this._type = type;
      L.Layer.types[type](this, settings);
      map?.addLayer(this);
      return;
    }
    this.onAdd = () => {};
    this.onRemove = () => {};
    map?.addLayer(this);
    // ponytail: type methods (setOpacity, add, ...) exist only once `ready` resolves.
    loading = loading.catch(() => {}).then(() => import(new URL(`./types/${type}.js`, scriptUrl).href));
    const pending = this.ready = loading.then(() => {
      const map = this._map;
      map?.removeLayer(this);
      delete this.onAdd;
      delete this.onRemove;
      if (typeof L.Layer.types[type] !== 'function') throw new Error(`Unknown layer type: ${type}`);
      this._type = type;
      L.Layer.types[type](this, settings);
      map?.addLayer(this);
      return this.ready === pending ? this : this.ready;
    });
    pending.catch(error => this.fire('error', { error }));
  },
});