import './scene/mapCamera.js';
import { init3D } from './scene/init3D.js';
import { initNativeGPU } from './scene/initNativeGPU.js';
import { initRaster } from './pmtiles/initRaster.js';
import { setGeoJSONData } from './scene/setGeoJSONData.js';
import { initTerrain } from './terrain/initTerrain.js';
import { initSunlight } from './sunlight/initSunlight.js';
import { initTraffic } from './traffic/initTraffic.js';
import { initWalk } from './walk/initWalk.js';

/**
 * `new L.Layer({ source: { type, url, ...settings }, pane, attribution })`: layers with a `source`
 * initialize their specialized behavior on first use. Native map layers also join the WebGPU scene.
 */

/**
 * Router for `new L.Layer({ source: { type, url, ...settings }, pane, attribution })`.
 * It initializes the existing instance from the bundled source modules;
 * types receive flat options (`{ ...source, pane, attribution }`), so `layer.options.url` etc.
 *
 * Folder layout:
 * - Source routing lives here; initializers live in their respective domain folders.
 * - scene/: Leaflet lifecycle, interaction and scene updates; rendering/: WebGPU pipelines.
 * - geometry/, model/ and pmtiles/: shared mesh, glTF and archive operations.
 * - terrain/, sunlight/, traffic/ and walk/: feature-specific operations.
 *   Operations receive the layer explicitly, without subclasses or prototype replacement.
 * Dataset-specific code and data (routes, timetables, API loaders) belong to the application, e.g. misc/.
 *
 * When `type` is omitted, inline FeatureCollections use 'geojson'; otherwise *.pmtiles URLs use
 * 'pmtiles' and other sources use '3d'.
 */

const layerProto = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Layer.prototype));

// One chain for every pending layer: they become real layers in creation order.
let loading = Promise.resolve();

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
    initNativeGPU(this, event.target);
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
      init3D(this, settings);
      return;
    }
    this.onAdd = () => {};
    this.onRemove = () => {};
    // ponytail: type methods (setOpacity, add, ...) exist only once `ready` resolves.
    loading = loading.catch(() => {}).then(() => {
      switch (type) {
        case 'geojson':
          return (layer, options) => {
            layer._geojson = true;
            layer.setData = data => setGeoJSONData(layer, data);
            init3D(layer, options);
          };
        case 'pmtiles':
          return initRaster;
        case 'terrain':
          return initTerrain;
        case 'sunlight':
          return initSunlight;
        case 'traffic':
          return initTraffic;
        case 'walk':
          return initWalk;
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
    if (this instanceof L.Polyline) {
      const closest = this.closestLayerPoint;
      this.closestLayerPoint = function (point) {
        this._project();
        this._parts = this._rings;
        return closest.call(this, point);
      };
    }
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
    this._updateOpacity = function () {
      if (!this._map) return;
      const now = Date.now();
      let fading = false, prune = false;
      for (const tile of Object.values(this._tiles || {})) {
        if (!tile.current || !tile.loaded) continue;
        tile._gpuOpacity = this._map._fadeAnimated ? Math.min(1, (now - tile.loaded) / 200) : 1;
        if (tile._gpuOpacity < 1) fading = true;
        else if (!tile.active) {
          this._onOpaqueTile(tile);
          tile.active = true;
          prune = true;
        }
      }
      if (prune && !this._noPrune) this._pruneTiles();
      this._nativeGPU?.refresh?.();
      cancelAnimationFrame(this._fadeFrame);
      if (fading) this._fadeFrame = requestAnimationFrame(() => this._updateOpacity());
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