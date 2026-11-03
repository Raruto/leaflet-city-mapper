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
 * - types/: one module per `source.type`, the only files imported by this router:
 *   - 'pmtiles': raster PMTiles basemap (an L.TileLayer), draped on the terrain when present;
 *   - '3d': shared WebGPU scene with a GLB/glTF model, PMTiles GeoJSON features, or empty;
 *   - 'geojson': inline or URL-backed GeoJSON features rendered by the shared 3D scene;
 *   - 'terrain': Float32 PMTiles DEM that deforms raster tiles, buildings and the camera, plus optional bridge decks;
 *   - 'sunlight': simulation clock control, sun/moon lighting and shadows;
 *   - 'traffic': vehicles moving along GeoJSON lanes (measured flow or timetable);
 *   - 'walk': third-person pedestrian moved with the keyboard, the camera following behind.
 * - scene/: named operations for GPU resources, model/archive loading, lighting, sources, picking
 *   and rendering. They receive the layer explicitly; types/3d.js declares its delegates, without mixins.
 * - utils/: computations and scene-data helpers, independent of Leaflet layers and GPU devices.
 *   Geometry, decoders, lighting grids, terrain sampling, traffic and collisions can be tested in Node;
 *   scene transforms/picking use browser DOMMatrix/DOMPoint, and CSS colors use a canvas.
 * Dataset-specific code and data (routes, timetables, API loaders) belong to the application, e.g. misc/.
 *
 * When `type` is omitted it is inferred from `source.url`: *.pmtiles -> 'pmtiles', anything else -> '3d'.
 */

const layerProto = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Layer.prototype));

// Stand-in while the type module loads: remembers the map, renders nothing.
const Pending = L.Layer.extend({
  onAdd() {},
  onRemove() {},
});

// One chain for every pending layer: they become real layers in creation order, whatever the import timing.
let loading = Promise.resolve();

// Shared registry: type modules (src/types) register here.
L.Layer.types = {};

// Core L.Layer has no initialize and init hooks get no arguments: keep the options for the hook.
L.Layer.include({
  initialize(options = {}) {
    if (Object.getPrototypeOf(this) !== L.Layer.prototype || !options.source) {
      if (layerProto.initialize) return layerProto.initialize.apply(this, arguments);
      L.Util.setOptions(this, options);
      return;
    }
    const layer = this;
    const { source: { type = /\.pmtiles(?:[?#]|$)/i.test(options.source.url) ? 'pmtiles' : '3d', ...source }, ...core } = options;
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
    loading = loading.catch(() => {}).then(() => import(`./types/${type}.js`));
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