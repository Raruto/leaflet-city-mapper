import { L } from './globals/L.js';
import { layerProto } from './globals/layerProto.js';
import { layerCallInitHooks as sharedLayerCallInitHooks } from './globals/layerCallInitHooks.js';
import { removeLayer as sharedRemoveLayer } from './globals/removeLayer.js';

import './camera/mapCamera.js';
import { init3D } from './scene/init3D.js';
import { initNativeGPU } from './native/initNativeGPU.js';
import { initRaster } from './raster/initRaster.js';
import { setGeoJSONData } from './sources/setGeoJSONData.js';
import { initTerrain } from './terrain/initTerrain.js';
import './sunlight/initSunlight.js';
import { initTraffic } from './traffic/initTraffic.js';
import './walk/initWalk.js';

import { initializeNativeLayer } from './core/initializeNativeLayer.js';
import { layerLayerAdd } from './scene/addRegisteredLayer.js';
import { layerInitialize } from './scene/layerInitialize.js';
import { removeLayer } from './core/removeLayer.js';
import { getPitch } from './camera/getPitch.js';
import { getBearing } from './camera/getBearing.js';
import { setRotation } from './core/setRotation.js';
import { layerCallInitHooks } from './core/layerCallInitHooks.js';

/**
 * `new L.Layer({ source: { type, url, ...settings }, pane, attribution })`: layers with a `source`
 * initialize their specialized behavior on first use. Native map layers also join the WebGPU scene.
 */

/**
 * Router for `new L.Layer({ source: { type, url, ...settings }, pane, attribution })`.
 * It initializes a native instance from the bundled source modules;
 * types receive flat options (`{ ...source, pane, attribution }`); plugin state remains external.
 *
 * Source folders are flat and grouped by responsibility; see README's source layout.
 * Initializers and orchestration stay in their domain folders; shared geometry,
 * projections, transforms, textures and animations have dedicated folders.
 * Shared values live in globals/, private WeakMaps in weakmaps/.
 * Operations receive the layer explicitly, without subclasses or prototype replacement.
 * Dataset-specific code and data (routes, timetables, API loaders) belong to the application, e.g. misc/.
 *
 * When `type` is omitted, inline FeatureCollections use 'geojson'; *.pmtiles URLs use
 * 'pmtiles', *.tif/*.tiff URLs use 'cog', and other sources use '3d'.
 */

layerProto.value = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Layer.prototype));
sharedLayerCallInitHooks.value = L.Layer.prototype.callInitHooks;

/**
 * The '3d' layer type: native WebGPU scene synchronized with the map camera.
 * Layers on one map share a canvas, scene and camera; each has its own root transform.
 *
 * @typedef {Object} Layer3DOptions Layer options; pane and attribution remain standard L.Layer options.
 * @property {string} [type] '3d', 'geojson', 'pmtiles', 'cog', 'terrain' or 'traffic'.
 * @property {number[]} [center] Local origin [lat,lng]; defaults to the first map center.
 * @property {number} [terrainOffset=0] Vertical offset in metres when terrain is enabled.
 * @property {boolean} [terrainConform=false] Fit lower model geometry to local terrain elevation.
 * @property {'OPAQUE'|'MASK'|'BLEND'} [alphaMode] Override every glTF material's alpha mode.
 * @property {number[]} [rotation] Model Euler rotation [x,y,z] in radians, YXZ order.
 * @property {number[]} [scale] Model scale [x,y,z].
 * @property {string} [url] GLB/glTF model URL, PMTiles archive URL or supported COG URL.
 * @property {boolean} [doubleSided=false] Show raster/terrain surfaces from below.
 * @property {{x:number,y:number,radius:number,outside?:boolean}} [cutout] Raster screen-space circle in CSS pixels; outside keeps only the circle.
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
 * @param {L.Layer} layer
 * @param {Layer3DOptions} [options] World origin comes from center or the first map centre.
 */

L.Layer.include({
  initialize: layerInitialize,
  _layerAdd: layerLayerAdd,
  callInitHooks: layerCallInitHooks,
});

sharedRemoveLayer.value = L.Map.prototype.removeLayer;
L.Map.include({ removeLayer, getPitch, getBearing });
L.Marker.include({ setRotation });