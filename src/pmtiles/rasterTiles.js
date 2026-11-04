import { cityMapper } from '../state.js';
import { addRasterTile } from './addRasterTile.js';
import { createProgram } from '../rendering/createProgram.js';
import { destroyTexture } from '../rendering/destroyTexture.js';
import { removeRasterTile } from './removeRasterTile.js';
import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';

const TILE_SIZE = 256;
// ponytail: cap horizon views at 169 tiles; raise the radius if extreme pitches need more.
const TILE_RADIUS = 6;

export function updateRasterTiles(backend) {
  const map = backend._map;
  if (!map || !backend._shared || !backend.header) return;

  const zoom = Math.max(backend.header.minZoom ?? 0, Math.min(
    Math.round(map.getZoom()),
    backend.options.maxZoom,
    backend.options.maxNativeZoom
  ));
  backend._tileZoom = zoom;
  const bounds = map.getBounds();
  const northWest = map.project(bounds.getNorthWest(), zoom).divideBy(TILE_SIZE).floor();
  const southEast = map.project(bounds.getSouthEast(), zoom).divideBy(TILE_SIZE).floor();
  const archiveNorthWest = backend.header.maxLat === undefined || backend.header.minLon === undefined
    ? new L.Point(0, 0)
    : map.project([backend.header.maxLat, backend.header.minLon], zoom).divideBy(TILE_SIZE).floor();
  const archiveSouthEast = backend.header.minLat === undefined || backend.header.maxLon === undefined
    ? new L.Point(2 ** zoom - 1, 2 ** zoom - 1)
    : map.project([backend.header.minLat, backend.header.maxLon], zoom).divideBy(TILE_SIZE).floor();
  const center = map.project(map.getCenter(), zoom).divideBy(TILE_SIZE).floor();
  const wanted = new Map();
  for (let x = Math.max(0, northWest.x, archiveNorthWest.x, center.x - TILE_RADIUS);
    x <= Math.min(2 ** zoom - 1, southEast.x, archiveSouthEast.x, center.x + TILE_RADIUS); x++) {
    for (let y = Math.max(0, northWest.y, archiveNorthWest.y, center.y - TILE_RADIUS);
      y <= Math.min(2 ** zoom - 1, southEast.y, archiveSouthEast.y, center.y + TILE_RADIUS); y++) {
      wanted.set(`${zoom}/${x}/${y}`, { z: zoom, x, y });
    }
  }
  backend._wantedRasterTiles = new Set(wanted.keys());
  const coverage = new Map();
  const parentZoom = Math.max(backend.header.minZoom ?? 0, zoom - 2), factor = 2 ** (zoom - parentZoom);
  if (parentZoom < zoom) {
    for (const [key, coords] of wanted) {
      if (backend._rasterTiles.get(key)?.done) continue;
      const parent = { z: parentZoom, x: Math.floor(coords.x / factor), y: Math.floor(coords.y / factor) };
      coverage.set(`${parent.z}/${parent.x}/${parent.y}`, parent);
    }
  }
  const required = new Map([...coverage, ...wanted]);
  for (const [key, tile] of backend._rasterTiles) {
    if (!required.has(key) && !tile.done) releaseRasterTile(backend, tile);
  }
  for (const [key, coords] of required) {
    if (backend._rasterTiles.has(key)) continue;
    const tile = { coords, request: new AbortController(), done: false };
    backend._rasterTiles.set(key, tile);
  }
  pumpRasterTiles(backend);
  pruneRasterTiles(backend);
}

function pumpRasterTiles(backend) {
  const map = backend._map;
  if (!map) return;
  const center = map.project(map.getCenter(), 0).divideBy(TILE_SIZE);
  const pending = [...backend._rasterTiles.values()].filter(tile => !tile.started && !tile.request.signal.aborted);
  const distance = ({ coords }) => Math.hypot((coords.x + 0.5) / 2 ** coords.z - center.x,
    (coords.y + 0.5) / 2 ** coords.z - center.y);
  pending.sort((a, b) => a.coords.z - b.coords.z || distance(a) - distance(b));
  for (const tile of pending) {
    if (backend._loadingTiles >= 4) break;
    loadRasterTile(backend, tile);
  }
}

