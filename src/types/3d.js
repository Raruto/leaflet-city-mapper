/**
 * The '3d' layer type, loaded on demand by src/index.js.
 *
 * A native WebGPU scene drawn above the map tiles and kept in sync with the map camera
 * (center, zoom, bearing, pitch and zoom animations).
 *
 * No rendering dependencies. Use the `ready` event before using the helpers.
 * All instances on one map share a canvas, scene and camera, with one group per layer.
 *
 * World coordinates are metres relative to `location`: x east, y up, z south.
 * The shared scene instead uses the first attached layer's origin. `root` converts
 * each layer's local metres into that shared space, including latitude scaling.
 *
 * Lifecycle: initialize CPU state -> attach shared GPU device -> load configured
 * data/model -> ready. Removal cancels source work and detaches this layer only;
 * the last removal destroys the context. Model CPU arrays/images survive for re-add.
 *
 * This file holds the Leaflet lifecycle; scene/ owns operations and receives the layer explicitly.
 * Stateless computations live in utils/.
 * PMTiles v3 reading is implemented directly by this layer. Models are static triangles, without
 * animation, skinning, morph targets, normal maps or required extensions.
 *
 * Events: ready; error {error}; progress {enabled, loaded, skipped, pending, errors};
 * featurehover/featureclick {feature, originalEvent}. A feature may be null on a miss.
 * Picking tests geometry, not texture alpha: a transparent texel can still be hit.
 *
 * @example
 * new L.Layer({ source: { url: 'tower.glb', center: [48.8582601, 2.29449985] } }).addTo(map);
 * new L.Layer({ source: { type: '3d', url: 'buildings.pmtiles', style }, attribution }).addTo(map);
 * new L.Layer({ source: { type: 'terrain', url: 'terrain.pmtiles' } }).addTo(map);
 * new L.Layer({ source: { url: 'orthophotos.pmtiles', maxZoom: 24 } }).addTo(map);
 *
 * @typedef {Object} Layer3DOptions The `source` object; `pane`/`attribution` stay standard L.Layer options.
 * @property {string} [type] 'pmtiles' (raster tiles), '3d' (WebGPU scene) or 'terrain'; see L.Layer.types.
 * @property {number[]} [center] Local origin [lat,lng]; defaults to the first map center.
 * @property {number} [terrainOffset=0] Vertical offset in metres when terrain is enabled.
 * @property {boolean} [terrainConform=false] Fit the lower model geometry to local terrain elevation.
 * @property {'OPAQUE'|'MASK'|'BLEND'} [alphaMode] Override every glTF material's alpha mode.
 * @property {number[]} [rotation] Model Euler rotation [x,y,z] in radians, YXZ order.
 * @property {number[]} [scale] Model scale [x,y,z]; independent of geographic scaling.
 * @property {string} [url] GLB/glTF model URL (loaded before ready), or PMTiles URL containing
 * Polygon/MultiPolygon or tree/light Point GeoJSON ('3d'), raster tiles ('pmtiles') or Float32 DEM ('terrain').
 * @property {function(Object): (ExtrusionStyle|null)} [style] Source styling; null skips.
 * @property {function(PickedFeature): (Node|string)} [tooltip] No HTML string evaluation.
 * @property {string} [ariaLabel='3D scene'] Shared canvas accessible name.
 * @property {boolean} [nightLight=false] Point sources: emissive bulbs and local illumination.
 * @property {boolean} [nightSparkle=false] Model: sparse luminous points at night.
 *
 * @typedef {Object} ExtrusionStyle
 * @property {number} top Roof height in metres; must exceed bottom.
 * @property {number} [bottom=0] Nonnegative base height; positive values create an underside.
 * @property {number|string|Object} [color=0xd9b38c] RGB/CSS color, or linear-space {h,s,l}.
 * @property {number} [trunkRadius] Point trees: trunk radius in metres.
 * @property {number} [crownRadius] Point trees: maximum crown radius in metres.
 * @property {number} [crownBottom] Point trees: crown base in metres, between bottom and top.
 * @property {string} [crownShape='round'] Point trees: 'round' or 'cone' schematic crown.
 * @property {number|string|Object} [trunkColor=0x72513a] Point trees: bark color.
 * @property {number} [lightRadius] Point lights: estimated ground reach in metres; top is emitter height.
 * @property {number} [lightFlux] Point lights: luminous flux in lumens.
 *
 * @typedef {Object} PickedFeature
 * @property {string|number} id Source feature id or configured model URL.
 * @property {Object} properties GeoJSON properties or model-level glTF extras.
 * @property {Object} mesh Intersected mesh.
 * @property {number[]} point Intersection [x,y,z] in shared scene metres, not layer-local metres.
 * @property {Object} [model] Configured model root; absent for source polygons.
 * @property {number} [vertexStart] First polygon vertex in the batched mesh.
 * @property {number} [vertexEnd] Exclusive end of the polygon's vertex range.
 *
 * @typedef {Object} SourceArea
 * @property {Object} coords Archive block {z,x,y}; z is header.minZoom, not display zoom.
 * @property {AbortController} request Cancellation also prevents attaching obsolete results.
 * @property {boolean} [started] Enqueued work has consumed a concurrency slot.
 * @property {boolean} [done] Geometry built successfully, including empty blocks.
 * @property {Object|null} [mesh] One batched GPU mesh per non-empty block.
 * @property {number} [buildings] Emitted feature count, not number of triangles.
 * @property {number} [skipped] Features intentionally skipped by style.
 * @property {string} [error] Failed load/build message; reported through error and progress.
 */

