import { bridgeElevation } from '../utils/bridgeElevation.js';
import { terrainElevation } from '../utils/terrainElevation.js';
import { triangulate } from '../utils/triangulate.js';
import './3d.js';
import './pmtiles.js';
import { removeProgram } from '../utils/removeProgram.js';
import { destroyTexture } from '../utils/destroyTexture.js';
import { disposeMesh } from '../utils/disposeMesh.js';
import { createMesh } from '../utils/createMesh.js';
import { update } from '../utils/update.js';
import { removeRasterTile } from '../utils/removeRasterTile.js';
import { elevationWGSL } from '../utils/elevationWGSL.js';
import { addRasterTile } from '../utils/addRasterTile.js';

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

  /**
   * Bare-earth DEMs drop bridges: `_getElevation` returns the deck height inside these polygons (GeoJSON
   * Polygon/MultiPolygon with Z, e.g. IGN BD TOPO), and one mesh draws the 1.2 m thick decks.
   * ponytail: anything under a deck (quays, boats asking `_getElevation`) also gets the deck height.
   */
  _addBridges(geojson) {
    const map = this._map, crs = map.options.crs, zoom = this._terrainZoom;
    const origin = crs.project(this.location), metres = Math.cos(this.location.lat * Math.PI / 180);
    const base = this.root.position[1], position = [], normal = [], color = [];
    const local = ([lng, lat, z]) => {
      const p = crs.project(new L.LatLng(lat, lng));
      return [(p.x - origin.x) * metres, z - base, -(p.y - origin.y) * metres];
    };
    const push = (p, n) => { position.push(...p); normal.push(...n); color.push(0.6, 0.58, 0.54); };
    this._bridges = new Map();
    for (const { geometry } of geojson.features) {
      const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
      for (const polygon of polygons) {
        const rings = polygon.map(ring => ring.slice(0, -1)).filter(ring => ring.length >= 3);
        if (!rings.length) continue;
        const pixels = rings.flat().map(([lng, lat, z]) => { const p = map.project([lat, lng], zoom); return [p.x, p.y, z]; });
        const points = rings.flat().map(local);
        let triangles;
        try {
          const starts = rings.map((ring, r) => rings.slice(0, r).reduce((sum, previous) => sum + previous.length, 0));
          const [contour, ...holes] = rings.map((ring, r) => ring.map((c, i) => ({ x: pixels[starts[r] + i][0], y: pixels[starts[r] + i][1] })));
          triangles = triangulate(contour, holes);
        } catch { continue; }
        const bridge = {
          triangles: triangles.map(t => t.map(i => pixels[i])),
          min: [Math.min(...pixels.map(p => p[0])), Math.min(...pixels.map(p => p[1]))],
          max: [Math.max(...pixels.map(p => p[0])), Math.max(...pixels.map(p => p[1]))],
        };
        for (let x = Math.floor(bridge.min[0] / 64); x <= Math.floor(bridge.max[0] / 64); x++) {
          for (let y = Math.floor(bridge.min[1] / 64); y <= Math.floor(bridge.max[1] / 64); y++) {
            const key = `${x}/${y}`;
            this._bridges.set(key, [...this._bridges.get(key) || [], bridge]);
          }
        }
        const below = p => [p[0], p[1] - 1.2, p[2]];
        for (let [a, b, c] of triangles) {
          // Counter-clockwise seen from above, so double-sided shading keeps the top lit.
          const [pa, pb, pc] = [points[a], points[b], points[c]];
          if ((pb[2] - pa[2]) * (pc[0] - pa[0]) - (pb[0] - pa[0]) * (pc[2] - pa[2]) < 0) [b, c] = [c, b];
          for (const i of [a, b, c]) push(points[i], [0, 1, 0]);
          for (const i of [a, c, b]) push(below(points[i]), [0, -1, 0]);
        }
        let start = 0;
        for (const ring of rings) {
          for (let i = 0; i < ring.length; i++) {
            const p = points[start + i], q = points[start + (i + 1) % ring.length];
            const length = Math.hypot(q[0] - p[0], q[2] - p[2]) || 1, n = [(q[2] - p[2]) / length, 0, -(q[0] - p[0]) / length];
            for (const corner of [p, q, below(q), p, below(q), below(p)]) push(corner, n);
          }
          start += ring.length;
        }
      }
    }
    if (position.length) this._bridgeMesh = createMesh(this, { position, normal, color });
  },

  addRasterTileaddRasterTile: addRasterTile,

  removeRasterTile: removeRasterTile,
});

L.Layer.types.terrain.elevationWGSL = elevationWGSL;