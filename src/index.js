import './camera/mapCamera.js';
import { init3D } from './scene/init3D.js';
import { initNativeGPU } from './core/initNativeGPU.js';
import { initRaster } from './raster/initRaster.js';
import { setGeoJSONData } from './sources/setGeoJSONData.js';
import { initTerrain } from './terrain/initTerrain.js';
import './sunlight/initSunlight.js';
import { initTraffic } from './traffic/initTraffic.js';
import './walk/initWalk.js';
import { indexState } from './constants/indexState.js';
import { initializeNativeLayer } from './core/initializeNativeLayer.js';
import { layerLayerAdd } from './scene/layerLayerAdd.js';
import { layerInitialize } from './scene/layerInitialize.js';

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
 * - scene/: source routing, lifecycle and graph; initializers live in their domain folders.
 * - core/: Leaflet layer integration; camera/ and controls/: camera and interaction.
 * - sources/ and picking/: source geometry and feature interaction.
 * - rendering/, shaders/, shadows/ and lighting/: WebGPU drawing and illumination.
 * - geometry/, triangulation/ and collision/: mesh operations and spatial queries.
 * - models/, archives/ and raster/: glTF loading, archive access and raster tiles.
 * - constants/ and state/: exported module-level const and let bindings.
 * - terrain/, sunlight/, traffic/ and walk/: feature-specific operations.
 *   Operations receive the layer explicitly, without subclasses or prototype replacement.
 * Dataset-specific code and data (routes, timetables, API loaders) belong to the application, e.g. misc/.
 *
 * When `type` is omitted, inline FeatureCollections use 'geojson'; otherwise *.pmtiles URLs use
 * 'pmtiles' and other sources use '3d'.
 */

indexState.layerProto = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Layer.prototype));

// One chain for every pending layer: they become real layers in creation order.
indexState.loading = Promise.resolve();

indexState.pendingInitializations = [];

indexState.closestMethods = new WeakMap();
indexState.boundsMethods = new WeakMap();
indexState.gridInitializers = new WeakMap();

indexState.pendingGridFades = new Map();
indexState.gridFadeFrame = null;

indexState.pendingRasterLoads = [];

/**
 * The '3d' layer type: native WebGPU scene synchronized with the map camera.
 * Layers on one map share a canvas, scene and camera; each has its own root transform.
 *
 * @typedef {Object} Layer3DOptions Layer options; pane and attribution remain standard L.Layer options.
 * @property {string} [type] '3d', 'geojson', 'pmtiles', 'terrain' or 'traffic'.
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
  _layerAdd: layerLayerAdd,
  initialize: layerInitialize,
});

L.Layer.addInitHook(initializeNativeLayer);