import * as attach from '../utils/attach.js';
import * as destroyTexture from '../utils/destroyTexture.js';
import * as loadModel from '../utils/loadModel.js';
import * as onPointerMove from '../utils/onPointerMove.js';
import * as onClick from '../utils/onClick.js';
import * as onPointerLeave from '../utils/onPointerLeave.js';
import * as getHeader from '../utils/getHeader.js';
import * as update from '../utils/update.js';
import * as onMapChange from '../utils/onMapChange.js';
import * as onZoomAnim from '../utils/onZoomAnim.js';
import * as startZoom from '../utils/startZoom.js';
import * as endZoom from '../utils/endZoom.js';
import { emptyNode } from '../utils/emptyNode.js';
import { setParent } from '../utils/setParent.js';
import * as onTerrainChange from '../utils/onTerrainChange.js';
import * as updateArea from '../utils/updateArea.js';
import * as releaseArea from '../utils/releaseArea.js';
import { renderers } from "../utils/renderers.js";

L.Layer.types['3d'] = L.Layer.extend({
  statics: {
    _renderers: renderers,
  },

  options: {
    // Accessible description of the canvas.
    ariaLabel: '3D scene',
  },

  /**
   * @param {Layer3DOptions} [options] World origin comes from center or the first map centre.
   * Public state: `location` is fixed after first addition; `root` is this layer's
   * transform; `group` aliases root only for sources; `model` is the configured
   * model wrapper. `_shared` references the rendering owner (a '3d' layer);
   * `scene`, `camera` and `renderer` alias its resources while attached.
   *
   */
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
    // Counts pending archive/build tasks, including ones cancelled after a pan.
    this._inflight = 0;
    // Gate GPU work on attachment; replaced on removal to support delayed loads.
    this._added = Promise.withResolvers();
    // Defer initialization so callers can subscribe to ready/error after construction.
    queueMicrotask(async () => {
      try {
        this.root = emptyNode();
        this.raycaster = {
          origin:    [0, 0, 0],
          direction: [0, 0, 0]
        };
        if (this.url || this._geojson) {
          this.group = this.root;
          if (this.url) this.header = await getHeader.getHeader(this);
        }
        if (this._map) {
          await attach.attach(this, this._map);
          this._added.resolve();
        }
        if (this.modelUrl) await loadModel.loadModel(this);
        if (this._shared) update.update(this);
        this.fire('ready');
      } catch (error) {
        this.fire('error', { error });
      }
    });
  },

  /** Attach interaction immediately; initialization may finish before or after onAdd. */
  onAdd(map) {
    if (!this.location) {
      const center = map.getCenter();
      this.location = new L.LatLng(center.lat, center.lng);
    }
    if (this.url || this._geojson || this.options.tooltip || this.modelUrl) {
      this.container = map.getContainer();
      this._pointerEvents ||= {
        mousemove: event => onPointerMove.onPointerMove(this, event),
        click: event => onClick.onClick(this, event),
        mouseleave: () => onPointerLeave.onPointerLeave(this),
      };
      if (this.options.tooltip) {
        this._tooltip = L.DomUtil.create('div', 'leaflet-3d-tooltip', this.container);
        this._tooltip.hidden = true;
        this._tooltip.setAttribute('role', 'tooltip');
        this._tooltip.setAttribute('aria-live', 'polite');
        this._tooltip.style.cssText = 'position:absolute;z-index:600;max-width:220px;padding:10px 12px;border:1px solid #6b5140;border-radius:6px;background:#fffaf0;box-shadow:0 3px 12px #0005;color:#30251d;font:13px/1.45 sans-serif;pointer-events:none';
      }
      L.DomEvent.on(this.container, this._pointerEvents);
    }
    if (this.root) {
      attach.attach(this, map).then(() => this._added.resolve(), error => this.fire('error', { error }));
    }
  },

  /** Reconcile source coverage when the visible ground footprint changes. */
  getEvents() {
    return this.url ? {
      moveend:       () => updateArea.updateArea(this),
      zoomend:       () => updateArea.updateArea(this),
      rotate:        () => updateArea.updateArea(this),
      pitch:         () => updateArea.updateArea(this),
      resize:        () => updateArea.updateArea(this),
      terrainchange: () => onTerrainChange.onTerrainChange(this),
    } : {};
  },

  /** Release source meshes/UI; retain manually added objects and model CPU data. */
  onRemove(map) {
    this._added = Promise.withResolvers();
    if (this.container) {
      onPointerLeave.onPointerLeave(this);
      L.DomEvent.off(this.container, this._pointerEvents);
      this.container = null;
    }
    for (const area of this._areas.values()) releaseArea.releaseArea(this, area);
    this._areas.clear();
    this._tooltip?.remove();
    this._tooltip = null;
    if (this.url || this._geojson) releaseArea.updateStatus(this, false);
    const shared = this._shared;
    if (!shared) return;
    setParent(this.root, null);
    shared._layers.delete(this);
    if (shared === this) {
      map.off('move zoom rotate pitch resize viewreset layeradd layerremove', onMapChange.onMapChange, this);
      map.off('zoomstart', startZoom.startZoom, this);
      map.off('zoomanim', onZoomAnim.onZoomAnim, this);
      map.off('zoomend', endZoom.endZoom, this);
      cancelAnimationFrame(this._frame);
      this._frame = null;
      this._queued = false;
      if (this._layers.size) {
        // Keep the original scene origin and GPU resources when ownership changes.
        const next = this._layers.values().next().value;
        for (const key of ['_layers', '_sceneOrigin', '_size', '_zoomLevel', '_zoomTransitions', '_cursor', '_roofRaster', '_roofTiles']) {
          next[key] = this[key];
          delete this[key];
        }
        for (const layer of next._layers) layer._shared = next;
        L.Layer.types['3d']._renderers.set(map, next);
        map.on('move zoom rotate pitch resize viewreset layeradd layerremove', onMapChange.onMapChange, next);
        map.on('zoomstart', startZoom.startZoom, next);
        map.on('zoomanim', onZoomAnim.onZoomAnim, next);
        map.on('zoomend', endZoom.endZoom, next);
        update.update(next);
      } else {
        if (this._roofRaster) destroyTexture.destroyTexture(this, this._roofRaster.texture.texture);
        this._roofRaster = null;
        for (const source of this._roofTiles?.values() || []) destroyTexture.destroyTexture(this, source.texture);
        this._roofTiles = null;
        for (const animation of this._zoomTransitions?.keys() || []) animation.play();
        this._zoomTransitions = null;
        this.renderer.canvas.remove();
        this.renderer.device.queue.onSubmittedWorkDone()
          .then(() => {
            this.renderer.depthTexture?.destroy();
            this.renderer.roofFallbackTexture?.texture?.destroy(),
            this.renderer.uniformBuffer?.destroy(),
            this.renderer.sunlight?.texture?.destroy(),
            this.renderer.sunlight?.buffer?.destroy(),
            this.renderer.sunlight?.lights?.destroy()
          }, error => {
            this.fire('error', { error });
            this.renderer.device.destroy();
          });
        L.Layer.types['3d']._renderers.delete(map);
        for (const key of ['_layers', '_sceneOrigin', '_size', '_zoomLevel', '_cursor']) delete this[key];
      }
    } else update.update(shared);
    this._shared = null;
    this.renderer = this.scene = this.camera = null;
  },

});

L.Layer.types['3d']._nextId = 0;