export function releaseRasterTiles(backend) {
  for (const tile of backend._rasterTiles.values()) releaseRasterTile(backend, tile);
  backend._rasterProgram?.pipelineCache.clear();
  backend._rasterProgram = null;
  if (backend._rasterGeometry) {
    for (const attribute of Object.values(backend._rasterGeometry.attributes)) {
      destroyTexture(backend, attribute.buffer);
    }
    backend._rasterGeometry = null;
  }
}

export function setRasterTerrain(backend, terrain) {
  if (backend._terrain3D === terrain) return;
  for (const tile of backend._rasterTiles.values()) {
    if(backend._terrain3D) removeRasterTile(backend._terrain3D, tile);
    if (tile.mesh) {
      tile.mesh.visible = true;
      setParent(tile.mesh, backend.root);
    }
  }
  backend._terrain3D = terrain || null;
  if (terrain) {
    for (const tile of backend._rasterTiles.values()) {
      if (tile.done) registerTerrainTile(backend, tile.coords, tile);
    }
  }
}

export function registerTerrainTile(backend, coords, tile) {
  if (backend._terrain3D && tile.done && !tile.request.signal.aborted &&
    backend._rasterTiles.get(`${coords.z}/${coords.x}/${coords.y}`) === tile) {
    addRasterTile(backend._terrain3D, backend, coords, tile)
      .catch(error => backend.fire('tileerror', { tile, coords, error }));
  }
}

export function setRasterOpacity(backend, opacity) {
  for (const tile of backend._rasterTiles.values()) {
    if (tile.mesh) tile.mesh.opacity = opacity;
    const terrainMesh = backend._terrain3D?._rasterTiles.get(tile);
    if (terrainMesh) terrainMesh.opacity = opacity;
  }
  update(backend);
}

export function setRasterZIndex(backend, zIndex) {
  for (const tile of backend._rasterTiles.values()) {
    if (tile.mesh) tile.mesh.renderOrder = zIndex;
    const terrainMesh = backend._terrain3D?._rasterTiles.get(tile);
    if (terrainMesh) terrainMesh.renderOrder = zIndex;
  }
  update(backend);
}

export function getRasterTileSize() {
  return new L.Point(TILE_SIZE, TILE_SIZE);
}

function loadRasterTile(backend, tile) {
  tile.started = true;
  const first = backend._loadingTiles === 0;
  backend._loadingTiles++;
  backend.fire('tileloadstart', { tile, coords: tile.coords });
  if (first) backend.fire('loading');
  return Promise.resolve(backend.ready).then(() => backend.options.archive.getZxy(
    tile.coords.z, tile.coords.x, tile.coords.y, tile.request.signal
  )).then(async result => {
    if (tile.request.signal.aborted) return;
    if (!result) throw new Error(`Tile ${tile.coords.z}/${tile.coords.x}/${tile.coords.y} is not in the offline archive`);
    try {
      tile.image = await createImageBitmap(new Blob([result.data]));
    } catch {
      throw new Error(`Unable to decode tile ${tile.coords.z}/${tile.coords.x}/${tile.coords.y}`);
    }
    if (tile.request.signal.aborted) {
      tile.image.close();
      tile.image = null;
      return;
    }
    createRasterMesh(backend, tile);
    tile.loadedAt = performance.now();
    tile.done = true;
    backend._rasterVersion = (backend._rasterVersion || 0) + 1;
    registerTerrainTile(backend, tile.coords, tile);
    backend.fire('tileload', { tile, coords: tile.coords });
    update(backend);
  }).catch(error => {
    if (tile.request.signal.aborted) return;
    tile.error = error.message;
    backend._rasterVersion = (backend._rasterVersion || 0) + 1;
    backend.fire('tileerror', { tile, coords: tile.coords, error });
    backend.fire('error', { error, coords: tile.coords });
  }).finally(() => {
    backend._loadingTiles--;
    if (backend._map) {
      pumpRasterTiles(backend);
      pruneRasterTiles(backend);
      if (!backend._loadingTiles) backend.fire('load');
      update(backend);
    }
  });
}

