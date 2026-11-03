import { bridgeElevation } from '../utils/bridgeElevation.js';
import { terrainElevation } from '../utils/terrainElevation.js';
import './3d.js';
import './pmtiles.js';
import { removeProgram } from '../utils/removeProgram.js';
import { destroyTexture } from '../utils/destroyTexture.js';
import { disposeMesh } from '../utils/disposeMesh.js';
import { update } from '../utils/update.js';
import { removeRasterTile } from '../utils/removeRasterTile.js';
import { elevationWGSL } from '../utils/elevationWGSL.js';
import { addRasterTile } from '../utils/addRasterTile.js';
import { _addBridges } from './_addBridges.js';

/**
 * Renders IGN Float32 DEM tiles and PMTiles raster basemaps in the shared WebGPU scene.
 * Source options: `url` (single-zoom Float32 PMTiles DEM); `bridges` (optional GeoJSON deck polygons with Z, see _addBridges).
 */
L.Layer.types.terrain = L.Layer.types['3d'].extend({
  initialize(options = {}) {
    const terrainSource = options.url;
    const layerOptions = { ...options };
    delete layerOptions.url;
    L.Layer.types['3d'].prototype.initialize.call(this, layerOptions);
    this.terrainSource = terrainSource;
    this._terrainTiles = new Map();
    this._rasterTiles = new Map();
    this._terrainReady = false;
  },

  onAdd(map) {
    if (map._terrain3D && map._terrain3D !== this) throw new Error('Only one terrain layer can be active per map');
    map._terrain3D = this;
    L.Layer.types['3d'].prototype.onAdd.call(this, map);
    this._terrainPromise = this.root
      ? this._loadTerrain()
      : new Promise(resolve => this.once('ready', () => this._loadTerrain().then(resolve), this));
    map.eachLayer(layer => layer._setTerrain3D?.(this));
    map.fire('terrainchange');
  },

  onRemove(map) {
    this._terrainController?.abort();
    this._terrainLoading = false;
    this._terrainReady = false;
    map.eachLayer(layer => layer._setTerrain3D?.(null));
    for (const tile of this._rasterTiles.keys()) this.removeRasterTile(tile);
    if (map._terrain3D === this) delete map._terrain3D;
    for (const layer of Object.values(map._layers)) layer._setTerrainHeight?.();
    map.fire('terrainchange');
    this._terrainTiles.clear();
    this._terrainOriginElevation = 0;
    this._terrainPromise = null;
    if (this._rasterProgram) removeProgram(this._rasterProgram);
    this._rasterProgram = null;
    if (this._dem) destroyTexture(this, this._dem.texture);
    this._dem = null;
    for (const grid of this._terrainGrids?.values() || []) {
      for (const attribute of Object.values(grid)) destroyTexture(this, attribute.buffer);
    }
    this._terrainGrids = null;
    this._bridges = null;
    disposeMesh(this, this._bridgeMesh);
    this._bridgeMesh = null;
    L.Layer.types['3d'].prototype.onRemove.call(this, map);
  },

  async _loadTerrain() {
    if (this._terrainLoading || !this._map) return;
    this._terrainLoading = true;
    this._terrainReady = false;
    const controller = this._terrainController = new AbortController();
    try {
      if (!this.terrainSource) throw new Error('Terrain layer requires a PMTiles elevation archive');
      const archive = this._terrainArchive = new L.Layer({ source: { type: 'pmtiles', url: this.terrainSource } });
      await archive.ready;
      const header = archive.header;
      if (header.tileType !== 0 || header.minZoom !== header.maxZoom) {
        throw new Error('Expected a single-zoom Float32 PMTiles terrain archive');
      }
      this._terrainZoom = header.maxZoom;
      const map = this._map;
      const northwest = map.project([header.maxLat, header.minLon], this._terrainZoom).divideBy(256).floor();
      const southeast = map.project([header.minLat, header.maxLon], this._terrainZoom).divideBy(256).floor();
      this._terrainBounds = new L.Bounds(northwest, southeast);
      const tiles = [];
      for (let x = northwest.x; x <= southeast.x; x++) {
        for (let y = northwest.y; y <= southeast.y; y++) tiles.push({ z: this._terrainZoom, x, y });
      }
      let next = 0;
      await Promise.all(Array.from({ length: Math.min(4, tiles.length) }, async () => {
        while (next < tiles.length) {
          controller.signal.throwIfAborted();
          const coords = tiles[next++];
          const result = await archive.getZxy(coords.z, coords.x, coords.y, controller.signal);
          if (!result || result.data.byteLength !== 256 * 256 * 4) {
            throw new Error(`Missing or invalid Float32 terrain tile ${coords.z}/${coords.x}/${coords.y}`);
          }
          this._terrainTiles.set(`${coords.x}/${coords.y}`, new Float32Array(result.data));
        }
      }));
      const bridges = this.options.bridges && await fetch(this.options.bridges, { signal: controller.signal })
        .then(response => { if (!response.ok) throw new Error(`Bridges: HTTP ${response.status}`); return response.json(); });
      if (controller.signal.aborted || this._map !== map) return;
      this._terrainReady = true;
      this._terrainOriginElevation = this._getElevation(this.location) ?? 0;
      for (const layer of Object.values(map._layers)) layer._setTerrainHeight?.();
      if (bridges) this._addBridges(bridges);
      map.fire('terrainchange');
      update(this);
      this.fire('terrainready');
      return true;
    } catch (error) {
      if (!controller.signal.aborted) this.fire('error', { error });
      return false;
    } finally {
      this._terrainLoading = false;
    }
  },

  /** @param {L.LatLng|L.Point} location LatLng, or a pixel point at the terrain zoom. */
  _getElevation(location) {
    if (!this._map || !this._terrainReady) return null;
    const point = location instanceof L.Point ? location : this._map.project(location, this._terrainZoom);
    return bridgeElevation(point, this._bridges) ?? terrainElevation(point, this._terrainTiles);
  },

  _addBridges: _addBridges,

  addRasterTileaddRasterTile: addRasterTile,

  removeRasterTile: removeRasterTile,
});

L.Layer.types.terrain.elevationWGSL = elevationWGSL;