function createRasterMesh(backend, tile) {
  const device = backend.renderer.device;
  const texture = {
    device,
    texture: device.createTexture({
      size: [tile.image.width, tile.image.height],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    }),
    sampler: device.createSampler({ addressModeU: 'clamp-to-edge', addressModeV: 'clamp-to-edge',
      magFilter: 'linear', minFilter: 'linear' }),
    image: tile.image, format: 'rgba8unorm', srgb: false, uploaded: null,
  };
  if (!backend._rasterProgram) {
    backend._rasterProgram = createProgram(backend, {
      baseTexture: texture, unlit: true, alphaMode: 'BLEND',
    });
  }
  if (!backend._rasterGeometry) backend._rasterGeometry = createGeometry(device);
  const { coords } = tile;
  const crs = backend._map.options.crs;
  const origin = crs.project(backend.location);
  const metres = Math.cos(backend.location.lat * Math.PI / 180);
  const scale = crs.scale(coords.z);
  const corner = crs.transformation.untransform(new L.Point(coords.x * TILE_SIZE, coords.y * TILE_SIZE), scale);
  const opposite = crs.transformation.untransform(new L.Point((coords.x + 1) * TILE_SIZE, (coords.y + 1) * TILE_SIZE), scale);
  const sizeX = (opposite.x - corner.x) * metres;
  const sizeZ = -(opposite.y - corner.y) * metres;
  tile.texture = texture;
  tile.mesh = {
    position: [(corner.x - origin.x) * metres, 0, -(corner.y - origin.y) * metres],
    rotation: [0, 0, 0],
    scale: [sizeX, 1, sizeZ],
    worldMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    children: [], visible: true, device, geometry: backend._rasterGeometry,
    program: backend._rasterProgram, texture,
    opacity: backend.options.opacity, id: cityMapper.nextId++,
    renderOrder: backend.options.zIndex || 0, tile, fadeDuration: 250, ground: true,
  };
  setParent(tile.mesh, backend.root);
}

function createGeometry(device) {
  const attributes = {
    position: { size: 3, data: new Float32Array([0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1]) },
    normal: { size: 3, data: new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]) },
    uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]) },
    index: { data: new Uint16Array([0, 2, 1, 1, 2, 3]) },
  };
  for (const [name, attribute] of Object.entries(attributes)) {
    attribute.count = attribute.data.length / (attribute.size || 1);
    attribute.indexFormat = 'uint16';
    attribute.buffer = device.createBuffer({
      size: attribute.data.byteLength,
      usage: name === 'index' ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
  }
  return { device, attributes, drawRange: { start: 0, count: attributes.index.count } };
}

function releaseRasterTile(backend, tile) {
  const key = `${tile.coords.z}/${tile.coords.x}/${tile.coords.y}`;
  if (backend._rasterTiles.get(key) !== tile) return;
  backend._rasterTiles.delete(key);
  backend._rasterVersion = (backend._rasterVersion || 0) + 1;
  tile.request.abort();
  if(backend._terrain3D) removeRasterTile(backend._terrain3D, tile);
  if (tile.mesh) setParent(tile.mesh, null);
  if (tile.texture) destroyTexture(backend, tile.texture.texture);
  tile.image?.close();
  backend.fire('tileunload', { tile, coords: tile.coords });
  update(backend);
}

export function pruneRasterTiles(backend) {
  const wanted = backend._wantedRasterTiles;
  const now = performance.now();
  if (backend._pruneVersion === backend._rasterVersion && backend._pruneWanted === wanted &&
    now < backend._pruneAfter) return Number.isFinite(backend._pruneAfter);
  backend._pruneVersion = backend._rasterVersion;
  backend._pruneWanted = wanted;
  backend._pruneAfter = Infinity;
  const pending = [...wanted].filter(key => {
    const tile = backend._rasterTiles.get(key);
    if (tile?.done && now - tile.loadedAt < 250) {
      backend._pruneAfter = Math.min(backend._pruneAfter, tile.loadedAt + 250);
    }
    return !tile?.done || now - tile.loadedAt < 250;
  }).map(key => {
    const [z, x, y] = key.split('/').map(Number);
    return { z, x, y };
  });
  for (const [key, tile] of backend._rasterTiles) {
    if (wanted.has(key)) continue;
    const overlaps = pending.some(coords => {
      const zoom = Math.min(coords.z, tile.coords.z);
      return Math.floor(coords.x / 2 ** (coords.z - zoom)) === Math.floor(tile.coords.x / 2 ** (tile.coords.z - zoom)) &&
        Math.floor(coords.y / 2 ** (coords.z - zoom)) === Math.floor(tile.coords.y / 2 ** (tile.coords.z - zoom));
    });
    if (!overlaps) releaseRasterTile(backend, tile);
  }
  return Number.isFinite(backend._pruneAfter);
}
